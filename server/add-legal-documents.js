const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Contract file mapping with metadata
const contractFiles = [
    // Core Platform Documents
    {
        filePath: 'server/Contracts/01-core-platform/PPA.txt',
        title: 'Platform Participation Agreement (PPA)',
        legalName: 'AliceSolutions Ventures — Platform Participation Agreement',
        type: 'TERMS_OF_SERVICE',
        category: '01-core-platform',
        rbacLevel: 'MEMBER',
        isRequired: true,
        isTemplate: false,
        version: '1.0',
        description: 'Terms of Membership & Contribution for the Hub - B2B platform agreement'
    },
    {
        filePath: 'server/Contracts/01-core-platform/InternalMutual Confidentiality & Non-Exfiltration Agreement.txt',
        title: 'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
        legalName: 'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
        type: 'CONFIDENTIALITY_AGREEMENT',
        category: '01-core-platform',
        rbacLevel: 'MEMBER',
        isRequired: true,
        isTemplate: false,
        version: '1.0',
        description: 'Mutual confidentiality agreement for internal platform use'
    },

    // Subscription & Billing Documents
    {
        filePath: 'server/Contracts/02-subscription-billing/PLATFORM TOOLS SUBSCRIPTION AGREEMENT (PTSA).txt',
        title: 'Platform Tools Subscription Agreement (PTSA)',
        legalName: 'Platform Tools Subscription Agreement',
        type: 'TERMS_OF_SERVICE',
        category: '02-subscription-billing',
        rbacLevel: 'MEMBER',
        isRequired: true,
        isTemplate: false,
        version: '1.0',
        description: 'Subscription agreement for platform tools and services'
    },
    {
        filePath: 'server/Contracts/02-subscription-billing/SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt',
        title: 'Seat Order & Billing Authorization (SOBA)',
        legalName: 'Seat Order & Billing Authorization',
        type: 'TERMS_OF_SERVICE',
        category: '02-subscription-billing',
        rbacLevel: 'MEMBER',
        isRequired: true,
        isTemplate: false,
        version: '1.0',
        description: 'Seat ordering and billing authorization agreement'
    },

    // Venture Project Documents
    {
        filePath: 'server/Contracts/03-venture-project/IDEA SUBMISSION & EVALUATION AGREEMENT.txt',
        title: 'Idea Submission & Evaluation Agreement',
        legalName: 'Idea Submission & Evaluation Agreement',
        type: 'OTHER',
        category: '03-venture-project',
        rbacLevel: 'MEMBER',
        isRequired: false,
        isTemplate: false,
        version: '1.0',
        description: 'Agreement for submitting and evaluating business ideas'
    },
    {
        filePath: 'server/Contracts/03-venture-project/JOINT DEVELOPMENT AGREEMENT (JDA).txt',
        title: 'Joint Development Agreement (JDA)',
        legalName: 'Joint Development Agreement',
        type: 'PARTNERSHIP_AGREEMENT',
        category: '03-venture-project',
        rbacLevel: 'MEMBER',
        isRequired: false,
        isTemplate: false,
        version: '1.0',
        description: 'Agreement for joint development projects'
    },
    {
        filePath: 'server/Contracts/03-venture-project/PARTICIPANT COLLABORATION AGREEMENT (PCA).txt',
        title: 'Participant Collaboration Agreement (PCA)',
        legalName: 'Participant Collaboration Agreement',
        type: 'PARTNERSHIP_AGREEMENT',
        category: '03-venture-project',
        rbacLevel: 'MEMBER',
        isRequired: false,
        isTemplate: false,
        version: '1.0',
        description: 'Agreement for participant collaboration on projects'
    },

    // Templates
    {
        filePath: 'server/Contracts/08-templates/Per-Project NDA Addendum (Security-Tiered).txt',
        title: 'Per-Project NDA Addendum (Security-Tiered)',
        legalName: 'Per-Project NDA Addendum (Security-Tiered)',
        type: 'CONFIDENTIALITY_AGREEMENT',
        category: '08-templates',
        rbacLevel: 'MEMBER',
        isRequired: false,
        isTemplate: true,
        version: '1.0',
        description: 'Template for per-project NDA addendums with security tiers'
    },
    {
        filePath: 'server/Contracts/templates/Mutual_Confidentiality_Non_Exfiltration_Agreement.txt',
        title: 'Mutual Confidentiality Non-Exfiltration Agreement Template',
        legalName: 'Mutual Confidentiality Non-Exfiltration Agreement',
        type: 'CONFIDENTIALITY_AGREEMENT',
        category: '08-templates',
        rbacLevel: 'MEMBER',
        isRequired: false,
        isTemplate: true,
        version: '1.0',
        description: 'Template for mutual confidentiality agreements'
    },
    {
        filePath: 'server/Contracts/templates/Platform_Participation_Agreement.txt',
        title: 'Platform Participation Agreement Template',
        legalName: 'Platform Participation Agreement',
        type: 'TERMS_OF_SERVICE',
        category: '08-templates',
        rbacLevel: 'MEMBER',
        isRequired: false,
        isTemplate: true,
        version: '1.0',
        description: 'Template for platform participation agreements'
    },
    {
        filePath: 'server/Contracts/templates/Seat_Order_Billing_Authorization.txt',
        title: 'Seat Order Billing Authorization Template',
        legalName: 'Seat Order Billing Authorization',
        type: 'TERMS_OF_SERVICE',
        category: '08-templates',
        rbacLevel: 'MEMBER',
        isRequired: false,
        isTemplate: true,
        version: '1.0',
        description: 'Template for seat order and billing authorization'
    }
];

