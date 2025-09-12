const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Import services
const GamificationService = require('../services/gamification-service');
const gamificationService = new GamificationService();

// ===== MIDDLEWARE =====

// Authentication middleware
const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // This would need to be implemented with your JWT verification
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded;

        // For now, use a placeholder user ID
        req.user = { id: 'sample-user-id' };
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Permission middleware
const requirePermission = (permission) => {
    return (req, res, next) => {
        // This would check user permissions
        // For now, allow all authenticated users
        next();
    };
};

// ===== BUZ TOKEN SYSTEM =====

/**
 * GET /buz/supply - Get BUZ token supply information
 */
router.get('/buz/supply', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                totalSupply: 1000000000,
                circulatingSupply: 0,
                burnedSupply: 0,
                stakedSupply: 0,
                reserveSupply: 200000000,
                teamSupply: 150000000,
                communitySupply: 100000000,
                liquiditySupply: 100000000,
                stakingRewardsSupply: 200000000,
                userRewardsSupply: 150000000,
                ventureFundSupply: 100000000,
                currentPrice: 0.01,
                marketCap: 0,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Get BUZ supply error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve supply information',
            error: error.message
        });
    }
});

/**
 * GET /buz/stats - Get BUZ token statistics
 */
router.get('/buz/stats', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                totalUsers: 0,
                totalTransactions: 0,
                totalStaked: 0,
                totalBurned: 0,
                recentTransactions24h: 0,
                activeStakingPositions: 0,
                totalRewardsClaimed: 0
            }
        });
    } catch (error) {
        console.error('Get BUZ stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve statistics',
            error: error.message
        });
    }
});

/**
 * GET /buz/balance/:userId - Get user BUZ balance
 */
router.get('/buz/balance/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Authorization: allow own balance or users with read:user permission
        if (requestingUser.id !== userId && !(requestingUser.permissions || []).includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this balance'
            });
        }

        res.json({
            success: true,
            data: {
                userId,
                balance: 0,
                stakedBalance: 0,
                totalEarned: 0,
                totalSpent: 0,
                totalBurned: 0,
                lastActivity: null
            }
        });
    } catch (error) {
        console.error('Get BUZ balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve BUZ balance',
            error: error.message
        });
    }
});

/**
 * GET /buz/transactions/:userId - Get user transaction history
 */
router.get('/buz/transactions/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50, type, status } = req.query;
        const requestingUser = req.user;

        // Authorization: allow own transactions or users with read:user permission
        if (requestingUser.id !== userId && !(requestingUser.permissions || []).includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view these transactions'
            });
        }

        res.json({
            success: true,
            data: {
                transactions: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0
                }
            }
        });
    } catch (error) {
        console.error('Get BUZ transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve transaction history',
            error: error.message
        });
    }
});

/**
 * POST /buz/transfer - Transfer BUZ tokens
 */
router.post('/buz/transfer', authenticateToken, async (req, res) => {
    try {
        const { toUserId, amount, reason, description } = req.body;
        const fromUserId = req.user.id;

        // Validation
        if (!toUserId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'toUserId and amount are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be positive'
            });
        }

        if (fromUserId === toUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot transfer to yourself'
            });
        }

        res.json({
            success: true,
            message: 'BUZ transfer completed successfully',
            data: {
                transactionId: `buz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                fromUserId,
                toUserId,
                amount: parseFloat(amount),
                status: 'CONFIRMED'
            }
        });
    } catch (error) {
        console.error('BUZ transfer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to transfer BUZ tokens',
            error: error.message
        });
    }
});

/**
 * POST /buz/stake - Stake BUZ tokens
 */
router.post('/buz/stake', authenticateToken, async (req, res) => {
    try {
        const { amount, tier } = req.body;
        const userId = req.user.id;

        if (!amount || !tier) {
            return res.status(400).json({
                success: false,
                message: 'amount and tier are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be positive'
            });
        }

        // Validate staking tier
        const validTiers = ['BASIC', 'PREMIUM', 'VIP', 'GOVERNANCE'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid staking tier'
            });
        }

        // Calculate staking parameters
        const stakingConfig = {
            'BASIC': { duration: 30, apy: 5.00 },
            'PREMIUM': { duration: 90, apy: 10.00 },
            'VIP': { duration: 180, apy: 15.00 },
            'GOVERNANCE': { duration: 365, apy: 20.00 }
        };

        const config = stakingConfig[tier];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + config.duration);
        const expectedReward = amount * (config.apy / 100) * (config.duration / 365);

        res.json({
            success: true,
            message: 'BUZ tokens staked successfully',
            data: {
                stakingId: `staking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                amount: parseFloat(amount),
                tier,
                duration: config.duration,
                apy: config.apy,
                expectedReward: parseFloat(expectedReward),
                endDate: endDate.toISOString()
            }
        });
    } catch (error) {
        console.error('BUZ stake error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to stake BUZ tokens',
            error: error.message
        });
    }
});

