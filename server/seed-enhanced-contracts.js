const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Enhanced Contract Templates for AliceSolutions Hub
 * These templates use variables that get substituted by the ContractTemplateEngine
 */
const enhancedContractTemplates = [{
        title: 'Founder Agreement Template - Enhanced',
        type: 'EQUITY_AGREEMENT',
        content: `FOUNDER AGREEMENT

This Founder Agreement (the "Agreement") is entered into on {{CURRENT_DATE}} by and between:

{{ALICESOLUTIONS_LEGAL_NAME}}, a corporation organized under the laws of [Jurisdiction] ("AliceSolutions"), with its principal place of business at {{ALICESOLUTIONS_ADDRESS}};

{{OWNER_NAME}} ("Founder"), an individual with an email address of {{OWNER_EMAIL}} and KYC status of {{OWNER_KYC_STATUS}};

and {{VENTURE_NAME}} (the "Venture"), a project operating under the AliceSolutions Hub umbrella.

1. VENTURE DETAILS
   Venture Name: {{VENTURE_NAME}}
   Venture Purpose: {{VENTURE_PURPOSE}}
   Venture Region: {{VENTURE_REGION}}
   Venture Created: {{VENTURE_CREATED_AT}}

2. EQUITY STRUCTURE
   Founder Equity: {{OWNER_EQUITY_PERCENT}}%
   AliceSolutions Equity: {{ALICE_EQUITY_PERCENT}}%
   Contributor Equity Pool: {{CEP_PERCENT}}%
   Vesting Policy: {{VESTING_POLICY}}

3. FOUNDER RESPONSIBILITIES
   The Founder agrees to:
   - Maintain a minimum trust score of 50
   - Complete all required legal agreements
   - Comply with Hub governance policies
   - Act in the best interest of the Venture

4. LEGAL COMPLIANCE
   This agreement is governed by the laws of {{JURISDICTION}} and is enforceable under the AliceSolutions legal framework.

5. SIGNATURE
   By signing below, the Founder acknowledges and agrees to all terms and conditions outlined in this Agreement.

Founder: {{OWNER_NAME}}
Date: {{CURRENT_DATE}}
Trust Score: {{OWNER_TRUST_SCORE}}

AliceSolutions Representative: [Authorized Signatory]
Date: {{CURRENT_DATE}}`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'Contributor Agreement Template - Enhanced',
        type: 'EMPLOYMENT_CONTRACT',
        content: `CONTRIBUTOR AGREEMENT

This Contributor Agreement (the "Agreement") is entered into on {{CURRENT_DATE}} by and between:

{{VENTURE_NAME}} (the "Venture"), a project operating under the AliceSolutions Hub umbrella;

{{ALICESOLUTIONS_LEGAL_NAME}} ("AliceSolutions"), providing governance and infrastructure;

and [Contributor Name] ("Contributor"), an individual seeking to contribute to the Venture.

1. VENTURE CONTEXT
   Venture Name: {{VENTURE_NAME}}
   Venture Purpose: {{VENTURE_PURPOSE}}
   Venture Region: {{VENTURE_REGION}}
   Venture Owner: {{OWNER_NAME}} ({{OWNER_EMAIL}})

2. CONTRIBUTION TERMS
   The Contributor agrees to:
   - Complete assigned tasks to the best of their ability
   - Maintain confidentiality of venture information
   - Follow Hub governance and compliance policies
   - Accept BUZ tokens as compensation for contributions

3. EQUITY OPPORTUNITY
   Contributors may earn equity from the Contributor Equity Pool ({{CEP_PERCENT}}%) based on:
   - Contribution quality and impact
   - Trust score and reputation
   - Performance reviews and milestones
   - Quarterly equity rebalancing

4. BUZ ECONOMY
   Contributors earn BUZ tokens for:
   - Task completion and approval
   - Skill verification and endorsements
   - Community contributions and support
   - BUZ can be converted to equity quarterly

5. LEGAL COMPLIANCE
   This agreement requires:
   - KYC verification (minimum status: VERIFIED)
   - Device posture compliance
   - MFA authentication
   - Acceptance of IP assignment terms

6. SIGNATURE
   By signing below, the Contributor acknowledges and agrees to all terms and conditions.

Contributor: [Contributor Name]
Date: {{CURRENT_DATE}}
KYC Status: [Must be VERIFIED]

Venture Owner: {{OWNER_NAME}}
Date: {{CURRENT_DATE}}

AliceSolutions Representative: [Authorized Signatory]
Date: {{CURRENT_DATE}}`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'IP Assignment Agreement Template - Enhanced',
        type: 'INTELLECTUAL_PROPERTY',
        content: `INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

This Intellectual Property Assignment Agreement (the "Agreement") is entered into on {{CURRENT_DATE}} by and between:

{{VENTURE_NAME}} (the "Venture"), a project operating under the AliceSolutions Hub umbrella;

{{ALICESOLUTIONS_LEGAL_NAME}} ("AliceSolutions"), providing governance and legal framework;

and [Contributor Name] ("Contributor"), an individual contributing intellectual property to the Venture.

1. VENTURE CONTEXT
   Venture Name: {{VENTURE_NAME}}
   Venture Purpose: {{VENTURE_PURPOSE}}
   Venture Region: {{VENTURE_REGION}}
   Venture Owner: {{OWNER_NAME}}

2. IP ASSIGNMENT
   The Contributor hereby assigns, transfers, and conveys to the Venture:
   - All intellectual property created during contribution
   - All inventions, discoveries, and improvements
   - All copyrights, patents, and trade secrets
   - All related documentation and materials

3. COMPENSATION
   In consideration for IP assignment, the Contributor receives:
   - BUZ tokens for contributions
   - Potential equity from Contributor Equity Pool ({{CEP_PERCENT}}%)
   - Recognition in venture portfolio
   - Future collaboration opportunities

4. LEGAL PROTECTION
   This assignment is:
   - Legally binding and enforceable
   - Governed by {{JURISDICTION}} law
   - Protected under AliceSolutions legal framework
   - Subject to Hub dispute resolution

5. COMPLIANCE REQUIREMENTS
   IP assignment requires:
   - Valid Contributor Agreement
   - KYC verification (VERIFIED status)
   - Task completion and approval
   - No conflicting obligations

6. SIGNATURE
   By signing below, the Contributor confirms complete IP assignment.

Contributor: [Contributor Name]
Date: {{CURRENT_DATE}}
IP Assignment: Complete and Unconditional

Venture Owner: {{OWNER_NAME}}
Date: {{CURRENT_DATE}}

AliceSolutions Representative: [Authorized Signatory]
Date: {{CURRENT_DATE}}`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'NDA Template - Enhanced',
        type: 'CONFIDENTIALITY_AGREEMENT',
        content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "NDA") is entered into on {{CURRENT_DATE}} by and between:

{{VENTURE_NAME}} (the "Venture"), a project operating under the AliceSolutions Hub umbrella;

{{ALICESOLUTIONS_LEGAL_NAME}} ("AliceSolutions"), providing governance and security;

and [Recipient Name] ("Recipient"), an individual or entity receiving confidential information.

1. VENTURE CONTEXT
   Venture Name: {{VENTURE_NAME}}
   Venture Purpose: {{VENTURE_PURPOSE}}
   Venture Region: {{VENTURE_REGION}}
   Venture Owner: {{OWNER_NAME}} ({{OWNER_EMAIL}})

2. CONFIDENTIAL INFORMATION
   The Recipient acknowledges access to confidential information including:
   - Venture business plans and strategies
   - Technical specifications and code
   - Financial data and projections
   - Customer and partner information
   - Any information marked as confidential

3. NON-DISCLOSURE OBLIGATIONS
   The Recipient agrees to:
   - Maintain strict confidentiality
   - Use information only for authorized purposes
   - Implement appropriate security measures
   - Report any security breaches immediately
   - Return or destroy confidential materials upon request

4. SECURITY REQUIREMENTS
   Confidential information must be protected by:
   - MFA authentication
   - Device posture compliance
   - Encrypted storage and transmission
   - Access logging and monitoring
   - Regular security audits

5. LEGAL ENFORCEMENT
   This NDA is:
   - Governed by {{JURISDICTION}} law
   - Enforceable under AliceSolutions legal framework
   - Subject to Hub dispute resolution
   - Binding for the duration of access plus 5 years

6. SIGNATURE
   By signing below, the Recipient acknowledges and agrees to all confidentiality obligations.

Recipient: [Recipient Name]
Date: {{CURRENT_DATE}}
Confidentiality Level: [Specify Level]

Venture Owner: {{OWNER_NAME}}
Date: {{CURRENT_DATE}}

AliceSolutions Representative: [Authorized Signatory]
Date: {{CURRENT_DATE}}`,
        requiresSignature: true,
        complianceRequired: true
    },
    {
        title: 'Equity Split Agreement Template - Enhanced',
        type: 'VESTING_SCHEDULE',
        content: `EQUITY SPLIT AGREEMENT

This Equity Split Agreement (the "Agreement") is entered into on {{CURRENT_DATE}} by and between:

{{VENTURE_NAME}} (the "Venture"), a project operating under the AliceSolutions Hub umbrella;

{{ALICESOLUTIONS_LEGAL_NAME}} ("AliceSolutions"), providing governance and equity framework;

and all equity holders of the Venture.

1. VENTURE CONTEXT
   Venture Name: {{VENTURE_NAME}}
   Venture Purpose: {{VENTURE_PURPOSE}}
   Venture Region: {{VENTURE_REGION}}
   Venture Owner: {{OWNER_NAME}}

2. EQUITY STRUCTURE
   Total Venture Equity: 100%
   Owner Equity: {{OWNER_EQUITY_PERCENT}}% (minimum required)
   AliceSolutions Equity: {{ALICE_EQUITY_PERCENT}}% (maximum cap)
   Contributor Equity Pool: {{CEP_PERCENT}}% (available for distribution)

3. EQUITY ALLOCATION RULES
   a) Owner Requirements:
      - Minimum ownership: 35%
      - Cannot be diluted below 35% without consent
      - Maintains control and decision-making authority

   b) AliceSolutions Stake:
      - Maximum cap: 20%
      - Provides infrastructure and governance
      - Receives equity for services and support

   c) Contributor Pool:
      - Available for performance-based distribution
      - Quarterly rebalancing based on contributions
      - Vesting schedules apply to all allocations

