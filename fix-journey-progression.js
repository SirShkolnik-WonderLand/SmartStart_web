const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function fixJourneyProgression() {
    try {
        console.log('🔧 FIXING JOURNEY PROGRESSION SYSTEM');
        console.log('=====================================');

        // 1. Fix admin user login issue
        console.log('\n1. Fixing admin user login...');
        const adminUser = await prisma.$queryRaw `
      SELECT id, email, password, status, role
      FROM "User" 
      WHERE email = 'admin@smartstart.com'
    `;

        if (adminUser.length > 0) {
            const user = adminUser[0];
            console.log(`Admin user found: ${user.email}`);
            console.log(`Status: ${user.status}, Role: ${user.role}`);
            console.log(`Password: ${user.password ? 'SET' : 'NOT SET'}`);

            if (user.password) {
                // Test password validation
                const isValid = await bcrypt.compare('AdminPass123!', user.password);
                console.log(`Password validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

                if (isValid) {
                    console.log('✅ Admin user is properly configured');
                } else {
                    console.log('❌ Admin password is incorrect, updating...');
                    const newHashedPassword = await bcrypt.hash('AdminPass123!', 12);
                    await prisma.$executeRaw `
            UPDATE "User" 
            SET password = ${newHashedPassword}, "updatedAt" = NOW()
            WHERE email = 'admin@smartstart.com'
          `;
                    console.log('✅ Admin password updated');
                }
            }
        }

        // 2. Create journey progression logic
        console.log('\n2. Creating journey progression logic...');

        // Get all users and their current journey states
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true
            }
        });

        console.log(`Found ${users.length} users to process`);

        for (const user of users) {
            console.log(`\nProcessing user: ${user.email}`);

            // Check current journey state
            const currentState = await prisma.$queryRaw `
        SELECT * FROM "UserJourneyState" 
        WHERE "userId" = ${user.id} 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `;

            if (currentState.length === 0) {
                // User has no journey state, create initial state
                console.log(`  - No journey state found, creating initial state`);

                // Get the first stage (Registration)
                const firstStage = await prisma.$queryRaw `
          SELECT * FROM "JourneyStage" 
          WHERE "order" = 1 
          LIMIT 1
        `;

                if (firstStage.length > 0) {
                    const stage = firstStage[0];
                    await prisma.$executeRaw `
            INSERT INTO "UserJourneyState" (
              "id", "userId", "stageId", "status", "startedAt", "createdAt", "updatedAt"
            ) VALUES (
              ${`journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
              ${user.id},
              ${stage.id},
              'IN_PROGRESS',
              NOW(),
              NOW(),
              NOW()
            )
          `;
          console.log(`  ✅ Created initial journey state for stage: ${stage.name}`);
        }
      } else {
        const state = currentState[0];
        console.log(`  - Current stage: ${state.stageId}, Status: ${state.status}`);
        
        // Check if user can progress to next stage
        if (state.status === 'COMPLETED') {
          console.log(`  - User completed stage, checking for progression`);
          
          // Get current stage order
          const currentStage = await prisma.$queryRaw`
            SELECT "order" FROM "JourneyStage" WHERE id = ${state.stageId}
          `;
          
          if (currentStage.length > 0) {
            const currentOrder = currentStage[0].order;
            const nextOrder = currentOrder + 1;
            
            // Get next stage
            const nextStage = await prisma.$queryRaw`
              SELECT * FROM "JourneyStage" 
              WHERE "order" = ${nextOrder} 
              LIMIT 1
            `;
            
            if (nextStage.length > 0) {
              const stage = nextStage[0];
              console.log(`  - Progressing to next stage: ${stage.name}`);
              
              // Create new journey state for next stage
              await prisma.$executeRaw`
                INSERT INTO "UserJourneyState" (
                  "id", "userId", "stageId", "status", "startedAt", "createdAt", "updatedAt"
                ) VALUES (
                  ${`journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
                  ${user.id},
                  ${stage.id},
                  'IN_PROGRESS',
                  NOW(),
                  NOW(),
                  NOW()
                )
              `;
              console.log(`  ✅ Progressed to stage: ${stage.name}`);
            } else {
              console.log(`  - No next stage found, user completed journey`);
            }
          }
        }
      }
    }
    
    // 3. Create email verification system
    console.log('\n3. Setting up email verification system...');
    
    // Get users without email verification
    const unverifiedUsers = await prisma.$queryRaw`
      SELECT u.id, u.email, uv.id as verification_id
      FROM "User" u
      LEFT JOIN "UserVerification" uv ON u.id = uv."userId"
      WHERE uv.id IS NULL OR uv."verifiedAt" IS NULL
    `;
    
    console.log(`Found ${unverifiedUsers.length} users needing email verification`);
    
    for (const user of unverifiedUsers) {
      if (!user.verification_id) {
        // Create verification record
        const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await prisma.$executeRaw`
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
      }
    }
    
    // 4. Create user-entity relationships
    console.log('\n4. Creating user-entity relationships...');
    
    // Create sample relationships for testing
    const sampleUsers = users.slice(0, 3); // Take first 3 users
    
    for (const user of sampleUsers) {
      // Create a sample company relationship
      const companies = await prisma.$queryRaw`SELECT id FROM "Company" LIMIT 1`;
      if (companies.length > 0) {
        const companyId = companies[0].id;
        
        // Check if relationship already exists
        const existingRelation = await prisma.$queryRaw`
          SELECT id FROM "CompanyHierarchy" 
          WHERE "userId" = ${user.id} AND "companyId" = ${companyId}
        `;
        
        if (existingRelation.length === 0) {
          await prisma.$executeRaw`
            INSERT INTO "CompanyHierarchy" (
              "id", "companyId", "userId", "role", "createdAt", "updatedAt"
            ) VALUES (
              ${`company_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
              ${companyId},
              ${user.id},
              'MEMBER',
              NOW(),
              NOW()
            )
          `;
          console.log(`  ✅ Created company relationship for: ${user.email}`);
        }
      }
    }
    
    // 5. Summary
    console.log('\n5. JOURNEY PROGRESSION FIX SUMMARY:');
    console.log('===================================');
    
    const totalUsers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    const journeyStates = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserJourneyState"`;
    const verifications = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "UserVerification"`;
    const companyRelations = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "CompanyHierarchy"`;
    
    console.log(`✅ Total Users: ${totalUsers[0].count}`);
    console.log(`✅ Journey States: ${journeyStates[0].count}`);
    console.log(`✅ Email Verifications: ${verifications[0].count}`);
    console.log(`✅ Company Relationships: ${companyRelations[0].count}`);
    
    console.log('\n🎉 Journey progression system fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing journey progression:', error);
  } finally {
    await prisma.$disconnect();
  }
}

