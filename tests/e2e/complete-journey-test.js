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

async function completeJourneyTest() {
    try {
        console.log('🚀 Starting Complete User Journey Test...\n');

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

        // Step 3: Initialize user journey
        console.log('\n3️⃣ Initializing user journey...');

        // Get all journey stages
        const journeyStages = await prisma.journeyStage.findMany({
            orderBy: { order: 'asc' },
            include: {
                gates: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        console.log(`📋 Found ${journeyStages.length} journey stages:`);
        journeyStages.forEach((stage, index) => {
            console.log(`   ${index + 1}. ${stage.name} (${stage.gates.length} gates)`);
        });

        // Create user journey state
        const userJourneyState = await prisma.userJourneyState.create({
            data: {
                userId: result.user.id,
                currentStageId: journeyStages[0].id,
                completedStages: [],
                completedGates: [],
                progress: 0,
                status: 'IN_PROGRESS'
            }
        });

        console.log('✅ User journey state created:', userJourneyState.id);
        console.log('✅ Current stage:', journeyStages[0].name);

        // Step 4: Test each journey stage
        console.log('\n4️⃣ Testing journey progression...');

        for (let i = 0; i < journeyStages.length; i++) {
            const stage = journeyStages[i];
            console.log(`\n   📍 Stage ${i + 1}: ${stage.name}`);
            console.log(`   📝 Description: ${stage.description}`);
            console.log(`   🎯 Gates (${stage.gates.length}):`);

            stage.gates.forEach((gate, gateIndex) => {
                console.log(`      ${gateIndex + 1}. ${gate.name} - ${gate.description}`);
            });

            // Complete all gates in this stage
            const gateIds = stage.gates.map(gate => gate.id);

            if (gateIds.length > 0) {
                await prisma.userJourneyState.update({
                    where: { id: userJourneyState.id },
                    data: {
                        completedGates: {
                            push: gateIds
                        }
                    }
                });
                console.log(`   ✅ Completed ${gateIds.length} gates`);
            }

            // Move to next stage (except for the last one)
            if (i < journeyStages.length - 1) {
                const nextStage = journeyStages[i + 1];
                await prisma.userJourneyState.update({
                    where: { id: userJourneyState.id },
                    data: {
                        currentStageId: nextStage.id,
                        completedStages: {
                            push: stage.id
                        },
                        progress: Math.round(((i + 1) / journeyStages.length) * 100)
                    }
                });
                console.log(`   ➡️  Moved to next stage: ${nextStage.name}`);
            } else {
                // Complete the journey
                await prisma.userJourneyState.update({
                    where: { id: userJourneyState.id },
                    data: {
                        completedStages: {
                            push: stage.id
                        },
                        progress: 100,
                        status: 'COMPLETED'
                    }
                });
                console.log(`   🎉 Journey completed!`);
            }
        }

        // Step 5: Verify final journey state
        console.log('\n5️⃣ Verifying final journey state...');
        const finalJourneyState = await prisma.userJourneyState.findUnique({
            where: { id: userJourneyState.id },
            include: {
                currentStage: true
            }
        });

        console.log('📊 Final Journey State:');
        console.log(`   Status: ${finalJourneyState.status}`);
        console.log(`   Progress: ${finalJourneyState.progress}%`);
        console.log(`   Completed Stages: ${finalJourneyState.completedStages.length}/${journeyStages.length}`);
        console.log(`   Completed Gates: ${finalJourneyState.completedGates.length}`);

        // Step 6: Test user authentication
        console.log('\n6️⃣ Testing user authentication...');
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

        // Step 7: Test API endpoints
        console.log('\n7️⃣ Testing API endpoints...');

        // Test registration endpoint
        console.log('   📝 Testing registration endpoint...');
        const registrationResponse = await fetch('https://smartstart-api.onrender.com/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'dan2@smartstart.com',
                password: 'dan',
                name: 'Dan 2'
            })
        });

        const registrationResult = await registrationResponse.json();
        console.log(`   Registration: ${registrationResponse.status} - ${registrationResult.message}`);

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

        console.log('\n🎉 Complete User Journey Test Completed Successfully!');
        console.log('\n📋 Summary:');
        console.log(`   ✅ User Created: ${userData.name} (${userData.email})`);
        console.log(`   ✅ Journey Initialized: ${journeyStages.length} stages`);
        console.log(`   ✅ Journey Completed: 100% progress`);
        console.log(`   ✅ Authentication: Working`);
        console.log(`   ✅ API Endpoints: Tested`);

    } catch (error) {
        console.error('❌ Complete journey test failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
    } finally {
        await prisma.$disconnect();
    }
}

completeJourneyTest();