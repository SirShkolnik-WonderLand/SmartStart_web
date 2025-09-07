const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting journey stages seed...')

    // Define the complete onboarding journey stages
    const journeyStages = [{
            name: 'Account Creation',
            description: 'Create account and verify email',
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
            description: 'Complete user profile information',
            order: 2,
            gates: [{
                    name: 'Basic Profile',
                    description: 'Complete name, bio, and basic information',
                    gateType: 'PROFILE',
                    isRequired: true
                },
                {
                    name: 'Skills & Experience',
                    description: 'Add skills and professional experience',
                    gateType: 'PROFILE',
                    isRequired: false
                }
            ]
        },
        {
            name: 'Platform Legal Pack',
            description: 'Sign required legal documents',
            order: 3,
            gates: [{
                    name: 'Confidentiality Agreement',
                    description: 'Sign confidentiality agreement',
                    gateType: 'LEGAL_PACK',
                    isRequired: true
                },
                {
                    name: 'Equity Agreement',
                    description: 'Sign equity agreement',
                    gateType: 'LEGAL_PACK',
                    isRequired: true
                },
                {
                    name: 'Partnership Agreement',
                    description: 'Sign partnership agreement',
                    gateType: 'LEGAL_PACK',
                    isRequired: true
                }
            ]
        },
        {
            name: 'Subscription Selection',
            description: 'Choose subscription plan',
            order: 4,
            gates: [{
                    name: 'Plan Selection',
                    description: 'Select subscription plan',
                    gateType: 'SUBSCRIPTION',
                    isRequired: true
                },
                {
                    name: 'Payment Processing',
                    description: 'Complete payment for subscription',
                    gateType: 'PAYMENT',
                    isRequired: true
                }
            ]
        },
        {
            name: 'Platform Orientation',
            description: 'Learn platform features and capabilities',
            order: 5,
            gates: [{
                    name: 'Dashboard Tour',
                    description: 'Complete dashboard orientation',
                    gateType: 'VERIFICATION',
                    isRequired: false
                },
                {
                    name: 'Feature Overview',
                    description: 'Learn about key platform features',
                    gateType: 'VERIFICATION',
                    isRequired: false
                }
            ]
        },
        {
            name: 'Welcome & Dashboard',
            description: 'Access main dashboard and start using platform',
            order: 6,
            gates: [{
                name: 'Dashboard Access',
                description: 'Successfully access main dashboard',
                gateType: 'VERIFICATION',
                isRequired: true
            }]
        }
    ]

    // Create journey stages with gates
    for (const stageData of journeyStages) {
        const { gates, ...stageInfo } = stageData

        // Check if stage already exists
        let stage = await prisma.journeyStage.findFirst({
            where: { name: stageInfo.name }
        })

        if (!stage) {
            stage = await prisma.journeyStage.create({
                data: {
                    name: stageInfo.name,
                    description: stageInfo.description,
                    order: stageInfo.order,
                    isActive: true
                }
            })
        } else {
            stage = await prisma.journeyStage.update({
                where: { id: stage.id },
                data: {
                    description: stageInfo.description,
                    order: stageInfo.order,
                    isActive: true
                }
            })
        }

        console.log(`✅ Created/Updated stage: ${stage.name}`)

        // Create gates for this stage
        for (const gateData of gates) {
            // Check if gate already exists
            let gate = await prisma.journeyGate.findFirst({
                where: {
                    stageId: stage.id,
                    name: gateData.name
                }
            })

            if (!gate) {
                gate = await prisma.journeyGate.create({
                    data: {
                        stageId: stage.id,
                        name: gateData.name,
                        description: gateData.description,
                        gateType: gateData.gateType,
                        isRequired: gateData.isRequired,
                        isActive: true
                    }
                })
            } else {
                gate = await prisma.journeyGate.update({
                    where: { id: gate.id },
                    data: {
                        description: gateData.description,
                        gateType: gateData.gateType,
                        isRequired: gateData.isRequired,
                        isActive: true
                    }
                })
            }

            console.log(`  ✅ Created/Updated gate: ${gateData.name}`)
        }
    }

    // Create subscription plans
    const subscriptionPlans = [{
        name: 'All Features Pack',
        description: 'Complete access to all SmartStart platform features',
        price: 100.00,
        currency: 'CAD',
        interval: 'MONTHLY',
        features: [
            'Unlimited Ventures',
            'All Legal Documents',
            'Unlimited Team Members',
            'Full Gamification System',
            'Complete Analytics',
            'Full API Access',
            'Priority Support'
        ],
        isActive: true
    }]

    for (const planData of subscriptionPlans) {
        // Check if plan already exists
        let plan = await prisma.billingPlan.findFirst({
            where: { name: planData.name }
        })

        if (!plan) {
            plan = await prisma.billingPlan.create({
                data: {
                    name: planData.name,
                    description: planData.description,
                    price: planData.price,
                    currency: planData.currency,
                    interval: planData.interval,
                    features: planData.features,
                    isActive: planData.isActive
                }
            })
        } else {
            plan = await prisma.billingPlan.update({
                where: { id: plan.id },
                data: {
                    description: planData.description,
                    price: planData.price,
                    currency: planData.currency,
                    interval: planData.interval,
                    features: planData.features,
                    isActive: planData.isActive
                }
            })
        }

        console.log(`✅ Created/Updated subscription plan: ${plan.name}`)
    }

    console.log('🎉 Journey stages and subscription plans seeded successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding journey stages:', e)
        process.exit(1)
    })
    .finally(async() => {
        await prisma.$disconnect()
    })