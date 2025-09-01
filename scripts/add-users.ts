import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUsers() {
  console.log('👥 Adding new users: Brian, Vlad, Andrii...');

  try {

    // Add Brian
    console.log('➕ Adding Brian...');
    const brian = await prisma.user.upsert({
      where: { email: 'brian@smartstart.com' },
      update: {
        name: 'Brian Johnson',
        xp: 180,
        reputation: 35,
        level: 'WISE_OWL',
        status: 'ACTIVE'
      },
      create: {
        email: 'brian@smartstart.com',
        name: 'Brian Johnson',
        xp: 180,
        reputation: 35,
        level: 'WISE_OWL',
        status: 'ACTIVE'
      }
    });

    // Add Vlad
    console.log('➕ Adding Vlad...');
    const vlad = await prisma.user.upsert({
      where: { email: 'vlad@smartstart.com' },
      update: {
        name: 'Vlad Petrov',
        xp: 320,
        reputation: 52,
        level: 'SKY_MASTER',
        status: 'ACTIVE'
      },
      create: {
        email: 'vlad@smartstart.com',
        name: 'Vlad Petrov',
        xp: 320,
        reputation: 52,
        level: 'SKY_MASTER',
        status: 'ACTIVE'
      }
    });

    // Add Andrii
    console.log('➕ Adding Andrii...');
    const andrii = await prisma.user.upsert({
      where: { email: 'andrii@smartstart.com' },
      update: {
        name: 'Andrii Kovalenko',
        xp: 95,
        reputation: 28,
        level: 'NIGHT_WATCHER',
        status: 'ACTIVE'
      },
      create: {
        email: 'andrii@smartstart.com',
        name: 'Andrii Kovalenko',
        xp: 95,
        reputation: 28,
        level: 'NIGHT_WATCHER',
        status: 'ACTIVE'
      }
    });

    // Add them to SmartStart Platform project
    console.log('🔗 Adding users to SmartStart Platform...');
    const smartstartProject = await prisma.project.findFirst({
      where: { name: 'SmartStart Platform' }
    });

    if (smartstartProject) {
      // Add Brian as owner
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: smartstartProject.id, userId: brian.id } },
        update: {
          role: 'OWNER',
          isActive: true
        },
        create: {
          projectId: smartstartProject.id,
          userId: brian.id,
          role: 'OWNER',
          isActive: true
        }
      });

      // Add Vlad as member
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: smartstartProject.id, userId: vlad.id } },
        update: {
          role: 'MEMBER',
          isActive: true
        },
        create: {
          projectId: smartstartProject.id,
          userId: vlad.id,
          role: 'MEMBER',
          isActive: true
        }
      });

      // Add Andrii as member
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: smartstartProject.id, userId: andrii.id } },
        update: {
          role: 'MEMBER',
          isActive: true
        },
        create: {
          projectId: smartstartProject.id,
          userId: andrii.id,
          role: 'MEMBER',
          isActive: true
        }
      });

      // Add cap entries for equity
      await prisma.capTableEntry.upsert({
        where: { projectId_holderType_holderId: { projectId: smartstartProject.id, holderType: 'USER', holderId: brian.id } },
        update: { pct: 35, source: 'INITIAL_OWNERSHIP' },
        create: {
          projectId: smartstartProject.id,
          holderType: 'USER',
          holderId: brian.id,
          pct: 35,
          source: 'INITIAL_OWNERSHIP'
        }
      });

      await prisma.capTableEntry.upsert({
        where: { projectId_holderType_holderId: { projectId: smartstartProject.id, holderType: 'USER', holderId: vlad.id } },
        update: { pct: 15, source: 'CONTRIBUTION' },
        create: {
          projectId: smartstartProject.id,
          holderType: 'USER',
          holderId: vlad.id,
          pct: 15,
          source: 'CONTRIBUTION'
        }
      });

      await prisma.capTableEntry.upsert({
        where: { projectId_holderType_holderId: { projectId: smartstartProject.id, holderType: 'USER', holderId: andrii.id } },
        update: { pct: 10, source: 'CONTRIBUTION' },
        create: {
          projectId: smartstartProject.id,
          holderType: 'USER',
          holderId: andrii.id,
          pct: 10,
          source: 'CONTRIBUTION'
        }
      });
    }

    // Note: Contributions would need tasks to exist first
    console.log('💼 Skipping contributions - tasks need to be created first');

    console.log('✅ Users added successfully!');
    console.log('👥 New users:');
    console.log('   - Brian Johnson (Owner): 35% equity, 180 XP');
    console.log('   - Vlad Petrov (Contributor): 15% equity, 320 XP');
    console.log('   - Andrii Kovalenko (Contributor): 10% equity, 95 XP');

  } catch (error) {
    console.error('❌ Error adding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addUsers()
  .then(() => {
    console.log('🎉 Users setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 User setup failed:', error);
    process.exit(1);
  });
