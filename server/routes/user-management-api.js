const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const UserManagementService = require('../services/user-management-service');

const prisma = new PrismaClient();
const userService = new UserManagementService();

// ===== HEALTH CHECK =====
router.get('/health', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const activeUserCount = await prisma.user.count({
            where: { status: 'ACTIVE' }
        });

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            metrics: {
                totalUsers: userCount,
                activeUsers: activeUserCount,
                systemStatus: 'operational'
            }
        });
    } catch (error) {
        console.error('User management health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// ===== USER CRUD OPERATIONS =====

// Create new user
router.post('/create', async (req, res) => {
    try {
        const userData = req.body;
        
        if (!userData.email || !userData.name) {
            return res.status(400).json({
                success: false,
                message: 'Email and name are required'
            });
        }

        const result = await userService.createUser(userData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user by ID with optional relations
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { include } = req.query;
        
        const includeRelations = include ? include.split(',') : [];
        const result = await userService.getUserById(userId, includeRelations);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update user
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        
        const result = await userService.updateUser(userId, updateData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== USER PROFILE MANAGEMENT =====

// Update user profile
router.put('/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;
        
        const result = await userService.updateUserProfile(userId, profileData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update privacy settings
router.put('/:userId/privacy', async (req, res) => {
    try {
        const { userId } = req.params;
        const privacyData = req.body;
        
        const result = await userService.updatePrivacySettings(userId, privacyData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== USER CONNECTIONS & NETWORKING =====

// Create connection request
router.post('/:userId/connections', async (req, res) => {
    try {
        const { userId } = req.params;
        const { targetId, connectionType } = req.body;
        
        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: 'Target user ID is required'
            });
        }

        const result = await userService.createUserConnection(userId, targetId, connectionType);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error creating connection:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Accept connection
router.put('/:userId/connections/:connectionId/accept', async (req, res) => {
    try {
        const { userId, connectionId } = req.params;
        
        const result = await userService.acceptConnection(connectionId, userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error accepting connection:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user connections
router.get('/:userId/connections', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'ACCEPTED' } = req.query;
        
        const result = await userService.getUserConnections(userId, status);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error getting user connections:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== USER PORTFOLIO MANAGEMENT =====

// Add portfolio item
router.post('/:userId/portfolio', async (req, res) => {
    try {
        const { userId } = req.params;
        const portfolioData = req.body;
        
        const result = await userService.addPortfolioItem(userId, portfolioData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error adding portfolio item:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user portfolio
router.get('/:userId/portfolio', async (req, res) => {
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

// Update portfolio metrics
router.post('/:userId/portfolio/update-metrics', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await userService.updateUserPortfolioMetrics(userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating portfolio metrics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== USER SKILLS & ENDORSEMENTS =====

// Add user skill
router.post('/:userId/skills', async (req, res) => {
    try {
        const { userId } = req.params;
        const skillData = req.body;
        
        const result = await userService.addUserSkill(userId, skillData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error adding user skill:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user skills
router.get('/:userId/skills', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userSkills = await prisma.userSkill.findMany({
            where: { userId },
            include: {
                skill: true
            },
            orderBy: { level: 'desc' }
        });

        res.json({
            success: true,
            skills: userSkills,
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

// ===== USER ACTIVITY & ANALYTICS =====

// Get user analytics
router.get('/:userId/analytics', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await userService.getUserAnalytics(userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error getting user analytics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user activity log
router.get('/:userId/activity', async (req, res) => {
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

// ===== USER SETTINGS & PREFERENCES =====

// Get user settings
router.get('/:userId/settings', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await userService.getUserSettings(userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error getting user settings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update user settings
router.put('/:userId/settings', async (req, res) => {
    try {
        const { userId } = req.params;
        const settingsData = req.body;
        
        const result = await userService.updateUserSettings(userId, settingsData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== USER SEARCH & DISCOVERY =====

// Search users
router.get('/search', async (req, res) => {
    try {
        const searchParams = req.query;
        
        const result = await userService.searchUsers(searchParams);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== USER STATISTICS =====

// Get user statistics
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [user, portfolio, skills, badges, activity] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    level: true,
                    xp: true,
                    reputation: true,
                    totalPortfolioValue: true,
                    activeProjectsCount: true,
                    totalContributions: true,
                    lastActive: true
                }
            }),
            prisma.portfolioItem.count({ where: { userId } }),
            prisma.userSkill.count({ where: { userId } }),
            prisma.userBadge.count({ where: { userId } }),
            prisma.userActivity.count({ where: { userId } })
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            stats: {
                ...user,
                portfolioItems: portfolio,
                skills: skills,
                badges: badges,
                totalActivity: activity
            }
        });
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== TABLE CREATION ENDPOINT =====
router.post('/create-tables', async (req, res) => {
    try {
        console.log('🔨 Creating user management system tables...');
        
        // Create UserProfile table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "UserProfile" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "nickname" VARCHAR(40) NOT NULL,
                "avatarFileId" TEXT,
                "theme" TEXT NOT NULL DEFAULT 'auto',
                "bio" VARCHAR(280),
                "location" VARCHAR(80),
                "websiteUrl" VARCHAR(200),
                "level" INTEGER NOT NULL DEFAULT 1,
                "xp" INTEGER NOT NULL DEFAULT 0,
                "repScore" INTEGER NOT NULL DEFAULT 0,
                "isPublic" BOOLEAN NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create ProfilePrivacy table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "ProfilePrivacy" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "showExactPercToHub" BOOLEAN NOT NULL DEFAULT false,
                "showActivity" BOOLEAN NOT NULL DEFAULT true,
                "showSkills" BOOLEAN NOT NULL DEFAULT true,
                "showReputation" BOOLEAN NOT NULL DEFAULT true,
                CONSTRAINT "ProfilePrivacy_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create Wallet table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Wallet" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "buzBalance" INTEGER NOT NULL DEFAULT 0,
                "pendingLock" INTEGER NOT NULL DEFAULT 0,
                "chainAddress" TEXT,
                "chainType" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create UserConnection table
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "UserConnection" (
                "id" TEXT NOT NULL,
                "requesterId" TEXT NOT NULL,
                "targetId" TEXT NOT NULL,
                "connectionType" TEXT NOT NULL DEFAULT 'CONNECTION',
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "acceptedAt" TIMESTAMP(3),
                "rejectedAt" TIMESTAMP(3),
                CONSTRAINT "UserConnection_pkey" PRIMARY KEY ("id")
            );
        `;
        
        // Create indexes
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "UserProfile_userId_key" ON "UserProfile"("userId");`;
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "ProfilePrivacy_userId_key" ON "ProfilePrivacy"("userId");`;
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_userId_key" ON "Wallet"("userId");`;
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "UserConnection_requesterId_targetId_key" ON "UserConnection"("requesterId", "targetId");`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "UserConnection_requesterId_idx" ON "UserConnection"("requesterId");`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "UserConnection_targetId_idx" ON "UserConnection"("targetId");`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "UserConnection_status_idx" ON "UserConnection"("status");`;
        
        res.json({
            success: true,
            message: 'User management system tables created successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Table creation failed',
            error: error.message
        });
    }
});

// ===== SYSTEM OPERATIONS =====

// Get all users (admin)
router.get('/', async (req, res) => {
    try {
        const { limit = 50, offset = 0, status, level } = req.query;
        
        const whereClause = {};
        if (status) whereClause.status = status;
        if (level) whereClause.level = level;

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    level: true,
                    xp: true,
                    reputation: true,
                    status: true,
                    lastActive: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit),
                skip: parseInt(offset)
            }),
            prisma.user.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            users,
            pagination: {
                total: totalUsers,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + users.length < totalUsers
            }
        });
    } catch (error) {
        console.error('Error getting all users:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get system statistics
router.get('/stats/system', async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            totalXP,
            averageXP,
            levelDistribution,
            reputationDistribution
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.aggregate({ _sum: { xp: true } }),
            prisma.user.aggregate({ _avg: { xp: true } }),
            prisma.user.groupBy({
                by: ['level'],
                _count: { level: true }
            }),
            prisma.user.groupBy({
                by: ['reputation'],
                _count: { reputation: true }
            })
        ]);

        res.json({
            success: true,
            systemStats: {
                totalUsers,
                activeUsers,
                totalXP: totalXP._sum.xp || 0,
                averageXP: Math.round((averageXP._avg.xp || 0) * 100) / 100,
                levelDistribution,
                reputationDistribution
            }
        });
    } catch (error) {
        console.error('Error getting system stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
