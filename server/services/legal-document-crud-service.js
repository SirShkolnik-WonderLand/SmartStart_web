/**
 * Comprehensive Legal Document CRUD Service
 * Handles complete lifecycle of legal documents with RBAC integration
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const ComprehensiveRBACLegalMapping = require('./comprehensive-rbac-legal-mapping');

class LegalDocumentCRUDService {
    constructor() {
        this.prisma = new PrismaClient();
        this.rbacMapping = new ComprehensiveRBACLegalMapping();
    }

    /**
     * CREATE - Create a new legal document
     */
    async createDocument(documentData, userId) {
        try {
            console.log('📄 Creating legal document:', documentData.title);

            // Validate user permissions
            console.log('🔍 Looking up user with ID:', userId);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, level: true, name: true, email: true }
            });

            if (!user) {
                console.log('🔍 User not found in database for userId:', userId);
                throw new Error('User not found');
            }

            console.log('🔍 User found:', { id: user.id, level: user.level, name: user.name });

            // Check if user has permission to create this document type
            const accessibleDocs = this.rbacMapping.getAccessibleDocumentsForLevel(user.level);
            console.log('🔍 Accessible documents for level', user.level, ':', accessibleDocs.map(doc => doc.title));
            console.log('🔍 Document title to create:', documentData.title);
            const canCreate = accessibleDocs.some(doc => doc.title === documentData.title);
            console.log('🔍 Can create document:', canCreate);

            if (!canCreate) {
                throw new Error(`User level ${user.level} cannot create document: ${documentData.title}`);
            }

            // Generate unique ID
            const id = `doc-${crypto.randomBytes(8).toString('hex')}`;

            // Create the document
            const document = await this.prisma.legalDocument.create({
                data: {
                    id: id,
                    title: documentData.title,
                    type: documentData.type,
                    content: documentData.content,
                    version: documentData.version || '1.0',
                    status: documentData.status || 'DRAFT',
                    requiresSignature: documentData.requiresSignature || false,
                    complianceRequired: documentData.complianceRequired || false,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    entityId: documentData.entityId,
                    projectId: documentData.projectId,
                    ventureId: documentData.ventureId,
                    generatedFrom: documentData.generatedFrom
                }
            });

            console.log('✅ Created document:', document.id);
            return document;

        } catch (error) {
            console.error('❌ Error creating document:', error);
            throw error;
        }
    }

    /**
     * READ - Get documents with RBAC filtering
     */
    async getDocuments(userId, filters = {}) {
        try {
            console.log('📖 Getting documents for user:', userId);

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { level: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Get accessible documents for user level
            const accessibleDocs = this.rbacMapping.getAccessibleDocumentsForLevel(user.level);
            const accessibleTitles = accessibleDocs.map(doc => doc.title);

            // Build query filters
            const whereClause = {
                status: filters.status || 'EFFECTIVE',
                ...(filters.type && { type: filters.type }),
                ...(filters.projectId && { projectId: filters.projectId }),
                ...(filters.ventureId && { ventureId: filters.ventureId })
            };

            // If user is not admin, filter by accessible documents
            if (user.level !== 'LEGAL_ADMIN') {
                whereClause.title = { in: accessibleTitles };
            }

            const documents = await this.prisma.legalDocument.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                include: {
                    signatures: {
                        include: {
                            signer: {
                                select: { name: true, email: true, level: true }
                            }
                        }
                    }
                }
            });

            // Get user's signatures
            const userSignatures = await this.prisma.legalDocumentSignature.findMany({
                where: { signerId: userId },
                select: { documentId: true, signedAt: true, signatureHash: true }
            });

            const signedDocumentIds = userSignatures.map(sig => sig.documentId);

            // Process documents with RBAC status
            const processedDocuments = documents.map(doc => {
                const isSigned = signedDocumentIds.includes(doc.id);
                const status = this.rbacMapping.getDocumentStatus(user.level, doc.title, isSigned, doc.status);
                const signature = userSignatures.find(sig => sig.documentId === doc.id);

                return {
                    ...doc,
                    status: status,
                    isSigned: isSigned,
                    signedAt: signature ? signature.signedAt : null,
                    signatureHash: signature ? signature.signatureHash : null,
                    required: status === 'REQUIRED',
                    pending: status === 'PENDING'
                };
            });

            console.log('✅ Retrieved', processedDocuments.length, 'documents');
            return processedDocuments;

        } catch (error) {
            console.error('❌ Error getting documents:', error);
            throw error;
        }
    }

    /**
     * UPDATE - Update an existing document
     */
    async updateDocument(documentId, updateData, userId) {
        try {
            console.log('📝 Updating document:', documentId);

            // Check if document exists
            const existingDoc = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });

            if (!existingDoc) {
                throw new Error('Document not found');
            }

            // Check user permissions
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { level: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Only allow updates if user is admin or created the document
            if (user.level !== 'LEGAL_ADMIN' && existingDoc.createdBy !== userId) {
                throw new Error('Insufficient permissions to update document');
            }

            // Update the document
            const updatedDocument = await this.prisma.legalDocument.update({
                where: { id: documentId },
                data: {
                    ...updateData,
                    updatedAt: new Date()
                }
            });

            console.log('✅ Updated document:', documentId);
            return updatedDocument;

        } catch (error) {
            console.error('❌ Error updating document:', error);
            throw error;
        }
    }

    /**
     * DELETE - Delete a document (soft delete by changing status)
     */
    async deleteDocument(documentId, userId) {
        try {
            console.log('🗑️ Deleting document:', documentId);

            // Check if document exists
            const existingDoc = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });

            if (!existingDoc) {
                throw new Error('Document not found');
            }

            // Check user permissions
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { level: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Only allow deletion if user is admin or created the document
            if (user.level !== 'LEGAL_ADMIN' && existingDoc.createdBy !== userId) {
                throw new Error('Insufficient permissions to delete document');
            }

            // Soft delete by changing status
            const deletedDocument = await this.prisma.legalDocument.update({
                where: { id: documentId },
                data: {
                    status: 'TERMINATED',
                    updatedAt: new Date()
                }
            });

            console.log('✅ Deleted document:', documentId);
            return deletedDocument;

        } catch (error) {
            console.error('❌ Error deleting document:', error);
            throw error;
        }
    }

    /**
     * SIGN - Sign a document
     */
    async signDocument(documentId, userId, signatureData) {
        try {
            console.log('✍️ Signing document:', documentId, 'by user:', userId);

            // Check if document exists
            const document = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });

            if (!document) {
                throw new Error('Document not found');
            }

            // Check if user has already signed
            const existingSignature = await this.prisma.legalDocumentSignature.findFirst({
                where: {
                    documentId: documentId,
                    signerId: userId
                }
            });

            if (existingSignature) {
                throw new Error('Document already signed by this user');
            }

            // Check user permissions
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { level: true, name: true, email: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Check if user can sign this document
            const accessibleDocs = this.rbacMapping.getAccessibleDocumentsForLevel(user.level);
            const canSign = accessibleDocs.some(doc => doc.title === document.title);

            if (!canSign) {
                throw new Error(`User level ${user.level} cannot sign document: ${document.title}`);
            }

            // Generate signature hash
            const signatureHash = crypto.createHash('sha256')
                .update(`${documentId}-${userId}-${Date.now()}-${JSON.stringify(signatureData)}`)
                .digest('hex');

            // Create signature
            const signature = await this.prisma.legalDocumentSignature.create({
                data: {
                    documentId: documentId,
                    signerId: userId,
                    signatureHash: signatureHash,
                    signedAt: new Date(),
                    ipAddress: signatureData.ipAddress,
                    userAgent: signatureData.userAgent,
                    termsAccepted: signatureData.termsAccepted || false,
                    privacyAccepted: signatureData.privacyAccepted || false,
                    identityVerified: signatureData.identityVerified || false
                }
            });

            // Update document status if required
            if (document.requiresSignature) {
                await this.prisma.legalDocument.update({
                    where: { id: documentId },
                    data: {
                        status: 'EFFECTIVE',
                        updatedAt: new Date()
                    }
                });
            }

            console.log('✅ Document signed:', documentId);
            return signature;

        } catch (error) {
            console.error('❌ Error signing document:', error);
            throw error;
        }
    }

    /**
     * GENERATE - Generate document from template
     */
    async generateDocumentFromTemplate(templateKey, variables, userId) {
        try {
            console.log('🔧 Generating document from template:', templateKey);

            // Get generation requirements
            const requirements = this.rbacMapping.getDocumentGenerationRequirements(templateKey);

            if (!requirements.template) {
                throw new Error(`Template not found: ${templateKey}`);
            }

            // Validate required fields
            const missingFields = requirements.requiredFields.filter(field => !variables[field]);
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Read template file
            const templatePath = path.join(process.cwd(), 'server/Contracts/templates', requirements.template);
            let templateContent;

            try {
                templateContent = await fs.readFile(templatePath, 'utf8');
            } catch (error) {
                // Try alternative path
                const altPath = path.join(process.cwd(), 'server/Contracts/08-templates', requirements.template);
                templateContent = await fs.readFile(altPath, 'utf8');
            }

            // Replace variables in template
            let generatedContent = templateContent;
            for (const [key, value] of Object.entries(variables)) {
                const placeholder = `{{${key}}}`;
                generatedContent = generatedContent.replace(new RegExp(placeholder, 'g'), value);
            }

            // Get document info from mapping
            const accessibleDocs = this.rbacMapping.getAccessibleDocumentsForLevel('LEGAL_ADMIN');
            const docInfo = accessibleDocs.find(doc => doc.key === templateKey);

            if (!docInfo) {
                throw new Error(`Document info not found for template: ${templateKey}`);
            }

            // Create the generated document
            const documentData = {
                title: docInfo.title,
                type: docInfo.type,
                content: generatedContent,
                version: '1.0',
                status: 'DRAFT',
                requiresSignature: docInfo.isRequired,
                complianceRequired: docInfo.isRequired,
                generatedFrom: templateKey
            };

            const document = await this.createDocument(documentData, userId);

            console.log('✅ Generated document:', document.id);
            return document;

        } catch (error) {
            console.error('❌ Error generating document:', error);
            throw error;
        }
    }

    /**
     * GET USER DOCUMENT STATUS - Get comprehensive status for user
     */
    async getUserDocumentStatus(userId) {
        try {
            console.log('📊 Getting user document status:', userId);

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { level: true, name: true, email: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Get all accessible documents
            const accessibleDocs = this.rbacMapping.getAccessibleDocumentsForLevel(user.level);
            const requiredDocs = this.rbacMapping.getRequiredDocumentsForLevel(user.level);
            const pendingDocs = this.rbacMapping.getPendingDocumentsForNextLevel(user.level);

            // Get user's signatures
            const userSignatures = await this.prisma.legalDocumentSignature.findMany({
                where: { signerId: userId },
                include: {
                    document: {
                        select: { title: true, type: true }
                    }
                }
            });

            const signedDocumentTitles = userSignatures.map(sig => sig.document.title);

            // Calculate status
            const totalDocuments = accessibleDocs.length;
            const requiredCount = requiredDocs.length;
            const signedCount = requiredDocs.filter(doc => signedDocumentTitles.includes(doc.title)).length;
            const pendingCount = pendingDocs.length;
            const compliancePercentage = requiredCount === 0 ? 100 : Math.round((signedCount / requiredCount) * 100);

            // Get next level info
            const nextLevel = this.rbacMapping.getNextLevel(user.level);
            const canAdvance = this.rbacMapping.canAdvanceToNextLevel(user.level, signedDocumentTitles);

            return {
                user: {
                    id: userId,
                    name: user.name,
                    email: user.email,
                    level: user.level
                },
                summary: {
                    total_documents: totalDocuments,
                    required_documents: requiredCount,
                    signed_documents: signedCount,
                    pending_documents: pendingCount,
                    compliance_percentage: compliancePercentage
                },
                nextLevel: {
                    level: nextLevel,
                    canAdvance: canAdvance,
                    pendingDocuments: pendingDocs.map(doc => doc.title)
                },
                documents: accessibleDocs.map(doc => {
                    const isSigned = signedDocumentTitles.includes(doc.title);
                    const status = this.rbacMapping.getDocumentStatus(user.level, doc.title, isSigned);
                    const signature = userSignatures.find(sig => sig.document.title === doc.title);

                    return {
                        key: doc.key,
                        title: doc.title,
                        type: doc.type,
                        status: status,
                        isSigned: isSigned,
                        signedAt: signature ? signature.signedAt : null,
                        signatureHash: signature ? signature.signatureHash : null,
                        required: status === 'REQUIRED',
                        pending: status === 'PENDING',
                        description: doc.description
                    };
                })
            };

        } catch (error) {
            console.error('❌ Error getting user document status:', error);
            throw error;
        }
    }

    /**
     * VERIFY SIGNATURE - Verify document signature
     */
    async verifySignature(documentId, signatureHash) {
        try {
            console.log('🔍 Verifying signature:', signatureHash);

            const signature = await this.prisma.legalDocumentSignature.findFirst({
                where: {
                    documentId: documentId,
                    signatureHash: signatureHash
                },
                include: {
                    document: {
                        select: { title: true, type: true }
                    },
                    signer: {
                        select: { name: true, email: true, level: true }
                    }
                }
            });

            if (!signature) {
                return {
                    is_valid: false,
                    document_id: documentId,
                    signature_hash: signatureHash,
                    error: 'Signature not found'
                };
            }

            return {
                is_valid: true,
                document_id: documentId,
                signature_hash: signatureHash,
                signed_at: signature.signedAt,
                signer: signature.signer.name,
                signer_email: signature.signer.email,
                signer_level: signature.signer.level,
                document_title: signature.document.title,
                verification_details: {
                    ip_address: signature.ipAddress,
                    user_agent: signature.userAgent,
                    terms_accepted: signature.termsAccepted,
                    privacy_accepted: signature.privacyAccepted,
                    identity_verified: signature.identityVerified
                }
            };

        } catch (error) {
            console.error('❌ Error verifying signature:', error);
            throw error;
        }
    }

    /**
     * GET AUDIT LOG - Get document audit log
     */
    async getAuditLog(documentId, startDate, endDate, page = 1, limit = 50) {
        try {
            console.log('📋 Getting audit log for document:', documentId);

            const whereClause = {
                documentId: documentId,
                ...(startDate && { createdAt: { gte: new Date(startDate) } }),
                ...(endDate && { createdAt: { lte: new Date(endDate) } })
            };

            const [auditLogs, total] = await Promise.all([
                this.prisma.legalDocumentSignature.findMany({
                    where: whereClause,
                    include: {
                        signer: {
                            select: { name: true, email: true }
                        }
                    },
                    orderBy: { signedAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                this.prisma.legalDocumentSignature.count({
                    where: whereClause
                })
            ]);

            return {
                audit_logs: auditLogs.map(log => ({
                    id: log.id,
                    document_id: log.documentId,
                    user_id: log.signerId,
                    action: 'SIGNED',
                    details: {
                        signature_hash: log.signatureHash,
                        terms_accepted: log.termsAccepted,
                        privacy_accepted: log.privacyAccepted,
                        identity_verified: log.identityVerified
                    },
                    ip_address: log.ipAddress,
                    user_agent: log.userAgent,
                    created_at: log.signedAt,
                    signer_name: log.signer.name,
                    signer_email: log.signer.email
                })),
                pagination: {
                    page: page,
                    limit: limit,
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('❌ Error getting audit log:', error);
            throw error;
        }
    }

    /**
     * GENERATE COMPLIANCE REPORT - Generate compliance report
     */
    async generateComplianceReport(startDate, endDate, userId) {
        try {
            console.log('📊 Generating compliance report');

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { level: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Get all users and their document status
            const users = await this.prisma.user.findMany({
                select: { id: true, name: true, email: true, level: true }
            });

            const report = {
                period: {
                    start_date: startDate,
                    end_date: endDate
                },
                generated_at: new Date().toISOString(),
                total_users: users.length,
                compliance_summary: {},
                user_compliance: []
            };

            // Calculate compliance for each user
            for (const user of users) {
                const userStatus = await this.getUserDocumentStatus(user.id);
                report.user_compliance.push({
                    user_id: user.id,
                    name: user.name,
                    email: user.email,
                    level: user.level,
                    compliance_percentage: userStatus.summary.compliance_percentage,
                    required_documents: userStatus.summary.required_documents,
                    signed_documents: userStatus.summary.signed_documents,
                    missing_documents: userStatus.documents
                        .filter(doc => doc.status === 'REQUIRED')
                        .map(doc => doc.title)
                });

                // Update summary by level
                if (!report.compliance_summary[user.level]) {
                    report.compliance_summary[user.level] = {
                        total_users: 0,
                        compliant_users: 0,
                        average_compliance: 0
                    };
                }

                report.compliance_summary[user.level].total_users++;
                if (userStatus.summary.compliance_percentage === 100) {
                    report.compliance_summary[user.level].compliant_users++;
                }
            }

            // Calculate averages
            for (const level in report.compliance_summary) {
                const levelUsers = report.user_compliance.filter(u => u.level === level);
                const totalCompliance = levelUsers.reduce((sum, u) => sum + u.compliance_percentage, 0);
                report.compliance_summary[level].average_compliance =
                    levelUsers.length > 0 ? Math.round(totalCompliance / levelUsers.length) : 0;
            }

            return report;

        } catch (error) {
            console.error('❌ Error generating compliance report:', error);
            throw error;
        }
    }

    /**
     * Cleanup - Close Prisma connection
     */
    async cleanup() {
        await this.prisma.$disconnect();
    }
}

module.exports = LegalDocumentCRUDService;