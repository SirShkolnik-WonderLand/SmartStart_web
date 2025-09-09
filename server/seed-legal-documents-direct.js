const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Direct document creation without file dependencies
const documents = [
    {
        id: 'doc-ppa',
        title: 'Platform Participation Agreement (PPA)',
        type: 'TERMS_OF_SERVICE',
        content: 'Platform Participation Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'MEMBER'
    },
    {
        id: 'doc-esca',
        title: 'Electronic Signature & Consent Agreement',
        type: 'TERMS_OF_SERVICE',
        content: 'Electronic Signature & Consent Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'MEMBER'
    },
    {
        id: 'doc-pna',
        title: 'Privacy Notice & Acknowledgment',
        type: 'PRIVACY_POLICY',
        content: 'Privacy Notice & Acknowledgment content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'MEMBER'
    },
    {
        id: 'doc-mnda',
        title: 'Internal Mutual Confidentiality & Non-Exfiltration Agreement',
        type: 'CONFIDENTIALITY_AGREEMENT',
        content: 'Internal Mutual Confidentiality & Non-Exfiltration Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'MEMBER'
    },
    {
        id: 'doc-sta',
        title: 'Security & Tooling Acknowledgment',
        type: 'TERMS_OF_SERVICE',
        content: 'Security & Tooling Acknowledgment content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'MEMBER'
    },
    {
        id: 'doc-ptsa',
        title: 'Platform Tools Subscription Agreement (PTSA)',
        type: 'TERMS_OF_SERVICE',
        content: 'Platform Tools Subscription Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'SUBSCRIBER'
    },
    {
        id: 'doc-soba',
        title: 'Seat Order & Billing Authorization (SOBA)',
        type: 'TERMS_OF_SERVICE',
        content: 'Seat Order & Billing Authorization content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'SUBSCRIBER'
    },
    {
        id: 'doc-soba-update',
        title: 'SOBA Update & Team Collaboration',
        type: 'TERMS_OF_SERVICE',
        content: 'SOBA Update & Team Collaboration content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'SEAT_HOLDER'
    },
    {
        id: 'doc-team-collab',
        title: 'Team Collaboration Agreement',
        type: 'TERMS_OF_SERVICE',
        content: 'Team Collaboration Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'SEAT_HOLDER'
    },
    {
        id: 'doc-isea',
        title: 'Idea Submission & Evaluation Agreement',
        type: 'TERMS_OF_SERVICE',
        content: 'Idea Submission & Evaluation Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'VENTURE_OWNER'
    },
    {
        id: 'doc-voa',
        title: 'Venture Owner Agreement',
        type: 'TERMS_OF_SERVICE',
        content: 'Venture Owner Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'VENTURE_OWNER'
    },
    {
        id: 'doc-ppna',
        title: 'Per-Project NDA Addendum (Security-Tiered)',
        type: 'CONFIDENTIALITY_AGREEMENT',
        content: 'Per-Project NDA Addendum content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'VENTURE_OWNER'
    },
    {
        id: 'doc-pca',
        title: 'Participant Collaboration Agreement (PCA)',
        type: 'TERMS_OF_SERVICE',
        content: 'Participant Collaboration Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'VENTURE_PARTICIPANT'
    },
    {
        id: 'doc-iaa',
        title: 'IP Assignment Agreement',
        type: 'INTELLECTUAL_PROPERTY',
        content: 'IP Assignment Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'VENTURE_PARTICIPANT'
    },
    {
        id: 'doc-jda',
        title: 'Joint Development Agreement (JDA)',
        type: 'TERMS_OF_SERVICE',
        content: 'Joint Development Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'EXTERNAL_PARTNER'
    },
    {
        id: 'doc-mutual-nda',
        title: 'Mutual NDA',
        type: 'CONFIDENTIALITY_AGREEMENT',
        content: 'Mutual NDA content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'EXTERNAL_PARTNER'
    },
    {
        id: 'doc-dpa',
        title: 'Data Processing Agreement',
        type: 'PRIVACY_POLICY',
        content: 'Data Processing Agreement content...',
        version: '1.0',
        status: 'EFFECTIVE',
        requiresSignature: true,
        complianceRequired: true,
        rbacLevel: 'EXTERNAL_PARTNER'
    }
];

async function seedLegalDocumentsDirect() {
    console.log('🌱 Starting direct legal documents seeding...');

    try {
        // Clear existing legal documents (but preserve signed ones)
        console.log('🗑️  Clearing existing documents...');
        const existingDocs = await prisma.legalDocument.findMany({
            where: {
                NOT: {
                    id: { in: ['cmf9ys85p0013na2etlh6r2x7', 'cmf9ys1l00011na2e6yc4v9gu', 'cmf9yru9i000zna2e36j0pecs'] }
                }
            }
        });

        if (existingDocs.length > 0) {
            console.log(`🗑️  Removing ${existingDocs.length} existing documents...`);
            await prisma.legalDocument.deleteMany({
                where: {
                    NOT: {
                        id: { in: ['cmf9ys85p0013na2etlh6r2x7', 'cmf9ys1l00011na2e6yc4v9gu', 'cmf9yru9i000zna2e36j0pecs'] }
                    }
                }
            });
        }

        // Create legal documents
        for (const doc of documents) {
            try {
                await prisma.legalDocument.create({
                    data: {
                        id: doc.id,
                        title: doc.title,
                        type: doc.type,
                        content: doc.content,
                        version: doc.version,
                        status: doc.status,
                        requiresSignature: doc.requiresSignature,
                        complianceRequired: doc.complianceRequired,
                        createdBy: 'system-seed-direct',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });

                console.log(`✅ Created: ${doc.title} (${doc.rbacLevel})`);

            } catch (error) {
                console.error(`❌ Error creating ${doc.title}:`, error.message);
            }
        }

        console.log('🎉 Legal documents seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Export the function for API use
module.exports = seedLegalDocumentsDirect;

// Run the seeding if called directly
if (require.main === module) {
    seedLegalDocumentsDirect();
}
