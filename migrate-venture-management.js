const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Migration script for Venture Management System
 * Creates all necessary tables for venture creation, equity framework, and IT pack provisioning
 */
async function migrateVentureManagement() {
    try {
        console.log('🚀 Starting Venture Management System migration...');

        // 1. Create Venture table
        console.log('📋 Creating Venture table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Venture" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "purpose" TEXT NOT NULL,
                "region" TEXT NOT NULL DEFAULT 'US',
                "status" TEXT NOT NULL DEFAULT 'DRAFT',
                "ownerUserId" TEXT NOT NULL,
                "legalEntityId" TEXT,
                "equityFrameworkId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Venture_pkey" PRIMARY KEY ("id")
            );
        `;

        // 2. Create LegalEntity table
        console.log('🏛️ Creating LegalEntity table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "LegalEntity" (
                "id" TEXT NOT NULL,
                "ventureId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "type" TEXT NOT NULL DEFAULT 'LLC',
                "jurisdiction" TEXT NOT NULL DEFAULT 'US',
                "taxId" TEXT,
                "incorporationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "LegalEntity_pkey" PRIMARY KEY ("id")
            );
        `;

        // 3. Create EquityFramework table
        console.log('💰 Creating EquityFramework table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "EquityFramework" (
                "id" TEXT NOT NULL,
                "ventureId" TEXT NOT NULL,
                "ownerPercent" INTEGER NOT NULL DEFAULT 35,
                "alicePercent" INTEGER NOT NULL DEFAULT 20,
                "cepPercent" INTEGER NOT NULL DEFAULT 45,
                "vestingPolicy" TEXT NOT NULL DEFAULT '4-year vest, 1-year cliff',
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "EquityFramework_pkey" PRIMARY KEY ("id")
            );
        `;

        // 4. Create EquityLedger table
        console.log('📊 Creating EquityLedger table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "EquityLedger" (
                "id" TEXT NOT NULL,
                "ventureId" TEXT NOT NULL,
                "holderType" TEXT NOT NULL,
                "holderId" TEXT,
                "percent" DOUBLE PRECISION NOT NULL,
                "vestingPolicyId" TEXT,
                "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "effectiveTo" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "EquityLedger_pkey" PRIMARY KEY ("id")
            );
        `;

        // 5. Create VestingPolicy table
        console.log('⏰ Creating VestingPolicy table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "VestingPolicy" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "cliffMonths" INTEGER NOT NULL DEFAULT 12,
                "durationMonths" INTEGER NOT NULL DEFAULT 48,
                "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "VestingPolicy_pkey" PRIMARY KEY ("id")
            );
        `;

        // 6. Create VentureProfile table
        console.log('📈 Creating VentureProfile table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "VentureProfile" (
                "id" TEXT NOT NULL,
                "ventureId" TEXT NOT NULL,
                "description" TEXT,
                "industry" TEXT NOT NULL DEFAULT 'Technology',
                "stage" TEXT NOT NULL DEFAULT 'STARTUP',
                "fundingRound" TEXT NOT NULL DEFAULT 'PRE_SEED',
                "teamSize" INTEGER NOT NULL DEFAULT 1,
                "website" TEXT,
                "socialMedia" JSONB,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "VentureProfile_pkey" PRIMARY KEY ("id")
            );
        `;

        // 7. Create VentureITPack table
        console.log('🔧 Creating VentureITPack table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "VentureITPack" (
                "id" TEXT NOT NULL,
                "ventureId" TEXT NOT NULL,
                "m365TenantId" TEXT,
                "emailAddress" TEXT,
                "githubOrg" TEXT,
                "renderServiceId" TEXT,
                "backupPolicyId" TEXT,
                "status" TEXT NOT NULL DEFAULT 'PROVISIONING',
                "provisionedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "VentureITPack_pkey" PRIMARY KEY ("id")
            );
        `;

        // 8. Add ventureId column to LegalDocument table if it doesn't exist
        console.log('📝 Adding ventureId to LegalDocument table...');
        try {
            await prisma.$executeRaw`
                ALTER TABLE "LegalDocument" ADD COLUMN IF NOT EXISTS "ventureId" TEXT;
            `;
        } catch (error) {
            console.log('ℹ️ ventureId column already exists or table not found');
        }

        // 9. Create indexes for performance
        console.log('🚀 Creating performance indexes...');
        
        // Venture indexes
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "Venture_ownerUserId_idx" ON "Venture"("ownerUserId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "Venture_status_idx" ON "Venture"("status");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "Venture_region_idx" ON "Venture"("region");
        `;

        // LegalEntity indexes
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "LegalEntity_jurisdiction_idx" ON "LegalEntity"("jurisdiction");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "LegalEntity_status_idx" ON "LegalEntity"("status");
        `;

        // EquityLedger indexes
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "EquityLedger_ventureId_idx" ON "EquityLedger"("ventureId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "EquityLedger_holderType_holderId_idx" ON "EquityLedger"("holderType", "holderId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "EquityLedger_effectiveFrom_effectiveTo_idx" ON "EquityLedger"("effectiveFrom", "effectiveTo");
        `;

        // VentureProfile indexes
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "VentureProfile_industry_idx" ON "VentureProfile"("industry");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "VentureProfile_stage_idx" ON "VentureProfile"("stage");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "VentureProfile_fundingRound_idx" ON "VentureProfile"("fundingRound");
        `;

        // VentureITPack indexes
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "VentureITPack_status_idx" ON "VentureITPack"("status");
        `;

        // LegalDocument venture index
        try {
            await prisma.$executeRaw`
                CREATE INDEX IF NOT EXISTS "LegalDocument_ventureId_idx" ON "LegalDocument"("ventureId");
            `;
        } catch (error) {
            console.log('ℹ️ LegalDocument ventureId index already exists');
        }

        console.log('✅ Venture Management System migration completed successfully!');
        
        // Display summary
        const ventureCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Venture"`;
        const legalEntityCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "LegalEntity"`;
        const equityFrameworkCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "EquityFramework"`;
        
        console.log('📊 Migration Summary:');
        console.log(`  Ventures: ${parseInt(ventureCount[0].count)}`);
        console.log(`  Legal Entities: ${parseInt(legalEntityCount[0].count)}`);
        console.log(`  Equity Frameworks: ${parseInt(equityFrameworkCount[0].count)}`);

    } catch (error) {
        console.error('❌ Venture Management migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateVentureManagement()
        .then(() => {
            console.log('🎉 Venture Management migration completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateVentureManagement };
