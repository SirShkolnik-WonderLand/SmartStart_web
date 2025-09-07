/**
 * User Journey State Machine
 * Manages user progression through the SmartStart platform
 * Handles RBAC transitions, milestone tracking, and journey orchestration
 */

const { createMachine, interpret, assign } = require('xstate');
const { PrismaClient } = require('@prisma/client');
const EventEmitter = require('events');

const prisma = new PrismaClient();

/**
 * User Journey State Machine Definition
 * Tracks user progression from guest to power user
 */
const userJourneyMachine = createMachine({
  id: 'userJourney',
  initial: 'guest',
  context: {
    userId: null,
    currentRbacLevel: 'GUEST',
    targetRbacLevel: 'GUEST',
    milestones: [],
    completedMilestones: [],
    journeyStage: 'ONBOARDING',
    onboardingProgress: 0,
    lastActivity: null,
    journeyStartDate: null,
    totalTimeSpent: 0,
    achievements: [],
    preferences: {},
    auditTrail: []
  },
  states: {
    guest: {
      entry: ['logStateChange', 'updateUserJourney'],
      on: {
        REGISTER: {
          target: 'registering',
          actions: ['logStateChange', 'startOnboarding']
        },
        VIEW_PUBLIC_CONTENT: {
          actions: ['trackActivity', 'logStateChange']
        }
      }
    },

    registering: {
      entry: ['logStateChange', 'updateUserJourney'],
      on: {
        REGISTRATION_COMPLETE: {
          target: 'onboarding',
          actions: ['completeRegistration', 'logStateChange']
        },
        REGISTRATION_FAILED: {
          target: 'guest',
          actions: ['logRegistrationFailure', 'logStateChange']
        }
      }
    },

    onboarding: {
      entry: ['logStateChange', 'updateUserJourney', 'startOnboardingTimer'],
      on: {
        PROFILE_COMPLETE: {
          target: 'onboarding',
          actions: ['updateOnboardingProgress', 'checkOnboardingComplete', 'logStateChange']
        },
        LEGAL_DOCUMENTS_SIGNED: {
          target: 'onboarding',
          actions: ['updateOnboardingProgress', 'checkOnboardingComplete', 'logStateChange']
        },
        FIRST_VENTURE_CREATED: {
          target: 'onboarding',
          actions: ['updateOnboardingProgress', 'checkOnboardingComplete', 'logStateChange']
        },
        ONBOARDING_COMPLETE: {
          target: 'member',
          actions: ['completeOnboarding', 'grantMemberAccess', 'logStateChange']
        },
        SKIP_ONBOARDING: {
          target: 'member',
          actions: ['skipOnboarding', 'logStateChange']
        }
      }
    },

    member: {
      entry: ['logStateChange', 'updateUserJourney', 'grantMemberAccess'],
      on: {
        SUBSCRIBE: {
          target: 'subscribing',
          actions: ['logStateChange']
        },
        CREATE_VENTURE: {
          target: 'member',
          actions: ['trackVentureCreation', 'checkVentureOwnerMilestone', 'logStateChange']
        },
        JOIN_VENTURE: {
          target: 'member',
          actions: ['trackVentureParticipation', 'logStateChange']
        },
        UPGRADE_TO_POWER_USER: {
          target: 'power_user_evaluation',
          cond: 'canUpgradeToPowerUser',
          actions: ['logStateChange']
        }
      }
    },

    subscribing: {
      entry: ['logStateChange', 'updateUserJourney'],
      on: {
        SUBSCRIPTION_ACTIVE: {
          target: 'subscriber',
          actions: ['activateSubscription', 'logStateChange']
        },
        SUBSCRIPTION_FAILED: {
          target: 'member',
          actions: ['logSubscriptionFailure', 'logStateChange']
        },
        SUBSCRIPTION_CANCELLED: {
          target: 'member',
          actions: ['logSubscriptionCancellation', 'logStateChange']
        }
      }
    },

    subscriber: {
      entry: ['logStateChange', 'updateUserJourney', 'grantSubscriberAccess'],
      on: {
        CREATE_MULTIPLE_VENTURES: {
          target: 'subscriber',
          actions: ['trackMultipleVentures', 'checkVentureExpertMilestone', 'logStateChange']
        },
        INVITE_TEAM_MEMBERS: {
          target: 'subscriber',
          actions: ['trackTeamBuilding', 'checkTeamLeaderMilestone', 'logStateChange']
        },
        ACCESS_ADVANCED_FEATURES: {
          target: 'subscriber',
          actions: ['trackAdvancedFeatureUsage', 'logStateChange']
        },
        UPGRADE_TO_POWER_USER: {
          target: 'power_user_evaluation',
          cond: 'canUpgradeToPowerUser',
          actions: ['logStateChange']
        },
        SUBSCRIPTION_EXPIRED: {
          target: 'member',
          actions: ['handleSubscriptionExpiry', 'logStateChange']
        }
      }
    },

    power_user_evaluation: {
      entry: ['logStateChange', 'updateUserJourney', 'evaluatePowerUserCriteria'],
      on: {
        POWER_USER_APPROVED: {
          target: 'power_user',
          actions: ['approvePowerUser', 'logStateChange']
        },
        POWER_USER_REJECTED: {
          target: 'subscriber',
          actions: ['rejectPowerUser', 'logStateChange']
        },
        POWER_USER_REQUIREMENTS_MET: {
          target: 'power_user',
          actions: ['autoApprovePowerUser', 'logStateChange']
        }
      }
    },

    power_user: {
      entry: ['logStateChange', 'updateUserJourney', 'grantPowerUserAccess'],
      on: {
        BECOME_MENTOR: {
          target: 'power_user',
          actions: ['enableMentorship', 'checkMentorMilestone', 'logStateChange']
        },
        CREATE_ENTERPRISE_VENTURE: {
          target: 'power_user',
          actions: ['trackEnterpriseVenture', 'checkEnterpriseMilestone', 'logStateChange']
        },
        ACCESS_ADMIN_FEATURES: {
          target: 'admin_evaluation',
          cond: 'canAccessAdminFeatures',
          actions: ['logStateChange']
        },
        POWER_USER_DEMOTED: {
          target: 'subscriber',
          actions: ['demotePowerUser', 'logStateChange']
        }
      }
    },

    admin_evaluation: {
      entry: ['logStateChange', 'updateUserJourney', 'evaluateAdminCriteria'],
      on: {
        ADMIN_APPROVED: {
          target: 'admin',
          actions: ['approveAdmin', 'logStateChange']
        },
        ADMIN_REJECTED: {
          target: 'power_user',
          actions: ['rejectAdmin', 'logStateChange']
        }
      }
    },

    admin: {
      entry: ['logStateChange', 'updateUserJourney', 'grantAdminAccess'],
      on: {
        ADMIN_DEMOTED: {
          target: 'power_user',
          actions: ['demoteAdmin', 'logStateChange']
        },
        ACCOUNT_SUSPENDED: {
          target: 'suspended',
          actions: ['suspendAccount', 'logStateChange']
        }
      }
    },

    suspended: {
      entry: ['logStateChange', 'updateUserJourney', 'handleSuspension'],
      on: {
        ACCOUNT_REACTIVATED: {
          target: 'member',
          actions: ['reactivateAccount', 'logStateChange']
        },
        ACCOUNT_TERMINATED: {
          target: 'terminated',
          actions: ['terminateAccount', 'logStateChange']
        }
      }
    },

    terminated: {
      entry: ['logStateChange', 'updateUserJourney', 'handleTermination'],
      type: 'final'
    }
  }
}, {
  guards: {
    canUpgradeToPowerUser: (context) => {
      // Check if user meets power user criteria
      const hasMultipleVentures = context.milestones.includes('MULTIPLE_VENTURES');
      const hasTeamLeadership = context.milestones.includes('TEAM_LEADER');
      const hasAdvancedUsage = context.milestones.includes('ADVANCED_FEATURES');
      
      return hasMultipleVentures && hasTeamLeadership && hasAdvancedUsage;
    },
    canAccessAdminFeatures: (context) => {
      // Check if user meets admin criteria
      const hasMentorship = context.milestones.includes('MENTOR');
      const hasEnterpriseVenture = context.milestones.includes('ENTERPRISE_VENTURE');
      const hasLongTenure = context.totalTimeSpent > (30 * 24 * 60 * 60 * 1000); // 30 days
      
      return hasMentorship && hasEnterpriseVenture && hasLongTenure;
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

    updateUserJourney: async (context, event) => {
      try {
        await prisma.userJourneyState.upsert({
          where: { userId: context.userId },
          update: {
            currentStage: event.to || 'unknown',
            rbacLevel: context.currentRbacLevel,
            lastActivity: new Date(),
            journeyData: context
          },
          create: {
            userId: context.userId,
            currentStage: event.to || 'unknown',
            rbacLevel: context.currentRbacLevel,
            journeyStartDate: new Date(),
            lastActivity: new Date(),
            journeyData: context
          }
        });
      } catch (error) {
        console.error('Failed to update user journey:', error);
      }
    },

    startOnboarding: assign({
      journeyStage: 'ONBOARDING',
      journeyStartDate: () => new Date().toISOString(),
      onboardingProgress: 0
    }),

    completeRegistration: assign({
      milestones: (context) => [...context.milestones, 'REGISTRATION_COMPLETE'],
      completedMilestones: (context) => [...context.completedMilestones, 'REGISTRATION_COMPLETE']
    }),

    updateOnboardingProgress: assign({
      onboardingProgress: (context, event) => {
        const progress = event.metadata?.progress || 10;
        return Math.min(context.onboardingProgress + progress, 100);
      }
    }),

    checkOnboardingComplete: (context, event) => {
      if (context.onboardingProgress >= 100) {
        // Trigger onboarding completion
        event.machine.send('ONBOARDING_COMPLETE');
      }
    },

    completeOnboarding: assign({
      milestones: (context) => [...context.milestones, 'ONBOARDING_COMPLETE'],
      completedMilestones: (context) => [...context.completedMilestones, 'ONBOARDING_COMPLETE'],
      currentRbacLevel: 'MEMBER'
    }),

    grantMemberAccess: async (context, event) => {
      // Grant member-level access
      console.log(`Granting member access to user: ${context.userId}`);
    },

    trackVentureCreation: assign({
      milestones: (context) => [...context.milestones, 'VENTURE_CREATED']
    }),

    checkVentureOwnerMilestone: (context, event) => {
      if (!context.completedMilestones.includes('VENTURE_OWNER')) {
        context.completedMilestones.push('VENTURE_OWNER');
      }
    },

    trackVentureParticipation: assign({
      milestones: (context) => [...context.milestones, 'VENTURE_PARTICIPANT']
    }),

    activateSubscription: assign({
      currentRbacLevel: 'SUBSCRIBER',
      milestones: (context) => [...context.milestones, 'SUBSCRIPTION_ACTIVE']
    }),

    grantSubscriberAccess: async (context, event) => {
      // Grant subscriber-level access
      console.log(`Granting subscriber access to user: ${context.userId}`);
    },

    trackMultipleVentures: assign({
      milestones: (context) => [...context.milestones, 'MULTIPLE_VENTURES']
    }),

    checkVentureExpertMilestone: (context, event) => {
      if (!context.completedMilestones.includes('VENTURE_EXPERT')) {
        context.completedMilestones.push('VENTURE_EXPERT');
      }
    },

    trackTeamBuilding: assign({
      milestones: (context) => [...context.milestones, 'TEAM_LEADER']
    }),

    checkTeamLeaderMilestone: (context, event) => {
      if (!context.completedMilestones.includes('TEAM_LEADER')) {
        context.completedMilestones.push('TEAM_LEADER');
      }
    },

    trackAdvancedFeatureUsage: assign({
      milestones: (context) => [...context.milestones, 'ADVANCED_FEATURES']
    }),

    evaluatePowerUserCriteria: (context, event) => {
      // Evaluate if user meets power user criteria
      console.log(`Evaluating power user criteria for user: ${context.userId}`);
    },

    approvePowerUser: assign({
      currentRbacLevel: 'POWER_USER',
      milestones: (context) => [...context.milestones, 'POWER_USER_APPROVED']
    }),

    grantPowerUserAccess: async (context, event) => {
      // Grant power user access
      console.log(`Granting power user access to user: ${context.userId}`);
    },

    enableMentorship: assign({
      milestones: (context) => [...context.milestones, 'MENTOR']
    }),

    checkMentorMilestone: (context, event) => {
      if (!context.completedMilestones.includes('MENTOR')) {
        context.completedMilestones.push('MENTOR');
      }
    },

    trackEnterpriseVenture: assign({
      milestones: (context) => [...context.milestones, 'ENTERPRISE_VENTURE']
    }),

    checkEnterpriseMilestone: (context, event) => {
      if (!context.completedMilestones.includes('ENTERPRISE_VENTURE')) {
        context.completedMilestones.push('ENTERPRISE_VENTURE');
      }
    },

    evaluateAdminCriteria: (context, event) => {
      // Evaluate if user meets admin criteria
      console.log(`Evaluating admin criteria for user: ${context.userId}`);
    },

    approveAdmin: assign({
      currentRbacLevel: 'ADMIN',
      milestones: (context) => [...context.milestones, 'ADMIN_APPROVED']
    }),

    grantAdminAccess: async (context, event) => {
      // Grant admin access
      console.log(`Granting admin access to user: ${context.userId}`);
    },

    trackActivity: (context, event) => {
      // Track user activity for analytics
      console.log(`Tracking activity for user: ${context.userId}`, event.metadata);
    }
  }
});

/**
 * User Journey State Machine Service
 */
class UserJourneyStateMachine extends EventEmitter {
  constructor() {
    super();
    this.activeMachines = new Map();
  }

  /**
   * Create a new user journey state machine
   */
  async createMachine(userId, initialContext = {}) {
    const context = {
      userId,
      currentRbacLevel: 'GUEST',
      targetRbacLevel: 'GUEST',
      milestones: [],
      completedMilestones: [],
      journeyStage: 'ONBOARDING',
      onboardingProgress: 0,
      lastActivity: new Date().toISOString(),
      journeyStartDate: new Date().toISOString(),
      totalTimeSpent: 0,
      achievements: [],
      preferences: {},
      auditTrail: [],
      ...initialContext
    };

    const machine = interpret(userJourneyMachine.withContext(context));

    machine.onTransition((state) => {
      console.log(`User ${userId} journey transitioned to:`, state.value);
      this.handleStateChange(userId, state);
    });

    this.activeMachines.set(userId, machine);
    machine.start();
    return machine;
  }

  /**
   * Send event to user journey state machine
   */
  async sendEvent(userId, event) {
    const machine = this.activeMachines.get(userId);
    if (machine) {
      machine.send(event);
    } else {
      console.error(`No user journey state machine found for user: ${userId}`);
    }
  }

  /**
   * Get current state of user journey
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
    if (state.value === 'member' && state.changed) {
      this.emit('milestoneReached', {
        userId,
        milestone: 'MEMBER_ACCESS',
        rbacLevel: 'MEMBER'
      });
    }

    if (state.value === 'subscriber' && state.changed) {
      this.emit('milestoneReached', {
        userId,
        milestone: 'SUBSCRIBER_ACCESS',
        rbacLevel: 'SUBSCRIBER'
      });
    }

    if (state.value === 'power_user' && state.changed) {
      this.emit('milestoneReached', {
        userId,
        milestone: 'POWER_USER_ACCESS',
        rbacLevel: 'POWER_USER'
      });
    }
  }

  /**
   * Get user journey analytics
   */
  async getUserJourneyAnalytics(userId) {
    const state = this.getState(userId);
    if (!state) {
      return null;
    }

    return {
      userId,
      currentStage: state.value,
      rbacLevel: state.context.currentRbacLevel,
      milestones: state.context.milestones,
      completedMilestones: state.context.completedMilestones,
      onboardingProgress: state.context.onboardingProgress,
      totalTimeSpent: state.context.totalTimeSpent,
      achievements: state.context.achievements,
      journeyStartDate: state.context.journeyStartDate,
      lastActivity: state.context.lastActivity
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

module.exports = UserJourneyStateMachine;
