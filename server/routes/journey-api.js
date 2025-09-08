const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const onboardingOrchestrator = require('../services/onboarding-orchestrator');
const { authenticateToken } = require('../middleware/auth');

// Health check endpoint
router.get('/health', async(req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            service: 'journey-api',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'journey-api',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get user's journey status (enhanced with orchestrator)
router.get('/status/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can access this status (own status or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Auto-complete Account Creation for existing users
        const accountCreationStage = await prisma.journeyStage.findFirst({
            where: { name: 'Account Creation' }
        });

        if (accountCreationStage) {
            const accountCreationState = await prisma.userJourneyState.findFirst({
                where: {
                    userId,
                    stageId: accountCreationStage.id,
                    status: 'NOT_STARTED'
                }
            });

            if (accountCreationState) {
                // Mark Account Creation as completed for existing users
                await prisma.userJourneyState.update({
                    where: { id: accountCreationState.id },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                        metadata: {
                            ...accountCreationState.metadata,
                            autoCompleted: true,
                            reason: 'User already has account and is logged in',
                            completedAt: new Date().toISOString()
                        }
                    }
                });
            }
        }

        // Get detailed stage information
        const [userStates, stages] = await Promise.all([
            prisma.userJourneyState.findMany({
                where: { userId },
                include: {
                    stage: {
                        include: {
                            gates: true
                        }
                    }
                },
                orderBy: {
                    stage: {
                        order: 'asc'
                    }
                }
            }),
            prisma.journeyStage.findMany({
                where: { isActive: true },
                include: {
                    gates: true
                },
                orderBy: { order: 'asc' }
            })
        ]);

        // If no user states exist, create them
        if (userStates.length === 0 && stages.length > 0) {
            console.log(`Creating initial journey states for user: ${userId}`);
            for (const stage of stages) {
                await prisma.userJourneyState.create({
                    data: {
                        userId,
                        stageId: stage.id,
                        status: 'NOT_STARTED',
                        metadata: {
                            stageName: stage.name,
                            stageOrder: stage.order,
                            initializedAt: new Date().toISOString()
                        }
                    }
                });
            }

            // Reload user states after creation
            const newUserStates = await prisma.userJourneyState.findMany({
                where: { userId },
                include: {
                    stage: {
                        include: {
                            gates: true
                        }
                    }
                },
                orderBy: {
                    stage: {
                        order: 'asc'
                    }
                }
            });

            // Calculate progress
            const totalStages = newUserStates.length;
            const completedStages = newUserStates.filter(state => state.status === 'COMPLETED').length;
            const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

            const currentStage = (newUserStates.find(state => state.status === 'IN_PROGRESS') || {}).stage || null;
            const nextStage = (newUserStates.find(state => state.status === 'NOT_STARTED') || {}).stage || null;

            res.json({
                success: true,
                data: {
                    userId,
                    currentStage,
                    nextStage,
                    isComplete: percentage === 100,
                    userStates: newUserStates,
                    stages,
                    recommendations: [],
                    progress: {
                        completedStages,
                        totalStages,
                        percentage,
                        stages: newUserStates.map(state => ({
                            name: state.stage.name,
                            status: state.status,
                            order: state.stage.order
                        }))
                    },
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            // Use orchestrator to get comprehensive journey status
            try {
                const journeyStatus = await onboardingOrchestrator.getUserJourneyStatus(userId);

                // Get onboarding recommendations
                const recommendations = await onboardingOrchestrator.getOnboardingRecommendations(userId);

                // Auto-complete Profile Setup if user profile has basic fields
                try {
                    const user = await prisma.user.findUnique({ where: { id: userId } })
                    const profileState = userStates.find(s => (s.stage && s.stage.name) === 'Profile Setup')
                    if (user && (user.name || user.firstName || user.lastName) && profileState && profileState.status !== 'COMPLETED') {
                        await prisma.userJourneyState.update({
                            where: { id: profileState.id },
                            data: { status: 'COMPLETED', completedAt: new Date(), metadata: { autoCompleted: true } }
                        })
                    }
                } catch (e) {
                    console.warn('Profile auto-complete check failed:', e && e.message)
                }

                res.json({
                    success: true,
                    data: {
                        ...journeyStatus.data,
                        userStates,
                        stages,
                        recommendations: recommendations.data.recommendations,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (orchestratorError) {
                console.warn('Orchestrator failed, using fallback:', orchestratorError);

                // Fallback calculation
                const totalStages = userStates.length;
                const completedStages = userStates.filter(state => state.status === 'COMPLETED').length;
                const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

                const currentStage = (userStates.find(state => state.status === 'IN_PROGRESS') || {}).stage || null;
                const nextStage = (userStates.find(state => state.status === 'NOT_STARTED') || {}).stage || null;

                res.json({
                    success: true,
                    data: {
                        userId,
                        currentStage,
                        nextStage,
                        isComplete: percentage === 100,
                        userStates,
                        stages,
                        recommendations: [],
                        progress: {
                            completedStages,
                            totalStages,
                            percentage,
                            stages: userStates.map(state => ({
                                name: state.stage.name,
                                status: state.status,
                                order: state.stage.order
                            }))
                        },
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }
    } catch (error) {
        console.error('Journey status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journey status',
            details: error.message
        });
    }
});

// Start a journey stage
router.post('/start', async(req, res) => {
    try {
        const { userId, stageId } = req.body;

        if (!userId || !stageId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, stageId'
            });
        }

        // Check if stage exists
        const stage = await prisma.journeyStage.findUnique({
            where: { id: stageId },
            include: {
                gates: true
            }
        });

        if (!stage) {
            return res.status(404).json({
                success: false,
                error: 'Journey stage not found'
            });
        }

        // Check if user already has a state for this stage
        const existingState = await prisma.userJourneyState.findUnique({
            where: {
                userId_stageId: {
                    userId,
                    stageId
                }
            }
        });

        if (existingState) {
            return res.status(400).json({
                success: false,
                error: 'User already has a state for this stage'
            });
        }

        // Create new journey state
        const journeyState = await prisma.userJourneyState.create({
            data: {
                userId,
                stageId,
                status: 'IN_PROGRESS',
                startedAt: new Date()
            },
            include: {
                stage: {
                    include: {
                        gates: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: journeyState,
            message: 'Journey stage started successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to start journey stage',
            details: error.message
        });
    }
});

// Complete a journey stage
router.patch('/complete', async(req, res) => {
    try {
        const { userId, stageId, metadata } = req.body;

        if (!userId || !stageId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, stageId'
            });
        }

        // Check if user has a state for this stage
        const existingState = await prisma.userJourneyState.findUnique({
            where: {
                userId_stageId: {
                    userId,
                    stageId
                }
            }
        });

        if (!existingState) {
            return res.status(404).json({
                success: false,
                error: 'User journey state not found'
            });
        }

        // Update the state
        const journeyState = await prisma.userJourneyState.update({
            where: {
                userId_stageId: {
                    userId,
                    stageId
                }
            },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                metadata: metadata ? JSON.parse(metadata) : null
            },
            include: {
                stage: {
                    include: {
                        gates: true
                    }
                }
            }
        });

        res.json({
            success: true,
            data: journeyState,
            message: 'Journey stage completed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to complete journey stage',
            details: error.message
        });
    }
});

// Check journey gates
router.get('/gates/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        // Get all active stages with gates
        const stages = await prisma.journeyStage.findMany({
            where: { isActive: true },
            include: {
                gates: {
                    where: { isActive: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        // Check gate status for each stage
        const gateStatuses = await Promise.all(
            stages.map(async(stage) => {
                const gateChecks = await Promise.all(
                    stage.gates.map(async(gate) => {
                        let isPassed = false;
                        let details = null;

                        switch (gate.gateType) {
                            case 'SUBSCRIPTION':
                                const subscription = await prisma.subscription.findFirst({
                                    where: {
                                        userId,
                                        status: 'ACTIVE'
                                    }
                                });
                                isPassed = !!subscription;
                                details = subscription ? { subscriptionId: subscription.id } : null;
                                break;

                            case 'LEGAL_PACK':
                                const legalPack = await prisma.platformLegalPack.findFirst({
                                    where: {
                                        userId,
                                        status: 'SIGNED'
                                    }
                                });
                                isPassed = !!legalPack;
                                details = legalPack ? { legalPackId: legalPack.id } : null;
                                break;

                            case 'NDA':
                                const nda = await prisma.platformNDA.findFirst({
                                    where: {
                                        userId,
                                        status: 'SIGNED'
                                    }
                                });
                                isPassed = !!nda;
                                details = nda ? { ndaId: nda.id } : null;
                                break;

                            case 'CONTRACT':
                                const contract = await prisma.contractSignature.findFirst({
                                    where: {
                                        signerId: userId,
                                        status: 'SIGNED'
                                    }
                                });
                                isPassed = !!contract;
                                details = contract ? { contractId: contract.id } : null;
                                break;

                            case 'VERIFICATION':
                                const user = await prisma.user.findUnique({
                                    where: { id: userId }
                                });
                                isPassed = !!(user && user.email); // Basic email verification
                                details = user ? { email: user.email } : null;
                                break;

                            case 'PROFILE':
                                const userProfile = await prisma.user.findUnique({
                                    where: { id: userId }
                                });
                                isPassed = !!(userProfile && userProfile.name && userProfile.firstName && userProfile.lastName);
                                details = userProfile ? {
                                    name: userProfile.name,
                                    firstName: userProfile.firstName,
                                    lastName: userProfile.lastName
                                } : null;
                                break;

                            case 'LAUNCH':
                                // Check if user has completed all required stages for launch
                                const completedStages = await prisma.userJourneyState.count({
                                    where: {
                                        userId,
                                        status: 'COMPLETED'
                                    }
                                });
                                const totalStages = await prisma.journeyStage.count({
                                    where: { isActive: true }
                                });
                                isPassed = completedStages >= totalStages - 1; // All stages except launch itself
                                details = { completedStages, totalStages };
                                break;

                            case 'VENTURE':
                                // Check if user has created or joined a venture
                                const userVentures = await prisma.venture.count({
                                    where: {
                                        OR: [
                                            { ownerId: userId },
                                            {
                                                members: {
                                                    some: { userId: userId }
                                                }
                                            }
                                        ]
                                    }
                                });
                                isPassed = userVentures > 0;
                                details = { ventureCount: userVentures };
                                break;

                            case 'TEAM':
                                // Check if user has created or joined a team
                                const userTeams = await prisma.team.count({
                                    where: {
                                        OR: [
                                            { ownerId: userId },
                                            {
                                                members: {
                                                    some: { userId: userId }
                                                }
                                            }
                                        ]
                                    }
                                });
                                isPassed = userTeams > 0;
                                details = { teamCount: userTeams };
                                break;

                            case 'PROJECT':
                                // Check if user has created or joined a project
                                const userProjects = await prisma.project.count({
                                    where: {
                                        OR: [
                                            { ownerId: userId },
                                            {
                                                members: {
                                                    some: { userId: userId }
                                                }
                                            }
                                        ]
                                    }
                                });
                                isPassed = userProjects > 0;
                                details = { projectCount: userProjects };
                                break;

                            case 'LEGAL_ENTITY':
                                // Check if user has at least one company or is part of a company
                                const userCompanies = await prisma.company.count({
                                    where: {
                                        OR: [
                                            { ownerId: userId },
                                            {
                                                team: {
                                                    some: {
                                                        members: {
                                                            some: { userId: userId }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                });
                                isPassed = userCompanies > 0;
                                details = { companyCount: userCompanies };
                                break;

                            case 'EQUITY':
                                // Check if user has equity in any project/venture
                                // Assuming a Contribution or Portfolio table tracks equity assignments
                                const equityContributions = await prisma.contribution.count({
                                    where: {
                                        userId: userId,
                                        equityPercentage: { gt: 0 }
                                    }
                                }).catch(() => 0);
                                isPassed = (equityContributions || 0) > 0;
                                details = { equityAssignments: equityContributions || 0 };
                                break;

                            default:
                                isPassed = false;
                                details = { message: 'Custom gate logic not implemented' };
                        }

                        return {
                            gateId: gate.id,
                            gateName: gate.name,
                            gateType: gate.gateType,
                            isRequired: gate.isRequired,
                            isPassed,
                            details
                        };
                    })
                );

                return {
                    stageId: stage.id,
                    stageName: stage.name,
                    stageOrder: stage.order,
                    gates: gateChecks,
                    allGatesPassed: gateChecks.every(gate => !gate.isRequired || gate.isPassed)
                };
            })
        );

        res.json({
            success: true,
            data: gateStatuses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to check journey gates',
            details: error.message
        });
    }
});

// Get all journey stages
router.get('/stages', async(req, res) => {
    try {
        const stages = await prisma.journeyStage.findMany({
            where: { isActive: true },
            include: {
                gates: {
                    where: { isActive: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        res.json({
            success: true,
            data: stages,
            count: stages.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journey stages',
            details: error.message
        });
    }
});

// Create a journey stage (admin)
router.post('/stages', async(req, res) => {
    try {
        const { name, description, order, gates } = req.body;

        if (!name || order === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, order'
            });
        }

        const stage = await prisma.journeyStage.create({
            data: {
                name,
                description,
                order: parseInt(order),
                gates: {
                    create: gates || []
                }
            },
            include: {
                gates: true
            }
        });

        res.status(201).json({
            success: true,
            data: stage,
            message: 'Journey stage created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create journey stage',
            details: error.message
        });
    }
});

// Create a journey gate (admin)
router.post('/gates', async(req, res) => {
    try {
        const { stageId, name, description, gateType, isRequired = true } = req.body;

        if (!stageId || !name || !gateType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: stageId, name, gateType'
            });
        }

        const gate = await prisma.journeyGate.create({
            data: {
                stageId,
                name,
                description,
                gateType,
                isRequired
            }
        });

        res.status(201).json({
            success: true,
            data: gate,
            message: 'Journey gate created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create journey gate',
            details: error.message
        });
    }
});

// Get journey state for a specific user (frontend relies on this endpoint)
router.get('/state/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'Missing userId' });
        }

        // Ensure user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Get all stages and user states
        const stages = await prisma.journeyStage.findMany({ orderBy: { order: 'asc' } });
        const userStates = await prisma.userJourneyState.findMany({ where: { userId } });

        // Initialize first stage if user has no states yet
        if (stages.length > 0 && userStates.length === 0) {
            await prisma.userJourneyState.create({
                data: {
                    userId,
                    stageId: stages[0].id,
                    status: 'IN_PROGRESS',
                    startedAt: new Date(),
                }
            });
        }

        const freshStates = userStates.length === 0 ?
            await prisma.userJourneyState.findMany({ where: { userId } }) :
            userStates;

        const totalStages = stages.length;
        const completedStages = freshStates.filter(s => s.status === 'COMPLETED').length;
        const currentStageObj = freshStates.find(s => s.status === 'IN_PROGRESS');
        const currentStageIndex = currentStageObj ?
            stages.findIndex(s => s.id === currentStageObj.stageId) :
            Math.min(completedStages, Math.max(0, totalStages - 1));
        const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

        return res.json({
            success: true,
            data: {
                currentStage: currentStageIndex >= 0 ? currentStageIndex : 0,
                completedStages: freshStates
                    .filter(s => s.status === 'COMPLETED')
                    .map(s => stages.findIndex(st => st.id === s.stageId))
                    .filter(i => i >= 0),
                totalStages,
                progress,
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to fetch journey state', details: error.message });
    }
});

// Get all user journey states (admin)
router.get('/states', async(req, res) => {
    try {
        const { userId, status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (userId) where.userId = userId;
        if (status) where.status = status;

        const [states, total] = await Promise.all([
            prisma.userJourneyState.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    },
                    stage: {
                        include: {
                            gates: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.userJourneyState.count({ where })
        ]);

        res.json({
            success: true,
            data: states,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journey states',
            details: error.message
        });
    }
});

// ===== ONBOARDING ORCHESTRATOR ENDPOINTS =====

// Initialize user journey
router.post('/initialize/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can initialize this journey (own journey or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const result = await onboardingOrchestrator.initializeUserJourney(userId);
        res.json(result);
    } catch (error) {
        console.error('Journey initialization error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initialize user journey',
            details: error.message
        });
    }
});

// Update journey progress
router.post('/progress/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { action, data } = req.body;
        const currentUserId = req.user.id;

        // Check if user can update this journey (own journey or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'Action is required'
            });
        }

        // Log all actions for audit trail
        await prisma.onboardingAuditLog.create({
            data: {
                userId,
                action,
                data: JSON.stringify(data),
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                timestamp: new Date()
            }
        });

        // Handle special actions with enhanced data persistence
        if (action === 'AUTO_SAVE') {
            // Auto-save form data to UserJourneyState metadata
            const currentStage = await prisma.userJourneyState.findFirst({
                where: {
                    userId,
                    status: 'IN_PROGRESS'
                }
            });

            if (currentStage) {
                await prisma.userJourneyState.update({
                    where: { id: currentStage.id },
                    data: {
                        metadata: {
                            ...currentStage.metadata,
                            ...data,
                            lastAutoSave: new Date().toISOString()
                        },
                        updatedAt: new Date()
                    }
                });
            }

            return res.json({
                success: true,
                message: 'Data auto-saved successfully',
                timestamp: new Date().toISOString()
            });
        }

        if (action === 'LEGAL_DOCUMENT_SIGNED') {
            // Handle digital signature storage
            const { documentType, signatureData } = data;

            // Create or update PlatformLegalPack
            await prisma.platformLegalPack.upsert({
                where: { userId },
                update: {
                    status: 'SIGNED',
                    signedAt: new Date(),
                    updatedAt: new Date()
                },
                create: {
                    userId,
                    status: 'SIGNED',
                    signedAt: new Date()
                }
            });

            // Store signature details in journey metadata
            const currentStage = await prisma.userJourneyState.findFirst({
                where: {
                    userId,
                    status: 'IN_PROGRESS'
                }
            });

            if (currentStage) {
                await prisma.userJourneyState.update({
                    where: { id: currentStage.id },
                    data: {
                        metadata: {
                            ...currentStage.metadata,
                            legalSignatures: {
                                ...(currentStage.metadata && currentStage.metadata.legalSignatures ? currentStage.metadata.legalSignatures : {}),
                                [documentType]: {
                                    ...signatureData,
                                    ipAddress: req.ip,
                                    userAgent: req.headers['user-agent'],
                                    signedAt: new Date().toISOString()
                                }
                            }
                        },
                        updatedAt: new Date()
                    }
                });
            }

            return res.json({
                success: true,
                message: 'Legal document signed and stored successfully',
                signatureHash: signatureData.signatureHash,
                timestamp: new Date().toISOString()
            });
        }

        // Handle step completion actions (including trial activation)
        if (action === 'PROFILE_COMPLETED' || action === 'LEGAL_PACK_SIGNED' || action === 'SUBSCRIPTION_ACTIVATED' || action === 'ORIENTATION_COMPLETED') {
            // Mark the corresponding journey stage as completed
            const stageMapping = {
                'PROFILE_COMPLETED': 'Profile Setup',
                'LEGAL_PACK_SIGNED': 'Platform Legal Pack',
                'SUBSCRIPTION_ACTIVATED': 'Subscription Selection',
                'ORIENTATION_COMPLETED': 'Platform Orientation'
            };

            const stageName = stageMapping[action];
            if (stageName) {
                const stage = await prisma.journeyStage.findFirst({
                    where: { name: stageName }
                });

                if (stage) {
                    await prisma.userJourneyState.upsert({
                        where: {
                            userId_stageId: {
                                userId,
                                stageId: stage.id
                            }
                        },
                        update: {
                            status: 'COMPLETED',
                            completedAt: new Date(),
                            metadata: {
                                ...data,
                                completedAt: new Date().toISOString(),
                                action: action
                            }
                        },
                        create: {
                            userId,
                            stageId: stage.id,
                            status: 'COMPLETED',
                            completedAt: new Date(),
                            metadata: {
                                ...data,
                                completedAt: new Date().toISOString(),
                                action: action
                            }
                        }
                    });
                }
            }

            return res.json({
                success: true,
                message: `Step ${stageName} completed successfully`,
                action: action,
                timestamp: new Date().toISOString()
            });
        }

        // Handle other actions with the orchestrator
        // Fallback: directly mark mapped stages completed if orchestrator not initialized
        try {
            const result = await onboardingOrchestrator.updateJourneyProgress(userId, action, data);
            return res.json(result);
        } catch (e) {
            // Soft-handle and map minimal actions
            const fallbackMap = {
                'PROFILE_COMPLETED': 'Profile Setup',
                'LEGAL_PACK_SIGNED': 'Platform Legal Pack',
                'SUBSCRIPTION_ACTIVATED': 'Subscription Selection',
                'ORIENTATION_COMPLETED': 'Platform Orientation',
                'ONBOARDING_COMPLETE': 'Welcome & Dashboard'
            };
            const stageName = fallbackMap[action];
            if (stageName) {
                const stage = await prisma.journeyStage.findFirst({ where: { name: stageName } });
                if (stage) {
                    await prisma.userJourneyState.upsert({
                        where: { userId_stageId: { userId, stageId: stage.id } },
                        update: { status: 'COMPLETED', completedAt: new Date(), metadata: {...data, action } },
                        create: { userId, stageId: stage.id, status: 'COMPLETED', completedAt: new Date(), metadata: {...data, action } }
                    });
                    const userStates = await prisma.userJourneyState.findMany({ where: { userId }, include: { stage: true } });
                    const totalStages = userStates.length;
                    const completedStages = userStates.filter(s => s.status === 'COMPLETED').length;
                    const percentage = totalStages ? Math.round(completedStages / totalStages * 100) : 0;
                    return res.json({ success: true, message: 'Progress updated (fallback)', action, progress: { totalStages, completedStages, percentage } });
                }
            }
            throw e;
        }
    } catch (error) {
        console.error('Journey progress update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update journey progress',
            details: error.message
        });
    }
});

// Handle legal document signing
router.post('/legal-signing/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { documentId, signatureData } = req.body;
        const currentUserId = req.user.id;

        // Check if user can update this journey (own journey or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Document ID is required'
            });
        }

        const result = await onboardingOrchestrator.handleLegalDocumentSigning(userId, documentId, signatureData);
        res.json(result);
    } catch (error) {
        console.error('Legal document signing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process legal document signing',
            details: error.message
        });
    }
});

// Handle subscription activation
router.post('/subscription/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const subscriptionData = req.body;
        const currentUserId = req.user.id;

        // Check if user can update this journey (own journey or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const result = await onboardingOrchestrator.handleSubscriptionActivation(userId, subscriptionData);
        res.json(result);
    } catch (error) {
        console.error('Subscription activation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process subscription activation',
            details: error.message
        });
    }
});

// Get onboarding recommendations
router.get('/recommendations/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Check if user can access this journey (own journey or admin)
        if (userId !== currentUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const result = await onboardingOrchestrator.getOnboardingRecommendations(userId);
        res.json(result);
    } catch (error) {
        console.error('Onboarding recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get onboarding recommendations',
            details: error.message
        });
    }
});

