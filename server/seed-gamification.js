const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Badge definitions with earning conditions
const badgeDefinitions = [
    {
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        condition: JSON.stringify({
            type: 'contribution_count',
            value: 1
        }),
        category: 'achievement',
        rarity: 'COMMON'
    },
    {
        name: 'Dedicated Contributor',
        description: 'Complete 10 tasks',
        icon: '⚡',
        condition: JSON.stringify({
            type: 'contribution_count',
            value: 10
        }),
        category: 'achievement',
        rarity: 'COMMON'
    },
    {
        name: 'Skill Master',
        description: 'Reach level 3 in any skill',
        icon: '🏆',
        condition: JSON.stringify({
            type: 'skill_level',
            value: 3
        }),
        category: 'skill',
        rarity: 'UNCOMMON'
    },
    {
        name: 'Community Helper',
        description: 'Give 5 endorsements',
        icon: '🤝',
        condition: JSON.stringify({
            type: 'endorsement_count',
            value: 5
        }),
        category: 'community',
        rarity: 'UNCOMMON'
    },
    {
        name: 'Idea Generator',
        description: 'Share 3 ideas',
        icon: '💡',
        condition: JSON.stringify({
            type: 'idea_count',
            value: 3
        }),
        category: 'creativity',
        rarity: 'UNCOMMON'
    },
    {
        name: 'Consistent Performer',
        description: 'Active for 7 consecutive days',
        icon: '🔥',
        condition: JSON.stringify({
            type: 'streak',
            days: 7
        }),
        category: 'consistency',
        rarity: 'RARE'
    },
    {
        name: 'XP Hunter',
        description: 'Reach 1000 XP',
        icon: '⭐',
        condition: JSON.stringify({
            type: 'xp_threshold',
            value: 1000
        }),
        category: 'achievement',
        rarity: 'RARE'
    },
    {
        name: 'Project Champion',
        description: 'Complete 5 projects',
        icon: '🚀',
        condition: JSON.stringify({
            type: 'project_completion',
            value: 5
        }),
        category: 'achievement',
        rarity: 'EPIC'
    },
    {
        name: 'Legendary Contributor',
        description: 'Complete 100 tasks',
        icon: '👑',
        condition: JSON.stringify({
            type: 'contribution_count',
            value: 100
        }),
        category: 'achievement',
        rarity: 'LEGENDARY'
    },
    {
        name: 'Skill Virtuoso',
        description: 'Reach level 5 in 3 different skills',
        icon: '🎭',
        condition: JSON.stringify({
            type: 'skill_mastery',
            value: 3
        }),
        category: 'skill',
        rarity: 'LEGENDARY'
    }
];

// Skill definitions
const skillDefinitions = [
    {
        name: 'JavaScript',
        category: 'Programming',
        description: 'Modern JavaScript development',
        demand: 5,
        complexity: 4
    },
    {
        name: 'React',
        category: 'Frontend',
        description: 'React.js development',
        demand: 5,
        complexity: 4
    },
    {
        name: 'Node.js',
        category: 'Backend',
        description: 'Server-side JavaScript',
        demand: 5,
        complexity: 3
    },
    {
        name: 'Python',
        category: 'Programming',
        description: 'Python development',
        demand: 4,
        complexity: 3
    },
    {
        name: 'SQL',
        category: 'Database',
        description: 'Database querying and management',
        demand: 4,
        complexity: 2
    },
    {
        name: 'AWS',
        category: 'Cloud',
        description: 'Amazon Web Services',
        demand: 5,
        complexity: 4
    },
    {
        name: 'Docker',
        category: 'DevOps',
        description: 'Containerization',
        demand: 4,
        complexity: 3
    },
    {
        name: 'Git',
        category: 'Version Control',
        description: 'Source code management',
        demand: 4,
        complexity: 2
    },
    {
        name: 'UI/UX Design',
        category: 'Design',
        description: 'User interface and experience design',
        demand: 4,
        complexity: 4
    },
    {
        name: 'Project Management',
        category: 'Management',
        description: 'Project planning and execution',
        demand: 4,
        complexity: 3
    },
    {
        name: 'Data Analysis',
        category: 'Analytics',
        description: 'Data processing and analysis',
        demand: 5,
        complexity: 4
    },
    {
        name: 'Machine Learning',
        category: 'AI/ML',
        description: 'Machine learning algorithms',
        demand: 5,
        complexity: 5
    }
];

// Sample user skills for testing
const sampleUserSkills = [
    {
        userId: 'cmf1r92vo0001s8299wr0vh66', // Test user from venture creation
        skillName: 'JavaScript',
        level: 3,
        verified: true
    },
    {
        userId: 'cmf1r92vo0001s8299wr0vh66',
        skillName: 'React',
        level: 2,
        verified: false
    },
    {
        userId: 'cmf1r92vo0001s8299wr0vh66',
        skillName: 'Node.js',
        level: 4,
        verified: true
    }
];

