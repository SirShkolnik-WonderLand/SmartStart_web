const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class LegalDocumentService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    // Get available documents for user based on RBAC level
    async getAvailableDocuments(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Note: RBAC filtering can be added here if needed

            const documents = await this.prisma.legalDocument.findMany({
                where: {
                    status: {
                        not: 'TERMINATED'
                    }
                },
                orderBy: [
                    { type: 'asc' },
                    { title: 'asc' }
                ]
            });

            // Get user's signatures for these documents
            const signatures = await this.prisma.legalDocumentSignature.findMany({
                where: { 
                    signerId: userId,
                    documentId: {
                        in: documents.map(doc => doc.id)
                    }
                }
            });

            const signatureMap = new Map();
            signatures.forEach(sig => {
                signatureMap.set(sig.documentId, sig);
            });

            // Add signature information to documents
            return documents.map(doc => ({
                ...doc,
                isSigned: signatureMap.has(doc.id),
                signedAt: signatureMap.get(doc.id)?.signedAt,
                signatureHash: signatureMap.get(doc.id)?.signatureHash
            }));
        } catch (error) {
            console.error('Error getting available documents:', error);
            throw error;
        }
    }

    // Get required documents for current level
    async getRequiredDocuments(userId) {
        try {
            const documents = await this.getAvailableDocuments(userId);
            return documents.filter(doc => 
                doc.is_required && 
                (!doc.userStatus || doc.userStatus.status === 'required')
            );
        } catch (error) {
            console.error('Error getting required documents:', error);
            throw error;
        }
    }

    // Get pending documents for next level
    async getPendingDocuments(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            const currentLevel = this.mapRoleToRbacLevel(user.role);
            const nextLevel = this.getNextRbacLevel(currentLevel);

            if (!nextLevel) {
                return [];
            }

            const nextLevelDocuments = await this.prisma.legalDocument.findMany({
                where: {
                    rbac_level: nextLevel,
                    is_active: true
                }
            });

            return nextLevelDocuments;
        } catch (error) {
            console.error('Error getting pending documents:', error);
            throw error;
        }
    }

    // Get specific document
    async getDocument(documentId) {
        try {
            const document = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });

            if (!document) {
                throw new Error('Document not found');
            }

            return document;
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    }

    // Sign a document
    async signDocument(userId, documentId, signatureData) {
        try {
            const document = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });

            if (!document) {
                throw new Error('Document not found');
            }

            // Generate document hash
            const documentContent = document.content || await this.getDocumentContent(document.template_path);
            const documentHash = this.generateDocumentHash(documentContent);

            // Create signature record
            const signature = await this.prisma.documentSignature.create({
                data: {
                    user_id: userId,
                    document_id: documentId,
                    document_version: document.version,
                    signature_method: signatureData.method || 'click',
                    signature_data: signatureData,
                    document_hash: documentHash,
                    timestamp: new Date(),
                    ip_address: signatureData.ip_address,
                    user_agent: signatureData.user_agent,
                    location_data: signatureData.location,
                    mfa_verified: signatureData.mfa_verified || false
                }
            });

            // Update user document status
            await this.prisma.userDocumentStatus.upsert({
                where: {
                    unique_user_document: {
                        user_id: userId,
                        document_id: documentId
                    }
                },
                update: {
                    status: 'signed',
                    signed_at: new Date(),
                    signature_hash: documentHash,
                    signature_evidence: signatureData
                },
                create: {
                    user_id: userId,
                    document_id: documentId,
                    status: 'signed',
                    signed_at: new Date(),
                    signature_hash: documentHash,
                    signature_evidence: signatureData
                }
            });

            // Log audit trail
            await this.logDocumentAction(userId, documentId, 'sign', signatureData);

            return signature;
        } catch (error) {
            console.error('Error signing document:', error);
            throw error;
        }
    }

    // Get user document status
    async getUserDocumentStatus(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            const documents = await this.getAvailableDocuments(userId);

            const summary = {
                total_documents: documents.length,
                signed_documents: documents.filter(doc => doc.isSigned).length,
                required_documents: documents.filter(doc => doc.requiresSignature).length,
                pending_documents: documents.filter(doc => doc.requiresSignature && !doc.isSigned).length,
                expired_documents: 0 // Can be calculated based on expiryDate if needed
            };

            return {
                user_id: userId,
                role: user.role,
                summary: summary,
                documents: documents.map(doc => ({
                    document_id: doc.id,
                    title: doc.title,
                    type: doc.type,
                    status: doc.isSigned ? 'signed' : (doc.requiresSignature ? 'pending' : 'not_required'),
                    signed_at: doc.signedAt,
                    requires_signature: doc.requiresSignature,
                    document_version: doc.version,
                    signature_hash: doc.signatureHash
                }))
            };
        } catch (error) {
            console.error('Error getting user document status:', error);
            throw error;
        }
    }

    // Verify document signature
    async verifyDocumentSignature(documentId, signatureHash) {
        try {
            const signature = await this.prisma.documentSignature.findFirst({
                where: {
                    document_id: documentId,
                    document_hash: signatureHash
                },
                orderBy: { timestamp: 'desc' }
            });

            if (!signature) {
                return {
                    is_valid: false,
                    message: 'Signature not found'
                };
            }

            const document = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });

            if (!document) {
                return {
                    is_valid: false,
                    message: 'Document not found'
                };
            }

            // Verify hash
            const documentContent = document.content || await this.getDocumentContent(document.template_path);
            const expectedHash = this.generateDocumentHash(documentContent);
            const isValid = signature.document_hash === expectedHash;

            return {
                is_valid: isValid,
                verified_at: new Date().toISOString(),
                document_version: signature.document_version,
                signature_details: {
                    signed_at: signature.timestamp,
                    signature_method: signature.signature_method,
                    mfa_verified: signature.mfa_verified
                }
            };
        } catch (error) {
            console.error('Error verifying document signature:', error);
            throw error;
        }
    }

    // Generate document hash
    generateDocumentHash(content) {
        const canonicalized = this.canonicalizeDocument(content);
        return crypto.createHash('sha256').update(canonicalized).digest('hex');
    }

    // Canonicalize document for consistent hashing
    canonicalizeDocument(content) {
        return content
            .replace(/\r\n/g, '\n')  // Normalize line endings
            .replace(/\r/g, '\n')    // Normalize line endings
            .split('\n')
            .map(line => line.trimEnd())  // Trim trailing spaces
            .join('\n')
            .replace(/\n\s*\n\s*\n/g, '\n\n')  // Collapse multiple blank lines
            .replace(/[^\x20-\x7E\n]/g, '');   // Remove non-printable characters
    }

    // Get document content from file
    async getDocumentContent(templatePath) {
        try {
            if (!templatePath) {
                return '';
            }
            return await fs.readFile(templatePath, 'utf8');
        } catch (error) {
            console.error('Error reading document template:', error);
            return '';
        }
    }

    // Log document action for audit trail
    async logDocumentAction(userId, documentId, action, metadata) {
        try {
            await this.prisma.documentAuditLog.create({
                data: {
                    user_id: userId,
                    document_id: documentId,
                    action: action,
                    timestamp: new Date(),
                    ip_address: metadata.ip_address,
                    user_agent: metadata.user_agent,
                    metadata: metadata
                }
            });
        } catch (error) {
            console.error('Error logging document action:', error);
        }
    }

    // Map role to RBAC level
    mapRoleToRbacLevel(role) {
        const roleMap = {
            'GUEST': 'GUEST',
            'MEMBER': 'MEMBER',
            'SUBSCRIBER': 'SUBSCRIBER',
            'SEAT_HOLDER': 'SEAT_HOLDER',
            'VENTURE_OWNER': 'VENTURE_OWNER',
            'VENTURE_PARTICIPANT': 'VENTURE_PARTICIPANT',
            'CONFIDENTIAL_ACCESS': 'CONFIDENTIAL_ACCESS',
            'RESTRICTED_ACCESS': 'RESTRICTED_ACCESS',
            'HIGHLY_RESTRICTED_ACCESS': 'HIGHLY_RESTRICTED_ACCESS',
            'BILLING_ADMIN': 'BILLING_ADMIN',
            'SECURITY_ADMIN': 'SECURITY_ADMIN',
            'LEGAL_ADMIN': 'LEGAL_ADMIN'
        };
        return roleMap[role] || 'GUEST';
    }

    // Get next RBAC level
    getNextRbacLevel(currentLevel) {
        const levels = ['GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    }

    // Get document audit log
    async getDocumentAuditLog(userId, documentId, startDate, endDate, page = 1, limit = 50) {
        try {
            const where = {
                user_id: userId
            };

            if (documentId) {
                where.document_id = documentId;
            }

            if (startDate && endDate) {
                where.timestamp = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }

            const [logs, total] = await Promise.all([
                this.prisma.documentAuditLog.findMany({
                    where,
                    orderBy: { timestamp: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                this.prisma.documentAuditLog.count({ where })
            ]);

            return {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting document audit log:', error);
            throw error;
        }
    }

    // Generate compliance report
    async generateComplianceReport(userId, startDate, endDate) {
        try {
            const userStatus = await this.getUserDocumentStatus(userId);
            const auditLogs = await this.getDocumentAuditLog(userId, null, startDate, endDate, 1, 1000);

            return {
                report_id: `report-${Date.now()}`,
                user_id: userId,
                period: {
                    start_date: startDate,
                    end_date: endDate
                },
                generated_at: new Date().toISOString(),
                summary: userStatus.summary,
                details: {
                    document_signings: auditLogs.logs.filter(log => log.action === 'sign'),
                    access_logs: auditLogs.logs.filter(log => log.action === 'view')
                }
            };
        } catch (error) {
            console.error('Error generating compliance report:', error);
            throw error;
        }
    }
}

module.exports = LegalDocumentService;
