const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================================
// BUZ TOKEN SERVICE - BUSINESS LOGIC LAYER
// ============================================================================
// Centralized business logic for BUZ token operations
// Handles complex calculations, validations, and automated processes

class BUZTokenService {
    
    // ============================================================================
    // CORE TOKEN OPERATIONS
    // ============================================================================
    
    /**
     * Get user BUZ balance with detailed breakdown
     */
    static async getUserBalance(userId) {
        try {
            const token = await prisma.bUZToken.findUnique({
                where: { userId, isActive: true }
            });

            if (!token) {
                return {
                    userId,
                    balance: 0,
                    stakedBalance: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    totalBurned: 0,
                    lastActivity: null,
                    isNewUser: true
                };
            }

            return {
                userId: token.userId,
                balance: parseFloat(token.balance),
                stakedBalance: parseFloat(token.stakedBalance),
                totalEarned: parseFloat(token.totalEarned),
                totalSpent: parseFloat(token.totalSpent),
                totalBurned: parseFloat(token.totalBurned),
                lastActivity: token.lastActivity,
                isNewUser: false
            };
        } catch (error) {
            console.error('Get user balance error:', error);
            throw new Error('Failed to retrieve user balance');
        }
    }

    /**
     * Transfer BUZ tokens between users
     */
    static async transferTokens(fromUserId, toUserId, amount, reason = 'User transfer', description = null) {
        try {
            // Validate inputs
            if (!fromUserId || !toUserId || !amount) {
                throw new Error('Missing required parameters');
            }

            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            if (fromUserId === toUserId) {
                throw new Error('Cannot transfer to yourself');
            }

            // Check if recipient exists
            const recipient = await prisma.user.findUnique({
                where: { id: toUserId }
            });

            if (!recipient) {
                throw new Error('Recipient user not found');
            }

            // Check sender balance
            const senderToken = await prisma.bUZToken.findUnique({
                where: { userId: fromUserId, isActive: true }
            });

            if (!senderToken || senderToken.balance < amount) {
                throw new Error('Insufficient BUZ balance');
            }

            // Create transaction record
            const transaction = await prisma.bUZTransaction.create({
                data: {
                    fromUserId,
                    toUserId,
                    amount,
                    type: 'TRANSFER',
                    reason,
                    description: description || `Transfer of ${amount} BUZ`,
                    status: 'PENDING'
                }
            });

            // Update balances atomically
            await prisma.$transaction(async (tx) => {
                // Update sender balance
                await tx.bUZToken.upsert({
                    where: { userId: fromUserId },
                    update: {
                        balance: { decrement: amount },
                        totalSpent: { increment: amount },
                        lastActivity: new Date()
                    },
                    create: {
                        userId: fromUserId,
                        balance: 0,
                        totalSpent: amount
                    }
                });

                // Update recipient balance
                await tx.bUZToken.upsert({
                    where: { userId: toUserId },
                    update: {
                        balance: { increment: amount },
                        totalEarned: { increment: amount },
                        lastActivity: new Date()
                    },
                    create: {
                        userId: toUserId,
                        balance: amount,
                        totalEarned: amount
                    }
                });

                // Update transaction status
                await tx.bUZTransaction.update({
                    where: { id: transaction.id },
                    data: { status: 'CONFIRMED' }
                });
            });

            return {
                success: true,
                transactionId: transaction.id,
                fromUserId,
                toUserId,
                amount: parseFloat(amount),
                status: 'CONFIRMED'
            };
        } catch (error) {
            console.error('Transfer tokens error:', error);
            throw error;
        }
    }

