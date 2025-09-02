const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAdvancedContracts() {
    try {
        console.log('🚀 Starting advanced contracts system migration...');

        // Check if we're connected to the database
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection established');

        // Create the new models using raw SQL since Prisma schema isn't updated yet
        console.log('📊 Creating advanced contracts system tables...');

        // Contract Amendments table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "ContractAmendment" (
                "id" TEXT NOT NULL,
                "originalContractId" TEXT NOT NULL,
                "amendmentType" TEXT NOT NULL,
                "reason" TEXT NOT NULL,
                "changes" TEXT NOT NULL,
                "version" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
                "approvalDeadline" TIMESTAMP,
                "notificationRecipients" TEXT NOT NULL,
                "effectiveDate" TIMESTAMP,
                "proposedBy" TEXT NOT NULL,
                "approvedBy" TEXT,
                "approvedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "ContractAmendment_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ ContractAmendment table created');

        // Amendment Signatures table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "AmendmentSignature" (
                "id" TEXT NOT NULL,
                "amendmentId" TEXT NOT NULL,
                "signerId" TEXT NOT NULL,
                "role" TEXT NOT NULL,
                "required" BOOLEAN NOT NULL DEFAULT true,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "deadline" TIMESTAMP,
                "signedAt" TIMESTAMP,
                "signatureHash" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "AmendmentSignature_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ AmendmentSignature table created');

        // Contract Enforcement table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "ContractEnforcement" (
                "id" TEXT NOT NULL,
                "contractId" TEXT NOT NULL,
                "enforcementAction" TEXT NOT NULL,
                "reason" TEXT NOT NULL,
                "evidence" TEXT NOT NULL,
                "legalBasis" TEXT NOT NULL,
                "jurisdiction" TEXT NOT NULL DEFAULT 'CA',
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "initiatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "resolutionDate" TIMESTAMP,
                "outcome" TEXT,
                "initiatedBy" TEXT NOT NULL,
                "resolvedBy" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "ContractEnforcement_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ ContractEnforcement table created');

        // Multi-Party Requirements table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "MultiPartyRequirement" (
                "id" TEXT NOT NULL,
                "contractId" TEXT NOT NULL,
                "role" TEXT NOT NULL,
                "signerId" TEXT NOT NULL,
                "required" BOOLEAN NOT NULL DEFAULT true,
                "order" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "MultiPartyRequirement_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ MultiPartyRequirement table created');

        // Signature Verification table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "SignatureVerification" (
                "id" TEXT NOT NULL,
                "signatureId" TEXT NOT NULL,
                "verificationMethod" TEXT NOT NULL DEFAULT 'CRYPTOGRAPHIC',
                "results" TEXT NOT NULL,
                "verifiedBy" TEXT NOT NULL,
                "verifiedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "SignatureVerification_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ SignatureVerification table created');

        // Template Version History table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "TemplateVersionHistory" (
                "id" TEXT NOT NULL,
                "originalTemplateId" TEXT NOT NULL,
                "newVersionId" TEXT NOT NULL,
                "versionNumber" TEXT NOT NULL,
                "changes" TEXT NOT NULL,
                "reason" TEXT NOT NULL,
                "createdBy" TEXT NOT NULL,
                "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
                "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
                "approvedBy" TEXT,
                "approvedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "TemplateVersionHistory_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ TemplateVersionHistory table created');

        // Compliance Records table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "ComplianceRecord" (
                "id" TEXT NOT NULL,
                "contractId" TEXT NOT NULL,
                "complianceType" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "checkDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "nextCheckDate" TIMESTAMP,
                "details" TEXT NOT NULL,
                "violations" TEXT,
                "correctiveActions" TEXT,
                "checkedBy" TEXT NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "ComplianceRecord_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ ComplianceRecord table created');

        // Legal Rules table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "LegalRule" (
                "id" TEXT NOT NULL,
                "ruleName" TEXT NOT NULL UNIQUE,
                "ruleType" TEXT NOT NULL,
                "jurisdiction" TEXT NOT NULL DEFAULT 'CA',
                "description" TEXT NOT NULL,
                "ruleLogic" TEXT NOT NULL,
                "conditions" TEXT NOT NULL,
                "actions" TEXT NOT NULL,
                "priority" INTEGER NOT NULL DEFAULT 0,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "createdBy" TEXT NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "LegalRule_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ LegalRule table created');

        // Legal Rule Executions table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "LegalRuleExecution" (
                "id" TEXT NOT NULL,
                "ruleId" TEXT NOT NULL,
                "contractId" TEXT NOT NULL,
                "executionDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "inputData" TEXT NOT NULL,
                "outputData" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'SUCCESS',
                "errorMessage" TEXT,
                "executionTime" INTEGER NOT NULL,
                "createdBy" TEXT NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "LegalRuleExecution_pkey" PRIMARY KEY ("id")
            )
        `;
        console.log('✅ LegalRuleExecution table created');

        // Add indexes for performance
        console.log('📈 Creating performance indexes...');
        
        try {
            await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "contract_enforcement_status" ON "ContractEnforcement"("contractId", "status")`;
            await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "contract_amendment_type" ON "ContractAmendment"("originalContractId", "amendmentType")`;
            await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "signature_verification_method" ON "SignatureVerification"("signatureId", "verificationMethod")`;
            await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "rule_execution_date" ON "LegalRuleExecution"("ruleId", "executionDate")`;
            await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "contract_compliance_type" ON "ComplianceRecord"("contractId", "complianceType")`;
            
            console.log('✅ Performance indexes created');
        } catch (error) {
            console.log('⚠️ Some indexes may already exist or have different column names');
        }

        // Add new fields to existing tables
        console.log('🔧 Extending existing tables...');
        
        // Add role and signatureMethod to LegalDocumentSignature
        try {
            await prisma.$executeRaw`ALTER TABLE "LegalDocumentSignature" ADD COLUMN IF NOT EXISTS "role" TEXT`;
            await prisma.$executeRaw`ALTER TABLE "LegalDocumentSignature" ADD COLUMN IF NOT EXISTS "signatureMethod" TEXT DEFAULT 'DIGITAL'`;
            console.log('✅ LegalDocumentSignature table extended');
        } catch (error) {
            console.log('⚠️ LegalDocumentSignature extension skipped (columns may already exist)');
        }

        // Add isVersionOf to LegalDocument
        try {
            await prisma.$executeRaw`ALTER TABLE "LegalDocument" ADD COLUMN IF NOT EXISTS "isVersionOf" TEXT`;
            console.log('✅ LegalDocument table extended');
        } catch (error) {
            console.log('⚠️ LegalDocument extension skipped (columns may already exist)');
        }

        console.log('🎉 Advanced contracts system migration completed successfully!');

        // Display summary
        const tables = [
            'ContractAmendment',
            'AmendmentSignature', 
            'ContractEnforcement',
            'MultiPartyRequirement',
            'SignatureVerification',
            'TemplateVersionHistory',
            'ComplianceRecord',
            'LegalRule',
            'LegalRuleExecution'
        ];

        console.log('\n📊 Migration Summary:');
        for (const table of tables) {
            try {
                const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "${table}"`;
                console.log(`   • ${table}: ${count[0].count} records`);
            } catch (error) {
                console.log(`   • ${table}: Table created (no records yet)`);
            }
        }

    } catch (error) {
        console.error('❌ Advanced contracts migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateAdvancedContracts()
        .then(() => {
            console.log('✅ Advanced contracts migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Advanced contracts migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateAdvancedContracts };
