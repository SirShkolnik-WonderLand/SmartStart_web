/**
 * Subscription State Machine
 * Manages subscription lifecycle and billing
 * Handles plan changes, payments, and subscription management
 */

const { createMachine, interpret, assign } = require('xstate');
const { PrismaClient } = require('@prisma/client');
const EventEmitter = require('events');

const prisma = new PrismaClient();

/**
 * Subscription State Machine Definition
 */
const subscriptionMachine = createMachine({
    id: 'subscription',
    initial: 'inactive',
    context: {
        userId: null,
        subscriptionId: null,
        currentPlan: null,
        targetPlan: null,
        billingCycle: 'MONTHLY',
        paymentMethod: null,
        nextBillingDate: null,
        lastPaymentDate: null,
        paymentHistory: [],
        failedPayments: 0,
        gracePeriodEnd: null,
        cancellationDate: null,
        refundAmount: 0,
        usage: {
            ventures: 0,
            teamMembers: 0,
            storage: 0,
            apiCalls: 0
        },
        limits: {
            maxVentures: 1,
            maxTeamMembers: 3,
            maxStorage: 1000, // MB
            maxApiCalls: 1000
        },
        features: [],
        lastActivity: null,
        auditTrail: []
    },
    states: {
        inactive: {
            entry: ['logStateChange', 'updateSubscriptionStatus'],
            on: {
                SUBSCRIBE: {
                    target: 'subscribing',
                    actions: ['initiateSubscription', 'logStateChange']
                },
                TRIAL_START: {
                    target: 'trial',
                    actions: ['startTrial', 'logStateChange']
                }
            }
        },

        trial: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'startTrialTimer'],
            on: {
                TRIAL_CONVERT: {
                    target: 'subscribing',
                    actions: ['convertTrial', 'logStateChange']
                },
                TRIAL_EXPIRED: {
                    target: 'trial_expired',
                    actions: ['expireTrial', 'logStateChange']
                },
                TRIAL_CANCELLED: {
                    target: 'inactive',
                    actions: ['cancelTrial', 'logStateChange']
                }
            }
        },

        trial_expired: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'expireTrialAccess'],
            on: {
                SUBSCRIBE: {
                    target: 'subscribing',
                    actions: ['initiateSubscription', 'logStateChange']
                },
                TRIAL_RESTART: {
                    target: 'trial',
                    actions: ['restartTrial', 'logStateChange']
                }
            }
        },

        subscribing: {
            entry: ['logStateChange', 'updateSubscriptionStatus'],
            on: {
                PAYMENT_SUCCESSFUL: {
                    target: 'active',
                    actions: ['activateSubscription', 'logStateChange']
                },
                PAYMENT_FAILED: {
                    target: 'payment_failed',
                    actions: ['handlePaymentFailure', 'logStateChange']
                },
                SUBSCRIPTION_CANCELLED: {
                    target: 'cancelled',
                    actions: ['cancelSubscription', 'logStateChange']
                }
            }
        },

        active: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'grantAccess'],
            on: {
                PLAN_UPGRADE: {
                    target: 'upgrading',
                    actions: ['initiateUpgrade', 'logStateChange']
                },
                PLAN_DOWNGRADE: {
                    target: 'downgrading',
                    actions: ['initiateDowngrade', 'logStateChange']
                },
                PAYMENT_DUE: {
                    target: 'payment_pending',
                    actions: ['processPayment', 'logStateChange']
                },
                SUBSCRIPTION_CANCELLED: {
                    target: 'cancelling',
                    actions: ['initiateCancellation', 'logStateChange']
                },
                USAGE_LIMIT_EXCEEDED: {
                    target: 'usage_exceeded',
                    actions: ['handleUsageExceeded', 'logStateChange']
                }
            }
        },

        upgrading: {
            entry: ['logStateChange', 'updateSubscriptionStatus'],
            on: {
                UPGRADE_SUCCESSFUL: {
                    target: 'active',
                    actions: ['completeUpgrade', 'logStateChange']
                },
                UPGRADE_FAILED: {
                    target: 'active',
                    actions: ['failUpgrade', 'logStateChange']
                }
            }
        },

        downgrading: {
            entry: ['logStateChange', 'updateSubscriptionStatus'],
            on: {
                DOWNGRADE_SUCCESSFUL: {
                    target: 'active',
                    actions: ['completeDowngrade', 'logStateChange']
                },
                DOWNGRADE_FAILED: {
                    target: 'active',
                    actions: ['failDowngrade', 'logStateChange']
                }
            }
        },

        payment_pending: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'sendPaymentReminder'],
            on: {
                PAYMENT_SUCCESSFUL: {
                    target: 'active',
                    actions: ['processSuccessfulPayment', 'logStateChange']
                },
                PAYMENT_FAILED: {
                    target: 'payment_failed',
                    actions: ['handlePaymentFailure', 'logStateChange']
                },
                PAYMENT_TIMEOUT: {
                    target: 'payment_failed',
                    actions: ['handlePaymentTimeout', 'logStateChange']
                }
            }
        },

        payment_failed: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'handlePaymentFailure'],
            on: {
                PAYMENT_RETRY_SUCCESSFUL: {
                    target: 'active',
                    actions: ['retryPaymentSuccess', 'logStateChange']
                },
                PAYMENT_RETRY_FAILED: {
                    target: 'payment_failed',
                    actions: ['retryPaymentFailed', 'checkGracePeriod', 'logStateChange']
                },
                GRACE_PERIOD_START: {
                    target: 'grace_period',
                    actions: ['startGracePeriod', 'logStateChange']
                },
                SUBSCRIPTION_SUSPENDED: {
                    target: 'suspended',
                    actions: ['suspendSubscription', 'logStateChange']
                }
            }
        },

        grace_period: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'startGracePeriodTimer'],
            on: {
                PAYMENT_SUCCESSFUL: {
                    target: 'active',
                    actions: ['restoreSubscription', 'logStateChange']
                },
                GRACE_PERIOD_EXPIRED: {
                    target: 'suspended',
                    actions: ['expireGracePeriod', 'logStateChange']
                }
            }
        },

        cancelling: {
            entry: ['logStateChange', 'updateSubscriptionStatus'],
            on: {
                CANCELLATION_COMPLETE: {
                    target: 'cancelled',
                    actions: ['completeCancellation', 'logStateChange']
                },
                CANCELLATION_REVERSED: {
                    target: 'active',
                    actions: ['reverseCancellation', 'logStateChange']
                }
            }
        },

        cancelled: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'handleCancellation'],
            on: {
                REACTIVATE: {
                    target: 'subscribing',
                    actions: ['reactivateSubscription', 'logStateChange']
                },
                REFUND_PROCESSED: {
                    target: 'refunded',
                    actions: ['processRefund', 'logStateChange']
                }
            }
        },

        suspended: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'suspendAccess'],
            on: {
                PAYMENT_SUCCESSFUL: {
                    target: 'active',
                    actions: ['restoreSubscription', 'logStateChange']
                },
                SUBSCRIPTION_TERMINATED: {
                    target: 'terminated',
                    actions: ['terminateSubscription', 'logStateChange']
                }
            }
        },

        terminated: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'terminateAccess'],
            type: 'final'
        },

        refunded: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'completeRefund'],
            type: 'final'
        },

        usage_exceeded: {
            entry: ['logStateChange', 'updateSubscriptionStatus', 'handleUsageExceeded'],
            on: {
                UPGRADE_PLAN: {
                    target: 'upgrading',
                    actions: ['initiateUpgrade', 'logStateChange']
                },
                USAGE_REDUCED: {
                    target: 'active',
                    actions: ['reduceUsage', 'logStateChange']
                },
                SUBSCRIPTION_SUSPENDED: {
                    target: 'suspended',
                    actions: ['suspendForUsage', 'logStateChange']
                }
            }
        }
    }
}, {
    guards: {
        hasValidPaymentMethod: (context) => {
            return context.paymentMethod && context.paymentMethod.isValid;
        },
        withinGracePeriod: (context) => {
            return context.gracePeriodEnd && new Date() < new Date(context.gracePeriodEnd);
        },
        canUpgrade: (context) => {
            return context.targetPlan && context.targetPlan.level > context.currentPlan.level;
        },
        canDowngrade: (context) => {
            return context.targetPlan && context.targetPlan.level < context.currentPlan.level;
        },
        hasExceededLimits: (context) => {
            return context.usage.ventures > context.limits.maxVentures ||
                context.usage.teamMembers > context.limits.maxTeamMembers ||
                context.usage.storage > context.limits.maxStorage ||
                context.usage.apiCalls > context.limits.maxApiCalls;
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
                    userId: context.userId,
                    metadata: event.metadata || {}
                }
            ],
            lastActivity: () => new Date().toISOString()
        }),

        updateSubscriptionStatus: async(context, event) => {
            try {
                if (context.subscriptionId) {
                    await prisma.subscription.update({
                        where: { id: context.subscriptionId },
                        data: {
                            status: event.to || 'UNKNOWN',
                            updatedAt: new Date()
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to update subscription status:', error);
            }
        },

        initiateSubscription: assign({
            targetPlan: (context, event) => event.metadata ? .plan || context.targetPlan
        }),

        startTrial: assign({
            currentPlan: (context, event) => event.metadata ? .trialPlan || context.currentPlan,
            nextBillingDate: (context) => {
                const date = new Date();
                date.setDate(date.getDate() + 14); // 14-day trial
                return date.toISOString();
            }
        }),

        convertTrial: assign({
            currentPlan: (context, event) => event.metadata ? .plan || context.currentPlan
        }),

        activateSubscription: assign({
            currentPlan: (context, event) => event.metadata ? .plan || context.currentPlan,
            nextBillingDate: (context) => {
                const date = new Date();
                date.setMonth(date.getMonth() + 1); // Next month
                return date.toISOString();
            },
            lastPaymentDate: () => new Date().toISOString(),
            failedPayments: 0
        }),

        grantAccess: async(context, event) => {
            console.log(`Granting subscription access to user: ${context.userId}`);
            // Grant access based on plan features
        },

        initiateUpgrade: assign({
            targetPlan: (context, event) => event.metadata ? .plan || context.targetPlan
        }),

        completeUpgrade: assign({
            currentPlan: (context) => context.targetPlan,
            targetPlan: null,
            limits: (context) => context.targetPlan ? .limits || context.limits,
            features: (context) => context.targetPlan ? .features || context.features
        }),

        initiateDowngrade: assign({
            targetPlan: (context, event) => event.metadata ? .plan || context.targetPlan
        }),

        completeDowngrade: assign({
            currentPlan: (context) => context.targetPlan,
            targetPlan: null,
            limits: (context) => context.targetPlan ? .limits || context.limits,
            features: (context) => context.targetPlan ? .features || context.features
        }),

        processPayment: async(context, event) => {
            console.log(`Processing payment for user: ${context.userId}`);
            // Process payment logic
        },

        handlePaymentFailure: assign({
            failedPayments: (context) => context.failedPayments + 1
        }),

        startGracePeriod: assign({
            gracePeriodEnd: (context) => {
                const date = new Date();
                date.setDate(date.getDate() + 7); // 7-day grace period
                return date.toISOString();
            }
        }),

        suspendSubscription: async(context, event) => {
            console.log(`Suspending subscription for user: ${context.userId}`);
            // Suspend access
        },

        restoreSubscription: async(context, event) => {
            console.log(`Restoring subscription for user: ${context.userId}`);
            // Restore access
        },

        initiateCancellation: assign({
            cancellationDate: (context) => {
                const date = new Date();
                date.setMonth(date.getMonth() + 1); // Cancel at end of billing period
                return date.toISOString();
            }
        }),

        completeCancellation: async(context, event) => {
            console.log(`Completing cancellation for user: ${context.userId}`);
            // Complete cancellation
        },

        handleUsageExceeded: async(context, event) => {
            console.log(`Handling usage exceeded for user: ${context.userId}`);
            // Handle usage exceeded
        },

        // Timer actions
        startTrialTimer: async(context, event) => {
            console.log(`Starting trial timer for user: ${context.userId}`);
        },

        startGracePeriodTimer: async(context, event) => {
            console.log(`Starting grace period timer for user: ${context.userId}`);
        },

        sendPaymentReminder: async(context, event) => {
            console.log(`Sending payment reminder to user: ${context.userId}`);
        },

        expireTrial: async(context, event) => {
            console.log(`Trial expired for user: ${context.userId}`);
            // Handle trial expiration
        },

        expireTrialAccess: async(context, event) => {
            console.log(`Expiring trial access for user: ${context.userId}`);
            // Remove trial access
        },

        restartTrial: assign({
            currentPlan: (context, event) => event.metadata ? .trialPlan || context.currentPlan,
            nextBillingDate: (context) => {
                const date = new Date();
                date.setDate(date.getDate() + 14); // 14-day trial
                return date.toISOString();
            }
        })
    }
});

/**
 * Subscription State Machine Service
 */
class SubscriptionStateMachine extends EventEmitter {
    constructor() {
        super();
        this.activeMachines = new Map();
    }

    /**
     * Create a new subscription state machine
     */
    async createMachine(userId, initialContext = {}) {
        const context = {
            userId,
            subscriptionId: null,
            currentPlan: null,
            targetPlan: null,
            billingCycle: 'MONTHLY',
            paymentMethod: null,
            nextBillingDate: null,
            lastPaymentDate: null,
            paymentHistory: [],
            failedPayments: 0,
            gracePeriodEnd: null,
            cancellationDate: null,
            refundAmount: 0,
            usage: {
                ventures: 0,
                teamMembers: 0,
                storage: 0,
                apiCalls: 0
            },
            limits: {
                maxVentures: 1,
                maxTeamMembers: 3,
                maxStorage: 1000,
                maxApiCalls: 1000
            },
            features: [],
            lastActivity: new Date().toISOString(),
            auditTrail: [],
            ...initialContext
        };

        const machine = interpret(subscriptionMachine.withContext(context));

        machine.onTransition((state) => {
            console.log(`Subscription ${userId} transitioned to:`, state.value);
            this.handleStateChange(userId, state);
        });

        this.activeMachines.set(userId, machine);
        machine.start();
        return machine;
    }

    /**
     * Send event to subscription state machine
     */
    async sendEvent(userId, event) {
        const machine = this.activeMachines.get(userId);
        if (machine) {
            machine.send(event);
        } else {
            console.error(`No subscription state machine found for user: ${userId}`);
        }
    }

    /**
     * Get current state of subscription
     */
    getState(userId) {
        const machine = this.activeMachines.get(userId);
        return machine ? machine.state : null;
    }

    /**
     * Handle state changes
     */
    async handleStateChange(userId, state) {
        // Emit events for cross-machine coordination
        if (state.value === 'active' && state.changed) {
            this.emit('subscriptionChanged', {
                userId,
                newPlan: state.context.currentPlan,
                oldPlan: state.history ? .context ? .currentPlan
            });
        }

        if (state.value === 'cancelled' && state.changed) {
            this.emit('subscriptionChanged', {
                userId,
                newPlan: null,
                oldPlan: state.context.currentPlan
            });
        }
    }

    /**
     * Get subscription analytics
     */
    async getSubscriptionAnalytics(userId) {
        const state = this.getState(userId);
        if (!state) {
            return null;
        }

        return {
            userId,
            currentState: state.value,
            currentPlan: state.context.currentPlan,
            billingCycle: state.context.billingCycle,
            nextBillingDate: state.context.nextBillingDate,
            usage: state.context.usage,
            limits: state.context.limits,
            features: state.context.features,
            lastPaymentDate: state.context.lastPaymentDate,
            failedPayments: state.context.failedPayments
        };
    }

    /**
     * Cleanup completed machines
     */
    cleanup() {
        for (const [userId, machine] of this.activeMachines.entries()) {
            if (machine.state.done) {
                machine.stop();
                this.activeMachines.delete(userId);
            }
        }
    }
}

module.exports = SubscriptionStateMachine;