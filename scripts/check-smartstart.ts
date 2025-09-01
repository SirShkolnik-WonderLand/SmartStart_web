import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSmartStart() {
  console.log('🔍 Checking SmartStart project status...');

  try {
    // Get the SmartStart project
    const smartStartProject = await prisma.project.findUnique({
      where: { id: 'demo-project-1' },
      include: {
        capEntries: true,
        members: {
          include: {
            user: true
          }
        },
        submission: true
      }
    });

    if (!smartStartProject) {
      console.log('❌ SmartStart project not found.');
      return;
    }

    console.log(`✅ SmartStart project: ${smartStartProject.name}`);
    console.log(`   - Summary: ${smartStartProject.summary}`);
    console.log(`   - Owner: ${smartStartProject.ownerId}`);
    console.log(`   - Contract Version: ${smartStartProject.contractVersion}`);
    console.log(`   - Equity Model: ${smartStartProject.equityModel}`);
    console.log(`   - Vesting Schedule: ${smartStartProject.vestingSchedule}`);

    console.log('\n📊 Cap Table Entries:');
    smartStartProject.capEntries.forEach(entry => {
      console.log(`   - ${entry.holderType}: ${entry.pct}% (${entry.source})`);
    });

    console.log('\n👥 Project Members:');
    smartStartProject.members.forEach(member => {
      console.log(`   - ${member.user.email}: ${member.role}`);
    });

    if (smartStartProject.submission) {
      console.log('\n📋 Project Submission:');
      console.log(`   - Status: ${smartStartProject.submission.status}`);
      console.log(`   - Category: ${smartStartProject.submission.category}`);
      console.log(`   - Owner Equity: ${smartStartProject.submission.ownerEquityProposal}%`);
      console.log(`   - Alice Equity: ${smartStartProject.submission.aliceEquityProposal}%`);
      console.log(`   - Contributor Pool: ${smartStartProject.submission.contributorEquityPool}%`);
      console.log(`   - Reserve: ${smartStartProject.submission.reserveEquity}%`);
    }

  } catch (error) {
    console.error('❌ Error checking SmartStart project:', error);
  }
}

checkSmartStart()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
