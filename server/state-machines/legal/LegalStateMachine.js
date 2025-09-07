/**
 * SmartStart Legal Framework State Machine
 * Implements comprehensive state management for legal document workflows
 * Uses XState for robust state machine implementation with Canadian compliance
 */

const { createMachine, interpret, assign } = require('xstate');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Legal Document State Machine
 * Manages the complete lifecycle of legal documents from creation to execution
 */
const legalDocumentMachine = createMachine({
  id: 'legalDocument',
  initial: 'draft',
  context: {
    documentId: null,
    documentType: null,
    userId: null,
    ventureId: null,
    requiredSignatures: [],
    completedSignatures: [],
    complianceChecks: [],
    auditTrail: [],
    canadianCompliance: {
      pipeda: false,
      phipa: false,
      casl: false,
      ontarioEcommerce: false
    },
    securityTier: 'TIER_0',
    expiryDate: null,
    lastModified: null
  },
  states: {
    draft: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        SUBMIT_FOR_REVIEW: {
          target: 'under_review',
          cond: 'hasRequiredContent',
          actions: ['validateContent', 'logStateChange']
        },
        GENERATE_TEMPLATE: {
          target: 'template_generation',
          actions: ['generateTemplate', 'logStateChange']
        },
        CANCEL: {
          target: 'cancelled',
          actions: ['logStateChange']
        }
      }
    },
    
    template_generation: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        TEMPLATE_GENERATED: {
          target: 'draft',
          actions: ['updateTemplate', 'logStateChange']
        },
        TEMPLATE_FAILED: {
          target: 'draft',
          actions: ['logError', 'logStateChange']
        },
        CANCEL: {
          target: 'cancelled',
          actions: ['logStateChange']
        }
      }
    },

    under_review: {
      entry: ['logStateChange', 'updateDocumentStatus', 'notifyReviewers'],
      on: {
        APPROVE: {
          target: 'approved',
          cond: 'hasValidApproval',
          actions: ['recordApproval', 'logStateChange']
        },
        REJECT: {
          target: 'rejected',
          actions: ['recordRejection', 'logStateChange']
        },
        REQUEST_REVISION: {
          target: 'revision_requested',
          actions: ['recordRevisionRequest', 'logStateChange']
        },
        CANCEL: {
          target: 'cancelled',
          actions: ['logStateChange']
        }
      }
    },

    revision_requested: {
      entry: ['logStateChange', 'updateDocumentStatus', 'notifyAuthor'],
      on: {
        REVISION_COMPLETE: {
          target: 'under_review',
          actions: ['recordRevision', 'logStateChange']
        },
        CANCEL: {
          target: 'cancelled',
          actions: ['logStateChange']
        }
      }
    },

    approved: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        INITIATE_SIGNING: {
          target: 'signing_workflow',
          cond: 'hasRequiredSigners',
          actions: ['setupSigningWorkflow', 'logStateChange']
        },
        AMEND: {
          target: 'amendment_draft',
          actions: ['createAmendment', 'logStateChange']
        },
        EXPIRE: {
          target: 'expired',
          actions: ['logStateChange']
        }
      }
    },

    rejected: {
      entry: ['logStateChange', 'updateDocumentStatus', 'notifyAuthor'],
      on: {
        APPEAL: {
          target: 'under_review',
          actions: ['recordAppeal', 'logStateChange']
        },
        CREATE_NEW: {
          target: 'draft',
          actions: ['createNewVersion', 'logStateChange']
        }
      }
    },

    signing_workflow: {
      entry: ['logStateChange', 'updateDocumentStatus', 'initiateSigningProcess'],
      on: {
        SIGNATURE_RECEIVED: {
          target: 'signing_workflow',
          cond: 'hasMoreSignatures',
          actions: ['recordSignature', 'checkSigningProgress', 'logStateChange']
        },
        ALL_SIGNATURES_COMPLETE: {
          target: 'signature_verification',
          actions: ['logStateChange']
        },
        SIGNATURE_REJECTED: {
          target: 'signature_rejected',
          actions: ['recordRejection', 'logStateChange']
        },
        SIGNING_EXPIRED: {
          target: 'signing_expired',
          actions: ['logStateChange']
        }
      }
    },

    signature_verification: {
      entry: ['logStateChange', 'updateDocumentStatus', 'verifySignatures'],
      on: {
        SIGNATURES_VERIFIED: {
          target: 'effective',
          cond: 'allSignaturesValid',
          actions: ['recordVerification', 'logStateChange']
        },
        SIGNATURE_INVALID: {
          target: 'signature_invalid',
          actions: ['recordInvalidSignature', 'logStateChange']
        }
      }
    },

    effective: {
      entry: ['logStateChange', 'updateDocumentStatus', 'activateDocument', 'notifyParties'],
      on: {
        AMEND: {
          target: 'amendment_draft',
          actions: ['createAmendment', 'logStateChange']
        },
        TERMINATE: {
          target: 'terminated',
          cond: 'canTerminate',
          actions: ['recordTermination', 'logStateChange']
        },
        EXPIRE: {
          target: 'expired',
          actions: ['logStateChange']
        },
        BREACH_DETECTED: {
          target: 'breach_investigation',
          actions: ['initiateBreachInvestigation', 'logStateChange']
        }
      }
    },

    amendment_draft: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        SUBMIT_AMENDMENT: {
          target: 'amendment_review',
          actions: ['logStateChange']
        },
        CANCEL_AMENDMENT: {
          target: 'effective',
          actions: ['cancelAmendment', 'logStateChange']
        }
      }
    },

    amendment_review: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        AMENDMENT_APPROVED: {
          target: 'amendment_signing',
          actions: ['logStateChange']
        },
        AMENDMENT_REJECTED: {
          target: 'effective',
          actions: ['rejectAmendment', 'logStateChange']
        }
      }
    },

    amendment_signing: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        AMENDMENT_SIGNED: {
          target: 'effective',
          actions: ['applyAmendment', 'logStateChange']
        }
      }
    },

    breach_investigation: {
      entry: ['logStateChange', 'updateDocumentStatus', 'initiateInvestigation'],
      on: {
        BREACH_CONFIRMED: {
          target: 'breach_remediation',
          actions: ['confirmBreach', 'logStateChange']
        },
        BREACH_DISMISSED: {
          target: 'effective',
          actions: ['dismissBreach', 'logStateChange']
        }
      }
    },

    breach_remediation: {
      entry: ['logStateChange', 'updateDocumentStatus', 'initiateRemediation'],
      on: {
        REMEDIATION_COMPLETE: {
          target: 'effective',
          actions: ['completeRemediation', 'logStateChange']
        },
        TERMINATE_FOR_BREACH: {
          target: 'terminated',
          actions: ['terminateForBreach', 'logStateChange']
        }
      }
    },

    signature_rejected: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        RETRY_SIGNING: {
          target: 'signing_workflow',
          actions: ['resetSigningWorkflow', 'logStateChange']
        },
        CANCEL: {
          target: 'cancelled',
          actions: ['logStateChange']
        }
      }
    },

    signature_invalid: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        RETRY_VERIFICATION: {
          target: 'signature_verification',
          actions: ['logStateChange']
        },
        CANCEL: {
          target: 'cancelled',
          actions: ['logStateChange']
        }
      }
    },

    signing_expired: {
      entry: ['logStateChange', 'updateDocumentStatus'],
      on: {
        EXTEND_SIGNING: {
          target: 'signing_workflow',
          actions: ['extendSigningDeadline', 'logStateChange']
        },
        CANCEL: {
          target: 'cancelled',
          actions: ['logStateChange']
        }
      }
    },

    expired: {
      entry: ['logStateChange', 'updateDocumentStatus', 'handleExpiry'],
      on: {
        RENEW: {
          target: 'draft',
          actions: ['createRenewal', 'logStateChange']
        }
      }
    },

    terminated: {
      entry: ['logStateChange', 'updateDocumentStatus', 'handleTermination'],
      type: 'final'
    },

    cancelled: {
      entry: ['logStateChange', 'updateDocumentStatus', 'handleCancellation'],
      type: 'final'
    }
  }
}, {
  guards: {
    hasRequiredContent: (context) => {
      return context.documentType && context.userId;
    },
    hasValidApproval: (context) => {
      // Check if approver has proper authority
      return true; // Simplified for now
    },
    hasRequiredSigners: (context) => {
      return context.requiredSignatures && context.requiredSignatures.length > 0;
    },
    hasMoreSignatures: (context) => {
      return context.completedSignatures.length < context.requiredSignatures.length;
    },
    allSignaturesValid: (context) => {
      return context.completedSignatures.every(sig => sig.isValid);
    },
    canTerminate: (context) => {
      // Check if termination is allowed based on document type and context
      return true; // Simplified for now
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
      lastModified: () => new Date().toISOString()
    }),

    updateDocumentStatus: async (context, event) => {
      try {
        await prisma.legalDocument.update({
          where: { id: context.documentId },
          data: {
            status: event.to || 'UNKNOWN',
            updatedAt: new Date()
          }
        });
      } catch (error) {
        console.error('Failed to update document status:', error);
      }
    },

    generateTemplate: async (context, event) => {
      // Template generation logic
      console.log('Generating template for document:', context.documentId);
    },

    validateContent: async (context, event) => {
      // Content validation logic
      console.log('Validating content for document:', context.documentId);
    },

    notifyReviewers: async (context, event) => {
      // Notification logic
      console.log('Notifying reviewers for document:', context.documentId);
    },

    recordApproval: async (context, event) => {
      // Record approval logic
      console.log('Recording approval for document:', context.documentId);
    },

    setupSigningWorkflow: async (context, event) => {
      // Setup signing workflow logic
      console.log('Setting up signing workflow for document:', context.documentId);
    },

    recordSignature: async (context, event) => {
      // Record signature logic
      console.log('Recording signature for document:', context.documentId);
    },

    verifySignatures: async (context, event) => {
      // Signature verification logic
      console.log('Verifying signatures for document:', context.documentId);
    },

    activateDocument: async (context, event) => {
      // Document activation logic
      console.log('Activating document:', context.documentId);
    },

    // Add more actions as needed...
    logError: (context, event) => {
      console.error('State machine error:', event.error);
    },

    notifyAuthor: (context, event) => {
      console.log('Notifying author for document:', context.documentId);
    },

    notifyParties: (context, event) => {
      console.log('Notifying parties for document:', context.documentId);
    }
  }
});

