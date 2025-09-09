/**
 * SmartStart Umbrella Revenue Service
 * Handles revenue calculation and sharing for umbrella relationships
 * Integrates with project revenue tracking
 */

const { PrismaClient } = require('@prisma/client');

class UmbrellaRevenueService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Calculate revenue shares for a project
   */
  async calculateRevenueShares(projectId, revenue) {
    try {
      console.log(`💰 Calculating revenue shares for project: ${projectId}, revenue: ${revenue}`);

      // Get project details
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: true
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Find active umbrella relationships for project owner
      const relationships = await this.prisma.umbrellaRelationship.findMany({
        where: {
          referredId: project.ownerId,
          status: 'ACTIVE',
          isActive: true,
          agreementSigned: true
        },
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          referred: { select: { id: true, name: true, email: true } }
        }
      });

      console.log(`🔍 Found ${relationships.length} active umbrella relationships`);

      const revenueShares = [];

      for (const relationship of relationships) {
        // Calculate share amount
        const shareAmount = (revenue * relationship.defaultShareRate) / 100;
        
        console.log(`📊 Relationship ${relationship.id}: ${relationship.defaultShareRate}% of ${revenue} = ${shareAmount}`);

        // Create revenue share record
        const share = await this.prisma.revenueShare.create({
          data: {
            umbrellaId: relationship.id,
            projectId,
            referrerId: relationship.referrerId,
            referredId: relationship.referredId,
            projectRevenue: revenue,
            sharePercentage: relationship.defaultShareRate,
            shareAmount,
            currency: 'USD',
            status: 'PENDING',
            calculatedAt: new Date()
          }
        });

        revenueShares.push(share);

        // Update analytics
        await this.updateUmbrellaAnalytics(relationship.referrerId, {
          totalRevenue: shareAmount,
          totalShares: 1
        });
      }

      return revenueShares;
    } catch (error) {
      console.error('Error calculating revenue shares:', error);
      throw error;
    }
  }

  /**
   * Process revenue shares for payment
   */
  async processRevenueShares(shareIds) {
    try {
      console.log(`💳 Processing revenue shares: ${shareIds.join(', ')}`);

      const shares = await this.prisma.revenueShare.findMany({
        where: {
          id: { in: shareIds },
          status: 'PENDING'
        },
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        }
      });

      const processedShares = [];

      for (const share of shares) {
        // Update share status to PROCESSING
        const updatedShare = await this.prisma.revenueShare.update({
          where: { id: share.id },
          data: {
            status: 'PROCESSING',
            calculatedAt: new Date()
          }
        });

        // Here you would integrate with your payment processing system
        // For now, we'll simulate successful payment
        const paymentResult = await this.simulatePayment(share);

        if (paymentResult.success) {
          // Update share status to COMPLETED
          const completedShare = await this.prisma.revenueShare.update({
            where: { id: share.id },
            data: {
              status: 'COMPLETED',
              paidAt: new Date(),
              paymentMethod: paymentResult.method,
              transactionId: paymentResult.transactionId
            }
          });

          processedShares.push(completedShare);

          // Update analytics
          await this.updateUmbrellaAnalytics(share.referrerId, {
            totalRevenue: share.shareAmount,
            totalShares: 1
          });
        } else {
          // Update share status to FAILED
          await this.prisma.revenueShare.update({
            where: { id: share.id },
            data: {
              status: 'FAILED'
            }
          });
        }
      }

      return processedShares;
    } catch (error) {
      console.error('Error processing revenue shares:', error);
      throw error;
    }
  }

  /**
   * Simulate payment processing (replace with real payment integration)
   */
  async simulatePayment(share) {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate 95% success rate
      const success = Math.random() > 0.05;

      if (success) {
        return {
          success: true,
          method: 'BANK_TRANSFER',
          transactionId: `TXN_${Date.now()}_${share.id.slice(-8)}`
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed'
        };
      }
    } catch (error) {
      console.error('Payment simulation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get revenue shares for user
   */
  async getRevenueShares(userId, filters = {}) {
    try {
      const where = {
        referrerId: userId,
        ...filters
      };

      const shares = await this.prisma.revenueShare.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, totalValue: true } },
          referred: { select: { id: true, name: true, email: true } },
          umbrella: { select: { id: true, defaultShareRate: true } }
        },
        orderBy: { calculatedAt: 'desc' }
      });

      return shares;
    } catch (error) {
      console.error('Error getting revenue shares:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics for user
   */
  async getRevenueAnalytics(userId, period = 'monthly') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const shares = await this.prisma.revenueShare.findMany({
        where: {
          referrerId: userId,
          calculatedAt: {
            gte: startDate
          }
        }
      });

      const analytics = {
        totalRevenue: shares.reduce((sum, share) => sum + share.shareAmount, 0),
        totalShares: shares.length,
        completedShares: shares.filter(s => s.status === 'COMPLETED').length,
        pendingShares: shares.filter(s => s.status === 'PENDING').length,
        failedShares: shares.filter(s => s.status === 'FAILED').length,
        averageShareAmount: shares.length > 0 ? shares.reduce((sum, share) => sum + share.shareAmount, 0) / shares.length : 0,
        period,
        startDate,
        endDate: now
      };

      return analytics;
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Update umbrella analytics
   */
  async updateUmbrellaAnalytics(userId, metrics) {
    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const existing = await this.prisma.umbrellaAnalytics.findUnique({
        where: {
          userId_period_periodStart: {
            userId,
            period: 'monthly',
            periodStart
          }
        }
      });

      if (existing) {
        await this.prisma.umbrellaAnalytics.update({
          where: { id: existing.id },
          data: {
            totalRevenue: existing.totalRevenue + (metrics.totalRevenue || 0),
            totalShares: existing.totalShares + (metrics.totalShares || 0),
            updatedAt: new Date()
          }
        });
      } else {
        await this.prisma.umbrellaAnalytics.create({
          data: {
            userId,
            period: 'monthly',
            periodStart,
            periodEnd,
            totalRevenue: metrics.totalRevenue || 0,
            totalShares: metrics.totalShares || 0,
            totalReferrals: 0,
            activeReferrals: 0,
            averageShareRate: 0,
            projectsGenerated: 0,
            projectsActive: 0,
            projectsCompleted: 0
          }
        });
      }
    } catch (error) {
      console.error('Error updating umbrella analytics:', error);
      // Don't throw error for analytics updates
    }
  }

  /**
   * Get network analytics for user
   */
  async getNetworkAnalytics(userId, period = 'monthly') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get umbrella relationships
      const relationships = await this.prisma.umbrellaRelationship.findMany({
        where: {
          referrerId: userId,
          createdAt: {
            gte: startDate
          }
        },
        include: {
          referred: { select: { id: true, name: true, email: true } }
        }
      });

      // Get revenue shares
      const shares = await this.prisma.revenueShare.findMany({
        where: {
          referrerId: userId,
          calculatedAt: {
            gte: startDate
          }
        }
      });

      const analytics = {
        totalReferrals: relationships.length,
        activeReferrals: relationships.filter(r => r.status === 'ACTIVE').length,
        totalRevenue: shares.reduce((sum, share) => sum + share.shareAmount, 0),
        totalShares: shares.length,
        averageShareRate: relationships.length > 0 ? 
          relationships.reduce((sum, r) => sum + r.defaultShareRate, 0) / relationships.length : 0,
        period,
        startDate,
        endDate: now,
        relationships: relationships.map(r => ({
          id: r.id,
          referredName: r.referred.name,
          referredEmail: r.referred.email,
          status: r.status,
          shareRate: r.defaultShareRate,
          createdAt: r.createdAt
        }))
      };

      return analytics;
    } catch (error) {
      console.error('Error getting network analytics:', error);
      throw error;
    }
  }
}

module.exports = new UmbrellaRevenueService();
