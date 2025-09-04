const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function fixVerificationTable() {
    try {
        console.log('🔧 FIXING USER VERIFICATION TABLE');
        console.log('=================================');

        // 1. Check UserVerification table structure
        console.log('\n1. Checking UserVerification table structure...');
        const columns = await prisma.$queryRaw `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'UserVerification' 
      ORDER BY ordinal_position;
    `;

        console.log('UserVerification table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // 2. Add missing columns if needed
        const hasUpdatedAt = columns.some(col => col.column_name === 'updatedAt');
        if (!hasUpdatedAt) {
            console.log('\n2. Adding missing updatedAt column...');
            await prisma.$executeRaw `
        ALTER TABLE "UserVerification" 
        ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW();
      `;
            console.log('✅ Added updatedAt column');
        } else {
            console.log('✅ updatedAt column already exists');
        }

        // 3. Create email verification records for users
        console.log('\n3. Creating email verification records...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true
            }
        });

        for (const user of users) {
            // Check if verification already exists
            const existingVerification = await prisma.$queryRaw `
        SELECT id FROM "UserVerification" WHERE "userId" = ${user.id}
      `;

            if (existingVerification.length === 0) {
                const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                await prisma.$executeRaw `
          INSERT INTO "UserVerification" (
            "id", "userId", "verificationToken", "expiresAt", "createdAt", "updatedAt"
          ) VALUES (
            ${`verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
            ${user.id},
            ${verificationToken},
            ${expiresAt},
            NOW(),
            NOW()
          )
        `;
        console.log(`  ✅ Created verification for: ${user.email}`);
      } else {
        console.log(`  - Verification already exists for: ${user.email}`);
      }
    }
    
    // 4. Test admin login again
    console.log('\n4. Testing admin login...');
    const adminUser = await prisma.$queryRaw`
      SELECT id, email, password, status, role
      FROM "User" 
      WHERE email = 'admin@smartstart.com'
    `;
    
    if (adminUser.length > 0) {
      const user = adminUser[0];
      console.log(`Admin user: ${user.email}`);
      console.log(`Status: ${user.status}, Role: ${user.role}`);
      console.log(`Password: ${user.password ? 'SET' : 'NOT SET'}`);
    }
    
    // 5. Summary
    console.log('\n5. VERIFICATION SYSTEM FIX SUMMARY:');
    console.log('===================================');
    
    const totalUsers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    const verifications = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserVerification"`;
    const journeyStates = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserJourneyState"`;
    
    console.log(`✅ Total Users: ${totalUsers[0].count}`);
    console.log(`✅ Email Verifications: ${verifications[0].count}`);
    console.log(`✅ Journey States: ${journeyStates[0].count}`);
    
    console.log('\n🎉 Verification system fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing verification table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

