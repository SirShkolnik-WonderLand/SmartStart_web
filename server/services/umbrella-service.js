/**
 * SmartStart Private Umbrella Service
 * Comprehensive service for managing umbrella relationships, revenue sharing, and analytics
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

class UmbrellaService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // ===== UMBRELLA RELATIONSHIP MANAGEMENT =====

  /**
   * Create a new umbrella relationship
   */
  async createUmbrellaRelationship(referrerId, referredId, shareRate = 1.0, relationshipType = 'PRIVATE_UMBRELLA') {
    try {
      console.log(`🌂 Creating umbrella relationship: ${referrerId} -> ${referredId} (${shareRate}%)`);

      // Validate users exist
      const [referrer, referred] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: referrerId } }),
        this.prisma.user.findUnique({ where: { id: referredId } })
      ]);

      if (!referrer || !referred) {
        throw new Error('Invalid user IDs provided');
      }

      // Check if relationship already exists
      const existing = await this.prisma.umbrellaRelationship.findUnique({
        where: {
          referrerId_referredId: {
            referrerId,
            referredId
          }
        }
      });

      if (existing) {
        throw new Error('Umbrella relationship already exists between these users');
      }

      // Validate share rate
      if (shareRate < 0.5 || shareRate > 1.5) {
        throw new Error('Share rate must be between 0.5% and 1.5%');
      }

      // Create relationship
      const relationship = await this.prisma.umbrellaRelationship.create({
        data: {
          referrerId,
          referredId,
          relationshipType,
          defaultShareRate: shareRate,
          status: 'PENDING_AGREEMENT'
        },
        include: {
          referrer: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              level: true 
            } 
          },
          referred: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              level: true 
            } 
          }
        }
      });

      console.log(`✅ Umbrella relationship created: ${relationship.id}`);
      return relationship;
    } catch (error) {
      console.error('❌ Error creating umbrella relationship:', error);
      throw error;
    }
  }

  /**
   * Get user's umbrella relationships
   */
  async getUmbrellaRelationships(userId, type = 'all') {
    try {
      console.log(`🌂 Getting umbrella relationships for user: ${userId} (type: ${type})`);

      const where = type === 'all' 
        ? { OR: [{ referrerId: userId }, { referredId: userId }] }
        : type === 'referrer' 
        ? { referrerId: userId }
        : { referredId: userId };

      const relationships = await this.prisma.umbrellaRelationship.findMany({
        where,
        include: {
          referrer: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              level: true 
            } 
          },
          referred: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              level: true 
            } 
          },
          revenueShares: {
            select: {
              id: true,
              projectRevenue: true,
              shareAmount: true,
              status: true,
              calculatedAt: true
            },
            orderBy: { calculatedAt: 'desc' },
            take: 10
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`✅ Found ${relationships.length} umbrella relationships`);
      return relationships;
    } catch (error) {
      console.error('❌ Error getting umbrella relationships:', error);
      throw error;
    }
  }

  /**
   * Update umbrella relationship
   */
  async updateUmbrellaRelationship(relationshipId, updates) {
    try {
      console.log(`🌂 Updating umbrella relationship: ${relationshipId}`);

      const relationship = await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          referrer: { 
            select: { 
              id: true, 
              name: true, 
              email: true 
            } 
          },
          referred: { 
            select: { 
              id: true, 
              name: true, 
              email: true 
            } 
          }
        }
      });

      console.log(`✅ Umbrella relationship updated: ${relationshipId}`);
      return relationship;
    } catch (error) {
      console.error('❌ Error updating umbrella relationship:', error);
      throw error;
    }
  }

  /**
   * Terminate umbrella relationship
   */
  async terminateUmbrellaRelationship(relationshipId, reason = 'User requested') {
    try {
      console.log(`🌂 Terminating umbrella relationship: ${relationshipId}`);

      const relationship = await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          status: 'TERMINATED',
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Umbrella relationship terminated: ${relationshipId}`);
      return relationship;
    } catch (error) {
      console.error('❌ Error terminating umbrella relationship:', error);
      throw error;
    }
  }

  // ===== REVENUE SHARING MANAGEMENT =====

  /**
   * Calculate revenue shares for a project
   */
  async calculateRevenueShares(projectId, revenue) {
    try {
      console.log(`💰 Calculating revenue shares for project: ${projectId} (revenue: $${revenue})`);

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: { owner: true }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Find active umbrella relationships for project owner
      const relationships = await this.prisma.umbrellaRelationship.findMany({
        where: {
          referredId: project.ownerId,
          status: 'ACTIVE',
          isActive: true
        },
        include: {
          referrer: true
        }
      });

      const revenueShares = [];

      for (const relationship of relationships) {
        const shareAmount = (revenue * relationship.defaultShareRate) / 100;
        
        const share = await this.prisma.revenueShare.create({
          data: {
            umbrellaId: relationship.id,
            projectId,
            referrerId: relationship.referrerId,
            referredId: relationship.referredId,
            projectRevenue: revenue,
            sharePercentage: relationship.defaultShareRate,
            shareAmount,
            status: 'CALCULATED'
          },
          include: {
            referrer: { select: { id: true, name: true, email: true } },
            referred: { select: { id: true, name: true, email: true } },
            project: { select: { id: true, name: true } }
          }
        });

        revenueShares.push(share);
      }

      console.log(`✅ Created ${revenueShares.length} revenue shares for project: ${projectId}`);
      return revenueShares;
    } catch (error) {
      console.error('❌ Error calculating revenue shares:', error);
      throw error;
    }
  }

  /**
   * Get revenue shares for user
   */
  async getRevenueShares(userId, filters = {}) {
    try {
      console.log(`💰 Getting revenue shares for user: ${userId}`);

      const where = {
        referrerId: userId,
        ...filters
      };

      const shares = await this.prisma.revenueShare.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          referred: { select: { id: true, name: true, email: true } },
          umbrella: { select: { id: true, defaultShareRate: true } }
        },
        orderBy: { calculatedAt: 'desc' }
      });

      console.log(`✅ Found ${shares.length} revenue shares for user: ${userId}`);
      return shares;
    } catch (error) {
      console.error('❌ Error getting revenue shares:', error);
      throw error;
    }
  }

  /**
   * Mark revenue share as paid
   */
  async markShareAsPaid(shareId, paymentDetails) {
    try {
      console.log(`💰 Marking revenue share as paid: ${shareId}`);

      const share = await this.prisma.revenueShare.update({
        where: { id: shareId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentMethod: paymentDetails.method,
          transactionId: paymentDetails.transactionId
        },
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        }
      });

      console.log(`✅ Revenue share marked as paid: ${shareId}`);
      return share;
    } catch (error) {
      console.error('❌ Error marking share as paid:', error);
      throw error;
    }
  }

  // ===== LEGAL DOCUMENT MANAGEMENT =====

  /**
   * Generate umbrella agreement document
   */
  async generateUmbrellaAgreement(relationshipId) {
    try {
      console.log(`📄 Generating umbrella agreement for relationship: ${relationshipId}`);

      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId },
        include: {
          referrer: true,
          referred: true
        }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      // Generate document content
      const documentContent = this.generateAgreementContent(relationship);

      const document = await this.prisma.umbrellaDocument.create({
        data: {
          umbrellaId: relationshipId,
          documentType: 'UMBRELLA_AGREEMENT',
          title: `Umbrella Agreement - ${relationship.referrer.name} & ${relationship.referred.name}`,
          content: documentContent,
          status: 'DRAFT',
          requiresSignature: true
        }
      });

      console.log(`✅ Umbrella agreement generated: ${document.id}`);
      return document;
    } catch (error) {
      console.error('❌ Error generating umbrella agreement:', error);
      throw error;
    }
  }

  /**
   * Sign umbrella document
   */
  async signUmbrellaDocument(documentId, signerId, signatureData) {
    try {
      console.log(`📝 Signing umbrella document: ${documentId} by user: ${signerId}`);

      // Generate signature hash
      const signatureHash = crypto
        .createHash('sha256')
        .update(JSON.stringify({
          documentId,
          signerId,
          signatureData,
          timestamp: new Date().toISOString()
        }))
        .digest('hex');

      // Create signature record
      const signature = await this.prisma.umbrellaDocumentSignature.create({
        data: {
          documentId,
          signerId,
          signatureHash,
          signedAt: new Date(),
          ipAddress: signatureData.ipAddress,
          userAgent: signatureData.userAgent
        }
      });

      // Check if all required signatures are complete
      const document = await this.prisma.umbrellaDocument.findUnique({
        where: { id: documentId },
        include: {
          umbrella: {
            include: {
              referrer: true,
              referred: true
            }
          },
          signatures: true
        }
      });

      // If both parties have signed, mark document as signed and activate relationship
      if (document.signatures.length >= 2) {
        await this.prisma.umbrellaDocument.update({
          where: { id: documentId },
          data: {
            status: 'EFFECTIVE',
            signedAt: new Date()
          }
        });

        // Activate the umbrella relationship
        await this.prisma.umbrellaRelationship.update({
          where: { id: document.umbrellaId },
          data: {
            status: 'ACTIVE',
            agreementSigned: true,
            signedAt: new Date()
          }
        });

        console.log(`✅ Umbrella relationship activated: ${document.umbrellaId}`);
      }

      console.log(`✅ Document signed: ${documentId}`);
      return signature;
    } catch (error) {
      console.error('❌ Error signing umbrella document:', error);
      throw error;
    }
  }

  // ===== ANALYTICS & REPORTING =====

  /**
   * Get network analytics for user
   */
  async getNetworkAnalytics(userId, period = 'monthly') {
    try {
      console.log(`📊 Getting network analytics for user: ${userId} (period: ${period})`);

      const now = new Date();
      let periodStart, periodEnd;

      switch (period) {
        case 'monthly':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3);
          periodStart = new Date(now.getFullYear(), quarter * 3, 1);
          periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
          break;
        case 'yearly':
          periodStart = new Date(now.getFullYear(), 0, 1);
          periodEnd = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // Get or create analytics record
      let analytics = await this.prisma.umbrellaAnalytics.findUnique({
        where: {
          userId_period_periodStart: {
            userId,
            period,
            periodStart
          }
        }
      });

      if (!analytics) {
        // Calculate analytics
        const relationships = await this.prisma.umbrellaRelationship.findMany({
          where: {
            referrerId: userId,
            createdAt: {
              gte: periodStart,
              lte: periodEnd
            }
          }
        });

        const revenueShares = await this.prisma.revenueShare.findMany({
          where: {
            referrerId: userId,
            calculatedAt: {
              gte: periodStart,
              lte: periodEnd
            }
          }
        });

        const totalRevenue = revenueShares.reduce((sum, share) => sum + share.projectRevenue, 0);
        const totalShares = revenueShares.reduce((sum, share) => sum + share.shareAmount, 0);
        const averageShareRate = relationships.length > 0 
          ? relationships.reduce((sum, rel) => sum + rel.defaultShareRate, 0) / relationships.length 
          : 0;

        analytics = await this.prisma.umbrellaAnalytics.create({
          data: {
            userId,
            period,
            periodStart,
            periodEnd,
            totalReferrals: relationships.length,
            activeReferrals: relationships.filter(rel => rel.status === 'ACTIVE').length,
            totalRevenue,
            totalShares,
            averageShareRate,
            projectsGenerated: revenueShares.length,
            projectsActive: revenueShares.filter(share => share.status === 'CALCULATED').length,
            projectsCompleted: revenueShares.filter(share => share.status === 'PAID').length
          }
        });
      }

      console.log(`✅ Network analytics retrieved for user: ${userId}`);
      return analytics;
    } catch (error) {
      console.error('❌ Error getting network analytics:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Generate agreement document content
   */
  generateAgreementContent(relationship) {
    const template = `
# SmartStart Private Umbrella Agreement

**Agreement Date:** ${new Date().toLocaleDateString()}
**Agreement Version:** v1.0
**Governing Law:** Ontario, Canada

## PARTIES

**Referrer (Sponsor):**
- Name: ${relationship.referrer.name}
- Email: ${relationship.referrer.email}
- SmartStart User ID: ${relationship.referrer.id}

**Referred (Sponsored):**
- Name: ${relationship.referred.name}
- Email: ${relationship.referred.email}
- SmartStart User ID: ${relationship.referred.id}

## AGREEMENT TERMS

### 1. REFERRAL RELATIONSHIP
The Referrer has brought the Referred to the SmartStart platform and both parties agree to establish a Private Umbrella relationship.

### 2. REVENUE SHARING
The Referrer shall receive ${relationship.defaultShareRate}% of all project revenue generated by the Referred through SmartStart projects.

### 3. OBLIGATIONS
- **Referrer**: Provide guidance and support to the Referred
- **Referred**: Maintain active participation in the SmartStart platform
- **Platform**: Facilitate revenue sharing calculations and payments

### 4. TERMINATION
Either party may terminate this agreement with 30 days written notice.

### 5. LEGAL COMPLIANCE
This agreement is governed by the laws of Ontario, Canada.

---

**Document Hash:** [TO_BE_GENERATED]
**Agreement ID:** ${relationship.id}
**Status:** DRAFT
    `;

    return template.trim();
  }

  /**
   * Validate umbrella relationship data
   */
  validateUmbrellaData(data) {
    const errors = [];

    if (!data.referrerId) errors.push('Referrer ID is required');
    if (!data.referredId) errors.push('Referred ID is required');
    if (data.referrerId === data.referredId) errors.push('Referrer and referred cannot be the same user');
    if (data.shareRate && (data.shareRate < 0.5 || data.shareRate > 1.5)) {
      errors.push('Share rate must be between 0.5% and 1.5%');
    }

    return errors;
  }

  /**
   * Cleanup method
   */
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

module.exports = new UmbrellaService();