async function addLegalDocuments() {
    console.log('🌱 Adding legal documents to database...');

    try {
        // Debug: Check current document count
        const currentCount = await prisma.legalDocument.count();
        console.log(`📊 Current document count: ${currentCount}`);

        // Debug: List existing documents
        const existingDocs = await prisma.legalDocument.findMany({
            select: { title: true }
        });
        console.log(`📋 Existing documents:`, existingDocs.map(d => d.title));
        // Create legal documents from contract files
        for (const contract of contractFiles) {
            try {
                // Check if document already exists
                const existing = await prisma.legalDocument.findFirst({
                    where: { title: contract.title }
                });

                if (existing) {
                    console.log(`⏭️  Skipping existing: ${contract.title}`);
                    continue;
                }

                console.log(`🔄 Creating new document: ${contract.title}`);

                // Read the contract file content
                const fullPath = path.join(process.cwd(), '..', contract.filePath);
                const content = fs.readFileSync(fullPath, 'utf8');

                // Generate a unique ID
                const id = `doc-${crypto.randomBytes(8).toString('hex')}`;

                // Create the legal document
                const legalDoc = await prisma.legalDocument.create({
                    data: {
                        id: id,
                        title: contract.title,
                        type: contract.type,
                        content: content,
                        version: contract.version,
                        status: 'DRAFT',
                        requiresSignature: contract.isRequired,
                        complianceRequired: contract.isRequired,
                        createdBy: 'system-seed', // System user
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });

                console.log(`✅ Created: ${contract.title} (${contract.category})`);

            } catch (error) {
                console.error(`❌ Error creating ${contract.title}:`, error.message);
            }
        }

        // Get final counts
        const totalDocs = await prisma.legalDocument.count();
        const totalSignatures = await prisma.legalDocumentSignature.count();

        console.log('\n🎉 Legal Documents Addition Complete!');
        console.log(`📄 Total Legal Documents: ${totalDocs}`);
        console.log(`✍️  Total Signatures: ${totalSignatures}`);

    } catch (error) {
        console.error('❌ Error during addition:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the addition
addLegalDocuments();