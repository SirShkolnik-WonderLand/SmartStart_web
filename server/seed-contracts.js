const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Sample contract templates based on AliceSolutions blueprint
const contractTemplates = [
    {
        title: 'Founder Agreement Template',
        type: 'EQUITY_AGREEMENT',
        content: `FOUNDER AGREEMENT

This Founder Agreement (the "Agreement") is entered into as of [DATE] by and between:

[FOUNDER NAME] ("Founder") and [VENTURE NAME] ("Venture")

1. EQUITY ALLOCATION
   - Founder shall receive [X]% equity in the Venture
   - Minimum founder equity: 35% (enforced by AliceSolutions Hub)
   - Vesting schedule: 4-year vest with 1-year cliff

2. CONTRIBUTION REQUIREMENTS
   - Founder must maintain active involvement
   - Minimum time commitment: 20+ hours per week
   - Performance metrics will be reviewed quarterly

3. ALICESOLUTIONS STAKE
   - AliceSolutions may hold up to 20% equity
   - Provides infrastructure, legal, and compliance support
   - Governance and board oversight

4. EQUITY ADJUSTMENTS
   - Quarterly rebalancing based on contribution scores
   - Performance-based adjustments within CEP framework
   - Dispute resolution through AliceSolutions governance

5. LEGAL COMPLIANCE
   - Subject to AliceSolutions Hub legal framework
   - WORM audit logging for all equity changes
   - Compliance with regulatory requirements

This agreement is governed by the laws of [JURISDICTION] and subject to the AliceSolutions Hub governance framework.`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'Contributor Agreement Template',
        type: 'EMPLOYMENT_CONTRACT',
        content: `CONTRIBUTOR AGREEMENT

This Contributor Agreement (the "Agreement") is entered into as of [DATE] by and between:

[CONTRIBUTOR NAME] ("Contributor") and [VENTURE NAME] ("Venture")

1. ROLE AND RESPONSIBILITIES
   - Position: [ROLE TITLE]
   - Department: [DEPARTMENT]
   - Reporting to: [MANAGER NAME]
   - Expected contribution type: [CODE/DESIGN/OPS/BIZDEV]

2. COMPENSATION STRUCTURE
   - Base BUZ tokens: [X] BUZ per completed task
   - Equity potential: Up to [X]% from Contributor Equity Pool (CEP)
   - Performance multipliers: Impact × Quality × Timeliness

3. CONTRIBUTION SCORING
   - Task completion with artifact hashes
   - Peer review and quality assessment
   - Impact and effort evaluation
   - Quarterly performance reviews

4. EQUITY VESTING
   - BUZ to equity conversion quarterly
   - Vesting schedule: 4-year vest with 1-year cliff
   - Performance-based acceleration possible

5. INTELLECTUAL PROPERTY
   - All work product assigned to Venture
   - IP protection and confidentiality
   - Non-compete and non-solicitation terms

6. LEGAL COMPLIANCE
   - KYC verification required
   - Device posture compliance mandatory
   - Subject to AliceSolutions governance

This agreement is governed by the laws of [JURISDICTION] and subject to the AliceSolutions Hub legal framework.`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'IP Assignment Agreement Template',
        type: 'INTELLECTUAL_PROPERTY',
        content: `INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

This Intellectual Property Assignment Agreement (the "Agreement") is entered into as of [DATE] by and between:

[CONTRIBUTOR NAME] ("Assignor") and [VENTURE NAME] ("Assignee")

1. ASSIGNMENT OF INTELLECTUAL PROPERTY
   - Assignor hereby assigns to Assignee all right, title, and interest in and to any and all intellectual property created, developed, or conceived by Assignor during the term of engagement with Assignee
   - This includes but is not limited to: inventions, patents, copyrights, trade secrets, know-how, and any other intellectual property rights

2. SCOPE OF ASSIGNMENT
   - All work product created in connection with Assignee's business
   - Any improvements or modifications to existing technology
   - Related documentation, specifications, and materials
   - All moral rights and related rights

3. CONSIDERATION
   - BUZ token compensation for contributions
   - Potential equity participation in Venture
   - Professional development and networking opportunities
   - Access to AliceSolutions Hub infrastructure

4. CONFIDENTIALITY OBLIGATIONS
   - Maintain strict confidentiality of all proprietary information
   - Non-disclosure of trade secrets and business methods
   - Return of all confidential materials upon termination
   - Continuing obligations post-engagement

5. REPRESENTATIONS AND WARRANTIES
   - Assignor has full right and authority to assign
   - No conflicting obligations or third-party rights
   - Original work product, not copied from others
   - Compliance with applicable laws and regulations

6. LEGAL FRAMEWORK
   - Subject to AliceSolutions Hub governance
   - WORM audit logging for all IP assignments
   - Dispute resolution through Hub framework
   - Governing law: [JURISDICTION]

This agreement ensures proper IP protection and aligns with the AliceSolutions Hub legal compliance framework.`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'Confidentiality Agreement Template',
        type: 'CONFIDENTIALITY_AGREEMENT',
        content: `CONFIDENTIALITY AGREEMENT

This Confidentiality Agreement (the "Agreement") is entered into as of [DATE] by and between:

[PARTY NAME] ("Receiving Party") and [VENTURE NAME] ("Disclosing Party")

1. DEFINITION OF CONFIDENTIAL INFORMATION
   - All non-public information disclosed by Disclosing Party
   - Business plans, financial data, customer lists
   - Technical specifications and trade secrets
   - Strategic initiatives and market research
   - Any information marked as confidential

2. OBLIGATIONS OF RECEIVING PARTY
   - Maintain strict confidentiality of all disclosed information
   - Use confidential information solely for authorized purposes
   - Implement reasonable security measures
   - Limit access to authorized personnel only
   - No reproduction or distribution without permission

3. PERMITTED DISCLOSURES
   - Required by law or court order
   - With prior written consent of Disclosing Party
   - To authorized representatives under similar obligations
   - Information already publicly available

4. DURATION OF OBLIGATIONS
   - Confidentiality obligations survive termination
   - Minimum duration: 5 years from disclosure
   - Trade secrets: perpetual protection
   - Return or destruction of materials upon request

5. REMEDIES FOR BREACH
   - Injunctive relief and specific performance
   - Monetary damages for actual losses
   - Attorney fees and costs
   - Criminal penalties if applicable

6. ALICESOLUTIONS HUB COMPLIANCE
   - Subject to Hub governance framework
   - WORM audit logging for all disclosures
   - Compliance monitoring and reporting
   - Dispute resolution through Hub processes

This agreement ensures proper protection of confidential information within the AliceSolutions Hub ecosystem.`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'Vesting Schedule Template',
        type: 'VESTING_SCHEDULE',
        content: `EQUITY VESTING SCHEDULE

This Equity Vesting Schedule (the "Schedule") is established as of [DATE] for:

[PARTICIPANT NAME] ("Participant") in [VENTURE NAME] ("Venture")

1. VESTING STRUCTURE
   - Total equity granted: [X]%
   - Vesting period: 4 years
   - Cliff period: 1 year
   - Vesting frequency: Monthly

2. VESTING SCHEDULE
   - Year 1: 0% (cliff period)
   - Year 2: 25% (first 25% vests)
   - Year 3: 50% (additional 25% vests)
   - Year 4: 75% (additional 25% vests)
   - Year 5: 100% (final 25% vests)

3. ACCELERATION EVENTS
   - Change of control: 100% immediate vesting
   - IPO: 50% acceleration
   - Performance milestones: Up to 25% acceleration
   - Board discretion: Additional acceleration possible

4. FORFEITURE PROVISIONS
   - Termination for cause: 100% forfeiture
   - Voluntary resignation: No acceleration
   - Death or disability: 100% acceleration
   - Retirement after 3+ years: 50% acceleration

5. PERFORMANCE METRICS
   - Contribution score requirements
   - Quarterly performance reviews
   - BUZ token earning thresholds
   - Peer review and feedback

6. ALICESOLUTIONS HUB INTEGRATION
   - Automated vesting calculations
   - WORM audit logging for all changes
   - Board approval for modifications
   - Compliance monitoring and reporting

This schedule is subject to the AliceSolutions Hub governance framework and may be modified only with proper board approval.`,
        requiresSignature: true,
        complianceRequired: true
    }
];

