import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding v1 models...');

  // 1. Create Skills
  console.log('📚 Creating skills...');
  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        slug: 'frontend',
        name: 'Frontend Development',
        category: 'engineering'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'backend',
        name: 'Backend Development',
        category: 'engineering'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'devops',
        name: 'DevOps & Infrastructure',
        category: 'ops'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'security',
        name: 'Security & Compliance',
        category: 'security'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'product',
        name: 'Product Management',
        category: 'product'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'design',
        name: 'UI/UX Design',
        category: 'design'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'sales',
        name: 'Sales & Business Development',
        category: 'bizdev'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'legal',
        name: 'Legal & Compliance',
        category: 'legal'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'finance',
        name: 'Finance & Accounting',
        category: 'finance'
      }
    }),
    prisma.skill.create({
      data: {
        slug: 'data',
        name: 'Data Science & Analytics',
        category: 'engineering'
      }
    })
  ]);

  console.log(`✅ Created ${skills.length} skills`);

  // 2. Create Badges with rules
  console.log('🏆 Creating badges...');
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        code: 'EARLY_CONTRIBUTOR',
        title: 'Early Contributor',
        description: 'One of the first 100 contributors to the platform',
        icon: '🌟',
        ruleType: 'THRESHOLD',
        ruleJson: {
          type: 'THRESHOLD',
          conditions: [
            { metric: 'tasksAccepted', gte: 5 },
            { metric: 'daysSinceJoin', lte: 90 }
          ]
        }
      }
    }),
    prisma.badge.create({
      data: {
        code: 'BUG_HUNTER_BRONZE',
        title: 'Bug Hunter Bronze',
        description: 'Reported and helped fix 3+ critical bugs',
        icon: '🐛',
        ruleType: 'THRESHOLD',
        ruleJson: {
          type: 'THRESHOLD',
          conditions: [
            { metric: 'criticalBugReports', gte: 3 }
          ]
        }
      }
    }),
    prisma.badge.create({
      data: {
        code: 'TOP_REVIEWER',
        title: 'Top Reviewer',
        description: 'Provided 50+ helpful reviews with high agreement rate',
        icon: '👁️',
        ruleType: 'THRESHOLD',
        ruleJson: {
          type: 'THRESHOLD',
          conditions: [
            { metric: 'helpfulReviews', gte: 50 },
            { metric: 'agreementRate', gte: 0.8 }
          ]
        }
      }
    }),
    prisma.badge.create({
      data: {
        code: 'SECURITY_CHAMPION',
        title: 'Security Champion',
        description: 'Maintained security compliance for 90+ days',
        icon: '🛡️',
        ruleType: 'COMPOSITE',
        ruleJson: {
          type: 'COMPOSITE',
          all: [
            { metric: 'kycStatus', eq: 'PASSED' },
            { metric: 'deviceCompliantDays', gte: 90 },
            { metric: 'policyViolations', eq: 0 }
          ]
        }
      }
    }),
    prisma.badge.create({
      data: {
        code: 'EQUITY_PIONEER',
        title: 'Equity Pioneer',
        description: 'Successfully converted BUZ to equity in first quarter',
        icon: '💎',
        ruleType: 'THRESHOLD',
        ruleJson: {
          type: 'THRESHOLD',
          conditions: [
            { metric: 'equityConversions', gte: 1 },
            { metric: 'quarterNumber', eq: 1 }
          ]
        }
      }
    }),
    prisma.badge.create({
      data: {
        code: 'COMMUNITY_BUILDER',
        title: 'Community Builder',
        description: 'Helped 10+ other users grow their skills',
        icon: '🤝',
        ruleType: 'THRESHOLD',
        ruleJson: {
          type: 'THRESHOLD',
          conditions: [
            { metric: 'endorsementsGiven', gte: 10 },
            { metric: 'endorsementQuality', gte: 4.0 }
          ]
        }
      }
    })
  ]);

  console.log(`✅ Created ${badges.length} badges`);

  // 3. Create Conversion Windows for next quarters
  console.log('🔄 Creating conversion windows...');
  const now = new Date();
  const nextQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
  const quarterEnd = new Date(nextQuarter.getFullYear(), nextQuarter.getMonth() + 3, 0);
  
  const conversionWindows = await Promise.all([
    prisma.conversionWindow.create({
      data: {
        opensAt: nextQuarter,
        closesAt: quarterEnd,
        equityRateBps: 100, // 1% equity per 10,000 BUZ (example rate)
        status: 'SCHEDULED',
        notes: 'Q1 2025 BUZ to Equity Conversion Window'
      }
    }),
    prisma.conversionWindow.create({
      data: {
        opensAt: new Date(nextQuarter.getFullYear(), nextQuarter.getMonth() + 3, 1),
        closesAt: new Date(nextQuarter.getFullYear(), nextQuarter.getMonth() + 6, 0),
        equityRateBps: 95, // Slightly lower rate for Q2
        status: 'SCHEDULED',
        notes: 'Q2 2025 BUZ to Equity Conversion Window'
      }
    })
  ]);

  console.log(`✅ Created ${conversionWindows.length} conversion windows`);

  // 4. Create sample clients and documents
  console.log('📋 Creating sample clients and documents...');
  
  // Create a sample client
  const sampleClient = await prisma.client.create({
    data: {
      ownerUserId: 'sample-user-id', // This will need to be updated with actual user ID
      name: 'Acme Corporation',
      email: 'legal@acme.com',
      phone: '+1-555-0123',
      organization: 'Acme Corp',
      tags: ['ISO27001', 'Enterprise', 'Tech']
    }
  });

  console.log(`✅ Created sample client: ${sampleClient.name}`);

  // 5. Create sample portfolio items
  console.log('💼 Creating sample portfolio items...');
  
  const samplePortfolioItems = await Promise.all([
    prisma.portfolioItem.create({
      data: {
        userId: 'sample-user-id', // This will need to be updated with actual user ID
        title: 'SmartStart Platform MVP',
        summary: 'Built the complete MVP for SmartStart Platform including user management, venture creation, and equity tracking',
        externalUrl: 'https://github.com/smartstart/platform',
        buzEarned: 2500,
        impactScore: 95,
        isPublic: true
      }
    }),
    prisma.portfolioItem.create({
      data: {
        userId: 'sample-user-id', // This will need to be updated with actual user ID
        title: 'Security Audit Framework',
        summary: 'Developed comprehensive security audit framework for venture compliance and KYC/KYB verification',
        externalUrl: 'https://github.com/smartstart/security',
        buzEarned: 1800,
        impactScore: 88,
        isPublic: true
      }
    })
  ]);

  console.log(`✅ Created ${samplePortfolioItems.length} sample portfolio items`);

  // 6. Create sample endorsements
  console.log('👍 Creating sample endorsements...');
  
  const sampleEndorsements = await Promise.all([
    prisma.endorsement.create({
      data: {
        endorserId: 'sample-endorser-id', // This will need to be updated with actual user ID
        endorsedId: 'sample-user-id', // This will need to be updated with actual user ID
        skillId: skills[0].id, // Frontend Development
        weight: 5,
        note: 'Exceptional frontend skills and attention to detail'
      }
    }),
    prisma.endorsement.create({
      data: {
        endorserId: 'sample-endorser-id', // This will need to be updated with actual user ID
        endorsedId: 'sample-user-id', // This will need to be updated with actual user ID
        skillId: skills[2].id, // DevOps
        weight: 4,
        note: 'Great infrastructure and deployment knowledge'
      }
    })
  ]);

  console.log(`✅ Created ${sampleEndorsements.length} sample endorsements`);

  console.log('🎉 v1 seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   • Skills: ${skills.length}`);
  console.log(`   • Badges: ${badges.length}`);
  console.log(`   • Conversion Windows: ${conversionWindows.length}`);
  console.log(`   • Sample Client: 1`);
  console.log(`   • Sample Portfolio Items: ${samplePortfolioItems.length}`);
  console.log(`   • Sample Endorsements: ${sampleEndorsements.length}`);
  console.log('');
  console.log('⚠️  Note: Sample data uses placeholder user IDs.');
  console.log('   Update these with actual user IDs after user creation.');
}

// Export the main function for use in API
export async function seedDatabase() {
  try {
    await main();
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
