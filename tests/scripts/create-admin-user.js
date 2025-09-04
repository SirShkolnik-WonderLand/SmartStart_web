const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating secure admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('AdminPass123!', 12);
    console.log('✅ Password hashed successfully');
    
    // Create or update admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@smartstart.com' },
      update: {
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        status: 'ACTIVE',
        role: 'SUPER_ADMIN',
        level: 'SKY_MASTER',
        xp: 1000,
        reputation: 100,
        lastActive: new Date()
      },
      create: {
        email: 'admin@smartstart.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        status: 'ACTIVE',
        role: 'SUPER_ADMIN',
        level: 'SKY_MASTER',
        xp: 1000,
        reputation: 100,
        lastActive: new Date()
      }
    });
    
    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email: admin@smartstart.com');
    console.log('🔑 Password: AdminPass123!');
    console.log('👤 Role: SUPER_ADMIN');
    console.log('🎯 Status: ACTIVE');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
