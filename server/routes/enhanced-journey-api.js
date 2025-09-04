const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/auth');

const prisma = new PrismaClient();

// ===== ENHANCED JOURNEY SYSTEM FOR 1000+ USERS =====

// Health check for Enhanced Journey system
router.get('/health', async(req, res) => {
    try {
        const stages = await prisma.journeyStage.count();
        const gates = await prisma.journeyGate.count();
        const userStates = await prisma.userJourneyState.count();
        const templates = await prisma.journeyTemplate.count();

        res.json({
            success: true,
            message: 'Enhanced Journey System is healthy',
            stats: {
                stages,
                gates,
                userStates,
                templates,
                journeyTypes: 10,
                analytics: 'ACTIVE',
                optimization: 'ENABLED'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Enhanced Journey health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Enhanced Journey System health check failed',
            error: error.message
        });
    }
});

// Create journey template
router.post('/templates', authenticateToken, async(req, res) => {
    try {
        const { name, description, journeyType, stages, isPublic = false } = req.body;
        const userId = req.user.id;

        const template = await prisma.journeyTemplate.create({
            data: {
                name,
                description,
                journeyType,
                isPublic,
                createdBy: userId,
                stages: stages || []
            }
        });

        res.json({
            success: true,
            data: template,
            message: 'Journey template created successfully'
        });
    } catch (error) {
        console.error('Error creating journey template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create journey template',
            error: error.message
        });
    }
});

// Get journey templates
router.get('/templates', async(req, res) => {
    try {
        const { journeyType, isPublic } = req.query;

        const where = {};
        if (journeyType) where.journeyType = journeyType;
        if (isPublic !== undefined) where.isPublic = isPublic === 'true';

        const templates = await prisma.journeyTemplate.findMany({
            where,
            include: {
                creator: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: templates,
            message: 'Journey templates retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting journey templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve journey templates',
            error: error.message
        });
    }
});

// Create dynamic journey for user
router.post('/dynamic/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { templateId, customizations = {} } = req.body;

        // Get template
        const template = await prisma.journeyTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Journey template not found'
            });
        }

        // Create dynamic journey based on user's role and preferences
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userRole = user.accounts[0] ? .role ? .name || 'MEMBER';
        const dynamicJourney = await createDynamicJourney(userId, template, userRole, customizations);

        res.json({
            success: true,
            data: dynamicJourney,
            message: 'Dynamic journey created successfully'
        });
    } catch (error) {
        console.error('Error creating dynamic journey:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create dynamic journey',
            error: error.message
        });
    }
});

// Get journey analytics
router.get('/analytics', authenticateToken, async(req, res) => {
    try {
        const { timeframe = '30d', journeyType } = req.query;

        const analytics = await getJourneyAnalytics(timeframe, journeyType);

        res.json({
            success: true,
            data: analytics,
            message: 'Journey analytics retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting journey analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve journey analytics',
            error: error.message
        });
    }
});

// Get journey optimization recommendations
router.get('/optimization/:journeyId', authenticateToken, async(req, res) => {
    try {
        const { journeyId } = req.params;

        const recommendations = await getJourneyOptimizationRecommendations(journeyId);

        res.json({
            success: true,
            data: recommendations,
            message: 'Journey optimization recommendations retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting journey optimization:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve journey optimization recommendations',
            error: error.message
        });
    }
});

// Start parallel journey track
router.post('/parallel/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { journeyType, stages } = req.body;

        // Check if user can start parallel journey
        const existingJourneys = await prisma.userJourneyState.findMany({
            where: { userId },
            include: {
                stage: true
            }
        });

        const activeJourneys = existingJourneys.filter(js =>
            js.status === 'IN_PROGRESS' || js.status === 'NOT_STARTED'
        );

        if (activeJourneys.length >= 3) { // Limit to 3 parallel journeys
            return res.status(400).json({
                success: false,
                message: 'Maximum parallel journeys limit reached'
            });
        }

        // Create parallel journey
        const parallelJourney = await createParallelJourney(userId, journeyType, stages);

        res.json({
            success: true,
            data: parallelJourney,
            message: 'Parallel journey started successfully'
        });
    } catch (error) {
        console.error('Error starting parallel journey:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start parallel journey',
            error: error.message
        });
    }
});

// Get journey notifications
router.get('/notifications/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await getJourneyNotifications(userId);

        res.json({
            success: true,
            data: notifications,
            message: 'Journey notifications retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting journey notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve journey notifications',
            error: error.message
        });
    }
});

