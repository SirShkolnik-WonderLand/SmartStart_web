const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

class GamificationService {
    constructor() {
        this.xpLevels = {
            OWLET: { min: 0, max: 999, multiplier: 1.0 },
            NIGHT_WATCHER: { min: 1000, max: 4999, multiplier: 1.2 },
            WISE_OWL: { min: 5000, max: 19999, multiplier: 1.5 },
            SKY_MASTER: { min: 20000, max: 99999, multiplier: 2.0 }
        };
        
        this.xpRewards = {
            LOGIN: 5,
            CONTRIBUTION: 25,
            IDEA: 15,
            POLL_VOTE: 5,
            MESSAGE: 3,
            KUDOS_GIVEN: 10,
            KUDOS_RECEIVED: 20,
            SKILL_ENDORSEMENT: 15,
            BADGE_EARNED: 100,
            EQUITY_EARNED: 50,
            PROJECT_COMPLETION: 200,
            COMMUNITY_HELP: 30
        };
    }

    // XP and Level Management
    async calculateUserLevel(xp) {
        for (const [level, config] of Object.entries(this.xpLevels)) {
            if (xp >= config.min && xp <= config.max) {
                return level;
            }
        }
        return 'SKY_MASTER'; // Default for very high XP
    }

    async addXP(userId, activityType, amount = null) {
        try {
            const baseXP = amount || this.xpRewards[activityType] || 0;
            if (baseXP === 0) return { success: false, message: 'Invalid activity type' };

            // Get current user stats
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { xp: true, level: true }
            });

            if (!user) return { success: false, message: 'User not found' };

            const newXP = user.xp + baseXP;
            const newLevel = await this.calculateUserLevel(newXP);

