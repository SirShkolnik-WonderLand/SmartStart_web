const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        role: 'OWNER',
        level: 'WISE_OWL',
        status: 'ACTIVE',
        xp: 100,
        reputation: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date()
      }
    });
    
    console.log('✅ Test user created successfully:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Permissions:', user.permissions);
    
    // Create a test venture for this user
    const venture = await prisma.venture.create({
      data: {
        name: 'Test Venture',
        purpose: 'A test venture for development',
        region: 'US',
        status: 'ACTIVE',
        ownerUserId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Test venture created successfully:');
    console.log('Venture ID:', venture.id);
    console.log('Venture Name:', venture.name);
    console.log('Owner ID:', venture.ownerUserId);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
