/**
 * Database Data Integrity Tests
 * Comprehensive testing of database constraints, relationships, and data consistency
 * Based on the 92 database models and their relationships
 */

const { PrismaClient } = require('@prisma/client');

describe('Database Data Integrity Tests', () => {
  let prisma;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
  });

  async function cleanupTestData() {
    // Clean up in reverse order of dependencies
    await prisma.documentSignature.deleteMany({
      where: { user_id: { startsWith: 'test-' } }
    });
    await prisma.userDocumentStatus.deleteMany({
      where: { user_id: { startsWith: 'test-' } }
    });
    await prisma.documentAuditLog.deleteMany({
      where: { user_id: { startsWith: 'test-' } }
    });
    await prisma.ventureLaunchTimeline.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.ventureMilestone.deleteMany({
      where: { timelineId: { startsWith: 'test-' } }
    });
    await prisma.ventureDailyCheckin.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.ventureSprint.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.ventureSprintTask.deleteMany({
      where: { sprintId: { startsWith: 'test-' } }
    });
    await prisma.ventureRisk.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.ventureAnalytics.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.ventureNotification.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.ventureSlackIntegration.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.slackMessage.deleteMany({
      where: { ventureId: { startsWith: 'test-' } }
    });
    await prisma.slackReaction.deleteMany({
      where: { messageId: { startsWith: 'test-' } }
    });
    await prisma.venture.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.company.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.team.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
    await prisma.user.deleteMany({
      where: { id: { startsWith: 'test-' } }
    });
  }

  describe('User Model Integrity', () => {
    test('should enforce unique email constraint', async () => {
      const userData = {
        id: 'test-user-1',
        email: 'unique@test.com',
        name: 'Test User 1',
        role: 'MEMBER'
      };

      // First creation should succeed
      await prisma.user.create({ data: userData });

      // Second creation with same email should fail
      await expect(prisma.user.create({
        data: {
          id: 'test-user-2',
          email: 'unique@test.com',
          name: 'Test User 2',
          role: 'MEMBER'
        }
      })).rejects.toThrow();

      // Clean up
      await prisma.user.delete({ where: { id: userData.id } });
    });

    test('should enforce unique username constraint when provided', async () => {
      const userData = {
        id: 'test-user-3',
        email: 'user3@test.com',
        username: 'unique-username',
        name: 'Test User 3',
        role: 'MEMBER'
      };

      // First creation should succeed
      await prisma.user.create({ data: userData });

      // Second creation with same username should fail
      await expect(prisma.user.create({
        data: {
          id: 'test-user-4',
          email: 'user4@test.com',
          username: 'unique-username',
          name: 'Test User 4',
          role: 'MEMBER'
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

    test('should maintain referential integrity on user deletion', async () => {
      // Create user with related data
      const user = await prisma.user.create({
        data: {
          id: 'test-user-integrity',
          email: 'integrity@test.com',
          name: 'Integrity Test User',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-venture-integrity',
          name: 'Integrity Test Venture',
          purpose: 'Testing integrity',
          ownerUserId: user.id,
          status: 'ACTIVE'
        }
      });

      // Attempt to delete user (should fail due to foreign key constraint)
      await expect(prisma.user.delete({
        where: { id: user.id }
      })).rejects.toThrow();

      // Clean up properly
      await prisma.venture.delete({ where: { id: venture.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('Venture Model Integrity', () => {
    test('should enforce unique venture name constraint', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-venture-owner',
          email: 'venture-owner@test.com',
          name: 'Venture Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const ventureData = {
        id: 'test-venture-unique',
        name: 'Unique Venture Name',
        purpose: 'Testing unique constraint',
        ownerUserId: owner.id,
        status: 'ACTIVE'
      };

      // First creation should succeed
      await prisma.venture.create({ data: ventureData });

      // Second creation with same name should fail
      await expect(prisma.venture.create({
        data: {
          id: 'test-venture-duplicate',
          name: 'Unique Venture Name',
          purpose: 'Testing duplicate',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      })).rejects.toThrow();

      // Clean up
      await prisma.venture.delete({ where: { id: ventureData.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    });

    test('should maintain referential integrity with owner', async () => {
      // Attempt to create venture with non-existent owner
      await expect(prisma.venture.create({
        data: {
          id: 'test-venture-invalid-owner',
          name: 'Invalid Owner Venture',
          purpose: 'Testing invalid owner',
          ownerUserId: 'non-existent-user',
          status: 'ACTIVE'
        }
      })).rejects.toThrow();
    });

    test('should cascade delete related data', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-cascade-owner',
          email: 'cascade-owner@test.com',
          name: 'Cascade Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-cascade-venture',
          name: 'Cascade Test Venture',
          purpose: 'Testing cascade delete',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      });

      const timeline = await prisma.ventureLaunchTimeline.create({
        data: {
          ventureId: venture.id,
          totalDays: 30,
          startDate: new Date(),
          targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      // Delete venture should cascade to timeline
      await prisma.venture.delete({ where: { id: venture.id } });

      // Timeline should be deleted
      const deletedTimeline = await prisma.ventureLaunchTimeline.findUnique({
        where: { id: timeline.id }
      });
      expect(deletedTimeline).toBeNull();

      // Clean up
      await prisma.user.delete({ where: { id: owner.id } });
    });
  });

  describe('Venture Management System Integrity', () => {
    test('should maintain timeline-milestone relationship integrity', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-timeline-owner',
          email: 'timeline-owner@test.com',
          name: 'Timeline Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-timeline-venture',
          name: 'Timeline Test Venture',
          purpose: 'Testing timeline integrity',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      });

      const timeline = await prisma.ventureLaunchTimeline.create({
        data: {
          ventureId: venture.id,
          totalDays: 30,
          startDate: new Date(),
          targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      const milestone = await prisma.ventureMilestone.create({
        data: {
          timelineId: timeline.id,
          phase: 'FOUNDATION',
          title: 'Test Milestone',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 3
        }
      });

      // Attempt to delete timeline should cascade to milestone
      await prisma.ventureLaunchTimeline.delete({ where: { id: timeline.id } });

      const deletedMilestone = await prisma.ventureMilestone.findUnique({
        where: { id: milestone.id }
      });
      expect(deletedMilestone).toBeNull();

      // Clean up
      await prisma.venture.delete({ where: { id: venture.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    });

    test('should maintain sprint-task relationship integrity', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-sprint-owner',
          email: 'sprint-owner@test.com',
          name: 'Sprint Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-sprint-venture',
          name: 'Sprint Test Venture',
          purpose: 'Testing sprint integrity',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      });

      const sprint = await prisma.ventureSprint.create({
        data: {
          ventureId: venture.id,
          name: 'Test Sprint',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          capacityHours: 40
        }
      });

      const task = await prisma.ventureSprintTask.create({
        data: {
          sprintId: sprint.id,
          title: 'Test Task',
          taskType: 'FEATURE',
          priority: 3,
          storyPoints: 5
        }
      });

      // Attempt to delete sprint should cascade to task
      await prisma.ventureSprint.delete({ where: { id: sprint.id } });

      const deletedTask = await prisma.ventureSprintTask.findUnique({
        where: { id: task.id }
      });
      expect(deletedTask).toBeNull();

      // Clean up
      await prisma.venture.delete({ where: { id: venture.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    });

    test('should prevent duplicate timeline creation', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-duplicate-timeline-owner',
          email: 'duplicate-timeline@test.com',
          name: 'Duplicate Timeline Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-duplicate-timeline-venture',
          name: 'Duplicate Timeline Venture',
          purpose: 'Testing duplicate timeline',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      });

      const timelineData = {
        ventureId: venture.id,
        totalDays: 30,
        startDate: new Date(),
        targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      // First creation should succeed
      await prisma.ventureLaunchTimeline.create({ data: timelineData });

      // Second creation should fail due to unique constraint
      await expect(prisma.ventureLaunchTimeline.create({ data: timelineData }))
        .rejects.toThrow();

      // Clean up
      await prisma.ventureLaunchTimeline.deleteMany({
        where: { ventureId: venture.id }
      });
      await prisma.venture.delete({ where: { id: venture.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    });
  });

  describe('Slack Integration Integrity', () => {
    test('should maintain venture-slack integration relationship', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-slack-owner',
          email: 'slack-owner@test.com',
          name: 'Slack Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-slack-venture',
          name: 'Slack Test Venture',
          purpose: 'Testing Slack integration',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      });

      const integration = await prisma.ventureSlackIntegration.create({
        data: {
          ventureId: venture.id,
          slackWorkspaceId: 'T1234567890',
          slackWorkspaceName: 'Test Workspace',
          slackChannelId: 'C1234567890',
          slackChannelName: 'test-channel'
        }
      });

      // Attempt to delete venture should cascade to integration
      await prisma.venture.delete({ where: { id: venture.id } });

      const deletedIntegration = await prisma.ventureSlackIntegration.findUnique({
        where: { id: integration.id }
      });
      expect(deletedIntegration).toBeNull();

      // Clean up
      await prisma.user.delete({ where: { id: owner.id } });
    });

    test('should maintain message-reaction relationship integrity', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-message-owner',
          email: 'message-owner@test.com',
          name: 'Message Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-message-venture',
          name: 'Message Test Venture',
          purpose: 'Testing message integrity',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      });

      const message = await prisma.slackMessage.create({
        data: {
          ventureId: venture.id,
          slackMessageId: '1234567890.123456',
          slackChannelId: 'C1234567890',
          slackUserId: 'U1234567890',
          slackUserName: 'test-user',
          content: 'Test message',
          messageType: 'TEXT'
        }
      });

      const reaction = await prisma.slackReaction.create({
        data: {
          messageId: message.id,
          emoji: '👍',
          slackUserId: 'U1234567890',
          slackUserName: 'test-user'
        }
      });

      // Attempt to delete message should cascade to reaction
      await prisma.slackMessage.delete({ where: { id: message.id } });

      const deletedReaction = await prisma.slackReaction.findUnique({
        where: { id: reaction.id }
      });
      expect(deletedReaction).toBeNull();

      // Clean up
      await prisma.venture.delete({ where: { id: venture.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    });
  });

  describe('Data Validation Tests', () => {
    test('should validate enum values', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-enum-owner',
          email: 'enum-owner@test.com',
          name: 'Enum Owner',
          role: 'VENTURE_OWNER'
        }
      });

      // Valid enum values should work
      const venture = await prisma.venture.create({
        data: {
          id: 'test-enum-venture',
          name: 'Enum Test Venture',
          purpose: 'Testing enum validation',
          ownerUserId: owner.id,
          status: 'ACTIVE' // Valid status
        }
      });

      // Invalid enum values should fail
      await expect(prisma.venture.create({
        data: {
          id: 'test-invalid-enum-venture',
          name: 'Invalid Enum Venture',
          purpose: 'Testing invalid enum',
          ownerUserId: owner.id,
          status: 'INVALID_STATUS' // Invalid status
        }
      })).rejects.toThrow();

      // Clean up
      await prisma.venture.delete({ where: { id: venture.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    });

    test('should validate required fields in nested models', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-nested-owner',
          email: 'nested-owner@test.com',
          name: 'Nested Owner',
          role: 'VENTURE_OWNER'
        }
      });

      const venture = await prisma.venture.create({
        data: {
          id: 'test-nested-venture',
          name: 'Nested Test Venture',
          purpose: 'Testing nested validation',
          ownerUserId: owner.id,
          status: 'ACTIVE'
        }
      });

      // Valid nested data should work
      const timeline = await prisma.ventureLaunchTimeline.create({
        data: {
          ventureId: venture.id,
          totalDays: 30,
          startDate: new Date(),
          targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      // Invalid nested data should fail
      await expect(prisma.ventureMilestone.create({
        data: {
          timelineId: timeline.id,
          // Missing required fields: phase, title, targetDate
          priority: 3
        }
      })).rejects.toThrow();

      // Clean up
      await prisma.ventureLaunchTimeline.delete({ where: { id: timeline.id } });
      await prisma.venture.delete({ where: { id: venture.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    });
  });

  describe('Performance and Index Tests', () => {
    test('should efficiently query by indexed fields', async () => {
      const owner = await prisma.user.create({
        data: {
          id: 'test-index-owner',
          email: 'index-owner@test.com',
          name: 'Index Owner',
          role: 'VENTURE_OWNER'
        }
      });

      // Create multiple ventures to test indexing
      const ventures = [];
      for (let i = 0; i < 10; i++) {
        const venture = await prisma.venture.create({
          data: {
            id: `test-index-venture-${i}`,
            name: `Index Venture ${i}`,
            purpose: `Testing index performance ${i}`,
            ownerUserId: owner.id,
            status: 'ACTIVE'
          }
        });
        ventures.push(venture);
      }

      // Query by indexed field should be fast
      const startTime = Date.now();
      const foundVentures = await prisma.venture.findMany({
        where: { ownerUserId: owner.id }
      });
      const queryTime = Date.now() - startTime;

      expect(foundVentures).toHaveLength(10);
      expect(queryTime).toBeLessThan(100); // Should be very fast with proper indexing

      // Clean up
      await prisma.venture.deleteMany({
        where: { id: { startsWith: 'test-index-venture-' } }
      });
      await prisma.user.delete({ where: { id: owner.id } });
    });
  });
});