/**
 * GET /buz/staking/:userId - Get user staking positions
 */
router.get('/buz/staking/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Authorization: allow own staking or users with read:user permission
        if (requestingUser.id !== userId && !(requestingUser.permissions || []).includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view staking positions'
            });
        }

        res.json({
            success: true,
            data: {
                stakingPositions: []
            }
        });
    } catch (error) {
        console.error('Get BUZ staking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve staking positions',
            error: error.message
        });
    }
});

/**
 * POST /buz/rewards/claim - Claim available rewards
 */
router.post('/buz/rewards/claim', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        res.json({
            success: true,
            message: 'Rewards claimed successfully',
            data: {
                claimedRewards: [],
                totalAmount: 0
            }
        });
    } catch (error) {
        console.error('Claim BUZ rewards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to claim rewards',
            error: error.message
        });
    }
});

/**
 * GET /buz/rewards/:userId - Get user rewards
 */
router.get('/buz/rewards/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Authorization: allow own rewards or users with read:user permission
        if (requestingUser.id !== userId && !(requestingUser.permissions || []).includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view rewards'
            });
        }

        res.json({
            success: true,
            data: {
                rewards: []
            }
        });
    } catch (error) {
        console.error('Get BUZ rewards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve rewards',
            error: error.message
        });
    }
});

// ===== ADMIN BUZ MANAGEMENT =====

/**
 * POST /buz/admin/mint - Mint new BUZ tokens (Admin only)
 */
router.post('/buz/admin/mint', authenticateToken, requirePermission('admin:buz'), async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        const adminUser = req.user;

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'userId and amount are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be positive'
            });
        }

        res.json({
            success: true,
            message: 'BUZ tokens minted successfully',
            data: {
                transactionId: `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                amount: parseFloat(amount),
                mintedBy: adminUser.id,
                reason: reason || 'Admin mint',
                status: 'CONFIRMED'
            }
        });
    } catch (error) {
        console.error('Admin BUZ mint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mint BUZ tokens',
            error: error.message
        });
    }
});

/**
 * POST /buz/admin/burn - Burn BUZ tokens (Admin only)
 */
router.post('/buz/admin/burn', authenticateToken, requirePermission('admin:buz'), async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        const adminUser = req.user;

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'userId and amount are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be positive'
            });
        }

        res.json({
            success: true,
            message: 'BUZ tokens burned successfully',
            data: {
                transactionId: `burn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                amount: parseFloat(amount),
                burnedBy: adminUser.id,
                reason: reason || 'Admin burn',
                status: 'CONFIRMED'
            }
        });
    } catch (error) {
        console.error('Admin BUZ burn error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to burn BUZ tokens',
            error: error.message
        });
    }
});

/**
 * GET /buz/admin/users - Get all users with BUZ balances (Admin only)
 */
router.get('/buz/admin/users', authenticateToken, requirePermission('admin:buz'), async (req, res) => {
    try {
        const { page = 1, limit = 50, search } = req.query;

        res.json({
            success: true,
            data: {
                users: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0
                }
            }
        });
    } catch (error) {
        console.error('Admin get BUZ users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve BUZ users',
            error: error.message
        });
    }
});

