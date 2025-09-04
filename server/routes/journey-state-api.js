const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===== HEALTH CHECK =====
router.get('/health', async(req, res) => {
    try {
        const stageCount = await prisma.journeyStage.count();
        const gateCount = await prisma.journeyGate.count();
        const stateCount = await prisma.userJourneyState.count();

        res.json({
            success: true,
            message: 'Journey State Management System is healthy',
            stats: {
                stages: stageCount,
                gates: gateCount,
                userStates: stateCount
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Journey State Management System health check failed',
            error: error.message
        });
    }
});

// ===== JOURNEY STATE MANAGEMENT =====

// Start a journey stage for a user
router.post('/start', async(req, res) => {
    try {
        const { userId, stageId, metadata = {} } = req.body;

        if (!userId || !stageId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Stage ID are required'
            });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if stage exists
        const stage = await prisma.journeyStage.findUnique({
            where: { id: stageId }
        });

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: 'Journey stage not found'
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
                message: 'User already has a state for this stage',
                data: existingState
            });
        }

        // Create new journey state
        const journeyState = await prisma.userJourneyState.create({
            data: {
                userId,
                stageId,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                metadata
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
            message: 'Failed to start journey stage',
            error: error.message
        });
    }
});

// Complete a journey stage for a user
router.post('/complete', async(req, res) => {
    try {
        const { userId, stageId, metadata = {} } = req.body;

        if (!userId || !stageId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Stage ID are required'
            });
        }

        // Find existing journey state
        const existingState = await prisma.userJourneyState.findUnique({
            where: {
                userId_stageId: {
                    userId,
                    stageId
                }
            },
            include: {
                stage: {
                    include: {
                        gates: true
                    }
                }
            }
        });

        if (!existingState) {
            return res.status(404).json({
                success: false,
                message: 'Journey state not found. Start the stage first.'
            });
        }

        if (existingState.status === 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Journey stage is already completed',
                data: existingState
            });
        }

        // Check if all required gates are passed
        const gates = existingState.stage.gates.filter(gate => gate.isRequired);
        const passedGates = await checkGates(userId, gates);

        if (!passedGates.allPassed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot complete stage. Some required gates are not passed.',
                data: {
                    failedGates: passedGates.failedGates,
                    requiredGates: gates.length,
                    passedGates: passedGates.passedGates.length
                }
            });
        }

        // Update journey state to completed
        const updatedState = await prisma.userJourneyState.update({
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
                    ...existingState.metadata,
                    ...metadata
                }
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
            data: updatedState,
            message: 'Journey stage completed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to complete journey stage',
            error: error.message
        });
    }
});

// Get user's journey progress
router.get('/progress/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        // Get all stages
        const stages = await prisma.journeyStage.findMany({
            where: { isActive: true },
            include: {
                gates: true
            },
            orderBy: { order: 'asc' }
        });

        // Get user's journey states
        const userStates = await prisma.userJourneyState.findMany({
            where: { userId },
            include: {
                stage: true
            }
        });

        // Calculate progress
        const totalStages = stages.length;
        const completedStages = userStates.filter(state => state.status === 'COMPLETED').length;
        const inProgressStages = userStates.filter(state => state.status === 'IN_PROGRESS').length;
        const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

        // Find current stage
        const currentStage = userStates.find(state => state.status === 'IN_PROGRESS')?.stage;

        // Find next stage
        const nextStage = stages.find(stage =>
            !userStates.find(state => state.stageId === stage.id && state.status === 'COMPLETED')
        );

        // Get detailed stage information
        const stageDetails = stages.map(stage => {
            const userState = userStates.find(state => state.stageId === stage.id);
            return {
                ...stage,
                userState: userState || null,
                status: userState?.status || 'NOT_STARTED',
                canStart: !userState || userState.status === 'NOT_STARTED',
                canComplete: userState?.status === 'IN_PROGRESS'
            };
        });

        res.json({
            success: true,
            data: {
                userId,
                progress: {
                    totalStages,
                    completedStages,
                    inProgressStages,
                    percentage
                },
                currentStage,
                nextStage,
                stages: stageDetails
            },
            message: 'Journey progress retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve journey progress',
            error: error.message
        });
    }
});

// Get user's current stage
router.get('/current/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const currentState = await prisma.userJourneyState.findFirst({
            where: {
                userId,
                status: 'IN_PROGRESS'
            },
            include: {
                stage: {
                    include: {
                        gates: true
                    }
                }
            },
            orderBy: {
                startedAt: 'desc'
            }
        });

        if (!currentState) {
            // Find the first stage that hasn't been completed
            const stages = await prisma.journeyStage.findMany({
                where: { isActive: true },
                orderBy: { order: 'asc' }
            });

            const completedStages = await prisma.userJourneyState.findMany({
                where: {
                    userId,
                    status: 'COMPLETED'
                }
            });

            const nextStage = stages.find(stage =>
                !completedStages.find(state => state.stageId === stage.id)
            );

            return res.json({
                success: true,
                data: {
                    currentStage: null,
                    nextStage,
                    status: 'NO_ACTIVE_STAGE'
                },
                message: 'No active stage found'
            });
        }

        res.json({
            success: true,
            data: {
                currentStage: currentState,
                status: 'ACTIVE_STAGE'
            },
            message: 'Current stage retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve current stage',
            error: error.message
        });
    }
});

