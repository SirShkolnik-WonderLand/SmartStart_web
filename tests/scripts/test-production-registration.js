const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the same database URL that production would use
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
    }
  }
});

async function testProductionRegistration() {
  try {
    console.log('🧪 Testing production registration logic...\n');

    // Test data
    const userData = {
      email: 'test-production@test.com',
      password: 'test123',
      name: 'Test Production User',
      firstName: 'Test',
      lastName: 'Production'
    };

    console.log('📝 Test data:', userData);

    // Check if user already exists
    const existingAccount = await prisma.account.findUnique({
      where: { email: userData.email.toLowerCase() }
    });

    if (existingAccount) {
      console.log('⚠️  User already exists, cleaning up...');
      await prisma.account.delete({
        where: { email: userData.email.toLowerCase() }
      });
      await prisma.user.deleteMany({
        where: { email: userData.email.toLowerCase() }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    console.log('🔐 Password hashed');

    // Find default role
    const defaultRole = await prisma.role.findFirst({ 
      where: { name: 'GUEST' } 
    });
    console.log('👤 Default role:', defaultRole);

    if (!defaultRole) {
      console.log('❌ GUEST role not found, creating it...');
      const newRole = await prisma.role.create({
        data: {
          name: 'GUEST',
          description: 'Guest user role',
          level: 1,
          isActive: true
        }
      });
      console.log('✅ GUEST role created:', newRole);
    }

    // Create user and account in transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('🔄 Starting transaction...');
      
      const user = await tx.user.create({
        data: {
          name: userData.name || userData.email.split('@')[0],
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          email: userData.email.toLowerCase(),
          status: 'ACTIVE'
        }
      });
      console.log('✅ User created:', user);

      const account = await tx.account.create({
        data: {
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          userId: user.id,
          roleId: defaultRole.id,
          isActive: true,
          lastLogin: null,
          loginAttempts: 0,
          mfaEnabled: false
        }
      });
      console.log('✅ Account created:', account);

      return { user, account };
    });

    console.log('🎉 Registration successful!');
    console.log('User:', result.user);
    console.log('Account:', result.account);

    // Clean up
    await prisma.account.delete({
      where: { email: userData.email.toLowerCase() }
    });
    await prisma.user.delete({
      where: { id: result.user.id }
    });
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Registration failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

testProductionRegistration();
