import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUsers() {
  console.log('👥 Adding new users to SmartStart...');

  try {
    // Find the SmartStart Platform project
    const smartStartProject = await prisma.project.findFirst({
      where: {
        name: {
          contains: 'SmartStart'
        }
      }
    });

    if (!smartStartProject) {
      console.log('❌ SmartStart Platform project not found. Please run cleanup-database.ts first.');
      return;
    }

    // Create or update users with realistic data
    const users = [
      {
        email: 'brian.johnson@smartstart.com',
        name: 'Brian Johnson',
        level: 'WISE_OWL',
        xp: 180,
        reputation: 85,
        role: 'OWNER',
        equity: 35,
        bio: 'Experienced entrepreneur and startup founder with a passion for building innovative platforms.',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/brianjohnson',
        twitter: 'https://twitter.com/brianjohnson',
        github: 'https://github.com/brianjohnson'
      },
      {
        email: 'vlad.petrov@smartstart.com',
        name: 'Vlad Petrov',
        level: 'SKY_MASTER',
        xp: 320,
        reputation: 92,
        role: 'MEMBER',
        equity: 15,
        bio: 'Full-stack developer and technical architect with expertise in blockchain and smart contracts.',
        location: 'Kyiv, Ukraine',
        linkedin: 'https://linkedin.com/in/vladpetrov',
        twitter: 'https://twitter.com/vladpetrov',
        github: 'https://github.com/vladpetrov'
      },
      {
        email: 'andrii.kovalenko@smartstart.com',
        name: 'Andrii Kovalenko',
        level: 'OWLET',
        xp: 95,
        reputation: 67,
        role: 'MEMBER',
        equity: 10,
        bio: 'Product manager and UX designer focused on creating user-centric solutions.',
        location: 'Lviv, Ukraine',
        linkedin: 'https://linkedin.com/in/andriikovalenko',
        twitter: 'https://twitter.com/andriikovalenko',
        github: 'https://github.com/andriikovalenko'
      }
    ];

    for (const userData of users) {
      console.log(`👤 Creating/updating user: ${userData.name}`);

      // Create or update user
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          level: userData.level,
          xp: userData.xp,
          reputation: userData.reputation,
          totalPortfolioValue: 500000 * (userData.equity / 100), // Calculate portfolio value based on equity
          totalEquityOwned: userData.equity,
          activeProjectsCount: 1,
          totalContributions: Math.floor(userData.xp / 10), // Estimate contributions based on XP
          portfolioDiversity: 1,
          lastEquityEarned: new Date(),
          lastActive: new Date()
        },
        create: {
          email: userData.email,
          name: userData.name,
          level: userData.level,
          xp: userData.xp,
          reputation: userData.reputation,
          totalPortfolioValue: 500000 * (userData.equity / 100),
          totalEquityOwned: userData.equity,
          activeProjectsCount: 1,
          totalContributions: Math.floor(userData.xp / 10),
          portfolioDiversity: 1,
          lastEquityEarned: new Date(),
          lastActive: new Date()
        }
      });

      // Create or update project membership
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: smartStartProject.id,
            userId: user.id
          }
        },
        update: {
          role: userData.role,
          isActive: true
        },
        create: {
          projectId: smartStartProject.id,
          userId: user.id,
          role: userData.role,
          isActive: true
        }
      });

      // Create or update cap table entry
      await prisma.capTableEntry.upsert({
        where: {
          projectId_holderType_holderId: {
            projectId: smartStartProject.id,
            holderType: 'USER',
            holderId: user.id
          }
        },
        update: {
          pct: userData.equity,
          source: 'EQUITY_GRANT'
        },
        create: {
          projectId: smartStartProject.id,
          holderType: 'USER',
          holderId: user.id,
          pct: userData.equity,
          source: 'EQUITY_GRANT'
        }
      });

      // Note: User profiles, skills, and badges would need to be created separately
      // as they require additional setup with Skill and Badge models
      console.log(`   - Profile: ${userData.bio}`);
      console.log(`   - Location: ${userData.location}`);
      console.log(`   - Social: ${userData.linkedin}, ${userData.twitter}, ${userData.github}`);

      console.log(`✅ Created/updated user: ${userData.name} (${userData.role}, ${userData.equity}% equity)`);
    }

    // Update project stats
    await prisma.project.update({
      where: { id: smartStartProject.id },
      data: {
        activeMembers: 4, // Brian, Vlad, Andrii + Alice
        totalValue: 500000,
        completionRate: 75,
        lastActivity: new Date()
      }
    });

    console.log('✅ All users added successfully!');
    console.log('📊 SmartStart Platform now has:');
    console.log('   - Brian Johnson: OWNER, 35% equity, 180 XP');
    console.log('   - Vlad Petrov: MEMBER, 15% equity, 320 XP');
    console.log('   - Andrii Kovalenko: MEMBER, 10% equity, 95 XP');
    console.log('   - Total portfolio value: $500K');

  } catch (error) {
    console.error('❌ Error adding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUsers();
