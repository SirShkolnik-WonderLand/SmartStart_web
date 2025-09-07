/**
 * Venture State Machine
 * Manages venture lifecycle from ideation to exit
 * Handles team building, funding, development, and legal compliance
 */

const { createMachine, interpret, assign } = require('xstate');
const { PrismaClient } = require('@prisma/client');
const EventEmitter = require('events');

const prisma = new PrismaClient();

/**
 * Venture State Machine Definition
 * Tracks venture progression from idea to successful business
 */
const ventureMachine = createMachine({
    id: 'venture',
    initial: 'ideation',
    context: {
        ventureId: null,
        ownerId: null,
        ventureName: null,
        ventureType: null,
        currentStage: 'IDEATION',
        teamMembers: [],
        fundingRounds: [],
        legalDocuments: [],
        milestones: [],
        completedMilestones: [],
        riskLevel: 'LOW',
        marketValidation: null,
        productDevelopment: null,
        businessModel: null,
        revenue: 0,
        expenses: 0,
        lastActivity: null,
        ventureStartDate: null,
        estimatedCompletionDate: null,
        auditTrail: []
    },
    states: {
        ideation: {
            entry: ['logStateChange', 'updateVentureStatus'],
            on: {
                IDEA_SUBMITTED: {
                    target: 'idea_review',
                    actions: ['submitIdea', 'logStateChange']
                },
                IDEA_ABANDONED: {
                    target: 'abandoned',
                    actions: ['abandonIdea', 'logStateChange']
                },
                TEAM_FORMATION_STARTED: {
                    target: 'team_building',
                    actions: ['startTeamFormation', 'logStateChange']
                }
            }
        },

        idea_review: {
            entry: ['logStateChange', 'updateVentureStatus', 'notifyReviewers'],
            on: {
                IDEA_APPROVED: {
                    target: 'team_building',
                    actions: ['approveIdea', 'logStateChange']
                },
                IDEA_REJECTED: {
                    target: 'rejected',
                    actions: ['rejectIdea', 'logStateChange']
                },
                IDEA_REVISION_REQUESTED: {
                    target: 'ideation',
                    actions: ['requestRevision', 'logStateChange']
                }
            }
        },

        team_building: {
            entry: ['logStateChange', 'updateVentureStatus'],
            on: {
                TEAM_MEMBER_ADDED: {
                    target: 'team_building',
                    actions: ['addTeamMember', 'checkTeamComplete', 'logStateChange']
                },
                TEAM_COMPLETE: {
                    target: 'market_validation',
                    actions: ['completeTeamBuilding', 'logStateChange']
                },
                TEAM_DISBANDED: {
                    target: 'abandoned',
                    actions: ['disbandTeam', 'logStateChange']
                }
            }
        },

        market_validation: {
            entry: ['logStateChange', 'updateVentureStatus', 'startMarketValidation'],
            on: {
                MARKET_RESEARCH_COMPLETE: {
                    target: 'market_validation',
                    actions: ['completeMarketResearch', 'logStateChange']
                },
                VALIDATION_POSITIVE: {
                    target: 'product_development',
                    actions: ['validateMarket', 'logStateChange']
                },
                VALIDATION_NEGATIVE: {
                    target: 'pivot_required',
                    actions: ['invalidateMarket', 'logStateChange']
                },
                FUNDING_ROUND_INITIATED: {
                    target: 'funding',
                    actions: ['initiateFunding', 'logStateChange']
                }
            }
        },

        pivot_required: {
            entry: ['logStateChange', 'updateVentureStatus', 'notifyPivotRequired'],
            on: {
                PIVOT_COMPLETE: {
                    target: 'market_validation',
                    actions: ['completePivot', 'logStateChange']
                },
                PIVOT_ABANDONED: {
                    target: 'abandoned',
                    actions: ['abandonPivot', 'logStateChange']
                }
            }
        },

        product_development: {
            entry: ['logStateChange', 'updateVentureStatus', 'startProductDevelopment'],
            on: {
                MVP_COMPLETE: {
                    target: 'product_development',
                    actions: ['completeMVP', 'logStateChange']
                },
                BETA_LAUNCH: {
                    target: 'beta_testing',
                    actions: ['launchBeta', 'logStateChange']
                },
                FUNDING_ROUND_INITIATED: {
                    target: 'funding',
                    actions: ['initiateFunding', 'logStateChange']
                },
                DEVELOPMENT_STALLED: {
                    target: 'development_stalled',
                    actions: ['stallDevelopment', 'logStateChange']
                }
            }
        },

        beta_testing: {
            entry: ['logStateChange', 'updateVentureStatus', 'startBetaTesting'],
            on: {
                BETA_FEEDBACK_RECEIVED: {
                    target: 'beta_testing',
                    actions: ['processBetaFeedback', 'logStateChange']
                },
                BETA_SUCCESSFUL: {
                    target: 'product_development',
                    actions: ['completeBetaTesting', 'logStateChange']
                },
                BETA_FAILED: {
                    target: 'pivot_required',
                    actions: ['failBetaTesting', 'logStateChange']
                },
                LAUNCH_READY: {
                    target: 'launch',
                    actions: ['prepareLaunch', 'logStateChange']
                }
            }
        },

        funding: {
            entry: ['logStateChange', 'updateVentureStatus', 'startFundingProcess'],
            on: {
                FUNDING_ROUND_COMPLETE: {
                    target: 'funding',
                    actions: ['completeFundingRound', 'checkFundingComplete', 'logStateChange']
                },
                FUNDING_SUCCESSFUL: {
                    target: 'product_development',
                    actions: ['successfulFunding', 'logStateChange']
                },
                FUNDING_FAILED: {
                    target: 'funding_failed',
                    actions: ['failedFunding', 'logStateChange']
                }
            }
        },

        launch: {
            entry: ['logStateChange', 'updateVentureStatus', 'launchProduct'],
            on: {
                LAUNCH_SUCCESSFUL: {
                    target: 'growth',
                    actions: ['successfulLaunch', 'logStateChange']
                },
                LAUNCH_FAILED: {
                    target: 'launch_failed',
                    actions: ['failedLaunch', 'logStateChange']
                },
                EARLY_TRACTION: {
                    target: 'growth',
                    actions: ['achieveEarlyTraction', 'logStateChange']
                }
            }
        },

        growth: {
            entry: ['logStateChange', 'updateVentureStatus', 'startGrowthPhase'],
            on: {
                REVENUE_MILESTONE: {
                    target: 'growth',
                    actions: ['achieveRevenueMilestone', 'logStateChange']
                },
                SCALE_UP: {
                    target: 'scaling',
                    actions: ['initiateScaleUp', 'logStateChange']
                },
                SERIES_A_FUNDING: {
                    target: 'funding',
                    actions: ['initiateSeriesA', 'logStateChange']
                },
                GROWTH_STALLED: {
                    target: 'growth_stalled',
                    actions: ['stallGrowth', 'logStateChange']
                }
            }
        },

        scaling: {
            entry: ['logStateChange', 'updateVentureStatus', 'startScalingPhase'],
            on: {
                SCALE_SUCCESSFUL: {
                    target: 'mature',
                    actions: ['successfulScaling', 'logStateChange']
                },
                SCALE_FAILED: {
                    target: 'scaling_failed',
                    actions: ['failedScaling', 'logStateChange']
                },
                SERIES_B_FUNDING: {
                    target: 'funding',
                    actions: ['initiateSeriesB', 'logStateChange']
                }
            }
        },

        mature: {
            entry: ['logStateChange', 'updateVentureStatus', 'achieveMaturity'],
            on: {
                EXIT_OPPORTUNITY: {
                    target: 'exit_negotiation',
                    actions: ['identifyExitOpportunity', 'logStateChange']
                },
                IPO_PREPARATION: {
                    target: 'ipo_preparation',
                    actions: ['prepareIPO', 'logStateChange']
                },
                ACQUISITION_OFFER: {
                    target: 'acquisition_negotiation',
                    actions: ['receiveAcquisitionOffer', 'logStateChange']
                }
            }
        },

        exit_negotiation: {
            entry: ['logStateChange', 'updateVentureStatus', 'startExitNegotiation'],
            on: {
                EXIT_SUCCESSFUL: {
                    target: 'exited',
                    actions: ['successfulExit', 'logStateChange']
                },
                EXIT_FAILED: {
                    target: 'mature',
                    actions: ['failedExit', 'logStateChange']
                }
            }
        },

        ipo_preparation: {
            entry: ['logStateChange', 'updateVentureStatus', 'startIPOPreparation'],
            on: {
                IPO_SUCCESSFUL: {
                    target: 'public',
                    actions: ['successfulIPO', 'logStateChange']
                },
                IPO_FAILED: {
                    target: 'mature',
                    actions: ['failedIPO', 'logStateChange']
                }
            }
        },

        acquisition_negotiation: {
            entry: ['logStateChange', 'updateVentureStatus', 'startAcquisitionNegotiation'],
            on: {
                ACQUISITION_SUCCESSFUL: {
                    target: 'acquired',
                    actions: ['successfulAcquisition', 'logStateChange']
                },
                ACQUISITION_FAILED: {
                    target: 'mature',
                    actions: ['failedAcquisition', 'logStateChange']
                }
            }
        },

        // Terminal states
        public: {
            entry: ['logStateChange', 'updateVentureStatus', 'achievePublicStatus'],
            type: 'final'
        },

        acquired: {
            entry: ['logStateChange', 'updateVentureStatus', 'achieveAcquisition'],
            type: 'final'
        },

        exited: {
            entry: ['logStateChange', 'updateVentureStatus', 'achieveExit'],
            type: 'final'
        },

        abandoned: {
            entry: ['logStateChange', 'updateVentureStatus', 'handleAbandonment'],
            type: 'final'
        },

        rejected: {
            entry: ['logStateChange', 'updateVentureStatus', 'handleRejection'],
            type: 'final'
        },

        // Failure states
        development_stalled: {
            entry: ['logStateChange', 'updateVentureStatus', 'handleDevelopmentStall'],
            on: {
                DEVELOPMENT_RESUMED: {
                    target: 'product_development',
                    actions: ['resumeDevelopment', 'logStateChange']
                },
                VENTURE_ABANDONED: {
                    target: 'abandoned',
                    actions: ['abandonVenture', 'logStateChange']
                }
            }
        },

        funding_failed: {
            entry: ['logStateChange', 'updateVentureStatus', 'handleFundingFailure'],
            on: {
                FUNDING_RETRY: {
                    target: 'funding',
                    actions: ['retryFunding', 'logStateChange']
                },
                VENTURE_ABANDONED: {
                    target: 'abandoned',
                    actions: ['abandonVenture', 'logStateChange']
                }
            }
        },

        launch_failed: {
            entry: ['logStateChange', 'updateVentureStatus', 'handleLaunchFailure'],
            on: {
                LAUNCH_RETRY: {
                    target: 'launch',
                    actions: ['retryLaunch', 'logStateChange']
                },
                PIVOT_REQUIRED: {
                    target: 'pivot_required',
                    actions: ['requirePivot', 'logStateChange']
                }
            }
        },

        growth_stalled: {
            entry: ['logStateChange', 'updateVentureStatus', 'handleGrowthStall'],
            on: {
                GROWTH_RESUMED: {
                    target: 'growth',
                    actions: ['resumeGrowth', 'logStateChange']
                },
                PIVOT_REQUIRED: {
                    target: 'pivot_required',
                    actions: ['requirePivot', 'logStateChange']
                }
            }
        },

        scaling_failed: {
            entry: ['logStateChange', 'updateVentureStatus', 'handleScalingFailure'],
            on: {
                SCALING_RETRY: {
                    target: 'scaling',
                    actions: ['retryScaling', 'logStateChange']
                },
                RETURN_TO_GROWTH: {
                    target: 'growth',
                    actions: ['returnToGrowth', 'logStateChange']
                }
            }
        }
    }
}, {
    guards: {
        hasMinimumTeam: (context) => {
            return context.teamMembers.length >= 2; // Minimum team size
        },
        hasMarketValidation: (context) => {
            return context.marketValidation && context.marketValidation.validated;
        },
        hasMVP: (context) => {
            return context.productDevelopment && context.productDevelopment.mvpComplete;
        },
        hasRevenue: (context) => {
            return context.revenue > 0;
        },
        hasGrowthMetrics: (context) => {
            return context.revenue > 10000; // $10k monthly revenue
        }
    },
    actions: {
        logStateChange: assign({
            auditTrail: (context, event) => [
                ...context.auditTrail,
                {
                    timestamp: new Date().toISOString(),
                    event: event.type,
                    from: event.from || 'unknown',
                    to: event.to || 'unknown',
                    ventureId: context.ventureId,
                    metadata: event.metadata || {}
                }
            ],
            lastActivity: () => new Date().toISOString()
        }),

        updateVentureStatus: async(context, event) => {
            try {
                await prisma.venture.update({
                    where: { id: context.ventureId },
                    data: {
                        status: event.to || 'UNKNOWN',
                        updatedAt: new Date()
                    }
                });
            } catch (error) {
                console.error('Failed to update venture status:', error);
            }
        },

        submitIdea: assign({
            milestones: (context) => [...context.milestones, 'IDEA_SUBMITTED'],
            completedMilestones: (context) => [...context.completedMilestones, 'IDEA_SUBMITTED']
        }),

        approveIdea: assign({
            milestones: (context) => [...context.milestones, 'IDEA_APPROVED'],
            completedMilestones: (context) => [...context.completedMilestones, 'IDEA_APPROVED']
        }),

        addTeamMember: assign({
            teamMembers: (context, event) => [
                ...context.teamMembers,
                {
                    userId: event.metadata?.userId,
                    role: event.metadata?.role,
                    joinedAt: new Date().toISOString()
                }
            ]
        }),

        checkTeamComplete: (context, event) => {
            if (context.teamMembers.length >= 3) { // Minimum viable team
                event.machine.send('TEAM_COMPLETE');
            }
        },

        completeTeamBuilding: assign({
            milestones: (context) => [...context.milestones, 'TEAM_COMPLETE'],
            completedMilestones: (context) => [...context.completedMilestones, 'TEAM_COMPLETE']
        }),

        validateMarket: assign({
            marketValidation: {
                validated: true,
                validatedAt: new Date().toISOString(),
                marketSize: (context, event) => event.metadata?.marketSize,
                targetAudience: (context, event) => event.metadata?.targetAudience
            },
            milestones: (context) => [...context.milestones, 'MARKET_VALIDATED'],
            completedMilestones: (context) => [...context.completedMilestones, 'MARKET_VALIDATED']
        }),

        completeMVP: assign({
            productDevelopment: {
                mvpComplete: true,
                completedAt: new Date().toISOString(),
                features: (context, event) => event.metadata?.features || []
            },
            milestones: (context) => [...context.milestones, 'MVP_COMPLETE'],
            completedMilestones: (context) => [...context.completedMilestones, 'MVP_COMPLETE']
        }),

        launchProduct: assign({
            milestones: (context) => [...context.milestones, 'PRODUCT_LAUNCHED'],
            completedMilestones: (context) => [...context.completedMilestones, 'PRODUCT_LAUNCHED']
        }),

        achieveRevenueMilestone: assign({
            revenue: (context, event) => event.metadata?.revenue || context.revenue,
            milestones: (context) => [...context.milestones, 'REVENUE_MILESTONE'],
            completedMilestones: (context) => [...context.completedMilestones, 'REVENUE_MILESTONE']
        }),

        successfulLaunch: assign({
            milestones: (context) => [...context.milestones, 'LAUNCH_SUCCESSFUL'],
            completedMilestones: (context) => [...context.completedMilestones, 'LAUNCH_SUCCESSFUL']
        }),

        successfulScaling: assign({
            milestones: (context) => [...context.milestones, 'SCALING_SUCCESSFUL'],
            completedMilestones: (context) => [...context.completedMilestones, 'SCALING_SUCCESSFUL']
        }),

        successfulExit: assign({
            milestones: (context) => [...context.milestones, 'SUCCESSFUL_EXIT'],
            completedMilestones: (context) => [...context.completedMilestones, 'SUCCESSFUL_EXIT']
        }),

        // Notification actions
        notifyReviewers: async(context, event) => {
            console.log(`Notifying reviewers for venture: ${context.ventureId}`);
        },

        notifyPivotRequired: async(context, event) => {
            console.log(`Notifying team of required pivot for venture: ${context.ventureId}`);
        },

        // Timer actions
        startMarketValidation: async(context, event) => {
            console.log(`Starting market validation for venture: ${context.ventureId}`);
        },

        startProductDevelopment: async(context, event) => {
            console.log(`Starting product development for venture: ${context.ventureId}`);
        },

        startBetaTesting: async(context, event) => {
            console.log(`Starting beta testing for venture: ${context.ventureId}`);
        },

        startFundingProcess: async(context, event) => {
            console.log(`Starting funding process for venture: ${context.ventureId}`);
        },

        startGrowthPhase: async(context, event) => {
            console.log(`Starting growth phase for venture: ${context.ventureId}`);
        },

        startScalingPhase: async(context, event) => {
            console.log(`Starting scaling phase for venture: ${context.ventureId}`);
        }
    }
});

