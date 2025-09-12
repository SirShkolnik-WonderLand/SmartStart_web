const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BUZTokenService {
  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  async getUserBalance(userId) {
    try {
      let buzToken = await prisma.bUZToken.findUnique({
        where: { userId }
      });

      if (!buzToken) {
        // Create BUZ token record for new user
        buzToken = await prisma.bUZToken.create({
          data: {
            userId,
            balance: 0,
            stakedBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
            totalBurned: 0,
            isActive: true
          }
        });
      }

      return {
        success: true,
        data: {
          userId: buzToken.userId,
          balance: parseFloat(buzToken.balance),
          stakedBalance: parseFloat(buzToken.stakedBalance),
          totalEarned: parseFloat(buzToken.totalEarned),
          totalSpent: parseFloat(buzToken.totalSpent),
          totalBurned: parseFloat(buzToken.totalBurned),
          lastActivity: buzToken.lastActivity
        }
      };
    } catch (error) {
      console.error('Get user balance error:', error);
      return { success: false, error: error.message };
    }
  }

  async transferTokens(fromUserId, toUserId, amount, reason, description) {
    try {
      const transferAmount = parseFloat(amount);
      
      // Check if sender has sufficient balance
      const senderToken = await prisma.bUZToken.findUnique({
        where: { userId: fromUserId }
      });

      if (!senderToken || parseFloat(senderToken.balance) < transferAmount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Get or create recipient token record
      let recipientToken = await prisma.bUZToken.findUnique({
        where: { userId: toUserId }
      });

      if (!recipientToken) {
        recipientToken = await prisma.bUZToken.create({
          data: {
            userId: toUserId,
            balance: 0,
            stakedBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
            totalBurned: 0,
            isActive: true
          }
        });
      }

      // Create transaction record
      const transaction = await prisma.bUZTransaction.create({
        data: {
          fromUserId,
          toUserId,
          amount: transferAmount,
          type: 'TRANSFER',
          reason,
          description,
          status: 'CONFIRMED',
          metadata: {
            timestamp: new Date().toISOString(),
            transferType: 'user_to_user'
          }
        }
      });

      // Update balances
      await prisma.bUZToken.update({
        where: { userId: fromUserId },
        data: {
          balance: { decrement: transferAmount },
          totalSpent: { increment: transferAmount },
          lastActivity: new Date()
        }
      });

      await prisma.bUZToken.update({
        where: { userId: toUserId },
        data: {
          balance: { increment: transferAmount },
          totalEarned: { increment: transferAmount },
          lastActivity: new Date()
        }
      });

      return {
        success: true,
        data: {
          transactionId: transaction.id,
          fromUserId,
          toUserId,
          amount: transferAmount,
          status: 'CONFIRMED'
        }
      };
    } catch (error) {
      console.error('Transfer tokens error:', error);
      return { success: false, error: error.message };
    }
  }

  async stakeTokens(userId, amount, tier) {
    try {
      const stakeAmount = parseFloat(amount);
      
      // Check if user has sufficient balance
      const userToken = await prisma.bUZToken.findUnique({
        where: { userId }
      });

      if (!userToken || parseFloat(userToken.balance) < stakeAmount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Calculate staking parameters
      const stakingConfig = {
        'BASIC': { duration: 30, apy: 5.00 },
        'PREMIUM': { duration: 90, apy: 10.00 },
        'VIP': { duration: 180, apy: 15.00 },
        'GOVERNANCE': { duration: 365, apy: 20.00 }
      };

      const config = stakingConfig[tier] || stakingConfig['BASIC'];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + config.duration);
      const expectedReward = stakeAmount * (config.apy / 100) * (config.duration / 365);

      // Create staking record
      const staking = await prisma.bUZStaking.create({
        data: {
          userId,
          amount: stakeAmount,
          tier,
          duration: config.duration,
          apy: config.apy,
          expectedReward: expectedReward,
          startDate: new Date(),
          endDate,
          status: 'ACTIVE'
        }
      });

      // Update user balances
      await prisma.bUZToken.update({
        where: { userId },
        data: {
          balance: { decrement: stakeAmount },
          stakedBalance: { increment: stakeAmount },
          lastActivity: new Date()
        }
      });

      return {
        success: true,
        data: {
          stakingId: staking.id,
          userId,
          amount: stakeAmount,
          tier,
          duration: config.duration,
          apy: config.apy,
          expectedReward: expectedReward,
          endDate: endDate.toISOString()
        }
      };
    } catch (error) {
      console.error('Stake tokens error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserTransactions(userId, page = 1, limit = 50, type, status) {
    try {
      const skip = (page - 1) * limit;
      const where = {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      };

      if (type) where.type = type;
      if (status) where.status = status;

      const [transactions, total] = await Promise.all([
        prisma.bUZTransaction.findMany({
          where,
          include: {
            fromUser: {
              select: { id: true, email: true, name: true }
            },
            toUser: {
              select: { id: true, email: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.bUZTransaction.count({ where })
      ]);

      return {
        success: true,
        data: {
          transactions: transactions.map(tx => ({
            id: tx.id,
            fromUserId: tx.fromUserId,
            fromUser: tx.fromUser,
            toUserId: tx.toUserId,
            toUser: tx.toUser,
            amount: parseFloat(tx.amount),
            type: tx.type,
            reason: tx.reason,
            description: tx.description,
            status: tx.status,
            blockNumber: tx.blockNumber?.toString(),
            transactionHash: tx.transactionHash,
            gasUsed: tx.gasUsed?.toString(),
            gasPrice: tx.gasPrice?.toString(),
            metadata: tx.metadata,
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error('Get user transactions error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserStaking(userId) {
    try {
      const stakingPositions = await prisma.bUZStaking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: {
          stakingPositions: stakingPositions.map(staking => ({
            id: staking.id,
            userId: staking.userId,
            amount: parseFloat(staking.amount),
            tier: staking.tier,
            duration: staking.duration,
            apy: parseFloat(staking.apy),
            expectedReward: parseFloat(staking.expectedReward),
            actualReward: parseFloat(staking.actualReward),
            startDate: staking.startDate,
            endDate: staking.endDate,
            status: staking.status,
            isAutoRenew: staking.isAutoRenew,
            createdAt: staking.createdAt,
            updatedAt: staking.updatedAt
          }))
        }
      };
    } catch (error) {
      console.error('Get user staking error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // ADMIN OPERATIONS
  // ============================================================================

  async mintTokens(userId, amount, reason, adminUserId) {
    try {
      const mintAmount = parseFloat(amount);
      
      // Get or create user token record
      let userToken = await prisma.bUZToken.findUnique({
        where: { userId }
      });

      if (!userToken) {
        userToken = await prisma.bUZToken.create({
          data: {
            userId,
            balance: 0,
            stakedBalance: 0,
            totalEarned: 0,
            totalSpent: 0,
            totalBurned: 0,
            isActive: true
          }
        });
      }

      // Create transaction record
      const transaction = await prisma.bUZTransaction.create({
        data: {
          fromUserId: null,
          toUserId: userId,
          amount: mintAmount,
          type: 'MINT',
          reason: reason || 'Admin mint',
          description: `Minted by admin ${adminUserId}`,
          status: 'CONFIRMED',
          metadata: {
            adminUserId,
            timestamp: new Date().toISOString(),
            mintType: 'admin_mint'
          }
        }
      });

      // Update user balance
      await prisma.bUZToken.update({
        where: { userId },
        data: {
          balance: { increment: mintAmount },
          totalEarned: { increment: mintAmount },
          lastActivity: new Date()
        }
      });

      return {
        success: true,
        data: {
          transactionId: transaction.id,
          userId,
          amount: mintAmount,
          mintedBy: adminUserId,
          reason: reason || 'Admin mint',
          status: 'CONFIRMED'
        }
      };
    } catch (error) {
      console.error('Mint tokens error:', error);
      return { success: false, error: error.message };
    }
  }

  async burnTokens(userId, amount, reason, adminUserId) {
    try {
      const burnAmount = parseFloat(amount);
      
      // Check if user has sufficient balance
      const userToken = await prisma.bUZToken.findUnique({
        where: { userId }
      });

      if (!userToken || parseFloat(userToken.balance) < burnAmount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create transaction record
      const transaction = await prisma.bUZTransaction.create({
        data: {
          fromUserId: userId,
          toUserId: null,
          amount: burnAmount,
          type: 'BURN',
          reason: reason || 'Admin burn',
          description: `Burned by admin ${adminUserId}`,
          status: 'CONFIRMED',
          metadata: {
            adminUserId,
            timestamp: new Date().toISOString(),
            burnType: 'admin_burn'
          }
        }
      });

      // Update user balance
      await prisma.bUZToken.update({
        where: { userId },
        data: {
          balance: { decrement: burnAmount },
          totalBurned: { increment: burnAmount },
          lastActivity: new Date()
        }
      });

      return {
        success: true,
        data: {
          transactionId: transaction.id,
          userId,
          amount: burnAmount,
          burnedBy: adminUserId,
          reason: reason || 'Admin burn',
          status: 'CONFIRMED'
        }
      };
    } catch (error) {
      console.error('Burn tokens error:', error);
      return { success: false, error: error.message };
    }
  }

  async getSystemStats() {
    try {
      const [
        totalUsers,
        totalTransactions,
        totalStaked,
        totalBurned,
        recentTransactions24h,
        activeStakingPositions,
        totalRewardsClaimed
      ] = await Promise.all([
        prisma.bUZToken.count(),
        prisma.bUZTransaction.count(),
        prisma.bUZStaking.aggregate({
          _sum: { amount: true }
        }),
        prisma.bUZTransaction.aggregate({
          where: { type: 'BURN' },
          _sum: { amount: true }
        }),
        prisma.bUZTransaction.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.bUZStaking.count({
          where: { status: 'ACTIVE' }
        }),
        prisma.bUZReward.aggregate({
          where: { isClaimed: true },
          _sum: { amount: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalUsers,
          totalTransactions,
          totalStaked: parseFloat(totalStaked._sum.amount || 0),
          totalBurned: parseFloat(totalBurned._sum.amount || 0),
          recentTransactions24h,
          activeStakingPositions,
          totalRewardsClaimed: parseFloat(totalRewardsClaimed._sum.amount || 0)
        }
      };
    } catch (error) {
      console.error('Get system stats error:', error);
      return { success: false, error: error.message };
    }
  }

  async getSupplyInfo() {
    try {
      const supply = await prisma.bUZTokenSupply.findFirst({
        orderBy: { lastUpdated: 'desc' }
      });

      if (!supply) {
        // Create default supply record
        const defaultSupply = await prisma.bUZTokenSupply.create({
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
            lastUpdated: new Date()
          }
        });
        return { success: true, data: defaultSupply };
      }

      return {
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
      };
    } catch (error) {
      console.error('Get supply info error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = BUZTokenService;