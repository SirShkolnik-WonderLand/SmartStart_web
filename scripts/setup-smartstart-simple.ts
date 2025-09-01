import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupSmartStart() {
  console.log('🚀 Setting up SmartStart as a project...');

  try {
    // Get the existing SmartStart project
    const smartStartProject = await prisma.project.findUnique({
      where: { id: 'demo-project-1' }
    });

    if (!smartStartProject) {
      console.log('❌ SmartStart project not found.');
      return;
    }

    console.log(`✅ Found SmartStart project: ${smartStartProject.name}`);

    // Update the project with enhanced details
    await prisma.project.update({
      where: { id: 'demo-project-1' },
      data: {
        summary: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
        contractVersion: 'v2.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        updatedAt: new Date()
      }
    });

    // Create project submission for 30-day launch pipeline
    await prisma.projectSub.upsert({
      where: { projectId: smartStartProject.id },
      update: {
        title: 'SmartStart Platform',
        description: 'A comprehensive platform for community-driven development with transparent ownership tracking, smart contracts, equity management, and collaborative project management.',
        category: 'SAAS',
        marketSize: 'Global developer community and startup ecosystem',
        targetAudience: 'Developers, entrepreneurs, and startup teams',
        competitiveAdvantage: 'Transparent equity tracking, smart contracts, and community-driven development',
        revenueModel: 'Subscription + Transaction fees',
        estimatedFunding: 500000,
        timeline: '30-day launch pipeline',
        ownerEquityProposal: 35,
        aliceEquityProposal: 25,
        contributorEquityPool: 25,
        reserveEquity: 15,
        status: 'APPROVED',
        reviewedAt: new Date()
      },
      create: {
        projectId: smartStartProject.id,
        title: 'SmartStart Platform',
        description: 'A comprehensive platform for community-driven development with transparent ownership tracking, smart contracts, equity management, and collaborative project management.',
        category: 'SAAS',
        marketSize: 'Global developer community and startup ecosystem',
        targetAudience: 'Developers, entrepreneurs, and startup teams',
        competitiveAdvantage: 'Transparent equity tracking, smart contracts, and community-driven development',
        revenueModel: 'Subscription + Transaction fees',
        estimatedFunding: 500000,
        timeline: '30-day launch pipeline',
        ownerEquityProposal: 35,
        aliceEquityProposal: 25,
        contributorEquityPool: 25,
        reserveEquity: 15,
        status: 'APPROVED',
        reviewedAt: new Date()
      }
    });

    // Create enhanced cap table entries for SmartStart
    await prisma.capTableEntry.upsert({
      where: { id: 'smartstart-owner-equity' },
      update: {
        pct: 35.0,
        source: 'SmartStart Platform ownership'
      },
      create: {
        id: 'smartstart-owner-equity',
        projectId: smartStartProject.id,
        holderId: 'cmewdcma80002ulb6wl0lzhoo', // owner@demo.local
        holderType: 'OWNER',
        pct: 35.0,
        source: 'SmartStart Platform ownership'
      }
    });

    await prisma.capTableEntry.upsert({
      where: { id: 'smartstart-alice-equity' },
      update: {
        pct: 25.0,
        source: 'AliceSolutions Ventures equity'
      },
      create: {
        id: 'smartstart-alice-equity',
        projectId: smartStartProject.id,
        holderId: 'cmew8aq5f000010kzad09rhg7', // admin@smartstart.com
        holderType: 'ALICE',
        pct: 25.0,
        source: 'AliceSolutions Ventures equity'
      }
    });

    await prisma.capTableEntry.upsert({
      where: { id: 'smartstart-contributor-pool' },
      update: {
        pct: 25.0,
        source: 'Contributor pool for team members'
      },
      create: {
        id: 'smartstart-contributor-pool',
        projectId: smartStartProject.id,
        holderId: 'cmewdcmfw0004ulb6vbjzc3qi', // contrib@demo.local
        holderType: 'USER',
        pct: 25.0,
        source: 'Contributor pool for team members'
      }
    });

    await prisma.capTableEntry.upsert({
      where: { id: 'smartstart-reserve-equity' },
      update: {
        pct: 15.0,
        source: 'Reserve for future investors and expansion'
      },
      create: {
        id: 'smartstart-reserve-equity',
        projectId: smartStartProject.id,
        holderId: 'cmew8aq5f000010kzad09rhg7', // admin@smartstart.com
        holderType: 'RESERVE',
        pct: 15.0,
        source: 'Reserve for future investors and expansion'
      }
    });

    // Create enhanced project memberships
    await prisma.projectMember.upsert({
      where: { id: 'smartstart-owner-member' },
      update: {
        role: 'OWNER'
      },
      create: {
        id: 'smartstart-owner-member',
        projectId: smartStartProject.id,
        userId: 'cmewdcma80002ulb6wl0lzhoo', // owner@demo.local
        role: 'OWNER'
      }
    });

    await prisma.projectMember.upsert({
      where: { id: 'smartstart-admin-member' },
      update: {
        role: 'MEMBER'
      },
      create: {
        id: 'smartstart-admin-member',
        projectId: smartStartProject.id,
        userId: 'cmew8aq5f000010kzad09rhg7', // admin@smartstart.com
        role: 'MEMBER'
      }
    });

    await prisma.projectMember.upsert({
      where: { id: 'smartstart-contrib-member' },
      update: {
        role: 'MEMBER'
      },
      create: {
        id: 'smartstart-contrib-member',
        projectId: smartStartProject.id,
        userId: 'cmewdcmfw0004ulb6vbjzc3qi', // contrib@demo.local
        role: 'MEMBER'
      }
    });

    console.log('✅ SmartStart project setup completed successfully!');
    console.log('📊 SmartStart Platform Details:');
    console.log(`   - Project ID: ${smartStartProject.id}`);
    console.log(`   - Owner: owner@demo.local (35% equity)`);
    console.log(`   - AliceSolutions: admin@smartstart.com (25% equity)`);
    console.log(`   - Contributor Pool: contrib@demo.local (25% equity)`);
    console.log(`   - Reserve: 15% for future expansion`);
    console.log(`   - Status: 30-day launch pipeline active`);

  } catch (error) {
    console.error('❌ Error setting up SmartStart project:', error);
    throw error;
  }
}

setupSmartStart()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