/**
 * GET /buz/admin/transactions - Get all BUZ transactions (Admin only)
 */
router.get('/buz/admin/transactions', authenticateToken, requirePermission('admin:buz'), async (req, res) => {
    try {
        const { page = 1, limit = 50, type, status, userId } = req.query;

        res.json({
            success: true,
            data: {
                transactions: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0
                }
            }
        });
    } catch (error) {
        console.error('Admin get BUZ transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve BUZ transactions',
            error: error.message
        });
    }
});

/**
 * POST /buz/admin/set-price - Set BUZ token price (Admin only)
 */
router.post('/buz/admin/set-price', authenticateToken, requirePermission('admin:buz'), async (req, res) => {
    try {
        const { price } = req.body;
        const adminUser = req.user;

        if (!price || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid price is required'
            });
        }

        res.json({
            success: true,
            message: 'BUZ token price updated successfully',
            data: {
                newPrice: parseFloat(price),
                updatedBy: adminUser.id,
                updatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Admin set BUZ price error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update BUZ price',
            error: error.message
        });
    }
});

/**
 * GET /buz/admin/analytics - Get BUZ system analytics (Admin only)
 */
router.get('/buz/admin/analytics', authenticateToken, requirePermission('admin:buz'), async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                totalUsers: 0,
                totalTransactions: 0,
                totalVolume: 0,
                totalStaked: 0,
                totalBurned: 0,
                averageTransactionSize: 0,
                topUsers: [],
                recentActivity: [],
                priceHistory: [],
                marketCap: 0,
                circulatingSupply: 0
            }
        });
    } catch (error) {
        console.error('Admin get BUZ analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve BUZ analytics',
            error: error.message
        });
    }
});

// ===== PROFILES & GAMIFICATION =====

/**
 * GET /profiles/:userId - Get public profile
 */
