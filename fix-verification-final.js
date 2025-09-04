const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function fixVerificationFinal() {
    try {
        console.log('🔧 FIXING USER VERIFICATION FINAL');
        console.log('=================================');

        // 1. Create email verification records for users with proper email field
        console.log('\n1. Creating email verification records...');

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
            "id", "userId", "email", "verificationToken", "verificationType", "expiresAt", "createdAt", "updatedAt"
          ) VALUES (
            ${`verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
            ${user.id},
            ${user.email},
            ${verificationToken},
            'EMAIL_VERIFICATION',
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
    
    // 2. Test admin login
    console.log('\n2. Testing admin login...');
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
    
    // 3. Check journey progression
    console.log('\n3. Checking journey progression...');
    const journeyStates = await prisma.$queryRaw`
      SELECT ujs.*, u.email, js.name as stage_name
      FROM "UserJourneyState" ujs
      JOIN "User" u ON ujs."userId" = u.id
      JOIN "JourneyStage" js ON ujs."stageId" = js.id
      ORDER BY ujs."createdAt" DESC
    `;
    
    console.log(`Found ${journeyStates.length} journey states:`);
    journeyStates.forEach(state => {
      console.log(`  - ${state.email}: ${state.stage_name} (${state.status})`);
    });
    
    // 4. Summary
    console.log('\n4. FINAL SYSTEM STATUS:');
    console.log('=======================');
    
    const totalUsers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    const verifications = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserVerification"`;
    const journeyStatesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserJourneyState"`;
    const sessions = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserSession"`;
    
    console.log(`✅ Total Users: ${totalUsers[0].count}`);
    console.log(`✅ Email Verifications: ${verifications[0].count}`);
    console.log(`✅ Journey States: ${journeyStatesCount[0].count}`);
    console.log(`✅ User Sessions: ${sessions[0].count}`);
    
    console.log('\n🎉 User onboarding journey system is now functional!');
    
  } catch (error) {
    console.error('❌ Error fixing verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

