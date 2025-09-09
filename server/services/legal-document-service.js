const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const LegalFrameworkService = require('./legal-framework');

class LegalDocumentService {
    constructor() {
        this.prisma = new PrismaClient();
        this.legalFramework = new LegalFrameworkService();
        this.documents = new Map(); // Cache for performance
        this.signatures = new Map(); // Cache for sessions
        this.loadLegalDocuments();
    }

    /**
     * Load legal documents from the docs folder
     */
    async loadLegalDocuments() {
        try {
            const legalDocsPath = path.join(__dirname, '../../docs/08-legal');
            const corePlatformPath = path.join(legalDocsPath, '01-core-platform');

            // Load core platform documents
            const documents = [{
                    id: 'PPA',
                    name: 'Platform Participation Agreement',
                    file: 'platform-participation-agreement.md',
                    required: true,
                    order: 1,
                    description: 'Core platform terms and conditions'
                },
                {
                    id: 'ESCA',
                    name: 'Electronic Signature & Consent Agreement',
                    file: 'electronic-signature-consent.md',
                    required: true,
                    order: 2,
                    description: 'Legal recognition of e-signatures'
                },
                {
                    id: 'PNA',
                    name: 'Privacy Notice & Acknowledgment',
                    file: 'privacy-notice-acknowledgment.md',
                    required: true,
                    order: 3,
                    description: 'Canadian privacy compliance (PIPEDA/CASL)'
                },
                {
                    id: 'MNDA',
                    name: 'Mutual Non-Disclosure Agreement',
                    file: 'mutual-non-disclosure-agreement.md',
                    required: true,
                    order: 4,
                    description: 'Confidentiality and non-exfiltration'
                }
            ];

            for (const doc of documents) {
                try {
                    const filePath = path.join(corePlatformPath, doc.file);
                    const content = await fs.readFile(filePath, 'utf8');

                    this.documents.set(doc.id, {
                        ...doc,
                        content: content,
                        version: '2.0',
                        lastUpdated: new Date().toISOString()
                    });
                } catch (error) {
                    console.warn(`Could not load legal document ${doc.id}:`, error.message);
                }
            }

            console.log(`✅ Loaded ${this.documents.size} legal documents`);
        } catch (error) {
            console.error('Error loading legal documents:', error);
        }
    }

    /**
     * Get all available legal documents
     */
    getDocuments() {
        return Array.from(this.documents.values()).sort((a, b) => a.order - b.order);
    }

    /**
     * Map database user level to RBAC level for legal framework compatibility
     */
    mapUserLevelToRbacLevel(userLevel) {
        const levelMapping = {
            'OWLET': 'GUEST',
            'NIGHT_WATCHER': 'MEMBER', 
            'WISE_OWL': 'SUBSCRIBER',
            'SKY_MASTER': 'SEAT_HOLDER'
        };
        return levelMapping[userLevel] || 'GUEST';
    }

    /**
     * Get available documents for user (API compatibility with existing legal framework)
     */
    async getAvailableDocuments(userId) {
        try {
            // Get user's current RBAC level from database
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { level: true }
            });
            
            const userLevel = user?.level || 'OWLET';
            const rbacLevel = this.mapUserLevelToRbacLevel(userLevel);
            
            // Get documents from database
            const documents = await this.prisma.legalDocument.findMany({
                where: {
                    status: { in: ['DRAFT', 'EFFECTIVE'] }
                },
                orderBy: { createdAt: 'asc' }
            });

            // Get user signatures from database
            const userSignatures = await this.prisma.legalDocumentSignature.findMany({
                where: { signerId: userId },
                select: { documentId: true, signedAt: true }
            });

            const signedDocumentIds = userSignatures.map(sig => sig.documentId);

            // Filter documents based on RBAC level using existing legal framework
            const rbacRequirements = this.legalFramework.rbacDocumentRequirements[rbacLevel] || [];
            const allRequiredDocs = [];
            
