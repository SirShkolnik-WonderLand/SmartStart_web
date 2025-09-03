#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAllAPIs() {
  try {
    console.log('🔍 Testing all APIs with test user...');
    
    // First, verify user exists
    const user = await prisma.user.findFirst({
      where: { email: 'udi.shkolnik@smartstart.com' }
    });
    
    if (!user) {
      console.log('❌ Test user not found. Creating...');
      const hashedPassword = await bcrypt.hash('12345678', 12);
      
      await prisma.$executeRaw`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
      `;
      
      const newUser = await prisma.user.create({
        data: {
          email: 'udi.shkolnik@smartstart.com',
          name: 'Udi Shkolnik',
          level: 'SKY_MASTER',
          xp: 1000,
          reputation: 95,
          status: 'ACTIVE'
        }
      });
      
      await prisma.$executeRaw`
        UPDATE "User" SET "password" = ${hashedPassword} WHERE "id" = ${newUser.id};
      `;
      
      console.log('✅ Test user created successfully!');
    } else {
      console.log('✅ Test user found:', user.email);
    }
    
    // Test login
    console.log('\n🔐 Testing login...');
    const loginResponse = await fetch('https://smartstart-api.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'udi.shkolnik@smartstart.com',
        password: '12345678'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result:', loginData.success ? '✅ SUCCESS' : '❌ FAILED');
    if (loginData.success) {
      console.log('Token:', loginData.token ? 'Present' : 'Missing');
    } else {
      console.log('Error:', loginData.error);
    }
    
    // Test health endpoint
    console.log('\n🏥 Testing health endpoint...');
    const healthResponse = await fetch('https://smartstart-api.onrender.com/health');
    const healthData = await healthResponse.json();
    console.log('Health result:', healthResponse.ok ? '✅ SUCCESS' : '❌ FAILED');
    if (healthData.status) {
      console.log('Status:', healthData.status);
    }
    
    // Test CLI health
    console.log('\n⚡ Testing CLI health...');
    const cliHealthResponse = await fetch('https://smartstart-api.onrender.com/api/cli/health');
    const cliHealthData = await cliHealthResponse.json();
    console.log('CLI Health result:', cliHealthResponse.ok ? '✅ SUCCESS' : '❌ FAILED');
    if (cliHealthData.status) {
      console.log('Status:', cliHealthData.status);
    }
    
    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllAPIs();
