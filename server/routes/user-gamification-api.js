const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/unified-auth');

const prisma = new PrismaClient();

// ===== USER GAMIFICATION DASHBOARD =====

// Get user gamification dashboard
router.get('/dashboard/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this dashboard
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this dashboard'
            });
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                level: true,
                xp: true,
                reputation: true,
                status: true,
                lastActive: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user badges
        const badges = await prisma.userBadge.findMany({
            where: { userId },
            include: {
                badge: true
            },
            orderBy: { earnedAt: 'desc' }
        });

        // Get user skills
        const skills = await prisma.userSkill.findMany({
            where: { userId },
            include: {
                skill: true
            },
            orderBy: { level: 'desc' }
        });

        // Get available badges
        const availableBadges = await prisma.badge.findMany({
            where: {
                isActive: true,
                id: { notIn: badges.map(b => b.badgeId) }
            },
            orderBy: { requiredXP: 'asc' }
        });

        // Get XP history
        const xpHistory = await prisma.userXPLog.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' },
            take: 20
        });

        // Get recent achievements
        const recentAchievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true
            },
            orderBy: { earnedAt: 'desc' },
            take: 10
        });

        // Get level progression
        const currentLevel = user.level;
        const currentXP = user.xp;
        
        // Calculate next level requirements
        const levelRequirements = calculateLevelRequirements(currentLevel, currentXP);
        
        // Get leaderboard position
        const leaderboardPosition = await getLeaderboardPosition(userId, currentXP);

        // Get skill development progress
        const skillProgress = await getSkillDevelopmentProgress(userId);

        // Get achievement progress
        const achievementProgress = await getAchievementProgress(userId);

        res.json({
            success: true,
            dashboard: {
                user: {
                    ...user,
                    isOwnDashboard: requestingUser.id === userId
                },
                gamification: {
                    currentLevel,
                    currentXP,
                    reputation: user.reputation,
                    levelRequirements,
                    leaderboardPosition,
                    progressToNextLevel: levelRequirements.progressPercentage
                },
                badges: {
                    earned: badges,
                    available: availableBadges,
                    totalEarned: badges.length,
                    totalAvailable: availableBadges.length + badges.length
                },
                skills: {
                    current: skills,
                    progress: skillProgress,
                    totalSkills: skills.length,
                    averageLevel: skills.length > 0 ? 
                        skills.reduce((sum, s) => sum + getSkillLevelValue(s.level), 0) / skills.length : 0
                },
                achievements: {
                    recent: recentAchievements,
                    progress: achievementProgress,
                    totalEarned: recentAchievements.length
                },
                xpHistory: {
                    recent: xpHistory,
                    totalEarned: xpHistory.reduce((sum, log) => sum + log.xpEarned, 0)
                }
            }
        });

    } catch (error) {
        console.error('Dashboard retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard',
            error: error.message
        });
    }
});

// Get user XP breakdown
router.get('/dashboard/:userId/xp', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this data
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this data'
            });
        }

        // Get XP breakdown by source
        const xpBreakdown = await prisma.userXPLog.groupBy({
            by: ['source', 'category'],
            where: { userId },
            _sum: { xpEarned: true },
            _count: { id: true }
        });

        // Get XP timeline (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const xpTimeline = await prisma.userXPLog.findMany({
            where: {
                userId,
                earnedAt: { gte: thirtyDaysAgo }
            },
            orderBy: { earnedAt: 'asc' }
        });

        // Get daily XP totals
        const dailyXP = {};
        xpTimeline.forEach(log => {
            const date = log.earnedAt.toISOString().split('T')[0];
            dailyXP[date] = (dailyXP[date] || 0) + log.xpEarned;
        });

        res.json({
            success: true,
            xpData: {
                breakdown: xpBreakdown.map(item => ({
                    source: item.source,
                    category: item.category,
                    totalXP: item._sum.xpEarned,
                    count: item._count.id
                })),
                timeline: Object.entries(dailyXP).map(([date, xp]) => ({ date, xp })),
                totalXP: xpTimeline.reduce((sum, log) => sum + log.xpEarned, 0)
            }
        });

    } catch (error) {
        console.error('XP data retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve XP data',
            error: error.message
        });
    }
});

// Get user skill development
router.get('/dashboard/:userId/skills', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this data
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this data'
            });
        }

        // Get user skills with progress
        const skills = await prisma.userSkill.findMany({
            where: { userId },
            include: {
                skill: true
            },
            orderBy: { level: 'desc' }
        });

        // Get skill development history
        const skillHistory = await prisma.userSkillLog.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });

        // Calculate skill growth
        const skillGrowth = skills.map(userSkill => {
            const history = skillHistory.filter(h => h.skillId === userSkill.skillId);
            const growth = history.length > 1 ? 
                history[0].level - history[history.length - 1].level : 0;
            
            return {
                ...userSkill,
                growth,
                history: history.slice(0, 5) // Last 5 changes
            };
        });

        res.json({
            success: true,
            skills: {
                current: skillGrowth,
                history: skillHistory,
                totalSkills: skills.length,
                averageLevel: skills.length > 0 ? 
                    skills.reduce((sum, s) => sum + getSkillLevelValue(s.level), 0) / skills.length : 0
            }
        });

    } catch (error) {
        console.error('Skills data retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skills data',
            error: error.message
        });
    }
});

// Get user achievements progress
router.get('/dashboard/:userId/achievements', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this data
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this data'
            });
        }

        // Get all available achievements
        const allAchievements = await prisma.achievement.findMany({
            where: { isActive: true },
            orderBy: { requiredXP: 'asc' }
        });

        // Get user earned achievements
        const earnedAchievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true
            }
        });

        // Calculate progress for each achievement
        const achievementProgress = allAchievements.map(achievement => {
            const earned = earnedAchievements.find(e => e.achievementId === achievement.id);
            const progress = calculateAchievementProgress(userId, achievement);
            
            return {
                ...achievement,
                isEarned: !!earned,
                earnedAt: earned?.earnedAt,
                progress,
                canEarn: progress >= 100
            };
        });

        // Group achievements by category
        const achievementsByCategory = achievementProgress.reduce((acc, achievement) => {
            const category = achievement.category || 'General';
            if (!acc[category]) acc[category] = [];
            acc[category].push(achievement);
            return acc;
        }, {});

        res.json({
            success: true,
            achievements: {
                all: achievementProgress,
                byCategory: achievementsByCategory,
                earned: earnedAchievements,
                totalAvailable: allAchievements.length,
                totalEarned: earnedAchievements.length,
                completionRate: (earnedAchievements.length / allAchievements.length) * 100
            }
        });

    } catch (error) {
        console.error('Achievements data retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve achievements data',
            error: error.message
        });
    }
});

// Get user leaderboard position
router.get('/dashboard/:userId/leaderboard', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this data
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this data'
            });
        }

        // Get top users by XP
        const topUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                level: true,
                xp: true,
                reputation: true
            },
            orderBy: { xp: 'desc' },
            take: 100
        });

        // Find user position
        const userPosition = topUsers.findIndex(user => user.id === userId) + 1;

        // Get users around current user
        const startIndex = Math.max(0, userPosition - 5);
        const endIndex = Math.min(topUsers.length, userPosition + 5);
        const nearbyUsers = topUsers.slice(startIndex, endIndex);

        // Get category leaderboards
        const levelLeaderboard = await prisma.user.findMany({
            select: { id: true, name: true, level: true, xp: true },
            orderBy: { level: 'desc' },
            take: 20
        });

        const reputationLeaderboard = await prisma.user.findMany({
            select: { id: true, name: true, reputation: true, xp: true },
            orderBy: { reputation: 'desc' },
            take: 20
        });

        res.json({
            success: true,
            leaderboard: {
                overall: {
                    position: userPosition,
                    totalUsers: topUsers.length,
                    topUsers: topUsers.slice(0, 20),
                    nearbyUsers
                },
                byCategory: {
                    level: levelLeaderboard,
                    reputation: reputationLeaderboard
                }
            }
        });

    } catch (error) {
        console.error('Leaderboard data retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve leaderboard data',
            error: error.message
        });
    }
});

// Helper functions
function calculateLevelRequirements(currentLevel, currentXP) {
    const baseXP = 100;
    const multiplier = 1.5;
    
    const currentLevelXP = Math.floor(baseXP * Math.pow(multiplier, currentLevel - 1));
    const nextLevelXP = Math.floor(baseXP * Math.pow(multiplier, currentLevel));
    
    const xpInCurrentLevel = currentXP - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentXP;
    const progressPercentage = Math.min(100, (xpInCurrentLevel / (nextLevelXP - currentLevelXP)) * 100);
    
    return {
        currentLevelXP,
        nextLevelXP,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        progressPercentage: Math.round(progressPercentage)
    };
}

function getSkillLevelValue(level) {
    const levelValues = { 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3, 'EXPERT': 4, 'MASTER': 5 };
    return levelValues[level] || 1;
}

async function getLeaderboardPosition(userId, userXP) {
    const usersWithHigherXP = await prisma.user.count({
        where: { xp: { gt: userXP } }
    });
    return usersWithHigherXP + 1;
}

async function getSkillDevelopmentProgress(userId) {
    const skills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true }
    });
    
    return skills.map(skill => ({
        skillId: skill.skillId,
        skillName: skill.skill.name,
        currentLevel: skill.level,
        yearsOfExperience: skill.yearsOfExperience,
        isVerified: skill.isVerified
    }));
}

async function getAchievementProgress(userId) {
    const achievements = await prisma.achievement.findMany({
        where: { isActive: true }
    });
    
    const earnedAchievements = await prisma.userAchievement.findMany({
        where: { userId }
    });
    
    return achievements.map(achievement => {
        const earned = earnedAchievements.find(e => e.achievementId === achievement.id);
        return {
            achievementId: achievement.id,
            name: achievement.name,
            isEarned: !!earned,
            earnedAt: earned?.earnedAt
        };
    });
}

function calculateAchievementProgress(userId, achievement) {
    // This would calculate progress based on achievement criteria
    // For now, return 100 if earned, 0 if not
    return 0; // Placeholder
}

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'User Gamification Dashboard System is healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /dashboard/:userId - Get user gamification dashboard',
            'GET /dashboard/:userId/xp - Get user XP breakdown',
            'GET /dashboard/:userId/skills - Get user skill development',
            'GET /dashboard/:userId/achievements - Get user achievements progress',
            'GET /dashboard/:userId/leaderboard - Get user leaderboard position'
        ]
    });
});

module.exports = router;
