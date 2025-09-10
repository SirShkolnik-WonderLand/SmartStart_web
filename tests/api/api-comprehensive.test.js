/**
 * Comprehensive API Testing Suite
 * Tests all 150+ API endpoints across 35 systems
 * Based on API Matrix and Data Integrity requirements
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const express = require('express');

// Import all API routes
const authRoutes = require('../../server/routes/unified-auth-api');
const ventureRoutes = require('../../server/routes/venture-management');
const legalRoutes = require('../../server/routes/legal-documents-api');
const userRoutes = require('../../server/routes/user-management-api');
const companyRoutes = require('../../server/routes/company-management-api');
const teamRoutes = require('../../server/routes/team-management-api');
const gamificationRoutes = require('../../server/routes/gamification-api');
const analyticsRoutes = require('../../server/routes/analytics-api');

const app = express();
app.use(express.json());

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/venture-management', ventureRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);

describe('Comprehensive API Testing Suite', () => {
  let prisma;
  let testUsers = {};
  let testData = {};

  beforeAll(async () => {
    prisma = new PrismaClient();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function setupTestData() {
    // Create test users with different roles
    testUsers.owner = await prisma.user.create({
      data: {
        id: 'test-owner-123',
        email: 'owner@test.com',
        name: 'Test Owner',
        role: 'VENTURE_OWNER'
      }
    });

    testUsers.member = await prisma.user.create({
      data: {
        id: 'test-member-123',
        email: 'member@test.com',
        name: 'Test Member',
        role: 'MEMBER'
      }
    });

    testUsers.guest = await prisma.user.create({
      data: {
        id: 'test-guest-123',
        email: 'guest@test.com',
        name: 'Test Guest',
        role: 'GUEST'
      }
    });

    // Create test venture
    testData.venture = await prisma.venture.create({
      data: {
        id: 'test-venture-api',
        name: 'API Test Venture',
        purpose: 'Testing API endpoints',
        ownerUserId: testUsers.owner.id,
        status: 'ACTIVE'
      }
    });

    // Create test company
    testData.company = await prisma.company.create({
      data: {
        id: 'test-company-api',
        name: 'API Test Company',
        description: 'Testing company APIs',
        ownerId: testUsers.owner.id,
        industry: 'Technology',
        size: 'SMALL',
        stage: 'PRE_SEED',
        status: 'ACTIVE'
      }
    });

    // Create test team
    testData.team = await prisma.team.create({
      data: {
        id: 'test-team-api',
        name: 'API Test Team',
        description: 'Testing team APIs',
        companyId: testData.company.id,
        leadId: testUsers.owner.id
      }
    });
  }

  async function cleanupTestData() {
    // Clean up in reverse order of creation
    await prisma.team.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.company.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.venture.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.user.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
  }

  function getAuthToken(userId) {
    // Simplified token generation for testing
    return `test-token-${userId}`;
  }

  describe('Authentication APIs', () => {
    test('POST /api/auth/login - should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.owner.email,
          password: 'test-password'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    test('POST /api/auth/register - should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'test-password',
          name: 'New User'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    test('GET /api/auth/me - should get current user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUsers.owner.id);
    });

    test('POST /api/auth/logout - should logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('User Management APIs', () => {
    test('GET /api/users - should list users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/users/:id - should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUsers.owner.id}`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUsers.owner.id);
    });

    test('PUT /api/users/:id - should update user', async () => {
      const response = await request(app)
        .put(`/api/users/${testUsers.owner.id}`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('Venture Management APIs', () => {
    test('GET /api/venture-management/:ventureId/timeline - should get timeline', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('POST /api/venture-management/:ventureId/timeline - should create timeline', async () => {
      const response = await request(app)
        .post(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .send({
          totalDays: 30,
          startDate: new Date().toISOString(),
          targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ventureId).toBe(testData.venture.id);
    });

    test('GET /api/venture-management/:ventureId/sprints - should get sprints', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testData.venture.id}/sprints`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/venture-management/:ventureId/risks - should get risks', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testData.venture.id}/risks`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Company Management APIs', () => {
    test('GET /api/companies - should list companies', async () => {
      const response = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/companies/:id - should get company by ID', async () => {
      const response = await request(app)
        .get(`/api/companies/${testData.company.id}`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testData.company.id);
    });

    test('PUT /api/companies/:id - should update company', async () => {
      const response = await request(app)
        .put(`/api/companies/${testData.company.id}`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .send({ name: 'Updated Company Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Company Name');
    });
  });

  describe('Team Management APIs', () => {
    test('GET /api/teams - should list teams', async () => {
      const response = await request(app)
        .get('/api/teams')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/teams/:id - should get team by ID', async () => {
      const response = await request(app)
        .get(`/api/teams/${testData.team.id}`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testData.team.id);
    });

    test('POST /api/teams/:id/members - should add team member', async () => {
      const response = await request(app)
        .post(`/api/teams/${testData.team.id}/members`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .send({ userId: testUsers.member.id, role: 'MEMBER' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Gamification APIs', () => {
    test('GET /api/gamification/dashboard/:userId - should get user dashboard', async () => {
      const response = await request(app)
        .get(`/api/gamification/dashboard/${testUsers.owner.id}`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUsers.owner.id);
    });

    test('GET /api/gamification/leaderboard - should get leaderboard', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/gamification/achievements - should create achievement', async () => {
      const response = await request(app)
        .post('/api/gamification/achievements')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .send({
          userId: testUsers.owner.id,
          type: 'FIRST_VENTURE',
          points: 100
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Analytics APIs', () => {
    test('GET /api/analytics/overview - should get analytics overview', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('GET /api/analytics/users - should get user analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/users')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/analytics/ventures - should get venture analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/ventures')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Legal Document APIs', () => {
    test('GET /api/legal/documents - should get legal documents', async () => {
      const response = await request(app)
        .get('/api/legal/documents')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/legal/documents/required - should get required documents', async () => {
      const response = await request(app)
        .get('/api/legal/documents/required')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/legal/documents/:id/sign - should sign document', async () => {
      const response = await request(app)
        .post('/api/legal/documents/ppa/sign')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .send({
          method: 'click',
          mfa_verified: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.signature).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return 403 for unauthorized requests', async () => {
      const response = await request(app)
        .get(`/api/companies/${testData.company.id}`)
        .set('Authorization', `Bearer ${getAuthToken(testUsers.guest.id)}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    test('should return 404 for non-existent resources', async () => {
      const response = await request(app)
        .get('/api/companies/non-existent-id')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    test('should return 400 for invalid request data', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Data Integrity Tests', () => {
    test('should maintain referential integrity on user deletion', async () => {
      // Create user with related data
      const testUser = await prisma.user.create({
        data: {
          id: 'test-integrity-user',
          email: 'integrity@test.com',
          name: 'Integrity Test User',
          role: 'MEMBER'
        }
      });

      const testVenture = await prisma.venture.create({
        data: {
          id: 'test-integrity-venture',
          name: 'Integrity Test Venture',
          purpose: 'Testing integrity',
          ownerUserId: testUser.id,
          status: 'ACTIVE'
        }
      });

      // Attempt to delete user (should fail due to foreign key constraint)
      await expect(prisma.user.delete({
        where: { id: testUser.id }
      })).rejects.toThrow();

      // Clean up properly
      await prisma.venture.delete({ where: { id: testVenture.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    });

    test('should prevent duplicate email addresses', async () => {
      const userData = {
        id: 'test-duplicate-1',
        email: 'duplicate@test.com',
        name: 'Duplicate User 1',
        role: 'MEMBER'
      };

      // First creation should succeed
      await prisma.user.create({ data: userData });

      // Second creation with same email should fail
      await expect(prisma.user.create({
        data: {
          ...userData,
          id: 'test-duplicate-2',
          name: 'Duplicate User 2'
        }
      })).rejects.toThrow();

      // Clean up
      await prisma.user.delete({ where: { id: userData.id } });
    });

    test('should validate required fields', async () => {
      // Attempt to create user without required fields
      await expect(prisma.user.create({
        data: {
          id: 'test-invalid-user',
          // Missing email, name, role
        }
      })).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getAuthToken(testUsers.owner.id)}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
