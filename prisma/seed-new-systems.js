const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedNewSystems() {
    console.log('🌱 Seeding new systems...');

    try {
        // Create billing plans
        console.log('📋 Creating billing plans...');
        const plans = [{
                name: 'Starter',
                description: 'Perfect for individual entrepreneurs and small teams',
                price: 29.99,
                currency: 'USD',
                interval: 'MONTHLY',
                features: [
                    'Up to 3 active projects',
                    'Basic collaboration tools',
                    'Standard support',
                    'Email notifications'
                ]
            },
            {
                name: 'Professional',
                description: 'Ideal for growing startups and medium teams',
                price: 99.99,
                currency: 'USD',
                interval: 'MONTHLY',
                features: [
                    'Up to 10 active projects',
                    'Advanced collaboration tools',
                    'Priority support',
                    'Real-time notifications',
                    'Advanced analytics',
                    'Custom integrations'
                ]
            },
            {
                name: 'Enterprise',
                description: 'For large organizations and enterprise teams',
                price: 299.99,
                currency: 'USD',
                interval: 'MONTHLY',
                features: [
                    'Unlimited projects',
                    'Enterprise collaboration tools',
                    '24/7 dedicated support',
                    'Real-time notifications',
                    'Advanced analytics',
                    'Custom integrations',
                    'SSO integration',
                    'Advanced security features'
                ]
            },
            {
                name: 'Lifetime',
                description: 'One-time payment for lifetime access',
                price: 2999.99,
                currency: 'USD',
                interval: 'LIFETIME',
                features: [
                    'Unlimited projects',
                    'All collaboration tools',
                    'Priority support',
                    'All features included',
                    'No recurring fees'
                ]
            }
        ];

        for (const planData of plans) {
            const existingPlan = await prisma.billingPlan.findFirst({
                where: { name: planData.name }
            });

            if (!existingPlan) {
                await prisma.billingPlan.create({
                    data: planData
                });
            }
        }

        // Create journey stages (NEW 6-STEP LOGICAL STRUCTURE)
        console.log('🚀 Creating journey stages...');
        const stages = [{
                name: 'Account Creation',
                description: 'Create your account and verify email',
                order: 1,
                gates: [{
                    name: 'Email Verification',
                    description: 'User must verify their email address',
                    gateType: 'VERIFICATION',
                    isRequired: true
                }]
            },
            {
                name: 'Profile Setup',
                description: 'Complete your profile with skills and experience',
                order: 2,
                gates: [{
                    name: 'Complete Profile',
                    description: 'User must complete their profile information',
                    gateType: 'PROFILE',
                    isRequired: true
                }]
            },
            {
                name: 'Platform Legal Pack',
                description: 'Sign required platform agreements',
                order: 3,
                gates: [{
                        name: 'Platform Legal Pack',
                        description: 'User must sign the platform legal pack',
                        gateType: 'LEGAL_PACK',
                        isRequired: true
                    },
                    {
                        name: 'Platform NDA',
                        description: 'User must sign the platform NDA',
                        gateType: 'NDA',
                        isRequired: true
                    }
                ]
            },
            {
                name: 'Subscription Selection',
                description: 'Choose your subscription plan',
                order: 4,
                gates: [{
                    name: 'Active Subscription',
                    description: 'User must have an active subscription',
                    gateType: 'SUBSCRIPTION',
                    isRequired: true
                }]
            },
            {
                name: 'Platform Orientation',
                description: 'Learn how the platform works',
                order: 5,
                gates: [{
                    name: 'Platform Understanding',
                    description: 'User must complete platform orientation',
                    gateType: 'ORIENTATION',
                    isRequired: true
                }]
            },
            {
                name: 'Welcome & Dashboard',
                description: 'Access your main dashboard',
                order: 6,
                gates: [{
                    name: 'Dashboard Access',
                    description: 'User must complete onboarding and access dashboard',
                    gateType: 'DASHBOARD',
                    isRequired: true
                }]
            }
        ];

        for (const stageData of stages) {
            const { gates, ...stageInfo } = stageData;

            const existingStage = await prisma.journeyStage.findFirst({
                where: { name: stageInfo.name }
            });

            let stage;
            if (!existingStage) {
                stage = await prisma.journeyStage.create({
                    data: stageInfo
                });
            } else {
                stage = existingStage;
            }

            // Create gates for this stage
            for (const gateData of gates) {
                const existingGate = await prisma.journeyGate.findFirst({
                    where: {
                        stageId: stage.id,
                        name: gateData.name
                    }
                });

                if (!existingGate) {
                    await prisma.journeyGate.create({
                        data: {
                            ...gateData,
                            stageId: stage.id
                        }
                    });
                }
            }
        }

        console.log('✅ New systems seeded successfully!');
        console.log(`📋 Created ${plans.length} billing plans`);
        console.log(`🚀 Created ${stages.length} journey stages`);

    } catch (error) {
        console.error('❌ Error seeding new systems:', error);
        throw error;
    }
}

// Run the seed function
seedNewSystems()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });