const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================================
// LEGAL PACK HELPER FUNCTIONS
// ============================================================================

/**
 * Create legal packs based on user role and venture requirements
 */
async function createLegalPacksForUser(userId, userRole, userVentures, allDocuments) {
    const packs = [];

    // 1. REGISTRATION & ONBOARDING PACK
    if (userRole === 'GUEST' || userRole === 'MEMBER') {
        packs.push({
            id: 'registration-onboarding',
            name: 'Registration & Onboarding Pack',
            description: 'Core legal documents required for platform membership',
            category: 'ONBOARDING',
            priority: 'HIGH',
            required: true,
            status: await getPackStatus('registration-onboarding', userId),
            documents: [
                {
                    id: 'ppa',
                    title: 'Platform Participation Agreement (PPA)',
                    type: 'TERMS_OF_SERVICE',
                    description: 'Core terms and conditions for platform membership',
                    required: true,
                    status: await getDocumentStatus('ppa', userId),
                    content: getPPAContent()
                },
                {
                    id: 'e-signature-consent',
                    title: 'E-Signature Consent',
                    type: 'TERMS_OF_SERVICE',
                    description: 'Legal recognition of electronic signatures',
                    required: true,
                    status: await getDocumentStatus('e-signature-consent', userId),
                    content: getESignatureConsentContent()
                },
                {
                    id: 'privacy-casl',
                    title: 'Privacy Notice + CASL Consent',
                    type: 'PRIVACY_POLICY',
                    description: 'Canadian privacy compliance',
                    required: true,
                    status: await getDocumentStatus('privacy-casl', userId),
                    content: getPrivacyCASLContent()
                },
                {
                    id: 'mutual-nda',
                    title: 'Mutual Confidentiality & Non-Exfiltration Agreement',
                    type: 'CONFIDENTIALITY_AGREEMENT',
                    description: 'Confidentiality obligations and data protection',
                    required: true,
                    status: await getDocumentStatus('mutual-nda', userId),
                    content: getMutualNDAContent()
                }
            ]
        });
    }

    // 2. VENTURE OWNER PACK
    if (userVentures.some(v => v.ownerId === userId)) {
        const ventureOwnerPack = {
            id: 'venture-owner',
            name: 'Venture Owner Pack',
            description: 'Legal documents required for venture ownership',
            category: 'VENTURE_MANAGEMENT',
            priority: 'HIGH',
            required: true,
            status: await getPackStatus('venture-owner', userId),
            documents: []
        };

        // Add venture-specific documents
        for (const venture of userVentures.filter(v => v.ownerId === userId)) {
            ventureOwnerPack.documents.push({
                id: `idea-submission-${venture.id}`,
                title: `Idea Submission & Evaluation Agreement - ${venture.name}`,
                type: 'INTELLECTUAL_PROPERTY',
                description: 'IP protection for submitted ideas',
                required: true,
                ventureId: venture.id,
                ventureName: venture.name,
                status: await getDocumentStatus(`idea-submission-${venture.id}`, userId),
                content: getIdeaSubmissionContent(venture)
            });

            ventureOwnerPack.documents.push({
                id: `venture-owner-${venture.id}`,
                title: `Venture Owner Agreement - ${venture.name}`,
                type: 'PARTNERSHIP_AGREEMENT',
                description: 'Ownership and responsibility terms',
                required: true,
                ventureId: venture.id,
                ventureName: venture.name,
                status: await getDocumentStatus(`venture-owner-${venture.id}`, userId),
                content: getVentureOwnerContent(venture)
            });

            ventureOwnerPack.documents.push({
                id: `per-project-nda-${venture.id}`,
                title: `Per-Project NDA Addendum - ${venture.name}`,
                type: 'CONFIDENTIALITY_AGREEMENT',
                description: 'Project-specific confidentiality',
                required: true,
                ventureId: venture.id,
                ventureName: venture.name,
                status: await getDocumentStatus(`per-project-nda-${venture.id}`, userId),
                content: getPerProjectNDAContent(venture)
            });
        }

        packs.push(ventureOwnerPack);
    }

    // 3. VENTURE PARTICIPANT PACK
    if (userVentures.some(v => v.teamMembers.some(tm => tm.userId === userId))) {
        const ventureParticipantPack = {
            id: 'venture-participant',
            name: 'Venture Participant Pack',
            description: 'Legal documents required for team participation',
            category: 'TEAM_COLLABORATION',
            priority: 'HIGH',
            required: true,
            status: await getPackStatus('venture-participant', userId),
            documents: []
        };

        // Add participant documents for each venture
        for (const venture of userVentures.filter(v => v.teamMembers.some(tm => tm.userId === userId))) {
            ventureParticipantPack.documents.push({
                id: `pca-${venture.id}`,
                title: `Participant Collaboration Agreement - ${venture.name}`,
                type: 'PARTNERSHIP_AGREEMENT',
                description: 'Team collaboration terms',
                required: true,
                ventureId: venture.id,
                ventureName: venture.name,
                status: await getDocumentStatus(`pca-${venture.id}`, userId),
                content: getPCAContent(venture)
            });

            ventureParticipantPack.documents.push({
                id: `ip-assignment-${venture.id}`,
                title: `IP Assignment Agreement - ${venture.name}`,
                type: 'INTELLECTUAL_PROPERTY',
                description: 'Work-for-hire IP assignment',
                required: true,
                ventureId: venture.id,
                ventureName: venture.name,
                status: await getDocumentStatus(`ip-assignment-${venture.id}`, userId),
                content: getIPAssignmentContent(venture)
            });
        }

        packs.push(ventureParticipantPack);
    }

    // 4. SUBSCRIPTION PACK (if user has paid subscription)
    if (userRole === 'SUBSCRIBER' || userRole === 'SEAT_HOLDER') {
        packs.push({
            id: 'subscription',
            name: 'Subscription Pack',
            description: 'Legal documents for paid subscription features',
            category: 'SUBSCRIPTION',
            priority: 'MEDIUM',
            required: true,
            status: await getPackStatus('subscription', userId),
            documents: [
                {
                    id: 'ptsa',
                    title: 'Platform Tools Subscription Agreement (PTSA)',
                    type: 'TERMS_OF_SERVICE',
                    description: 'Subscription terms and billing',
                    required: true,
                    status: await getDocumentStatus('ptsa', userId),
                    content: getPTSAContent()
                },
                {
                    id: 'soba',
                    title: 'Seat Order & Billing Authorization (SOBA)',
                    type: 'TERMS_OF_SERVICE',
                    description: 'Seat provisioning and billing authorization',
                    required: true,
                    status: await getDocumentStatus('soba', userId),
                    content: getSOBAContent()
                }
            ]
        });
    }

    // 5. EXISTING DOCUMENTS PACK
    if (allDocuments.length > 0) {
        packs.push({
            id: 'existing-documents',
            name: 'Existing Documents',
            description: 'Previously created legal documents',
            category: 'EXISTING',
            priority: 'LOW',
            required: false,
            status: 'ACTIVE',
            documents: allDocuments.map(doc => ({
                id: doc.id,
                title: doc.title,
                type: doc.type,
                description: `Version ${doc.version} - ${doc.status}`,
                required: doc.complianceRequired,
                status: doc.status.toLowerCase(),
                content: doc.content,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                signatureCount: doc.signatures.length,
                signatures: doc.signatures
            }))
        });
    }

    return packs;
}

