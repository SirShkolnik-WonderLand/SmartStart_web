const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateGamificationSystem() {
    try {
        console.log('🚀 Starting Gamification System Migration...');
        
        // Create Skills table
        console.log('📚 Creating Skills table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Skill" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "category" TEXT NOT NULL,
                "description" TEXT,
                "demand" INTEGER NOT NULL DEFAULT 3,
                "complexity" INTEGER NOT NULL DEFAULT 3,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create unique index on skill name
        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "Skill_name_key" ON "Skill"("name");
        `;
        
        console.log('✅ Skills table created');

        // Create UserSkills table
        console.log('👤 Creating UserSkills table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "UserSkill" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "skillId" TEXT NOT NULL,
                "level" INTEGER NOT NULL DEFAULT 1,
                "verified" BOOLEAN NOT NULL DEFAULT false,
                "endorsements" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create indexes for UserSkills
        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "UserSkill_userId_skillId_key" ON "UserSkill"("userId", "skillId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserSkill_userId_idx" ON "UserSkill"("userId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserSkill_skillId_idx" ON "UserSkill"("skillId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserSkill_level_idx" ON "UserSkill"("level");
        `;
        
        console.log('✅ UserSkills table created');

        // Create Endorsements table
        console.log('🤝 Creating Endorsements table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Endorsement" (
                "id" TEXT NOT NULL,
                "endorserId" TEXT NOT NULL,
                "endorsedId" TEXT NOT NULL,
                "skillId" TEXT,
                "weight" INTEGER NOT NULL DEFAULT 1,
                "note" VARCHAR(200),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create indexes for Endorsements
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "Endorsement_endorsedId_idx" ON "Endorsement"("endorsedId");
        `;
        
        console.log('✅ Endorsements table created');

        // Create PortfolioItems table
        console.log('📁 Creating PortfolioItems table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "PortfolioItem" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "summary" VARCHAR(300),
                "fileId" TEXT,
                "externalUrl" VARCHAR(300),
                "taskId" TEXT,
                "buzEarned" INTEGER NOT NULL DEFAULT 0,
                "impactScore" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                "isPublic" BOOLEAN NOT NULL DEFAULT true,
                CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create indexes for PortfolioItems
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "PortfolioItem_userId_idx" ON "PortfolioItem"("userId");
        `;
        
        console.log('✅ PortfolioItems table created');

        // Create UserActivity table
        console.log('📊 Creating UserActivity table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "UserActivity" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "type" TEXT NOT NULL,
                "entity" TEXT,
                "entityType" TEXT,
                "data" JSONB NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create indexes for UserActivity
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserActivity_userId_idx" ON "UserActivity"("userId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserActivity_type_idx" ON "UserActivity"("type");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");
        `;
        
        console.log('✅ UserActivity table created');

        // Create Badges table
        console.log('🏆 Creating Badges table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Badge" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "icon" TEXT NOT NULL,
                "condition" TEXT NOT NULL,
                "category" TEXT,
                "rarity" TEXT NOT NULL DEFAULT 'COMMON',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create unique index on badge name
        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "Badge_name_key" ON "Badge"("name");
        `;
        
        console.log('✅ Badges table created');

        // Create UserBadges table
        console.log('🎖️ Creating UserBadges table...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "UserBadge" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "badgeId" TEXT NOT NULL,
                "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create unique index and indexes for UserBadges
        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserBadge_userId_idx" ON "UserBadge"("userId");
        `;
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");
        `;
        
        console.log('✅ UserBadges table created');

        // Check if User table has required fields
        console.log('👤 Checking User table structure...');
        const userTableInfo = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'User' 
            AND column_name IN ('xp', 'level', 'reputation', 'lastActive', 'totalPortfolioValue', 'activeProjectsCount', 'totalContributions')
            ORDER BY column_name;
        `;
        
        console.log('User table columns:', userTableInfo);

        // Add missing columns to User table if they don't exist
        const requiredColumns = [
            { name: 'xp', type: 'INTEGER', default: '0' },
            { name: 'level', type: 'TEXT', default: "'OWLET'" },
            { name: 'reputation', type: 'INTEGER', default: '0' },
            { name: 'lastActive', type: 'TIMESTAMP(3)', default: 'CURRENT_TIMESTAMP' },
            { name: 'totalPortfolioValue', type: 'DOUBLE PRECISION', default: '0' },
            { name: 'activeProjectsCount', type: 'INTEGER', default: '0' },
            { name: 'totalContributions', type: 'INTEGER', default: '0' }
        ];

        for (const column of requiredColumns) {
            try {
                await prisma.$executeRaw`
                    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type} DEFAULT ${column.default};
                `;
                console.log(`✅ Added column ${column.name} to User table`);
            } catch (error) {
                console.log(`⚠️ Column ${column.name} might already exist:`, error.message);
            }
        }

        // Create indexes on User table
        console.log('📊 Creating User table indexes...');
        const userIndexes = [
            'CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");',
            'CREATE INDEX IF NOT EXISTS "User_level_idx" ON "User"("level");',
            'CREATE INDEX IF NOT EXISTS "User_totalPortfolioValue_idx" ON "User"("totalPortfolioValue");',
            'CREATE INDEX IF NOT EXISTS "User_activeProjectsCount_idx" ON "User"("activeProjectsCount");',
            'CREATE INDEX IF NOT EXISTS "User_totalEquityOwned_idx" ON "User"("totalEquityOwned");',
            'CREATE INDEX IF NOT EXISTS "User_lastEquityEarned_idx" ON "User"("lastEquityEarned");'
        ];

        for (const indexSql of userIndexes) {
            try {
                await prisma.$executeRaw(indexSql);
            } catch (error) {
                console.log(`⚠️ Index creation warning:`, error.message);
            }
        }

        console.log('✅ User table indexes created');

        // Verify all tables exist
        console.log('🔍 Verifying all tables exist...');
        const tables = ['Skill', 'UserSkill', 'Endorsement', 'PortfolioItem', 'UserActivity', 'Badge', 'UserBadge'];
        
        for (const table of tables) {
            const tableExists = await prisma.$queryRaw`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = ${table}
                );
            `;
            console.log(`Table ${table}: ${tableExists[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);
        }

        console.log('🎉 Gamification System Migration Completed Successfully!');
        
        // Display summary
        const skillCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Skill"`;
        const badgeCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Badge"`;
        const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
        
        console.log('\n📊 Migration Summary:');
        console.log(`   Skills: ${skillCount[0].count}`);
        console.log(`   Badges: ${badgeCount[0].count}`);
        console.log(`   Users: ${userCount[0].count}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateGamificationSystem()
        .then(() => {
            console.log('✅ Gamification migration completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Gamification migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateGamificationSystem };
