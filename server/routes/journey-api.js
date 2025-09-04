const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

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

// Get user's journey status
router.get('/status/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

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

        // Calculate progress
        const totalStages = stages.length;
        const completedStages = userStates.filter(state => state.status === 'COMPLETED').length;
        const currentStage = userStates.find(state => state.status === 'IN_PROGRESS') ? .stage;
        const nextStage = stages.find(stage =>
            !userStates.find(state => state.stageId === stage.id && state.status === 'COMPLETED')
        );

        res.json({
            success: true,
            data: {
                userStates,
                stages,
                progress: {
                    totalStages,
                    completedStages,
                    percentage: Math.round((completedStages / totalStages) * 100),
                    currentStage,
                    nextStage
                }
            }
        });
    } catch (error) {
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
                                isPassed = !!user?.email; // Basic email verification
                                details = user ? { email: user.email } : null;
                                break;

                            case 'PROFILE':
                                const userProfile = await prisma.user.findUnique({
                                    where: { id: userId }
                                });
                                isPassed = !!(userProfile?.name && userProfile?.firstName && userProfile?.lastName);
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

module.exports = router;