/**
 * User Compliance State Machine
 * Manages user's overall legal compliance status
 */
const userComplianceMachine = createMachine({
  id: 'userCompliance',
  initial: 'non_compliant',
  context: {
    userId: null,
    rbacLevel: 'GUEST',
    requiredDocuments: [],
    completedDocuments: [],
    complianceScore: 0,
    lastComplianceCheck: null,
    canadianCompliance: {
      pipeda: false,
      phipa: false,
      casl: false
    }
  },
  states: {
    non_compliant: {
      entry: ['logStateChange', 'updateComplianceStatus'],
      on: {
        DOCUMENT_SIGNED: {
          target: 'checking_compliance',
          actions: ['addCompletedDocument', 'logStateChange']
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
          actions: ['logStateChange']
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
        }
      }
    }
  }
}, {
  actions: {
    logStateChange: assign({
      lastComplianceCheck: () => new Date().toISOString()
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

    checkCompliance: async (context, event) => {
      // Compliance checking logic
      console.log('Checking compliance for user:', context.userId);
    },

    grantAccess: async (context, event) => {
      // Grant access based on compliance
      console.log('Granting access for user:', context.userId);
    }
  }
});

/**
 * Legal Framework State Machine Service
 * Main service that manages all legal state machines
 */
class LegalStateMachineService {
  constructor() {
    this.documentMachines = new Map();
    this.userComplianceMachines = new Map();
    this.eventBus = new Map(); // For event coordination
  }

  /**
   * Create a new document state machine
   */
  async createDocumentMachine(documentId, initialContext) {
    const machine = interpret(legalDocumentMachine.withContext({
      ...legalDocumentMachine.context,
      ...initialContext,
      documentId
    }));

    machine.onTransition((state) => {
      console.log(`Document ${documentId} transitioned to:`, state.value);
      this.handleDocumentStateChange(documentId, state);
    });

    this.documentMachines.set(documentId, machine);
    machine.start();
    return machine;
  }

  /**
   * Create a new user compliance state machine
   */
  async createUserComplianceMachine(userId, initialContext) {
    const machine = interpret(userComplianceMachine.withContext({
      ...userComplianceMachine.context,
      ...initialContext,
      userId
    }));

    machine.onTransition((state) => {
      console.log(`User ${userId} compliance transitioned to:`, state.value);
      this.handleUserComplianceChange(userId, state);
    });

    this.userComplianceMachines.set(userId, machine);
    machine.start();
    return machine;
  }

  /**
   * Send event to document state machine
   */
  async sendDocumentEvent(documentId, event) {
    const machine = this.documentMachines.get(documentId);
    if (machine) {
      machine.send(event);
    } else {
      console.error(`No state machine found for document: ${documentId}`);
    }
  }

  /**
   * Send event to user compliance state machine
   */
  async sendUserComplianceEvent(userId, event) {
    const machine = this.userComplianceMachines.get(userId);
    if (machine) {
      machine.send(event);
    } else {
      console.error(`No state machine found for user: ${userId}`);
    }
  }

  /**
   * Get current state of document
   */
  getDocumentState(documentId) {
    const machine = this.documentMachines.get(documentId);
    return machine ? machine.state : null;
  }

  /**
   * Get current state of user compliance
   */
  getUserComplianceState(userId) {
    const machine = this.userComplianceMachines.get(userId);
    return machine ? machine.state : null;
  }

  /**
   * Handle document state changes
   */
  async handleDocumentStateChange(documentId, state) {
    // Emit events, update database, notify users, etc.
    console.log(`Handling document state change for ${documentId}:`, state.value);
    
    // Update audit trail in database
    try {
      await prisma.legalDocument.update({
        where: { id: documentId },
        data: {
          status: state.value.toUpperCase(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to update document state in database:', error);
    }
  }

  /**
   * Handle user compliance state changes
   */
  async handleUserComplianceChange(userId, state) {
    console.log(`Handling user compliance change for ${userId}:`, state.value);
    
    // Update user compliance status in database
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          complianceStatus: state.value.toUpperCase(),
          lastComplianceCheck: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to update user compliance in database:', error);
    }
  }

  /**
   * Get state machine visualization data
   */
  getStateMachineVisualization(type, id) {
    if (type === 'document') {
      const machine = this.documentMachines.get(id);
      return machine ? {
        currentState: machine.state.value,
        context: machine.state.context,
        history: machine.state.history
      } : null;
    } else if (type === 'user') {
      const machine = this.userComplianceMachines.get(id);
      return machine ? {
        currentState: machine.state.value,
        context: machine.state.context,
        history: machine.state.history
      } : null;
    }
    return null;
  }

  /**
   * Cleanup completed state machines
   */
  cleanup() {
    this.documentMachines.forEach((machine, id) => {
      if (machine.state.done) {
        machine.stop();
        this.documentMachines.delete(id);
      }
    });

    this.userComplianceMachines.forEach((machine, id) => {
      if (machine.state.done) {
        machine.stop();
        this.userComplianceMachines.delete(id);
      }
    });
  }
}

module.exports = LegalStateMachineService;
