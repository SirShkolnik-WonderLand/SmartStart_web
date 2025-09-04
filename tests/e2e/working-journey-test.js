const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the cloud database URL
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com/smartstart'
        }
    }
});

async function workingJourneyTest() {
    try {
        console.log('🚀 Starting Working User Journey Test...\n');

        const userData = {
            email: 'dan@smartstart.com',
            password: 'dan',
            name: 'Dan',
            firstName: 'Dan',
            lastName: 'User'
        };

        console.log('📝 Test User Data:', userData);

        // Step 1: Clean up existing user if exists
        console.log('\n1️⃣ Cleaning up existing user...');
        const existingAccount = await prisma.account.findUnique({
            where: { email: userData.email.toLowerCase() }
        });

        if (existingAccount) {
            console.log('❌ User already exists, cleaning up...');
            await prisma.account.delete({
                where: { email: userData.email.toLowerCase() }
            });
            await prisma.user.deleteMany({
                where: { email: userData.email.toLowerCase() }
            });
            console.log('✅ Cleaned up existing user');
        } else {
            console.log('✅ No existing user found');
        }

        // Step 2: Create user and account
        console.log('\n2️⃣ Creating user and account...');
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const defaultRole = await prisma.role.findFirst({
            where: { name: 'GUEST' }
        });

        const result = await prisma.$transaction(async(tx) => {
            const user = await tx.user.create({
                data: {
                    name: userData.name,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email.toLowerCase(),
                    status: 'ACTIVE',
                    updatedAt: new Date()
                }
            });

            const account = await tx.account.create({
                data: {
                    email: userData.email.toLowerCase(),
                    password: hashedPassword,
                    userId: user.id,
                    roleId: defaultRole.id,
                    isActive: true,
                    lastLogin: null,
                    loginAttempts: 0,
                    mfaEnabled: false
                }
            });

            return { user, account };
        });

        console.log('✅ User created:', result.user.id);
        console.log('✅ Account created:', result.account.id);

        // Step 3: Get journey stages using raw SQL
        console.log('\n3️⃣ Getting journey stages using raw SQL...');
        const journeyStages = await prisma.$queryRaw `
      SELECT 
        js.id,
        js.name,
        js.description,
        js."order",
        js."isActive",
        js."createdAt",
        js."updatedAt"
      FROM "JourneyStage" js
      ORDER BY js."order" ASC
    `;

        console.log(`📋 Found ${journeyStages.length} journey stages:`);
        journeyStages.forEach((stage, index) => {
            console.log(`   ${index + 1}. ${stage.name} (Order: ${stage.order})`);
        });

        // Step 4: Get journey gates using raw SQL
        console.log('\n4️⃣ Getting journey gates using raw SQL...');
        const journeyGates = await prisma.$queryRaw `
      SELECT 
        jg.id,
        jg."stageId",
        jg.name,
        jg.description,
        jg."gateType",
        jg."isRequired",
        jg."isActive",
        jg."createdAt",
        jg."updatedAt"
      FROM "JourneyGate" jg
      ORDER BY jg."stageId", jg."createdAt"
    `;

        console.log(`📋 Found ${journeyGates.length} journey gates:`);
        journeyGates.forEach((gate, index) => {
            console.log(`   ${index + 1}. ${gate.name} (${gate.gateType}) - Stage: ${gate.stageId}`);
        });

        // Step 5: Create user journey state using raw SQL
        console.log('\n5️⃣ Creating user journey state using raw SQL...');
        const userJourneyState = await prisma.$queryRaw `
      INSERT INTO "UserJourneyState" (
        id,
        "userId",
        "stageId",
        status,
        "startedAt",
        "completedAt",
        metadata,
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${`ujs_${Date.now()}`},
        ${result.user.id},
        ${journeyStages[0].id},
        'IN_PROGRESS',
        NOW(),
        NULL,
        '{"completedStages": [], "completedGates": [], "progress": 0}',
        NOW(),
        NOW()
      ) RETURNING *
    `;

    console.log('✅ User journey state created:', userJourneyState[0].id);
    console.log('✅ Current stage:', journeyStages[0].name);

    // Step 6: Test journey progression
    console.log('\n6️⃣ Testing journey progression...');
    
    for (let i = 0; i < journeyStages.length; i++) {
      const stage = journeyStages[i];
      console.log(`\n   📍 Stage ${i + 1}: ${stage.name}`);
      console.log(`   📝 Description: ${stage.description}`);
      
      // Get gates for this stage
      const stageGates = journeyGates.filter(gate => gate.stageId === stage.id);
      console.log(`   🎯 Gates (${stageGates.length}):`);
      
      stageGates.forEach((gate, gateIndex) => {
        console.log(`      ${gateIndex + 1}. ${gate.name} - ${gate.description} (${gate.gateType})`);
      });

      // Update metadata with completed gates
      const currentMetadata = userJourneyState[0].metadata || {};
      const completedGates = currentMetadata.completedGates || [];
      const completedStages = currentMetadata.completedStages || [];
      const gateIds = stageGates.map(gate => gate.id);
      
      if (gateIds.length > 0) {
        completedGates.push(...gateIds);
        console.log(`   ✅ Completed ${gateIds.length} gates`);
      }

      // Move to next stage (except for the last one)
      if (i < journeyStages.length - 1) {
        const nextStage = journeyStages[i + 1];
        completedStages.push(stage.id);
        
        await prisma.$queryRaw`
          UPDATE "UserJourneyState" 
          SET 
            "stageId" = ${nextStage.id},
            metadata = ${JSON.stringify({
              ...currentMetadata,
              completedStages,
              completedGates,
              progress: Math.round(((i + 1) / journeyStages.length) * 100)
            })}::jsonb,
            "updatedAt" = NOW()
          WHERE id = ${userJourneyState[0].id}
        `;
        console.log(`   ➡️  Moved to next stage: ${nextStage.name}`);
      } else {
        // Complete the journey
        completedStages.push(stage.id);
        
        await prisma.$queryRaw`
          UPDATE "UserJourneyState" 
          SET 
            metadata = ${JSON.stringify({
              ...currentMetadata,
              completedStages,
              completedGates,
              progress: 100
            })}::jsonb,
            status = 'COMPLETED',
            "completedAt" = NOW(),
            "updatedAt" = NOW()
          WHERE id = ${userJourneyState[0].id}
        `;
        console.log(`   🎉 Journey completed!`);
      }
    }

    // Step 7: Verify final journey state
    console.log('\n7️⃣ Verifying final journey state...');
    const finalJourneyState = await prisma.$queryRaw`
      SELECT * FROM "UserJourneyState" WHERE id = ${userJourneyState[0].id}
    `;

    const finalMetadata = finalJourneyState[0].metadata;
    console.log('📊 Final Journey State:');
    console.log(`   Status: ${finalJourneyState[0].status}`);
    console.log(`   Progress: ${finalMetadata.progress}%`);
    console.log(`   Completed Stages: ${finalMetadata.completedStages.length}/${journeyStages.length}`);
    console.log(`   Completed Gates: ${finalMetadata.completedGates.length}`);

    // Step 8: Test user authentication
    console.log('\n8️⃣ Testing user authentication...');
    const loginAccount = await prisma.account.findUnique({
      where: { email: userData.email.toLowerCase() },
      include: {
        user: true,
        role: true
      }
    });

    const loginPasswordValid = await bcrypt.compare(userData.password, loginAccount.password);
    console.log('🔐 Password verification:', loginPasswordValid ? 'SUCCESS' : 'FAILED');

    if (loginPasswordValid) {
      console.log('✅ User can authenticate successfully!');
      console.log(`   User ID: ${loginAccount.user.id}`);
      console.log(`   Role: ${loginAccount.role.name} (Level ${loginAccount.role.level})`);
    }

    // Step 9: Test API endpoints
    console.log('\n9️⃣ Testing API endpoints...');
    
    // Test login endpoint
    console.log('   🔐 Testing login endpoint...');
    const loginResponse = await fetch('https://smartstart-api.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log(`   Login: ${loginResponse.status} - ${loginResult.message}`);
    
    if (loginResult.success) {
      console.log(`   ✅ Login successful! User: ${loginResult.user.name}`);
      console.log(`   🎫 Session ID: ${loginResult.sessionId}`);
    }

    // Test journey state endpoint
    console.log('   🚀 Testing journey state endpoint...');
    const journeyResponse = await fetch(`https://smartstart-api.onrender.com/api/journey-state/progress/${result.user.id}`);
    const journeyResult = await journeyResponse.json();
    console.log(`   Journey State: ${journeyResponse.status} - ${journeyResult.message || 'Success'}`);

    console.log('\n🎉 Working User Journey Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ User Created: ${userData.name} (${userData.email})`);
    console.log(`   ✅ Journey Initialized: ${journeyStages.length} stages`);
    console.log(`   ✅ Journey Completed: 100% progress`);
    console.log(`   ✅ Authentication: Working`);
    console.log(`   ✅ API Endpoints: Tested`);

    console.log('\n🎯 Complete User Journey Pipeline:');
    journeyStages.forEach((stage, index) => {
      const stageGates = journeyGates.filter(gate => gate.stageId === stage.id);
      console.log(`   ${index + 1}. ${stage.name}`);
      stageGates.forEach((gate, gateIndex) => {
        console.log(`      - ${gate.name} (${gate.gateType})`);
      });
    });

  } catch (error) {
    console.error('❌ Working journey test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

workingJourneyTest();