/**
 * Get pack status
 */
async function getPackStatus(packId, userId) {
    // For now, return a default status
    // In a real implementation, this would check database for signatures
    return 'PENDING';
}

/**
 * Get document status
 */
async function getDocumentStatus(docId, userId) {
    // For now, return a default status
    // In a real implementation, this would check database for signatures
    return 'pending';
}

// ============================================================================
// DOCUMENT TEMPLATES
// ============================================================================

function getPPAContent() {
    return `PLATFORM PARTICIPATION AGREEMENT

This Platform Participation Agreement ("Agreement") governs your use of the SmartStart platform.

1. ACCEPTANCE OF TERMS
By accessing or using the SmartStart platform, you agree to be bound by this Agreement.

2. ACCOUNT REQUIREMENTS
- Individual account required (no credential sharing)
- MFA mandatory for all non-public content access
- Device posture checks for sensitive projects

3. INTELLECTUAL PROPERTY
- You retain ownership of your background IP
- Platform IP remains with AliceSolutions
- Work-for-hire assignments as specified

4. LIABILITY LIMITATIONS
- Platform provided "as is"
- Limited liability for indirect damages
- Indemnification requirements

This agreement is effective upon acceptance and continues until terminated.`;
}

function getESignatureConsentContent() {
    return `E-SIGNATURE CONSENT

By signing this document electronically, you consent to the use of electronic signatures in accordance with Ontario's Electronic Commerce Act.

1. ELECTRONIC SIGNATURE CONSENT
You agree that electronic signatures have the same legal effect as handwritten signatures.

2. SIGNATURE REQUIREMENTS
- Digital signature with timestamp
- IP address and user agent logging
- Cryptographic hash verification

3. LEGAL RECOGNITION
Electronic signatures are legally recognized in Ontario, Canada and have the same force and effect as handwritten signatures.

4. AUDIT TRAIL
All electronic signatures are recorded with complete audit trail including timestamp, IP address, and user identification.`;
}

