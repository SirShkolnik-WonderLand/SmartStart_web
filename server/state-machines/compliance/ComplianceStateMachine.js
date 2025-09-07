/**
 * Compliance State Machine
 * Manages user compliance across all legal, regulatory, and platform requirements
 * Handles document signing, audit trails, and compliance monitoring
 */

const { createMachine, interpret, assign } = require('xstate');
const { PrismaClient } = require('@prisma/client');
const EventEmitter = require('events');

const prisma = new PrismaClient();

/**
 * Compliance State Machine Definition
 */
const complianceMachine = createMachine({
  id: 'compliance',
  initial: 'non_compliant',
  context: {
    userId: null,
    currentRbacLevel: 'GUEST',
    targetRbacLevel: 'GUEST',
    requiredDocuments: [],
    completedDocuments: [],
    pendingDocuments: [],
    expiredDocuments: [],
    complianceScore: 0,
    lastComplianceCheck: null,
    canadianCompliance: {
      pipeda: false,
      phipa: false,
      casl: false,
      ontarioEcommerce: false
    },
    auditTrail: [],
    complianceHistory: [],
    riskLevel: 'LOW',
    violations: [],
    remediationActions: [],
    lastActivity: null,
    complianceStartDate: null,
    nextReviewDate: null
  },
  states: {
    non_compliant: {
      entry: ['logStateChange', 'updateComplianceStatus'],
      on: {
        DOCUMENT_SIGNED: {
          target: 'checking_compliance',
          actions: ['addCompletedDocument', 'logStateChange']
        },
        NEW_REQUIREMENTS_ADDED: {
          target: 'compliance_required',
          actions: ['addNewRequirements', 'logStateChange']
        },
        RBAC_UPGRADE_REQUESTED: {
          target: 'compliance_required',
          actions: ['setRequiredDocuments', 'logStateChange']
        }
      }
    },

    compliance_required: {
      entry: ['logStateChange', 'updateComplianceStatus', 'notifyUser'],
      on: {
        DOCUMENT_SIGNED: {
          target: 'checking_compliance',
          actions: ['addCompletedDocument', 'logStateChange']
        },
        COMPLIANCE_DEADLINE_EXPIRED: {
          target: 'non_compliant',
          actions: ['handleDeadlineExpiry', 'logStateChange']
        },
        COMPLIANCE_WAIVED: {
          target: 'compliant',
          actions: ['waiveCompliance', 'logStateChange']
        }
      }
    },

    checking_compliance: {
      entry: ['logStateChange', 'updateComplianceStatus', 'checkCompliance'],
      on: {
        COMPLIANCE_VERIFIED: {
          target: 'compliant',
          actions: ['updateComplianceScore', 'logStateChange']
        },
        COMPLIANCE_INCOMPLETE: {
          target: 'compliance_required',
          actions: ['identifyMissingDocuments', 'logStateChange']
        },
        COMPLIANCE_VIOLATION_DETECTED: {
          target: 'violation_detected',
          actions: ['detectViolation', 'logStateChange']
        }
      }
    },

    compliant: {
      entry: ['logStateChange', 'updateComplianceStatus', 'grantAccess'],
      on: {
        NEW_REQUIREMENT_ADDED: {
          target: 'compliance_required',
          actions: ['addNewRequirement', 'logStateChange']
        },
        DOCUMENT_EXPIRED: {
          target: 'checking_compliance',
          actions: ['removeExpiredDocument', 'logStateChange']
        },
        RBAC_UPGRADE_REQUESTED: {
          target: 'checking_compliance',
          actions: ['checkUpgradeRequirements', 'logStateChange']
        },
        COMPLIANCE_VIOLATION_DETECTED: {
          target: 'violation_detected',
          actions: ['detectViolation', 'logStateChange']
        },
        AUDIT_REQUIRED: {
          target: 'audit_in_progress',
          actions: ['initiateAudit', 'logStateChange']
        }
      }
    },

    violation_detected: {
      entry: ['logStateChange', 'updateComplianceStatus', 'handleViolation'],
      on: {
        VIOLATION_RESOLVED: {
          target: 'checking_compliance',
          actions: ['resolveViolation', 'logStateChange']
        },
        VIOLATION_ESCALATED: {
          target: 'violation_escalated',
          actions: ['escalateViolation', 'logStateChange']
        },
        REMEDIATION_REQUIRED: {
          target: 'remediation_required',
          actions: ['requireRemediation', 'logStateChange']
        }
      }
    },

    violation_escalated: {
      entry: ['logStateChange', 'updateComplianceStatus', 'handleEscalatedViolation'],
      on: {
        VIOLATION_RESOLVED: {
          target: 'checking_compliance',
          actions: ['resolveEscalatedViolation', 'logStateChange']
        },
        ACCOUNT_SUSPENDED: {
          target: 'suspended',
          actions: ['suspendAccount', 'logStateChange']
        },
        LEGAL_ACTION_REQUIRED: {
          target: 'legal_action',
          actions: ['initiateLegalAction', 'logStateChange']
        }
      }
    },

    remediation_required: {
      entry: ['logStateChange', 'updateComplianceStatus', 'initiateRemediation'],
      on: {
        REMEDIATION_COMPLETE: {
          target: 'checking_compliance',
          actions: ['completeRemediation', 'logStateChange']
        },
        REMEDIATION_FAILED: {
          target: 'violation_escalated',
          actions: ['failRemediation', 'logStateChange']
        }
      }
    },

    audit_in_progress: {
      entry: ['logStateChange', 'updateComplianceStatus', 'conductAudit'],
      on: {
        AUDIT_COMPLETE: {
          target: 'compliant',
          actions: ['completeAudit', 'logStateChange']
        },
        AUDIT_FAILED: {
          target: 'violation_detected',
          actions: ['failAudit', 'logStateChange']
        }
      }
    },

    suspended: {
      entry: ['logStateChange', 'updateComplianceStatus', 'suspendAccess'],
      on: {
        SUSPENSION_LIFTED: {
          target: 'checking_compliance',
          actions: ['liftSuspension', 'logStateChange']
        },
        ACCOUNT_TERMINATED: {
          target: 'terminated',
          actions: ['terminateAccount', 'logStateChange']
        }
      }
    },

    legal_action: {
      entry: ['logStateChange', 'updateComplianceStatus', 'initiateLegalAction'],
      on: {
        LEGAL_ACTION_RESOLVED: {
          target: 'checking_compliance',
          actions: ['resolveLegalAction', 'logStateChange']
        },
        LEGAL_ACTION_ESCALATED: {
          target: 'terminated',
          actions: ['escalateLegalAction', 'logStateChange']
        }
      }
    },

    terminated: {
      entry: ['logStateChange', 'updateComplianceStatus', 'terminateAccess'],
      type: 'final'
    }
  }
}, {
  guards: {
    hasAllRequiredDocuments: (context) => {
      return context.requiredDocuments.every(doc => 
        context.completedDocuments.includes(doc)
      );
    },
    hasExpiredDocuments: (context) => {
      return context.expiredDocuments.length > 0;
    },
    hasActiveViolations: (context) => {
      return context.violations.some(violation => violation.status === 'ACTIVE');
    },
    complianceScoreAboveThreshold: (context) => {
      return context.complianceScore >= 80; // 80% compliance threshold
    },
    canUpgradeRbac: (context) => {
      return context.complianceScore >= 90 && context.riskLevel === 'LOW';
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

    updateComplianceStatus: async (context, event) => {
      try {
        await prisma.user.update({
          where: { id: context.userId },
          data: {
            complianceStatus: event.to || 'UNKNOWN',
            lastComplianceCheck: new Date()
          }
        });
      } catch (error) {
        console.error('Failed to update compliance status:', error);
      }
    },

    addCompletedDocument: assign({
      completedDocuments: (context, event) => [
        ...context.completedDocuments,
        event.metadata?.documentType
      ],
      pendingDocuments: (context, event) =>
        context.pendingDocuments.filter(doc => doc !== event.metadata?.documentType)
    }),

    addNewRequirements: assign({
      requiredDocuments: (context, event) => [
        ...context.requiredDocuments,
        ...event.metadata?.requiredDocuments
      ],
      pendingDocuments: (context, event) => [
        ...context.pendingDocuments,
        ...event.metadata?.requiredDocuments
      ]
    }),

    setRequiredDocuments: assign({
      requiredDocuments: (context, event) => event.metadata?.requiredDocuments || [],
      pendingDocuments: (context, event) => event.metadata?.requiredDocuments || []
    }),

    checkCompliance: async (context, event) => {
      const hasAllDocuments = context.requiredDocuments.every(doc => 
        context.completedDocuments.includes(doc)
      );
      
      if (hasAllDocuments) {
        event.machine.send('COMPLIANCE_VERIFIED');
      } else {
        event.machine.send('COMPLIANCE_INCOMPLETE');
      }
    },

    updateComplianceScore: assign({
      complianceScore: (context, event) => {
        const totalRequired = context.requiredDocuments.length;
        const completed = context.completedDocuments.length;
        return totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 100;
      }
    }),

    identifyMissingDocuments: assign({
      pendingDocuments: (context) =>
        context.requiredDocuments.filter(doc => 
          !context.completedDocuments.includes(doc)
        )
    }),

    detectViolation: assign({
      violations: (context, event) => [
        ...context.violations,
        {
          id: event.metadata?.violationId,
          type: event.metadata?.type,
          description: event.metadata?.description,
          severity: event.metadata?.severity || 'MEDIUM',
          status: 'ACTIVE',
          detectedAt: new Date().toISOString()
        }
      ],
      riskLevel: (context, event) => {
        const severity = event.metadata?.severity || 'MEDIUM';
        if (severity === 'HIGH') return 'HIGH';
        if (severity === 'MEDIUM') return 'MEDIUM';
        return 'LOW';
      }
    }),

    resolveViolation: assign({
      violations: (context, event) =>
        context.violations.map(violation =>
          violation.id === event.metadata?.violationId
            ? { ...violation, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
            : violation
        )
    }),

    escalateViolation: assign({
      violations: (context, event) =>
        context.violations.map(violation =>
          violation.id === event.metadata?.violationId
            ? { ...violation, status: 'ESCALATED', escalatedAt: new Date().toISOString() }
            : violation
        )
    }),

    requireRemediation: assign({
      remediationActions: (context, event) => [
        ...context.remediationActions,
        {
          id: event.metadata?.remediationId,
          type: event.metadata?.type,
          description: event.metadata?.description,
          deadline: event.metadata?.deadline,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      ]
    }),

    completeRemediation: assign({
      remediationActions: (context, event) =>
        context.remediationActions.map(action =>
          action.id === event.metadata?.remediationId
            ? { ...action, status: 'COMPLETED', completedAt: new Date().toISOString() }
            : action
        )
    }),

    removeExpiredDocument: assign({
      expiredDocuments: (context, event) => [
        ...context.expiredDocuments,
        event.metadata?.documentType
      ],
      completedDocuments: (context, event) =>
        context.completedDocuments.filter(doc => doc !== event.metadata?.documentType)
    }),

    checkUpgradeRequirements: async (context, event) => {
      const canUpgrade = context.complianceScore >= 90 && context.riskLevel === 'LOW';
      if (canUpgrade) {
        event.machine.send('COMPLIANCE_VERIFIED');
      } else {
        event.machine.send('COMPLIANCE_INCOMPLETE');
      }
    },

    // Notification actions
    notifyUser: async (context, event) => {
      console.log(`Notifying user ${context.userId} of compliance requirements`);
    },

    // Access control actions
    grantAccess: async (context, event) => {
      console.log(`Granting compliance-based access to user: ${context.userId}`);
    },

    suspendAccess: async (context, event) => {
      console.log(`Suspending access for user: ${context.userId}`);
    },

    terminateAccess: async (context, event) => {
      console.log(`Terminating access for user: ${context.userId}`);
    },

    // Audit actions
    initiateAudit: async (context, event) => {
      console.log(`Initiating compliance audit for user: ${context.userId}`);
    },

    conductAudit: async (context, event) => {
      console.log(`Conducting compliance audit for user: ${context.userId}`);
    },

    completeAudit: assign({
      complianceHistory: (context, event) => [
        ...context.complianceHistory,
        {
          auditId: event.metadata?.auditId,
          score: context.complianceScore,
          status: 'PASSED',
          completedAt: new Date().toISOString()
        }
      ]
    }),

    failAudit: assign({
      complianceHistory: (context, event) => [
        ...context.complianceHistory,
        {
          auditId: event.metadata?.auditId,
          score: context.complianceScore,
          status: 'FAILED',
          completedAt: new Date().toISOString()
        }
      ]
    }),

    // Legal actions
    initiateLegalAction: async (context, event) => {
      console.log(`Initiating legal action for user: ${context.userId}`);
    },

    resolveLegalAction: async (context, event) => {
      console.log(`Resolving legal action for user: ${context.userId}`);
    }
  }
});

/**
 * Compliance State Machine Service
 */
class ComplianceStateMachine extends EventEmitter {
  constructor() {
    super();
    this.activeMachines = new Map();
  }

  /**
   * Create a new compliance state machine
   */
  async createMachine(userId, initialContext = {}) {
    const context = {
      userId,
      currentRbacLevel: 'GUEST',
      targetRbacLevel: 'GUEST',
      requiredDocuments: [],
      completedDocuments: [],
      pendingDocuments: [],
      expiredDocuments: [],
      complianceScore: 0,
      lastComplianceCheck: new Date().toISOString(),
      canadianCompliance: {
        pipeda: false,
        phipa: false,
        casl: false,
        ontarioEcommerce: false
      },
      auditTrail: [],
      complianceHistory: [],
      riskLevel: 'LOW',
      violations: [],
      remediationActions: [],
      lastActivity: new Date().toISOString(),
      complianceStartDate: new Date().toISOString(),
      nextReviewDate: null,
      ...initialContext
    };

    const machine = interpret(complianceMachine.withContext(context));

    machine.onTransition((state) => {
      console.log(`Compliance ${userId} transitioned to:`, state.value);
      this.handleStateChange(userId, state);
    });

    this.activeMachines.set(userId, machine);
    machine.start();
    return machine;
  }

  /**
   * Send event to compliance state machine
   */
  async sendEvent(userId, event) {
    const machine = this.activeMachines.get(userId);
    if (machine) {
      machine.send(event);
    } else {
      console.error(`No compliance state machine found for user: ${userId}`);
    }
  }

  /**
   * Get current state of compliance
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
    if (state.value === 'compliant' && state.changed) {
      this.emit('complianceAchieved', {
        userId,
        rbacLevel: state.context.currentRbacLevel,
        complianceScore: state.context.complianceScore
      });
    }

    if (state.value === 'violation_detected' && state.changed) {
      this.emit('complianceViolation', {
        userId,
        violations: state.context.violations
      });
    }
  }

  /**
   * Get compliance analytics
   */
  async getComplianceAnalytics(userId) {
    const state = this.getState(userId);
    if (!state) {
      return null;
    }

    return {
      userId,
      currentState: state.value,
      rbacLevel: state.context.currentRbacLevel,
      complianceScore: state.context.complianceScore,
      requiredDocuments: state.context.requiredDocuments,
      completedDocuments: state.context.completedDocuments,
      pendingDocuments: state.context.pendingDocuments,
      expiredDocuments: state.context.expiredDocuments,
      canadianCompliance: state.context.canadianCompliance,
      riskLevel: state.context.riskLevel,
      violations: state.context.violations,
      lastComplianceCheck: state.context.lastComplianceCheck
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

module.exports = ComplianceStateMachine;