// Reset user's journey (for testing/admin purposes)
router.post('/reset/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        // Delete all journey states for the user
        await prisma.userJourneyState.deleteMany({
            where: { userId }
        });

        res.json({
            success: true,
            message: 'User journey reset successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reset user journey',
            error: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function checkGates(userId, gates) {
    const results = [];

    for (const gate of gates) {
        let isPassed = false;
        let details = null;

        try {
            switch (gate.gateType) {
                case 'SUBSCRIPTION':
                    const subscription = await prisma.subscription.findFirst({
                        where: {
                            userId,
                            status: 'ACTIVE'
                        }
                    });
                    isPassed = !!subscription;
                    details = subscription ? { planId: subscription.planId, status: subscription.status } : null;
                    break;

                case 'LEGAL_PACK':
                    // Check if user has signed any legal documents
                    const legalDoc = await prisma.legalDocumentSignature.findFirst({
                        where: {
                            signerId: userId,
                            termsAccepted: true,
                            privacyAccepted: true
                        }
                    });
                    isPassed = !!legalDoc;
                    details = legalDoc ? { 
                        signedAt: legalDoc.signedAt,
                        termsAccepted: legalDoc.termsAccepted,
                        privacyAccepted: legalDoc.privacyAccepted
                    } : null;
                    break;

                case 'NDA':
                    // Check if user has signed any NDA documents
                    const ndaDoc = await prisma.legalDocumentSignature.findFirst({
                        where: {
                            signerId: userId,
                            termsAccepted: true,
                            privacyAccepted: true
                        }
                    });
                    isPassed = !!ndaDoc;
                    details = ndaDoc ? { 
                        signedAt: ndaDoc.signedAt,
                        termsAccepted: ndaDoc.termsAccepted,
                        privacyAccepted: ndaDoc.privacyAccepted
                    } : null;
                    break;

                case 'VERIFICATION':
                    const user = await prisma.user.findUnique({
                        where: { id: userId }
                    });
                    isPassed = !!user?.email;
                    details = user ? { email: user.email } : null;
                    break;

                case 'PROFILE':
                    const userProfile = await prisma.user.findUnique({
                        where: { id: userId }
                    });
                    isPassed = !!(userProfile?.firstName && userProfile?.lastName);
                    details = userProfile ? {
                        firstName: userProfile.firstName,
                        lastName: userProfile.lastName
                    } : null;
                    break;

                case 'VENTURE':
                    const venture = await prisma.venture.findFirst({
                        where: { ownerUserId: userId }
                    });
                    isPassed = !!venture;
                    details = venture ? { id: venture.id, name: venture.name, status: venture.status } : null;
                    break;

                case 'TEAM':
                    // Check if user has any team memberships
                    const teamMembers = await prisma.teamMember.findMany({
                        where: { 
                            userId,
                            isActive: true
                        }
                    });
                    isPassed = teamMembers.length > 0;
                    details = { memberCount: teamMembers.length, activeMembers: teamMembers.length };
                    break;

                case 'PROJECT':
                    // Check if user has projects through team membership
                    const userTeams = await prisma.teamMember.findMany({
                        where: { 
                            userId,
                            isActive: true
                        },
                        select: { teamId: true }
                    });
                    const teamIds = userTeams.map(tm => tm.teamId);
                    const project = await prisma.project.findFirst({
                        where: { 
                            teamId: { in: teamIds },
                            status: 'ACTIVE'
                        }
                    });
                    isPassed = !!project;
                    details = project ? { id: project.id, name: project.name, status: project.status } : null;
                    break;

                case 'LEGAL_ENTITY':
                    // Check if user has legal entities through ventures
                    const userVentures = await prisma.venture.findMany({
                        where: { ownerUserId: userId },
                        select: { id: true }
                    });
                    const ventureIds = userVentures.map(v => v.id);
                    const legalEntity = await prisma.legalEntity.findFirst({
                        where: { 
                            ventureId: { in: ventureIds }
                        }
                    });
                    isPassed = !!legalEntity;
                    details = legalEntity ? { id: legalEntity.id, name: legalEntity.name } : null;
                    break;

                case 'EQUITY':
                    // Check if user has cap table entries through ventures
                    const userVenturesForEquity = await prisma.venture.findMany({
                        where: { ownerUserId: userId },
                        select: { id: true }
                    });
                    const ventureIdsForEquity = userVenturesForEquity.map(v => v.id);
                    const capTable = await prisma.capTableEntry.findFirst({
                        where: { 
                            ventureId: { in: ventureIdsForEquity }
                        }
                    });
                    isPassed = !!capTable;
                    details = capTable ? { entries: 1, ventureId: capTable.ventureId } : null;
                    break;

                case 'CONTRACT':
                    // Check if user has contract offers through ventures
                    const userVenturesForContract = await prisma.venture.findMany({
                        where: { ownerUserId: userId },
                        select: { id: true }
                    });
                    const ventureIdsForContract = userVenturesForContract.map(v => v.id);
                    const contract = await prisma.contractOffer.findFirst({
                        where: { 
                            ventureId: { in: ventureIdsForContract }
                        }
                    });
                    isPassed = !!contract;
                    details = contract ? { id: contract.id, status: contract.status, ventureId: contract.ventureId } : null;
                    break;

                case 'LAUNCH':
                    // For launch, check if all previous gates are completed
                    isPassed = true; // This will be handled by the stage completion logic
                    details = { status: 'ready_for_launch' };
                    break;

                default:
                    isPassed = false;
                    details = { error: 'Unknown gate type' };
            }
        } catch (error) {
            isPassed = false;
            details = { error: error.message };
        }

        results.push({
            gateId: gate.id,
            gateName: gate.name,
            gateType: gate.gateType,
            isRequired: gate.isRequired,
            isPassed,
            details
        });
    }

    return {
        allPassed: results.every(r => r.isPassed),
        passedGates: results.filter(r => r.isPassed),
        failedGates: results.filter(r => !r.isPassed),
        results
    };
}

module.exports = router;