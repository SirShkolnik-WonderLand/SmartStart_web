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

  // Create demo projects
  const demoProject1 = await prisma.project.upsert({
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

  const demoProject2 = await prisma.project.upsert({
    where: { id: 'demo-project-2' },
    update: {},
    create: {
      id: 'demo-project-2',
      name: 'AI Marketing Tool',
      summary: 'AI-powered marketing automation platform for small businesses.',
      ownerId: adminUser.id,
      ownerMinPct: 40,
      aliceCapPct: 20,
      reservePct: 40
    }
  });

  const demoProject3 = await prisma.project.upsert({
    where: { id: 'demo-project-3' },
    update: {},
    create: {
      id: 'demo-project-3',
      name: 'E-commerce Platform',
      summary: 'Modern e-commerce solution with advanced inventory management.',
      ownerId: contributorUser.id,
      ownerMinPct: 30,
      aliceCapPct: 25,
      reservePct: 45
    }
  });

  const demoProject4 = await prisma.project.upsert({
    where: { id: 'demo-project-4' },
    update: {},
    create: {
      id: 'demo-project-4',
      name: 'Mobile App Framework',
      summary: 'Cross-platform mobile development framework for rapid app creation.',
      ownerId: adminUser.id,
      ownerMinPct: 45,
      aliceCapPct: 15,
      reservePct: 40
    }
  });

  // Create project memberships
  await prisma.projectMember.upsert({
    where: { id: 'member-1' },
    update: {},
    create: {
      id: 'member-1',
      projectId: demoProject1.id,
      userId: ownerUser.id,
      role: 'OWNER'
    }
  });

  await prisma.projectMember.upsert({
    where: { id: 'member-2' },
    update: {},
    create: {
      id: 'member-2',
      projectId: demoProject1.id,
      userId: contributorUser.id,
      role: 'CONTRIBUTOR'
    }
  });

  await prisma.projectMember.upsert({
    where: { id: 'member-3' },
    update: {},
    create: {
      id: 'member-3',
      projectId: demoProject2.id,
      userId: adminUser.id,
      role: 'OWNER'
    }
  });

  await prisma.projectMember.upsert({
    where: { id: 'member-4' },
    update: {},
    create: {
      id: 'member-4',
      projectId: demoProject2.id,
      userId: ownerUser.id,
      role: 'CONTRIBUTOR'
    }
  });

  await prisma.projectMember.upsert({
    where: { id: 'member-5' },
    update: {},
    create: {
      id: 'member-5',
      projectId: demoProject3.id,
      userId: contributorUser.id,
      role: 'OWNER'
    }
  });

  await prisma.projectMember.upsert({
    where: { id: 'member-6' },
    update: {},
    create: {
      id: 'member-6',
      projectId: demoProject3.id,
      userId: adminUser.id,
      role: 'CONTRIBUTOR'
    }
  });

  await prisma.projectMember.upsert({
    where: { id: 'member-7' },
    update: {},
    create: {
      id: 'member-7',
      projectId: demoProject4.id,
      userId: adminUser.id,
      role: 'OWNER'
    }
  });

  await prisma.projectMember.upsert({
    where: { id: 'member-8' },
    update: {},
    create: {
      id: 'member-8',
      projectId: demoProject4.id,
      userId: ownerUser.id,
      role: 'CONTRIBUTOR'
    }
  });

  // Create cap table entries
  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-1' },
    update: {},
    create: {
      id: 'cap-entry-1',
      projectId: demoProject1.id,
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
      projectId: demoProject1.id,
      holderId: contributorUser.id,
      holderType: 'USER',
      pct: 5.0,
      source: 'Contribution reward'
    }
  });

  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-3' },
    update: {},
    create: {
      id: 'cap-entry-3',
      projectId: demoProject2.id,
      holderId: adminUser.id,
      holderType: 'OWNER',
      pct: 40.0,
      source: 'Initial ownership'
    }
  });

  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-4' },
    update: {},
    create: {
      id: 'cap-entry-4',
      projectId: demoProject2.id,
      holderId: ownerUser.id,
      holderType: 'USER',
      pct: 4.0,
      source: 'Contribution reward'
    }
  });

  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-5' },
    update: {},
    create: {
      id: 'cap-entry-5',
      projectId: demoProject3.id,
      holderId: contributorUser.id,
      holderType: 'OWNER',
      pct: 30.0,
      source: 'Initial ownership'
    }
  });

  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-6' },
    update: {},
    create: {
      id: 'cap-entry-6',
      projectId: demoProject3.id,
      holderId: adminUser.id,
      holderType: 'USER',
      pct: 4.0,
      source: 'Contribution reward'
    }
  });

  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-7' },
    update: {},
    create: {
      id: 'cap-entry-7',
      projectId: demoProject4.id,
      holderId: adminUser.id,
      holderType: 'OWNER',
      pct: 45.0,
      source: 'Initial ownership'
    }
  });

  await prisma.capTableEntry.upsert({
    where: { id: 'cap-entry-8' },
    update: {},
    create: {
      id: 'cap-entry-8',
      projectId: demoProject4.id,
      holderId: ownerUser.id,
      holderType: 'USER',
      pct: 4.0,
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
      projectId: demoProject1.id
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
      projectId: demoProject1.id
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
      projectId: demoProject1.id
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - ${adminUser.email} (ADMIN)`);
  console.log(`   - ${ownerUser.email} (OWNER)`);
  console.log(`   - ${contributorUser.email} (CONTRIBUTOR)`);
  console.log(`   - Demo projects: ${demoProject1.name}, ${demoProject2.name}, ${demoProject3.name}, ${demoProject4.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