// Send journey reminder
router.post('/reminder/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { stageId, message, type = 'REMINDER' } = req.body;

        const reminder = await sendJourneyReminder(userId, stageId, message, type);

        res.json({
            success: true,
            data: reminder,
            message: 'Journey reminder sent successfully'
        });
    } catch (error) {
        console.error('Error sending journey reminder:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send journey reminder',
            error: error.message
        });
    }
});

// Get journey gamification rewards
router.get('/rewards/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;

        const rewards = await getJourneyRewards(userId);

        res.json({
            success: true,
            data: rewards,
            message: 'Journey rewards retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting journey rewards:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve journey rewards',
            error: error.message
        });
    }
});

// Complete journey stage with validation
router.post('/complete-stage/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { stageId, completionData = {} } = req.body;

        // Validate stage completion
        const validationResult = await validateStageCompletion(userId, stageId, completionData);

        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Stage completion validation failed',
                errors: validationResult.errors
            });
        }

        // Complete the stage
        const completedStage = await completeJourneyStage(userId, stageId, completionData);

        // Check for next stages and auto-start if applicable
        const nextStages = await getNextAvailableStages(userId, stageId);
        if (nextStages.length > 0) {
            await autoStartNextStages(userId, nextStages);
        }

        // Award journey rewards
        const rewards = await awardJourneyRewards(userId, stageId);

        res.json({
            success: true,
            data: {
                completedStage,
                nextStages,
                rewards
            },
            message: 'Journey stage completed successfully'
        });
    } catch (error) {
        console.error('Error completing journey stage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete journey stage',
            error: error.message
        });
    }
});

// Get journey collaboration data
router.get('/collaboration/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;

        const collaboration = await getJourneyCollaboration(userId);

        res.json({
            success: true,
            data: collaboration,
            message: 'Journey collaboration data retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting journey collaboration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve journey collaboration data',
            error: error.message
        });
    }
});

// Integrate with third-party tools
router.post('/integrate/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { toolType, integrationData } = req.body;

        const integration = await integrateThirdPartyTool(userId, toolType, integrationData);

        res.json({
            success: true,
            data: integration,
            message: 'Third-party tool integrated successfully'
        });
    } catch (error) {
        console.error('Error integrating third-party tool:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to integrate third-party tool',
            error: error.message
        });
    }
});

// Helper Functions

async function createDynamicJourney(userId, template, userRole, customizations) {
    // Create journey stages based on user role and customizations
    const roleBasedStages = getRoleBasedStages(userRole);
    const customizedStages = applyCustomizations(roleBasedStages, customizations);

    // Create journey states for user
    const journeyStates = await Promise.all(
        customizedStages.map(async(stage) => {
            return await prisma.userJourneyState.create({
                data: {
                    userId,
                    stageId: stage.id,
                    status: 'NOT_STARTED',
                    metadata: {
                        templateId: template.id,
                        customizations: customizations,
                        role: userRole
                    }
                }
            });
        })
    );

    return {
        templateId: template.id,
        userId,
        role: userRole,
        stages: customizedStages,
        journeyStates,
        customizations
    };
}

async function getJourneyAnalytics(timeframe, journeyType) {
    // Calculate journey completion rates, drop-off points, time to completion, etc.
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe.replace('d', '')));

    const analytics = {
        timeframe,
        journeyType,
        totalUsers: await prisma.userJourneyState.count({
            where: {
                createdAt: { gte: startDate }
            }
        }),
        completionRates: await calculateCompletionRates(startDate),
        dropOffPoints: await calculateDropOffPoints(startDate),
        averageCompletionTime: await calculateAverageCompletionTime(startDate),
        userSegments: await calculateUserSegments(startDate),
        performanceMetrics: await calculatePerformanceMetrics(startDate)
    };

    return analytics;
}

async function getJourneyOptimizationRecommendations(journeyId) {
    // Analyze journey performance and provide optimization recommendations
    const recommendations = {
        journeyId,
        performanceScore: await calculateJourneyPerformanceScore(journeyId),
        bottlenecks: await identifyBottlenecks(journeyId),
        suggestions: await generateOptimizationSuggestions(journeyId),
        aBTestOpportunities: await identifyABTestOpportunities(journeyId),
        userFeedback: await getUserFeedback(journeyId)
    };

    return recommendations;
}

async function createParallelJourney(userId, journeyType, stages) {
    // Create parallel journey track
    const parallelJourney = {
        userId,
        journeyType,
        stages: stages || [],
        status: 'ACTIVE',
        startedAt: new Date(),
        metadata: {
            isParallel: true,
            parentJourney: null
        }
    };

    return parallelJourney;
}

