/**
 * Comprehensive Performance Testing Suite
 * Tests load, stress, and performance characteristics of the SmartStart platform
 * Based on 150+ API endpoints and 92 database models
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const autocannon = require('autocannon');

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

describe('Comprehensive Performance Testing Suite', () => {
  let prisma;
  let testData = {};
  let authToken;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function setupTestData() {
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: 'test-perf-user',
        email: 'perf@test.com',
        name: 'Performance Test User',
        role: 'VENTURE_OWNER'
      }
    });

    // Create test venture
    testData.venture = await prisma.venture.create({
      data: {
        id: 'test-perf-venture',
        name: 'Performance Test Venture',
        purpose: 'Testing performance',
        ownerUserId: user.id,
        status: 'ACTIVE'
      }
    });

    // Create test company
    testData.company = await prisma.company.create({
      data: {
        id: 'test-perf-company',
        name: 'Performance Test Company',
        description: 'Testing company performance',
        ownerId: user.id,
        industry: 'Technology',
        size: 'SMALL',
        stage: 'PRE_SEED',
        status: 'ACTIVE'
      }
    });

    // Create test team
    testData.team = await prisma.team.create({
      data: {
        id: 'test-perf-team',
        name: 'Performance Test Team',
        description: 'Testing team performance',
        companyId: testData.company.id,
        leadId: user.id
      }
    });

    // Generate auth token
    authToken = 'test-perf-token';
  }

  async function cleanupTestData() {
    await prisma.team.deleteMany({
      where: { id: { startsWith: 'test-perf-' } }
    });
    await prisma.company.deleteMany({
      where: { id: { startsWith: 'test-perf-' } }
    });
    await prisma.venture.deleteMany({
      where: { id: { startsWith: 'test-perf-' } }
    });
    await prisma.user.deleteMany({
      where: { id: { startsWith: 'test-perf-' } }
    });
  }

  describe('API Response Time Tests', () => {
    test('should respond to authentication requests within 500ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'perf@test.com',
          password: 'test-password'
        });

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });

    test('should respond to user management requests within 300ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(300);
    });

    test('should respond to venture management requests within 400ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get(`/api/venture-management/${testData.venture.id}/timeline`)
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(400);
    });

    test('should respond to legal document requests within 350ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/legal/documents')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(350);
    });

    test('should respond to analytics requests within 600ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(600);
    });
  });

  describe('Concurrent Request Tests', () => {
    test('should handle 10 concurrent authentication requests', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'perf@test.com',
            password: 'test-password'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should complete
      responses.forEach(response => {
        expect([200, 401]).toContain(response.status);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000);
    });

    test('should handle 20 concurrent user requests', async () => {
      const requests = Array(20).fill().map(() =>
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should complete
      responses.forEach(response => {
        expect([200, 401, 403]).toContain(response.status);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(3000);
    });

    test('should handle 50 concurrent venture requests', async () => {
      const requests = Array(50).fill().map(() =>
        request(app)
          .get(`/api/venture-management/${testData.venture.id}/timeline`)
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should complete
      responses.forEach(response => {
        expect([200, 401, 403, 404]).toContain(response.status);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Database Performance Tests', () => {
    test('should efficiently query users with pagination', async () => {
      // Create multiple users for testing
      const users = [];
      for (let i = 0; i < 100; i++) {
        const user = await prisma.user.create({
          data: {
            id: `test-perf-user-${i}`,
            email: `perf-user-${i}@test.com`,
            name: `Performance User ${i}`,
            role: 'MEMBER'
          }
        });
        users.push(user);
      }

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/users?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      const queryTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(queryTime).toBeLessThan(200);

      // Clean up
      await prisma.user.deleteMany({
        where: { id: { startsWith: 'test-perf-user-' } }
      });
    });

    test('should efficiently query ventures with filters', async () => {
      // Create multiple ventures for testing
      const ventures = [];
      for (let i = 0; i < 50; i++) {
        const venture = await prisma.venture.create({
          data: {
            id: `test-perf-venture-${i}`,
            name: `Performance Venture ${i}`,
            purpose: `Testing venture ${i}`,
            ownerUserId: 'test-perf-user',
            status: 'ACTIVE'
          }
        });
        ventures.push(venture);
      }

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/ventures?status=ACTIVE&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      const queryTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(queryTime).toBeLessThan(300);

      // Clean up
      await prisma.venture.deleteMany({
        where: { id: { startsWith: 'test-perf-venture-' } }
      });
    });

    test('should efficiently handle complex joins', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      const queryTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(queryTime).toBeLessThan(500);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory during repeated requests', async () => {
      const initialMemory = process.memoryUsage();
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`);
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should handle large response payloads efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
      
      // Response should be reasonable size (less than 1MB)
      const responseSize = JSON.stringify(response.body).length;
      expect(responseSize).toBeLessThan(1024 * 1024);
    });
  });

  describe('Load Testing with Autocannon', () => {
    test('should handle load testing on authentication endpoint', async () => {
      const result = await autocannon({
        url: 'http://localhost:3001/api/auth/login',
        method: 'POST',
        connections: 10,
        duration: 10,
        body: JSON.stringify({
          email: 'perf@test.com',
          password: 'test-password'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result.requests.average).toBeGreaterThan(5);
      expect(result.latency.average).toBeLessThan(1000);
      expect(result.errors).toBe(0);
    });

    test('should handle load testing on user endpoint', async () => {
      const result = await autocannon({
        url: 'http://localhost:3001/api/users',
        connections: 20,
        duration: 15,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(result.requests.average).toBeGreaterThan(10);
      expect(result.latency.average).toBeLessThan(500);
      expect(result.errors).toBe(0);
    });

    test('should handle load testing on venture management endpoint', async () => {
      const result = await autocannon({
        url: `http://localhost:3001/api/venture-management/${testData.venture.id}/timeline`,
        connections: 15,
        duration: 12,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(result.requests.average).toBeGreaterThan(8);
      expect(result.latency.average).toBeLessThan(800);
      expect(result.errors).toBe(0);
    });
  });

  describe('Stress Testing', () => {
    test('should handle stress testing with high concurrency', async () => {
      const requests = Array(100).fill().map(() =>
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.allSettled(requests);
      const totalTime = Date.now() - startTime;

      // Most requests should succeed
      const successfulRequests = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      );
      
      expect(successfulRequests.length).toBeGreaterThan(80);
      expect(totalTime).toBeLessThan(10000);
    });

    test('should handle stress testing with rapid requests', async () => {
      const startTime = Date.now();
      const requests = [];
      
      // Make 200 rapid requests
      for (let i = 0; i < 200; i++) {
        requests.push(
          request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.allSettled(requests);
      const totalTime = Date.now() - startTime;

      // Most requests should succeed
      const successfulRequests = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      );
      
      expect(successfulRequests.length).toBeGreaterThan(150);
      expect(totalTime).toBeLessThan(15000);
    });
  });

  describe('Database Connection Pool Tests', () => {
    test('should handle database connection pool exhaustion', async () => {
      // Create many concurrent database operations
      const operations = Array(50).fill().map(async () => {
        return prisma.user.findMany({
          take: 10
        });
      });

      const startTime = Date.now();
      const results = await Promise.allSettled(operations);
      const totalTime = Date.now() - startTime;

      // All operations should complete
      const successfulOperations = results.filter(r => r.status === 'fulfilled');
      expect(successfulOperations.length).toBe(50);
      expect(totalTime).toBeLessThan(5000);
    });

    test('should handle database transaction performance', async () => {
      const startTime = Date.now();
      
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            id: 'test-transaction-user',
            email: 'transaction@test.com',
            name: 'Transaction User',
            role: 'MEMBER'
          }
        });
        
        await tx.venture.create({
          data: {
            id: 'test-transaction-venture',
            name: 'Transaction Venture',
            purpose: 'Testing transaction',
            ownerUserId: 'test-transaction-user',
            status: 'ACTIVE'
          }
        });
      });

      const transactionTime = Date.now() - startTime;
      expect(transactionTime).toBeLessThan(1000);

      // Clean up
      await prisma.venture.delete({ where: { id: 'test-transaction-venture' } });
      await prisma.user.delete({ where: { id: 'test-transaction-user' } });
    });
  });

  describe('API Endpoint Performance Matrix', () => {
    const endpoints = [
      { path: '/api/auth/login', method: 'POST', maxTime: 500 },
      { path: '/api/auth/register', method: 'POST', maxTime: 600 },
      { path: '/api/auth/me', method: 'GET', maxTime: 300 },
      { path: '/api/users', method: 'GET', maxTime: 400 },
      { path: '/api/companies', method: 'GET', maxTime: 450 },
      { path: '/api/teams', method: 'GET', maxTime: 400 },
      { path: '/api/legal/documents', method: 'GET', maxTime: 350 },
      { path: '/api/analytics/overview', method: 'GET', maxTime: 600 }
    ];

    endpoints.forEach(({ path, method, maxTime }) => {
      test(`should respond to ${method} ${path} within ${maxTime}ms`, async () => {
        const startTime = Date.now();
        
        let response;
        if (method === 'POST') {
          response = await request(app)
            .post(path)
            .send({ email: 'test@test.com', password: 'test' });
        } else {
          response = await request(app)
            .get(path)
            .set('Authorization', `Bearer ${authToken}`);
        }

        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(maxTime);
      });
    });
  });
});