function getPrivacyCASLContent() {
    return `PRIVACY NOTICE & CASL CONSENT

This notice describes how we collect, use, and protect your personal information in compliance with Canadian privacy laws.

1. INFORMATION COLLECTION
We collect information you provide directly, such as:
- Account information (name, email, contact details)
- Venture and project information
- Communication records

2. USE OF INFORMATION
We use your information to:
- Provide platform services
- Communicate about your ventures
- Improve our services
- Comply with legal obligations

3. CASL COMPLIANCE
Under Canada's Anti-Spam Legislation (CASL):
- We only send commercial electronic messages with consent
- You can unsubscribe at any time
- We identify ourselves in all communications

4. DATA PROTECTION
- Encryption at rest and in transit
- Access controls and monitoring
- Regular security assessments
- Breach notification procedures`;
}

function getMutualNDAContent() {
    return `MUTUAL CONFIDENTIALITY & NON-EXFILTRATION AGREEMENT

This agreement establishes confidentiality obligations between all platform participants.

1. CONFIDENTIAL INFORMATION
Confidential information includes:
- Venture ideas and business plans
- Technical specifications and code
- Financial information and projections
- Customer and partner information
- Any information marked as confidential

2. NON-DISCLOSURE OBLIGATIONS
You agree to:
- Keep all confidential information strictly confidential
- Not disclose to third parties without written consent
- Use information only for platform purposes
- Return or destroy information upon request

3. NON-EXFILTRATION REQUIREMENTS
- No uploading confidential data to external AI/LLM tools
- No training on platform data
- No cross-tenant data reuse
- Designated systems requirements

4. SURVIVAL PERIOD
Confidentiality obligations survive for 5 years from last access to confidential information.`;
}

function getIdeaSubmissionContent(venture) {
    return `IDEA SUBMISSION & EVALUATION AGREEMENT

Venture: ${venture.name}
Owner: ${venture.owner.name}
Date: ${new Date().toLocaleDateString()}

This agreement governs the submission and evaluation of your venture idea on the SmartStart platform.

1. IDEA SUBMISSION
You are submitting your venture idea "${venture.name}" for evaluation and potential development on the platform.

2. INTELLECTUAL PROPERTY PROTECTION
- Your background IP remains yours
- Platform evaluation does not transfer ownership
- Confidentiality protections apply
- No public disclosure without consent

3. EVALUATION PROCESS
- Internal evaluation by platform team
- Potential for community feedback
- No guarantee of development
- Evaluation results remain confidential

4. DEVELOPMENT RIGHTS
If selected for development:
- Joint development agreement required
- IP assignment and licensing terms
- Equity and vesting arrangements
- Ongoing collaboration terms

This agreement protects your intellectual property while enabling platform evaluation and potential development.`;
}

function getVentureOwnerContent(venture) {
    return `VENTURE OWNER AGREEMENT

Venture: ${venture.name}
Owner: ${venture.owner.name}
Date: ${new Date().toLocaleDateString()}

This agreement establishes your rights and responsibilities as a venture owner on the SmartStart platform.

1. OWNERSHIP RIGHTS
As venture owner, you have:
- Primary decision-making authority
- Equity ownership as specified
- Access to all venture information
- Right to add/remove team members

2. RESPONSIBILITIES
You are responsible for:
- Venture strategy and direction
- Team leadership and management
- Legal and regulatory compliance
- Financial oversight and reporting

3. EQUITY FRAMEWORK
- Owner equity: As specified in equity framework
- Platform equity: As per platform terms
- Contributor equity: As per contribution agreements
- Vesting schedule: As specified

4. TERMINATION
This agreement continues until:
- Venture is completed or terminated
- Ownership is transferred
- Platform participation ends

Your role as venture owner comes with both rights and responsibilities for the success of your venture.`;
}