async function seedGamification() {
    try {
        console.log('🌱 Starting gamification system seeding...');

        // Seed badges
        console.log('📛 Seeding badges...');
        for (const badgeDef of badgeDefinitions) {
            await prisma.badge.upsert({
                where: { name: badgeDef.name },
                update: badgeDef,
                create: badgeDef
            });
        }
        console.log(`✅ Seeded ${badgeDefinitions.length} badges`);

        // Seed skills
        console.log('🛠️ Seeding skills...');
        for (const skillDef of skillDefinitions) {
            await prisma.skill.upsert({
                where: { name: skillDef.name },
                update: skillDef,
                create: skillDef
            });
        }
        console.log(`✅ Seeded ${skillDefinitions.length} skills`);

        // Seed sample user skills
        console.log('👤 Seeding sample user skills...');
        for (const userSkill of sampleUserSkills) {
            const skill = await prisma.skill.findUnique({
                where: { name: userSkill.skillName }
            });

            if (skill) {
                await prisma.userSkill.upsert({
                    where: {
                        userId_skillId: {
                            userId: userSkill.userId,
                            skillId: skill.id
                        }
                    },
                    update: {
                        level: userSkill.level,
                        verified: userSkill.verified
                    },
                    create: {
                        userId: userSkill.userId,
                        skillId: skill.id,
                        level: userSkill.level,
                        verified: userSkill.verified
                    }
                });
            }
        }
        console.log(`✅ Seeded ${sampleUserSkills.length} user skills`);

        // Create sample portfolio items
        console.log('📁 Creating sample portfolio items...');
        const samplePortfolioItems = [
            {
                userId: 'cmf1r92vo0001s8299wr0vh66',
                title: 'SmartStart Platform API',
                summary: 'Comprehensive API for venture management and contract automation',
                buzEarned: 150,
                impactScore: 85
            },
            {
                userId: 'cmf1r92vo0001s8299wr0vh66',
                title: 'Contract Auto-Issuance System',
                summary: 'Dynamic contract generation with variable substitution',
                buzEarned: 200,
                impactScore: 90
            }
        ];

        for (const item of samplePortfolioItems) {
            await prisma.portfolioItem.upsert({
                where: {
                    userId_title: {
                        userId: item.userId,
                        title: item.title
                    }
                },
                update: item,
                create: item
            });
        }
        console.log(`✅ Created ${samplePortfolioItems.length} portfolio items`);

        // Create sample endorsements
        console.log('🤝 Creating sample endorsements...');
        const sampleEndorsements = [
            {
                endorserId: 'cmf1r92vo0001s8299wr0vh66',
                endorsedId: 'cmf1r92vo0001s8299wr0vh66',
                skillName: 'JavaScript',
                weight: 5,
                note: 'Excellent JavaScript skills demonstrated in SmartStart platform'
            }
        ];

        for (const endorsement of sampleEndorsements) {
            const skill = await prisma.skill.findUnique({
                where: { name: endorsement.skillName }
            });

            if (skill) {
                await prisma.endorsement.upsert({
                    where: {
                        endorserId_endorsedId_skillId: {
                            endorserId: endorsement.endorserId,
                            endorsedId: endorsement.endorsedId,
                            skillId: skill.id
                        }
                    },
                    update: {
                        weight: endorsement.weight,
                        note: endorsement.note
                    },
                    create: {
                        endorserId: endorsement.endorserId,
                        endorsedId: endorsement.endorsedId,
                        skillId: skill.id,
                        weight: endorsement.weight,
                        note: endorsement.note
                    }
                });
            }
        }
        console.log(`✅ Created ${sampleEndorsements.length} endorsements`);

        // Create sample user activity
        console.log('📊 Creating sample user activity...');
        const sampleActivities = [
            {
                userId: 'cmf1r92vo0001s8299wr0vh66',
                type: 'xp_earned',
                entity: 'PROJECT_COMPLETION',
                entityType: 'activity',
                data: {
                    xpEarned: 200,
                    totalXP: 200,
                    level: 'OWLET',
                    levelUp: false
                }
            },
            {
                userId: 'cmf1r92vo0001s8299wr0vh66',
                type: 'xp_earned',
                entity: 'SKILL_ENDORSEMENT',
                entityType: 'activity',
                data: {
                    xpEarned: 15,
                    totalXP: 215,
                    level: 'OWLET',
                    levelUp: false
                }
            }
        ];

        for (const activity of sampleActivities) {
            await prisma.userActivity.create({
                data: activity
            });
        }
        console.log(`✅ Created ${sampleActivities.length} user activities`);

        console.log('🎉 Gamification system seeding completed successfully!');
        
        // Display summary
        const badgeCount = await prisma.badge.count();
        const skillCount = await prisma.skill.count();
        const userSkillCount = await prisma.userSkill.count();
        const portfolioCount = await prisma.portfolioItem.count();
        const endorsementCount = await prisma.endorsement.count();
        const activityCount = await prisma.userActivity.count();

        console.log('\n📊 Seeding Summary:');
        console.log(`   Badges: ${badgeCount}`);
        console.log(`   Skills: ${skillCount}`);
        console.log(`   User Skills: ${userSkillCount}`);
        console.log(`   Portfolio Items: ${portfolioCount}`);
        console.log(`   Endorsements: ${endorsementCount}`);
        console.log(`   User Activities: ${activityCount}`);

    } catch (error) {
        console.error('❌ Error seeding gamification system:', error);
        throw error;
    }
}

// Run seeding if called directly
if (require.main === module) {
    seedGamification()
        .then(() => {
            console.log('✅ Gamification seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Gamification seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedGamification };
