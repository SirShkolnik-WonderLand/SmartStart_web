/**
 * SmartStart Umbrella State Machine
 * Manages umbrella relationship workflows and state transitions
 */

const { PrismaClient } = require('@prisma/client');
const EventEmitter = require('events');

class UmbrellaStateMachine extends EventEmitter {
  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.activeMachines = new Map();
  }

  // ===== STATE DEFINITIONS =====

  getStates() {
    return {
      // Umbrella Relationship States
      PENDING_AGREEMENT: {
        name: 'Pending Agreement',
        description: 'Umbrella relationship created, waiting for agreement signatures',
        allowedTransitions: ['ACTIVE', 'TERMINATED', 'SUSPENDED'],
        actions: ['generateAgreement', 'signAgreement', 'terminate']
      },
      ACTIVE: {
        name: 'Active',
        description: 'Umbrella relationship is active and generating revenue shares',
        allowedTransitions: ['SUSPENDED', 'TERMINATED'],
        actions: ['calculateRevenue', 'suspend', 'terminate']
      },
      SUSPENDED: {
        name: 'Suspended',
        description: 'Umbrella relationship is temporarily suspended',
        allowedTransitions: ['ACTIVE', 'TERMINATED'],
        actions: ['reactivate', 'terminate']
      },
      TERMINATED: {
        name: 'Terminated',
        description: 'Umbrella relationship has been terminated',
        allowedTransitions: [],
        actions: ['archive']
      },
      EXPIRED: {
        name: 'Expired',
        description: 'Umbrella relationship has expired',
        allowedTransitions: ['ACTIVE', 'TERMINATED'],
        actions: ['renew', 'terminate']
      }
    };
  }

  // ===== STATE MACHINE OPERATIONS =====

  /**
   * Create a new umbrella state machine instance
   */
  async createStateMachine(relationshipId, initialState = 'PENDING_AGREEMENT') {
    try {
      console.log(`🌂 Creating umbrella state machine for relationship: ${relationshipId}`);

      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId },
        include: {
          referrer: true,
          referred: true
        }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      const stateMachine = {
        id: relationshipId,
        currentState: initialState,
        previousState: null,
        createdAt: new Date(),
        lastTransition: new Date(),
        context: {
          relationshipId,
          referrerId: relationship.referrerId,
          referredId: relationship.referredId,
          shareRate: relationship.defaultShareRate
        },
        history: [{
          state: initialState,
          timestamp: new Date(),
          action: 'created',
          metadata: {}
        }]
      };

      this.activeMachines.set(relationshipId, stateMachine);

      // Update database with initial state
      await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          status: initialState,
          updatedAt: new Date()
        }
      });

      this.emit('stateMachineCreated', stateMachine);
      console.log(`✅ Umbrella state machine created: ${relationshipId}`);
      return stateMachine;
    } catch (error) {
      console.error('❌ Error creating umbrella state machine:', error);
      throw error;
    }
  }

  /**
   * Transition to a new state
   */
  async transitionTo(relationshipId, newState, action, metadata = {}) {
    try {
      console.log(`🌂 Transitioning umbrella relationship ${relationshipId} to ${newState}`);

      const stateMachine = this.activeMachines.get(relationshipId);
      if (!stateMachine) {
        throw new Error('State machine not found');
      }

      const currentState = stateMachine.currentState;
      const states = this.getStates();
      const currentStateConfig = states[currentState];

      // Validate transition
      if (!currentStateConfig.allowedTransitions.includes(newState)) {
        throw new Error(`Invalid transition from ${currentState} to ${newState}`);
      }

      // Update state machine
      stateMachine.previousState = currentState;
      stateMachine.currentState = newState;
      stateMachine.lastTransition = new Date();
      stateMachine.history.push({
        state: newState,
        timestamp: new Date(),
        action,
        metadata,
        previousState: currentState
      });

      // Update database
      await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          status: newState,
          updatedAt: new Date()
        }
      });

      // Execute state-specific actions
      await this.executeStateActions(relationshipId, newState, action, metadata);

      this.emit('stateTransitioned', {
        relationshipId,
        from: currentState,
        to: newState,
        action,
        metadata
      });

      console.log(`✅ Umbrella relationship ${relationshipId} transitioned to ${newState}`);
      return stateMachine;
    } catch (error) {
      console.error('❌ Error transitioning umbrella state:', error);
      throw error;
    }
  }

  /**
   * Execute actions specific to the new state
   */
  async executeStateActions(relationshipId, state, action, metadata) {
    try {
      switch (state) {
        case 'PENDING_AGREEMENT':
          if (action === 'generateAgreement') {
            await this.generateUmbrellaAgreement(relationshipId);
          }
          break;

        case 'ACTIVE':
          if (action === 'activate') {
            await this.activateUmbrellaRelationship(relationshipId);
          } else if (action === 'calculateRevenue') {
            await this.calculateRevenueShares(relationshipId, metadata);
          }
          break;

        case 'SUSPENDED':
          if (action === 'suspend') {
            await this.suspendUmbrellaRelationship(relationshipId, metadata.reason);
          }
          break;

        case 'TERMINATED':
          if (action === 'terminate') {
            await this.terminateUmbrellaRelationship(relationshipId, metadata.reason);
          }
          break;

        case 'EXPIRED':
          if (action === 'expire') {
            await this.expireUmbrellaRelationship(relationshipId);
          }
          break;
      }
    } catch (error) {
      console.error('❌ Error executing state actions:', error);
      throw error;
    }
  }

  // ===== STATE-SPECIFIC ACTIONS =====

  /**
   * Generate umbrella agreement document
   */
  async generateUmbrellaAgreement(relationshipId) {
    try {
      console.log(`📄 Generating umbrella agreement for relationship: ${relationshipId}`);

      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId },
        include: {
          referrer: true,
          referred: true
        }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      // Generate document content
      const documentContent = this.generateAgreementContent(relationship);

      const document = await this.prisma.umbrellaDocument.create({
        data: {
          umbrellaId: relationshipId,
          documentType: 'UMBRELLA_AGREEMENT',
          title: `Umbrella Agreement - ${relationship.referrer.name} & ${relationship.referred.name}`,
          content: documentContent,
          status: 'DRAFT',
          requiresSignature: true
        }
      });

      console.log(`✅ Umbrella agreement generated: ${document.id}`);
      return document;
    } catch (error) {
      console.error('❌ Error generating umbrella agreement:', error);
      throw error;
    }
  }

  /**
   * Activate umbrella relationship
   */
  async activateUmbrellaRelationship(relationshipId) {
    try {
      console.log(`✅ Activating umbrella relationship: ${relationshipId}`);

      await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          status: 'ACTIVE',
          isActive: true,
          agreementSigned: true,
          signedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create analytics record
      await this.createAnalyticsRecord(relationshipId);

      console.log(`✅ Umbrella relationship activated: ${relationshipId}`);
    } catch (error) {
      console.error('❌ Error activating umbrella relationship:', error);
      throw error;
    }
  }

  /**
   * Calculate revenue shares for project
   */
  async calculateRevenueShares(relationshipId, metadata) {
    try {
      const { projectId, revenue } = metadata;
      console.log(`💰 Calculating revenue shares for relationship: ${relationshipId}`);

      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      const shareAmount = (revenue * relationship.defaultShareRate) / 100;

      const revenueShare = await this.prisma.revenueShare.create({
        data: {
          umbrellaId: relationshipId,
          projectId,
          referrerId: relationship.referrerId,
          referredId: relationship.referredId,
          projectRevenue: revenue,
          sharePercentage: relationship.defaultShareRate,
          shareAmount,
          status: 'CALCULATED'
        }
      });

      console.log(`✅ Revenue share calculated: ${revenueShare.id}`);
      return revenueShare;
    } catch (error) {
      console.error('❌ Error calculating revenue shares:', error);
      throw error;
    }
  }

  /**
   * Suspend umbrella relationship
   */
  async suspendUmbrellaRelationship(relationshipId, reason) {
    try {
      console.log(`⏸️ Suspending umbrella relationship: ${relationshipId}`);

      await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          status: 'SUSPENDED',
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Umbrella relationship suspended: ${relationshipId}`);
    } catch (error) {
      console.error('❌ Error suspending umbrella relationship:', error);
      throw error;
    }
  }

  /**
   * Terminate umbrella relationship
   */
  async terminateUmbrellaRelationship(relationshipId, reason) {
    try {
      console.log(`❌ Terminating umbrella relationship: ${relationshipId}`);

      await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          status: 'TERMINATED',
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Umbrella relationship terminated: ${relationshipId}`);
    } catch (error) {
      console.error('❌ Error terminating umbrella relationship:', error);
      throw error;
    }
  }

  /**
   * Expire umbrella relationship
   */
  async expireUmbrellaRelationship(relationshipId) {
    try {
      console.log(`⏰ Expiring umbrella relationship: ${relationshipId}`);

      await this.prisma.umbrellaRelationship.update({
        where: { id: relationshipId },
        data: {
          status: 'EXPIRED',
          isActive: false,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Umbrella relationship expired: ${relationshipId}`);
    } catch (error) {
      console.error('❌ Error expiring umbrella relationship:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Generate agreement document content
   */
  generateAgreementContent(relationship) {
    const template = `
# SmartStart Private Umbrella Agreement

**Agreement Date:** ${new Date().toLocaleDateString()}
**Agreement Version:** v1.0
**Governing Law:** Ontario, Canada

## PARTIES

**Referrer (Sponsor):**
- Name: ${relationship.referrer.name}
- Email: ${relationship.referrer.email}
- SmartStart User ID: ${relationship.referrer.id}

**Referred (Sponsored):**
- Name: ${relationship.referred.name}
- Email: ${relationship.referred.email}
- SmartStart User ID: ${relationship.referred.id}

## AGREEMENT TERMS

### 1. REFERRAL RELATIONSHIP
The Referrer has brought the Referred to the SmartStart platform and both parties agree to establish a Private Umbrella relationship.

### 2. REVENUE SHARING
The Referrer shall receive ${relationship.defaultShareRate}% of all project revenue generated by the Referred through SmartStart projects.

### 3. OBLIGATIONS
- **Referrer**: Provide guidance and support to the Referred
- **Referred**: Maintain active participation in the SmartStart platform
- **Platform**: Facilitate revenue sharing calculations and payments

### 4. TERMINATION
Either party may terminate this agreement with 30 days written notice.

### 5. LEGAL COMPLIANCE
This agreement is governed by the laws of Ontario, Canada.

---

**Document Hash:** [TO_BE_GENERATED]
**Agreement ID:** ${relationship.id}
**Status:** DRAFT
    `;

    return template.trim();
  }

  /**
   * Create analytics record for relationship
   */
  async createAnalyticsRecord(relationshipId) {
    try {
      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await this.prisma.umbrellaAnalytics.create({
        data: {
          userId: relationship.referrerId,
          period: 'monthly',
          periodStart,
          periodEnd,
          totalReferrals: 1,
          activeReferrals: 1,
          averageShareRate: relationship.defaultShareRate
        }
      });

      console.log(`✅ Analytics record created for relationship: ${relationshipId}`);
    } catch (error) {
      console.error('❌ Error creating analytics record:', error);
      throw error;
    }
  }

  /**
   * Get state machine for relationship
   */
  getStateMachine(relationshipId) {
    return this.activeMachines.get(relationshipId);
  }

  /**
   * Get all active state machines
   */
  getAllStateMachines() {
    return Array.from(this.activeMachines.values());
  }

  /**
   * Cleanup inactive state machines
   */
  async cleanup() {
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [relationshipId, stateMachine] of this.activeMachines.entries()) {
        if (stateMachine.lastTransition < cutoffDate) {
          this.activeMachines.delete(relationshipId);
        }
      }

      console.log(`🧹 Cleaned up inactive umbrella state machines`);
    } catch (error) {
      console.error('❌ Error cleaning up state machines:', error);
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = UmbrellaStateMachine;
