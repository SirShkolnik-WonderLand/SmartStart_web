/**
 * Global Test Setup
 * Runs once before all tests
 */

module.exports = async () => {
  console.log('🚀 Setting up global test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/smartstart_test';
  process.env.BCRYPT_ROUNDS = '4'; // Lower rounds for faster testing
  
  // Mock Prisma client for tests that don't need database
  global.prisma = {
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    user: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      count: () => Promise.resolve(0)
    },
    venture: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      count: () => Promise.resolve(0)
    },
    company: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      count: () => Promise.resolve(0)
    },
    team: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      count: () => Promise.resolve(0)
    },
    legalDocument: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      count: () => Promise.resolve(0)
    }
  };
  
  console.log('✅ Global test environment ready (mocked)');
};