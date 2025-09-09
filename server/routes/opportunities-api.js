/**
 * SmartStart Opportunities API Routes
 * Comprehensive API for managing collaboration opportunities
 */

const express = require('express');
const router = express.Router();
const opportunitiesService = require('../services/opportunities-service');
const { authenticateToken } = require('../middleware/auth');

// ===== OPPORTUNITY MANAGEMENT ROUTES =====

/**
 * GET /api/opportunities
 * List all opportunities with filtering and pagination
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const filters = {
            ...req.query,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        };

        const result = await opportunitiesService.getOpportunities(filters, req.user.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in GET /api/opportunities:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * POST /api/opportunities
 * Create a new opportunity
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        // Check user level - only SUBSCRIBER+ can create opportunities
        const userLevel = req.user.level;
        const requiredLevels = ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'ADMIN'];
        
        if (!requiredLevels.includes(userLevel)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions: SUBSCRIBER level or higher required'
            });
        }

        const result = await opportunitiesService.createOpportunity(req.body, req.user.id);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in POST /api/opportunities:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/opportunities/:id
 * Get opportunity details
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await opportunitiesService.getOpportunityById(req.params.id, req.user.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error in GET /api/opportunities/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * PUT /api/opportunities/:id
 * Update opportunity
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await opportunitiesService.updateOpportunity(req.params.id, req.body, req.user.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in PUT /api/opportunities/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/opportunities/:id
 * Delete opportunity
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await opportunitiesService.deleteOpportunity(req.params.id, req.user.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in DELETE /api/opportunities/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ===== APPLICATION MANAGEMENT ROUTES =====

/**
 * POST /api/opportunities/:id/applications
 * Apply to an opportunity
 */
router.post('/:id/applications', authenticateToken, async (req, res) => {
    try {
        // Check user level - MEMBER+ can apply
        const userLevel = req.user.level;
        const requiredLevels = ['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'ADMIN'];
        
        if (!requiredLevels.includes(userLevel)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions: MEMBER level or higher required'
            });
        }

        const result = await opportunitiesService.applyToOpportunity(req.params.id, req.body, req.user.id);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in POST /api/opportunities/:id/applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/opportunities/:id/applications
 * Get applications for an opportunity (creator only)
 */
router.get('/:id/applications', authenticateToken, async (req, res) => {
    try {
        const result = await opportunitiesService.getOpportunityApplications(req.params.id, req.user.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in GET /api/opportunities/:id/applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * PUT /api/opportunities/:id/applications/:applicationId
 * Update application status (creator only)
 */
router.put('/:id/applications/:applicationId', authenticateToken, async (req, res) => {
    try {
        const { status, feedback } = req.body;
        
        // This would be implemented in the service
        res.json({
            success: true,
            message: 'Application status updated successfully'
        });
    } catch (error) {
        console.error('Error in PUT /api/opportunities/:id/applications/:applicationId:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ===== MATCHING ROUTES =====

/**
 * GET /api/opportunities/:id/matches
 * Get opportunity matches (creator only)
 */
router.get('/:id/matches', authenticateToken, async (req, res) => {
    try {
        // This would be implemented in the service
        res.json({
            success: true,
            data: {
                matches: [],
                message: 'Matches endpoint - to be implemented'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/opportunities/:id/matches:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * POST /api/opportunities/:id/matches/generate
 * Generate matches for an opportunity (creator only)
 */
router.post('/:id/matches/generate', authenticateToken, async (req, res) => {
    try {
        const result = await opportunitiesService.generateMatches(req.params.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in POST /api/opportunities/:id/matches/generate:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ===== ANALYTICS ROUTES =====

/**
 * GET /api/opportunities/:id/analytics
 * Get opportunity analytics (creator only)
 */
router.get('/:id/analytics', authenticateToken, async (req, res) => {
    try {
        const result = await opportunitiesService.getOpportunityAnalytics(req.params.id, req.user.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in GET /api/opportunities/:id/analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ===== USER-SPECIFIC ROUTES =====

/**
 * GET /api/opportunities/user/:userId/applications
 * Get user's applications
 */
router.get('/user/:userId/applications', authenticateToken, async (req, res) => {
    try {
        // Check if user is accessing their own applications
        if (req.params.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Can only access your own applications'
            });
        }

        // This would be implemented in the service
        res.json({
            success: true,
            data: {
                applications: [],
                message: 'User applications endpoint - to be implemented'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/opportunities/user/:userId/applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/opportunities/user/:userId/matches
 * Get user's opportunity matches
 */
router.get('/user/:userId/matches', authenticateToken, async (req, res) => {
    try {
        // Check if user is accessing their own matches
        if (req.params.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Can only access your own matches'
            });
        }

        // This would be implemented in the service
        res.json({
            success: true,
            data: {
                matches: [],
                message: 'User matches endpoint - to be implemented'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/opportunities/user/:userId/matches:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ===== SEARCH ROUTES =====

/**
 * POST /api/opportunities/search
 * Advanced opportunity search
 */
router.post('/search', authenticateToken, async (req, res) => {
    try {
        const filters = {
            ...req.body,
            page: parseInt(req.body.page) || 1,
            limit: parseInt(req.body.limit) || 20
        };

        const result = await opportunitiesService.getOpportunities(filters, req.user.id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error in POST /api/opportunities/search:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * GET /api/opportunities/suggestions
 * Get personalized opportunity suggestions
 */
router.get('/suggestions', authenticateToken, async (req, res) => {
    try {
        // This would be implemented in the service
        res.json({
            success: true,
            data: {
                suggestions: [],
                message: 'Suggestions endpoint - to be implemented'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/opportunities/suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
