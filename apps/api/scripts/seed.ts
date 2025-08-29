import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SmartStart database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartstart.com' },
    update: {},
    create: {
      email: 'admin@smartstart.com',
      name: 'Admin User',
      account: {
        create: {
          email: 'admin@smartstart.com',
          password: adminPassword,
          role: 'ADMIN'
        }
      }
    }
  });

  // Create demo owner
  const ownerPassword = await bcrypt.hash('owner123', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.local' },
    update: {},
    create: {
      email: 'owner@demo.local',
      name: 'Demo Owner',
      account: {
        create: {
          email: 'owner@demo.local',
          password: ownerPassword,
          role: 'OWNER'
        }
      }
    }
  });

  // Create demo contributor
  const contributorPassword = await bcrypt.hash('contrib123', 12);
  const contributor = await prisma.user.upsert({
    where: { email: 'contrib@demo.local' },
    update: {},
    create: {
      email: 'contrib@demo.local',
      name: 'Demo Contributor',
      account: {
        create: {
          email: 'contrib@demo.local',
          password: contributorPassword,
          role: 'MEMBER'
        }
      }
    }
  });

  // Create demo project
  const project = await prisma.project.create({
    data: {
      name: 'Demo SaaS Platform',
      summary: '30-day MVP for collaborative entrepreneurship',
      ownerId: owner.id,
      ownerMinPct: 35,
      aliceCapPct: 20,
      reservePct: 45,
      capEntries: {
        createMany: {
          data: [
            { holderType: 'OWNER', holderId: owner.id, pct: 35, source: 'INIT' },
            { holderType: 'ALICE', pct: 20, source: 'INIT' },
            { holderType: 'RESERVE', pct: 45, source: 'INIT' }
          ]
        }
      },
      members: {
        create: [
          { userId: owner.id, role: 'OWNER' },
          { userId: contributor.id, role: 'MEMBER' }
        ]
      },
      visibility: {
        create: {
          capTableHubMasked: true,
          tasksHubVisible: false,
          ideasHubVisible: true,
          pollsHubVisible: true
        }
      }
    }
  });

  // Create demo tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Build authentication system',
      type: 'CODE',
      status: 'DONE',
      projectId: project.id,
      assigneeId: contributor.id
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design user dashboard',
      type: 'DESIGN',
      status: 'DOING',
      projectId: project.id,
      assigneeId: contributor.id
    }
  });

  // Create demo contribution
  const contribution = await prisma.contribution.create({
    data: {
      taskId: task1.id,
      contributorId: contributor.id,
      effort: 40,
      impact: 4,
      proposedPct: 2.0,
      status: 'APPROVED',
      finalPct: 2.0,
      acceptedAt: new Date(),
      acceptedById: owner.id
    }
  });

  // Update cap table for accepted contribution
  await prisma.capTableEntry.createMany({
    data: [
      { 
        projectId: project.id, 
        holderType: 'USER', 
        holderId: contributor.id, 
        pct: 2.0, 
        source: 'CONTRIB' 
      },
      { 
        projectId: project.id, 
        holderType: 'RESERVE', 
        pct: -2.0, 
        source: 'ADJUST' 
      }
    ]
  });

  // Create demo ideas
  await prisma.idea.create({
    data: {
      title: 'AI-powered equity suggestions',
      body: 'Use machine learning to suggest fair equity splits based on contribution effort and impact',
      proposerId: contributor.id,
      projectId: project.id,
      status: 'REVIEW',
      votes: 3
    }
  });

  await prisma.idea.create({
    data: {
      title: 'Mobile app for contributors',
      body: 'Native mobile experience for contributors to track their portfolio and submit contributions',
      proposerId: owner.id,
      status: 'BACKLOG',
      votes: 1
    }
  });

  // Create demo poll
  const poll = await prisma.poll.create({
    data: {
      question: 'Should we focus on mobile or web first?',
      type: 'YESNO',
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      projectId: project.id
    }
  });

  // Add some votes
  await prisma.pollVote.createMany({
    data: [
      { pollId: poll.id, voterId: owner.id, value: 'YES' },
      { pollId: poll.id, voterId: contributor.id, value: 'NO' }
    ]
  });

  // Create demo kudos
  await prisma.kudos.create({
    data: {
      toUserId: contributor.id,
      fromUserId: owner.id,
      message: 'Excellent work on the auth system!'
    }
  });

  // Create demo messages
  await prisma.message.create({
    data: {
      projectId: project.id,
      authorId: owner.id,
      body: 'Great progress everyone! Let\'s keep the momentum going.'
    }
  });

  await prisma.message.create({
    data: {
      projectId: project.id,
      authorId: contributor.id,
      body: 'Thanks! The new dashboard design is coming along nicely.'
    }
  });

  console.log('✅ Seeded successfully!');
  console.log(`👤 Admin: admin@smartstart.com / admin123`);
  console.log(`👑 Owner: owner@demo.local / owner123`);
  console.log(`👷 Contributor: contrib@demo.local / contrib123`);
  console.log(`🚀 Project: ${project.name}`);
  console.log(`💰 Cap Table: Owner 35%, Alice 20%, Reserve 43%, Contributor 2%`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
