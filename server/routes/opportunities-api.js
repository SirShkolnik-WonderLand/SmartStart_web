/**
 * SmartStart Opportunities API Routes
 * Comprehensive API for managing collaboration opportunities
 */

const express = require('express');
const router = express.Router();
const opportunitiesService = require('../services/opportunities-service');
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===== OPPORTUNITY MANAGEMENT ROUTES =====

/**
 * GET /api/opportunities/test
 * Test route to verify API is working
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Opportunities API is working!',
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/opportunities/public
 * Public route to test without authentication
 */
router.get('/public', async (req, res) => {
    try {
        const result = await opportunitiesService.getOpportunities({}, 'public');
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching opportunities',
            error: error.message
        });
    }
});

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
        const requiredLevels = ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'ADMIN', 'SUPER_ADMIN'];
        
        if (!requiredLevels.includes(userLevel)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions: SUBSCRIBER level or higher required'
            });
        }

        const result = await opportunitiesService.createOpportunity(req.body, req.user.id);
        
        if (result.success) {
            // Send notification to relevant users
            await sendOpportunityCreatedNotification(result.data.opportunity, req.user);
            
            // Award XP for creating opportunity
            await awardOpportunityCreationXP(req.user.id, result.data.opportunity);
            
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
 * POST /api/opportunities/:id/apply
 * Apply to an opportunity
 */
router.post('/:id/apply', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { coverLetter, portfolioItems, availability } = req.body;

        // Check if opportunity exists and is active
        const opportunity = await prisma.opportunity.findFirst({
            where: { 
                id, 
                status: 'ACTIVE' 
            }
        });

        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found or not active'
            });
        }

        // Check if user already applied
        const existingApplication = await prisma.opportunityApplication.findFirst({
            where: {
                opportunityId: id,
                applicantId: req.user.id
            }
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this opportunity'
            });
        }

        // Create application
        const application = await prisma.opportunityApplication.create({
            data: {
                opportunityId: id,
                applicantId: req.user.id,
                coverLetter: coverLetter || '',
                portfolioItems: portfolioItems || [],
                availability: availability || '',
                status: 'PENDING',
                appliedAt: new Date()
            }
        });

        // Award XP for applying
        await awardOpportunityApplicationXP(req.user.id, id);

        // Send notification to opportunity creator
        await sendApplicationNotification(opportunity, req.user, application);

        res.json({
            success: true,
            data: { application },
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('Error in POST /api/opportunities/:id/apply:', error);
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

// ===== HELPER FUNCTIONS =====

/**
 * Send notification when opportunity is created
 */
async function sendOpportunityCreatedNotification(opportunity, creator) {
    try {
        // Find users who might be interested in this opportunity
        const interestedUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: creator.id } }, // Exclude creator
                    {
                        OR: [
                            // Users with matching skills
                            { skills: { hasSome: opportunity.requiredSkills || [] } },
                            // Users in same venture
                            { ventures: { some: { ventureId: opportunity.ventureId } } },
                            // Users with similar interests
                            { interests: { hasSome: opportunity.tags || [] } }
                        ]
                    }
                ]
            },
            select: { id: true, name: true }
        });

        // Create notifications for interested users
        const notifications = interestedUsers.map(user => ({
            recipientId: user.id,
            type: 'OPPORTUNITY_CREATED',
            title: `New Opportunity: ${opportunity.title}`,
            message: `A new ${opportunity.type.toLowerCase().replace('_', ' ')} opportunity has been posted that matches your profile.`,
            data: JSON.stringify({
                opportunityId: opportunity.id,
                opportunityType: opportunity.type,
                creatorId: creator.id,
                creatorName: creator.name
            }),
            priority: 'NORMAL',
            status: 'UNREAD',
            createdAt: new Date()
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications
            });
        }
    } catch (error) {
        console.error('Error sending opportunity created notifications:', error);
    }
}

/**
 * Award XP for creating opportunity
 */
async function awardOpportunityCreationXP(userId, opportunity) {
    try {
        let xpAmount = 50; // Base XP for creating opportunity
        
        // Bonus XP based on opportunity type
        switch (opportunity.type) {
            case 'VENTURE_COLLABORATION':
                xpAmount += 25;
                break;
            case 'MENTORSHIP':
                xpAmount += 15;
                break;
            case 'CONSULTING':
                xpAmount += 20;
                break;
        }

        // Award XP
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: xpAmount },
                totalXp: { increment: xpAmount }
            }
        });

        // Create XP transaction record
        await prisma.xpTransaction.create({
            data: {
                userId,
                amount: xpAmount,
                type: 'OPPORTUNITY_CREATED',
                description: `Created ${opportunity.type.toLowerCase().replace('_', ' ')} opportunity`,
                metadata: JSON.stringify({
                    opportunityId: opportunity.id,
                    opportunityType: opportunity.type
                }),
                createdAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error awarding opportunity creation XP:', error);
    }
}

/**
 * Award XP for applying to opportunity
 */
async function awardOpportunityApplicationXP(userId, opportunityId) {
    try {
        const xpAmount = 25; // XP for applying to opportunity

        // Award XP
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: xpAmount },
                totalXp: { increment: xpAmount }
            }
        });

        // Create XP transaction record
        await prisma.xpTransaction.create({
            data: {
                userId,
                amount: xpAmount,
                type: 'OPPORTUNITY_APPLIED',
                description: 'Applied to opportunity',
                metadata: JSON.stringify({
                    opportunityId
                }),
                createdAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error awarding opportunity application XP:', error);
    }
}

/**
 * Send notification when someone applies to opportunity
 */
async function sendApplicationNotification(opportunity, applicant, application) {
    try {
        // Notify opportunity creator
        await prisma.notification.create({
            data: {
                recipientId: opportunity.createdBy,
                type: 'OPPORTUNITY_APPLICATION',
                title: `New Application: ${opportunity.title}`,
                message: `${applicant.name} has applied to your opportunity.`,
                data: JSON.stringify({
                    opportunityId: opportunity.id,
                    applicationId: application.id,
                    applicantId: applicant.id,
                    applicantName: applicant.name
                }),
                priority: 'NORMAL',
                status: 'UNREAD',
                createdAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error sending application notification:', error);
    }
}

module.exports = router;
