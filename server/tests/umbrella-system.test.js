/**
 * SmartStart Private Umbrella System - Comprehensive Test Suite
 * Tests all umbrella system functionality including database, API, and state machine
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const UmbrellaStateMachine = require('../state-machines/umbrella/UmbrellaStateMachine');

// Mock data for testing
const mockUsers = {
  referrer: {
    id: 'test-referrer-123',
    name: 'John Referrer',
    email: 'john@test.com',
    level: 'WISE_OWL'
  },
  referred: {
    id: 'test-referred-456',
    name: 'Jane Referred',
    email: 'jane@test.com',
    level: 'OWLET'
  }
};

const mockProject = {
  id: 'test-project-789',
  name: 'Test Project',
  ownerId: mockUsers.referred.id,
  totalValue: 10000
};

describe('Private Umbrella System', () => {
  let prisma;
  let umbrellaStateMachine;
  let app;

  beforeAll(async () => {
    // Initialize Prisma client
    prisma = new PrismaClient();
    umbrellaStateMachine = new UmbrellaStateMachine();
    
    // Initialize Express app (you'll need to import your app)
    // app = require('../consolidated-server');
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await umbrellaStateMachine.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.revenueShare.deleteMany({
      where: {
        OR: [
          { referrerId: mockUsers.referrer.id },
          { referredId: mockUsers.referred.id }
        ]
      }
    });
    
    await prisma.umbrellaRelationship.deleteMany({
      where: {
        OR: [
          { referrerId: mockUsers.referrer.id },
          { referredId: mockUsers.referred.id }
        ]
      }
    });
  });

  describe('Database Schema Tests', () => {
    test('should create umbrella relationship', async () => {
      const relationship = await prisma.umbrellaRelationship.create({
        data: {
          referrerId: mockUsers.referrer.id,
          referredId: mockUsers.referred.id,
          relationshipType: 'PRIVATE_UMBRELLA',
          status: 'PENDING_AGREEMENT',
          defaultShareRate: 1.0
        }
      });

      expect(relationship).toBeDefined();
      expect(relationship.referrerId).toBe(mockUsers.referrer.id);
      expect(relationship.referredId).toBe(mockUsers.referred.id);
      expect(relationship.defaultShareRate).toBe(1.0);
      expect(relationship.status).toBe('PENDING_AGREEMENT');
    });

    test('should create revenue share', async () => {
      // First create umbrella relationship
      const relationship = await prisma.umbrellaRelationship.create({
        data: {
          referrerId: mockUsers.referrer.id,
          referredId: mockUsers.referred.id,
          relationshipType: 'PRIVATE_UMBRELLA',
          status: 'ACTIVE',
          defaultShareRate: 1.0
        }
      });

      const revenueShare = await prisma.revenueShare.create({
        data: {
          umbrellaId: relationship.id,
          projectId: mockProject.id,
          referrerId: mockUsers.referrer.id,
          referredId: mockUsers.referred.id,
          projectRevenue: 10000,
          sharePercentage: 1.0,
          shareAmount: 100,
          status: 'CALCULATED'
        }
      });

      expect(revenueShare).toBeDefined();
      expect(revenueShare.shareAmount).toBe(100);
      expect(revenueShare.sharePercentage).toBe(1.0);
      expect(revenueShare.status).toBe('CALCULATED');
    });

    test('should create umbrella document', async () => {
      // First create umbrella relationship
      const relationship = await prisma.umbrellaRelationship.create({
        data: {
          referrerId: mockUsers.referrer.id,
          referredId: mockUsers.referred.id,
          relationshipType: 'PRIVATE_UMBRELLA',
          status: 'PENDING_AGREEMENT',
          defaultShareRate: 1.0
        }
      });

      const document = await prisma.umbrellaDocument.create({
        data: {
          umbrellaId: relationship.id,
          documentType: 'UMBRELLA_AGREEMENT',
          title: 'Test Umbrella Agreement',
          content: 'Test agreement content',
          status: 'DRAFT',
          requiresSignature: true
        }
      });

      expect(document).toBeDefined();
      expect(document.documentType).toBe('UMBRELLA_AGREEMENT');
      expect(document.status).toBe('DRAFT');
    });
  });

  describe('Umbrella Service Tests', () => {
    let umbrellaService;

    beforeAll(() => {
      umbrellaService = require('../services/umbrella-service');
    });

    test('should create umbrella relationship', async () => {
      const relationship = await umbrellaService.createUmbrellaRelationship(
        mockUsers.referrer.id,
        mockUsers.referred.id,
        1.0
      );

      expect(relationship).toBeDefined();
      expect(relationship.referrerId).toBe(mockUsers.referrer.id);
      expect(relationship.referredId).toBe(mockUsers.referred.id);
      expect(relationship.defaultShareRate).toBe(1.0);
    });

    test('should get umbrella relationships', async () => {
      // Create test relationship
      await umbrellaService.createUmbrellaRelationship(
        mockUsers.referrer.id,
        mockUsers.referred.id,
        1.0
      );

      const relationships = await umbrellaService.getUmbrellaRelationships(
        mockUsers.referrer.id,
        'referrer'
      );

      expect(relationships).toBeDefined();
      expect(relationships.length).toBeGreaterThan(0);
    });

    test('should calculate revenue shares', async () => {
      // Create test relationship
      const relationship = await umbrellaService.createUmbrellaRelationship(
        mockUsers.referrer.id,
        mockUsers.referred.id,
        1.0
      );

      // Activate relationship
      await umbrellaService.updateUmbrellaRelationship(relationship.id, {
        status: 'ACTIVE'
      });

      const shares = await umbrellaService.calculateRevenueShares(
        mockProject.id,
        10000
      );

      expect(shares).toBeDefined();
      expect(shares.length).toBeGreaterThan(0);
      expect(shares[0].shareAmount).toBe(100); // 1% of 10000
    });

    test('should validate umbrella data', () => {
      const validData = {
        referrerId: mockUsers.referrer.id,
        referredId: mockUsers.referred.id,
        shareRate: 1.0
      };

      const errors = umbrellaService.validateUmbrellaData(validData);
      expect(errors.length).toBe(0);

      const invalidData = {
        referrerId: mockUsers.referrer.id,
        referredId: mockUsers.referrer.id, // Same as referrer
        shareRate: 2.0 // Too high
      };

      const invalidErrors = umbrellaService.validateUmbrellaData(invalidData);
      expect(invalidErrors.length).toBeGreaterThan(0);
    });
  });

  describe('State Machine Tests', () => {
    test('should create state machine', async () => {
      // Create test relationship
      const relationship = await prisma.umbrellaRelationship.create({
        data: {
          referrerId: mockUsers.referrer.id,
          referredId: mockUsers.referred.id,
          relationshipType: 'PRIVATE_UMBRELLA',
          status: 'PENDING_AGREEMENT',
          defaultShareRate: 1.0
        }
      });

      const stateMachine = await umbrellaStateMachine.createStateMachine(
        relationship.id,
        'PENDING_AGREEMENT'
      );

      expect(stateMachine).toBeDefined();
      expect(stateMachine.currentState).toBe('PENDING_AGREEMENT');
      expect(stateMachine.context.relationshipId).toBe(relationship.id);
    });

    test('should transition states', async () => {
      // Create test relationship
      const relationship = await prisma.umbrellaRelationship.create({
        data: {
          referrerId: mockUsers.referrer.id,
          referredId: mockUsers.referred.id,
          relationshipType: 'PRIVATE_UMBRELLA',
          status: 'PENDING_AGREEMENT',
          defaultShareRate: 1.0
        }
      });

      // Create state machine
      await umbrellaStateMachine.createStateMachine(relationship.id);

      // Transition to ACTIVE
      const updatedStateMachine = await umbrellaStateMachine.transitionTo(
        relationship.id,
        'ACTIVE',
        'activate'
      );

      expect(updatedStateMachine.currentState).toBe('ACTIVE');
      expect(updatedStateMachine.previousState).toBe('PENDING_AGREEMENT');
    });

    test('should validate state transitions', async () => {
      // Create test relationship
      const relationship = await prisma.umbrellaRelationship.create({
        data: {
          referrerId: mockUsers.referrer.id,
          referredId: mockUsers.referred.id,
          relationshipType: 'PRIVATE_UMBRELLA',
          status: 'PENDING_AGREEMENT',
          defaultShareRate: 1.0
        }
      });

      // Create state machine
      await umbrellaStateMachine.createStateMachine(relationship.id);

      // Try invalid transition
      await expect(
        umbrellaStateMachine.transitionTo(
          relationship.id,
          'TERMINATED', // Invalid transition from PENDING_AGREEMENT
          'terminate'
        )
      ).rejects.toThrow('Invalid transition');
    });

    test('should get available states', () => {
      const states = umbrellaStateMachine.getStates();
      
      expect(states).toBeDefined();
      expect(states.PENDING_AGREEMENT).toBeDefined();
      expect(states.ACTIVE).toBeDefined();
      expect(states.SUSPENDED).toBeDefined();
      expect(states.TERMINATED).toBeDefined();
      expect(states.EXPIRED).toBeDefined();
    });
  });

  describe('API Endpoint Tests', () => {
    // Note: These tests require the Express app to be properly initialized
    // You'll need to set up your test environment with proper authentication

    test('should get umbrella relationships', async () => {
      // This test would require proper authentication setup
      // const response = await request(app)
      //   .get('/api/umbrella/relationships')
      //   .set('Authorization', 'Bearer test-token')
      //   .expect(200);

      // expect(response.body.success).toBe(true);
      // expect(response.body.data).toBeDefined();
    });

    test('should create umbrella relationship', async () => {
      // This test would require proper authentication setup
      // const response = await request(app)
      //   .post('/api/umbrella/relationships')
      //   .set('Authorization', 'Bearer test-token')
      //   .send({
      //     referredId: mockUsers.referred.id,
      //     shareRate: 1.0
      //   })
      //   .expect(201);

      // expect(response.body.success).toBe(true);
      // expect(response.body.data).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should complete full umbrella workflow', async () => {
      // 1. Create umbrella relationship
      const relationship = await umbrellaService.createUmbrellaRelationship(
        mockUsers.referrer.id,
        mockUsers.referred.id,
        1.0
      );

      expect(relationship.status).toBe('PENDING_AGREEMENT');

      // 2. Create state machine
      const stateMachine = await umbrellaStateMachine.createStateMachine(
        relationship.id
      );

      expect(stateMachine.currentState).toBe('PENDING_AGREEMENT');

      // 3. Generate agreement
      const document = await umbrellaStateMachine.generateUmbrellaAgreement(
        relationship.id
      );

      expect(document).toBeDefined();
      expect(document.documentType).toBe('UMBRELLA_AGREEMENT');

      // 4. Activate relationship
      await umbrellaStateMachine.transitionTo(
        relationship.id,
        'ACTIVE',
        'activate'
      );

      // 5. Calculate revenue shares
      const shares = await umbrellaStateMachine.calculateRevenueShares(
        relationship.id,
        { projectId: mockProject.id, revenue: 10000 }
      );

      expect(shares).toBeDefined();
      expect(shares.shareAmount).toBe(100);

      // 6. Verify final state
      const finalStateMachine = umbrellaStateMachine.getStateMachine(relationship.id);
      expect(finalStateMachine.currentState).toBe('ACTIVE');
    });

    test('should handle error scenarios', async () => {
      // Test invalid user IDs
      await expect(
        umbrellaService.createUmbrellaRelationship(
          'invalid-user-id',
          mockUsers.referred.id,
          1.0
        )
      ).rejects.toThrow('Invalid user IDs');

      // Test duplicate relationship
      await umbrellaService.createUmbrellaRelationship(
        mockUsers.referrer.id,
        mockUsers.referred.id,
        1.0
      );

      await expect(
        umbrellaService.createUmbrellaRelationship(
          mockUsers.referrer.id,
          mockUsers.referred.id,
          1.0
        )
      ).rejects.toThrow('Umbrella relationship already exists');
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple concurrent relationships', async () => {
      const promises = [];
      const numRelationships = 10;

      for (let i = 0; i < numRelationships; i++) {
        promises.push(
          umbrellaService.createUmbrellaRelationship(
            `referrer-${i}`,
            `referred-${i}`,
            1.0
          )
        );
      }

      const relationships = await Promise.all(promises);
      expect(relationships.length).toBe(numRelationships);
    });

    test('should handle bulk revenue calculations', async () => {
      // Create multiple relationships
      const relationships = [];
      for (let i = 0; i < 5; i++) {
        const rel = await umbrellaService.createUmbrellaRelationship(
          `referrer-${i}`,
          `referred-${i}`,
          1.0
        );
        await umbrellaService.updateUmbrellaRelationship(rel.id, {
          status: 'ACTIVE'
        });
        relationships.push(rel);
      }

      // Calculate revenue for all
      const promises = relationships.map(rel =>
        umbrellaService.calculateRevenueShares(`project-${rel.id}`, 10000)
      );

      const results = await Promise.all(promises);
      expect(results.length).toBe(5);
    });
  });
});

// Test utilities
const testUtils = {
  createMockUser: (id, name, email) => ({
    id,
    name,
    email,
    level: 'OWLET'
  }),

  createMockProject: (id, name, ownerId) => ({
    id,
    name,
    ownerId,
    totalValue: 10000
  }),

  cleanupTestData: async (prisma) => {
    await prisma.revenueShare.deleteMany();
    await prisma.umbrellaDocumentSignature.deleteMany();
    await prisma.umbrellaDocument.deleteMany();
    await prisma.umbrellaRelationship.deleteMany();
    await prisma.umbrellaAnalytics.deleteMany();
  }
};

module.exports = {
  testUtils,
  mockUsers,
  mockProject
};
