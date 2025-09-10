/**
 * Jest Test Setup
 * Global setup for all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/smartstart_test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Generate test user data
  generateTestUser: (overrides = {}) => ({
    id: `test-user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    role: 'MEMBER',
    ...overrides
  }),

  // Generate test venture data
  generateTestVenture: (ownerId, overrides = {}) => ({
    id: `test-venture-${Date.now()}`,
    name: 'Test Venture',
    purpose: 'Testing purposes',
    ownerUserId: ownerId,
    status: 'ACTIVE',
    ...overrides
  }),

  // Generate test company data
  generateTestCompany: (ownerId, overrides = {}) => ({
    id: `test-company-${Date.now()}`,
    name: 'Test Company',
    description: 'Testing company',
    ownerId: ownerId,
    industry: 'Technology',
    size: 'SMALL',
    stage: 'PRE_SEED',
    status: 'ACTIVE',
    ...overrides
  }),

  // Generate test team data
  generateTestTeam: (companyId, leadId, overrides = {}) => ({
    id: `test-team-${Date.now()}`,
    name: 'Test Team',
    description: 'Testing team',
    companyId: companyId,
    leadId: leadId,
    ...overrides
  }),

  // Generate auth token
  generateAuthToken: (userId, role = 'MEMBER') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Clean up test data
  cleanupTestData: async (prisma) => {
    const testPrefixes = ['test-', 'test_user-', 'test_venture-', 'test_company-', 'test_team-'];
    
    for (const prefix of testPrefixes) {
      // Clean up in reverse order of dependencies
      await prisma.documentSignature.deleteMany({
        where: { user_id: { startsWith: prefix } }
      });
      await prisma.userDocumentStatus.deleteMany({
        where: { user_id: { startsWith: prefix } }
      });
      await prisma.documentAuditLog.deleteMany({
        where: { user_id: { startsWith: prefix } }
      });
      await prisma.ventureLaunchTimeline.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.ventureMilestone.deleteMany({
        where: { timelineId: { startsWith: prefix } }
      });
      await prisma.ventureDailyCheckin.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.ventureSprint.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.ventureSprintTask.deleteMany({
        where: { sprintId: { startsWith: prefix } }
      });
      await prisma.ventureRisk.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.ventureAnalytics.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.ventureNotification.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.ventureSlackIntegration.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.slackMessage.deleteMany({
        where: { ventureId: { startsWith: prefix } }
      });
      await prisma.slackReaction.deleteMany({
        where: { messageId: { startsWith: prefix } }
      });
      await prisma.venture.deleteMany({
        where: { id: { startsWith: prefix } }
      });
      await prisma.company.deleteMany({
        where: { id: { startsWith: prefix } }
      });
      await prisma.team.deleteMany({
        where: { id: { startsWith: prefix } }
      });
      await prisma.user.deleteMany({
        where: { id: { startsWith: prefix } }
      });
    }
  }
};

// Mock external services
jest.mock('../../server/services/slack-integration-service', () => ({
  createVentureSlackIntegration: jest.fn().mockResolvedValue({
    success: true,
    data: { id: 'test-slack-integration' }
  }),
  sendSlackMessage: jest.fn().mockResolvedValue({
    success: true,
    data: { messageId: 'test-message-id' }
  }),
  testSlackConnection: jest.fn().mockResolvedValue({
    success: true
  })
}));

// Mock email service
jest.mock('../../server/services/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-email-id'
  })
}));

// Mock file upload service
jest.mock('../../server/services/file-upload-service', () => ({
  uploadFile: jest.fn().mockResolvedValue({
    success: true,
    fileUrl: 'https://test-bucket.s3.amazonaws.com/test-file.jpg'
  }),
  deleteFile: jest.fn().mockResolvedValue({
    success: true
  })
}));

// Mock analytics service
jest.mock('../../server/services/analytics-service', () => ({
  trackEvent: jest.fn().mockResolvedValue({
    success: true
  }),
  getAnalytics: jest.fn().mockResolvedValue({
    success: true,
    data: {
      totalUsers: 100,
      totalVentures: 50,
      totalCompanies: 25
    }
  })
}));

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in tests
});