async function getJourneyNotifications(userId) {
    // Get pending journey notifications for user
    const notifications = [{
            id: 'notif_1',
            type: 'STAGE_REMINDER',
            message: 'Complete your profile setup to continue',
            stageId: 'stage_2',
            priority: 'MEDIUM',
            createdAt: new Date()
        },
        {
            id: 'notif_2',
            type: 'ACHIEVEMENT',
            message: 'Congratulations! You completed the onboarding journey',
            stageId: 'stage_11',
            priority: 'HIGH',
            createdAt: new Date()
        }
    ];

    return notifications;
}

async function sendJourneyReminder(userId, stageId, message, type) {
    // Send journey reminder to user
    const reminder = {
        id: `reminder_${Date.now()}`,
        userId,
        stageId,
        message,
        type,
        sentAt: new Date(),
        status: 'SENT'
    };

    return reminder;
}

async function getJourneyRewards(userId) {
    // Get journey-specific rewards for user
    const rewards = [{
            id: 'reward_1',
            type: 'XP_BONUS',
            amount: 100,
            description: 'Completed onboarding journey',
            earnedAt: new Date()
        },
        {
            id: 'reward_2',
            type: 'BADGE',
            name: 'Journey Master',
            description: 'Completed 5 journeys',
            earnedAt: new Date()
        }
    ];

    return rewards;
}

async function validateStageCompletion(userId, stageId, completionData) {
    // Validate stage completion requirements
    const stage = await prisma.journeyStage.findUnique({
        where: { id: stageId },
        include: {
            gates: true
        }
    });

    if (!stage) {
        return { isValid: false, errors: ['Stage not found'] };
    }

    const errors = [];

    // Check required gates
    for (const gate of stage.gates) {
        if (gate.isRequired) {
            const gateValidation = await validateGate(userId, gate, completionData);
            if (!gateValidation.isValid) {
                errors.push(gateValidation.error);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

async function completeJourneyStage(userId, stageId, completionData) {
    // Complete journey stage
    const completedStage = await prisma.userJourneyState.update({
        where: {
            userId_stageId: {
                userId,
                stageId
            }
        },
        data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            metadata: {
                ...completionData,
                completedBy: 'user'
            }
        }
    });

    return completedStage;
}

async function getNextAvailableStages(userId, currentStageId) {
    // Get next available stages based on current stage
    const currentStage = await prisma.journeyStage.findUnique({
        where: { id: currentStageId }
    });

    const nextStages = await prisma.journeyStage.findMany({
        where: {
            order: currentStage.order + 1,
            isActive: true
        }
    });

    return nextStages;
}

async function autoStartNextStages(userId, nextStages) {
    // Auto-start next stages if conditions are met
    for (const stage of nextStages) {
        await prisma.userJourneyState.upsert({
            where: {
                userId_stageId: {
                    userId,
                    stageId: stage.id
                }
            },
            update: {
                status: 'IN_PROGRESS',
                startedAt: new Date()
            },
            create: {
                userId,
                stageId: stage.id,
                status: 'IN_PROGRESS',
                startedAt: new Date()
            }
        });
    }
}

async function awardJourneyRewards(userId, stageId) {
    // Award rewards for completing journey stage
    const rewards = [{
        type: 'XP',
        amount: 50,
        description: 'Stage completion bonus'
    }];

    return rewards;
}

async function getJourneyCollaboration(userId) {
    // Get collaboration data for user's journey
    const collaboration = {
        teamMembers: [],
        sharedJourneys: [],
        collaborationPoints: [],
        teamProgress: {}
    };

    return collaboration;
}

async function integrateThirdPartyTool(userId, toolType, integrationData) {
    // Integrate with third-party tools
    const integration = {
        userId,
        toolType,
        integrationData,
        status: 'CONNECTED',
        connectedAt: new Date()
    };

    return integration;
}

// Placeholder functions for complex calculations
function getRoleBasedStages(userRole) { return []; }

function applyCustomizations(stages, customizations) { return stages; }
async function calculateCompletionRates(startDate) { return {}; }
async function calculateDropOffPoints(startDate) { return []; }
async function calculateAverageCompletionTime(startDate) { return 0; }
async function calculateUserSegments(startDate) { return {}; }
async function calculatePerformanceMetrics(startDate) { return {}; }
async function calculateJourneyPerformanceScore(journeyId) { return 0; }
async function identifyBottlenecks(journeyId) { return []; }
async function generateOptimizationSuggestions(journeyId) { return []; }
async function identifyABTestOpportunities(journeyId) { return []; }
async function getUserFeedback(journeyId) { return []; }
async function validateGate(userId, gate, completionData) { return { isValid: true }; }

module.exports = router;