            // Update user XP and level
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    xp: newXP,
                    level: newLevel,
                    lastActive: new Date()
                }
            });

            // Log activity
            await prisma.userActivity.create({
                data: {
                    userId,
                    type: 'xp_earned',
                    entity: activityType,
                    entityType: 'activity',
                    data: {
                        xpEarned: baseXP,
                        totalXP: newXP,
                        level: newLevel,
                        levelUp: newLevel !== user.level
                    }
                }
            });

            return {
                success: true,
                xpEarned: baseXP,
                totalXP: newXP,
                level: newLevel,
                levelUp: newLevel !== user.level
            };
        } catch (error) {
            console.error('Error adding XP:', error);
            return { success: false, message: error.message };
        }
    }

    // Badge System
    async checkAndAwardBadges(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userBadges: {
                        include: { badge: true }
                    },
                    userSkills: true,
                    contributions: true,
                    ideas: true,
                    kudos: true,
                    endorsementsReceived: true
                }
            });

            if (!user) return { success: false, message: 'User not found' };

            const earnedBadges = [];
            const allBadges = await prisma.badge.findMany();

            for (const badge of allBadges) {
                if (await this.evaluateBadgeCondition(badge, user)) {
                    // Check if user already has this badge
                    const hasBadge = user.userBadges.some(ub => ub.badgeId === badge.id);
                    if (!hasBadge) {
                        // Award badge
                        await prisma.userBadge.create({
                            data: {
                                userId,
                                badgeId: badge.id,
                                earnedAt: new Date()
                            }
                        });

                        // Add XP for earning badge
                        await this.addXP(userId, 'BADGE_EARNED');

                        earnedBadges.push(badge);
                    }
                }
            }

            return {
                success: true,
                badgesEarned: earnedBadges,
                totalBadges: user.userBadges.length + earnedBadges.length
            };
        } catch (error) {
            console.error('Error checking badges:', error);
            return { success: false, message: error.message };
        }
    }

    async evaluateBadgeCondition(badge, user) {
        try {
            const condition = JSON.parse(badge.condition);
            
            switch (condition.type) {
                case 'xp_threshold':
                    return user.xp >= condition.value;
                
                case 'contribution_count':
                    return user.contributions.length >= condition.value;
                
                case 'skill_level':
                    return user.userSkills.some(skill => 
                        skill.level >= condition.value && skill.verified
                    );
                
                case 'endorsement_count':
                    return user.endorsementsReceived.length >= condition.value;
                
                case 'kudos_received':
                    return user.kudos.length >= condition.value;
                
                case 'project_completion':
                    const completedProjects = user.contributions.filter(c => 
                        c.status === 'COMPLETED'
                    ).length;
                    return completedProjects >= condition.value;
                
                case 'streak':
                    // Check for consecutive days of activity
                    const recentActivity = await prisma.userActivity.findMany({
                        where: {
                            userId: user.id,
                            createdAt: {
                                gte: new Date(Date.now() - condition.days * 24 * 60 * 60 * 1000)
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    });
                    
                    const uniqueDays = new Set(
                        recentActivity.map(a => 
                            a.createdAt.toISOString().split('T')[0]
                        )
                    ).size;
                    
                    return uniqueDays >= condition.days;
                
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error evaluating badge condition:', error);
            return false;
        }
    }

    // Reputation System
    async calculateReputation(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    endorsementsReceived: true,
                    kudos: true,
                    contributions: true,
                    ideas: true,
                    userSkills: true
                }
            });

            if (!user) return { success: false, message: 'User not found' };

            let reputation = 0;

            // Base reputation from XP
            reputation += Math.floor(user.xp / 100);

            // Endorsement reputation (weighted by endorser trust)
            const endorsementScore = user.endorsementsReceived.reduce((sum, end) => 
                sum + (end.weight || 1), 0
            );
            reputation += endorsementScore * 5;

            // Kudos reputation
            reputation += user.kudos.length * 3;

            // Contribution reputation
            reputation += user.contributions.length * 2;

            // Idea reputation
            reputation += user.ideas.length * 5;

            // Skill verification bonus
            const verifiedSkills = user.userSkills.filter(skill => skill.verified).length;
            reputation += verifiedSkills * 10;

            // Update user reputation
            await prisma.user.update({
                where: { id: userId },
                data: { reputation }
            });

            return {
                success: true,
                reputation,
                breakdown: {
                    xpBased: Math.floor(user.xp / 100),
                    endorsements: endorsementScore * 5,
                    kudos: user.kudos.length * 3,
                    contributions: user.contributions.length * 2,
                    ideas: user.ideas.length * 5,
                    verifiedSkills: verifiedSkills * 10
                }
            };
        } catch (error) {
            console.error('Error calculating reputation:', error);
            return { success: false, message: error.message };
        }
    }

    // Portfolio Analytics
    async generatePortfolioInsights(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    portfolio: {
                        include: { file: true }
                    },
                    userSkills: {
                        include: { skill: true }
                    },
                    contributions: {
                        include: { project: true }
                    },
                    endorsementsReceived: true
                }
            });

            if (!user) return { success: false, message: 'User not found' };

            // Calculate portfolio metrics
            const totalPortfolioValue = user.portfolio.reduce((sum, item) => 
                sum + (item.buzEarned || 0), 0
            );

            const activeProjectsCount = user.contributions.filter(c => 
                c.status === 'ACTIVE' || c.status === 'IN_PROGRESS'
            ).length;

            const skillGaps = await this.identifySkillGaps(userId);
            const growthTrends = await this.calculateGrowthTrends(userId);
            const marketDemand = await this.analyzeMarketDemand(userId);

            // Update user portfolio metrics
            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalPortfolioValue,
                    activeProjectsCount,
                    totalContributions: user.contributions.length
                }
            });

            return {
                success: true,
                insights: {
                    totalPortfolioValue,
                    activeProjectsCount,
                    totalContributions: user.contributions.length,
                    skillGaps,
                    growthTrends,
                    marketDemand,
                    reputation: user.reputation,
                    level: user.level,
                    xp: user.xp
                }
            };
        } catch (error) {
            console.error('Error generating portfolio insights:', error);
            return { success: false, message: error.message };
        }
    }

    async identifySkillGaps(userId) {
        try {
            const userSkills = await prisma.userSkill.findMany({
                where: { userId },
                include: { skill: true }
            });

            const allSkills = await prisma.skill.findMany();
            const userSkillNames = userSkills.map(us => us.skill.name);

            const missingSkills = allSkills
                .filter(skill => !userSkillNames.includes(skill.name))
                .map(skill => ({
                    name: skill.name,
                    category: skill.category,
                    demand: skill.demand,
                    complexity: skill.complexity,
                    priority: skill.demand * skill.complexity
                }))
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 5); // Top 5 missing skills

            return missingSkills;
        } catch (error) {
            console.error('Error identifying skill gaps:', error);
            return [];
        }
    }

    async calculateGrowthTrends(userId) {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

            const [recentXP, previousXP] = await Promise.all([
                prisma.userActivity.aggregate({
                    where: {
                        userId,
                        type: 'xp_earned',
                        createdAt: { gte: thirtyDaysAgo }
                    },
                    _sum: { data: true }
                }),
                prisma.userActivity.aggregate({
                    where: {
                        userId,
                        type: 'xp_earned',
                        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
                    },
                    _sum: { data: true }
                })
            ]);

            const recentXPTotal = recentXP._sum.data ? 
                recentXP._sum.data.reduce((sum, item) => sum + (item.xpEarned || 0), 0) : 0;
            const previousXPTotal = previousXP._sum.data ? 
                previousXP._sum.data.reduce((sum, item) => sum + (item.xpEarned || 0), 0) : 0;

            const growthRate = previousXPTotal > 0 ? 
                ((recentXPTotal - previousXPTotal) / previousXPTotal) * 100 : 0;

            return {
                recentXP: recentXPTotal,
                previousXP: previousXPTotal,
                growthRate: Math.round(growthRate * 100) / 100,
                trend: growthRate > 0 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable'
            };
        } catch (error) {
            console.error('Error calculating growth trends:', error);
            return { recentXP: 0, previousXP: 0, growthRate: 0, trend: 'unknown' };
        }
    }

    async analyzeMarketDemand(userId) {
        try {
            const userSkills = await prisma.userSkill.findMany({
                where: { userId },
                include: { skill: true }
            });

            const skillDemand = userSkills.map(us => ({
                name: us.skill.name,
                level: us.level,
                demand: us.skill.demand,
                marketValue: us.level * us.skill.demand
            }));

            const totalMarketValue = skillDemand.reduce((sum, skill) => 
                sum + skill.marketValue, 0
            );

            const highDemandSkills = skillDemand
                .filter(skill => skill.demand >= 4)
                .sort((a, b) => b.marketValue - a.marketValue);

            return {
                totalMarketValue,
                highDemandSkills: highDemandSkills.slice(0, 3),
                skillDemand
            };
        } catch (error) {
            console.error('Error analyzing market demand:', error);
            return { totalMarketValue: 0, highDemandSkills: [], skillDemand: [] };
        }
    }

    // Community Engagement
    async calculateCommunityScore(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    messages: true,
                    kudosGiven: true,
                    endorsementsGiven: true,
                    ideas: true,
                    pollVotes: true
                }
            });

            if (!user) return { success: false, message: 'User not found' };

            let communityScore = 0;

            // Message contributions
            communityScore += user.messages.length * 2;

            // Kudos given (encouraging others)
            communityScore += user.kudosGiven.length * 5;

            // Endorsements given (helping others)
            communityScore += user.endorsementsGiven.length * 8;

            // Ideas shared
            communityScore += user.ideas.length * 10;

            // Poll participation
            communityScore += user.pollVotes.length * 3;

            return {
                success: true,
                communityScore,
                breakdown: {
                    messages: user.messages.length * 2,
                    kudosGiven: user.kudosGiven.length * 5,
                    endorsementsGiven: user.endorsementsGiven.length * 8,
                    ideas: user.ideas.length * 10,
                    pollVotes: user.pollVotes.length * 3
                }
            };
        } catch (error) {
            console.error('Error calculating community score:', error);
            return { success: false, message: error.message };
        }
    }

    // Daily Challenges and Streaks
    async generateDailyChallenge(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { level: true, userSkills: { include: { skill: true } } }
            });

            if (!user) return { success: false, message: 'User not found' };

            const challenges = [
                {
                    type: 'LOGIN',
                    description: 'Log in to the platform',
                    xpReward: this.xpRewards.LOGIN,
                    difficulty: 'EASY'
                },
                {
                    type: 'CONTRIBUTION',
                    description: 'Make a contribution to any project',
                    xpReward: this.xpRewards.CONTRIBUTION,
                    difficulty: 'MEDIUM'
                },
                {
                    type: 'IDEA',
                    description: 'Share a new idea',
                    xpReward: this.xpRewards.IDEA,
                    difficulty: 'MEDIUM'
                },
                {
                    type: 'ENDORSEMENT',
                    description: 'Endorse someone\'s skill',
                    xpReward: this.xpRewards.SKILL_ENDORSEMENT,
                    difficulty: 'EASY'
                }
            ];

            // Select challenge based on user level
            const levelIndex = Object.keys(this.xpLevels).indexOf(user.level);
            const challengeIndex = levelIndex % challenges.length;
            const selectedChallenge = challenges[challengeIndex];

            return {
                success: true,
                challenge: selectedChallenge,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            };
        } catch (error) {
            console.error('Error generating daily challenge:', error);
            return { success: false, message: error.message };
        }
    }

    // Leaderboards
    async getLeaderboard(category = 'xp', limit = 10) {
        try {
            let orderBy = {};
            let include = {};

            switch (category) {
                case 'xp':
                    orderBy = { xp: 'desc' };
                    break;
                case 'reputation':
                    orderBy = { reputation: 'desc' };
                    break;
                case 'contributions':
                    orderBy = { totalContributions: 'desc' };
                    break;
                case 'portfolio':
                    orderBy = { totalPortfolioValue: 'desc' };
                    break;
                case 'badges':
                    include = { userBadges: true };
                    orderBy = { userBadges: { _count: 'desc' } };
                    break;
                default:
                    orderBy = { xp: 'desc' };
            }

            const users = await prisma.user.findMany({
                where: { status: 'ACTIVE' },
                select: {
                    id: true,
                    name: true,
                    level: true,
                    xp: true,
                    reputation: true,
                    totalContributions: true,
                    totalPortfolioValue: true,
                    userBadges: category === 'badges' ? true : false
                },
                orderBy,
                take: limit
            });

            // Calculate badge count for badge leaderboard
            if (category === 'badges') {
                users.forEach(user => {
                    user.badgeCount = user.userBadges ? user.userBadges.length : 0;
                    delete user.userBadges;
                });
                users.sort((a, b) => b.badgeCount - a.badgeCount);
            }

            return {
                success: true,
                category,
                leaderboard: users,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = GamificationService;
