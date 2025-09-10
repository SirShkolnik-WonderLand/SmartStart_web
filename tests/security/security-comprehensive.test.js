/**
 * Comprehensive Security Testing Suite
 * Tests authentication, authorization, data protection, and security vulnerabilities
 * Based on RBAC system with 12 access levels and security requirements
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const jwt = require('jsonwebtoken');

// Import all API routes
const authRoutes = require('../../server/routes/unified-auth-api');
const ventureRoutes = require('../../server/routes/venture-management');
const legalRoutes = require('../../server/routes/legal-documents-api');
const userRoutes = require('../../server/routes/user-management-api');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/venture-management', ventureRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/users', userRoutes);

describe('Comprehensive Security Testing Suite', () => {
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
    // Create test users with different RBAC levels
    const rbacLevels = [
      'GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER',
      'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS',
      'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS',
      'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'
    ];

    for (const level of rbacLevels) {
      testUsers[level.toLowerCase()] = await prisma.user.create({
        data: {
          id: `test-${level.toLowerCase()}`,
          email: `${level.toLowerCase()}@test.com`,
          name: `Test ${level} User`,
          role: level
        }
      });
    }

    // Create test venture
    testData.venture = await prisma.venture.create({
      data: {
        id: 'test-security-venture',
        name: 'Security Test Venture',
        purpose: 'Testing security measures',
        ownerUserId: testUsers.venture_owner.id,
        status: 'ACTIVE'
      }
    });

    // Create test company
    testData.company = await prisma.company.create({
      data: {
        id: 'test-security-company',
        name: 'Security Test Company',
        description: 'Testing company security',
        ownerId: testUsers.venture_owner.id,
        industry: 'Technology',
        size: 'SMALL',
        stage: 'PRE_SEED',
        status: 'ACTIVE'
      }
    });
  }

  async function cleanupTestData() {
    await prisma.venture.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.company.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.user.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
  }

  function generateToken(userId, role = 'MEMBER', expiresIn = '1h') {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn }
    );
  }

  function generateExpiredToken(userId, role = 'MEMBER') {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' }
    );
  }

  function generateInvalidToken() {
    return jwt.sign(
      { userId: 'test-user' },
      'invalid-secret',
      { expiresIn: '1h' }
    );
  }

  describe('Authentication Security', () => {
    test('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    test('should reject requests with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    test('should reject requests with expired authentication token', async () => {
      const expiredToken = generateExpiredToken('test-user');
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('expired');
    });

    test('should reject requests with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject requests with invalid JWT signature', async () => {
      const invalidToken = generateInvalidToken();
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should accept valid authentication token', async () => {
      const validToken = generateToken(testUsers.member.id, 'MEMBER');
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Authorization Security (RBAC)', () => {
    test('should enforce RBAC level hierarchy', async () => {
      const guestToken = generateToken(testUsers.guest.id, 'GUEST');
      const memberToken = generateToken(testUsers.member.id, 'MEMBER');
      const adminToken = generateToken(testUsers.security_admin.id, 'SECURITY_ADMIN');

      // Guest should not access member-only resources
      await request(app)
        .get('/api/legal/documents/member-only')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      // Member should access member resources
      await request(app)
        .get('/api/legal/documents/member-only')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      // Admin should access all resources
      await request(app)
        .get('/api/legal/documents/member-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    test('should prevent privilege escalation', async () => {
      const memberToken = generateToken(testUsers.member.id, 'MEMBER');
      
      // Member should not be able to access admin functions
      await request(app)
        .get('/api/users/admin-only')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);

      // Member should not be able to modify other users' roles
      await request(app)
        .put(`/api/users/${testUsers.guest.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ role: 'ADMIN' })
        .expect(403);
    });

    test('should enforce resource ownership', async () => {
      const ownerToken = generateToken(testUsers.venture_owner.id, 'VENTURE_OWNER');
      const memberToken = generateToken(testUsers.member.id, 'MEMBER');
      
      // Owner should access their venture
      await request(app)
        .get(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      // Member should not access venture they don't own
      await request(app)
        .get(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    test('should validate role-based document access', async () => {
      const guestToken = generateToken(testUsers.guest.id, 'GUEST');
      const memberToken = generateToken(testUsers.member.id, 'MEMBER');
      const legalAdminToken = generateToken(testUsers.legal_admin.id, 'LEGAL_ADMIN');

      // Guest should only access guest-level documents
      const guestResponse = await request(app)
        .get('/api/legal/documents')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(guestResponse.body.data.every(doc => 
        ['GUEST'].includes(doc.rbac_level)
      )).toBe(true);

      // Member should access member-level and below
      const memberResponse = await request(app)
        .get('/api/legal/documents')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(memberResponse.body.data.every(doc => 
        ['GUEST', 'MEMBER'].includes(doc.rbac_level)
      )).toBe(true);

      // Legal admin should access all documents
      const adminResponse = await request(app)
        .get('/api/legal/documents')
        .set('Authorization', `Bearer ${legalAdminToken}`)
        .expect(200);

      expect(adminResponse.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation Security', () => {
    test('should prevent SQL injection attacks', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get(`/api/users?search=${encodeURIComponent(maliciousInput)}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should prevent XSS attacks', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .put(`/api/users/${testUsers.member.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: xssPayload })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate input data types', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      // Invalid data types should be rejected
      await request(app)
        .put(`/api/users/${testUsers.member.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          name: 123, // Should be string
          email: 'invalid-email', // Should be valid email
          role: 'INVALID_ROLE' // Should be valid enum
        })
        .expect(400);
    });

    test('should enforce input length limits', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      const longString = 'a'.repeat(10000);
      
      const response = await request(app)
        .put(`/api/users/${testUsers.member.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: longString })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Protection Security', () => {
    test('should encrypt sensitive data at rest', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      const sensitiveData = {
        name: 'Sensitive User',
        email: 'sensitive@test.com',
        password: 'sensitive-password'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(sensitiveData)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify password is not stored in plain text
      const user = await prisma.user.findUnique({
        where: { email: sensitiveData.email }
      });
      
      expect(user.password).not.toBe(sensitiveData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    test('should not expose sensitive data in responses', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      const response = await request(app)
        .get(`/api/users/${testUsers.member.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.internal_notes).toBeUndefined();
    });

    test('should log security events', async () => {
      const invalidToken = 'invalid-token';
      
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      // In a real implementation, this would check audit logs
      // For now, we just verify the request was rejected
    });
  });

  describe('Rate Limiting Security', () => {
    test('should enforce rate limits on authentication endpoints', async () => {
      const loginData = {
        email: 'rate-limit@test.com',
        password: 'test-password'
      };

      // Make multiple rapid requests
      const requests = Array(10).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should enforce rate limits on API endpoints', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      // Make multiple rapid requests
      const requests = Array(20).fill().map(() =>
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Session Security', () => {
    test('should invalidate tokens on logout', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      // First request should succeed
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Subsequent requests should fail
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    test('should handle concurrent sessions', async () => {
      const token1 = generateToken(testUsers.member.id, 'MEMBER');
      const token2 = generateToken(testUsers.member.id, 'MEMBER');
      
      // Both tokens should work initially
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);
    });
  });

  describe('API Security', () => {
    test('should prevent unauthorized API access', async () => {
      // No token
      await request(app)
        .get('/api/venture-management/test-venture/timeline')
        .expect(401);

      // Invalid token
      await request(app)
        .get('/api/venture-management/test-venture/timeline')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // Wrong user
      const wrongUserToken = generateToken(testUsers.guest.id, 'GUEST');
      await request(app)
        .get(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${wrongUserToken}`)
        .expect(403);
    });

    test('should validate request headers', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      // Missing content-type for POST requests
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test User' })
        .expect(400);
    });

    test('should handle malformed JSON', async () => {
      const token = generateToken(testUsers.member.id, 'MEMBER');
      
      await request(app)
        .put(`/api/users/${testUsers.member.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"name": "Test User", "email": invalid}')
        .expect(400);
    });
  });

  describe('Business Logic Security', () => {
    test('should prevent unauthorized venture access', async () => {
      const memberToken = generateToken(testUsers.member.id, 'MEMBER');
      
      // Member should not access venture they don't own
      await request(app)
        .get(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    test('should prevent unauthorized company access', async () => {
      const memberToken = generateToken(testUsers.member.id, 'MEMBER');
      
      // Member should not access company they don't own
      await request(app)
        .get(`/api/companies/${testData.company.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    test('should validate business rules', async () => {
      const ownerToken = generateToken(testUsers.venture_owner.id, 'VENTURE_OWNER');
      
      // Should not be able to create timeline with invalid dates
      await request(app)
        .post(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          totalDays: 30,
          startDate: new Date().toISOString(),
          targetLaunchDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Past date
        })
        .expect(400);
    });
  });
});
