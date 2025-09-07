/**
 * Legal State Machine API Routes
 * Provides endpoints for managing legal document and user compliance state machines
 */

const express = require('express');
const router = express.Router();
const LegalStateMachineService = require('../state-machines/legal/LegalStateMachine');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Initialize state machine service
const stateMachineService = new LegalStateMachineService();

// ===== DOCUMENT STATE MACHINE ENDPOINTS =====

/**
 * POST /api/legal/state-machine/document/create
 * Create a new document state machine
 */
router.post('/document/create', authenticateToken, async (req, res) => {
  try {
    const {
      documentId,
      documentType,
      ventureId,
      requiredSignatures = [],
      securityTier = 'TIER_0',
      expiryDate
    } = req.body;

    if (!documentId || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: documentId, documentType'
      });
    }

    const initialContext = {
      documentId,
      documentType,
      userId: req.user.id,
      ventureId,
      requiredSignatures,
      securityTier,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      auditTrail: [],
      lastModified: new Date().toISOString()
    };

    const machine = await stateMachineService.createDocumentMachine(documentId, initialContext);

    res.json({
      success: true,
      message: 'Document state machine created successfully',
      documentId,
      currentState: machine.state.value,
      context: machine.state.context
    });
  } catch (error) {
    console.error('Create document state machine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document state machine',
      error: error.message
    });
  }
});

/**
 * POST /api/legal/state-machine/document/:documentId/event
 * Send an event to a document state machine
 */
router.post('/document/:documentId/event', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
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

    await stateMachineService.sendDocumentEvent(documentId, eventData);

    const currentState = stateMachineService.getDocumentState(documentId);

    res.json({
      success: true,
      message: 'Event sent successfully',
      documentId,
      event,
      currentState: currentState?.value,
      context: currentState?.context
    });
  } catch (error) {
    console.error('Send document event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send document event',
      error: error.message
    });
  }
});

/**
 * GET /api/legal/state-machine/document/:documentId/state
 * Get current state of a document state machine
 */
router.get('/document/:documentId/state', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    const state = stateMachineService.getDocumentState(documentId);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'Document state machine not found'
      });
    }

    res.json({
      success: true,
      documentId,
      currentState: state.value,
      context: state.context,
      history: state.history
    });
  } catch (error) {
    console.error('Get document state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document state',
      error: error.message
    });
  }
});

/**
 * GET /api/legal/state-machine/document/:documentId/visualization
 * Get state machine visualization data
 */
router.get('/document/:documentId/visualization', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    const visualization = stateMachineService.getStateMachineVisualization('document', documentId);

    if (!visualization) {
      return res.status(404).json({
        success: false,
        message: 'Document state machine not found'
      });
    }

    res.json({
      success: true,
      documentId,
      visualization
    });
  } catch (error) {
    console.error('Get document visualization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document visualization',
      error: error.message
    });
  }
});

// ===== USER COMPLIANCE STATE MACHINE ENDPOINTS =====

/**
 * POST /api/legal/state-machine/user/:userId/compliance/create
 * Create a new user compliance state machine
 */
router.post('/user/:userId/compliance/create', authenticateToken, requireRole(['ADMIN', 'LEGAL_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      rbacLevel = 'GUEST',
      requiredDocuments = [],
      canadianCompliance = {}
    } = req.body;

    const initialContext = {
      userId,
      rbacLevel,
      requiredDocuments,
      completedDocuments: [],
      complianceScore: 0,
      lastComplianceCheck: new Date().toISOString(),
      canadianCompliance: {
        pipeda: false,
        phipa: false,
        casl: false,
        ...canadianCompliance
      }
    };

    const machine = await stateMachineService.createUserComplianceMachine(userId, initialContext);

    res.json({
      success: true,
      message: 'User compliance state machine created successfully',
      userId,
      currentState: machine.state.value,
      context: machine.state.context
    });
  } catch (error) {
    console.error('Create user compliance state machine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user compliance state machine',
      error: error.message
    });
  }
});

/**
 * POST /api/legal/state-machine/user/:userId/compliance/event
 * Send an event to a user compliance state machine
 */
router.post('/user/:userId/compliance/event', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { event, metadata = {} } = req.body;

    // Users can only send events to their own compliance machine unless they're admin
    if (req.user.id !== userId && !req.user.roles?.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this user\'s compliance state'
      });
    }

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

    await stateMachineService.sendUserComplianceEvent(userId, eventData);

    const currentState = stateMachineService.getUserComplianceState(userId);

    res.json({
      success: true,
      message: 'Event sent successfully',
      userId,
      event,
      currentState: currentState?.value,
      context: currentState?.context
    });
  } catch (error) {
    console.error('Send user compliance event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send user compliance event',
      error: error.message
    });
  }
});

/**
 * GET /api/legal/state-machine/user/:userId/compliance/state
 * Get current state of a user compliance state machine
 */
router.get('/user/:userId/compliance/state', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own compliance state unless they're admin
    if (req.user.id !== userId && !req.user.roles?.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this user\'s compliance state'
      });
    }

    const state = stateMachineService.getUserComplianceState(userId);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'User compliance state machine not found'
      });
    }

    res.json({
      success: true,
      userId,
      currentState: state.value,
      context: state.context,
      history: state.history
    });
  } catch (error) {
    console.error('Get user compliance state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user compliance state',
      error: error.message
    });
  }
});

/**
 * GET /api/legal/state-machine/user/:userId/compliance/visualization
 * Get user compliance state machine visualization data
 */
router.get('/user/:userId/compliance/visualization', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own compliance visualization unless they're admin
    if (req.user.id !== userId && !req.user.roles?.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this user\'s compliance visualization'
      });
    }

    const visualization = stateMachineService.getStateMachineVisualization('user', userId);

    if (!visualization) {
      return res.status(404).json({
        success: false,
        message: 'User compliance state machine not found'
      });
    }

    res.json({
      success: true,
      userId,
      visualization
    });
  } catch (error) {
    console.error('Get user compliance visualization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user compliance visualization',
      error: error.message
    });
  }
});

// ===== BULK OPERATIONS =====

/**
 * GET /api/legal/state-machine/documents/active
 * Get all active document state machines
 */
router.get('/documents/active', authenticateToken, requireRole(['ADMIN', 'LEGAL_ADMIN']), async (req, res) => {
  try {
    const activeDocuments = [];
    
    // This would need to be implemented in the state machine service
    // to track all active machines
    res.json({
      success: true,
      activeDocuments,
      count: activeDocuments.length
    });
  } catch (error) {
    console.error('Get active documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active documents',
      error: error.message
    });
  }
});

/**
 * GET /api/legal/state-machine/users/compliance-status
 * Get compliance status for multiple users
 */
router.get('/users/compliance-status', authenticateToken, requireRole(['ADMIN', 'LEGAL_ADMIN']), async (req, res) => {
  try {
    const { userIds } = req.query;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid userIds array'
      });
    }

    const complianceStatuses = userIds.map(userId => {
      const state = stateMachineService.getUserComplianceState(userId);
      return {
        userId,
        currentState: state?.value || 'unknown',
        isCompliant: state?.value === 'compliant',
        lastCheck: state?.context?.lastComplianceCheck
      };
    });

    res.json({
      success: true,
      complianceStatuses,
      count: complianceStatuses.length
    });
  } catch (error) {
    console.error('Get compliance statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance statuses',
      error: error.message
    });
  }
});

// ===== MAINTENANCE =====

/**
 * POST /api/legal/state-machine/cleanup
 * Cleanup completed state machines
 */
router.post('/cleanup', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    stateMachineService.cleanup();
    
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

module.exports = router;
