/**
 * SmartStart State Machine Manager
 * Central orchestrator for all state machines in the platform
 * Manages user journeys, ventures, legal documents, subscriptions, and compliance
 */

const { PrismaClient } = require('@prisma/client');
const EventEmitter = require('events');

// Import all state machine services
const LegalStateMachine = require('./legal/LegalStateMachine');
const UserJourneyStateMachine = require('./user-journey/UserJourneyStateMachine');
const VentureStateMachine = require('./venture/VentureStateMachine');
const SubscriptionStateMachine = require('./subscription/SubscriptionStateMachine');
const TeamStateMachine = require('./team/TeamStateMachine');
const ComplianceStateMachine = require('./compliance/ComplianceStateMachine');

const prisma = new PrismaClient();

class StateMachineManager extends EventEmitter {
  constructor() {
    super();
    
    // Initialize all state machine services
    this.stateMachines = {
      legal: new LegalStateMachine(),
      userJourney: new UserJourneyStateMachine(),
      venture: new VentureStateMachine(),
      subscription: new SubscriptionStateMachine(),
      team: new TeamStateMachine(),
      compliance: new ComplianceStateMachine()
    };

    // Active state machine instances
    this.activeMachines = new Map();
    
    // Cross-machine event coordination
    this.setupCrossMachineEvents();
    
    // Cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  // ===== CORE STATE MACHINE MANAGEMENT =====

  /**
   * Create a new state machine instance
   */
  async createStateMachine(type, id, initialContext = {}) {
    try {
      const stateMachine = this.stateMachines[type];
      if (!stateMachine) {
        throw new Error(`Unknown state machine type: ${type}`);
      }

      const machine = await stateMachine.createMachine(id, initialContext);
      
      // Store the active machine
      const machineKey = `${type}:${id}`;
      this.activeMachines.set(machineKey, {
        type,
        id,
        machine,
        createdAt: new Date(),
        lastActivity: new Date()
      });

      // Emit creation event
      this.emit('machineCreated', { type, id, machine });

      return machine;
    } catch (error) {
      console.error(`Failed to create ${type} state machine for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Send event to a state machine
   */
  async sendEvent(type, id, event, metadata = {}) {
    try {
      const machineKey = `${type}:${id}`;
      const activeMachine = this.activeMachines.get(machineKey);
      
      if (!activeMachine) {
        throw new Error(`No active state machine found for ${type}:${id}`);
      }

      // Add metadata
      const eventWithMetadata = {
        ...event,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          managerVersion: '1.0.0'
        }
      };

      // Send event to the specific state machine
      await activeMachine.machine.send(eventWithMetadata);
      
      // Update last activity
      activeMachine.lastActivity = new Date();

      // Emit event
      this.emit('eventSent', { type, id, event: eventWithMetadata });

      return activeMachine.machine.state;
    } catch (error) {
      console.error(`Failed to send event to ${type}:${id}:`, error);
      throw error;
    }
  }

  /**
   * Get current state of a state machine
   */
  getState(type, id) {
    const machineKey = `${type}:${id}`;
    const activeMachine = this.activeMachines.get(machineKey);
    
    if (!activeMachine) {
      return null;
    }

    return {
      type,
      id,
      currentState: activeMachine.machine.state.value,
      context: activeMachine.machine.state.context,
      history: activeMachine.machine.state.history,
      createdAt: activeMachine.createdAt,
      lastActivity: activeMachine.lastActivity
    };
  }

  /**
   * Get all active state machines of a type
   */
  getActiveMachines(type) {
    const machines = [];
    
    for (const [key, activeMachine] of this.activeMachines.entries()) {
      if (key.startsWith(`${type}:`)) {
        machines.push({
          id: activeMachine.id,
          currentState: activeMachine.machine.state.value,
          context: activeMachine.machine.state.context,
          createdAt: activeMachine.createdAt,
          lastActivity: activeMachine.lastActivity
        });
      }
    }

    return machines;
  }

  /**
   * Get state machine visualization data
   */
  getVisualization(type, id) {
    const state = this.getState(type, id);
    if (!state) {
      return null;
    }

    return {
      type,
      id,
      currentState: state.currentState,
      context: state.context,
      history: state.history,
      metadata: {
        createdAt: state.createdAt,
        lastActivity: state.lastActivity
      }
    };
  }

  // ===== CROSS-MACHINE COORDINATION =====

  /**
   * Setup cross-machine event coordination
   */
  setupCrossMachineEvents() {
    // Legal document signed -> Update user compliance
    this.stateMachines.legal.on('documentSigned', async (data) => {
      const { documentId, userId, documentType } = data;
      
      // Update user compliance
      await this.sendEvent('compliance', userId, {
        type: 'DOCUMENT_SIGNED',
        metadata: { documentId, documentType }
      });

      // Update user journey if needed
      await this.sendEvent('userJourney', userId, {
        type: 'LEGAL_MILESTONE_COMPLETED',
        metadata: { documentType, documentId }
      });
    });

    // User journey milestone -> Check legal requirements
    this.stateMachines.userJourney.on('milestoneReached', async (data) => {
      const { userId, milestone, rbacLevel } = data;
      
      // Check if new legal documents are required
      const requiredDocs = this.stateMachines.legal.getRequiredDocumentsForRbac(rbacLevel);
      if (requiredDocs.length > 0) {
        await this.sendEvent('compliance', userId, {
          type: 'NEW_REQUIREMENTS_ADDED',
          metadata: { requiredDocuments: requiredDocs, rbacLevel }
        });
      }
    });

    // Venture created -> Setup legal documents
    this.stateMachines.venture.on('ventureCreated', async (data) => {
      const { ventureId, ownerId, ventureType } = data;
      
      // Create required legal documents
      await this.sendEvent('legal', `venture_${ventureId}`, {
        type: 'CREATE_VENTURE_DOCUMENTS',
        metadata: { ventureId, ownerId, ventureType }
      });
    });

    // Subscription changed -> Update user journey
    this.stateMachines.subscription.on('subscriptionChanged', async (data) => {
      const { userId, newPlan, oldPlan } = data;
      
      await this.sendEvent('userJourney', userId, {
        type: 'SUBSCRIPTION_CHANGED',
        metadata: { newPlan, oldPlan }
      });
    });

    // Team member added -> Update compliance
    this.stateMachines.team.on('memberAdded', async (data) => {
      const { teamId, userId, role } = data;
      
      // Check if user needs additional compliance
      await this.sendEvent('compliance', userId, {
        type: 'TEAM_ROLE_ASSIGNED',
        metadata: { teamId, role }
      });
    });
  }

  // ===== SPECIALIZED STATE MACHINE ACCESS =====

  /**
   * Get legal state machine
   */
  getLegalStateMachine() {
    return this.stateMachines.legal;
  }

  /**
   * Get user journey state machine
   */
  getUserJourneyStateMachine() {
    return this.stateMachines.userJourney;
  }

  /**
   * Get venture state machine
   */
  getVentureStateMachine() {
    return this.stateMachines.venture;
  }

  /**
   * Get subscription state machine
   */
  getSubscriptionStateMachine() {
    return this.stateMachines.subscription;
  }

  /**
   * Get team state machine
   */
  getTeamStateMachine() {
    return this.stateMachines.team;
  }

  /**
   * Get compliance state machine
   */
  getComplianceStateMachine() {
    return this.stateMachines.compliance;
  }

  // ===== BULK OPERATIONS =====

  /**
   * Get comprehensive user state across all machines
   */
  async getUserComprehensiveState(userId) {
    const states = {};

    // Get user journey state
    const userJourneyState = this.getState('userJourney', userId);
    if (userJourneyState) {
      states.userJourney = userJourneyState;
    }

    // Get compliance state
    const complianceState = this.getState('compliance', userId);
    if (complianceState) {
      states.compliance = complianceState;
    }

    // Get subscription state
    const subscriptionState = this.getState('subscription', userId);
    if (subscriptionState) {
      states.subscription = subscriptionState;
    }

    // Get user's ventures
    const userVentures = this.getActiveMachines('venture').filter(v => 
      v.context?.ownerId === userId
    );
    states.ventures = userVentures;

    // Get user's teams
    const userTeams = this.getActiveMachines('team').filter(t => 
      t.context?.members?.some(m => m.userId === userId)
    );
    states.teams = userTeams;

    return states;
  }

  /**
   * Get comprehensive venture state across all machines
   */
  async getVentureComprehensiveState(ventureId) {
    const states = {};

    // Get venture state
    const ventureState = this.getState('venture', ventureId);
    if (ventureState) {
      states.venture = ventureState;
    }

    // Get legal documents for venture
    const legalDocuments = this.getActiveMachines('legal').filter(l => 
      l.context?.ventureId === ventureId
    );
    states.legalDocuments = legalDocuments;

    // Get team state
    const teamState = this.getState('team', `venture_${ventureId}`);
    if (teamState) {
      states.team = teamState;
    }

    return states;
  }

  // ===== MAINTENANCE =====

  /**
   * Cleanup completed or inactive state machines
   */
  cleanup() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [key, activeMachine] of this.activeMachines.entries()) {
      const isInactive = (now - activeMachine.lastActivity) > inactiveThreshold;
      const isCompleted = activeMachine.machine.state.done;

      if (isInactive || isCompleted) {
        console.log(`Cleaning up state machine: ${key}`);
        activeMachine.machine.stop();
        this.activeMachines.delete(key);
        
        this.emit('machineCleanedUp', { 
          type: activeMachine.type, 
          id: activeMachine.id 
        });
      }
    }
  }

  /**
   * Get system health and statistics
   */
  getSystemHealth() {
    const stats = {
      totalActiveMachines: this.activeMachines.size,
      machinesByType: {},
      oldestMachine: null,
      newestMachine: null
    };

    let oldestDate = new Date();
    let newestDate = new Date(0);

    for (const [key, activeMachine] of this.activeMachines.entries()) {
      const type = activeMachine.type;
      stats.machinesByType[type] = (stats.machinesByType[type] || 0) + 1;

      if (activeMachine.createdAt < oldestDate) {
        oldestDate = activeMachine.createdAt;
        stats.oldestMachine = { type, id: activeMachine.id, createdAt: oldestDate };
      }

      if (activeMachine.createdAt > newestDate) {
        newestDate = activeMachine.createdAt;
        stats.newestMachine = { type, id: activeMachine.id, createdAt: newestDate };
      }
    }

    return stats;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('Shutting down State Machine Manager...');
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Stop all active machines
    for (const [key, activeMachine] of this.activeMachines.entries()) {
      try {
        activeMachine.machine.stop();
        console.log(`Stopped state machine: ${key}`);
      } catch (error) {
        console.error(`Error stopping state machine ${key}:`, error);
      }
    }

    // Clear active machines
    this.activeMachines.clear();

    // Close Prisma connection
    await prisma.$disconnect();

    console.log('State Machine Manager shutdown complete');
  }
}

module.exports = StateMachineManager;
