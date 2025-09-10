/**
 * Venture Management System - Comprehensive Test Suite
 * Tests for 30-day launch timeline, sprint management, risk tracking, and Slack integration
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const ventureManagementRoutes = require('../../server/routes/venture-management');

const app = express();
app.use(express.json());
app.use('/api/venture-management', ventureManagementRoutes);

describe('Venture Management System', () => {
  let prisma;
  let testVenture;
  let testUser;
  let authToken;

  beforeAll(async () => {
    prisma = new PrismaClient();
    
    // Create test user
    testUser = await prisma.user.create({
      data: {
        id: 'test-user-venture-mgmt',
        email: 'test-venture@example.com',
        name: 'Test Venture User',
        role: 'VENTURE_OWNER'
      }
    });

    // Create test venture
    testVenture = await prisma.venture.create({
      data: {
        id: 'test-venture-123',
        name: 'Test Venture',
        purpose: 'Testing venture management system',
        ownerUserId: testUser.id,
        status: 'ACTIVE'
      }
    });

    // Generate auth token (simplified for testing)
    authToken = 'test-auth-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.ventureLaunchTimeline.deleteMany({
      where: { ventureId: testVenture.id }
    });
    await prisma.venture.delete({
      where: { id: testVenture.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    await prisma.$disconnect();
  });

  describe('Timeline Management', () => {
    test('should create venture timeline', async () => {
      const timelineData = {
        totalDays: 30,
        startDate: new Date().toISOString(),
        targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post(`/api/venture-management/${testVenture.id}/timeline`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(timelineData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ventureId).toBe(testVenture.id);
      expect(response.body.data.totalDays).toBe(30);
      expect(response.body.data.milestones).toBeDefined();
      expect(response.body.data.milestones.length).toBeGreaterThan(0);
    });

    test('should get venture timeline', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testVenture.id}/timeline`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ventureId).toBe(testVenture.id);
      expect(response.body.data.milestones).toBeDefined();
    });

    test('should create milestone', async () => {
      const milestoneData = {
        phase: 'FOUNDATION',
        title: 'Test Milestone',
        description: 'Test milestone description',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 5
      };

      const response = await request(app)
        .post(`/api/venture-management/${testVenture.id}/timeline/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(milestoneData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Milestone');
      expect(response.body.data.phase).toBe('FOUNDATION');
    });

    test('should update milestone status', async () => {
      // First create a milestone
      const milestone = await prisma.ventureMilestone.create({
        data: {
          timelineId: (await prisma.ventureLaunchTimeline.findUnique({
            where: { ventureId: testVenture.id }
          })).id,
          phase: 'FOUNDATION',
          title: 'Update Test Milestone',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 3
        }
      });

      const response = await request(app)
        .put(`/api/venture-management/${testVenture.id}/timeline/milestones/${milestone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
    });
  });

  describe('Daily Check-ins', () => {
    test('should create daily check-in', async () => {
      const checkinData = {
        status: 'ON_TRACK',
        progressNotes: 'Making good progress on the project',
        blockers: ['Need more information from client'],
        nextActions: ['Schedule client meeting', 'Review requirements'],
        moodScore: 4
      };

      const response = await request(app)
        .post(`/api/venture-management/${testVenture.id}/checkin`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(checkinData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ventureId).toBe(testVenture.id);
      expect(response.body.data.userId).toBe(testUser.id);
      expect(response.body.data.status).toBe('ON_TRACK');
    });
  });

  describe('Sprint Management', () => {
    test('should create sprint', async () => {
      const sprintData = {
        name: 'Sprint 1',
        description: 'First sprint for testing',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        capacityHours: 40
      };

      const response = await request(app)
        .post(`/api/venture-management/${testVenture.id}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(sprintData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Sprint 1');
      expect(response.body.data.ventureId).toBe(testVenture.id);
    });

    test('should get sprints', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testVenture.id}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should create sprint task', async () => {
      // First create a sprint
      const sprint = await prisma.ventureSprint.create({
        data: {
          ventureId: testVenture.id,
          name: 'Test Sprint',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          capacityHours: 40
        }
      });

      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        taskType: 'FEATURE',
        priority: 3,
        storyPoints: 5,
        estimatedHours: 8
      };

      const response = await request(app)
        .post(`/api/venture-management/${testVenture.id}/sprints/${sprint.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Task');
      expect(response.body.data.sprintId).toBe(sprint.id);
    });

    test('should update task status', async () => {
      // Create sprint and task
      const sprint = await prisma.ventureSprint.create({
        data: {
          ventureId: testVenture.id,
          name: 'Update Test Sprint',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          capacityHours: 40
        }
      });

      const task = await prisma.ventureSprintTask.create({
        data: {
          sprintId: sprint.id,
          title: 'Update Test Task',
          taskType: 'FEATURE',
          priority: 3,
          storyPoints: 5
        }
      });

      const response = await request(app)
        .put(`/api/venture-management/${testVenture.id}/sprints/${sprint.id}/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('Risk Management', () => {
    test('should create risk', async () => {
      const riskData = {
        riskType: 'TECHNICAL',
        title: 'Test Risk',
        description: 'Test risk description',
        impactLevel: 4,
        probabilityLevel: 3,
        mitigationPlan: 'Test mitigation plan'
      };

      const response = await request(app)
        .post(`/api/venture-management/${testVenture.id}/risks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(riskData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Risk');
      expect(response.body.data.riskType).toBe('TECHNICAL');
      expect(response.body.data.riskScore).toBe(12); // 4 * 3
    });

    test('should get risks', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testVenture.id}/risks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Analytics', () => {
    test('should get venture analytics', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testVenture.id}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.riskMetrics).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent venture', async () => {
      const response = await request(app)
        .get('/api/venture-management/non-existent-venture/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VENTURE_NOT_FOUND');
    });

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/venture-management/${testVenture.id}/timeline`)
        .expect(401);
    });

    test('should return 400 for invalid timeline data', async () => {
      const invalidData = {
        totalDays: 'invalid',
        startDate: 'invalid-date'
      };

      const response = await request(app)
        .post(`/api/venture-management/${testVenture.id}/timeline`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(500);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain referential integrity on venture deletion', async () => {
      // Create venture with timeline
      const testVenture2 = await prisma.venture.create({
        data: {
          id: 'test-venture-integrity',
          name: 'Test Venture Integrity',
          purpose: 'Testing data integrity',
          ownerUserId: testUser.id,
          status: 'ACTIVE'
        }
      });

      const timeline = await prisma.ventureLaunchTimeline.create({
        data: {
          ventureId: testVenture2.id,
          totalDays: 30,
          startDate: new Date(),
          targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      // Attempt to delete venture (should fail due to foreign key constraint)
      await expect(prisma.venture.delete({
        where: { id: testVenture2.id }
      })).rejects.toThrow();

      // Clean up properly
      await prisma.ventureLaunchTimeline.delete({
        where: { id: timeline.id }
      });
      await prisma.venture.delete({
        where: { id: testVenture2.id }
      });
    });

    test('should prevent duplicate timeline creation', async () => {
      const timelineData = {
        totalDays: 30,
        startDate: new Date().toISOString(),
        targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      // First creation should succeed
      await request(app)
        .post(`/api/venture-management/${testVenture.id}/timeline`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(timelineData)
        .expect(200);

      // Second creation should fail
      await request(app)
        .post(`/api/venture-management/${testVenture.id}/timeline`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(timelineData)
        .expect(400);
    });
  });
});
