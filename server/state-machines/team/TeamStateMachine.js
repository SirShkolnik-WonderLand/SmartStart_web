/**
 * Team State Machine
 * Manages team formation, collaboration, and dynamics
 * Handles member roles, permissions, and team lifecycle
 */

const { createMachine, interpret, assign } = require('xstate');
const { PrismaClient } = require('@prisma/client');
const EventEmitter = require('events');

const prisma = new PrismaClient();

/**
 * Team State Machine Definition
 */
const teamMachine = createMachine({
  id: 'team',
  initial: 'forming',
  context: {
    teamId: null,
    ventureId: null,
    teamName: null,
    teamType: null,
    members: [],
    roles: {},
    permissions: {},
    teamGoals: [],
    completedGoals: [],
    collaborationTools: [],
    communicationChannels: [],
    meetingSchedule: null,
    teamCulture: {},
    performance: {
      productivity: 0,
      collaboration: 0,
      innovation: 0,
      satisfaction: 0
    },
    conflicts: [],
    resolutions: [],
    lastActivity: null,
    teamFormationDate: null,
    auditTrail: []
  },
  states: {
    forming: {
      entry: ['logStateChange', 'updateTeamStatus'],
      on: {
        MEMBER_ADDED: {
          target: 'forming',
          actions: ['addMember', 'checkTeamComplete', 'logStateChange']
        },
        TEAM_COMPLETE: {
          target: 'active',
          actions: ['completeTeamFormation', 'logStateChange']
        },
        TEAM_DISBANDED: {
          target: 'disbanded',
          actions: ['disbandTeam', 'logStateChange']
        }
      }
    },

    active: {
      entry: ['logStateChange', 'updateTeamStatus', 'activateTeam'],
      on: {
        MEMBER_ADDED: {
          target: 'active',
          actions: ['addMember', 'logStateChange']
        },
        MEMBER_REMOVED: {
          target: 'active',
          actions: ['removeMember', 'checkTeamViability', 'logStateChange']
        },
        ROLE_CHANGED: {
          target: 'active',
          actions: ['changeRole', 'logStateChange']
        },
        GOAL_SET: {
          target: 'active',
          actions: ['setGoal', 'logStateChange']
        },
        GOAL_COMPLETED: {
          target: 'active',
          actions: ['completeGoal', 'logStateChange']
        },
        CONFLICT_DETECTED: {
          target: 'conflict_resolution',
          actions: ['detectConflict', 'logStateChange']
        },
        TEAM_MEETING: {
          target: 'active',
          actions: ['conductMeeting', 'logStateChange']
        },
        PERFORMANCE_REVIEW: {
          target: 'performance_review',
          actions: ['initiatePerformanceReview', 'logStateChange']
        },
        TEAM_DISBANDED: {
          target: 'disbanded',
          actions: ['disbandTeam', 'logStateChange']
        }
      }
    },

    conflict_resolution: {
      entry: ['logStateChange', 'updateTeamStatus', 'initiateConflictResolution'],
      on: {
        CONFLICT_RESOLVED: {
          target: 'active',
          actions: ['resolveConflict', 'logStateChange']
        },
        CONFLICT_ESCALATED: {
          target: 'conflict_escalated',
          actions: ['escalateConflict', 'logStateChange']
        },
        MEDIATION_REQUIRED: {
          target: 'mediation',
          actions: ['requireMediation', 'logStateChange']
        }
      }
    },

    conflict_escalated: {
      entry: ['logStateChange', 'updateTeamStatus', 'handleEscalatedConflict'],
      on: {
        CONFLICT_RESOLVED: {
          target: 'active',
          actions: ['resolveEscalatedConflict', 'logStateChange']
        },
        MEMBER_REMOVED: {
          target: 'active',
          actions: ['removeConflictingMember', 'logStateChange']
        },
        TEAM_DISBANDED: {
          target: 'disbanded',
          actions: ['disbandTeam', 'logStateChange']
        }
      }
    },

    mediation: {
      entry: ['logStateChange', 'updateTeamStatus', 'initiateMediation'],
      on: {
        MEDIATION_SUCCESSFUL: {
          target: 'active',
          actions: ['completeMediation', 'logStateChange']
        },
        MEDIATION_FAILED: {
          target: 'conflict_escalated',
          actions: ['failMediation', 'logStateChange']
        }
      }
    },

    performance_review: {
      entry: ['logStateChange', 'updateTeamStatus', 'conductPerformanceReview'],
      on: {
        REVIEW_COMPLETE: {
          target: 'active',
          actions: ['completePerformanceReview', 'logStateChange']
        },
        IMPROVEMENT_PLAN_REQUIRED: {
          target: 'improvement_planning',
          actions: ['requireImprovementPlan', 'logStateChange']
        },
        TEAM_RESTRUCTURE: {
          target: 'restructuring',
          actions: ['initiateRestructure', 'logStateChange']
        }
      }
    },

    improvement_planning: {
      entry: ['logStateChange', 'updateTeamStatus', 'createImprovementPlan'],
      on: {
        IMPROVEMENT_PLAN_COMPLETE: {
          target: 'active',
          actions: ['completeImprovementPlan', 'logStateChange']
        },
        IMPROVEMENT_FAILED: {
          target: 'performance_review',
          actions: ['failImprovement', 'logStateChange']
        }
      }
    },

    restructuring: {
      entry: ['logStateChange', 'updateTeamStatus', 'restructureTeam'],
      on: {
        RESTRUCTURE_COMPLETE: {
          target: 'active',
          actions: ['completeRestructure', 'logStateChange']
        },
        RESTRUCTURE_FAILED: {
          target: 'disbanded',
          actions: ['failRestructure', 'logStateChange']
        }
      }
    },

    disbanded: {
      entry: ['logStateChange', 'updateTeamStatus', 'handleDisbandment'],
      type: 'final'
    }
  }
}, {
  guards: {
    hasMinimumMembers: (context) => {
      return context.members.length >= 2;
    },
    hasRequiredRoles: (context) => {
      const requiredRoles = ['LEADER', 'MEMBER'];
      return requiredRoles.every(role => 
        context.members.some(member => member.role === role)
      );
    },
    hasActiveConflicts: (context) => {
      return context.conflicts.some(conflict => conflict.status === 'ACTIVE');
    },
    performanceBelowThreshold: (context) => {
      const threshold = 60; // 60% performance threshold
      return context.performance.productivity < threshold ||
             context.performance.collaboration < threshold;
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
          teamId: context.teamId,
          metadata: event.metadata || {}
        }
      ],
      lastActivity: () => new Date().toISOString()
    }),

    updateTeamStatus: async (context, event) => {
      try {
        await prisma.team.update({
          where: { id: context.teamId },
          data: {
            status: event.to || 'UNKNOWN',
            updatedAt: new Date()
          }
        });
      } catch (error) {
        console.error('Failed to update team status:', error);
      }
    },

    addMember: assign({
      members: (context, event) => [
        ...context.members,
        {
          userId: event.metadata?.userId,
          role: event.metadata?.role || 'MEMBER',
          joinedAt: new Date().toISOString(),
          permissions: event.metadata?.permissions || []
        }
      ]
    }),

    checkTeamComplete: (context, event) => {
      if (context.members.length >= 3 && context.members.some(m => m.role === 'LEADER')) {
        event.machine.send('TEAM_COMPLETE');
      }
    },

    completeTeamFormation: assign({
      teamFormationDate: () => new Date().toISOString(),
      teamGoals: (context, event) => event.metadata?.initialGoals || []
    }),

    removeMember: assign({
      members: (context, event) => 
        context.members.filter(member => member.userId !== event.metadata?.userId)
    }),

    checkTeamViability: (context, event) => {
      if (context.members.length < 2) {
        event.machine.send('TEAM_DISBANDED');
      }
    },

    changeRole: assign({
      members: (context, event) => 
        context.members.map(member => 
          member.userId === event.metadata?.userId
            ? { ...member, role: event.metadata?.newRole, roleChangedAt: new Date().toISOString() }
            : member
        )
    }),

    setGoal: assign({
      teamGoals: (context, event) => [
        ...context.teamGoals,
        {
          id: event.metadata?.goalId,
          title: event.metadata?.title,
          description: event.metadata?.description,
          deadline: event.metadata?.deadline,
          priority: event.metadata?.priority || 'MEDIUM',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        }
      ]
    }),

    completeGoal: assign({
      teamGoals: (context, event) =>
        context.teamGoals.map(goal =>
          goal.id === event.metadata?.goalId
            ? { ...goal, status: 'COMPLETED', completedAt: new Date().toISOString() }
            : goal
        ),
      completedGoals: (context, event) => [
        ...context.completedGoals,
        {
          goalId: event.metadata?.goalId,
          completedAt: new Date().toISOString(),
          completedBy: event.metadata?.completedBy
        }
      ]
    }),

    detectConflict: assign({
      conflicts: (context, event) => [
        ...context.conflicts,
        {
          id: event.metadata?.conflictId,
          type: event.metadata?.type,
          description: event.metadata?.description,
          involvedMembers: event.metadata?.involvedMembers,
          severity: event.metadata?.severity || 'MEDIUM',
          status: 'ACTIVE',
          detectedAt: new Date().toISOString()
        }
      ]
    }),

    resolveConflict: assign({
      conflicts: (context, event) =>
        context.conflicts.map(conflict =>
          conflict.id === event.metadata?.conflictId
            ? { ...conflict, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
            : conflict
        ),
      resolutions: (context, event) => [
        ...context.resolutions,
        {
          conflictId: event.metadata?.conflictId,
          resolution: event.metadata?.resolution,
          resolvedBy: event.metadata?.resolvedBy,
          resolvedAt: new Date().toISOString()
        }
      ]
    }),

    escalateConflict: assign({
      conflicts: (context, event) =>
        context.conflicts.map(conflict =>
          conflict.id === event.metadata?.conflictId
            ? { ...conflict, status: 'ESCALATED', escalatedAt: new Date().toISOString() }
            : conflict
        )
    }),

    conductMeeting: assign({
      lastActivity: () => new Date().toISOString()
    }),

    initiatePerformanceReview: async (context, event) => {
      console.log(`Initiating performance review for team: ${context.teamId}`);
    },

    completePerformanceReview: assign({
      performance: (context, event) => ({
        ...context.performance,
        ...event.metadata?.performanceMetrics
      })
    }),

    disbandTeam: async (context, event) => {
      console.log(`Disbanding team: ${context.teamId}`);
    },

    // Team activation
    activateTeam: async (context, event) => {
      console.log(`Activating team: ${context.teamId}`);
    },

    // Conflict resolution
    initiateConflictResolution: async (context, event) => {
      console.log(`Initiating conflict resolution for team: ${context.teamId}`);
    },

    handleEscalatedConflict: async (context, event) => {
      console.log(`Handling escalated conflict for team: ${context.teamId}`);
    },

    initiateMediation: async (context, event) => {
      console.log(`Initiating mediation for team: ${context.teamId}`);
    },

    // Performance management
    conductPerformanceReview: async (context, event) => {
      console.log(`Conducting performance review for team: ${context.teamId}`);
    },

    createImprovementPlan: async (context, event) => {
      console.log(`Creating improvement plan for team: ${context.teamId}`);
    },

    restructureTeam: async (context, event) => {
      console.log(`Restructuring team: ${context.teamId}`);
    }
  }
});

/**
 * Team State Machine Service
 */
class TeamStateMachine extends EventEmitter {
  constructor() {
    super();
    this.activeMachines = new Map();
  }

  /**
   * Create a new team state machine
   */
  async createMachine(teamId, initialContext = {}) {
    const context = {
      teamId,
      ventureId: null,
      teamName: null,
      teamType: null,
      members: [],
      roles: {},
      permissions: {},
      teamGoals: [],
      completedGoals: [],
      collaborationTools: [],
      communicationChannels: [],
      meetingSchedule: null,
      teamCulture: {},
      performance: {
        productivity: 0,
        collaboration: 0,
        innovation: 0,
        satisfaction: 0
      },
      conflicts: [],
      resolutions: [],
      lastActivity: new Date().toISOString(),
      teamFormationDate: new Date().toISOString(),
      auditTrail: [],
      ...initialContext
    };

    const machine = interpret(teamMachine.withContext(context));

    machine.onTransition((state) => {
      console.log(`Team ${teamId} transitioned to:`, state.value);
      this.handleStateChange(teamId, state);
    });

    this.activeMachines.set(teamId, machine);
    machine.start();
    return machine;
  }

  /**
   * Send event to team state machine
   */
  async sendEvent(teamId, event) {
    const machine = this.activeMachines.get(teamId);
    if (machine) {
      machine.send(event);
    } else {
      console.error(`No team state machine found for team: ${teamId}`);
    }
  }

