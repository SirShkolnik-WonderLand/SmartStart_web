/**
 * SmartStart Private Umbrella API Routes
 * Comprehensive API endpoints for umbrella relationship management
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const umbrellaService = require('../services/umbrella-service');
const umbrellaLegalService = require('../services/umbrella-legal-service');
const umbrellaRevenueService = require('../services/umbrella-revenue-service');
const UmbrellaSecurityMiddleware = require('../middleware/umbrella-security');

const router = express.Router();

// Initialize security middleware
const securityMiddleware = new UmbrellaSecurityMiddleware();

// Apply rate limiting
router.use(securityMiddleware.createUmbrellaRateLimit());

// ===== HEALTH CHECK =====

router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      service: 'umbrella-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'umbrella-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== UMBRELLA RELATIONSHIP MANAGEMENT =====

/**
 * Get user's umbrella relationships
 * GET /api/umbrella/relationships
 */
router.get('/relationships', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { type = 'all' } = req.query;
    
    console.log(`🌂 Getting umbrella relationships for user: ${userId} (type: ${type})`);
    
    const relationships = await umbrellaService.getUmbrellaRelationships(userId, type);
    
    res.json({
      success: true,
      data: relationships,
      count: relationships.length
    });
  } catch (error) {
    console.error('❌ Error getting umbrella relationships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get umbrella relationships',
      error: error.message
    });
  }
});

/**
 * Create umbrella relationship
 * POST /api/umbrella/relationships
 */
router.post('/relationships', 
  authenticateToken, 
  securityMiddleware.validateUmbrellaData.bind(securityMiddleware),
  securityMiddleware.checkGDPRCompliance.bind(securityMiddleware),
  async (req, res) => {
  try {
    const { userId } = req.user;
    const { referredId, shareRate = 1.0, relationshipType = 'PRIVATE_UMBRELLA' } = req.body;
    
    console.log(`🌂 Creating umbrella relationship: ${userId} -> ${referredId} (${shareRate}%)`);
    
    // Validate input
    const validationErrors = umbrellaService.validateUmbrellaData({
      referrerId: userId,
      referredId,
      shareRate
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const relationship = await umbrellaService.createUmbrellaRelationship(
      userId, 
      referredId, 
      shareRate,
      relationshipType
    );
    
    res.status(201).json({
      success: true,
      data: relationship,
      message: 'Umbrella relationship created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating umbrella relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create umbrella relationship',
      error: error.message
    });
  }
});

/**
 * Get specific umbrella relationship
 * GET /api/umbrella/relationships/:id
 */
router.get('/relationships/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    console.log(`🌂 Getting umbrella relationship: ${id}`);
    
    const relationship = await umbrellaService.getUmbrellaRelationships(userId);
    const specificRelationship = relationship.find(rel => rel.id === id);
    
    if (!specificRelationship) {
      return res.status(404).json({
        success: false,
        message: 'Umbrella relationship not found'
      });
    }
    
    res.json({
      success: true,
      data: specificRelationship
    });
  } catch (error) {
    console.error('❌ Error getting umbrella relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get umbrella relationship',
      error: error.message
    });
  }
});

/**
 * Update umbrella relationship
 * PUT /api/umbrella/relationships/:id
 */
router.put('/relationships/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { userId } = req.user;
    
    console.log(`🌂 Updating umbrella relationship: ${id}`);
    
    // Validate user has access to this relationship
    const relationships = await umbrellaService.getUmbrellaRelationships(userId);
    const relationship = relationships.find(rel => rel.id === id);
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Umbrella relationship not found or access denied'
      });
    }
    
    const updatedRelationship = await umbrellaService.updateUmbrellaRelationship(id, updates);
    
    res.json({
      success: true,
      data: updatedRelationship,
      message: 'Umbrella relationship updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating umbrella relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update umbrella relationship',
      error: error.message
    });
  }
});

/**
 * Terminate umbrella relationship
 * DELETE /api/umbrella/relationships/:id
 */
router.delete('/relationships/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'User requested' } = req.body;
    const { userId } = req.user;
    
    console.log(`🌂 Terminating umbrella relationship: ${id}`);
    
    // Validate user has access to this relationship
    const relationships = await umbrellaService.getUmbrellaRelationships(userId);
    const relationship = relationships.find(rel => rel.id === id);
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Umbrella relationship not found or access denied'
      });
    }
    
    const terminatedRelationship = await umbrellaService.terminateUmbrellaRelationship(id, reason);
    
    res.json({
      success: true,
      data: terminatedRelationship,
      message: 'Umbrella relationship terminated successfully'
    });
  } catch (error) {
    console.error('❌ Error terminating umbrella relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to terminate umbrella relationship',
      error: error.message
    });
  }
});

// ===== REVENUE SHARING MANAGEMENT =====

/**
 * Get revenue shares for user
 * GET /api/umbrella/revenue/shares
 */
router.get('/revenue/shares', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, limit = 50, offset = 0 } = req.query;
    
    console.log(`💰 Getting revenue shares for user: ${userId}`);
    
    const filters = {};
    if (status) filters.status = status;
    
    const shares = await umbrellaRevenueService.getRevenueShares(userId, filters);
    
    res.json({
      success: true,
      data: shares,
      count: shares.length
    });
  } catch (error) {
    console.error('❌ Error getting revenue shares:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue shares',
      error: error.message
    });
  }
});

/**
 * Calculate revenue shares for project
 * POST /api/umbrella/revenue/calculate
 */
router.post('/revenue/calculate', 
  authenticateToken, 
  securityMiddleware.createRevenueCalculationRateLimit(),
  securityMiddleware.validateRevenueData.bind(securityMiddleware),
  securityMiddleware.checkFinancialCompliance.bind(securityMiddleware),
  async (req, res) => {
  try {
    const { projectId, revenue } = req.body;
    
    console.log(`💰 Calculating revenue shares for project: ${projectId} (revenue: $${revenue})`);
    
    if (!projectId || !revenue) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and revenue are required'
      });
    }
    
    if (revenue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Revenue must be a positive number'
      });
    }
    
    const shares = await umbrellaService.calculateRevenueShares(projectId, revenue);
    
    res.json({
      success: true,
      data: shares,
      count: shares.length,
      message: 'Revenue shares calculated successfully'
    });
  } catch (error) {
    console.error('❌ Error calculating revenue shares:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate revenue shares',
      error: error.message
    });
  }
});

/**
 * Mark revenue share as paid
 * PUT /api/umbrella/revenue/shares/:id/pay
 */
router.put('/revenue/shares/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;
    const { userId } = req.user;
    
    console.log(`💰 Marking revenue share as paid: ${id}`);
    
    // Validate user has access to this share
    const shares = await umbrellaService.getRevenueShares(userId);
    const share = shares.find(s => s.id === id);
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Revenue share not found or access denied'
      });
    }
    
    const paymentDetails = {
      method: paymentMethod,
      transactionId
    };
    
    const paidShare = await umbrellaService.markShareAsPaid(id, paymentDetails);
    
    res.json({
      success: true,
      data: paidShare,
      message: 'Revenue share marked as paid successfully'
    });
  } catch (error) {
    console.error('❌ Error marking share as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark share as paid',
      error: error.message
    });
  }
});

// ===== LEGAL DOCUMENT MANAGEMENT =====

/**
 * Generate umbrella agreement
 * POST /api/umbrella/documents/generate
 */
router.post('/documents/generate', authenticateToken, async (req, res) => {
  try {
    const { relationshipId, documentType = 'UMBRELLA_AGREEMENT' } = req.body;
    const { userId } = req.user;
    
    console.log(`📄 Generating umbrella document: ${documentType} for relationship: ${relationshipId}`);
    
    if (!relationshipId) {
      return res.status(400).json({
        success: false,
        message: 'Relationship ID is required'
      });
    }
    
    // Validate user has access to this relationship
    const relationships = await umbrellaService.getUmbrellaRelationships(userId);
    const relationship = relationships.find(rel => rel.id === relationshipId);
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Umbrella relationship not found or access denied'
      });
    }
    
    const document = await umbrellaService.generateUmbrellaAgreement(relationshipId);
    
    res.status(201).json({
      success: true,
      data: document,
      message: 'Umbrella agreement generated successfully'
    });
  } catch (error) {
    console.error('❌ Error generating umbrella agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate umbrella agreement',
      error: error.message
    });
  }
});

/**
 * Sign umbrella document
 * POST /api/umbrella/documents/:id/sign
 */
router.post('/documents/:id/sign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureData } = req.body;
    const { userId } = req.user;
    
    console.log(`📝 Signing umbrella document: ${id} by user: ${userId}`);
    
    if (!signatureData) {
      return res.status(400).json({
        success: false,
        message: 'Signature data is required'
      });
    }
    
    // Add request metadata to signature data
    const enhancedSignatureData = {
      ...signatureData,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    const signature = await umbrellaService.signUmbrellaDocument(id, userId, enhancedSignatureData);
    
    res.json({
      success: true,
      data: signature,
      message: 'Document signed successfully'
    });
  } catch (error) {
    console.error('❌ Error signing umbrella document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign umbrella document',
      error: error.message
    });
  }
});

// ===== ANALYTICS & REPORTING =====

/**
 * Get network analytics for user
 * GET /api/umbrella/analytics/network
 */
router.get('/analytics/network', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = 'monthly' } = req.query;
    
    console.log(`📊 Getting network analytics for user: ${userId} (period: ${period})`);
    
    const analytics = await umbrellaService.getNetworkAnalytics(userId, period);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error getting network analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network analytics',
      error: error.message
    });
  }
});

/**
 * Get revenue analytics for user
 * GET /api/umbrella/analytics/revenue
 */
router.get('/analytics/revenue', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = 'monthly' } = req.query;
    
    console.log(`💰 Getting revenue analytics for user: ${userId} (period: ${period})`);
    
    const shares = await umbrellaService.getRevenueShares(userId);
    
    // Calculate analytics
    const totalRevenue = shares.reduce((sum, share) => sum + share.projectRevenue, 0);
    const totalShares = shares.reduce((sum, share) => sum + share.shareAmount, 0);
    const paidShares = shares.filter(share => share.status === 'PAID');
    const pendingShares = shares.filter(share => share.status === 'CALCULATED');
    
    const analytics = {
      totalRevenue,
      totalShares,
      paidShares: paidShares.reduce((sum, share) => sum + share.shareAmount, 0),
      pendingShares: pendingShares.reduce((sum, share) => sum + share.shareAmount, 0),
      totalProjects: shares.length,
      paidProjects: paidShares.length,
      pendingProjects: pendingShares.length,
      averageShareRate: shares.length > 0 
        ? shares.reduce((sum, share) => sum + share.sharePercentage, 0) / shares.length 
        : 0
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error getting revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics',
      error: error.message
    });
  }
});

/**
 * Get referral analytics for user
 * GET /api/umbrella/analytics/referrals
 */
router.get('/analytics/referrals', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = 'monthly' } = req.query;
    
    console.log(`👥 Getting referral analytics for user: ${userId} (period: ${period})`);
    
    const relationships = await umbrellaService.getUmbrellaRelationships(userId, 'referrer');
    
    // Calculate analytics
    const totalReferrals = relationships.length;
    const activeReferrals = relationships.filter(rel => rel.status === 'ACTIVE').length;
    const pendingReferrals = relationships.filter(rel => rel.status === 'PENDING_AGREEMENT').length;
    const terminatedReferrals = relationships.filter(rel => rel.status === 'TERMINATED').length;
    
    const analytics = {
      totalReferrals,
      activeReferrals,
      pendingReferrals,
      terminatedReferrals,
      averageShareRate: relationships.length > 0 
        ? relationships.reduce((sum, rel) => sum + rel.defaultShareRate, 0) / relationships.length 
        : 0,
      totalRevenueGenerated: relationships.reduce((sum, rel) => 
        sum + rel.revenueShares.reduce((shareSum, share) => shareSum + share.projectRevenue, 0), 0
      ),
      totalSharesEarned: relationships.reduce((sum, rel) => 
        sum + rel.revenueShares.reduce((shareSum, share) => shareSum + share.shareAmount, 0), 0
      )
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error getting referral analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral analytics',
      error: error.message
    });
  }
});

// ===== ERROR HANDLING =====

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Umbrella API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
router.use((error, req, res, next) => {
  console.error('❌ Umbrella API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ===== UMBRELLA LEGAL DOCUMENTS =====

/**
 * Get umbrella documents for a relationship
 * GET /api/umbrella/documents/:relationshipId
 */
router.get('/documents/:relationshipId', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { userId } = req.user;
    
    console.log(`📄 Getting umbrella documents for relationship: ${relationshipId}`);
    
    // Verify user has access to this relationship
    const relationship = await umbrellaService.getUmbrellaRelationship(relationshipId);
    if (!relationship || (relationship.referrerId !== userId && relationship.referredId !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this relationship'
      });
    }
    
    const documents = await umbrellaLegalService.getUmbrellaDocuments(relationshipId);
    
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error getting umbrella documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get umbrella documents',
      error: error.message
    });
  }
});

/**
 * Generate umbrella agreement
 * POST /api/umbrella/documents/:relationshipId/agreement
 */
router.post('/documents/:relationshipId/agreement', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { userId } = req.user;
    const { variables = {} } = req.body;
    
    console.log(`📝 Generating umbrella agreement for relationship: ${relationshipId}`);
    
    // Verify user has access to this relationship
    const relationship = await umbrellaService.getUmbrellaRelationship(relationshipId);
    if (!relationship || (relationship.referrerId !== userId && relationship.referredId !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this relationship'
      });
    }
    
    const document = await umbrellaLegalService.generateUmbrellaAgreement(relationshipId, variables);
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error generating umbrella agreement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate umbrella agreement',
      error: error.message
    });
  }
});

/**
 * Generate revenue sharing terms
 * POST /api/umbrella/documents/:relationshipId/revenue-terms
 */
router.post('/documents/:relationshipId/revenue-terms', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { userId } = req.user;
    const { variables = {} } = req.body;
    
    console.log(`💰 Generating revenue sharing terms for relationship: ${relationshipId}`);
    
    // Verify user has access to this relationship
    const relationship = await umbrellaService.getUmbrellaRelationship(relationshipId);
    if (!relationship || (relationship.referrerId !== userId && relationship.referredId !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this relationship'
      });
    }
    
    const document = await umbrellaLegalService.generateRevenueSharingTerms(relationshipId, variables);
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error generating revenue sharing terms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue sharing terms',
      error: error.message
    });
  }
});

/**
 * Sign umbrella document
 * POST /api/umbrella/documents/:documentId/sign
 */
router.post('/documents/:documentId/sign', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { userId } = req.user;
    const { signatureData } = req.body;
    
    console.log(`✍️ Signing umbrella document: ${documentId}`);
    
    const signature = await umbrellaLegalService.signUmbrellaDocument(
      documentId, 
      userId, 
      {
        ...signatureData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    );
    
    res.json({
      success: true,
      data: signature
    });
  } catch (error) {
    console.error('Error signing umbrella document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign umbrella document',
      error: error.message
    });
  }
});

/**
 * Generate termination notice
 * POST /api/umbrella/documents/:relationshipId/termination
 */
router.post('/documents/:relationshipId/termination', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { userId } = req.user;
    const { reason } = req.body;
    
    console.log(`🚫 Generating termination notice for relationship: ${relationshipId}`);
    
    // Verify user has access to this relationship
    const relationship = await umbrellaService.getUmbrellaRelationship(relationshipId);
    if (!relationship || (relationship.referrerId !== userId && relationship.referredId !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this relationship'
      });
    }
    
    const document = await umbrellaLegalService.generateTerminationNotice(
      relationshipId, 
      reason, 
      userId
    );
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error generating termination notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate termination notice',
      error: error.message
    });
  }
});

/**
 * Get revenue analytics
 * GET /api/umbrella/revenue/analytics
 */
router.get('/revenue/analytics', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = 'monthly' } = req.query;
    
    console.log(`📊 Getting revenue analytics for user: ${userId}, period: ${period}`);
    
    const analytics = await umbrellaRevenueService.getRevenueAnalytics(userId, period);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics',
      error: error.message
    });
  }
});

/**
 * Get network analytics
 * GET /api/umbrella/analytics/network
 */
router.get('/analytics/network', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = 'monthly' } = req.query;
    
    console.log(`🌐 Getting network analytics for user: ${userId}, period: ${period}`);
    
    const analytics = await umbrellaRevenueService.getNetworkAnalytics(userId, period);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting network analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network analytics',
      error: error.message
    });
  }
});

/**
 * Process revenue shares for payment
 * POST /api/umbrella/revenue/process
 */
router.post('/revenue/process', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { shareIds } = req.body;
    
    console.log(`💳 Processing revenue shares for user: ${userId}, shares: ${shareIds.join(', ')}`);
    
    // Verify user owns these shares
    const shares = await umbrellaRevenueService.getRevenueShares(userId, {
      id: { in: shareIds }
    });
    
    if (shares.length !== shareIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to some revenue shares'
      });
    }
    
    const processedShares = await umbrellaRevenueService.processRevenueShares(shareIds);
    
    res.json({
      success: true,
      data: processedShares
    });
  } catch (error) {
    console.error('Error processing revenue shares:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process revenue shares',
      error: error.message
    });
  }
});

module.exports = router;
