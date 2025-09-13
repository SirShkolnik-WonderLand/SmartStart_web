/**
 * Comprehensive RBAC-Legal Document Mapping System
 * Based on analysis of all legal contracts and RBAC requirements
 */

class ComprehensiveRBACLegalMapping {
    constructor() {
        // Define RBAC levels with their numeric values
        this.rbacLevels = {
            'GUEST': 0,
            'OWLET': 0,
            'MEMBER': 1,
            'NIGHT_WATCHER': 1,
            'SUBSCRIBER': 2,
            'WISE_OWL': 2,
            'SEAT_HOLDER': 3,
            'SKY_MASTER': 3,
            'VENTURE_OWNER': 4,
            'VENTURE_PARTICIPANT': 5,
            'CONFIDENTIAL_ACCESS': 6,
            'RESTRICTED_ACCESS': 7,
            'HIGHLY_RESTRICTED_ACCESS': 8,
            'BILLING_ADMIN': 9,
            'SECURITY_ADMIN': 10,
            'LEGAL_ADMIN': 11
        };

        // Define document categories and their requirements
        this.documentCategories = {
            'CORE_PLATFORM': {
                'PPA': {
                    title: 'Platform Participation Agreement (PPA)',
                    type: 'TERMS_OF_SERVICE',
                    requiredFor: ['MEMBER', 'NIGHT_WATCHER', 'SUBSCRIBER', 'WISE_OWL', 'SEAT_HOLDER', 'SKY_MASTER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Terms of membership, acceptable use, IP framework, liability, termination',
                    isTemplate: false,
                    isRequired: true,
                    rbacLevel: 'MEMBER'
                },
                'MUTUAL_NDA': {
                    title: 'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                    type: 'CONFIDENTIALITY_AGREEMENT',
                    requiredFor: ['MEMBER', 'NIGHT_WATCHER', 'SUBSCRIBER', 'WISE_OWL', 'SEAT_HOLDER', 'SKY_MASTER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Global confidentiality and 5-year survival from last access',
                    isTemplate: false,
                    isRequired: true,
                    rbacLevel: 'MEMBER'
                },
                'PTSA': {
                    title: 'Platform Tools Subscription Agreement (PTSA)',
                    type: 'TERMS_OF_SERVICE',
                    requiredFor: ['SUBSCRIBER', 'WISE_OWL', 'SEAT_HOLDER', 'SKY_MASTER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Mandatory $100 CAD/month tools subscription',
                    isTemplate: false,
                    isRequired: true,
                    rbacLevel: 'SUBSCRIBER'
                },
                'SOBA': {
                    title: 'Seat Order & Billing Authorization (SOBA)',
                    type: 'TERMS_OF_SERVICE',
                    requiredFor: ['SUBSCRIBER', 'WISE_OWL', 'SEAT_HOLDER', 'SKY_MASTER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Seat ordering and billing authorization',
                    isTemplate: false,
                    isRequired: true,
                    rbacLevel: 'SUBSCRIBER'
                }
            },
            'VENTURE_PROJECT': {
                'IDEA_SUBMISSION': {
                    title: 'Idea Submission & Evaluation Agreement',
                    type: 'OTHER',
                    requiredFor: ['SEAT_HOLDER', 'SKY_MASTER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Agreement for submitting and evaluating business ideas',
                    isTemplate: false,
                    isRequired: false,
                    rbacLevel: 'SEAT_HOLDER'
                },
                'JDA': {
                    title: 'Joint Development Agreement (JDA)',
                    type: 'PARTNERSHIP_AGREEMENT',
                    requiredFor: ['VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Agreement for joint development projects',
                    isTemplate: false,
                    isRequired: false,
                    rbacLevel: 'VENTURE_PARTICIPANT'
                },
                'PCA': {
                    title: 'Participant Collaboration Agreement (PCA)',
                    type: 'PARTNERSHIP_AGREEMENT',
                    requiredFor: ['VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Agreement for participant collaboration on projects',
                    isTemplate: false,
                    isRequired: false,
                    rbacLevel: 'VENTURE_OWNER'
                }
            },
            'TEMPLATES': {
                'PER_PROJECT_NDA': {
                    title: 'Per-Project NDA Addendum (Security-Tiered)',
                    type: 'CONFIDENTIALITY_AGREEMENT',
                    requiredFor: ['CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Template for per-project NDA addendums with security tiers',
                    isTemplate: true,
                    isRequired: false,
                    rbacLevel: 'CONFIDENTIAL_ACCESS'
                },
                'MUTUAL_NDA_TEMPLATE': {
                    title: 'Mutual Confidentiality Non-Exfiltration Agreement Template',
                    type: 'CONFIDENTIALITY_AGREEMENT',
                    requiredFor: ['CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Template for mutual confidentiality agreements',
                    isTemplate: true,
                    isRequired: false,
                    rbacLevel: 'CONFIDENTIAL_ACCESS'
                },
                'PPA_TEMPLATE': {
                    title: 'Platform Participation Agreement Template',
                    type: 'TERMS_OF_SERVICE',
                    requiredFor: ['CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Template for platform participation agreements',
                    isTemplate: true,
                    isRequired: false,
                    rbacLevel: 'CONFIDENTIAL_ACCESS'
                },
                'SOBA_TEMPLATE': {
                    title: 'Seat Order Billing Authorization Template',
                    type: 'TERMS_OF_SERVICE',
                    requiredFor: ['CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'],
                    description: 'Template for seat order and billing authorization',
                    isTemplate: true,
                    isRequired: false,
                    rbacLevel: 'CONFIDENTIAL_ACCESS'
                }
            }
        };

        // Define document workflow states
        this.documentStates = {
            'DRAFT': 'Document is being prepared',
            'PENDING_REVIEW': 'Document awaiting review',
            'APPROVED': 'Document approved for signing',
            'SIGNED': 'Document has been signed',
            'EFFECTIVE': 'Document is in effect',
            'EXPIRED': 'Document has expired',
            'TERMINATED': 'Document has been terminated'
        };

        // Define signing workflow states
        this.signingStates = {
            'NOT_REQUIRED': 'Document not required for user level',
            'PENDING': 'Document pending for next level',
            'REQUIRED': 'Document required for current level',
            'SIGNED': 'Document has been signed',
            'EXPIRED': 'Document signature has expired',
            'REVOKED': 'Document signature has been revoked'
        };
    }

    /**
     * Get user's RBAC level number
     */
    getUserLevelNumber(userLevel) {
        return this.rbacLevels[userLevel] || 0;
    }

    /**
     * Get all documents required for a specific RBAC level
     */
    getRequiredDocumentsForLevel(userLevel) {
        const requiredDocs = [];

        for (const category of Object.values(this.documentCategories)) {
            for (const doc of Object.values(category)) {
                if (doc.requiredFor.includes(userLevel) && doc.isRequired) {
                    requiredDocs.push({
                        key: Object.keys(category).find(key => category[key] === doc),
                        ...doc
                    });
                }
            }
        }

        return requiredDocs;
    }

    /**
     * Get all documents accessible to a specific RBAC level
     */
    getAccessibleDocumentsForLevel(userLevel) {
        const accessibleDocs = [];

        for (const category of Object.values(this.documentCategories)) {
            for (const doc of Object.values(category)) {
                if (doc.requiredFor.includes(userLevel)) {
                    accessibleDocs.push({
                        key: Object.keys(category).find(key => category[key] === doc),
                        ...doc
                    });
                }
            }
        }

        return accessibleDocs;
    }

    /**
     * Get next RBAC level for user
     */
    getNextRBACLevel(currentLevel) {
        const levels = Object.keys(this.rbacLevels).sort((a, b) => this.rbacLevels[a] - this.rbacLevels[b]);
        const currentIndex = levels.indexOf(currentLevel);

        if (currentIndex === -1 || currentIndex === levels.length - 1) {
            return null; // Current level not found or already at highest level
        }

        return levels[currentIndex + 1];
    }

    /**
     * Get documents required for a specific RBAC level
     */
    getDocumentsRequiredForLevel(targetLevel) {
        const requiredDocs = [];

        for (const category of Object.values(this.documentCategories)) {
            for (const doc of Object.values(category)) {
                if (doc.requiredFor.includes(targetLevel) && doc.isRequired) {
                    requiredDocs.push({
                        key: Object.keys(category).find(key => category[key] === doc),
                        ...doc
                    });
                }
            }
        }

        return requiredDocs;
    }

    /**
     * Get pending documents for next RBAC level
     */
    getPendingDocumentsForNextLevel(userLevel) {
        const currentLevel = this.getUserLevelNumber(userLevel);
        const nextLevel = currentLevel + 1;

        const nextLevelName = Object.keys(this.rbacLevels).find(
            level => this.rbacLevels[level] === nextLevel
        );

        if (!nextLevelName) return [];

        return this.getRequiredDocumentsForLevel(nextLevelName);
    }

    /**
     * Get document status for a specific user and document
     */
    getDocumentStatus(userLevel, documentTitle, isSigned, documentState = 'EFFECTIVE') {
        const requiredDocs = this.getRequiredDocumentsForLevel(userLevel);
        const pendingDocs = this.getPendingDocumentsForNextLevel(userLevel);

        // Check if document is required for current level
        const isRequired = requiredDocs.some(doc => doc.title === documentTitle);
        const isPending = pendingDocs.some(doc => doc.title === documentTitle);

        if (documentState === 'EXPIRED' || documentState === 'TERMINATED') {
            return 'EXPIRED';
        }

        if (isRequired && isSigned) {
            return 'SIGNED';
        } else if (isRequired && !isSigned) {
            return 'REQUIRED';
        } else if (isPending && isSigned) {
            return 'SIGNED';
        } else if (isPending && !isSigned) {
            return 'PENDING';
        } else if (!isRequired && !isPending && isSigned) {
            return 'SIGNED';
        } else {
            return 'NOT_REQUIRED';
        }
    }

    /**
     * Get next RBAC level for advancement
     */
    getNextLevel(currentLevel) {
        const currentLevelNumber = this.getUserLevelNumber(currentLevel);
        const nextLevelNumber = currentLevelNumber + 1;

        return Object.keys(this.rbacLevels).find(
            level => this.rbacLevels[level] === nextLevelNumber
        ) || null;
    }

    /**
     * Check if user can advance to next level
     */
    canAdvanceToNextLevel(userLevel, signedDocuments) {
        const requiredDocs = this.getRequiredDocumentsForLevel(userLevel);
        const requiredTitles = requiredDocs.map(doc => doc.title);

        return requiredTitles.every(title => signedDocuments.includes(title));
    }

    /**
     * Get document workflow requirements
     */
    getDocumentWorkflow(documentKey) {
        const workflows = {
            'PPA': {
                steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
                requiredSignatures: ['USER', 'ALICESOLUTIONS'],
                autoAdvance: true
            },
            'MUTUAL_NDA': {
                steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
                requiredSignatures: ['USER', 'ALICESOLUTIONS'],
                autoAdvance: true
            },
            'PTSA': {
                steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
                requiredSignatures: ['USER', 'ALICESOLUTIONS'],
                autoAdvance: true
            },
            'SOBA': {
                steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
                requiredSignatures: ['USER', 'ALICESOLUTIONS'],
                autoAdvance: true
            },
            'IDEA_SUBMISSION': {
                steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
                requiredSignatures: ['USER', 'ALICESOLUTIONS'],
                autoAdvance: false
            },
            'JDA': {
                steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
                requiredSignatures: ['PARTY_A', 'PARTY_B', 'ALICESOLUTIONS'],
                autoAdvance: false
            },
            'PCA': {
                steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
                requiredSignatures: ['PARTICIPANT_1', 'PARTICIPANT_2', 'ALICESOLUTIONS'],
                autoAdvance: false
            }
        };

        return workflows[documentKey] || {
            steps: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SIGNED', 'EFFECTIVE'],
            requiredSignatures: ['USER', 'ALICESOLUTIONS'],
            autoAdvance: true
        };
    }

    /**
     * Get security tier requirements for document access
     */
    getSecurityTierRequirements(documentKey, userLevel) {
        const tierRequirements = {
            'PER_PROJECT_NDA': {
                'CONFIDENTIAL_ACCESS': 'TIER_1',
                'RESTRICTED_ACCESS': 'TIER_2',
                'HIGHLY_RESTRICTED_ACCESS': 'TIER_3'
            }
        };

        return tierRequirements[documentKey]?.[userLevel] || 'TIER_0';
    }

    /**
     * Get compliance requirements for user level
     */
    getComplianceRequirements(userLevel) {
        const requirements = {
            'MEMBER': {
                mfa: true,
                deviceEncryption: true,
                autoLock: 5, // minutes
                vpn: false,
                managedDevice: false
            },
            'SUBSCRIBER': {
                mfa: true,
                deviceEncryption: true,
                autoLock: 5,
                vpn: false,
                managedDevice: false
            },
            'SEAT_HOLDER': {
                mfa: true,
                deviceEncryption: true,
                autoLock: 5,
                vpn: false,
                managedDevice: false
            },
            'CONFIDENTIAL_ACCESS': {
                mfa: true,
                deviceEncryption: true,
                autoLock: 5,
                vpn: true,
                managedDevice: false
            },
            'RESTRICTED_ACCESS': {
                mfa: true,
                deviceEncryption: true,
                autoLock: 5,
                vpn: true,
                managedDevice: true
            },
            'HIGHLY_RESTRICTED_ACCESS': {
                mfa: true,
                deviceEncryption: true,
                autoLock: 5,
                vpn: true,
                managedDevice: true,
                hardwareKeys: true
            }
        };

        return requirements[userLevel] || requirements['MEMBER'];
    }

    /**
     * Get document generation requirements
     */
    getDocumentGenerationRequirements(documentKey) {
        const generationRequirements = {
            'PPA': {
                template: 'Platform_Participation_Agreement.txt',
                variables: ['userName', 'userEmail', 'currentDate'],
                requiredFields: ['userName', 'userEmail']
            },
            'MUTUAL_NDA': {
                template: 'Mutual_Confidentiality_Non_Exfiltration_Agreement.txt',
                variables: ['userName', 'userEmail', 'currentDate'],
                requiredFields: ['userName', 'userEmail']
            },
            'SOBA': {
                template: 'Seat_Order_Billing_Authorization.txt',
                variables: ['subscriberName', 'projectDomain', 'seatsCount', 'effectiveDate', 'billingEmail'],
                requiredFields: ['subscriberName', 'seatsCount', 'billingEmail']
            },
            'PER_PROJECT_NDA': {
                template: 'Per-Project NDA Addendum (Security-Tiered).txt',
                variables: ['projectName', 'projectId', 'securityTier', 'designatedSystems'],
                requiredFields: ['projectName', 'securityTier']
            }
        };

        return generationRequirements[documentKey] || {
            template: null,
            variables: [],
            requiredFields: []
        };
    }
}

module.exports = ComprehensiveRBACLegalMapping;