  /**
   * Get current state of team
   */
  getState(teamId) {
    const machine = this.activeMachines.get(teamId);
    return machine ? machine.state : null;
  }

  /**
   * Handle state changes
   */
  async handleStateChange(teamId, state) {
    // Emit events for cross-machine coordination
    if (state.value === 'active' && state.changed) {
      this.emit('memberAdded', {
        teamId,
        userId: state.context.members[state.context.members.length - 1]?.userId,
        role: state.context.members[state.context.members.length - 1]?.role
      });
    }

    if (state.value === 'disbanded' && state.changed) {
      this.emit('teamDisbanded', {
        teamId,
        ventureId: state.context.ventureId
      });
    }
  }

  /**
   * Get team analytics
   */
  async getTeamAnalytics(teamId) {
    const state = this.getState(teamId);
    if (!state) {
      return null;
    }

    return {
      teamId,
      currentState: state.value,
      memberCount: state.context.members.length,
      teamGoals: state.context.teamGoals.length,
      completedGoals: state.context.completedGoals.length,
      activeConflicts: state.context.conflicts.filter(c => c.status === 'ACTIVE').length,
      performance: state.context.performance,
      teamFormationDate: state.context.teamFormationDate,
      lastActivity: state.context.lastActivity
    };
  }

  /**
   * Cleanup completed machines
   */
  cleanup() {
    for (const [teamId, machine] of this.activeMachines.entries()) {
      if (machine.state.done) {
        machine.stop();
        this.activeMachines.delete(teamId);
      }
    }
  }
}

module.exports = TeamStateMachine;