function getPerProjectNDAContent(venture) {
    return `PER-PROJECT NDA ADDENDUM

Venture: ${venture.name}
Security Tier: 1 (Confidential)
Date: ${new Date().toLocaleDateString()}

This addendum establishes project-specific confidentiality requirements for "${venture.name}".

1. PROJECT CLASSIFICATION
This venture is classified as Security Tier 1 (Confidential) requiring:
- Device encryption and auto-lock (≤5 min)
- MFA required for access
- Local cache allowed if encrypted
- 90-day access expiry

2. CONFIDENTIAL INFORMATION
Project-specific confidential information includes:
- Venture business model and strategy
- Technical specifications and code
- Financial projections and data
- Customer and partner information
- Any information marked as confidential

3. ACCESS CONTROLS
- Role-based access control (RBAC)
- Regular access reviews (30-90 days)
- Audit logging and monitoring
- Incident reporting requirements

4. DATA HANDLING
- Encryption at rest and in transit
- Secure data transmission only
- No unauthorized data export
- Regular security assessments

This addendum supplements the main confidentiality agreement with project-specific requirements.`;
}

function getPCAContent(venture) {
    return `PARTICIPANT COLLABORATION AGREEMENT

Venture: ${venture.name}
Date: ${new Date().toLocaleDateString()}

This agreement governs your participation as a team member in the "${venture.name}" venture.

1. PARTICIPATION TERMS
As a venture participant, you agree to:
- Contribute your skills and expertise
- Follow venture guidelines and processes
- Maintain confidentiality requirements
- Collaborate effectively with team members

2. CONTRIBUTION TRACKING
Your contributions will be tracked for:
- Performance evaluation
- Equity allocation
- Recognition and rewards
- Portfolio development

3. INTELLECTUAL PROPERTY
- Background IP remains yours
- Work-for-hire assignments as specified
- Joint IP ownership as agreed
- Open source compliance requirements

4. TEAM COLLABORATION
- Respectful communication required
- Regular progress updates
- Conflict resolution procedures
- Team decision-making processes

Your participation in this venture is valuable and this agreement ensures fair collaboration.`;
}

function getIPAssignmentContent(venture) {
    return `IP ASSIGNMENT AGREEMENT

Venture: ${venture.name}
Date: ${new Date().toLocaleDateString()}

This agreement governs the assignment of intellectual property rights for work performed on the "${venture.name}" venture.

1. WORK-FOR-HIRE ASSIGNMENT
Work performed as part of this venture is considered work-for-hire and assigned to the venture entity upon acceptance.

2. BACKGROUND IP
You retain ownership of your background IP, including:
- Pre-existing inventions and ideas
- Open source contributions
- Personal projects unrelated to venture
- Third-party IP with proper licenses

3. FOREGROUND IP
Foreground IP created for this venture includes:
- New inventions and innovations
- Code and technical solutions
- Business processes and methods
- Documentation and materials

4. ASSIGNMENT TERMS
- Automatic assignment upon creation
- Exclusive licensing for venture use
- Moral rights waivers as required
- Conflict of interest disclosures

This agreement ensures clear IP ownership for venture development.`;
}

function getPTSAContent() {
    return `PLATFORM TOOLS SUBSCRIPTION AGREEMENT

This agreement governs your subscription to premium platform features and tools.

1. SUBSCRIPTION TERMS
- Monthly or annual billing as selected
- Auto-renewal unless cancelled
- Grace period for payment issues
- Service level commitments

2. PREMIUM FEATURES
Subscription includes access to:
- Advanced analytics and reporting
- Priority support and assistance
- Enhanced collaboration tools
- Additional storage and bandwidth

3. BILLING AND PAYMENT
- Secure payment processing
- Invoice and receipt generation
- Refund policy as specified
- Price changes with notice

4. TERMINATION
- Cancel anytime with notice
- Service continues until period end
- Data export upon termination
- Refund policy applies

Your subscription enables enhanced platform capabilities for your ventures.`;
}

function getSOBAContent() {
    return `SEAT ORDER & BILLING AUTHORIZATION

This agreement authorizes billing for additional platform seats and team members.

1. SEAT PROVISIONING
- Additional seats for team members
- Role-based access control
- User management capabilities
- Seat utilization tracking

2. BILLING AUTHORIZATION
- Per-seat monthly billing
- Automatic seat provisioning
- Usage-based adjustments
- Invoice generation and delivery

3. USER MANAGEMENT
- Add/remove team members
- Role assignment and permissions
- Access control and monitoring
- Compliance requirements

4. TERMS AND CONDITIONS
- Seat minimums and maximums
- Billing cycles and terms
- Cancellation procedures
- Data handling requirements

This authorization enables team expansion and collaboration on the platform.`;
}

module.exports = {
    createLegalPacksForUser,
    getPackStatus,
    getDocumentStatus
};
