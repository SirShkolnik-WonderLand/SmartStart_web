/**
 * RBAC Legal Document Mapping Service
 * Maps user levels to required legal documents
 */

class RBACLegalMapping {
    constructor() {
        // Define RBAC levels in order
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

        // Define document requirements by RBAC level
        this.documentRequirements = {
            'GUEST': [],
            'OWLET': [],
            'MEMBER': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement'
            ],
            'NIGHT_WATCHER': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement'
            ],
            'SUBSCRIBER': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)'
            ],
            'WISE_OWL': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)'
            ],
            'SEAT_HOLDER': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement'
            ],
            'SKY_MASTER': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement'
            ],
            'VENTURE_OWNER': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)'
            ],
            'VENTURE_PARTICIPANT': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)',
                'Joint Development Agreement (JDA)'
            ],
            'CONFIDENTIAL_ACCESS': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)',
                'Joint Development Agreement (JDA)',
                'Per-Project NDA Addendum (Security-Tiered)'
            ],
            'RESTRICTED_ACCESS': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)',
                'Joint Development Agreement (JDA)',
                'Per-Project NDA Addendum (Security-Tiered)'
            ],
            'HIGHLY_RESTRICTED_ACCESS': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)',
                'Joint Development Agreement (JDA)',
                'Per-Project NDA Addendum (Security-Tiered)'
            ],
            'BILLING_ADMIN': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)',
                'Joint Development Agreement (JDA)',
                'Per-Project NDA Addendum (Security-Tiered)'
            ],
            'SECURITY_ADMIN': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)',
                'Joint Development Agreement (JDA)',
                'Per-Project NDA Addendum (Security-Tiered)'
            ],
            'LEGAL_ADMIN': [
                'Platform Participation Agreement (PPA)',
                'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
                'Platform Tools Subscription Agreement (PTSA)',
                'Seat Order & Billing Authorization (SOBA)',
                'Idea Submission & Evaluation Agreement',
                'Participant Collaboration Agreement (PCA)',
                'Joint Development Agreement (JDA)',
                'Per-Project NDA Addendum (Security-Tiered)'
            ]
        };
    }

    /**
     * Get user's RBAC level number
     */
    getUserLevelNumber(userLevel) {
        return this.rbacLevels[userLevel] || 0;
    }

    /**
     * Get required documents for user's current level
     */
    getRequiredDocumentsForLevel(userLevel) {
        return this.documentRequirements[userLevel] || [];
    }

    /**
     * Get pending documents for next level
     */
    getPendingDocumentsForNextLevel(userLevel) {
        const currentLevel = this.getUserLevelNumber(userLevel);
        const nextLevel = currentLevel + 1;
        
        // Find the next level name
        const nextLevelName = Object.keys(this.rbacLevels).find(
            level => this.rbacLevels[level] === nextLevel
        );
        
        if (!nextLevelName) return [];
        
        return this.documentRequirements[nextLevelName] || [];
    }

    /**
     * Get all documents user should have access to
     */
    getAllAccessibleDocuments(userLevel) {
        const currentLevel = this.getUserLevelNumber(userLevel);
        const accessibleDocs = [];
        
        // Get all documents for levels up to and including current level
        for (const [level, levelNumber] of Object.entries(this.rbacLevels)) {
            if (levelNumber <= currentLevel) {
                const docs = this.documentRequirements[level] || [];
                accessibleDocs.push(...docs);
            }
        }
        
        // Remove duplicates
        return [...new Set(accessibleDocs)];
    }

    /**
     * Check if user has access to a specific document
     */
    hasAccessToDocument(userLevel, documentTitle) {
        const accessibleDocs = this.getAllAccessibleDocuments(userLevel);
        return accessibleDocs.includes(documentTitle);
    }

    /**
     * Get document status for user
     */
    getDocumentStatus(userLevel, documentTitle, isSigned) {
        const requiredDocs = this.getRequiredDocumentsForLevel(userLevel);
        const pendingDocs = this.getPendingDocumentsForNextLevel(userLevel);
        
        if (requiredDocs.includes(documentTitle)) {
            return isSigned ? 'SIGNED' : 'REQUIRED';
        } else if (pendingDocs.includes(documentTitle)) {
            return isSigned ? 'SIGNED' : 'PENDING';
        } else {
            return isSigned ? 'SIGNED' : 'NOT_REQUIRED';
        }
    }

    /**
     * Get next RBAC level
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
        return requiredDocs.every(doc => signedDocuments.includes(doc));
    }
}

module.exports = RBACLegalMapping;
