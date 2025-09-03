#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUserRaw() {
  try {
    console.log('🔐 Creating test user with raw SQL...');
    
    const hashedPassword = await bcrypt.hash('12345678', 12);
    
    // First, add the missing columns if they don't exist
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "username" TEXT,
      ADD COLUMN IF NOT EXISTS "password" TEXT,
      ADD COLUMN IF NOT EXISTS "firstName" TEXT,
      ADD COLUMN IF NOT EXISTS "lastName" TEXT,
      ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'TEAM_MEMBER';
    `;
    
    // Create unique index on username if it doesn't exist
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
    `;
    
    // Insert the user
    const result = await prisma.$executeRaw`
      INSERT INTO "User" (
        "id", "email", "username", "password", "firstName", "lastName", 
        "role", "name", "level", "xp", "reputation", "status", 
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        'udi.shkolnik@smartstart.com',
        'udi.shkolnik',
        ${hashedPassword},
        'Udi',
        'Shkolnik',
        'STARTUP_FOUNDER',
        'Udi Shkolnik',
        'SKY_MASTER',
        1000,
        95,
        'ACTIVE',
        NOW(),
        NOW()
      )
      ON CONFLICT ("email") DO UPDATE SET
        "username" = EXCLUDED."username",
        "password" = EXCLUDED."password",
        "firstName" = EXCLUDED."firstName",
        "lastName" = EXCLUDED."lastName",
        "role" = EXCLUDED."role",
        "name" = EXCLUDED."name",
        "level" = EXCLUDED."level",
        "xp" = EXCLUDED."xp",
        "reputation" = EXCLUDED."reputation",
        "status" = EXCLUDED."status",
        "updatedAt" = NOW()
      RETURNING "id", "email", "username", "role";
    `;
    
    console.log('✅ Test user created/updated successfully!');
    console.log('   Email: udi.shkolnik@smartstart.com');
    console.log('   Username: udi.shkolnik');
    console.log('   Password: 12345678');
    console.log('   Role: STARTUP_FOUNDER');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserRaw();
