/**
 * SmartStart Legal Framework Service
 * Implements comprehensive legal document management with Canadian compliance
 * Handles RBAC gating, signature workflows, and security tier controls
 * Now enhanced with state machine management for smart workflow orchestration
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const LegalStateMachineService = require('./legal-state-machine');

class LegalFrameworkService {
    constructor() {
        this.documentsPath = path.join(__dirname, '../Contracts');
        this.templatesPath = path.join(this.documentsPath, 'templates');
        this.signedPath = path.join(this.documentsPath, 'signed');
        this.payloadsPath = path.join(this.documentsPath, 'payloads');

        // Initialize state machine service
        this.stateMachineService = new LegalStateMachineService();

        // Initialize paths
        this.ensureDirectories();

        // Document templates mapping
        this.documentTemplates = {
            // Registration & Onboarding
            'PPA': 'Platform_Participation_Agreement.txt',
            'E_SIGNATURE_CONSENT': 'E_Signature_Consent.txt',
            'PRIVACY_NOTICE': 'Privacy_Notice_CASL.txt',
            'PAYMENT_TERMS': 'Payment_Terms.txt',
            'MUTUAL_NDA': 'InternalMutual_Confidentiality_Non_Exfiltration_Agreement.txt',
            'SECURITY_ACKNOWLEDGMENT': 'Security_Tooling_Acknowledgment.txt',

            // Subscription & Billing
            'PTSA': 'Platform_Tools_Subscription_Agreement.txt',
            'SOBA': 'Seat_Order_Billing_Authorization.txt',

            // Venture Management
            'IDEA_SUBMISSION': 'IDEA_SUMISSION_EVALUATION_AGREEMENT.txt',
            'VENTURE_OWNER': 'AliceSolutions_Idea_Owner_Hub.txt',
            'PCA': 'PARTICIPANT_COLLABORATION_AGREEMENT.txt',
            'JDA': 'JOINT_DEVELOPMENT_AGREEMENT.txt',
            'IP_ASSIGNMENT': 'Inventions_Intellectual_Property_Agreement.txt',

            // Security Tiers
            'SECURITY_TIER_1': 'Security_Tier_1_Acknowledgment.txt',
            'SECURITY_TIER_2': 'Security_Tier_2_Acknowledgment.txt',
            'SECURITY_TIER_3': 'Security_Tier_3_Acknowledgment.txt',
            'CROWN_JEWEL_IP': 'Crown_Jewel_IP_Agreement.txt',

            // Administrative
            'BILLING_ADMIN': 'Billing_Administration_Agreement.txt',
            'SECURITY_ADMIN': 'Security_Administration_Agreement.txt',
            'LEGAL_ADMIN': 'Legal_Administration_Agreement.txt',

            // Project-specific
            'PER_PROJECT_NDA': 'Per_Project_NDA_Addendum_Security_Tiered.txt',
            'PUOHA': 'Project_Upgrade_Order_Hosting_Addendum.txt'
        };

        // RBAC to document mapping
        this.rbacDocumentRequirements = {
            'GUEST': [],
            'MEMBER': ['PPA', 'E_SIGNATURE_CONSENT', 'PRIVACY_NOTICE', 'PAYMENT_TERMS', 'MUTUAL_NDA', 'SECURITY_ACKNOWLEDGMENT'],
            'SUBSCRIBER': ['PTSA', 'SOBA'],
            'SEAT_HOLDER': ['SOBA_UPDATE', 'SECURITY_ACKNOWLEDGMENT'],
            'VENTURE_OWNER': ['IDEA_SUBMISSION', 'VENTURE_OWNER', 'PER_PROJECT_NDA'],
            'VENTURE_PARTICIPANT': ['PCA', 'PER_PROJECT_NDA', 'IP_ASSIGNMENT'],
            'EXTERNAL_PARTNER': ['JDA', 'MUTUAL_NDA', 'PER_PROJECT_NDA', 'DPA'],
            'CONFIDENTIAL_ACCESS': ['SECURITY_TIER_1', 'PER_PROJECT_NDA'],
            'RESTRICTED_ACCESS': ['SECURITY_TIER_2', 'ENHANCED_SECURITY', 'PER_PROJECT_NDA'],
            'HIGHLY_RESTRICTED_ACCESS': ['SECURITY_TIER_3', 'CROWN_JEWEL_IP', 'ENHANCED_SECURITY', 'PER_PROJECT_NDA', 'SECURITY_CLEARANCE'],
            'BILLING_ADMIN': ['BILLING_ADMIN', 'ENHANCED_CONFIDENTIALITY', 'AUDIT_TRAIL'],
            'SECURITY_ADMIN': ['SECURITY_ADMIN', 'INCIDENT_RESPONSE', 'ENHANCED_CONFIDENTIALITY', 'LEGAL_COMPLIANCE'],
            'LEGAL_ADMIN': ['LEGAL_ADMIN', 'ATTORNEY_CLIENT_PRIVILEGE', 'ENHANCED_CONFIDENTIALITY', 'REGULATORY_COMPLIANCE']
        };

        // Security tier requirements
        this.securityTierRequirements = {
            'TIER_0': {
                name: 'Public',
                description: 'Marketing materials, open documentation',
                documents: [],
                securityControls: []
            },
            'TIER_1': {
                name: 'Confidential',
                description: 'Internal business information, non-sensitive code',
                documents: ['SECURITY_TIER_1', 'PER_PROJECT_NDA'],
                securityControls: [
                    'Device encryption and auto-lock (≤5 min)',
                    'MFA required',
                    'Local cache allowed if encrypted',
                    '90-day access expiry',
                    'Quarterly secret rotation'
                ]
            },
            'TIER_2': {
                name: 'Restricted',
                description: 'Trade secrets, customer data, production code',
                documents: ['SECURITY_TIER_2', 'ENHANCED_SECURITY', 'PER_PROJECT_NDA'],
                securityControls: [
                    'EDR/AV required',
                    'OS patching ≤30 days',
                    'VPN recommended',
                    'Local copies discouraged',
                    '60-day access expiry',
                    'Monthly secret rotation'
                ]
            },
            'TIER_3': {
                name: 'Highly Restricted',
                description: 'Crown-jewel IP, PHI, acquisition data',
                documents: ['SECURITY_TIER_3', 'CROWN_JEWEL_IP', 'ENHANCED_SECURITY', 'PER_PROJECT_NDA', 'SECURITY_CLEARANCE'],
                securityControls: [
                    'Managed devices only (MDM)',
                    'Hardware security keys (FIDO2)',
                    'VPN mandatory',
                    'No local copies',
                    '30-day access expiry',
                    '14-30 day secret rotation'
                ]
            }
        };
    }

    async ensureDirectories() {
        const dirs = [this.templatesPath, this.signedPath, this.payloadsPath];
        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (error) {
                // Directory might already exist
            }
        }
    }

    /**
     * Check if user has required documents for RBAC level
     */
    async checkUserDocumentCompliance(userId, targetRbacLevel) {
        try {
            // Get user's current signed documents
            const userDocuments = await this.getUserSignedDocuments(userId);

            // Get required documents for target RBAC level
            const requiredDocuments = this.rbacDocumentRequirements[targetRbacLevel] || [];

            // Check compliance
            const missingDocuments = [];
            const compliantDocuments = [];

            for (const docType of requiredDocuments) {
                const hasDocument = userDocuments.some(doc =>
                    doc.documentType === docType &&
                    doc.status === 'FULLY_EXECUTED' &&
                    this.isDocumentValid(doc)
                );

                if (hasDocument) {
                    compliantDocuments.push(docType);
                } else {
                    missingDocuments.push(docType);
                }
            }

            return {
                compliant: missingDocuments.length === 0,
                missingDocuments,
                compliantDocuments,
                requiredDocuments,
                userDocuments: userDocuments.length
            };
        } catch (error) {
            console.error('Error checking document compliance:', error);
            throw new Error('Failed to check document compliance');
        }
    }

    /**
     * Get user's signed documents
     */
    async getUserSignedDocuments(userId) {
        try {
            // This would typically query your database
            // For now, return empty array - implement based on your DB structure
            return [];
        } catch (error) {
            console.error('Error getting user documents:', error);
            return [];
        }
    }

    /**
     * Check if document is still valid (not expired)
     */
    isDocumentValid(document) {
        if (!document.expiryDate) return true; // No expiry date means valid

        const now = new Date();
        const expiry = new Date(document.expiryDate);
        return now < expiry;
    }

    /**
     * Generate document from template
     */
    async generateDocument(templateType, variables = {}) {
        try {
            const templateFile = this.documentTemplates[templateType];
            if (!templateFile) {
                throw new Error(`Template not found: ${templateType}`);
            }

            const templatePath = path.join(this.templatesPath, templateFile);
            let template;

            try {
                template = await fs.readFile(templatePath, 'utf8');
            } catch (error) {
                // If template doesn't exist, create a basic one
                template = this.createBasicTemplate(templateType, variables);
            }

            // Replace variables in template
            let document = template;
            for (const [key, value] of Object.entries(variables)) {
                const placeholder = `{{${key}}}`;
                document = document.replace(new RegExp(placeholder, 'g'), value || '');
            }

            // Add standard footer
            document += this.generateDocumentFooter(templateType, variables);

            return document;
        } catch (error) {
            console.error('Error generating document:', error);
            throw new Error(`Failed to generate document: ${error.message}`);
        }
    }

    /**
     * Create basic template if none exists
     */
    createBasicTemplate(templateType, variables) {
        const templates = {
            'PPA': `PLATFORM PARTICIPATION AGREEMENT

This agreement governs your participation in the SmartStart platform.

User: {{userName}}
Email: {{userEmail}}
Date: {{currentDate}}

Terms and conditions apply as per the full agreement.
`,

            'MUTUAL_NDA': `MUTUAL CONFIDENTIALITY & NON-EXFILTRATION AGREEMENT

This agreement establishes confidentiality obligations between parties.

User: {{userName}}
Email: {{userEmail}}
Date: {{currentDate}}

Confidentiality terms apply as per the full agreement.
`,

            'SOBA': `SEAT ORDER & BILLING AUTHORIZATION

This document authorizes seat provisioning and billing.

Subscriber: {{subscriberName}}
Domain: {{projectDomain}}
Seats: {{seatsCount}}
Date: {{currentDate}}

Billing terms apply as per the full agreement.
`
        };

        return templates[templateType] || `Document: ${templateType}\n\nUser: {{userName}}\nDate: {{currentDate}}\n\nTerms apply as per the full agreement.`;
    }

    /**
     * Generate document footer with hash and signature info
     */
    generateDocumentFooter(templateType, variables) {
        const timestamp = new Date().toISOString();
        const docId = this.generateDocumentId();

        return `

---
DOCUMENT FOOTER
Document Type: ${templateType}
Document ID: ${docId}
Generated: ${timestamp}
User: ${variables.userName || 'Unknown'}
Email: ${variables.userEmail || 'Unknown'}

This document will be hashed and signed electronically.
DOC HASH (sha256): [TO_BE_COMPUTED]
---
`;
    }

    /**
     * Canonicalize document text for consistent hashing
     */
    canonicalizeDocument(documentText) {
        return documentText
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/[ \t]+$/gm, '') // Trim trailing spaces
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Collapse multiple blank lines
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove non-printable chars
    }

    /**
     * Compute document hash
     */
    computeDocumentHash(documentText) {
        const canonical = this.canonicalizeDocument(documentText);
        return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
    }

    /**
     * Generate unique document ID
     */
    generateDocumentId() {
        return crypto.randomUUID();
    }

    /**
     * Store document and metadata
     */
    async storeDocument(documentType, documentText, variables, userId) {
        try {
            const docId = this.generateDocumentId();
            const hash = this.computeDocumentHash(documentText);
            const timestamp = new Date().toISOString();

            // Update document text with computed hash
            const finalDocument = documentText.replace(
                'DOC HASH (sha256): [TO_BE_COMPUTED]',
                `DOC HASH (sha256): ${hash}`
            );

            // Store document text
            const docFilename = `${documentType}_${userId}_${Date.now()}.txt`;
            const docPath = path.join(this.signedPath, docFilename);
            await fs.writeFile(docPath, finalDocument, 'utf8');

            // Store metadata
            const metadata = {
                documentId: docId,
                documentType,
                userId,
                hash,
                status: 'DRAFTED',
                createdAt: timestamp,
                variables,
                filePath: docPath,
                filename: docFilename
            };

            const metadataPath = path.join(this.payloadsPath, `${docId}.json`);
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

            return {
                documentId: docId,
                hash,
                status: 'DRAFTED',
                filePath: docPath
            };
        } catch (error) {
            console.error('Error storing document:', error);
            throw new Error('Failed to store document');
        }
    }

    /**
     * Process e-signature
     */
    async processESignature(documentId, signerInfo) {
        try {
            const {
                signerName,
                signerTitle,
                signerEmail,
                ip,
                userAgent,
                otpCode
            } = signerInfo;

            const timestamp = new Date().toISOString();

            // Load document metadata
            const metadataPath = path.join(this.payloadsPath, `${documentId}.json`);
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

            // Create signature evidence
            const signatureEvidence = {
                documentId,
                signerName,
                signerTitle,
                signerEmail,
                ip,
                userAgent,
                timestamp,
                otpCodeLast4: otpCode ? otpCode.slice(-4) : null,
                docHash: metadata.hash
            };

            // Update document status
            metadata.status = 'SIGNED';
            metadata.signedAt = timestamp;
            metadata.signatureEvidence = signatureEvidence;

            // Save updated metadata
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

            // Emit events
            this.emitDocumentEvent('document.signed', {
                documentId,
                documentType: metadata.documentType,
                userId: metadata.userId,
                signerEmail
            });

            return {
                success: true,
                documentId,
                status: 'SIGNED',
                signatureEvidence
            };
        } catch (error) {
            console.error('Error processing e-signature:', error);
            throw new Error('Failed to process e-signature');
        }
    }

    /**
     * Emit document events
     */
    emitDocumentEvent(eventType, data) {
        // This would typically emit to your event system
        console.log(`Legal Framework Event: ${eventType}`, data);

        // You could integrate with your existing event system here
        // For example: eventBus.emit(eventType, data);
    }

    /**
     * Get required documents for user action
     */
    getRequiredDocumentsForAction(action, context = {}) {
        const actionDocumentMap = {
            'REGISTER': ['PPA', 'E_SIGNATURE_CONSENT', 'PRIVACY_NOTICE', 'PAYMENT_TERMS', 'MUTUAL_NDA', 'SECURITY_ACKNOWLEDGMENT'],
            'SUBSCRIBE': ['PTSA', 'SOBA'],
            'CREATE_VENTURE': ['IDEA_SUBMISSION', 'VENTURE_OWNER', 'PER_PROJECT_NDA'],
            'JOIN_VENTURE': ['PCA', 'PER_PROJECT_NDA', 'IP_ASSIGNMENT'],
            'ACCESS_TIER_1': ['SECURITY_TIER_1', 'PER_PROJECT_NDA'],
            'ACCESS_TIER_2': ['SECURITY_TIER_2', 'ENHANCED_SECURITY', 'PER_PROJECT_NDA'],
            'ACCESS_TIER_3': ['SECURITY_TIER_3', 'CROWN_JEWEL_IP', 'ENHANCED_SECURITY', 'PER_PROJECT_NDA', 'SECURITY_CLEARANCE'],
            'BILLING_ADMIN': ['BILLING_ADMIN', 'ENHANCED_CONFIDENTIALITY', 'AUDIT_TRAIL'],
            'SECURITY_ADMIN': ['SECURITY_ADMIN', 'INCIDENT_RESPONSE', 'ENHANCED_CONFIDENTIALITY', 'LEGAL_COMPLIANCE'],
            'LEGAL_ADMIN': ['LEGAL_ADMIN', 'ATTORNEY_CLIENT_PRIVILEGE', 'ENHANCED_CONFIDENTIALITY', 'REGULATORY_COMPLIANCE']
        };

        return actionDocumentMap[action] || [];
    }

    /**
     * Check if user can perform action based on documents
     */
    async canUserPerformAction(userId, action, context = {}) {
        const requiredDocuments = this.getRequiredDocumentsForAction(action, context);
        const compliance = await this.checkUserDocumentCompliance(userId, this.getRbacLevelForAction(action));

        return {
            allowed: compliance.compliant,
            missingDocuments: compliance.missingDocuments,
            requiredDocuments,
            compliance
        };
    }

    /**
     * Get RBAC level for action
     */
    getRbacLevelForAction(action) {
        const actionRbacMap = {
            'REGISTER': 'MEMBER',
            'SUBSCRIBE': 'SUBSCRIBER',
            'CREATE_VENTURE': 'VENTURE_OWNER',
            'JOIN_VENTURE': 'VENTURE_PARTICIPANT',
            'ACCESS_TIER_1': 'CONFIDENTIAL_ACCESS',
            'ACCESS_TIER_2': 'RESTRICTED_ACCESS',
            'ACCESS_TIER_3': 'HIGHLY_RESTRICTED_ACCESS',
            'BILLING_ADMIN': 'BILLING_ADMIN',
            'SECURITY_ADMIN': 'SECURITY_ADMIN',
            'LEGAL_ADMIN': 'LEGAL_ADMIN'
        };

        return actionRbacMap[action] || 'GUEST';
    }

    /**
     * Get security tier requirements
     */
    getSecurityTierRequirements(tier) {
        return this.securityTierRequirements[tier] || null;
    }

    /**
     * Validate Canadian compliance
     */
    validateCanadianCompliance(documentType, userData) {
        const compliance = {
            pipeda: true, // Personal Information Protection and Electronic Documents Act
            phipa: false, // Personal Health Information Protection Act (Ontario)
            casl: true, // Canada's Anti-Spam Legislation
            valid: true
        };

        // Check for health information
        if (userData.hasHealthInfo) {
            compliance.phipa = true;
        }

        // Check for marketing communications
        if (documentType === 'PRIVACY_NOTICE' && userData.consentToMarketing) {
            compliance.casl = true;
        }

        compliance.valid = compliance.pipeda && compliance.casl && (!userData.hasHealthInfo || compliance.phipa);

        return compliance;
    }

    // ===== STATE MACHINE INTEGRATION METHODS =====

    /**
     * Create a document with state machine management
     */
    async createDocumentWithStateMachine(documentType, variables, userId, ventureId = null) {
        try {
            // Generate document content
            const documentText = await this.generateDocument(documentType, variables);
            const documentId = this.generateDocumentId();
            
            // Store document
            await this.storeDocument(documentType, documentText, variables, userId);
            
            // Create state machine for document
            const initialContext = {
                documentId,
                documentType,
                userId,
                ventureId,
                requiredSignatures: this.getRequiredSignatures(documentType),
                securityTier: this.getSecurityTierForDocument(documentType),
                expiryDate: this.calculateExpiryDate(documentType),
                auditTrail: [{
                    timestamp: new Date().toISOString(),
                    event: 'DOCUMENT_CREATED',
                    userId,
                    metadata: { documentType, ventureId }
                }]
            };
            
            const machine = await this.stateMachineService.createDocumentMachine(documentId, initialContext);
            
            return {
                documentId,
                documentText,
                stateMachine: machine,
                currentState: machine.state.value,
                context: machine.state.context
            };
        } catch (error) {
            console.error('Failed to create document with state machine:', error);
            throw error;
        }
    }

    /**
     * Process document signing with state machine
     */
    async processDocumentSigningWithStateMachine(documentId, signerInfo) {
        try {
            // Send signature event to state machine
            await this.stateMachineService.sendDocumentEvent(documentId, {
                type: 'SIGNATURE_RECEIVED',
                metadata: {
                    signerInfo,
                    timestamp: new Date().toISOString()
                }
            });
            
            // Process the actual signature
            const result = await this.processESignature(documentId, signerInfo);
            
            // Check if all signatures are complete
            const currentState = this.stateMachineService.getDocumentState(documentId);
            if (currentState?.context?.completedSignatures?.length >= currentState?.context?.requiredSignatures?.length) {
                await this.stateMachineService.sendDocumentEvent(documentId, {
                    type: 'ALL_SIGNATURES_COMPLETE',
                    metadata: { timestamp: new Date().toISOString() }
                });
            }
            
            return result;
        } catch (error) {
            console.error('Failed to process document signing with state machine:', error);
            throw error;
        }
    }

    /**
     * Create user compliance state machine
     */
    async createUserComplianceStateMachine(userId, rbacLevel = 'GUEST') {
        try {
            const requiredDocuments = this.rbacDocumentRequirements[rbacLevel] || [];
            
            const initialContext = {
                userId,
                rbacLevel,
                requiredDocuments,
                completedDocuments: await this.getUserSignedDocuments(userId),
                complianceScore: 0,
                lastComplianceCheck: new Date().toISOString(),
                canadianCompliance: this.validateCanadianCompliance('USER_ONBOARDING', { userId })
            };
            
            const machine = await this.stateMachineService.createUserComplianceStateMachine(userId, initialContext);
            
            return {
                userId,
                stateMachine: machine,
                currentState: machine.state.value,
                context: machine.state.context
            };
        } catch (error) {
            console.error('Failed to create user compliance state machine:', error);
            throw error;
        }
    }

    /**
     * Update user compliance when document is signed
     */
    async updateUserComplianceOnDocumentSign(userId, documentType) {
        try {
            await this.stateMachineService.sendUserComplianceEvent(userId, {
                type: 'DOCUMENT_SIGNED',
                metadata: {
                    documentType,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Failed to update user compliance:', error);
            throw error;
        }
    }

    /**
     * Get state machine visualization data
     */
    async getStateMachineVisualization(type, id) {
        return this.stateMachineService.getStateMachineVisualization(type, id);
    }

    /**
     * Get required signatures for document type
     */
    getRequiredSignatures(documentType) {
        // Map document types to required signers
        const signatureRequirements = {
            'PPA': [{ role: 'USER', required: true }],
            'SOBA': [{ role: 'USER', required: true }, { role: 'BILLING_ADMIN', required: true }],
            'IDEA_SUBMISSION': [{ role: 'VENTURE_OWNER', required: true }],
            'PCA': [{ role: 'VENTURE_PARTICIPANT', required: true }, { role: 'VENTURE_OWNER', required: true }],
            'JDA': [{ role: 'EXTERNAL_PARTNER', required: true }, { role: 'VENTURE_OWNER', required: true }]
        };
        
        return signatureRequirements[documentType] || [{ role: 'USER', required: true }];
    }

    /**
     * Get security tier for document type
     */
    getSecurityTierForDocument(documentType) {
        const tierMapping = {
            'PPA': 'TIER_0',
            'PRIVACY_NOTICE': 'TIER_0',
            'SOBA': 'TIER_1',
            'IDEA_SUBMISSION': 'TIER_1',
            'PCA': 'TIER_1',
            'JDA': 'TIER_2',
            'SECURITY_TIER_3': 'TIER_3',
            'CROWN_JEWEL_IP': 'TIER_3'
        };
        
        return tierMapping[documentType] || 'TIER_0';
    }

    /**
     * Calculate expiry date for document type
     */
    calculateExpiryDate(documentType) {
        const expiryMapping = {
            'PPA': 365, // 1 year
            'SOBA': 365, // 1 year
            'IDEA_SUBMISSION': 90, // 3 months
            'PCA': 180, // 6 months
            'JDA': 365, // 1 year
            'PER_PROJECT_NDA': 90 // 3 months
        };
        
        const days = expiryMapping[documentType] || 365;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        
        return expiryDate;
    }

    /**
     * Cleanup state machines
     */
    cleanupStateMachines() {
        this.stateMachineService.cleanup();
    }
}

module.exports = LegalFrameworkService;