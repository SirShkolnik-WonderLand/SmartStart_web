#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUserSimple() {
  try {
    console.log('🔐 Creating test user with existing schema...');
    
    const hashedPassword = await bcrypt.hash('12345678', 12);
    
    // Create user with only existing fields
    const user = await prisma.user.upsert({
      where: { email: 'udi.shkolnik@smartstart.com' },
      update: {
        name: 'Udi Shkolnik',
        level: 'SKY_MASTER',
        xp: 1000,
        reputation: 95,
        status: 'ACTIVE'
      },
      create: {
        email: 'udi.shkolnik@smartstart.com',
        name: 'Udi Shkolnik',
        level: 'SKY_MASTER',
        xp: 1000,
        reputation: 95,
        status: 'ACTIVE'
      }
    });

    // Add password using raw SQL since the field doesn't exist in schema yet
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
    `;
    
    await prisma.$executeRaw`
      UPDATE "User" SET "password" = ${hashedPassword} WHERE "id" = ${user.id};
    `;
    
    console.log('✅ Test user created successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.level}`);
    console.log(`   ID: ${user.id}`);
    console.log('   Password: 12345678');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserSimple();