            // Get all documents for current level and below
            for (const [level, config] of Object.entries(this.legalFramework.rbacDocumentRequirements)) {
                if (this.getLevelNumber(level) <= this.getLevelNumber(rbacLevel)) {
                    allRequiredDocs.push(...config);
                }
            }

            return documents.map(doc => {
                const docKey = this.getDocumentKey(doc);
                const isRequired = allRequiredDocs.includes(docKey);
                const isSigned = signedDocumentIds.includes(doc.id);
                
                let status = 'NOT_REQUIRED';
                if (isRequired && isSigned) {
                    status = 'SIGNED';
                } else if (isRequired && !isSigned) {
                    status = 'REQUIRED';
                } else if (!isRequired && isSigned) {
                    status = 'SIGNED';
                } else if (!isRequired && !isSigned) {
                    status = 'PENDING';
                }

                return {
                    id: doc.id,
                    name: doc.title,
                    title: doc.title,
                    type: doc.type || 'TERMS_OF_SERVICE',
                    content: doc.content,
                    version: doc.version || '1.0',
                    status: status,
                    effectiveDate: doc.createdAt,
                    requiresSignature: doc.requiresSignature,
                    complianceRequired: doc.complianceRequired,
                    createdBy: doc.createdBy,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                    description: doc.description || '',
                    order: 1,
                    isSigned: isSigned,
                    signedAt: userSignatures.find(sig => sig.documentId === doc.id)?.signedAt,
                    signatureHash: userSignatures.find(sig => sig.documentId === doc.id)?.signatureHash,
                    signerName: userSignatures.find(sig => sig.documentId === doc.id)?.signerName,
                    signerEmail: userSignatures.find(sig => sig.documentId === doc.id)?.signerEmail,
                    signerLevel: userSignatures.find(sig => sig.documentId === doc.id)?.signerLevel,
                    ipAddress: userSignatures.find(sig => sig.documentId === doc.id)?.ipAddress,
                    userAgent: userSignatures.find(sig => sig.documentId === doc.id)?.userAgent
                };
            });
        } catch (error) {
            console.error('Error getting available documents:', error);
            throw error;
        }
    }

    /**
     * Get required documents for current level (API compatibility with existing legal framework)
     */
    async getRequiredDocuments(userId) {
        try {
            const allDocs = await this.getAvailableDocuments(userId);
            return allDocs.filter(doc => doc.status === 'REQUIRED');
        } catch (error) {
            console.error('Error getting required documents:', error);
            throw error;
        }
    }

    /**
     * Get pending documents for next level (API compatibility with existing legal framework)
     */
    async getPendingDocuments(userId) {
        try {
            const allDocs = await this.getAvailableDocuments(userId);
            return allDocs.filter(doc => doc.status === 'PENDING');
        } catch (error) {
            console.error('Error getting pending documents:', error);
            throw error;
        }
    }

    /**
     * Get a specific legal document
     */
    async getDocument(documentId) {
        try {
            const document = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });
            
            if (!document) {
                return null;
            }
            
            return {
                id: document.id,
                name: document.title,
                title: document.title,
                type: document.type,
                content: document.content,
                version: document.version || '1.0',
                status: document.status,
                requiresSignature: document.requiresSignature,
                complianceRequired: document.complianceRequired,
                createdBy: document.createdBy,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                description: document.description || ''
            };
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    }

    /**
     * Get user document status (API compatibility)
     */
    async getUserDocumentStatus(userId) {
        try {
            const documents = this.getDocuments();
            const userSignatures = this.getUserSignatures(userId);
            const signedDocumentIds = userSignatures.map(sig => sig.documentId);

            const requiredDocs = documents.filter(doc => doc.required);
            const signedRequired = requiredDocs.filter(doc => signedDocumentIds.includes(doc.id));

            return {
                user_id: userId,
                role: 'MEMBER', // Default role
                summary: {
                    total_documents: documents.length,
                    required_documents: requiredDocs.length,
                    signed_documents: userSignatures.length,
                    pending_documents: documents.length - userSignatures.length,
                    expired_documents: 0
                },
                documents: documents.map(doc => ({
                    document_id: doc.id,
                    title: doc.name,
                    type: doc.type || 'TERMS_OF_SERVICE',
                    status: signedDocumentIds.includes(doc.id) ? 'SIGNED' : 'PENDING',
                    signed_at: userSignatures.find(sig => sig.documentId === doc.id)?.signedAt,
                    requires_signature: doc.required,
                    document_version: doc.version,
                    signature_hash: userSignatures.find(sig => sig.documentId === doc.id)?.documentHash
                }))
            };
        } catch (error) {
            console.error('Error getting user document status:', error);
            throw error;
        }
    }

    /**
     * Sign a document (API compatibility)
     */
    async signDocument(userId, documentId, signatureData) {
        try {
            console.log('🔍 signDocument called with:', { userId, documentId, signatureData });
            
            // Check if document exists
            const document = await this.prisma.legalDocument.findUnique({
                where: { id: documentId }
            });
            
            console.log('🔍 Document found:', document ? 'YES' : 'NO', document?.title);
            
            if (!document) {
                throw new Error(`Document not found: ${documentId}`);
            }
            
            // Check if already signed
            const existingSignature = await this.prisma.legalDocumentSignature.findFirst({
                where: {
                    documentId: documentId,
                    signerId: userId
                }
            });
            
            if (existingSignature) {
                throw new Error('Document already signed');
            }
            
            // Generate signature hash
            const signatureHash = crypto.createHash('sha256')
                .update(document.content + userId + new Date().toISOString())
                .digest('hex');
            
            // Save signature to database
            const signature = await this.prisma.legalDocumentSignature.create({
                data: {
                    documentId: documentId,
                    signerId: userId,
                    signatureHash: signatureHash,
                    signedAt: new Date(),
                    ipAddress: signatureData.ip_address || 'unknown',
                    userAgent: signatureData.user_agent || 'unknown',
                    termsAccepted: true,
                    privacyAccepted: true,
                    identityVerified: signatureData.mfa_verified || false
                }
            });
            
            return {
                id: signature.id,
                documentId: documentId,
                signerId: userId,
                signatureHash: signatureHash,
                signedAt: signature.signedAt.toISOString(),
                ipAddress: signature.ipAddress,
                userAgent: signature.userAgent,
                termsAccepted: signature.termsAccepted,
                privacyAccepted: signature.privacyAccepted,
                identityVerified: signature.identityVerified
            };
        } catch (error) {
            console.error('Error signing document:', error);
            throw error;
        }
    }

    /**
     * Verify document signature (API compatibility)
     */
    async verifyDocumentSignature(documentId, signatureHash) {
        try {
            // Find the signature in all sessions
            for (const [sessionId, session] of this.signatures.entries()) {
                if (session.signatures[documentId] && session.signatures[documentId].documentHash === signatureHash) {
                    const signature = session.signatures[documentId];
                    return {
                        is_valid: true,
                        document_id: documentId,
                        signature_hash: signatureHash,
                        signed_at: signature.signedAt.toISOString(),
                        signer: session.userId,
                        verification_details: {
                            sessionId: sessionId,
                            version: signature.version,
                            ipAddress: signature.signatureData.ipAddress,
                            userAgent: signature.signatureData.userAgent
                        }
                    };
                }
            }
            
            return {
                is_valid: false,
                document_id: documentId,
                signature_hash: signatureHash,
                signed_at: null,
                signer: null,
                verification_details: { error: 'Signature not found' }
            };
        } catch (error) {
            console.error('Error verifying document signature:', error);
            throw error;
        }
    }

    /**
     * Log document action (API compatibility)
     */
    async logDocumentAction(userId, documentId, action, details) {
        try {
            // In a real implementation, this would log to a database
            console.log(`Document action logged: User ${userId} performed ${action} on document ${documentId}`, details);
            return { success: true };
        } catch (error) {
            console.error('Error logging document action:', error);
            throw error;
        }
    }

    /**
     * Get document audit log (API compatibility)
     */
    async getDocumentAuditLog(userId, documentId, startDate, endDate, page, limit) {
        try {
            // In a real implementation, this would query a database
            const logs = [];
            const total = 0;
            
            return {
                logs: logs,
                pagination: {
                    page: page,
                    limit: limit,
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting document audit log:', error);
            throw error;
        }
    }

    /**
     * Generate compliance report (API compatibility)
     */
    async generateComplianceReport(userId, startDate, endDate) {
        try {
            const documents = this.getDocuments();
            const userSignatures = this.getUserSignatures(userId);
            const signedDocumentIds = userSignatures.map(sig => sig.documentId);
            
            const requiredDocs = documents.filter(doc => doc.required);
            const signedRequired = requiredDocs.filter(doc => signedDocumentIds.includes(doc.id));
            
            return {
                period: {
                    start_date: startDate,
                    end_date: endDate
                },
                total_documents: documents.length,
                signed_documents: userSignatures.length,
                compliance_percentage: requiredDocs.length > 0 ? (signedRequired.length / requiredDocs.length) * 100 : 100,
                missing_signatures: requiredDocs
                    .filter(doc => !signedDocumentIds.includes(doc.id))
                    .map(doc => doc.id),
                audit_trail: [],
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating compliance report:', error);
            throw error;
        }
    }

    /**
     * Generate a signing session
     */
    generateSigningSession(userId, documentIds = []) {
        const sessionId = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const session = {
            sessionId,
            userId,
            documentIds: documentIds.length > 0 ? documentIds : ['PPA', 'ESCA', 'PNA', 'MNDA'],
            status: 'PENDING',
            signatures: {},
            createdAt: new Date(),
            expiresAt
        };

        this.signatures.set(sessionId, session);
        return session;
    }

    /**
     * Sign a document in session
     */
    signDocumentInSession(sessionId, documentId, signatureData) {
        const session = this.signatures.get(sessionId);

        if (!session) {
            return { success: false, error: 'Invalid session' };
        }

        if (new Date() > session.expiresAt) {
            return { success: false, error: 'Session expired' };
        }

        if (!session.documentIds.includes(documentId)) {
            return { success: false, error: 'Document not in session' };
        }

        const document = this.documents.get(documentId);
        if (!document) {
            return { success: false, error: 'Document not found' };
        }

        // Create signature record
        const signature = {
            documentId,
            documentName: document.name,
            userId: session.userId,
            signedAt: new Date(),
            signatureData: {
                ...signatureData,
                ipAddress: signatureData.ipAddress || 'unknown',
                userAgent: signatureData.userAgent || 'unknown'
            },
            documentHash: this.generateDocumentHash(document.content),
            version: document.version
        };

        session.signatures[documentId] = signature;

        // Check if all documents are signed
        const allSigned = session.documentIds.every(id => session.signatures[id]);
        if (allSigned) {
            session.status = 'COMPLETED';
        }

        return { success: true, signature, allSigned };
    }

    /**
     * Get signing session status
     */
    getSigningSession(sessionId) {
        return this.signatures.get(sessionId);
    }

    /**
     * Get user's signed documents
     */
    async getUserSignatures(userId) {
        try {
            const signatures = await this.prisma.legalDocumentSignature.findMany({
                where: { signerId: userId },
                include: {
                    document: {
                        select: { title: true, version: true }
                    },
                    signer: {
                        select: { name: true, email: true, level: true }
                    }
                },
                orderBy: { signedAt: 'desc' }
            });

            return signatures.map(sig => ({
                sessionId: null, // Not using sessions anymore
                documentId: sig.documentId,
                documentName: sig.document.title,
                signedAt: sig.signedAt,
                version: sig.document.version || '1.0',
                signatureHash: sig.signatureHash,
                signerName: sig.signer?.name || 'Unknown',
                signerEmail: sig.signer?.email || 'Unknown',
                signerLevel: sig.signer?.level || 'Unknown',
                ipAddress: sig.ipAddress,
                userAgent: sig.userAgent
            }));
        } catch (error) {
            console.error('Error getting user signatures:', error);
            return [];
        }
    }

    /**
     * Check if user has signed all required documents
     */
    async hasSignedAllRequired(userId) {
        try {
            // Get all required documents
            const requiredDocs = await this.prisma.legalDocument.findMany({
                where: {
                    requiresSignature: true,
                    status: { in: ['DRAFT', 'EFFECTIVE'] }
                },
                select: { id: true }
            });

            // Get user signatures
            const userSignatures = await this.prisma.legalDocumentSignature.findMany({
                where: { signerId: userId },
                select: { documentId: true }
            });

            const signedDocumentIds = userSignatures.map(sig => sig.documentId);
            const requiredDocumentIds = requiredDocs.map(doc => doc.id);

            return requiredDocumentIds.every(docId => signedDocumentIds.includes(docId));
        } catch (error) {
            console.error('Error checking if user has signed all required documents:', error);
            return false;
        }
    }

    /**
     * Generate document hash for integrity verification
     */
    generateDocumentHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Verify document signature
     */
    verifySignature(sessionId, documentId) {
        const session = this.signatures.get(sessionId);
        if (!session || !session.signatures[documentId]) {
            return { valid: false, error: 'Signature not found' };
        }

        const signature = session.signatures[documentId];
        const document = this.documents.get(documentId);

        if (!document) {
            return { valid: false, error: 'Document not found' };
        }

        const currentHash = this.generateDocumentHash(document.content);
        const signatureHash = signature.documentHash;

        if (currentHash !== signatureHash) {
            return { valid: false, error: 'Document has been modified since signing' };
        }

        return { valid: true, signature };
    }

    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions() {
        const now = new Date();
        for (const [sessionId, session] of this.signatures.entries()) {
            if (now > session.expiresAt) {
                this.signatures.delete(sessionId);
            }
        }
    }

    /**
     * Get RBAC level number for comparison
     */
    getLevelNumber(level) {
        const levelMap = {
            'GUEST': 0,
            'MEMBER': 1,
            'SUBSCRIBER': 2,
            'SEAT_HOLDER': 3,
            'VENTURE_OWNER': 4,
            'VENTURE_PARTICIPANT': 5,
            'EXTERNAL_PARTNER': 6,
            'CONFIDENTIAL_ACCESS': 7,
            'RESTRICTED_ACCESS': 8,
            'HIGHLY_RESTRICTED_ACCESS': 9,
            'BILLING_ADMIN': 10,
            'SECURITY_ADMIN': 11,
            'LEGAL_ADMIN': 12
        };
        return levelMap[level] || 0;
    }

    /**
     * Get document key from document object
     */
    getDocumentKey(doc) {
        // Map document titles to keys used in legal framework
        const titleMap = {
            'Platform Participation Agreement (PPA)': 'PPA',
            'Electronic Signature & Consent Agreement': 'E_SIGNATURE_CONSENT',
            'Privacy Notice & Acknowledgment': 'PRIVACY_NOTICE',
            'Mutual Non-Disclosure Agreement': 'MUTUAL_NDA',
            'Platform Tools Subscription Agreement (PTSA)': 'PTSA',
            'Seat Order & Billing Authorization (SOBA)': 'SOBA',
            'Idea Submission & Evaluation Agreement': 'IDEA_SUBMISSION',
            'Participant Collaboration Agreement (PCA)': 'PCA',
            'Joint Development Agreement (JDA)': 'JDA',
            'Security Tier 1 Acknowledgment': 'SECURITY_TIER_1',
            'Security Tier 2 Acknowledgment': 'SECURITY_TIER_2',
            'Security Tier 3 Acknowledgment': 'SECURITY_TIER_3',
            'Crown Jewel IP Agreement': 'CROWN_JEWEL_IP'
        };

        return titleMap[doc.title] || doc.id;
    }
}

// Singleton instance
const legalDocumentService = new LegalDocumentService();

// Clean up expired sessions every hour
setInterval(() => {
    legalDocumentService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

module.exports = legalDocumentService;