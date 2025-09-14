#!/usr/bin/env node

/**
 * SmartStart Workflow API Endpoints
 * RESTful API for workflow management and automation
 */

const express = require('express');
const workflowEngine = require('./workflow-engine');

const router = express.Router();

// Middleware for authentication and validation
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // In a real implementation, this would validate the JWT token
    req.user = { id: 'user-123', email: 'user@example.com', name: 'Test User' };
    next();
};

// Get all workflows
router.get('/', authenticateUser, async(req, res) => {
    try {
        const result = await workflowEngine.getWorkflows();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific workflow
router.get('/:workflowId', authenticateUser, async(req, res) => {
    try {
        const { workflowId } = req.params;
        const result = await workflowEngine.getWorkflow(workflowId);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Create new workflow
router.post('/', authenticateUser, async(req, res) => {
    try {
        const { name, description, triggers, steps } = req.body;

        if (!name || !triggers || !steps) {
            return res.status(400).json({
                success: false,
                error: 'Name, triggers, and steps are required'
            });
        }

        const workflowData = {
            name,
            description,
            triggers,
            steps,
            createdBy: req.user.id
        };

        const result = await workflowEngine.createWorkflow(workflowData);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update workflow
router.put('/:workflowId', authenticateUser, async(req, res) => {
    try {
        const { workflowId } = req.params;
        const updates = req.body;

        const result = await workflowEngine.updateWorkflow(workflowId, updates);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Delete workflow
router.delete('/:workflowId', authenticateUser, async(req, res) => {
    try {
        const { workflowId } = req.params;
        const result = await workflowEngine.deleteWorkflow(workflowId);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Get workflow executions
router.get('/:workflowId/executions', authenticateUser, async(req, res) => {
    try {
        const { workflowId } = req.params;
        const result = await workflowEngine.getExecutions(workflowId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific execution
router.get('/executions/:executionId', authenticateUser, async(req, res) => {
    try {
        const { executionId } = req.params;
        const result = await workflowEngine.getExecution(executionId);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Get execution history
router.get('/history', authenticateUser, async(req, res) => {
    try {
        const { workflowId, limit = 100 } = req.query;
        const result = await workflowEngine.getExecutionHistory(workflowId, parseInt(limit));
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get workflow statistics
router.get('/stats', authenticateUser, async(req, res) => {
    try {
        const result = await workflowEngine.getWorkflowStats();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Trigger workflow manually
router.post('/:workflowId/trigger', authenticateUser, async(req, res) => {
    try {
        const { workflowId } = req.params;
        const { data } = req.body;

        // Create a manual trigger event
        const event = {
            type: 'workflow.manual_trigger',
            data: data || {},
            userId: req.user.id,
            timestamp: new Date()
        };

        await workflowEngine.handleWorkflowTrigger(event);

        res.json({
            success: true,
            message: 'Workflow triggered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Pause workflow execution
router.post('/executions/:executionId/pause', authenticateUser, async(req, res) => {
    try {
        const { executionId } = req.params;
        const result = await workflowEngine.getExecution(executionId);

        if (result.success) {
            const execution = result.execution;
            execution.status = 'paused';

            res.json({
                success: true,
                message: 'Workflow execution paused'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Execution not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Resume workflow execution
router.post('/executions/:executionId/resume', authenticateUser, async(req, res) => {
    try {
        const { executionId } = req.params;
        const result = await workflowEngine.getExecution(executionId);

        if (result.success) {
            const execution = result.execution;
            execution.status = 'running';

            res.json({
                success: true,
                message: 'Workflow execution resumed'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Execution not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Cancel workflow execution
router.post('/executions/:executionId/cancel', authenticateUser, async(req, res) => {
    try {
        const { executionId } = req.params;
        const result = await workflowEngine.getExecution(executionId);

        if (result.success) {
            const execution = result.execution;
            execution.status = 'cancelled';
            execution.completedAt = new Date();

            res.json({
                success: true,
                message: 'Workflow execution cancelled'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Execution not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get workflow templates
router.get('/templates', authenticateUser, async(req, res) => {
    try {
        const templates = [{
                id: 'user_onboarding',
                name: 'User Onboarding',
                description: 'Automated user onboarding process',
                category: 'user_management',
                triggers: ['user.created'],
                steps: 4
            },
            {
                id: 'venture_creation',
                name: 'Venture Creation',
                description: 'Automated venture setup process',
                category: 'venture_management',
                triggers: ['venture.created'],
                steps: 3
            },
            {
                id: 'subscription_renewal',
                name: 'Subscription Renewal',
                description: 'Automated subscription renewal process',
                category: 'billing',
                triggers: ['subscription.renewal_due'],
                steps: 3
            },
            {
                id: 'team_collaboration',
                name: 'Team Collaboration',
                description: 'Automated team collaboration setup',
                category: 'team_management',
                triggers: ['team.member_added'],
                steps: 3
            },
            {
                id: 'legal_document_workflow',
                name: 'Legal Document Workflow',
                description: 'Automated legal document processing',
                category: 'legal',
                triggers: ['legal.document.uploaded'],
                steps: 3
            }
        ];

        res.json({
            success: true,
            templates: templates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create workflow from template
router.post('/templates/:templateId/create', authenticateUser, async(req, res) => {
    try {
        const { templateId } = req.params;
        const { name, description } = req.body;

        // Get template
        const templates = await workflowEngine.getWorkflows();
        const template = templates.workflows.find(t => t.id === templateId);

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        // Create workflow from template
        const workflowData = {
            name: name || template.name,
            description: description || template.description,
            triggers: template.triggers,
            steps: template.steps,
            createdBy: req.user.id
        };

        const result = await workflowEngine.createWorkflow(workflowData);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get workflow logs
router.get('/:workflowId/logs', authenticateUser, async(req, res) => {
    try {
        const { workflowId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const result = await workflowEngine.getExecutionHistory(workflowId, parseInt(limit));

        res.json({
            success: true,
            logs: result.history.slice(offset, offset + parseInt(limit)),
            total: result.history.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    try {
        const health = workflowEngine.getHealth();
        res.json({
            success: true,
            health: health
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;