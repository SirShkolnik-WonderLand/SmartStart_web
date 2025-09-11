const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== GAMIFICATION SYSTEM =====

// Award XP to user
router.post('/xp/award', authenticateToken, async(req, res) => {
    try {
        const {
            userId,
            xpAmount,
            activityType, // 'DOCUMENT_SIGNED', 'TEAM_JOINED', 'GOAL_COMPLETED', etc.
            activityId,
            description,
            metadata = {}
        } = req.body;

        // Validate required fields
        if (!userId || !xpAmount || !activityType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, xpAmount, activityType'
            });
        }

        // Create XP transaction
        const xpTransaction = await prisma.xpTransaction.create({
            data: {
                userId,
                xpAmount,
                activityType,
                activityId: activityId || null,
                description: description || `Earned ${xpAmount} XP for ${activityType}`,
                metadata: JSON.stringify(metadata),
                createdAt: new Date()
            }
        });

        // Update user's total XP
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalXp: {
                    increment: xpAmount
                },
                updatedAt: new Date()
            }
        });

        // Check for level up
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { totalXp: true, level: true }
        });

        const newLevel = calculateLevel(user.totalXp);
        let levelUpData = null;

        if (newLevel > user.level) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    level: newLevel,
                    updatedAt: new Date()
                }
            });

            levelUpData = {
                newLevel,
                previousLevel: user.level,
                xpRequired: calculateXpForLevel(newLevel),
                xpCurrent: user.totalXp
            };
        }

        res.json({
            success: true,
            data: {
                xpTransaction,
                levelUpData,
                totalXp: user.totalXp + xpAmount
            }
        });

    } catch (error) {
        console.error('Error awarding XP:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to award XP'
        });
    }
});

// Get user's XP history
router.get('/xp/history/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, activityType } = req.query;

        const whereClause = {
            userId,
            ...(activityType && { activityType })
        };

        const [xpHistory, totalCount] = await Promise.all([
            prisma.xpTransaction.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.xpTransaction.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: {
                xpHistory,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching XP history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch XP history'
        });
    }
});

// Award badge to user
router.post('/badges/award', authenticateToken, async(req, res) => {
    try {
        const {
            userId,
            badgeId,
            awardedBy = null,
            reason = null,
            metadata = {}
        } = req.body;

        // Validate required fields
        if (!userId || !badgeId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, badgeId'
            });
        }

        // Check if badge exists
        const badge = await prisma.badge.findUnique({
            where: { id: badgeId }
        });

        if (!badge) {
            return res.status(404).json({
                success: false,
                error: 'Badge not found'
            });
        }

        // Check if user already has this badge
        const existingBadge = await prisma.userBadge.findFirst({
            where: {
                userId,
                badgeId
            }
        });

        if (existingBadge) {
            return res.status(400).json({
                success: false,
                error: 'User already has this badge'
            });
        }

        // Award badge
        const userBadge = await prisma.userBadge.create({
            data: {
                userId,
                badgeId,
                awardedBy,
                reason: reason || `Awarded for ${badge.name}`,
                metadata: JSON.stringify(metadata),
                awardedAt: new Date()
            },
            include: {
                badge: true
            }
        });

        res.json({
            success: true,
            data: { userBadge },
            message: `Badge "${badge.name}" awarded successfully`
        });

    } catch (error) {
        console.error('Error awarding badge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to award badge'
        });
    }
});

// Get user's badges
router.get('/badges/user/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { category } = req.query;

        const whereClause = {
            userId,
            ...(category && {
                badge: {
                    category
                }
            })
        };

        const userBadges = await prisma.userBadge.findMany({
            where: whereClause,
            include: {
                badge: true
            },
            orderBy: { awardedAt: 'desc' }
        });

        res.json({
            success: true,
            data: { userBadges }
        });

    } catch (error) {
        console.error('Error fetching user badges:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user badges'
        });
    }
});

// Get available badges
router.get('/badges/available', authenticateToken, async(req, res) => {
    try {
        const { category, rarity } = req.query;

        const whereClause = {
            ...(category && { category }),
            ...(rarity && { rarity })
        };

        const badges = await prisma.badge.findMany({
            where: whereClause,
            orderBy: [
                { category: 'asc' },
                { rarity: 'desc' },
                { name: 'asc' }
            ]
        });

        res.json({
            success: true,
            data: { badges }
        });

    } catch (error) {
        console.error('Error fetching available badges:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch available badges'
        });
    }
});

