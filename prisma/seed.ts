import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smartstart.com' },
    update: {},
    create: {
      email: 'admin@smartstart.com',
      name: 'Admin User',
      level: 'SKY_MASTER',
      xp: 1000,
      reputation: 100,
      account: {
        create: {
          email: 'admin@smartstart.com',
          password: await bcrypt.hash('admin123', 12),
          role: 'ADMIN'
        }
      }
    }
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@demo.local' },
    update: {},
    create: {
      email: 'owner@demo.local',
      name: 'Project Owner',
      level: 'WISE_OWL',
      xp: 750,
      reputation: 75,
      account: {
        create: {
          email: 'owner@demo.local',
          password: await bcrypt.hash('owner123', 12),
          role: 'OWNER'
        }
      }
    }
  });

  const contributorUser = await prisma.user.upsert({
    where: { email: 'contrib@demo.local' },
    update: {},
    create: {
      email: 'contrib@demo.local',
      name: 'Contributor',
      level: 'NIGHT_WATCHER',
      xp: 500,
      reputation: 50,
      account: {
        create: {
          email: 'contrib@demo.local',
          password: await bcrypt.hash('contrib123', 12),
          role: 'CONTRIBUTOR'
        }
      }
    }
  });

  // Create demo project
  const demoProject = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      name: 'SmartStart Platform',
      summary: 'A comprehensive platform for community-driven development with transparent ownership tracking.',
      ownerId: ownerUser.id,
      ownerMinPct: 35,
      aliceCapPct: 25,
      reservePct: 40
    }
  });

  // Create cap table entries
  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-1' },
    update: {},
    create: {
      id: 'cap-entry-1',
      projectId: demoProject.id,
      holderId: ownerUser.id,
      holderType: 'OWNER',
      pct: 35.0,
      source: 'Initial ownership'
    }
  });

  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-2' },
    update: {},
    create: {
      id: 'cap-entry-2',
      projectId: demoProject.id,
      holderId: contributorUser.id,
      holderType: 'USER',
      pct: 5.0,
      source: 'Contribution reward'
    }
  });

  // Create demo ideas
  await prisma.idea.upsert({
    where: { id: 'idea-1' },
    update: {},
    create: {
      id: 'idea-1',
      title: 'Mobile App Development',
      body: 'Create a mobile companion app for the SmartStart platform to enable on-the-go project management and real-time collaboration.',
      status: 'ACTIVE',
      proposerId: contributorUser.id,
      projectId: demoProject.id
    }
  });

  // Create demo polls
  await prisma.poll.upsert({
    where: { id: 'poll-1' },
    update: {},
    create: {
      id: 'poll-1',
      question: 'Which feature should we prioritize next?',
      type: 'MULTIPLE_CHOICE',
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      projectId: demoProject.id
    }
  });

  // Create demo mesh items
  await prisma.meshItem.upsert({
    where: { id: 'mesh-1' },
    update: {},
    create: {
      id: 'mesh-1',
      type: 'WIN',
      title: 'Platform Launch Success',
      description: 'Successfully launched the SmartStart platform with all core features!',
      authorId: ownerUser.id,
      projectId: demoProject.id
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - ${adminUser.email} (ADMIN)`);
  console.log(`   - ${ownerUser.email} (OWNER)`);
  console.log(`   - ${contributorUser.email} (CONTRIBUTOR)`);
  console.log(`   - Demo project: ${demoProject.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