    /**
     * Mint new BUZ tokens (Admin only)
     */
    static async mintTokens(userId, amount, reason = 'Admin mint', description = null) {
        try {
            // Validate inputs
            if (!userId || !amount) {
                throw new Error('Missing required parameters');
            }

            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Create transaction record
            const transaction = await prisma.bUZTransaction.create({
                data: {
                    toUserId: userId,
                    amount,
                    type: 'MINT',
                    reason,
                    description: description || `Minted ${amount} BUZ tokens`,
                    status: 'PENDING'
                }
            });

            // Update user balance
            await prisma.bUZToken.upsert({
                where: { userId },
                update: {
                    balance: { increment: amount },
                    totalEarned: { increment: amount },
                    lastActivity: new Date()
                },
                create: {
                    userId,
                    balance: amount,
                    totalEarned: amount
                }
            });

            // Update transaction status
            await prisma.bUZTransaction.update({
                where: { id: transaction.id },
                data: { status: 'CONFIRMED' }
            });

            return {
                success: true,
                transactionId: transaction.id,
                userId,
                amount: parseFloat(amount),
                status: 'CONFIRMED'
            };
        } catch (error) {
            console.error('Mint tokens error:', error);
            throw error;
        }
    }

    /**
     * Burn BUZ tokens (Admin only)
     */
    static async burnTokens(userId, amount, reason = 'Admin burn', description = null) {
        try {
            // Validate inputs
            if (!userId || !amount) {
                throw new Error('Missing required parameters');
            }

            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            // Check user balance
            const userToken = await prisma.bUZToken.findUnique({
                where: { userId, isActive: true }
            });

            if (!userToken || userToken.balance < amount) {
                throw new Error('Insufficient BUZ balance');
            }

            // Create transaction record
            const transaction = await prisma.bUZTransaction.create({
                data: {
                    fromUserId: userId,
                    amount,
                    type: 'BURN',
                    reason,
                    description: description || `Burned ${amount} BUZ tokens`,
                    status: 'PENDING'
                }
            });

            // Update user balance
            await prisma.bUZToken.update({
                where: { userId },
                data: {
                    balance: { decrement: amount },
                    totalBurned: { increment: amount },
                    lastActivity: new Date()
                }
            });

            // Update transaction status
            await prisma.bUZTransaction.update({
                where: { id: transaction.id },
                data: { status: 'CONFIRMED' }
            });

            return {
                success: true,
                transactionId: transaction.id,
                userId,
                amount: parseFloat(amount),
                status: 'CONFIRMED'
            };
        } catch (error) {
            console.error('Burn tokens error:', error);
            throw error;
        }
    }

    // ============================================================================
    // STAKING OPERATIONS
    // ============================================================================
    
