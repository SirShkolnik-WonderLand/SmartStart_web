const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// ============================================================================
// BUZ TOKEN API - COMPREHENSIVE TOKEN MANAGEMENT SYSTEM
// ============================================================================
// Business Utility Zone (BUZ) - Native platform token
// Total Supply: 1,000,000,000 BUZ (1 Billion)
// Initial Price: $0.01 USD

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate unique transaction ID
const generateTransactionId = () => `buz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Validate BUZ amount
const validateAmount = (amount) => {
    if (typeof amount !== 'number' || amount <= 0) {
        throw new Error('Amount must be a positive number');
    }
    if (amount > 1000000000) {
        throw new Error('Amount cannot exceed total supply');
    }
    return true;
};

// Check user BUZ balance
const checkBalance = async (userId, requiredAmount) => {
    const token = await prisma.bUZToken.findUnique({
        where: { userId, isActive: true }
    });
    
    if (!token) {
        throw new Error('User BUZ token account not found');
    }
    
    if (token.balance < requiredAmount) {
        throw new Error('Insufficient BUZ balance');
    }
    
    return token;
};

// Update user BUZ balance
const updateBalance = async (userId, amountChange, type) => {
    const token = await prisma.bUZToken.upsert({
        where: { userId },
        update: {
            balance: { increment: amountChange },
            totalEarned: type === 'REWARD' || type === 'MINT' ? { increment: Math.abs(amountChange) } : undefined,
            totalSpent: type === 'FEE' || type === 'BURN' ? { increment: Math.abs(amountChange) } : undefined,
            totalBurned: type === 'BURN' ? { increment: Math.abs(amountChange) } : undefined,
            lastActivity: new Date()
        },
        create: {
            userId,
            balance: amountChange > 0 ? amountChange : 0,
            totalEarned: type === 'REWARD' || type === 'MINT' ? Math.abs(amountChange) : 0,
            totalSpent: type === 'FEE' || type === 'BURN' ? Math.abs(amountChange) : 0,
            totalBurned: type === 'BURN' ? Math.abs(amountChange) : 0
        }
    });
    
    return token;
};

// ============================================================================
// BUZ TOKEN CORE OPERATIONS
// ============================================================================

// GET /api/buz-token/balance/:userId - Get user BUZ balance
router.get('/balance/:userId', authenticateToken, async (req, res) => {
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

        const token = await prisma.bUZToken.findUnique({
            where: { userId, isActive: true }
        });

        if (!token) {
            return res.json({
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
        }

        res.json({
            success: true,
            data: {
                userId: token.userId,
                balance: parseFloat(token.balance),
                stakedBalance: parseFloat(token.stakedBalance),
                totalEarned: parseFloat(token.totalEarned),
                totalSpent: parseFloat(token.totalSpent),
                totalBurned: parseFloat(token.totalBurned),
                lastActivity: token.lastActivity
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

// GET /api/buz-token/transactions/:userId - Get user transaction history
router.get('/transactions/:userId', authenticateToken, async (req, res) => {
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

        const where = {
            OR: [
                { fromUserId: userId },
                { toUserId: userId }
            ]
        };

        if (type) where.type = type;
        if (status) where.status = status;

        const transactions = await prisma.bUZTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            include: {
                fromUser: {
                    select: { id: true, email: true, name: true }
                },
                toUser: {
                    select: { id: true, email: true, name: true }
                }
            }
        });

        const total = await prisma.bUZTransaction.count({ where });

        res.json({
            success: true,
            data: {
                transactions: transactions.map(tx => ({
                    id: tx.id,
                    fromUserId: tx.fromUserId,
                    toUserId: tx.toUserId,
                    fromUser: tx.fromUser,
                    toUser: tx.toUser,
                    amount: parseFloat(tx.amount),
                    type: tx.type,
                    reason: tx.reason,
                    description: tx.description,
                    status: tx.status,
                    blockNumber: tx.blockNumber,
                    transactionHash: tx.transactionHash,
                    metadata: tx.metadata,
                    createdAt: tx.createdAt
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
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

// POST /api/buz-token/transfer - Transfer BUZ tokens
router.post('/transfer', authenticateToken, async (req, res) => {
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

        validateAmount(amount);

        if (fromUserId === toUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot transfer to yourself'
            });
        }

        // Check if recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: toUserId }
        });

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient user not found'
            });
        }

        // Check sender balance
        await checkBalance(fromUserId, amount);

        // Create transaction record
        const transaction = await prisma.bUZTransaction.create({
            data: {
                fromUserId,
                toUserId,
                amount,
                type: 'TRANSFER',
                reason: reason || 'User transfer',
                description: description || `Transfer of ${amount} BUZ`,
                status: 'PENDING'
            }
        });

        // Update balances
        await updateBalance(fromUserId, -amount, 'TRANSFER');
        await updateBalance(toUserId, amount, 'TRANSFER');

        // Update transaction status
        await prisma.bUZTransaction.update({
            where: { id: transaction.id },
            data: { status: 'CONFIRMED' }
        });

        res.json({
            success: true,
            message: 'BUZ transfer completed successfully',
            data: {
                transactionId: transaction.id,
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

// POST /api/buz-token/mint - Mint new BUZ tokens (Admin only)
router.post('/mint', authenticateToken, async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        const requestingUser = req.user;

        // Authorization: Only admins can mint
        if (!(requestingUser.permissions || []).includes('buz:mint:tokens')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to mint tokens'
            });
        }

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'userId and amount are required'
            });
        }

        validateAmount(amount);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create transaction record
        const transaction = await prisma.bUZTransaction.create({
            data: {
                toUserId: userId,
                amount,
                type: 'MINT',
                reason: reason || 'Admin mint',
                description: `Minted ${amount} BUZ tokens`,
                status: 'PENDING'
            }
        });

        // Update user balance
        await updateBalance(userId, amount, 'MINT');

        // Update transaction status
        await prisma.bUZTransaction.update({
            where: { id: transaction.id },
            data: { status: 'CONFIRMED' }
        });

        res.json({
            success: true,
            message: 'BUZ tokens minted successfully',
            data: {
                transactionId: transaction.id,
                userId,
                amount: parseFloat(amount),
                status: 'CONFIRMED'
            }
        });
    } catch (error) {
        console.error('BUZ mint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mint BUZ tokens',
            error: error.message
        });
    }
});

// POST /api/buz-token/burn - Burn BUZ tokens (Admin only)
router.post('/burn', authenticateToken, async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        const requestingUser = req.user;

        // Authorization: Only admins can burn
        if (!(requestingUser.permissions || []).includes('buz:burn:tokens')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to burn tokens'
            });
        }

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'userId and amount are required'
            });
        }

        validateAmount(amount);

        // Check user balance
        await checkBalance(userId, amount);

        // Create transaction record
        const transaction = await prisma.bUZTransaction.create({
            data: {
                fromUserId: userId,
                amount,
                type: 'BURN',
                reason: reason || 'Admin burn',
                description: `Burned ${amount} BUZ tokens`,
                status: 'PENDING'
            }
        });

        // Update user balance
        await updateBalance(userId, -amount, 'BURN');

        // Update transaction status
        await prisma.bUZTransaction.update({
            where: { id: transaction.id },
            data: { status: 'CONFIRMED' }
        });

        res.json({
            success: true,
            message: 'BUZ tokens burned successfully',
            data: {
                transactionId: transaction.id,
                userId,
                amount: parseFloat(amount),
                status: 'CONFIRMED'
            }
        });
    } catch (error) {
        console.error('BUZ burn error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to burn BUZ tokens',
            error: error.message
        });
    }
});

// ============================================================================
// BUZ STAKING OPERATIONS
// ============================================================================

// POST /api/buz-token/stake - Stake BUZ tokens
router.post('/stake', authenticateToken, async (req, res) => {
    try {
        const { amount, tier } = req.body;
        const userId = req.user.id;

        if (!amount || !tier) {
            return res.status(400).json({
                success: false,
                message: 'amount and tier are required'
            });
        }

        validateAmount(amount);

        // Validate staking tier
        const validTiers = ['BASIC', 'PREMIUM', 'VIP', 'GOVERNANCE'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid staking tier'
            });
        }

        // Check user balance
        await checkBalance(userId, amount);

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

        // Create staking record
        const staking = await prisma.bUZStaking.create({
            data: {
                userId,
                amount,
                tier,
                duration: config.duration,
                apy: config.apy,
                expectedReward,
                endDate,
                status: 'ACTIVE'
            }
        });

        // Update user balances
        await prisma.bUZToken.upsert({
            where: { userId },
            update: {
                balance: { decrement: amount },
                stakedBalance: { increment: amount },
                lastActivity: new Date()
            },
            create: {
                userId,
                balance: 0,
                stakedBalance: amount
            }
        });

        res.json({
            success: true,
            message: 'BUZ tokens staked successfully',
            data: {
                stakingId: staking.id,
                userId,
                amount: parseFloat(amount),
                tier,
                duration: config.duration,
                apy: config.apy,
                expectedReward: parseFloat(expectedReward),
                endDate: staking.endDate
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

// GET /api/buz-token/staking/:userId - Get user staking positions
router.get('/staking/:userId', authenticateToken, async (req, res) => {
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

        const stakingPositions = await prisma.bUZStaking.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: {
                stakingPositions: stakingPositions.map(staking => ({
                    id: staking.id,
                    amount: parseFloat(staking.amount),
                    tier: staking.tier,
                    duration: staking.duration,
                    apy: parseFloat(staking.apy),
                    expectedReward: parseFloat(staking.expectedReward),
                    actualReward: parseFloat(staking.actualReward),
                    startDate: staking.startDate,
                    endDate: staking.endDate,
                    status: staking.status,
                    isAutoRenew: staking.isAutoRenew
                }))
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

// ============================================================================
// BUZ REWARDS SYSTEM
// ============================================================================

// POST /api/buz-token/rewards/claim - Claim available rewards
router.post('/rewards/claim', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get unclaimed rewards
        const rewards = await prisma.bUZReward.findMany({
            where: {
                userId,
                isClaimed: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (rewards.length === 0) {
            return res.json({
                success: true,
                message: 'No rewards available to claim',
                data: { claimedRewards: [], totalAmount: 0 }
            });
        }

        const totalAmount = rewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);

        // Update rewards as claimed
        await prisma.bUZReward.updateMany({
            where: {
                id: { in: rewards.map(r => r.id) }
            },
            data: {
                isClaimed: true,
                claimedAt: new Date()
            }
        });

        // Update user balance
        await updateBalance(userId, totalAmount, 'REWARD');

        // Create transaction record
        await prisma.bUZTransaction.create({
            data: {
                toUserId: userId,
                amount: totalAmount,
                type: 'REWARD',
                reason: 'Claimed rewards',
                description: `Claimed ${rewards.length} rewards totaling ${totalAmount} BUZ`,
                status: 'CONFIRMED'
            }
        });

        res.json({
            success: true,
            message: 'Rewards claimed successfully',
            data: {
                claimedRewards: rewards.map(reward => ({
                    id: reward.id,
                    amount: parseFloat(reward.amount),
                    type: reward.type,
                    reason: reward.reason
                })),
                totalAmount: parseFloat(totalAmount)
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

// GET /api/buz-token/rewards/:userId - Get user rewards
router.get('/rewards/:userId', authenticateToken, async (req, res) => {
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

        const rewards = await prisma.bUZReward.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: {
                rewards: rewards.map(reward => ({
                    id: reward.id,
                    amount: parseFloat(reward.amount),
                    type: reward.type,
                    reason: reward.reason,
                    isClaimed: reward.isClaimed,
                    claimedAt: reward.claimedAt,
                    expiresAt: reward.expiresAt,
                    metadata: reward.metadata
                }))
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

// ============================================================================
// BUZ SUPPLY & STATISTICS
// ============================================================================

// GET /api/buz-token/supply - Get BUZ token supply information
router.get('/supply', async (req, res) => {
    try {
        const supply = await prisma.bUZTokenSupply.findFirst({
            orderBy: { lastUpdated: 'desc' }
        });

        if (!supply) {
            return res.status(404).json({
                success: false,
                message: 'BUZ supply information not found'
            });
        }

        res.json({
            success: true,
            data: {
                totalSupply: parseFloat(supply.totalSupply),
                circulatingSupply: parseFloat(supply.circulatingSupply),
                burnedSupply: parseFloat(supply.burnedSupply),
                stakedSupply: parseFloat(supply.stakedSupply),
                reserveSupply: parseFloat(supply.reserveSupply),
                teamSupply: parseFloat(supply.teamSupply),
                communitySupply: parseFloat(supply.communitySupply),
                liquiditySupply: parseFloat(supply.liquiditySupply),
                stakingRewardsSupply: parseFloat(supply.stakingRewardsSupply),
                userRewardsSupply: parseFloat(supply.userRewardsSupply),
                ventureFundSupply: parseFloat(supply.ventureFundSupply),
                currentPrice: parseFloat(supply.currentPrice),
                marketCap: parseFloat(supply.marketCap),
                lastUpdated: supply.lastUpdated
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

// GET /api/buz-token/stats - Get BUZ token statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalTransactions,
            totalStaked,
            totalBurned,
            recentTransactions
        ] = await Promise.all([
            prisma.bUZToken.count({ where: { isActive: true } }),
            prisma.bUZTransaction.count(),
            prisma.bUZToken.aggregate({
                _sum: { stakedBalance: true }
            }),
            prisma.bUZToken.aggregate({
                _sum: { totalBurned: true }
            }),
            prisma.bUZTransaction.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalTransactions,
                totalStaked: parseFloat(totalStaked._sum.stakedBalance || 0),
                totalBurned: parseFloat(totalBurned._sum.totalBurned || 0),
                recentTransactions24h: recentTransactions
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

// ===== BUZ-LEGAL INTEGRATION =====

// Get BUZ token legal compliance status
router.get('/legal-compliance/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can access this endpoint (own compliance or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check user's legal compliance (simplified for now)
        const legalCompliance = {
            compliant: false,
            signedDocuments: 0,
            totalRequired: 3,
            missingDocuments: ['platform-participation-agreement', 'mutual-confidentiality-agreement', 'inventions-ip-agreement']
        };

        // Get user's BUZ token information
        const buzToken = await prisma.bUZToken.findUnique({
            where: { userId, isActive: true }
        });

        // Get user's BUZ token transactions
        const buzTransactions = await prisma.bUZTokenTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Get BUZ-specific legal documents (simplified for now)
        const buzLegalDocs = [];

        res.json({
            success: true,
            data: {
                userId,
                legalCompliance,
                buzToken: buzToken ? {
                    balance: buzToken.balance,
                    isActive: buzToken.isActive,
                    createdAt: buzToken.createdAt
                } : null,
                buzTransactions: buzTransactions.length,
                buzLegalDocuments: buzLegalDocs.length,
                canUseBUZTokens: legalCompliance.compliant,
                restrictedOperations: legalCompliance.compliant ? [] : [
                    'token_transfer',
                    'token_staking',
                    'token_governance',
                    'token_rewards'
                ]
            },
            message: 'BUZ token legal compliance status retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching BUZ token legal compliance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch BUZ token legal compliance',
            error: error.message
        });
    }
});

// Enhanced token transfer with legal compliance check
router.post('/transfer-legal', authenticateToken, async (req, res) => {
    try {
        const { toUserId, amount, memo } = req.body;
        const fromUserId = req.user.id;

        // Check if sender has completed required legal documents
        const senderLegalCompliance = await checkUserLegalCompliance(fromUserId);
        if (!senderLegalCompliance.compliant) {
            return res.status(400).json({
                success: false,
                message: 'Legal document requirements not met for token transfer',
                error: {
                    code: 'LEGAL_COMPLIANCE_REQUIRED',
                    message: 'You must complete all required legal documents before transferring BUZ tokens',
                    missingDocuments: senderLegalCompliance.missingDocuments
                }
            });
        }

        // Check if recipient has completed required legal documents
        const recipientLegalCompliance = await checkUserLegalCompliance(toUserId);
        if (!recipientLegalCompliance.compliant) {
            return res.status(400).json({
                success: false,
                message: 'Recipient legal compliance required',
                error: {
                    code: 'RECIPIENT_LEGAL_COMPLIANCE_REQUIRED',
                    message: 'Recipient must complete all required legal documents before receiving BUZ tokens',
                    missingDocuments: recipientLegalCompliance.missingDocuments
                }
            });
        }

        // Validate amount
        validateAmount(amount);

        // Check sender balance
        await checkBalance(fromUserId, amount);

        // Check recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: toUserId }
        });

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }

        // Perform the transfer
        const transactionId = generateTransactionId();
        
        // Create transaction record
        const transaction = await prisma.bUZTokenTransaction.create({
            data: {
                id: transactionId,
                userId: fromUserId,
                type: 'TRANSFER_OUT',
                amount: -amount,
                balance: 0, // Will be updated
                memo: memo || `Transfer to ${recipient.name}`,
                metadata: {
                    recipientId: toUserId,
                    legalCompliance: {
                        senderCompliant: true,
                        recipientCompliant: true
                    }
                }
            }
        });

        // Update balances
        await updateBalance(fromUserId, -amount, 'TRANSFER_OUT');
        await updateBalance(toUserId, amount, 'TRANSFER_IN');

        // Generate BUZ transfer legal documents
        await generateBUZTransferLegalDocuments(transactionId, fromUserId, toUserId, amount);

        res.json({
            success: true,
            data: {
                transaction,
                legalDocuments: await getBUZTransferLegalDocuments(transactionId),
                message: 'BUZ token transfer completed successfully with legal compliance'
            }
        });

    } catch (error) {
        console.error('Error in BUZ token transfer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to transfer BUZ tokens',
            error: error.message
        });
    }
});

// Helper function to check user legal compliance (reused from other integrations)
async function checkUserLegalCompliance(userId) {
    try {
        // Check user's signed legal documents directly
        const signedLegalDocs = await prisma.legalDocumentSignature.findMany({
            where: { signerId: userId },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true
                    }
                }
            }
        });

        const requiredDocumentTitles = [
            'Platform Participation Agreement',
            'Mutual Confidentiality Agreement',
            'Inventions & Intellectual Property Agreement'
        ];

        let signedDocuments = 0;
        let missingDocuments = [];

        // Check which required documents are signed
        for (const requiredDoc of requiredDocumentTitles) {
            let found = false;
            for (const signedDoc of signedLegalDocs) {
                if (signedDoc.document.title.includes(requiredDoc.split(' ')[0])) {
                    found = true;
                    signedDocuments++;
                    break;
                }
            }
            if (!found) {
                missingDocuments.push(requiredDoc.toLowerCase().replace(/\s+/g, '-'));
            }
        }

        return {
            compliant: signedDocuments === requiredDocumentTitles.length,
            signedDocuments,
            totalRequired: requiredDocumentTitles.length,
            missingDocuments
        };

    } catch (error) {
        console.error('Error checking legal compliance:', error);
        return {
            compliant: false,
            signedDocuments: 0,
            totalRequired: 3,
            missingDocuments: ['platform-participation-agreement', 'mutual-confidentiality-agreement', 'inventions-ip-agreement']
        };
    }
}

// Helper function to generate BUZ transfer legal documents
async function generateBUZTransferLegalDocuments(transactionId, fromUserId, toUserId, amount) {
    try {
        const buzTransferDocuments = [
            {
                title: 'BUZ Token Transfer Agreement',
                type: 'TOKEN_TRANSFER_AGREEMENT',
                content: `This BUZ Token Transfer Agreement governs the transfer of ${amount} BUZ tokens from user ${fromUserId} to user ${toUserId}...`,
                status: 'DRAFT',
                requiresSignature: true
            },
            {
                title: 'BUZ Token Legal Compliance Certificate',
                type: 'COMPLIANCE_CERTIFICATE',
                content: `This certificate confirms that both parties have completed all required legal documents for BUZ token operations...`,
                status: 'DRAFT',
                requiresSignature: true
            }
        ];

        for (const doc of buzTransferDocuments) {
            await prisma.legalDocument.create({
                data: {
                    ...doc,
                    createdBy: fromUserId
                }
            });
        }

        console.log(`Generated ${buzTransferDocuments.length} BUZ transfer legal documents for transaction ${transactionId}`);

    } catch (error) {
        console.error('Error generating BUZ transfer legal documents:', error);
    }
}

// Helper function to get BUZ transfer legal documents
async function getBUZTransferLegalDocuments(transactionId) {
    try {
        return await prisma.legalDocument.findMany({
            where: {
                title: { contains: 'BUZ Token Transfer' }
            },
            select: {
                id: true,
                title: true,
                type: true,
                status: true,
                createdAt: true
            }
        });
    } catch (error) {
        console.error('Error getting BUZ transfer legal documents:', error);
        return [];
    }
}

module.exports = router;
