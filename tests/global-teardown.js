/**
 * Global Test Teardown
 * Runs once after all tests
 */

module.exports = async () => {
  console.log('🧹 Cleaning up global test environment...');
  
  // Clean up global mocks
  if (global.prisma) {
    delete global.prisma;
  }
  
  // Reset environment variables
  delete process.env.NODE_ENV;
  delete process.env.JWT_SECRET;
  delete process.env.DATABASE_URL;
  delete process.env.BCRYPT_ROUNDS;
  
  console.log('✅ Global test teardown completed');
};