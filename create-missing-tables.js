const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingTables() {
    try {
        console.log('🚀 Creating missing authentication tables...');

        // Create UserVerification table
        console.log('📧 Creating UserVerification table...');
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "UserVerification" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "verificationToken" TEXT NOT NULL UNIQUE,
                "verificationType" TEXT NOT NULL DEFAULT 'EMAIL_VERIFICATION',
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "verifiedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create UserSession table
        console.log('🔐 Creating UserSession table...');
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "UserSession" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "sessionToken" TEXT NOT NULL UNIQUE,
                "deviceInfo" JSONB,
                "ipAddress" TEXT,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create PasswordReset table
        console.log('🔑 Creating PasswordReset table...');
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "PasswordReset" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "resetToken" TEXT NOT NULL UNIQUE,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "usedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create indexes for performance
        console.log('📊 Creating indexes...');
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "UserVerification_userId_idx" ON "UserVerification"("userId")`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "UserVerification_token_idx" ON "UserVerification"("verificationToken")`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "UserSession_userId_idx" ON "UserSession"("userId")`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "UserSession_token_idx" ON "UserSession"("sessionToken")`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "UserSession_expires_idx" ON "UserSession"("expiresAt")`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "PasswordReset_userId_idx" ON "PasswordReset"("userId")`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "PasswordReset_token_idx" ON "PasswordReset"("resetToken")`;

        console.log('✅ All authentication tables created successfully!');

        // Test the tables
        console.log('🧪 Testing table creation...');
        const verificationCount = await prisma.$queryRaw `SELECT COUNT(*) as count FROM "UserVerification"`;
        const sessionCount = await prisma.$queryRaw `SELECT COUNT(*) as count FROM "UserSession"`;
        const resetCount = await prisma.$queryRaw `SELECT COUNT(*) as count FROM "PasswordReset"`;

        console.log('📊 Table status:');
        console.log(`   UserVerification: ${verificationCount[0].count} records`);
        console.log(`   UserSession: ${sessionCount[0].count} records`);
        console.log(`   PasswordReset: ${resetCount[0].count} records`);

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createMissingTables()
    .then(() => {
        console.log('🎉 Database setup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Database setup failed:', error);
        process.exit(1);
    });