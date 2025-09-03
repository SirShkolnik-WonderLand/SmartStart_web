#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔐 Creating test user...');
    
    const hashedPassword = await bcrypt.hash('12345678', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'udi.shkolnik@smartstart.com' },
      update: {
        password: hashedPassword,
        username: 'udi.shkolnik',
        firstName: 'Udi',
        lastName: 'Shkolnik',
        role: 'STARTUP_FOUNDER'
      },
      create: {
        email: 'udi.shkolnik@smartstart.com',
        password: hashedPassword,
        username: 'udi.shkolnik',
        firstName: 'Udi',
        lastName: 'Shkolnik',
        role: 'STARTUP_FOUNDER',
        name: 'Udi Shkolnik',
        level: 'FOUNDER',
        xp: 1000,
        reputation: 95,
        status: 'ACTIVE'
      }
    });

    console.log('✅ Test user created successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