// Create achievement
router.post('/achievements/create', authenticateToken, async(req, res) => {
    try {
        const {
            userId,
            achievementType, // 'FIRST_DOCUMENT', 'TEAM_LEADER', 'XP_MILESTONE', etc.
            title,
            description,
            xpReward = 0,
            badgeReward = null,
            metadata = {}
        } = req.body;

        // Validate required fields
        if (!userId || !achievementType || !title) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, achievementType, title'
            });
        }

        // Create achievement
        const achievement = await prisma.achievement.create({
            data: {
                userId,
                achievementType,
                title,
                description: description || `Achievement: ${title}`,
                xpReward,
                badgeReward,
                metadata: JSON.stringify(metadata),
                achievedAt: new Date()
            }
        });

        // Award XP if specified
        if (xpReward > 0) {
            await prisma.xpTransaction.create({
                data: {
                    userId,
                    xpAmount: xpReward,
                    activityType: 'ACHIEVEMENT_EARNED',
                    activityId: achievement.id,
                    description: `XP reward for achievement: ${title}`,
                    metadata: JSON.stringify({ achievementId: achievement.id }),
                    createdAt: new Date()
                }
            });

            // Update user's total XP
            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalXp: {
                        increment: xpReward
                    },
                    updatedAt: new Date()
                }
            });
        }

        // Award badge if specified
        if (badgeReward) {
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badgeReward,
                    reason: `Awarded for achievement: ${title}`,
                    metadata: JSON.stringify({ achievementId: achievement.id }),
                    awardedAt: new Date()
                }
            });
        }

        res.json({
            success: true,
            data: { achievement },
            message: 'Achievement created and rewards distributed'
        });

    } catch (error) {
        console.error('Error creating achievement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create achievement'
        });
    }
});

// Get user's achievements
router.get('/achievements/user/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { achievementType } = req.query;

        const whereClause = {
            userId,
            ...(achievementType && { achievementType })
        };

        const achievements = await prisma.achievement.findMany({
            where: whereClause,
            orderBy: { achievedAt: 'desc' }
        });

        res.json({
            success: true,
            data: { achievements }
        });

    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user achievements'
        });
    }
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, async(req, res) => {
    try {
        const { type = 'xp', limit = 50, timeframe = 'all' } = req.query;

        let orderBy = {};
        let whereClause = {};

        // Set timeframe filter
        if (timeframe !== 'all') {
            const days = parseInt(timeframe);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            whereClause.createdAt = { gte: startDate };
        }

        let leaderboard = [];

        if (type === 'xp') {
            leaderboard = await prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
                    totalXp: true,
                    level: true
                },
                orderBy: { totalXp: 'desc' },
                take: parseInt(limit)
            });
        } else if (type === 'badges') {
            leaderboard = await prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
                    totalXp: true,
                    level: true,
                    _count: {
                        select: {
                            badges: true
                        }
                    }
                },
                orderBy: {
                    badges: {
                        _count: 'desc'
                    }
                },
                take: parseInt(limit)
            });
        }

        res.json({
            success: true,
            data: { leaderboard }
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard'
        });
    }
});

// Get gamification analytics
router.get('/analytics', authenticateToken, async(req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        const whereClause = {
            ...(userId && { userId }),
            ...(startDate && endDate && {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            })
        };

        const [
            totalXpAwarded,
            totalBadgesAwarded,
            totalAchievements,
            xpByActivity,
            topUsers,
            recentActivity
        ] = await Promise.all([
            prisma.xpTransaction.aggregate({
                where: whereClause,
                _sum: { xpAmount: true }
            }),
            prisma.userBadge.count({ where: whereClause }),
            prisma.achievement.count({ where: whereClause }),
            prisma.xpTransaction.groupBy({
                by: ['activityType'],
                where: whereClause,
                _sum: { xpAmount: true },
                _count: { id: true }
            }),
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    totalXp: true,
                    level: true
                },
                orderBy: { totalXp: 'desc' },
                take: 10
            }),
            prisma.xpTransaction.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            })
        ]);

        res.json({
            success: true,
            data: {
                totalXpAwarded: totalXpAwarded._sum.xpAmount || 0,
                totalBadgesAwarded,
                totalAchievements,
                xpByActivity,
                topUsers,
                recentActivity
            }
        });

    } catch (error) {
        console.error('Error fetching gamification analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch gamification analytics'
        });
    }
});

// ===== HELPER FUNCTIONS =====

function calculateLevel(totalXp) {
    // Level formula: level = floor(sqrt(totalXp / 100))
    return Math.floor(Math.sqrt(totalXp / 100));
}

function calculateXpForLevel(level) {
    // XP required for level: (level * level) * 100
    return (level * level) * 100;
}

module.exports = router;