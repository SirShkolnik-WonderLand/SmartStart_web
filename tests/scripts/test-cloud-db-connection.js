const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
    }
  }
});

async function testCloudDB() {
  try {
    console.log('🔍 Testing cloud database connection...\n');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to cloud database');

    // Check if GUEST role exists
    console.log('\n🔍 Checking for GUEST role:');
    const guestRole = await prisma.role.findFirst({
      where: { name: 'GUEST' }
    });
    console.log('GUEST role:', guestRole);

    // Check existing users count
    console.log('\n👥 Checking users:');
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);

    // Check existing accounts count
    console.log('\n🔐 Checking accounts:');
    const accountCount = await prisma.account.count();
    console.log('Total accounts:', accountCount);

    // Try to create a test user to see what error we get
    console.log('\n🧪 Testing user creation...');
    try {
      const testUser = await prisma.user.create({
        data: {
          name: 'Test Cloud User',
          email: 'test-cloud@test.com',
          status: 'ACTIVE'
        }
      });
      console.log('✅ Test user created:', testUser);
      
      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('✅ Test user cleaned up');
    } catch (createError) {
      console.log('❌ User creation error:', createError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCloudDB();
