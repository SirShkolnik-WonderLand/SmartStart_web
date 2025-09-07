/**
 * State Machine Manager API Routes
 * Provides comprehensive endpoints for managing all state machines
 * Handles user journeys, ventures, legal documents, subscriptions, teams, and compliance
 */

const express = require('express');
const router = express.Router();
const StateMachineManager = require('../state-machines/StateMachineManager');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Initialize state machine manager
const stateMachineManager = new StateMachineManager();

// ===== CORE STATE MACHINE MANAGEMENT =====

/**
 * POST /api/state-machines/:type/:id/create
 * Create a new state machine instance
 */
router.post('/:type/:id/create', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const initialContext = req.body;

    // Validate state machine type
    const validTypes = ['legal', 'userJourney', 'venture', 'subscription', 'team', 'compliance'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid state machine type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const machine = await stateMachineManager.createStateMachine(type, id, initialContext);

    res.json({
      success: true,
      message: `${type} state machine created successfully`,
      type,
      id,
      currentState: machine.state.value,
      context: machine.state.context
    });
  } catch (error) {
    console.error('Create state machine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create state machine',
      error: error.message
    });
  }
});

/**
 * POST /api/state-machines/:type/:id/event
 * Send an event to a state machine
 */
router.post('/:type/:id/event', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { event, metadata = {} } = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: event'
      });
    }

    const eventData = {
      type: event,
      metadata: {
        ...metadata,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      }
    };

    const state = await stateMachineManager.sendEvent(type, id, eventData);

    res.json({
      success: true,
      message: 'Event sent successfully',
      type,
      id,
      event,
      currentState: state.value,
      context: state.context
    });
  } catch (error) {
    console.error('Send event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send event',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/:type/:id/state
 * Get current state of a state machine
 */
router.get('/:type/:id/state', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;

    const state = stateMachineManager.getState(type, id);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'State machine not found'
      });
    }

    res.json({
      success: true,
      type,
      id,
      currentState: state.currentState,
      context: state.context,
      history: state.history,
      createdAt: state.createdAt,
      lastActivity: state.lastActivity
    });
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get state',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/:type/:id/visualization
 * Get state machine visualization data
 */
router.get('/:type/:id/visualization', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;

    const visualization = stateMachineManager.getVisualization(type, id);

    if (!visualization) {
      return res.status(404).json({
        success: false,
        message: 'State machine not found'
      });
    }

    res.json({
      success: true,
      type,
      id,
      visualization
    });
  } catch (error) {
    console.error('Get visualization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get visualization',
      error: error.message
    });
  }
});

// ===== BULK OPERATIONS =====

/**
 * GET /api/state-machines/:type/active
 * Get all active state machines of a type
 */
router.get('/:type/active', authenticateToken, requireRole(['ADMIN', 'LEGAL_ADMIN']), async (req, res) => {
  try {
    const { type } = req.params;

    const activeMachines = stateMachineManager.getActiveMachines(type);

    res.json({
      success: true,
      type,
      activeMachines,
      count: activeMachines.length
    });
  } catch (error) {
    console.error('Get active machines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active machines',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/user/:userId/comprehensive
 * Get comprehensive user state across all machines
 */
router.get('/user/:userId/comprehensive', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own comprehensive state unless they're admin
    if (req.user.id !== userId && !req.user.roles?.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this user\'s comprehensive state'
      });
    }

    const comprehensiveState = await stateMachineManager.getUserComprehensiveState(userId);

    res.json({
      success: true,
      userId,
      comprehensiveState
    });
  } catch (error) {
    console.error('Get comprehensive user state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comprehensive user state',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/venture/:ventureId/comprehensive
 * Get comprehensive venture state across all machines
 */
router.get('/venture/:ventureId/comprehensive', authenticateToken, async (req, res) => {
  try {
    const { ventureId } = req.params;

    const comprehensiveState = await stateMachineManager.getVentureComprehensiveState(ventureId);

    res.json({
      success: true,
      ventureId,
      comprehensiveState
    });
  } catch (error) {
    console.error('Get comprehensive venture state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comprehensive venture state',
      error: error.message
    });
  }
});

// ===== SPECIALIZED STATE MACHINE ACCESS =====

/**
 * GET /api/state-machines/legal/service
 * Get legal state machine service
 */
router.get('/legal/service', authenticateToken, requireRole(['ADMIN', 'LEGAL_ADMIN']), async (req, res) => {
  try {
    const legalService = stateMachineManager.getLegalStateMachine();

    res.json({
      success: true,
      message: 'Legal state machine service accessed',
      service: {
        name: 'LegalStateMachine',
        activeMachines: legalService.activeMachines?.size || 0
      }
    });
  } catch (error) {
    console.error('Get legal service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access legal service',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/user-journey/service
 * Get user journey state machine service
 */
router.get('/user-journey/service', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const userJourneyService = stateMachineManager.getUserJourneyStateMachine();

    res.json({
      success: true,
      message: 'User journey state machine service accessed',
      service: {
        name: 'UserJourneyStateMachine',
        activeMachines: userJourneyService.activeMachines?.size || 0
      }
    });
  } catch (error) {
    console.error('Get user journey service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access user journey service',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/venture/service
 * Get venture state machine service
 */
router.get('/venture/service', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const ventureService = stateMachineManager.getVentureStateMachine();

    res.json({
      success: true,
      message: 'Venture state machine service accessed',
      service: {
        name: 'VentureStateMachine',
        activeMachines: ventureService.activeMachines?.size || 0
      }
    });
  } catch (error) {
    console.error('Get venture service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access venture service',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/subscription/service
 * Get subscription state machine service
 */
router.get('/subscription/service', authenticateToken, requireRole(['ADMIN', 'BILLING_ADMIN']), async (req, res) => {
  try {
    const subscriptionService = stateMachineManager.getSubscriptionStateMachine();

    res.json({
      success: true,
      message: 'Subscription state machine service accessed',
      service: {
        name: 'SubscriptionStateMachine',
        activeMachines: subscriptionService.activeMachines?.size || 0
      }
    });
  } catch (error) {
    console.error('Get subscription service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access subscription service',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/team/service
 * Get team state machine service
 */
router.get('/team/service', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const teamService = stateMachineManager.getTeamStateMachine();

    res.json({
      success: true,
      message: 'Team state machine service accessed',
      service: {
        name: 'TeamStateMachine',
        activeMachines: teamService.activeMachines?.size || 0
      }
    });
  } catch (error) {
    console.error('Get team service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access team service',
      error: error.message
    });
  }
});

/**
 * GET /api/state-machines/compliance/service
 * Get compliance state machine service
 */
router.get('/compliance/service', authenticateToken, requireRole(['ADMIN', 'LEGAL_ADMIN']), async (req, res) => {
  try {
    const complianceService = stateMachineManager.getComplianceStateMachine();

    res.json({
      success: true,
      message: 'Compliance state machine service accessed',
      service: {
        name: 'ComplianceStateMachine',
        activeMachines: complianceService.activeMachines?.size || 0
      }
    });
  } catch (error) {
    console.error('Get compliance service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access compliance service',
      error: error.message
    });
  }
});

// ===== SYSTEM HEALTH AND MAINTENANCE =====

/**
 * GET /api/state-machines/health
 * Get system health and statistics
 */
router.get('/health', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const health = stateMachineManager.getSystemHealth();

    res.json({
      success: true,
      health
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: error.message
    });
  }
});

/**
 * POST /api/state-machines/cleanup
 * Cleanup completed state machines
 */
router.post('/cleanup', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    stateMachineManager.cleanup();
    
    res.json({
      success: true,
      message: 'State machine cleanup completed'
    });
  } catch (error) {
    console.error('State machine cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup state machines',
      error: error.message
    });
  }
});

/**
 * POST /api/state-machines/shutdown
 * Graceful shutdown of state machine manager
 */
router.post('/shutdown', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    await stateMachineManager.shutdown();
    
    res.json({
      success: true,
      message: 'State machine manager shutdown completed'
    });
  } catch (error) {
    console.error('State machine shutdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to shutdown state machine manager',
      error: error.message
    });
  }
});

// ===== ANALYTICS AND REPORTING =====

/**
 * GET /api/state-machines/analytics/overview
 * Get overview analytics for all state machines
 */
router.get('/analytics/overview', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const health = stateMachineManager.getSystemHealth();
    
    // Get analytics from each service
    const analytics = {
      system: health,
      services: {}
    };

    // Add service-specific analytics
    const services = ['legal', 'userJourney', 'venture', 'subscription', 'team', 'compliance'];
    for (const serviceType of services) {
      const service = stateMachineManager.stateMachines[serviceType];
      if (service && service.getAnalytics) {
        analytics.services[serviceType] = await service.getAnalytics();
      }
    }

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview',
      error: error.message
    });
  }
});

module.exports = router;