4. VESTING SCHEDULE
   Default vesting policy: {{VESTING_POLICY}}
   - 1-year cliff period
   - Monthly vesting thereafter
   - Early exit forfeits unvested equity
   - Performance milestones can accelerate vesting

5. EQUITY CHANGES
   All equity changes require:
   - Board approval (if policy demands)
   - Cap table validation (Σ = 100%)
   - Legal documentation updates
   - Audit log entries
   - Stakeholder notifications

6. DISPUTE RESOLUTION
   Equity disputes are resolved through:
   - Hub governance framework
   - Evidence-based review process
   - Legal hold on disputed equity
   - Binding arbitration if needed

7. SIGNATURE
   By signing below, all parties acknowledge and agree to the equity structure.

Venture Owner: {{OWNER_NAME}}
Date: {{CURRENT_DATE}}
Equity: {{OWNER_EQUITY_PERCENT}}%

AliceSolutions Representative: [Authorized Signatory]
Date: {{CURRENT_DATE}}
Equity: {{ALICE_EQUITY_PERCENT}}%

[Additional Equity Holders as applicable]
Date: {{CURRENT_DATE}}
Equity: [Specify Percentage]%`,
        requiresSignature: true,
        complianceRequired: true
    }
];

/**
 * Seed enhanced contract templates with variables
 */
async function seedEnhancedContractTemplates() {
    try {
        console.log('🌱 Starting enhanced contract templates seed...');

        for (const template of enhancedContractTemplates) {
            // Check if template already exists (templates have no entityId or projectId)
            const existingTemplate = await prisma.legalDocument.findFirst({
                where: {
                    title: template.title,
                    type: template.type,
                    entityId: null,
                    projectId: null
                }
            });

            if (!existingTemplate) {
                const createdTemplate = await prisma.legalDocument.create({
                    data: {
                        ...template,
                        createdBy: 'system-enhanced-seed',
                        status: 'APPROVED',
                        effectiveDate: new Date(),
                        version: '2.0',
                        entityId: null, // This makes it a template
                        projectId: null
                    }
                });
                console.log(`✅ Created enhanced template: ${createdTemplate.title} (${createdTemplate.type})`);
            } else {
                // Update existing template with enhanced content
                const updatedTemplate = await prisma.legalDocument.update({
                    where: { id: existingTemplate.id },
                    data: {
                        content: template.content,
                        version: '2.0',
                        updatedAt: new Date()
                    }
                });
                console.log(`🔄 Updated existing template: ${updatedTemplate.title} (${updatedTemplate.type})`);
            }
        }

        console.log('🎉 Enhanced contract templates seeding completed successfully!');

        // Display summary
        const templateCount = await prisma.legalDocument.count({
            where: {
                entityId: null,
                projectId: null,
                status: 'APPROVED'
            }
        });

        console.log(`📊 Total approved templates: ${templateCount}`);

    } catch (error) {
        console.error('❌ Enhanced contract templates seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedEnhancedContractTemplates()
        .then(() => {
            console.log('✅ Enhanced contract templates seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Enhanced contract templates seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedEnhancedContractTemplates };