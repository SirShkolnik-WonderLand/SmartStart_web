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
     * Get a specific legal document
     */
    getDocument(documentId) {
        return this.documents.get(documentId);
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
     * Sign a document
     */
    signDocument(sessionId, documentId, signatureData) {
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