async function seedContractTemplates() {
    try {
        console.log('🌱 Starting contract templates seed...');

        // Create contract templates
        for (const template of contractTemplates) {
            const existingTemplate = await prisma.legalDocument.findFirst({
                where: {
                    title: template.title,
                    type: template.type
                }
            });

            if (!existingTemplate) {
                const createdTemplate = await prisma.legalDocument.create({
                    data: {
                        ...template,
                        createdBy: 'system-seed',
                        status: 'APPROVED',
                        effectiveDate: new Date(),
                        version: '1.0'
                    }
                });

                console.log(`✅ Created template: ${createdTemplate.title} (${createdTemplate.type})`);
            } else {
                console.log(`⏭️  Template already exists: ${existingTemplate.title}`);
            }
        }

        console.log('🎉 Contract templates seeding completed successfully!');

        // Display summary
        const totalTemplates = await prisma.legalDocument.count({
            where: { status: 'APPROVED' }
        });

        const totalContracts = await prisma.legalDocument.count();
        const totalSignatures = await prisma.legalDocumentSignature.count();

        console.log('\n📊 Contracts System Summary:');
        console.log(`   • Approved Templates: ${totalTemplates}`);
        console.log(`   • Total Contracts: ${totalContracts}`);
        console.log(`   • Total Signatures: ${totalSignatures}`);

    } catch (error) {
        console.error('❌ Contract templates seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run seeding if called directly
if (require.main === module) {
    seedContractTemplates()
        .then(() => {
            console.log('✅ Contract templates seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Contract templates seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedContractTemplates };
