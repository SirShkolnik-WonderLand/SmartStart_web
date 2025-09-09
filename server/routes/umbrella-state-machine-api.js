/**
 * SmartStart Umbrella State Machine API
 * API endpoints for managing umbrella state machine workflows
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const UmbrellaStateMachine = require('../state-machines/umbrella/UmbrellaStateMachine');

const router = express.Router();

// Initialize state machine instance
const umbrellaStateMachine = new UmbrellaStateMachine();

// ===== HEALTH CHECK =====

router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      service: 'umbrella-state-machine-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      activeMachines: umbrellaStateMachine.getAllStateMachines().length
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'umbrella-state-machine-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== STATE MACHINE MANAGEMENT =====

/**
 * Create umbrella state machine
 * POST /api/umbrella/state-machine/create
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { relationshipId, initialState = 'PENDING_AGREEMENT' } = req.body;
    const { userId } = req.user;
    
    console.log(`🌂 Creating umbrella state machine for relationship: ${relationshipId}`);
    
    if (!relationshipId) {
      return res.status(400).json({
        success: false,
        message: 'Relationship ID is required'
      });
    }
    
    const stateMachine = await umbrellaStateMachine.createStateMachine(relationshipId, initialState);
    
    res.status(201).json({
      success: true,
      data: stateMachine,
      message: 'Umbrella state machine created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating umbrella state machine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create umbrella state machine',
      error: error.message
    });
  }
});

/**
 * Get state machine for relationship
 * GET /api/umbrella/state-machine/:relationshipId
 */
router.get('/:relationshipId', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { userId } = req.user;
    
    console.log(`🌂 Getting umbrella state machine for relationship: ${relationshipId}`);
    
    const stateMachine = umbrellaStateMachine.getStateMachine(relationshipId);
    
    if (!stateMachine) {
      return res.status(404).json({
        success: false,
        message: 'State machine not found'
      });
    }
    
    res.json({
      success: true,
      data: stateMachine
    });
  } catch (error) {
    console.error('❌ Error getting umbrella state machine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get umbrella state machine',
      error: error.message
    });
  }
});

/**
 * Transition state machine to new state
 * POST /api/umbrella/state-machine/:relationshipId/transition
 */
router.post('/:relationshipId/transition', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { newState, action, metadata = {} } = req.body;
    const { userId } = req.user;
    
    console.log(`🌂 Transitioning umbrella state machine ${relationshipId} to ${newState}`);
    
    if (!newState || !action) {
      return res.status(400).json({
        success: false,
        message: 'New state and action are required'
      });
    }
    
    const stateMachine = await umbrellaStateMachine.transitionTo(
      relationshipId, 
      newState, 
      action, 
      metadata
    );
    
    res.json({
      success: true,
      data: stateMachine,
      message: `State machine transitioned to ${newState} successfully`
    });
  } catch (error) {
    console.error('❌ Error transitioning umbrella state machine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transition state machine',
      error: error.message
    });
  }
});

/**
 * Get available states and transitions
 * GET /api/umbrella/state-machine/states
 */
router.get('/states', authenticateToken, async (req, res) => {
  try {
    const states = umbrellaStateMachine.getStates();
    
    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('❌ Error getting umbrella states:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get umbrella states',
      error: error.message
    });
  }
});

/**
 * Get all active state machines
 * GET /api/umbrella/state-machine/active
 */
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeMachines = umbrellaStateMachine.getAllStateMachines();
    
    res.json({
      success: true,
      data: activeMachines,
      count: activeMachines.length
    });
  } catch (error) {
    console.error('❌ Error getting active state machines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active state machines',
      error: error.message
    });
  }
});

// ===== STATE-SPECIFIC ACTIONS =====

/**
 * Generate umbrella agreement
 * POST /api/umbrella/state-machine/:relationshipId/generate-agreement
 */
router.post('/:relationshipId/generate-agreement', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { userId } = req.user;
    
    console.log(`📄 Generating umbrella agreement for relationship: ${relationshipId}`);
    
    const document = await umbrellaStateMachine.generateUmbrellaAgreement(relationshipId);
    
    res.json({
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
 * Activate umbrella relationship
 * POST /api/umbrella/state-machine/:relationshipId/activate
 */
router.post('/:relationshipId/activate', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { userId } = req.user;
    
    console.log(`✅ Activating umbrella relationship: ${relationshipId}`);
    
    const stateMachine = await umbrellaStateMachine.transitionTo(
      relationshipId, 
      'ACTIVE', 
      'activate'
    );
    
    res.json({
      success: true,
      data: stateMachine,
      message: 'Umbrella relationship activated successfully'
    });
  } catch (error) {
    console.error('❌ Error activating umbrella relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate umbrella relationship',
      error: error.message
    });
  }
});

/**
 * Calculate revenue shares
 * POST /api/umbrella/state-machine/:relationshipId/calculate-revenue
 */
router.post('/:relationshipId/calculate-revenue', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { projectId, revenue } = req.body;
    const { userId } = req.user;
    
    console.log(`💰 Calculating revenue shares for relationship: ${relationshipId}`);
    
    if (!projectId || !revenue) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and revenue are required'
      });
    }
    
    const revenueShare = await umbrellaStateMachine.calculateRevenueShares(relationshipId, {
      projectId,
      revenue
    });
    
    res.json({
      success: true,
      data: revenueShare,
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
 * Suspend umbrella relationship
 * POST /api/umbrella/state-machine/:relationshipId/suspend
 */
router.post('/:relationshipId/suspend', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { reason = 'User requested' } = req.body;
    const { userId } = req.user;
    
    console.log(`⏸️ Suspending umbrella relationship: ${relationshipId}`);
    
    const stateMachine = await umbrellaStateMachine.transitionTo(
      relationshipId, 
      'SUSPENDED', 
      'suspend',
      { reason }
    );
    
    res.json({
      success: true,
      data: stateMachine,
      message: 'Umbrella relationship suspended successfully'
    });
  } catch (error) {
    console.error('❌ Error suspending umbrella relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend umbrella relationship',
      error: error.message
    });
  }
});

/**
 * Terminate umbrella relationship
 * POST /api/umbrella/state-machine/:relationshipId/terminate
 */
router.post('/:relationshipId/terminate', authenticateToken, async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const { reason = 'User requested' } = req.body;
    const { userId } = req.user;
    
    console.log(`❌ Terminating umbrella relationship: ${relationshipId}`);
    
    const stateMachine = await umbrellaStateMachine.transitionTo(
      relationshipId, 
      'TERMINATED', 
      'terminate',
      { reason }
    );
    
    res.json({
      success: true,
      data: stateMachine,
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

// ===== MAINTENANCE =====

/**
 * Cleanup inactive state machines
 * POST /api/umbrella/state-machine/cleanup
 */
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    await umbrellaStateMachine.cleanup();
    
    res.json({
      success: true,
      message: 'State machine cleanup completed successfully'
    });
  } catch (error) {
    console.error('❌ Error cleaning up state machines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup state machines',
      error: error.message
    });
  }
});

// ===== ERROR HANDLING =====

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Umbrella State Machine API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
router.use((error, req, res, next) => {
  console.error('❌ Umbrella State Machine API Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
