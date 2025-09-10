/**
 * Global Test Setup
 * Runs once before all tests
 */

const { PrismaClient } = require('@prisma/client');

module.exports = async () => {
  console.log('🚀 Setting up global test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/smartstart_test';
  
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Test database connected successfully');
    
    // Run database migrations for test database
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Test database migrations applied');
    } catch (error) {
      console.log('⚠️ Test database migration failed:', error.message);
    }
    
    // Create test data if needed
    await createTestData(prisma);
    
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('✅ Global test setup completed');
};

async function createTestData(prisma) {
  try {
    // Check if test data already exists
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('ℹ️ Test data already exists, skipping creation');
      return;
    }
    
    console.log('📊 Creating test data...');
    
    // Create test users with different roles
    const testUsers = [
      {
        id: 'test-admin-user',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'LEGAL_ADMIN'
      },
      {
        id: 'test-owner-user',
        email: 'owner@test.com',
        name: 'Test Owner',
        role: 'VENTURE_OWNER'
      },
      {
        id: 'test-member-user',
        email: 'member@test.com',
        name: 'Test Member',
        role: 'MEMBER'
      },
      {
        id: 'test-guest-user',
        email: 'guest@test.com',
        name: 'Test Guest',
        role: 'GUEST'
      }
    ];
    
    for (const userData of testUsers) {
      await prisma.user.create({ data: userData });
    }
    
    // Create test venture
    const testVenture = await prisma.venture.create({
      data: {
        id: 'test-global-venture',
        name: 'Global Test Venture',
        purpose: 'Testing global setup',
        ownerUserId: 'test-owner-user',
        status: 'ACTIVE'
      }
    });
    
    // Create test company
    const testCompany = await prisma.company.create({
      data: {
        id: 'test-global-company',
        name: 'Global Test Company',
        description: 'Testing global company setup',
        ownerId: 'test-owner-user',
        industry: 'Technology',
        size: 'SMALL',
        stage: 'PRE_SEED',
        status: 'ACTIVE'
      }
    });
    
    // Create test team
    await prisma.team.create({
      data: {
        id: 'test-global-team',
        name: 'Global Test Team',
        description: 'Testing global team setup',
        companyId: testCompany.id,
        leadId: 'test-owner-user'
      }
    });
    
    // Create test legal documents
    const legalDocuments = [
      {
        id: 'ppa',
        name: 'Platform Participation Agreement',
        legal_name: 'Platform Participation Agreement',
        version: '1.0',
        category: 'core-platform',
        rbac_level: 'GUEST',
        is_required: true,
        template_path: '/docs/08-legal/01-core-platform/platform-participation-agreement.md'
      },
      {
        id: 'esca',
        name: 'Electronic Signature & Consent Agreement',
        legal_name: 'Electronic Signature & Consent Agreement',
        version: '1.0',
        category: 'core-platform',
        rbac_level: 'MEMBER',
        is_required: true,
        template_path: '/docs/08-legal/01-core-platform/electronic-signature-consent-agreement.md'
      }
    ];
    
    for (const docData of legalDocuments) {
      await prisma.legalDocument.create({ data: docData });
    }
    
    console.log('✅ Test data created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create test data:', error);
    throw error;
  }
}