    /**
     * Stake BUZ tokens
     */
    static async stakeTokens(userId, amount, tier) {
        try {
            // Validate inputs
            if (!userId || !amount || !tier) {
                throw new Error('Missing required parameters');
            }

            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            // Validate staking tier
            const validTiers = ['BASIC', 'PREMIUM', 'VIP', 'GOVERNANCE'];
            if (!validTiers.includes(tier)) {
                throw new Error('Invalid staking tier');
            }

            // Check user balance
            const userToken = await prisma.bUZToken.findUnique({
                where: { userId, isActive: true }
            });

            if (!userToken || userToken.balance < amount) {
                throw new Error('Insufficient BUZ balance');
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

            // Create staking record and update balances atomically
            const result = await prisma.$transaction(async (tx) => {
                // Create staking record
                const staking = await tx.bUZStaking.create({
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
                await tx.bUZToken.upsert({
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

                return staking;
            });

            return {
                success: true,
                stakingId: result.id,
                userId,
                amount: parseFloat(amount),
                tier,
                duration: config.duration,
                apy: config.apy,
                expectedReward: parseFloat(expectedReward),
                endDate: result.endDate
            };
        } catch (error) {
            console.error('Stake tokens error:', error);
            throw error;
        }
    }

    /**
     * Unstake BUZ tokens
     */
    static async unstakeTokens(userId, stakingId) {
        try {
            // Validate inputs
            if (!userId || !stakingId) {
                throw new Error('Missing required parameters');
            }

            // Get staking record
            const staking = await prisma.bUZStaking.findFirst({
                where: {
                    id: stakingId,
                    userId,
                    status: 'ACTIVE'
                }
            });

            if (!staking) {
                throw new Error('Staking position not found or not active');
            }

            // Check if staking period has ended
            if (new Date() < staking.endDate) {
                throw new Error('Staking period has not ended yet');
            }

            // Calculate actual reward
            const daysStaked = Math.floor((new Date() - staking.startDate) / (1000 * 60 * 60 * 24));
            const actualReward = staking.amount * (staking.apy / 100) * (daysStaked / 365);

            // Update staking record and user balances atomically
            const result = await prisma.$transaction(async (tx) => {
                // Update staking record
                const updatedStaking = await tx.bUZStaking.update({
                    where: { id: stakingId },
                    data: {
                        status: 'UNSTAKED',
                        actualReward
                    }
                });

                // Update user balances
                await tx.bUZToken.update({
                    where: { userId },
                    data: {
                        balance: { increment: staking.amount + actualReward },
                        stakedBalance: { decrement: staking.amount },
                        totalEarned: { increment: actualReward },
                        lastActivity: new Date()
                    }
                });

                // Create reward transaction
                await tx.bUZTransaction.create({
                    data: {
                        toUserId: userId,
                        amount: actualReward,
                        type: 'REWARD',
                        reason: 'Staking rewards',
                        description: `Staking rewards for ${staking.tier} tier`,
                        status: 'CONFIRMED'
                    }
                });

                return updatedStaking;
            });

            return {
                success: true,
                stakingId: result.id,
                userId,
                stakedAmount: parseFloat(staking.amount),
                rewardAmount: parseFloat(actualReward),
                totalReturned: parseFloat(staking.amount + actualReward)
            };
        } catch (error) {
            console.error('Unstake tokens error:', error);
            throw error;
        }
    }

    // ============================================================================
    // REWARDS SYSTEM
    // ============================================================================
    
    /**
     * Award BUZ rewards to user
     */
    static async awardReward(userId, amount, type, reason, metadata = null, expiresInDays = 30) {
        try {
            // Validate inputs
            if (!userId || !amount || !type || !reason) {
                throw new Error('Missing required parameters');
            }

            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            // Calculate expiration date
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiresInDays);

            // Create reward record
            const reward = await prisma.bUZReward.create({
                data: {
                    userId,
                    amount,
                    type,
                    reason,
                    expiresAt,
                    metadata
                }
            });

            return {
                success: true,
                rewardId: reward.id,
                userId,
                amount: parseFloat(amount),
                type,
                reason,
                expiresAt: reward.expiresAt
            };
        } catch (error) {
            console.error('Award reward error:', error);
            throw error;
        }
    }

    /**
     * Claim all available rewards for user
     */
    static async claimRewards(userId) {
        try {
            // Get unclaimed rewards
            const rewards = await prisma.bUZReward.findMany({
                where: {
                    userId,
                    isClaimed: false,
                    expiresAt: { gt: new Date() }
                }
            });

            if (rewards.length === 0) {
                return {
                    success: true,
                    message: 'No rewards available to claim',
                    claimedRewards: [],
                    totalAmount: 0
                };
            }

            const totalAmount = rewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);

            // Update rewards and user balance atomically
            const result = await prisma.$transaction(async (tx) => {
                // Update rewards as claimed
                await tx.bUZReward.updateMany({
                    where: {
                        id: { in: rewards.map(r => r.id) }
                    },
                    data: {
                        isClaimed: true,
                        claimedAt: new Date()
                    }
                });

                // Update user balance
                await tx.bUZToken.upsert({
                    where: { userId },
                    update: {
                        balance: { increment: totalAmount },
                        totalEarned: { increment: totalAmount },
                        lastActivity: new Date()
                    },
                    create: {
                        userId,
                        balance: totalAmount,
                        totalEarned: totalAmount
                    }
                });

                // Create transaction record
                await tx.bUZTransaction.create({
                    data: {
                        toUserId: userId,
                        amount: totalAmount,
                        type: 'REWARD',
                        reason: 'Claimed rewards',
                        description: `Claimed ${rewards.length} rewards totaling ${totalAmount} BUZ`,
                        status: 'CONFIRMED'
                    }
                });

                return { claimedRewards: rewards, totalAmount };
            });

            return {
                success: true,
                message: 'Rewards claimed successfully',
                claimedRewards: result.claimedRewards.map(reward => ({
                    id: reward.id,
                    amount: parseFloat(reward.amount),
                    type: reward.type,
                    reason: reward.reason
                })),
                totalAmount: parseFloat(result.totalAmount)
            };
        } catch (error) {
            console.error('Claim rewards error:', error);
            throw error;
        }
    }

    // ============================================================================
    // GAMIFICATION INTEGRATION
    // ============================================================================
    
    /**
     * Award gamification rewards
     */
    static async awardGamificationReward(userId, action, metadata = null) {
        try {
            const rewardConfig = {
                'DAILY_LOGIN': { amount: 1, reason: 'Daily login bonus' },
                'PROFILE_COMPLETE': { amount: 10, reason: 'Profile completion bonus' },
                'TEAM_JOIN': { amount: 5, reason: 'Team joining bonus' },
                'VENTURE_CREATE': { amount: 50, reason: 'Venture creation bonus' },
                'MILESTONE_ACHIEVE': { amount: 25, reason: 'Milestone achievement bonus' },
                'LEGAL_DOCUMENT_SIGN': { amount: 15, reason: 'Legal document signing bonus' },
                'REVENUE_SHARE_EARN': { amount: 20, reason: 'Revenue sharing bonus' },
                'STAKING_START': { amount: 10, reason: 'Staking initiation bonus' }
            };

            const config = rewardConfig[action];
            if (!config) {
                throw new Error('Invalid gamification action');
            }

            return await this.awardReward(
                userId,
                config.amount,
                action,
                config.reason,
                metadata,
                30 // 30 days to claim
            );
        } catch (error) {
            console.error('Award gamification reward error:', error);
            throw error;
        }
    }

    // ============================================================================
    // SUPPLY MANAGEMENT
    // ============================================================================
    
    /**
     * Get BUZ token supply information
     */
    static async getSupplyInfo() {
        try {
            const supply = await prisma.bUZTokenSupply.findFirst({
                orderBy: { lastUpdated: 'desc' }
            });

            if (!supply) {
                throw new Error('BUZ supply information not found');
            }

            return {
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
            };
        } catch (error) {
            console.error('Get supply info error:', error);
            throw error;
        }
    }

    /**
     * Update BUZ token supply
     */
    static async updateSupplyInfo(supplyData) {
        try {
            const supply = await prisma.bUZTokenSupply.create({
                data: {
                    ...supplyData,
                    lastUpdated: new Date()
                }
            });

            return {
                success: true,
                supplyId: supply.id,
                lastUpdated: supply.lastUpdated
            };
        } catch (error) {
            console.error('Update supply info error:', error);
            throw error;
        }
    }

    // ============================================================================
    // STATISTICS & ANALYTICS
    // ============================================================================
    
    /**
     * Get BUZ token statistics
     */
    static async getStatistics() {
        try {
            const [
                totalUsers,
                totalTransactions,
                totalStaked,
                totalBurned,
                recentTransactions,
                activeStaking,
                totalRewards
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
                }),
                prisma.bUZStaking.count({
                    where: { status: 'ACTIVE' }
                }),
                prisma.bUZReward.aggregate({
                    _sum: { amount: true },
                    where: { isClaimed: true }
                })
            ]);

            return {
                totalUsers,
                totalTransactions,
                totalStaked: parseFloat(totalStaked._sum.stakedBalance || 0),
                totalBurned: parseFloat(totalBurned._sum.totalBurned || 0),
                recentTransactions24h: recentTransactions,
                activeStakingPositions: activeStaking,
                totalRewardsClaimed: parseFloat(totalRewards._sum.amount || 0)
            };
        } catch (error) {
            console.error('Get statistics error:', error);
            throw error;
        }
    }
}

module.exports = BUZTokenService;
