/**
 * Basic Tests
 * Simple tests to verify Jest setup works
 */

describe('Basic Test Suite', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have test environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBe('test-jwt-secret-key-for-testing');
  });

  test('should have mocked prisma client', () => {
    expect(global.prisma).toBeDefined();
    expect(global.prisma.$connect).toBeDefined();
    expect(global.prisma.user).toBeDefined();
  });

  test('should be able to call prisma methods', async () => {
    const users = await global.prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
  });
});