// ===== SEEDING ENDPOINT =====
router.post('/seed', async(req, res) => {
    try {
        console.log('🌱 Seeding journey stages...');

        // Create default journey stages
        const defaultStages = [{
                name: 'Welcome',
                description: 'Welcome to SmartStart! Complete your profile setup.',
                order: 1,
                isActive: true
            },
            {
                name: 'Profile Setup',
                description: 'Complete your user profile with skills and preferences.',
                order: 2,
                isActive: true
            },
            {
                name: 'Legal Documents',
                description: 'Review and sign all required legal agreements (Platform Agreement, NDAs, Terms of Service).',
                order: 3,
                isActive: true
            },
            {
                name: 'Subscription Setup',
                description: 'Choose and activate your subscription plan to unlock full platform features.',
                order: 4,
                isActive: true
            },
            {
                name: 'First Venture',
                description: 'Create your first venture or join an existing one.',
                order: 5,
                isActive: true
            },
            {
                name: 'Team Building',
                description: 'Build your team and start collaborating.',
                order: 6,
                isActive: true
            }
        ];

        // Create journey stages (check if they already exist first)
        for (const stageData of defaultStages) {
            const existingStage = await prisma.journeyStage.findFirst({
                where: { name: stageData.name }
            });

            if (!existingStage) {
                await prisma.journeyStage.create({
                    data: stageData
                });
            } else {
                // Update existing stage
                await prisma.journeyStage.update({
                    where: { id: existingStage.id },
                    data: {
                        description: stageData.description,
                        order: stageData.order,
                        isActive: stageData.isActive
                    }
                });
            }
        }

        console.log(`✅ Created ${defaultStages.length} journey stages`);

        res.json({
            success: true,
            message: 'Journey stages seeded successfully',
            stagesCreated: defaultStages.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Journey seeding error:', error);
        res.status(500).json({
            success: false,
            message: 'Journey seeding failed',
            error: error.message
        });
    }
});

module.exports = router;