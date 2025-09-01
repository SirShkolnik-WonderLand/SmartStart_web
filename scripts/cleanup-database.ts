import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');

  try {
    // 1. Delete all projects except SmartStart Platform
    console.log('📋 Deleting old projects...');
    const projectsToDelete = await prisma.project.findMany({
      where: {
        name: {
          not: 'SmartStart Platform'
        }
      }
    });

    for (const project of projectsToDelete) {
      console.log(`🗑️  Deleting project: ${project.name}`);
      
      // Delete related data first
      await prisma.capTableEntry.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.projectMember.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.contribution.deleteMany({
        where: {
          task: { projectId: project.id }
        }
      });
      
      await prisma.task.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.sprint.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.projectVisibility.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.projectInsight.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.meshItem.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.message.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.idea.deleteMany({
        where: { projectId: project.id }
      });
      
      await prisma.pollVote.deleteMany({
        where: { 
          poll: { projectId: project.id }
        }
      });
      
      await prisma.poll.deleteMany({
        where: { projectId: project.id }
      });
      
      // Delete the project
      await prisma.project.delete({
        where: { id: project.id }
      });
    }

    // 2. Update SmartStart Platform to have realistic portfolio data
    console.log('📊 Updating SmartStart Platform data...');
    const smartstartProject = await prisma.project.findFirst({
      where: { name: 'SmartStart Platform' }
    });

    if (smartstartProject) {
      // Update project with more realistic data
      await prisma.project.update({
        where: { id: smartstartProject.id },
        data: {
          summary: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
          totalValue: 500000, // $500K instead of $3.7M
          activeMembers: 4
        }
      });

      // Update cap entries to be more realistic
      await prisma.capTableEntry.updateMany({
        where: { 
          projectId: smartstartProject.id,
          holderType: 'USER'
        },
        data: {
          pct: 35 // 35% for the main user
        }
      });
    }

    // 3. Clean up old contributions
    console.log('💼 Cleaning up old contributions...');
    await prisma.contribution.deleteMany({
      where: {
        task: {
          project: {
            name: {
              not: 'SmartStart Platform'
            }
          }
        }
      }
    });

    // 4. Clean up old mesh items
    console.log('🌐 Cleaning up old mesh items...');
    await prisma.meshItem.deleteMany({
      where: {
        projectId: {
          not: smartstartProject?.id
        }
      }
    });

    // 5. Reset user data to be more realistic
    console.log('👤 Updating user data...');
    await prisma.user.updateMany({
              data: {
          xp: 250, // Lower XP
          reputation: 45, // Lower reputation
          level: 'WISE_OWL'
        }
    });

    console.log('✅ Database cleanup completed successfully!');
    console.log('📊 Portfolio now shows realistic data:');
    console.log('   - SmartStart Platform: $500K value');
    console.log('   - User equity: 35%');
    console.log('   - XP: 250, Reputation: 45');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('🎉 Database cleanup finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
