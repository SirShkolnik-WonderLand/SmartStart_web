import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');

  try {
    // First, let's identify the SmartStart Platform project
    const smartStartProject = await prisma.project.findFirst({
      where: {
        name: {
          contains: 'SmartStart'
        }
      }
    });

    if (!smartStartProject) {
      console.log('❌ SmartStart Platform project not found. Creating it...');
      // Create SmartStart Platform if it doesn't exist
      const owner = await prisma.user.findFirst({
        where: {
          email: 'alice@alicesolutions.com'
        }
      });

      if (!owner) {
        console.log('❌ Alice user not found. Please create the SmartStart Platform manually.');
        return;
      }

      const newProject = await prisma.project.create({
        data: {
          name: 'SmartStart Platform',
          summary: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
          ownerId: owner.id,
          contractVersion: 'v2.0',
          equityModel: 'DYNAMIC',
          vestingSchedule: 'IMMEDIATE',
          totalValue: 500000, // $500K instead of $3.7M
          activeMembers: 4,
          completionRate: 75,
          lastActivity: new Date(),
          ownerMinPct: 35,
          aliceCapPct: 25,
          reservePct: 40
        }
      });

      console.log('✅ Created SmartStart Platform project');
    }

    // Delete all projects except SmartStart Platform
    const projectsToDelete = await prisma.project.findMany({
      where: {
        name: {
          not: {
            contains: 'SmartStart'
          }
        }
      }
    });

    console.log(`🗑️ Found ${projectsToDelete.length} projects to delete`);

    for (const project of projectsToDelete) {
      console.log(`🗑️ Deleting project: ${project.name}`);

      // Delete in correct order to avoid foreign key constraints
      await prisma.projectInsight.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.projectSub.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.legalDocument.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.equityVesting.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.contractSignature.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.contractOffer.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.meshItem.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.message.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.poll.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.idea.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.task.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.sprint.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.capTableEntry.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.projectVisibility.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.projectMember.deleteMany({
        where: { projectId: project.id }
      });

      await prisma.project.delete({
        where: { id: project.id }
      });
    }

    // Clean up orphaned data
    console.log('🧹 Cleaning up orphaned data...');

    // Delete orphaned contributions (not linked to SmartStart)
    const smartStartProjectId = (await prisma.project.findFirst({
      where: {
        name: {
          contains: 'SmartStart'
        }
      }
    }))?.id;

    if (smartStartProjectId) {
      await prisma.contribution.deleteMany({
        where: {
          task: {
            projectId: {
              not: smartStartProjectId
            }
          }
        }
      });
    }

    // Update SmartStart Platform with realistic data
    if (smartStartProjectId) {
      await prisma.project.update({
        where: { id: smartStartProjectId },
        data: {
          totalValue: 500000, // $500K instead of $3.7M
          activeMembers: 4,
          completionRate: 75,
          lastActivity: new Date()
        }
      });

      console.log('✅ Updated SmartStart Platform with realistic data');
    }

    console.log('✅ Database cleanup completed successfully!');
    console.log('📊 SmartStart Platform is now the only project with realistic portfolio values');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();
