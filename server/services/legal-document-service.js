const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class LegalDocumentService {
    constructor() {
        this.documents = new Map(); // In production, use database
        this.signatures = new Map(); // In production, use database
        this.legalFramework = require('./legal-framework');
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
     * Get level number for RBAC comparison
     */
    getLevelNumber(level) {
        const levels = {
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
            'LEGAL_ADMIN': 12,
            'ANALYTICS_ACCESS': 13,
            'API_ACCESS': 14,
            'DOCUMENT_ADMIN': 15,
            'INCIDENT_RESPONDER': 16,
            'AUDIT_PARTICIPANT': 17
        };
        return levels[level] || 0;
    }

    /**
     * Get next RBAC level
     */
    getNextLevel(currentLevel) {
        const levelOrder = [
            'GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 
            'VENTURE_PARTICIPANT', 'EXTERNAL_PARTNER', 'CONFIDENTIAL_ACCESS', 
            'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 
            'SECURITY_ADMIN', 'LEGAL_ADMIN', 'ANALYTICS_ACCESS', 'API_ACCESS', 
            'DOCUMENT_ADMIN', 'INCIDENT_RESPONDER', 'AUDIT_PARTICIPANT'
        ];
        
        const currentIndex = levelOrder.indexOf(currentLevel);
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            return levelOrder[currentIndex + 1];
        }
        return null;
    }

    /**
     * Get available documents for user (API compatibility with existing legal framework)
     */
    async getAvailableDocuments(userId) {
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { level: true }
            });
            
            const userLevel = user?.level || 'OWLET';
            const rbacLevel = this.mapUserLevelToRbacLevel(userLevel);
            
            const documents = await prisma.legalDocument.findMany({
                where: { status: 'EFFECTIVE' },
                orderBy: { title: 'asc' }
            });

            const userSignatures = await prisma.legalDocumentSignature.findMany({
                where: { signerId: userId },
                include: {
                    signer: {
                        select: { name: true, email: true, level: true }
                    }
                }
            });

            const signedDocumentIds = userSignatures.map(sig => sig.documentId);

            // Get all required documents for user's RBAC level
            const allRequiredDocs = [];
            for (const [level, config] of Object.entries(this.legalFramework.rbacDocumentRequirements)) {
                if (this.getLevelNumber(level) <= this.getLevelNumber(rbacLevel)) {
                    allRequiredDocs.push(...config);
                }
            }

            // Get documents for next level (pending)
            const nextLevelDocs = [];
            const nextLevel = this.getNextLevel(rbacLevel);
            if (nextLevel) {
                const nextLevelConfig = this.legalFramework.rbacDocumentRequirements[nextLevel] || [];
                nextLevelDocs.push(...nextLevelConfig);
            }

            console.log('🔍 Debug getAvailableDocuments:');
            console.log('  - Total documents from DB:', documents.length);
            console.log('  - User level:', userLevel, '→ RBAC level:', rbacLevel);
            console.log('  - All required docs for level:', allRequiredDocs);
            console.log('  - Next level docs:', nextLevelDocs);
            
            return documents.map(doc => {
                const docKey = this.getDocumentKey(doc);
                const isRequired = allRequiredDocs.includes(docKey);
                const isPending = nextLevelDocs.includes(docKey);
                const isSigned = signedDocumentIds.includes(doc.id);
                const signature = userSignatures.find(sig => sig.documentId === doc.id);
                
                console.log(`  - Doc: "${doc.title}" → Key: "${docKey}" → Required: ${isRequired}, Pending: ${isPending}`);

                let status = 'NOT_REQUIRED';
                if (isRequired && isSigned) status = 'SIGNED';
                else if (isRequired && !isSigned) status = 'REQUIRED';
                else if (isPending && isSigned) status = 'SIGNED';
                else if (isPending && !isSigned) status = 'PENDING';
                else if (!isRequired && !isPending && isSigned) status = 'SIGNED';

                return {
                    id: doc.id,
                    title: doc.title,
                    type: doc.type,
                    content: doc.content,
                    version: doc.version || '1.0',
                    status: status,
                    effectiveDate: doc.effectiveDate,
                    expiryDate: doc.expiryDate,
                    requiresSignature: doc.requiresSignature,
                    signatureDeadline: doc.signatureDeadline,
                    complianceRequired: doc.complianceRequired,
                    createdBy: doc.createdBy,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                    entityId: doc.entityId,
                    projectId: doc.projectId,
                    ventureId: doc.ventureId,
                    required: isRequired,
                    lastUpdated: doc.updatedAt,
                    isSigned: isSigned,
                    signedAt: signature?.signedAt,
                    signatureHash: signature?.signatureHash,
                    signerName: signature?.signer?.name,
                    signerEmail: signature?.signer?.email,
                    signerLevel: signature?.signer?.level,
                    ipAddress: signature?.ipAddress,
                    userAgent: signature?.userAgent,
                    generatedFrom: doc.generatedFrom
                };
            });
        } catch (error) {
            console.error('Error getting available documents:', error);
            return [];
        }
    }

    /**
     * Get required documents for user's current level
     */
    async getRequiredDocuments(userId) {
        try {
            const documents = await this.getAvailableDocuments(userId);
            return documents.filter(doc => doc.status === 'REQUIRED');
        } catch (error) {
            console.error('Error getting required documents:', error);
            return [];
        }
    }

    /**
     * Get pending documents for next level
     */
    async getPendingDocuments(userId) {
        try {
            const documents = await this.getAvailableDocuments(userId);
            return documents.filter(doc => doc.status === 'PENDING');
        } catch (error) {
            console.error('Error getting pending documents:', error);
            return [];
        }
    }

    /**
     * Get user document status
     */
    async getUserDocumentStatus(userId) {
        try {
            const documents = await this.getAvailableDocuments(userId);
            const required = documents.filter(doc => doc.status === 'REQUIRED');
            const signed = documents.filter(doc => doc.status === 'SIGNED');
            const pending = documents.filter(doc => doc.status === 'PENDING');

            return {
                total: documents.length,
                required: required.length,
                signed: signed.length,
                pending: pending.length,
                compliance: required.length === 0,
                documents: documents
            };
        } catch (error) {
            console.error('Error getting user document status:', error);
            return {
                total: 0,
                required: 0,
                signed: 0,
                pending: 0,
                compliance: false,
                documents: []
            };
        }
    }

    /**
     * Sign a document (database version)
     */
    async signDocument(userId, documentId, signatureData) {
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            // Generate signature hash
            const signatureHash = crypto
                .createHash('sha256')
                .update(JSON.stringify({
                    documentId,
                    userId,
                    timestamp: new Date().toISOString(),
                    signatureData
                }))
                .digest('hex');

            // Create signature record
            const signature = await prisma.legalDocumentSignature.create({
                data: {
                    documentId,
                    signerId: userId,
                    signatureHash,
                    signedAt: new Date(),
                    ipAddress: signatureData.ipAddress,
                    userAgent: signatureData.userAgent,
                    termsAccepted: signatureData.termsAccepted || false,
                    privacyAccepted: signatureData.privacyAccepted || false,
                    identityVerified: signatureData.identityVerified || false
                },
                include: {
                    signer: {
                        select: { name: true, email: true, level: true }
                    }
                }
            });

            return {
                id: signature.id,
                documentId: signature.documentId,
                signerId: signature.signerId,
                signatureHash: signature.signatureHash,
                signedAt: signature.signedAt,
                signerName: signature.signer?.name,
                signerEmail: signature.signer?.email,
                signerLevel: signature.signer?.level,
                ipAddress: signature.ipAddress,
                userAgent: signature.userAgent
            };
        } catch (error) {
            console.error('Error signing document:', error);
            throw error;
        }
    }

    /**
     * Get user's signed documents
     */
    async getUserSignatures(userId) {
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            
            const signatures = await prisma.legalDocumentSignature.findMany({
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
                sessionId: null,
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
            const status = await this.getUserDocumentStatus(userId);
            return status.compliance;
        } catch (error) {
            console.error('Error checking compliance:', error);
            return false;
        }
    }

    /**
     * Log document action for audit trail
     */
    async logDocumentAction(userId, documentId, action, metadata = {}) {
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            await prisma.legalDocumentAction.create({
                data: {
                    userId,
                    documentId,
                    action,
                    metadata: JSON.stringify(metadata),
                    timestamp: new Date()
                }
            });
        } catch (error) {
            console.error('Error logging document action:', error);
        }
    }

    /**
     * Get document audit log
     */
    async getDocumentAuditLog(documentId, userId = null, action = null, page = 1, limit = 10) {
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const where = { documentId };
            if (userId) where.userId = userId;
            if (action) where.action = action;

            const actions = await prisma.legalDocumentAction.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            });

            return actions.map(action => ({
                id: action.id,
                userId: action.userId,
                documentId: action.documentId,
                action: action.action,
                metadata: JSON.parse(action.metadata || '{}'),
                timestamp: action.timestamp
            }));
        } catch (error) {
            console.error('Error getting document audit log:', error);
            return [];
        }
    }

    /**
     * Generate compliance report
     */
    async generateComplianceReport(userId) {
        try {
            const status = await this.getUserDocumentStatus(userId);
            const signatures = await this.getUserSignatures(userId);

            return {
                userId,
                compliance: status.compliance,
                summary: {
                    total: status.total,
                    required: status.required,
                    signed: status.signed,
                    pending: status.pending
                },
                documents: status.documents,
                signatures: signatures,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating compliance report:', error);
            return null;
        }
    }

    /**
     * Map document titles to keys used in legal framework
     */
    getDocumentKey(doc) {
        const titleMap = {
            // Core Platform Agreements
            'Platform Participation Agreement (PPA)': 'PPA',
            'Electronic Signature & Consent Agreement': 'ESCA',
            'Privacy Notice & Acknowledgment': 'PNA',
            'Internal Mutual Confidentiality & Non-Exfiltration Agreement': 'MNDA',
            'Security & Tooling Acknowledgment': 'STA',
            
            // Subscription & Billing
            'Platform Tools Subscription Agreement (PTSA)': 'PTSA',
            'Seat Order & Billing Authorization (SOBA)': 'SOBA',
            'Project Upgrade Order & Hosting Addendum': 'PUOHA',
            
            // Venture & Project Agreements
            'Idea Submission & Evaluation Agreement': 'ISEA',
            'Venture Owner Agreement': 'VOA',
            'Participant Collaboration Agreement (PCA)': 'PCA',
            'Joint Development Agreement (JDA)': 'JDA',
            'Contributor License Agreement': 'CLA',
            'IP Assignment Agreement': 'IAA',
            'Per-Project NDA Addendum (Security-Tiered)': 'PPNA',
            
            // Security Tier Agreements
            'Security Tier 1 Acknowledgment': 'ST1A',
            'Security Tier 2 Acknowledgment': 'ST2A',
            'Security Tier 3 Acknowledgment': 'ST3A',
            'Crown Jewel IP Agreement': 'CJIA',
            'Enhanced Security Agreement': 'ESA',
            'Security Clearance Verification': 'SCV',
            
            // Administrative Agreements
            'Billing Administration Agreement': 'BAA',
            'Security Administration Agreement': 'SAA',
            'Legal Administration Agreement': 'LAA',
            'Incident Response Agreement': 'IRA',
            'Audit Cooperation Agreement': 'ACA',
            
            // Specialized Access
            'Data Analytics Agreement': 'DAA',
            'API Usage Agreement': 'APIUA',
            'Document Management Agreement': 'DMA',
            
            // Compliance & Legal
            'Enhanced Confidentiality Agreement': 'ECA',
            'Audit Trail Acknowledgment': 'ATA',
            'Legal Compliance Acknowledgment': 'LCA',
            'Attorney-Client Privilege Agreement': 'ACPA',
            'Regulatory Compliance Agreement': 'RCA',
            
            // Data Protection
            'Data Processing Addendum': 'DPA',
            'Data Anonymization Acknowledgment': 'DATA_ANONYMIZATION',
            'Reporting Compliance Agreement': 'REPORTING_COMPLIANCE',
            'Integration Security Agreement': 'INTEGRATION_SECURITY',
            'Data Export Agreement': 'DATA_EXPORT',
            'Version Control Agreement': 'VERSION_CONTROL',
            'Retention Policy Acknowledgment': 'RETENTION_POLICY',
            'Breach Notification Agreement': 'BREACH_NOTIFICATION',
            'Forensic Investigation Agreement': 'FORENSIC_INVESTIGATION',
            'Document Production Agreement': 'DOCUMENT_PRODUCTION',
            'Audit Confidentiality Agreement': 'AUDIT_CONFIDENTIALITY',
            
            // Team & Collaboration
            'Team Collaboration Agreement': 'TEAM_COLLABORATION',
            'Updated SOBA': 'SOBA_UPDATE',
            'Per-Project NDA Addendum (Tier 1)': 'PPNA_TIER1',
            'Per-Project NDA Addendum (Tier 2)': 'PPNA_TIER2',
            'Per-Project NDA Addendum (Tier 3)': 'PPNA_TIER3'
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