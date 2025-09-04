#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Journey stages based on the VentureGate journey
const journeyStages = [
  {
    name: 'discover',
    description: 'Explore the SmartStart ecosystem and see what we offer',
    order: 1,
    gates: [
      {
        name: 'Platform Exploration',
        description: 'User has browsed public content',
        gateType: 'VERIFICATION',
        isRequired: false
      }
    ]
  },
  {
    name: 'create-account',
    description: 'Establish your identity and accept our terms',
    order: 2,
    gates: [
      {
        name: 'Account Creation',
        description: 'User has created an account',
        gateType: 'VERIFICATION',
        isRequired: true
      },
      {
        name: 'Email Verification',
        description: 'User has verified their email',
        gateType: 'VERIFICATION',
        isRequired: true
      }
    ]
  },
  {
    name: 'verify-secure',
    description: 'Complete security setup and identity verification',
    order: 3,
    gates: [
      {
        name: 'MFA Setup',
        description: 'Multi-factor authentication enabled',
        gateType: 'VERIFICATION',
        isRequired: true
      },
      {
        name: 'Device Verification',
        description: 'Device security verified',
        gateType: 'VERIFICATION',
        isRequired: true
      },
      {
        name: 'KYC Completion',
        description: 'Know Your Customer verification completed',
        gateType: 'VERIFICATION',
        isRequired: true
      }
    ]
  },
  {
    name: 'choose-plan',
    description: 'Select your subscription tier and complete payment',
    order: 4,
    gates: [
      {
        name: 'Subscription Active',
        description: 'User has an active subscription',
        gateType: 'SUBSCRIPTION',
        isRequired: true
      }
    ]
  },
  {
    name: 'platform-legal',
    description: 'Sign the mandatory platform participation agreement',
    order: 5,
    gates: [
      {
        name: 'Platform Legal Pack',
        description: 'Platform Participation Agreement signed',
        gateType: 'LEGAL_PACK',
        isRequired: true
      },
      {
        name: 'Mutual NDA',
        description: 'Mutual NDA signed',
        gateType: 'NDA',
        isRequired: true
      }
    ]
  },
  {
    name: 'profile-fit',
    description: 'Complete your profile for better matching',
    order: 6,
    gates: [
      {
        name: 'Profile Complete',
        description: 'User profile is complete',
        gateType: 'PROFILE',
        isRequired: true
      }
    ]
  },
  {
    name: 'explore-ventures',
    description: 'Browse and discover projects in safe mode',
    order: 7,
    gates: [
      {
        name: 'Venture Exploration',
        description: 'User has explored ventures',
        gateType: 'VERIFICATION',
        isRequired: false
      }
    ]
  },
  {
    name: 'offer-contribute',
    description: 'Submit structured offers to projects',
    order: 8,
    gates: [
      {
        name: 'Contribution Offer',
        description: 'User has submitted a contribution offer',
        gateType: 'VERIFICATION',
        isRequired: false
      }
    ]
  },
  {
    name: 'project-nda',
    description: 'Sign project-specific confidentiality agreements',
    order: 9,
    gates: [
      {
        name: 'Project NDA',
        description: 'Project-specific NDA signed',
        gateType: 'NDA',
        isRequired: false
      }
    ]
  },
  {
    name: 'approval-provisioning',
    description: 'Get approved and receive access to project resources',
    order: 10,
    gates: [
      {
        name: 'Project Approval',
        description: 'User has been approved for a project',
        gateType: 'VERIFICATION',
        isRequired: false
      }
    ]
  },
  {
    name: 'work-track-reward',
    description: 'Contribute to projects and earn rewards',
    order: 11,
    gates: [
      {
        name: 'Active Contribution',
        description: 'User is actively contributing to projects',
        gateType: 'VERIFICATION',
        isRequired: false
      }
    ]
  }
];

async function seedJourneyStages() {
  console.log('🌱 Seeding journey stages...');

  try {
    // Clear existing data in correct order (respecting foreign key constraints)
    await prisma.userJourneyState.deleteMany({});
    await prisma.journeyGate.deleteMany({});
    await prisma.journeyStage.deleteMany({});

    // Create stages with gates
    for (const stageData of journeyStages) {
      const { gates, ...stageInfo } = stageData;
      
      const stage = await prisma.journeyStage.create({
        data: stageInfo
      });

      console.log(`✅ Created stage: ${stage.name} (order: ${stage.order})`);

      // Create gates for this stage
      for (const gateData of gates) {
        await prisma.journeyGate.create({
          data: {
            ...gateData,
            stageId: stage.id
          }
        });
        console.log(`  ✅ Created gate: ${gateData.name} (${gateData.gateType})`);
      }
    }

    console.log('🎉 Journey stages seeded successfully!');
    console.log(`📊 Created ${journeyStages.length} stages with gates`);

  } catch (error) {
    console.error('❌ Error seeding journey stages:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedJourneyStages();
  } catch (error) {
    console.error('Failed to seed journey stages:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedJourneyStages };
