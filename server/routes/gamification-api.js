const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const GamificationService = require('../services/gamification-service');

const prisma = new PrismaClient();
const gamificationService = new GamificationService();

// ===== HEALTH CHECK =====
router.get('/health', async (req, res) => {
    try {
        const metrics = await getGamificationMetrics();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            metrics
        });
    } catch (error) {
        console.error('Gamification health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// ===== MIGRATION ENDPOINT =====
router.post('/migrate', async (req, res) => {
    try {
        console.log('🚀 Starting gamification system migration...');
        
        // Import and run migration
        const { migrateGamificationSystem } = require('../migrate-gamification-system');
        await migrateGamificationSystem();
        
        res.json({
            success: true,
            message: 'Gamification system migration completed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration failed',
            error: error.message
        });
    }
});

// ===== SEEDING ENDPOINT =====
router.post('/seed', async (req, res) => {
    try {
        console.log('🌱 Starting gamification system seeding...');
        
        // Import and run seeding
        const { seedGamification } = require('../seed-gamification');
        await seedGamification();
        
        res.json({
            success: true,
            message: 'Gamification system seeding completed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({
            success: false,
            message: 'Seeding failed',
            error: error.message
        });
    }
});

// ===== XP & LEVEL MANAGEMENT =====

// Add XP for user activity
router.post('/xp/add', async (req, res) => {
    try {
        const { userId, activityType, amount } = req.body;
        
        if (!userId || !activityType) {
            return res.status(400).json({
                success: false,
                message: 'userId and activityType are required'
            });
        }

        const result = await gamificationService.addXP(userId, activityType, amount);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error adding XP:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user XP and level info
router.get('/xp/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                level: true,
                reputation: true,
                lastActive: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate XP progress to next level
        const currentLevel = user.level;
        const currentXP = user.xp;
        
        const levels = ['OWLET', 'NIGHT_WATCHER', 'WISE_OWL', 'SKY_MASTER'];
        const currentLevelIndex = levels.indexOf(currentLevel);
        const nextLevel = levels[currentLevelIndex + 1];
        
        let xpToNextLevel = 0;
        let progressPercentage = 100;
        
        if (nextLevel) {
            const xpThresholds = {
                'OWLET': 1000,
                'NIGHT_WATCHER': 5000,
                'WISE_OWL': 20000
            };
            
            const nextThreshold = xpThresholds[currentLevel];
            if (nextThreshold) {
                xpToNextLevel = nextThreshold - currentXP;
                progressPercentage = Math.round((currentXP / nextThreshold) * 100);
            }
        }

        res.json({
            success: true,
            user: {
                ...user,
                nextLevel,
                xpToNextLevel,
                progressPercentage
            }
        });
    } catch (error) {
        console.error('Error getting user XP:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== BADGE SYSTEM =====

// Check and award badges for user
router.post('/badges/check/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await gamificationService.checkAndAwardBadges(userId);
        res.json(result);
    } catch (error) {
        console.error('Error checking badges:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user badges
router.get('/badges/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userBadges = await prisma.userBadge.findMany({
            where: { userId },
            include: {
                badge: true
            },
            orderBy: { earnedAt: 'desc' }
        });

        res.json({
            success: true,
            badges: userBadges,
            totalBadges: userBadges.length
        });
    } catch (error) {
        console.error('Error getting user badges:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all available badges
router.get('/badges', async (req, res) => {
    try {
        const badges = await prisma.badge.findMany({
            orderBy: { rarity: 'asc' }
        });

        res.json({
            success: true,
            badges,
            totalBadges: badges.length
        });
    } catch (error) {
        console.error('Error getting badges:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== REPUTATION SYSTEM =====

// Calculate and update user reputation
router.post('/reputation/calculate/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await gamificationService.calculateReputation(userId);
        res.json(result);
    } catch (error) {
        console.error('Error calculating reputation:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user reputation details
router.get('/reputation/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                reputation: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get endorsements and kudos separately to avoid relation issues
        const endorsements = await prisma.endorsement.findMany({
            where: { endorsedId: userId },
            include: {
                endorser: {
                    select: { name: true, reputation: true }
                },
                skill: {
                    select: { name: true }
                }
            }
        });

        const kudos = await prisma.kudos.findMany({
            where: { userId },
            include: {
                giver: {
                    select: { name: true }
                }
            }
        });

        res.json({
            success: true,
            reputation: user.reputation,
            endorsements: endorsements,
            kudos: kudos
        });
    } catch (error) {
        console.error('Error getting user reputation:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== PORTFOLIO ANALYTICS =====

// Generate portfolio insights for user
router.post('/portfolio/insights/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await gamificationService.generatePortfolioInsights(userId);
        res.json(result);
    } catch (error) {
        console.error('Error generating portfolio insights:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user portfolio items
router.get('/portfolio/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        const portfolioItems = await prisma.portfolioItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const totalItems = await prisma.portfolioItem.count({
            where: { userId }
        });

        res.json({
            success: true,
            portfolio: portfolioItems,
            pagination: {
                total: totalItems,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + portfolioItems.length < totalItems
            }
        });
    } catch (error) {
        console.error('Error getting user portfolio:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== SKILLS & ENDORSEMENTS =====

// Get user skills
router.get('/skills/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userSkills = await prisma.userSkill.findMany({
            where: { userId },
            include: {
                skill: true
            },
            orderBy: { level: 'desc' }
        });

        // Get endorsements separately to avoid relation issues
        const endorsements = await prisma.endorsement.findMany({
            where: { endorsedId: userId },
            include: {
                endorser: {
                    select: { name: true, reputation: true }
                },
                skill: {
                    select: { name: true }
                }
            }
        });

        res.json({
            success: true,
            skills: userSkills,
            endorsements: endorsements,
            totalSkills: userSkills.length
        });
    } catch (error) {
        console.error('Error getting user skills:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add skill endorsement
router.post('/skills/endorse', async (req, res) => {
    try {
        const { endorserId, endorsedId, skillId, weight, note } = req.body;
        
        if (!endorserId || !endorsedId || !weight) {
            return res.status(400).json({
                success: false,
                message: 'endorserId, endorsedId, and weight are required'
            });
        }

        // Validate weight range
        if (weight < 1 || weight > 5) {
            return res.status(400).json({
                success: false,
                message: 'Weight must be between 1 and 5'
            });
        }

        const endorsement = await prisma.endorsement.create({
            data: {
                endorserId,
                endorsedId,
                skillId,
                weight,
                note: note || null
            }
        });

        // Update endorsement count on user skill
        if (skillId) {
            await prisma.userSkill.updateMany({
                where: {
                    userId: endorsedId,
                    skillId
                },
                data: {
                    endorsements: {
                        increment: 1
                    }
                }
            });
        }

        // Add XP for giving endorsement
        await gamificationService.addXP(endorserId, 'SKILL_ENDORSEMENT');

        res.json({
            success: true,
            endorsement
        });
    } catch (error) {
        console.error('Error creating endorsement:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== COMMUNITY ENGAGEMENT =====

// Calculate community score
router.post('/community/score/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await gamificationService.calculateCommunityScore(userId);
        res.json(result);
    } catch (error) {
        console.error('Error calculating community score:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate daily challenge
router.get('/challenges/daily/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await gamificationService.generateDailyChallenge(userId);
        res.json(result);
    } catch (error) {
        console.error('Error generating daily challenge:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== LEADERBOARDS =====

// Get leaderboard by category
router.get('/leaderboard/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 10 } = req.query;
        
        const result = await gamificationService.getLeaderboard(category, parseInt(limit));
        res.json(result);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all leaderboards
router.get('/leaderboards', async (req, res) => {
    try {
        const categories = ['xp', 'reputation', 'contributions', 'portfolio', 'badges'];
        const leaderboards = {};

        for (const category of categories) {
            const result = await gamificationService.getLeaderboard(category, 5); // Top 5 for overview
            if (result.success) {
                leaderboards[category] = result.leaderboard;
            }
        }

        res.json({
            success: true,
            leaderboards,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error getting all leaderboards:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== ACTIVITY TRACKING =====

// Get user activity log
router.get('/activity/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, offset = 0, type } = req.query;
        
        const whereClause = { userId };
        if (type) {
            whereClause.type = type;
        }

        const activities = await prisma.userActivity.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const totalActivities = await prisma.userActivity.count({
            where: whereClause
        });

        res.json({
            success: true,
            activities,
            pagination: {
                total: totalActivities,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + activities.length < totalActivities
            }
        });
    } catch (error) {
        console.error('Error getting user activity:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function getGamificationMetrics() {
    try {
        const [
            totalUsers,
            totalBadges,
            totalSkills,
            activeUsers,
            totalXP
        ] = await Promise.all([
            prisma.user.count(),
            prisma.badge.count(),
            prisma.skill.count(),
            prisma.user.count({
                where: {
                    lastActive: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            }),
            prisma.user.aggregate({
                _sum: { xp: true }
            })
        ]);

        return {
            totalUsers,
            totalBadges,
            totalSkills,
            activeUsers,
            totalXP: totalXP._sum.xp || 0,
            averageXP: totalUsers > 0 ? Math.round((totalXP._sum.xp || 0) / totalUsers) : 0
        };
    } catch (error) {
        console.error('Error getting gamification metrics:', error);
        return {
            totalUsers: 0,
            totalBadges: 0,
            totalSkills: 0,
            activeUsers: 0,
            totalXP: 0,
            averageXP: 0
        };
    }
}

module.exports = router;
