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

  // Create additional demo users
  const user1Password = await bcrypt.hash('user123', 12);
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@demo.local' },
    update: {},
    create: {
      email: 'user1@demo.local',
      name: 'Sarah Chen',
      account: {
        create: {
          email: 'user1@demo.local',
          password: user1Password,
          role: 'MEMBER'
        }
      }
    }
  });

  const user2Password = await bcrypt.hash('user123', 12);
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@demo.local' },
    update: {},
    create: {
      email: 'user2@demo.local',
      name: 'Mike Rodriguez',
      account: {
        create: {
          email: 'user2@demo.local',
          password: user2Password,
          role: 'MEMBER'
        }
      }
    }
  });

  const user3Password = await bcrypt.hash('user123', 12);
  const user3 = await prisma.user.upsert({
    where: { email: 'user3@demo.local' },
    update: {},
    create: {
      email: 'user3@demo.local',
      name: 'Emma Thompson',
      account: {
        create: {
          email: 'user3@demo.local',
          password: user3Password,
          role: 'MEMBER'
        }
      }
    }
  });

  // Create demo projects
  const project1 = await prisma.project.create({
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

  const project2 = await prisma.project.create({
    data: {
      name: 'AI Marketing Tool',
      summary: 'AI-powered marketing automation platform',
      ownerId: user1.id,
      ownerMinPct: 40,
      aliceCapPct: 15,
      reservePct: 45,
      capEntries: {
        createMany: {
          data: [
            { holderType: 'OWNER', holderId: user1.id, pct: 40, source: 'INIT' },
            { holderType: 'ALICE', pct: 15, source: 'INIT' },
            { holderType: 'RESERVE', pct: 45, source: 'INIT' }
          ]
        }
      },
      members: {
        create: [
          { userId: user1.id, role: 'OWNER' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' }
        ]
      },
      visibility: {
        create: {
          capTableHubMasked: true,
          tasksHubVisible: true,
          ideasHubVisible: true,
          pollsHubVisible: true
        }
      }
    }
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Mobile App Framework',
      summary: 'Cross-platform mobile development framework',
      ownerId: user2.id,
      ownerMinPct: 50,
      aliceCapPct: 10,
      reservePct: 40,
      capEntries: {
        createMany: {
          data: [
            { holderType: 'OWNER', holderId: user2.id, pct: 50, source: 'INIT' },
            { holderType: 'ALICE', pct: 10, source: 'INIT' },
            { holderType: 'RESERVE', pct: 40, source: 'INIT' }
          ]
        }
      },
      members: {
        create: [
          { userId: user2.id, role: 'OWNER' },
          { userId: user1.id, role: 'MEMBER' },
          { userId: contributor.id, role: 'MEMBER' }
        ]
      },
      visibility: {
        create: {
          capTableHubMasked: true,
          tasksHubVisible: true,
          ideasHubVisible: true,
          pollsHubVisible: true
        }
      }
    }
  });

  // Create demo tasks for project 1
  const task1 = await prisma.task.create({
    data: {
      title: 'Build authentication system',
      type: 'CODE',
      status: 'DONE',
      projectId: project1.id,
      assigneeId: contributor.id
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design user dashboard',
      type: 'DESIGN',
      status: 'DOING',
      projectId: project1.id,
      assigneeId: contributor.id
    }
  });

  // Create demo tasks for project 2
  const task3 = await prisma.task.create({
    data: {
      title: 'AI algorithm development',
      type: 'CODE',
      status: 'DOING',
      projectId: project2.id,
      assigneeId: user2.id
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Marketing automation flows',
      type: 'DESIGN',
      status: 'TODO',
      projectId: project2.id,
      assigneeId: user3.id
    }
  });

  // Create demo tasks for project 3
  const task5 = await prisma.task.create({
    data: {
      title: 'Cross-platform compatibility',
      type: 'CODE',
      status: 'DOING',
      projectId: project3.id,
      assigneeId: user1.id
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
        projectId: project1.id, 
        holderType: 'USER', 
        holderId: contributor.id, 
        pct: 2.0, 
        source: 'CONTRIB' 
      },
      { 
        projectId: project1.id, 
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
      projectId: project1.id,
      status: 'REVIEW',
      votes: 3
    }
  });

  await prisma.idea.create({
    data: {
      title: 'Mobile app for contributors',
      body: 'Native mobile experience for contributors to track their portfolio and submit contributions',
      proposerId: owner.id,
      projectId: project1.id,
      status: 'BACKLOG',
      votes: 1
    }
  });

  await prisma.idea.create({
    data: {
      title: 'Advanced marketing analytics',
      body: 'Real-time analytics dashboard for marketing campaign performance',
      proposerId: user2.id,
      projectId: project2.id,
      status: 'REVIEW',
      votes: 2
    }
  });

  await prisma.idea.create({
    data: {
      title: 'Mobile framework plugins',
      body: 'Plugin system for extending the mobile framework functionality',
      proposerId: user1.id,
      projectId: project3.id,
      status: 'BACKLOG',
      votes: 1
    }
  });

  // Create demo polls
  const poll1 = await prisma.poll.create({
    data: {
      question: 'Should we focus on mobile or web first?',
      type: 'YESNO',
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      projectId: project1.id
    }
  });

  const poll2 = await prisma.poll.create({
    data: {
      question: 'Which AI feature should we prioritize?',
      type: 'MULTIPLE_CHOICE',
      closesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      projectId: project2.id
    }
  });

  // Add some votes
  await prisma.pollVote.createMany({
    data: [
      { pollId: poll1.id, voterId: owner.id, value: 'YES' },
      { pollId: poll1.id, voterId: contributor.id, value: 'NO' },
      { pollId: poll2.id, voterId: user1.id, value: 'FEATURE_A' },
      { pollId: poll2.id, voterId: user2.id, value: 'FEATURE_B' },
      { pollId: poll2.id, voterId: user3.id, value: 'FEATURE_A' }
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
      projectId: project1.id,
      authorId: owner.id,
      body: 'Great progress everyone! Let\'s keep the momentum going.'
    }
  });

  await prisma.message.create({
    data: {
      projectId: project1.id,
      authorId: contributor.id,
      body: 'Thanks! The new dashboard design is coming along nicely.'
    }
  });

  await prisma.message.create({
    data: {
      projectId: project2.id,
      authorId: user1.id,
      body: 'AI algorithm is showing promising results!'
    }
  });

  await prisma.message.create({
    data: {
      projectId: project3.id,
      authorId: user2.id,
      body: 'Framework compatibility tests are passing!'
    }
  });

  console.log('✅ Seeded successfully!');
  console.log(`👤 Admin: admin@smartstart.com / admin123`);
  console.log(`👑 Owner: owner@demo.local / owner123`);
  console.log(`👷 Contributor: contrib@demo.local / contrib123`);
  console.log(`👤 User 1: user1@demo.local / user123 (Sarah Chen)`);
  console.log(`👤 User 2: user2@demo.local / user123 (Mike Rodriguez)`);
  console.log(`👤 User 3: user3@demo.local / user123 (Emma Thompson)`);
  console.log(`🚀 Projects: ${project1.name}, ${project2.name}, ${project3.name}`);
  console.log(`💰 Cap Tables: Multiple projects with diverse ownership structures`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