/**
 * Venture State Machine Service
 */
class VentureStateMachine extends EventEmitter {
    constructor() {
        super();
        this.activeMachines = new Map();
    }

    /**
     * Create a new venture state machine
     */
    async createMachine(ventureId, initialContext = {}) {
        const context = {
            ventureId,
            ownerId: null,
            ventureName: null,
            ventureType: null,
            currentStage: 'IDEATION',
            teamMembers: [],
            fundingRounds: [],
            legalDocuments: [],
            milestones: [],
            completedMilestones: [],
            riskLevel: 'LOW',
            marketValidation: null,
            productDevelopment: null,
            businessModel: null,
            revenue: 0,
            expenses: 0,
            lastActivity: new Date().toISOString(),
            ventureStartDate: new Date().toISOString(),
            estimatedCompletionDate: null,
            auditTrail: [],
            ...initialContext
        };

        const machine = interpret(ventureMachine.withContext(context));

        machine.onTransition((state) => {
            console.log(`Venture ${ventureId} transitioned to:`, state.value);
            this.handleStateChange(ventureId, state);
        });

        this.activeMachines.set(ventureId, machine);
        machine.start();
        return machine;
    }

    /**
     * Send event to venture state machine
     */
    async sendEvent(ventureId, event) {
        const machine = this.activeMachines.get(ventureId);
        if (machine) {
            machine.send(event);
        } else {
            console.error(`No venture state machine found for venture: ${ventureId}`);
        }
    }