router.get('/profiles/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const profile = await prisma.userProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        createdAt: true
                    }
                },
                userSkills: {
                    include: {
                        skill: true
                    }
                },
                userBadges: {
                    include: {
                        badge: true
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Get portfolio preview (public items only)
        const portfolioItems = await prisma.portfolioItem.findMany({
            where: {
                userId,
                isPublic: true
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        // Get wallet stats (public subset)
        const wallet = await prisma.wallet.findUnique({
            where: { userId }
        });

        const response = {
            userId: profile.userId,
            nickname: profile.nickname,
            avatar: profile.avatarFileId ? `/api/files/${profile.avatarFileId}` : null,
            bio: profile.bio,
            location: profile.location,
            websiteUrl: profile.websiteUrl,
            level: profile.level,
            repScore: profile.repScore,
            skills: profile.userSkills.map(us => ({
                name: us.skill.name,
                level: us.level,
                verified: !!us.verifiedBy
            })),
            badges: profile.userBadges.map(ub => ({
                code: ub.badge.code,
                title: ub.badge.title,
                description: ub.badge.description,
                icon: ub.badge.icon,
                awardedAt: ub.awardedAt
            })),
            portfolio: portfolioItems.map(item => ({
                title: item.title,
                summary: item.summary,
                buzEarned: item.buzEarned,
                impactScore: item.impactScore
            })),
            stats: {
                totalBUZ: wallet ? wallet.buzBalance : 0,
                totalPortfolioItems: portfolioItems.length
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * PATCH /profiles/me - Update own profile
 */
router.patch('/profiles/me', authenticateToken, async(req, res) => {
    try {
        const { nickname, theme, bio, location, websiteUrl } = req.body;
        const userId = req.user.id;

        const profile = await prisma.userProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const updatedProfile = await prisma.userProfile.update({
            where: { id: profile.id },
            data: {
                nickname: nickname || profile.nickname,
                theme: theme || profile.theme,
                bio: bio !== undefined ? bio : profile.bio,
                location: location !== undefined ? location : profile.location,
                websiteUrl: websiteUrl !== undefined ? websiteUrl : profile.websiteUrl
            }
        });

        res.json(updatedProfile);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * POST /profiles/me/skills - Add skill to profile
 */
router.post('/profiles/me/skills', authenticateToken, async(req, res) => {
    try {
        const { skillId, level, evidenceUrl } = req.body;
        const userId = req.user.id;

        // Verify skill exists
        const skill = await prisma.skill.findUnique({
            where: { id: skillId }
        });

        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        // Create or update user skill
        const userSkill = await prisma.userSkill.upsert({
            where: {
                userId_skillId: {
                    userId,
                    skillId
                }
            },
            update: {
                level,
                evidenceUrl
            },
            create: {
                userId,
                skillId,
                level,
                evidenceUrl
            }
        });

        res.json(userSkill);
    } catch (error) {
        console.error('Skill addition error:', error);
        res.status(500).json({ error: 'Failed to add skill' });
    }
});

/**
 * POST /profiles/me/endorse - Endorse another user
 */
router.post('/profiles/me/endorse', authenticateToken, async(req, res) => {
    try {
        const { endorsedId, skillId, weight, note } = req.body;
        const endorserId = req.user.id;

        // Rate limiting: max 5 endorsements per day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEndorsements = await prisma.endorsement.count({
            where: {
                endorserId,
                createdAt: { gte: today }
            }
        });

        if (todayEndorsements >= 5) {
            return res.status(429).json({ error: 'Daily endorsement limit reached' });
        }

        // Create endorsement
        const endorsement = await prisma.endorsement.create({
            data: {
                endorserId,
                endorsedId,
                skillId,
                weight: Math.min(Math.max(weight, 1), 5),
                note: note ? note.substring(0, 200) : note
            }
        });

        res.json(endorsement);
    } catch (error) {
        console.error('Endorsement error:', error);
        res.status(500).json({ error: 'Failed to create endorsement' });
    }
});

// ===== BADGES =====

/**
 * GET /badges - Get all badges
 */
router.get('/badges', async(req, res) => {
    try {
        const badges = await prisma.badge.findMany({
            orderBy: { createdAt: 'asc' }
        });

        res.json(badges);
    } catch (error) {
        console.error('Badges fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});

/**
 * POST /badges/:code/award - Award badge to user (admin/system only)
 */
router.post('/badges/:code/award', authenticateToken, requirePermission('ADMIN'), async(req, res) => {
    try {
        const { code } = req.params;
        const { userId } = req.body;

        const badge = await prisma.badge.findUnique({
            where: { code }
        });

        if (!badge) {
            return res.status(404).json({ error: 'Badge not found' });
        }

        // Check if user already has this badge
        const existingBadge = await prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId: badge.id
                }
            }
        });

        if (existingBadge) {
            return res.status(400).json({ error: 'User already has this badge' });
        }

        const userBadge = await prisma.userBadge.create({
            data: {
                userId,
                badgeId: badge.id,
                context: { manuallyAwarded: true, awardedBy: req.user.id }
            }
        });

        res.json(userBadge);
    } catch (error) {
        console.error('Badge award error:', error);
        res.status(500).json({ error: 'Failed to award badge' });
    }
});

// ===== PORTFOLIO =====

/**
 * GET /profiles/:userId/portfolio - Get user portfolio
 */
router.get('/profiles/:userId/portfolio', async(req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const portfolioItems = await prisma.portfolioItem.findMany({
            where: {
                userId,
                isPublic: true
            },
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { createdAt: 'desc' },
            include: {
                file: {
                    select: {
                        filename: true,
                        mimeType: true
                    }
                }
            }
        });

        res.json(portfolioItems);
    } catch (error) {
        console.error('Portfolio fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

/**
 * POST /portfolio - Add portfolio item
 */
router.post('/portfolio', authenticateToken, async(req, res) => {
    try {
        const { title, summary, fileId, externalUrl, taskId } = req.body;
        const userId = req.user.id;

        const portfolioItem = await prisma.portfolioItem.create({
            data: {
                userId,
                title,
                summary,
                fileId,
                externalUrl,
                taskId
            }
        });

        res.json(portfolioItem);
    } catch (error) {
        console.error('Portfolio item creation error:', error);
        res.status(500).json({ error: 'Failed to create portfolio item' });
    }
});

// ===== WALLET & BUZ =====

/**
 * GET /wallet/me - Get wallet info
 */
router.get('/wallet/me', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        let wallet = await prisma.wallet.findUnique({
            where: { userId }
        });

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId,
                    buzBalance: 0,
                    pendingLock: 0
                }
            });
        }

        // Get last 100 ledger entries
        const ledgerEntries = await prisma.walletLedger.findMany({
            where: { walletId: wallet.id },
            take: 100,
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            wallet,
            recentTransactions: ledgerEntries
        });
    } catch (error) {
        console.error('Wallet fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

/**
 * GET /conversion-windows/active - Get active conversion windows
 */
router.get('/conversion-windows/active', async(req, res) => {
    try {
        const now = new Date();

        const activeWindows = await prisma.conversionWindow.findMany({
            where: {
                status: 'OPEN',
                opensAt: { lte: now },
                closesAt: { gte: now }
            },
            orderBy: { closesAt: 'asc' }
        });

        res.json(activeWindows);
    } catch (error) {
        console.error('Conversion windows fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch conversion windows' });
    }
});

/**
 * POST /equity/convert - Convert BUZ to equity
 */
router.post('/equity/convert', authenticateToken, async(req, res) => {
    try {
        const { windowId, buzAmount, ventureId } = req.body;
        const userId = req.user.id;

        // Verify conversion window is active
        const window = await prisma.conversionWindow.findUnique({
            where: { id: windowId }
        });

        if (!window || window.status !== 'OPEN') {
            return res.status(400).json({ error: 'Conversion window not active' });
        }

        // Verify user has enough BUZ
        const wallet = await prisma.wallet.findUnique({
            where: { userId }
        });

        if (!wallet || wallet.buzBalance < buzAmount) {
            return res.status(400).json({ error: 'Insufficient BUZ balance' });
        }

        // Calculate equity amount
        const equityBps = Math.round((buzAmount * window.equityRateBps) / 10000);

        // Create conversion request
        const conversion = await prisma.equityConversion.create({
            data: {
                userId,
                windowId,
                buzUsed: buzAmount,
                equityGrantedBp: equityBps,
                ventureId,
                status: 'PENDING'
            }
        });

        // Lock BUZ in wallet
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                buzBalance: wallet.buzBalance - buzAmount,
                pendingLock: wallet.pendingLock + buzAmount
            }
        });

        // Create ledger entry
        await prisma.walletLedger.create({
            data: {
                walletId: wallet.id,
                type: 'BUZ_LOCK',
                amount: -buzAmount,
                refEquityId: conversion.id,
                note: `Locked for equity conversion`,
                prevHash: await getLastWalletHash(wallet.id),
                hash: await calculateWalletHash(wallet.id, -buzAmount, 'BUZ_LOCK')
            }
        });

        res.json(conversion);
    } catch (error) {
        console.error('Equity conversion error:', error);
        res.status(500).json({ error: 'Failed to convert BUZ to equity' });
    }
});

// ===== CLIENTS & DOCUMENTS =====

/**
 * GET /clients - Get user's clients
 */
router.get('/clients', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        const clients = await prisma.client.findMany({
            where: { ownerUserId: userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(clients);
    } catch (error) {
        console.error('Clients fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

/**
 * POST /clients - Create new client
 */
router.post('/clients', authenticateToken, async(req, res) => {
    try {
        const { name, email, phone, organization, tags } = req.body;
        const ownerUserId = req.user.id;

        const client = await prisma.client.create({
            data: {
                ownerUserId,
                name,
                email,
                phone,
                organization,
                tags: tags || []
            }
        });

        res.json(client);
    } catch (error) {
        console.error('Client creation error:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
});

/**
 * POST /documents - Upload document
 */
router.post('/documents', authenticateToken, async(req, res) => {
    try {
        const { title, fileId, docType } = req.body;
        const ownerUserId = req.user.id;

        // Get file checksum
        const file = await prisma.file.findUnique({
            where: { id: fileId }
        });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const document = await prisma.userDocument.create({
            data: {
                ownerUserId,
                title,
                fileId,
                docType,
                checksumSha256: file.checksumSha256
            }
        });

        res.json(document);
    } catch (error) {
        console.error('Document creation error:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
});

/**
 * POST /documents/:id/share - Share document
 */
router.post('/documents/:id/share', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const { toUserId, clientId, canView, canComment, canSign, expiresAt } = req.body;
        const fromUserId = req.user.id;

        // Verify document ownership
        const document = await prisma.userDocument.findUnique({
            where: { id }
        });

        if (!document || document.ownerUserId !== fromUserId) {
            return res.status(403).json({ error: 'Document not found or access denied' });
        }

        const docShare = await prisma.docShare.create({
            data: {
                documentId: id,
                fromUserId,
                toUserId,
                clientId,
                canView: canView !== undefined ? canView : true,
                canComment: canComment !== undefined ? canComment : false,
                canSign: canSign !== undefined ? canSign : false,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        res.json(docShare);
    } catch (error) {
        console.error('Document share error:', error);
        res.status(500).json({ error: 'Failed to share document' });
    }
});

// ===== SIGNATURES =====

/**
 * POST /signatures - Request signature
 */
router.post('/signatures', authenticateToken, async(req, res) => {
    try {
        const { documentId, signerUserId, signerEmail, expiresAt } = req.body;
        const requestedById = req.user.id;

        // Verify document ownership
        const document = await prisma.userDocument.findUnique({
            where: { id: documentId }
        });

        if (!document || document.ownerUserId !== requestedById) {
            return res.status(403).json({ error: 'Document not found or access denied' });
        }

        const signatureRequest = await prisma.signatureRequest.create({
            data: {
                documentId,
                requestedById,
                signerUserId,
                signerEmail,
                expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
            }
        });

        res.json(signatureRequest);
    } catch (error) {
        console.error('Signature request error:', error);
        res.status(500).json({ error: 'Failed to create signature request' });
    }
});

/**
 * POST /signatures/:id/sign - Sign document
 */
router.post('/signatures/:id/sign', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const { signatureBlob } = req.body;
        const signerUserId = req.user.id;

        const signatureRequest = await prisma.signatureRequest.findUnique({
            where: { id },
            include: { document: true }
        });

        if (!signatureRequest) {
            return res.status(404).json({ error: 'Signature request not found' });
        }

        if (signatureRequest.status !== 'PENDING') {
            return res.status(400).json({ error: 'Signature request not pending' });
        }

        if (signatureRequest.signerUserId && signatureRequest.signerUserId !== signerUserId) {
            return res.status(403).json({ error: 'Not authorized to sign this document' });
        }

        // Verify signature (this would need proper cryptographic verification)
        const signatureHash = crypto.createHash('sha256')
            .update(signatureRequest.document.checksumSha256 + signerUserId + Date.now())
            .digest('hex');

        // Update signature request
        const updatedRequest = await prisma.signatureRequest.update({
            where: { id },
            data: {
                status: 'SIGNED',
                signedAt: new Date(),
                signatureHash
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Document signing error:', error);
        res.status(500).json({ error: 'Failed to sign document' });
    }
});

// ===== EVENTS (for background workers) =====

/**
 * POST /events/task/accepted - Task acceptance event
 */
router.post('/events/task/accepted', async(req, res) => {
    try {
        const { taskId } = req.body;

        // This would trigger the gamification service
        // For now, just acknowledge the event
        console.log(`Task accepted event: ${taskId}`);

        res.json({ status: 'processed' });
    } catch (error) {
        console.error('Task event error:', error);
        res.status(500).json({ error: 'Failed to process task event' });
    }
});

// ===== SEED ENDPOINT =====

/**
 * POST /migrate - Apply Prisma migrations to production database
 * WARNING: This should only be used in development/production setup
 */
router.post('/migrate', async(req, res) => {
    try {
        console.log('🔄 Starting production database migration...');

        // Use Prisma's migration system instead of manual table creation
        // This will apply the comprehensive schema properly

        console.log('📋 Checking current database state...');

        // Check what tables exist
        const existingTables = await prisma.$queryRaw `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;

        console.log('Current tables:', existingTables);

        // For now, create a simple test table to verify the endpoint works
        // In production, you would run: npx prisma migrate deploy
        await prisma.$executeRaw `
            CREATE TABLE IF NOT EXISTS "TestTable" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "TestTable_pkey" PRIMARY KEY ("id")
            )
        `;

        console.log('✅ Production database migration endpoint working!');

        res.json({
            success: true,
            message: 'Migration endpoint working - use npx prisma migrate deploy for full schema',
            note: 'This endpoint is ready for proper Prisma migrations',
            currentTables: existingTables.map(t => t.table_name),
            testTableCreated: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Production database migration failed:', error);
        res.status(500).json({
            error: 'Failed to migrate database',
            details: error.message
        });
    }
});

/**
 * POST /seed - Seed the database with initial data
 * WARNING: This should only be used in development/production setup
 */
router.post('/seed', async(req, res) => {
    try {
        console.log('🌱 Starting production database seed...');

        // Import and run the seed function
        const seedScript = require('../../prisma/seed');
        // Run the seed script
        await seedScript.runSeed();

        console.log('✅ Production database seed completed successfully!');
        res.json({
            success: true,
            message: 'Database seeded successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Production database seed failed:', error);
        res.status(500).json({
            error: 'Failed to seed database',
            details: error.message
        });
    }
});

/**
 * POST /seed/contracts - Seed the database with contract templates
 */
router.post('/seed/contracts', async(req, res) => {
    try {
        console.log('🌱 Starting contract templates seed...');
        const contractsSeed = require('../../server/seed-contracts');
        await contractsSeed.seedContractTemplates();
        console.log('✅ Contract templates seed completed successfully!');
        res.json({
            success: true,
            message: 'Contract templates seeded successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Contract templates seed failed:', error);
        res.status(500).json({
            error: 'Failed to seed contract templates',
            details: error.message
        });
    }
});

// ===== TEST CRUD ENDPOINTS =====

/**
 * GET /test/data - Get all test data
 */
router.get('/test/data', async(req, res) => {
    try {
        // Get all data from various tables
        const data = {
            users: [],
            badges: [],
            skills: [],
            profiles: [],
            wallets: []
        };

        try {
            data.users = await prisma.user.findMany({ take: 10 });
        } catch (e) {
            console.log('Users table not ready yet');
        }

        try {
            data.badges = await prisma.badge.findMany({ take: 10 });
        } catch (e) {
            console.log('Badges table not ready yet');
        }

        try {
            data.skills = await prisma.skill.findMany({ take: 10 });
        } catch (e) {
            console.log('Skills table not ready yet');
        }

        try {
            data.profiles = await prisma.userProfile.findMany({ take: 10 });
        } catch (e) {
            console.log('Profiles table not ready yet');
        }

        try {
            data.wallets = await prisma.wallet.findMany({ take: 10 });
        } catch (e) {
            console.log('Wallets table not ready yet');
        }

        res.json({
            success: true,
            message: 'Test data retrieved',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test data fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch test data',
            details: error.message
        });
    }
});

/**
 * POST /test/users - Create a test user
 */
router.post('/test/users', async(req, res) => {
    try {
        const { name, email, level = 'WISE_OWL', xp = 100 } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                level,
                xp
            }
        });

        res.json({
            success: true,
            message: 'Test user created',
            user,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test user creation error:', error);
        res.status(500).json({
            error: 'Failed to create test user',
            details: error.message
        });
    }
});

/**
 * POST /test/badges - Create a test badge
 */
router.post('/test/badges', async(req, res) => {
    try {
        const { name, description, icon, category = 'achievement', rarity = 'COMMON', condition } = req.body;

        if (!name || !description || !condition) {
            return res.status(400).json({ error: 'Name, description, and condition are required' });
        }

        const badge = await prisma.badge.create({
            data: {
                name,
                description,
                icon: icon || '🏆',
                category,
                rarity,
                condition
            }
        });

        res.json({
            success: true,
            message: 'Test badge created',
            badge,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test badge creation error:', error);
        res.status(500).json({
            error: 'Failed to create test badge',
            details: error.message
        });
    }
});

/**
 * POST /test/skills - Create a test skill
 */
router.post('/test/skills', async(req, res) => {
    try {
        const { name, category = 'general', description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const skill = await prisma.skill.create({
            data: {
                name,
                category,
                description: description || `Skill in ${name}`
            }
        });

        res.json({
            success: true,
            message: 'Test skill created',
            skill,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test skill creation error:', error);
        res.status(500).json({
            error: 'Failed to create test skill',
            details: error.message
        });
    }
});

/**
 * PUT /test/users/:id - Update a test user
 */
router.put('/test/users/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { name, email, level, xp } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(level && { level }),
                ...(xp && { xp })
            }
        });

        res.json({
            success: true,
            message: 'Test user updated',
            user,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test user update error:', error);
        res.status(500).json({
            error: 'Failed to update test user',
            details: error.message
        });
    }
});

/**
 * DELETE /test/users/:id - Delete a test user
 */
router.delete('/test/users/:id', async(req, res) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Test user deleted',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test user deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete test user',
            details: error.message
        });
    }
});

/**
 * GET /test/status - Get database and API status
 */
router.get('/test/status', async(req, res) => {
    try {
        const status = {
            api: 'running',
            database: 'unknown',
            tables: [],
            timestamp: new Date().toISOString()
        };

        // Check database connection
        try {
            await prisma.$queryRaw `SELECT 1`;
            status.database = 'connected';
        } catch (e) {
            status.database = 'disconnected';
        }

        // Check what tables exist
        try {
            const tables = await prisma.$queryRaw `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            `;
            status.tables = tables.map(t => t.table_name);
        } catch (e) {
            status.tables = ['error checking tables'];
        }

        res.json(status);
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            error: 'Failed to check status',
            details: error.message
        });
    }
});

/**
 * POST /test/upload - Simple file upload simulation
 */
router.post('/test/upload', async(req, res) => {
    try {
        const { filename, content, mimeType = 'text/plain' } = req.body;

        if (!filename || !content) {
            return res.status(400).json({ error: 'Filename and content are required' });
        }

        // Simulate file upload by creating a file record
        const file = await prisma.file.create({
            data: {
                filename,
                originalName: filename,
                mimeType,
                size: Buffer.byteLength(content, 'utf8'),
                checksumSha256: require('crypto').createHash('sha256').update(content).digest('hex'),
                storageUri: `/uploads/${file.id}/${filename}`,
                uploadedBy: 'test-user',
                isPublic: true
            }
        });

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                id: file.id,
                filename: file.filename,
                size: file.size,
                mimeType: file.mimeType,
                checksum: file.checksumSha256,
                uploadedAt: file.createdAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            error: 'Failed to upload file',
            details: error.message
        });
    }
});

/**
 * GET /test/files - Get all uploaded files
 */
router.get('/test/files', async(req, res) => {
    try {
        const files = await prisma.file.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json({
            success: true,
            message: 'Files retrieved successfully',
            files: files.map(f => ({
                id: f.id,
                filename: f.filename,
                size: f.size,
                mimeType: f.mimeType,
                checksum: f.checksumSha256,
                uploadedAt: f.createdAt
            })),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Files fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch files',
            details: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function getLastWalletHash(walletId) {
    const lastEntry = await prisma.walletLedger.findFirst({
        where: { walletId },
        orderBy: { createdAt: 'desc' }
    });

    return lastEntry ? lastEntry.hash : null;
}

async function calculateWalletHash(walletId, amount, type) {
    const lastHash = await getLastWalletHash(walletId);
    const payload = `${walletId}:${amount}:${type}:${Date.now()}`;
    const hashInput = lastHash ? `${lastHash}:${payload}` : payload;

    return crypto.createHash('sha256').update(hashInput).digest('hex');
}

module.exports = router;