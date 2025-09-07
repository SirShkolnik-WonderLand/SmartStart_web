/**
 * Legal RBAC Middleware
 * Integrates legal document compliance with RBAC access control
 */

const LegalFrameworkService = require('../services/legal-framework');

const legalService = new LegalFrameworkService();

/**
 * Middleware to require specific RBAC level with legal compliance
 */
const requireRbacWithLegal = (requiredRbacLevel, options = {}) => {
  return async (req, res, next) => {
    try {
      // Check if user has required RBAC level
      if (!req.user || !req.user.roles || !req.user.roles.includes(requiredRbacLevel)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient RBAC permissions',
          required: requiredRbacLevel,
          current: req.user?.roles || []
        });
      }

      // Check document compliance for this RBAC level
      const compliance = await legalService.checkUserDocumentCompliance(
        req.user.id, 
        requiredRbacLevel
      );

      if (!compliance.compliant) {
        return res.status(403).json({
          success: false,
          error: 'Legal document compliance required',
          data: {
            rbacLevel: requiredRbacLevel,
            missingDocuments: compliance.missingDocuments,
            requiredDocuments: compliance.requiredDocuments,
            compliance
          }
        });
      }

      // Add compliance info to request
      req.legalCompliance = compliance;
      req.rbacLevel = requiredRbacLevel;
      
      next();
    } catch (error) {
      console.error('Error in legal RBAC middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify legal RBAC compliance'
      });
    }
  };
};

/**
 * Middleware to require specific action with legal compliance
 */
const requireActionWithLegal = (action, options = {}) => {
  return async (req, res, next) => {
    try {
      const result = await legalService.canUserPerformAction(
        req.user.id, 
        action, 
        { ...req.body, ...req.query }
      );

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Action not permitted - legal compliance required',
          data: {
            action,
            missingDocuments: result.missingDocuments,
            requiredDocuments: result.requiredDocuments,
            compliance: result.compliance
          }
        });
      }

      // Add action compliance info to request
      req.actionCompliance = result;
      req.allowedAction = action;
      
      next();
    } catch (error) {
      console.error('Error in action legal middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify action legal compliance'
      });
    }
  };
};

/**
 * Middleware to require security tier access
 */
const requireSecurityTier = (tier, options = {}) => {
  return async (req, res, next) => {
    try {
      const tierRequirements = legalService.getSecurityTierRequirements(tier);
      
      if (!tierRequirements) {
        return res.status(400).json({
          success: false,
          error: 'Invalid security tier',
          tier
        });
      }

      // Check if user has required documents for this tier
      const requiredDocuments = tierRequirements.documents;
      const compliance = await legalService.checkUserDocumentCompliance(
        req.user.id,
        `TIER_${tier.split('_')[1]}_ACCESS`
      );

      if (!compliance.compliant) {
        return res.status(403).json({
          success: false,
          error: 'Security tier access requires additional legal compliance',
          data: {
            tier,
            tierRequirements,
            missingDocuments: compliance.missingDocuments,
            requiredDocuments: compliance.requiredDocuments
          }
        });
      }

      // Add tier info to request
      req.securityTier = tier;
      req.tierRequirements = tierRequirements;
      req.tierCompliance = compliance;
      
      next();
    } catch (error) {
      console.error('Error in security tier middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify security tier access'
      });
    }
  };
};

/**
 * Middleware to check venture access with legal compliance
 */
const requireVentureAccess = (accessLevel = 'READ', options = {}) => {
  return async (req, res, next) => {
    try {
      const ventureId = req.params.ventureId || req.params.id;
      
      if (!ventureId) {
        return res.status(400).json({
          success: false,
          error: 'Venture ID is required'
        });
      }

      // Determine required action based on access level
      let action;
      switch (accessLevel.toUpperCase()) {
        case 'READ':
          action = 'JOIN_VENTURE';
          break;
        case 'WRITE':
        case 'EDIT':
          action = 'JOIN_VENTURE';
          break;
        case 'ADMIN':
        case 'OWNER':
          action = 'CREATE_VENTURE';
          break;
        default:
          action = 'JOIN_VENTURE';
      }

      const result = await legalService.canUserPerformAction(
        req.user.id,
        action,
        { ventureId, accessLevel }
      );

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Venture access requires legal compliance',
          data: {
            ventureId,
            accessLevel,
            action,
            missingDocuments: result.missingDocuments,
            requiredDocuments: result.requiredDocuments
          }
        });
      }

      // Add venture access info to request
      req.ventureAccess = {
        ventureId,
        accessLevel,
        action,
        compliance: result
      };
      
      next();
    } catch (error) {
      console.error('Error in venture access middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify venture access'
      });
    }
  };
};

/**
 * Middleware to require subscription with legal compliance
 */
const requireSubscriptionWithLegal = (options = {}) => {
  return async (req, res, next) => {
    try {
      const result = await legalService.canUserPerformAction(
        req.user.id,
        'SUBSCRIBE',
        options
      );

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Subscription requires legal compliance',
          data: {
            missingDocuments: result.missingDocuments,
            requiredDocuments: result.requiredDocuments,
            compliance: result.compliance
          }
        });
      }

      // Add subscription compliance info to request
      req.subscriptionCompliance = result;
      
      next();
    } catch (error) {
      console.error('Error in subscription legal middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify subscription legal compliance'
      });
    }
  };
};

/**
 * Middleware to require admin access with legal compliance
 */
const requireAdminWithLegal = (adminType = 'GENERAL', options = {}) => {
  return async (req, res, next) => {
    try {
      let action;
      switch (adminType.toUpperCase()) {
        case 'BILLING':
          action = 'BILLING_ADMIN';
          break;
        case 'SECURITY':
          action = 'SECURITY_ADMIN';
          break;
        case 'LEGAL':
          action = 'LEGAL_ADMIN';
          break;
        default:
          action = 'ADMIN';
      }

      const result = await legalService.canUserPerformAction(
        req.user.id,
        action,
        options
      );

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Admin access requires legal compliance',
          data: {
            adminType,
            action,
            missingDocuments: result.missingDocuments,
            requiredDocuments: result.requiredDocuments,
            compliance: result.compliance
          }
        });
      }

      // Add admin compliance info to request
      req.adminCompliance = result;
      req.adminType = adminType;
      
      next();
    } catch (error) {
      console.error('Error in admin legal middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify admin legal compliance'
      });
    }
  };
};

/**
 * Utility function to get user's legal status
 */
const getUserLegalStatus = async (userId) => {
  try {
    const status = {
      userId,
      rbacLevels: {},
      actions: {},
      securityTiers: {},
      overallCompliant: true
    };

    // Check compliance for each RBAC level
    const rbacLevels = [
      'MEMBER', 'SUBSCRIBER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT',
      'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS',
      'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'
    ];

    for (const level of rbacLevels) {
      const compliance = await legalService.checkUserDocumentCompliance(userId, level);
      status.rbacLevels[level] = compliance;
      if (!compliance.compliant) {
        status.overallCompliant = false;
      }
    }

    // Check compliance for key actions
    const actions = [
      'REGISTER', 'SUBSCRIBE', 'CREATE_VENTURE', 'JOIN_VENTURE',
      'ACCESS_TIER_1', 'ACCESS_TIER_2', 'ACCESS_TIER_3'
    ];

    for (const action of actions) {
      const result = await legalService.canUserPerformAction(userId, action);
      status.actions[action] = result;
      if (!result.allowed) {
        status.overallCompliant = false;
      }
    }

    // Check security tier compliance
    const tiers = ['TIER_1', 'TIER_2', 'TIER_3'];
    for (const tier of tiers) {
      const requirements = legalService.getSecurityTierRequirements(tier);
      if (requirements) {
        const compliance = await legalService.checkUserDocumentCompliance(
          userId,
          `${tier}_ACCESS`
        );
        status.securityTiers[tier] = {
          requirements,
          compliance
        };
        if (!compliance.compliant) {
          status.overallCompliant = false;
        }
      }
    }

    return status;
  } catch (error) {
    console.error('Error getting user legal status:', error);
    throw error;
  }
};

module.exports = {
  requireRbacWithLegal,
  requireActionWithLegal,
  requireSecurityTier,
  requireVentureAccess,
  requireSubscriptionWithLegal,
  requireAdminWithLegal,
  getUserLegalStatus
};