    /**
     * Get current state of venture
     */
    getState(ventureId) {
        const machine = this.activeMachines.get(ventureId);
        return machine ? machine.state : null;
    }

    /**
     * Handle state changes
     */
    async handleStateChange(ventureId, state) {
        // Emit events for cross-machine coordination
        if (state.value === 'team_building' && state.changed) {
            this.emit('ventureCreated', {
                ventureId,
                ownerId: state.context.ownerId,
                ventureType: state.context.ventureType
            });
        }

        if (state.value === 'launch' && state.changed) {
            this.emit('ventureLaunching', {
                ventureId,
                ownerId: state.context.ownerId
            });
        }

        if (state.value === 'growth' && state.changed) {
            this.emit('ventureGrowing', {
                ventureId,
                ownerId: state.context.ownerId,
                revenue: state.context.revenue
            });
        }
    }

    /**
     * Get venture analytics
     */
    async getVentureAnalytics(ventureId) {
        const state = this.getState(ventureId);
        if (!state) {
            return null;
        }

        return {
            ventureId,
            currentStage: state.value,
            milestones: state.context.milestones,
            completedMilestones: state.context.completedMilestones,
            teamSize: state.context.teamMembers.length,
            revenue: state.context.revenue,
            expenses: state.context.expenses,
            riskLevel: state.context.riskLevel,
            ventureStartDate: state.context.ventureStartDate,
            lastActivity: state.context.lastActivity
        };
    }

    /**
     * Cleanup completed machines
     */
    cleanup() {
        for (const [ventureId, machine] of this.activeMachines.entries()) {
            if (machine.state.done) {
                machine.stop();
                this.activeMachines.delete(ventureId);
            }
        }
    }
}

module.exports = VentureStateMachine;