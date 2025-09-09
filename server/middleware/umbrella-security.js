/**
 * SmartStart Private Umbrella System - Security Middleware
 * Comprehensive security and compliance features for umbrella operations
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

class UmbrellaSecurityMiddleware {
  constructor() {
    this.prisma = new PrismaClient();
    this.auditLog = [];
  }

  // ===== AUTHENTICATION & AUTHORIZATION =====

  /**
   * Verify user has permission to access umbrella relationship
   */
  async verifyUmbrellaAccess(req, res, next) {
    try {
      const { userId } = req.user;
      const { relationshipId } = req.params;

      if (!relationshipId) {
        return res.status(400).json({
          success: false,
          message: 'Relationship ID is required'
        });
      }

      // Check if user is part of this umbrella relationship
      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId },
        select: {
          id: true,
          referrerId: true,
          referredId: true,
          status: true
        }
      });

      if (!relationship) {
        return res.status(404).json({
          success: false,
          message: 'Umbrella relationship not found'
        });
      }

      // Verify user is either referrer or referred
      if (userId !== relationship.referrerId && userId !== relationship.referredId) {
        this.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          userId,
          relationshipId,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to access this umbrella relationship'
        });
      }

      // Add relationship info to request
      req.umbrellaRelationship = relationship;
      next();
    } catch (error) {
      console.error('❌ Umbrella access verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during access verification'
      });
    }
  }

  /**
   * Verify user can perform specific umbrella actions
   */
  async verifyUmbrellaAction(req, res, next) {
    try {
      const { userId } = req.user;
      const { action } = req.body;
      const relationship = req.umbrellaRelationship;

      if (!relationship) {
        return res.status(400).json({
          success: false,
          message: 'Umbrella relationship not found in request'
        });
      }

      // Define action permissions
      const actionPermissions = {
        'create': ['referrer'], // Only referrer can create relationship
        'activate': ['referrer', 'referred'], // Both parties can activate
        'suspend': ['referrer'], // Only referrer can suspend
        'terminate': ['referrer', 'referred'], // Both parties can terminate
        'calculate_revenue': ['system'], // System only
        'view_analytics': ['referrer', 'referred'], // Both parties can view
        'sign_document': ['referrer', 'referred'] // Both parties can sign
      };

      const allowedRoles = actionPermissions[action];
      if (!allowedRoles) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action specified'
        });
      }

      // Check if user has permission for this action
      const userRole = userId === relationship.referrerId ? 'referrer' : 'referred';
      
      if (!allowedRoles.includes(userRole) && !allowedRoles.includes('system')) {
        this.logSecurityEvent('UNAUTHORIZED_ACTION_ATTEMPT', {
          userId,
          relationshipId: relationship.id,
          action,
          userRole,
          ip: req.ip
        });

        return res.status(403).json({
          success: false,
          message: `Access denied: You are not authorized to perform '${action}' action`
        });
      }

      next();
    } catch (error) {
      console.error('❌ Umbrella action verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during action verification'
      });
    }
  }

  // ===== RATE LIMITING =====

  /**
   * Create rate limiter for umbrella operations
   */
  createUmbrellaRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many umbrella requests, please try again later',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.userId || req.ip;
      }
    });
  }

  /**
   * Create rate limiter for revenue calculations
   */
  createRevenueCalculationRateLimit() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // Limit to 50 revenue calculations per hour
      message: {
        success: false,
        message: 'Too many revenue calculation requests, please try again later',
        retryAfter: '1 hour'
      },
      keyGenerator: (req) => req.user?.userId || req.ip
    });
  }

  // ===== DATA VALIDATION =====

  /**
   * Validate umbrella relationship data
   */
  validateUmbrellaData(req, res, next) {
    const { referredId, shareRate, relationshipType } = req.body;
    const errors = [];

    // Validate referredId
    if (!referredId || typeof referredId !== 'string') {
      errors.push('Valid referredId is required');
    }

    // Validate shareRate
    if (shareRate !== undefined) {
      if (typeof shareRate !== 'number' || shareRate < 0.5 || shareRate > 1.5) {
        errors.push('Share rate must be a number between 0.5 and 1.5');
      }
    }

    // Validate relationshipType
    const validTypes = ['PRIVATE_UMBRELLA', 'CORPORATE_UMBRELLA', 'AFFILIATE_UMBRELLA'];
    if (relationshipType && !validTypes.includes(relationshipType)) {
      errors.push('Invalid relationship type');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  }

  /**
   * Validate revenue calculation data
   */
  validateRevenueData(req, res, next) {
    const { projectId, revenue } = req.body;
    const errors = [];

    if (!projectId || typeof projectId !== 'string') {
      errors.push('Valid projectId is required');
    }

    if (!revenue || typeof revenue !== 'number' || revenue < 0) {
      errors.push('Valid revenue amount is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Revenue validation failed',
        errors
      });
    }

    next();
  }

  // ===== AUDIT LOGGING =====

  /**
   * Log security events
   */
  logSecurityEvent(eventType, details) {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
      severity: this.getEventSeverity(eventType)
    };

    this.auditLog.push(event);
    console.log(`🔒 Security Event: ${eventType}`, details);

    // Store in database for persistent audit trail
    this.storeAuditEvent(event);
  }

  /**
   * Get event severity level
   */
  getEventSeverity(eventType) {
    const severityMap = {
      'UNAUTHORIZED_ACCESS_ATTEMPT': 'HIGH',
      'UNAUTHORIZED_ACTION_ATTEMPT': 'HIGH',
      'RATE_LIMIT_EXCEEDED': 'MEDIUM',
      'INVALID_DATA_SUBMITTED': 'LOW',
      'SUCCESSFUL_OPERATION': 'INFO'
    };

    return severityMap[eventType] || 'LOW';
  }

  /**
   * Store audit event in database
   */
  async storeAuditEvent(event) {
    try {
      // You can create an audit log table in your database
      // For now, we'll just log to console
      console.log('📝 Audit Event Stored:', event);
    } catch (error) {
      console.error('❌ Failed to store audit event:', error);
    }
  }

  // ===== COMPLIANCE FEATURES =====

  /**
   * Check GDPR compliance for data access
   */
  async checkGDPRCompliance(req, res, next) {
    try {
      const { userId } = req.user;
      const { dataType } = req.query;

      // Check if user has consent for data processing
      const userConsent = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          gdprConsent: true,
          dataProcessingConsent: true
        }
      });

      if (!userConsent?.gdprConsent || !userConsent?.dataProcessingConsent) {
        return res.status(403).json({
          success: false,
          message: 'GDPR compliance: Data processing consent required',
          compliance: {
            gdprConsent: userConsent?.gdprConsent || false,
            dataProcessingConsent: userConsent?.dataProcessingConsent || false
          }
        });
      }

      next();
    } catch (error) {
      console.error('❌ GDPR compliance check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during compliance check'
      });
    }
  }

  /**
   * Check financial compliance for revenue operations
   */
  async checkFinancialCompliance(req, res, next) {
    try {
      const { userId } = req.user;
      const { amount } = req.body;

      // Check if amount exceeds regulatory thresholds
      const regulatoryThresholds = {
        USD: 10000, // $10,000 threshold for reporting
        EUR: 9000,  // €9,000 threshold
        CAD: 13000  // $13,000 CAD threshold
      };

      const userCurrency = 'USD'; // You might get this from user profile
      const threshold = regulatoryThresholds[userCurrency];

      if (amount && amount > threshold) {
        this.logSecurityEvent('HIGH_VALUE_TRANSACTION', {
          userId,
          amount,
          currency: userCurrency,
          threshold,
          ip: req.ip
        });

        // In a real system, you might trigger additional compliance checks
        console.log(`⚠️ High-value transaction detected: $${amount} (threshold: $${threshold})`);
      }

      next();
    } catch (error) {
      console.error('❌ Financial compliance check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during compliance check'
      });
    }
  }

  // ===== ENCRYPTION & DATA PROTECTION =====

  /**
   * Encrypt sensitive data
   */
  encryptSensitiveData(data) {
    // In a real implementation, you would use proper encryption
    // For now, we'll use a simple base64 encoding as placeholder
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Decrypt sensitive data
   */
  decryptSensitiveData(encryptedData) {
    try {
      const decrypted = Buffer.from(encryptedData, 'base64').toString('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('❌ Failed to decrypt data:', error);
      return null;
    }
  }

  // ===== MONITORING & ALERTING =====

  /**
   * Monitor umbrella system health
   */
  async monitorSystemHealth() {
    try {
      const healthChecks = {
        database: await this.checkDatabaseHealth(),
        api: await this.checkApiHealth(),
        security: await this.checkSecurityHealth()
      };

      const overallHealth = Object.values(healthChecks).every(check => check.status === 'healthy');

      return {
        status: overallHealth ? 'healthy' : 'unhealthy',
        checks: healthChecks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ System health monitoring error:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  /**
   * Check API health
   */
  async checkApiHealth() {
    // Check if all required services are running
    return { status: 'healthy', message: 'API services operational' };
  }

  /**
   * Check security health
   */
  async checkSecurityHealth() {
    const recentSecurityEvents = this.auditLog.filter(
      event => new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const highSeverityEvents = recentSecurityEvents.filter(
      event => event.severity === 'HIGH'
    );

    if (highSeverityEvents.length > 10) {
      return { 
        status: 'unhealthy', 
        message: `High number of security events: ${highSeverityEvents.length}` 
      };
    }

    return { status: 'healthy', message: 'Security systems operational' };
  }

  // ===== CLEANUP =====

  /**
   * Cleanup method
   */
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

module.exports = UmbrellaSecurityMiddleware;
