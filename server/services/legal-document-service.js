const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class LegalDocumentService {
    constructor() {
        this.documents = new Map(); // In production, use database
        this.signatures = new Map(); // In production, use database
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
     * Get available documents for user (API compatibility)
     */
    async getAvailableDocuments(userId) {
        try {
            const documents = this.getDocuments();
            const userSignatures = this.getUserSignatures(userId);
            const signedDocumentIds = userSignatures.map(sig => sig.documentId);

            return documents.map(doc => ({
                id: doc.id,
                name: doc.name,
                title: doc.name,
                type: doc.type || 'TERMS_OF_SERVICE',
                content: doc.content,
                version: doc.version,
                status: signedDocumentIds.includes(doc.id) ? 'SIGNED' : 'PENDING',
                effectiveDate: doc.lastUpdated,
                requiresSignature: doc.required,
                complianceRequired: doc.required,
                createdBy: 'system',
                createdAt: doc.lastUpdated,
                updatedAt: doc.lastUpdated,
                description: doc.description,
                order: doc.order,
                isSigned: signedDocumentIds.includes(doc.id),
                signedAt: userSignatures.find(sig => sig.documentId === doc.id)?.signedAt
            }));
        } catch (error) {
            console.error('Error getting available documents:', error);
            throw error;
        }
    }

    /**
     * Get required documents for current level (API compatibility)
     */
    async getRequiredDocuments(userId) {
        try {
            const documents = this.getDocuments();
            const userSignatures = this.getUserSignatures(userId);
            const signedDocumentIds = userSignatures.map(sig => sig.documentId);

            return documents
                .filter(doc => doc.required)
                .map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    title: doc.name,
                    type: doc.type || 'TERMS_OF_SERVICE',
                    content: doc.content,
                    version: doc.version,
                    status: signedDocumentIds.includes(doc.id) ? 'SIGNED' : 'REQUIRED',
                    effectiveDate: doc.lastUpdated,
                    requiresSignature: true,
                    complianceRequired: true,
                    createdBy: 'system',
                    createdAt: doc.lastUpdated,
                    updatedAt: doc.lastUpdated,
                    description: doc.description,
                    order: doc.order,
                    isSigned: signedDocumentIds.includes(doc.id),
                    signedAt: userSignatures.find(sig => sig.documentId === doc.id)?.signedAt
                }));
        } catch (error) {
            console.error('Error getting required documents:', error);
            throw error;
        }
    }

    /**
     * Get pending documents for next level (API compatibility)
     */
    async getPendingDocuments(userId) {
        try {
            const documents = this.getDocuments();
            const userSignatures = this.getUserSignatures(userId);
            const signedDocumentIds = userSignatures.map(sig => sig.documentId);

            return documents
                .filter(doc => !doc.required)
                .map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    title: doc.name,
                    type: doc.type || 'OTHER',
                    content: doc.content,
                    version: doc.version,
                    status: signedDocumentIds.includes(doc.id) ? 'SIGNED' : 'PENDING',
                    effectiveDate: doc.lastUpdated,
                    requiresSignature: false,
                    complianceRequired: false,
                    createdBy: 'system',
                    createdAt: doc.lastUpdated,
                    updatedAt: doc.lastUpdated,
                    description: doc.description,
                    order: doc.order,
                    isSigned: signedDocumentIds.includes(doc.id),
                    signedAt: userSignatures.find(sig => sig.documentId === doc.id)?.signedAt
                }));
        } catch (error) {
            console.error('Error getting pending documents:', error);
            throw error;
        }
    }

    /**
     * Get a specific legal document
     */
    getDocument(documentId) {
        return this.documents.get(documentId);
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
            // Create a temporary session for this single document
            const session = this.generateSigningSession(userId, [documentId]);
            const result = this.signDocumentInSession(session.sessionId, documentId, signatureData);
            
            if (result.success) {
                return {
                    id: `sig-${crypto.randomBytes(8).toString('hex')}`,
                    documentId: documentId,
                    signerId: userId,
                    signatureHash: result.signature.documentHash,
                    signedAt: result.signature.signedAt.toISOString(),
                    ipAddress: signatureData.ip_address,
                    userAgent: signatureData.user_agent,
                    termsAccepted: true,
                    privacyAccepted: true,
                    identityVerified: signatureData.mfa_verified || false
                };
            } else {
                throw new Error(result.error);
            }
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
    getUserSignatures(userId) {
        const userSignatures = [];

        for (const [sessionId, session] of this.signatures.entries()) {
            if (session.userId === userId) {
                for (const [documentId, signature] of Object.entries(session.signatures)) {
                    userSignatures.push({
                        sessionId,
                        documentId,
                        documentName: signature.documentName,
                        signedAt: signature.signedAt,
                        version: signature.version
                    });
                }
            }
        }

        return userSignatures;
    }

    /**
     * Check if user has signed all required documents
     */
    hasSignedAllRequired(userId) {
        const userSignatures = this.getUserSignatures(userId);
        const requiredDocs = ['PPA', 'ESCA', 'PNA', 'MNDA'];

        return requiredDocs.every(docId =>
            userSignatures.some(sig => sig.documentId === docId)
        );
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
}

// Singleton instance
const legalDocumentService = new LegalDocumentService();

// Clean up expired sessions every hour
setInterval(() => {
    legalDocumentService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

module.exports = legalDocumentService;