/**
 * SmartStart Private Umbrella System - Security API
 * Security and compliance endpoints for umbrella operations
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const UmbrellaSecurityMiddleware = require('../middleware/umbrella-security');

const router = express.Router();

// Initialize security middleware
const securityMiddleware = new UmbrellaSecurityMiddleware();

// ===== HEALTH CHECK =====

router.get('/health', async (req, res) => {
  try {
    const healthStatus = await securityMiddleware.monitorSystemHealth();
    
    res.json({
      status: 'healthy',
      service: 'umbrella-security-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      security: healthStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'umbrella-security-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== SECURITY MONITORING =====

/**
 * Get security audit log
 * GET /api/umbrella/security/audit
 */
router.get('/audit', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 50, severity, startDate, endDate } = req.query;
    
    console.log(`🔒 Getting security audit log for user: ${userId}`);
    
    // Filter audit log based on parameters
    let filteredLog = securityMiddleware.auditLog;
    
    if (severity) {
      filteredLog = filteredLog.filter(event => event.severity === severity);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredLog = filteredLog.filter(event => new Date(event.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredLog = filteredLog.filter(event => new Date(event.timestamp) <= end);
    }
    
    // Limit results
    const limitedLog = filteredLog.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: limitedLog,
      count: limitedLog.length,
      total: filteredLog.length
    });
  } catch (error) {
    console.error('❌ Error getting security audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security audit log',
      error: error.message
    });
  }
});

/**
 * Get security statistics
 * GET /api/umbrella/security/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '24h' } = req.query;
    
    console.log(`📊 Getting security statistics for user: ${userId} (period: ${period})`);
    
    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Filter events by time range
    const recentEvents = securityMiddleware.auditLog.filter(
      event => new Date(event.timestamp) >= startTime
    );
    
    // Calculate statistics
    const stats = {
      totalEvents: recentEvents.length,
      eventsBySeverity: {
        HIGH: recentEvents.filter(e => e.severity === 'HIGH').length,
        MEDIUM: recentEvents.filter(e => e.severity === 'MEDIUM').length,
        LOW: recentEvents.filter(e => e.severity === 'LOW').length,
        INFO: recentEvents.filter(e => e.severity === 'INFO').length
      },
      eventsByType: {},
      topEventTypes: [],
      securityScore: 0
    };
    
    // Count events by type
    recentEvents.forEach(event => {
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
    });
    
    // Get top event types
    stats.topEventTypes = Object.entries(stats.eventsByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
    
    // Calculate security score (0-100)
    const highSeverityEvents = stats.eventsBySeverity.HIGH;
    const mediumSeverityEvents = stats.eventsBySeverity.MEDIUM;
    
    if (highSeverityEvents === 0 && mediumSeverityEvents === 0) {
      stats.securityScore = 100;
    } else if (highSeverityEvents === 0) {
      stats.securityScore = Math.max(0, 100 - (mediumSeverityEvents * 10));
    } else {
      stats.securityScore = Math.max(0, 100 - (highSeverityEvents * 20) - (mediumSeverityEvents * 5));
    }
    
    res.json({
      success: true,
      data: stats,
      period,
      startTime,
      endTime: now
    });
  } catch (error) {
    console.error('❌ Error getting security statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security statistics',
      error: error.message
    });
  }
});

// ===== COMPLIANCE CHECKS =====

/**
 * Check GDPR compliance status
 * GET /api/umbrella/security/compliance/gdpr
 */
router.get('/compliance/gdpr', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    console.log(`🔒 Checking GDPR compliance for user: ${userId}`);
    
    // Check user consent status
    const userConsent = await securityMiddleware.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        gdprConsent: true,
        dataProcessingConsent: true,
        marketingConsent: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!userConsent) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const compliance = {
      gdprConsent: userConsent.gdprConsent || false,
      dataProcessingConsent: userConsent.dataProcessingConsent || false,
      marketingConsent: userConsent.marketingConsent || false,
      compliant: (userConsent.gdprConsent && userConsent.dataProcessingConsent) || false,
      lastUpdated: userConsent.updatedAt,
      dataRetentionPeriod: '7 years', // As per business requirements
      rightToErasure: true,
      dataPortability: true
    };
    
    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    console.error('❌ Error checking GDPR compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check GDPR compliance',
      error: error.message
    });
  }
});

/**
 * Check financial compliance status
 * GET /api/umbrella/security/compliance/financial
 */
router.get('/compliance/financial', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    console.log(`💰 Checking financial compliance for user: ${userId}`);
    
    // Get user's financial activity
    const revenueShares = await securityMiddleware.prisma.revenueShare.findMany({
      where: { referrerId: userId },
      select: {
        id: true,
        shareAmount: true,
        projectRevenue: true,
        currency: true,
        status: true,
        calculatedAt: true
      },
      orderBy: { calculatedAt: 'desc' },
      take: 100
    });
    
    // Calculate compliance metrics
    const totalRevenue = revenueShares.reduce((sum, share) => sum + share.projectRevenue, 0);
    const totalShares = revenueShares.reduce((sum, share) => sum + share.shareAmount, 0);
    
    const highValueTransactions = revenueShares.filter(share => share.shareAmount > 10000);
    const suspiciousActivity = revenueShares.filter(share => 
      share.shareAmount > 50000 || share.projectRevenue > 100000
    );
    
    const compliance = {
      totalTransactions: revenueShares.length,
      totalRevenue,
      totalShares,
      highValueTransactions: highValueTransactions.length,
      suspiciousActivity: suspiciousActivity.length,
      complianceScore: 100 - (suspiciousActivity.length * 10),
      regulatoryThresholds: {
        USD: 10000,
        EUR: 9000,
        CAD: 13000
      },
      reportingRequired: highValueTransactions.length > 0,
      lastAudit: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    console.error('❌ Error checking financial compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check financial compliance',
      error: error.message
    });
  }
});

// ===== SECURITY CONFIGURATION =====

/**
 * Get security configuration
 * GET /api/umbrella/security/config
 */
router.get('/config', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    console.log(`⚙️ Getting security configuration for user: ${userId}`);
    
    const config = {
      rateLimits: {
        umbrellaOperations: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100
        },
        revenueCalculations: {
          windowMs: 60 * 60 * 1000, // 1 hour
          max: 50
        }
      },
      securityFeatures: {
        auditLogging: true,
        gdprCompliance: true,
        financialCompliance: true,
        rateLimiting: true,
        dataEncryption: true
      },
      permissions: {
        canCreateRelationships: true,
        canViewAnalytics: true,
        canManageDocuments: true,
        canCalculateRevenue: true
      },
      compliance: {
        gdpr: true,
        financial: true,
        dataRetention: '7 years',
        auditTrail: 'permanent'
      }
    };
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('❌ Error getting security configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security configuration',
      error: error.message
    });
  }
});

// ===== SECURITY ALERTS =====

/**
 * Get security alerts
 * GET /api/umbrella/security/alerts
 */
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { severity = 'HIGH', limit = 10 } = req.query;
    
    console.log(`🚨 Getting security alerts for user: ${userId}`);
    
    // Filter high-severity events as alerts
    const alerts = securityMiddleware.auditLog
      .filter(event => event.severity === severity)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit))
      .map(event => ({
        id: event.timestamp,
        type: event.eventType,
        severity: event.severity,
        message: this.getAlertMessage(event.eventType),
        timestamp: event.timestamp,
        details: event.details
      }));
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Error getting security alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security alerts',
      error: error.message
    });
  }
});

/**
 * Get alert message for event type
 */
getAlertMessage(eventType) {
  const messages = {
    'UNAUTHORIZED_ACCESS_ATTEMPT': 'Unauthorized access attempt detected',
    'UNAUTHORIZED_ACTION_ATTEMPT': 'Unauthorized action attempt detected',
    'RATE_LIMIT_EXCEEDED': 'Rate limit exceeded',
    'HIGH_VALUE_TRANSACTION': 'High-value transaction detected',
    'SUSPICIOUS_ACTIVITY': 'Suspicious activity detected'
  };
  
  return messages[eventType] || 'Security event detected';
}

// ===== ERROR HANDLING =====

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Umbrella Security API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
router.use((error, req, res, next) => {
  console.error('❌ Umbrella Security API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
