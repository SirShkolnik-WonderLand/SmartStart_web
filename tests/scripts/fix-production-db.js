const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function fixProductionDatabase() {
    try {
        console.log('🔧 FIXING PRODUCTION DATABASE');
        console.log('==============================');

        // 1. Check admin user password
        console.log('\n1. Checking admin user password...');
        const adminUser = await prisma.$queryRaw `
      SELECT id, email, password, "firstName", "lastName", status, role, level
      FROM "User" 
      WHERE email = 'admin@smartstart.com'
    `;

        if (adminUser.length > 0) {
            const user = adminUser[0];
            console.log(`Admin user found: ${user.email}`);
            console.log(`Password set: ${user.password ? '✅ YES' : '❌ NO'}`);
            console.log(`Status: ${user.status}`);
            console.log(`Role: ${user.role}`);
            console.log(`Level: ${user.level}`);

            if (!user.password) {
                console.log('\n🔐 Setting admin user password...');
                const hashedPassword = await bcrypt.hash('AdminPass123!', 12);
                await prisma.$executeRaw `
          UPDATE "User" 
          SET password = ${hashedPassword}, "updatedAt" = NOW()
          WHERE email = 'admin@smartstart.com'
        `;
                console.log('✅ Admin password set successfully!');
            }
        }

        // 2. Create missing tables
        console.log('\n2. Creating missing tables...');

        // Create UserVerification table
        try {
            await prisma.$executeRaw `
        CREATE TABLE IF NOT EXISTS "UserVerification" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "verificationToken" TEXT NOT NULL,
          "expiresAt" TIMESTAMP NOT NULL,
          "verifiedAt" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
            console.log('✅ UserVerification table created');
        } catch (error) {
            console.log('⚠️ UserVerification table already exists or error:', error.message);
        }

        // Create UserSession table
        try {
            await prisma.$executeRaw `
        CREATE TABLE IF NOT EXISTS "UserSession" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "sessionToken" TEXT NOT NULL,
          "deviceInfo" JSONB,
          "ipAddress" TEXT,
          "expiresAt" TIMESTAMP NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
            console.log('✅ UserSession table created');
        } catch (error) {
            console.log('⚠️ UserSession table already exists or error:', error.message);
        }

        // Create PasswordReset table
        try {
            await prisma.$executeRaw `
        CREATE TABLE IF NOT EXISTS "PasswordReset" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "resetToken" TEXT NOT NULL,
          "expiresAt" TIMESTAMP NOT NULL,
          "usedAt" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
            console.log('✅ PasswordReset table created');
        } catch (error) {
            console.log('⚠️ PasswordReset table already exists or error:', error.message);
        }

        // Create JourneyStage table
        try {
            await prisma.$executeRaw `
        CREATE TABLE IF NOT EXISTS "JourneyStage" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "order" INTEGER NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
            console.log('✅ JourneyStage table created');
        } catch (error) {
            console.log('⚠️ JourneyStage table already exists or error:', error.message);
        }

        // Create JourneyGate table
        try {
            await prisma.$executeRaw `
        CREATE TABLE IF NOT EXISTS "JourneyGate" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "stageId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
            console.log('✅ JourneyGate table created');
        } catch (error) {
            console.log('⚠️ JourneyGate table already exists or error:', error.message);
        }

        // Create UserJourneyState table
        try {
            await prisma.$executeRaw `
        CREATE TABLE IF NOT EXISTS "UserJourneyState" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "stageId" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "startedAt" TIMESTAMP,
          "completedAt" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
            console.log('✅ UserJourneyState table created');
        } catch (error) {
            console.log('⚠️ UserJourneyState table already exists or error:', error.message);
        }

        // 3. Test admin login
        console.log('\n3. Testing admin login...');
        const testLogin = await prisma.$queryRaw `
      SELECT id, email, password, status
      FROM "User" 
      WHERE email = 'admin@smartstart.com'
    `;

        if (testLogin.length > 0) {
            const user = testLogin[0];
            if (user.password) {
                const isValid = await bcrypt.compare('AdminPass123!', user.password);
                console.log(`Password validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
            }
        }

        console.log('\n🎉 Production database fix complete!');

    } catch (error) {
        console.error('❌ Error fixing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixProductionDatabase();