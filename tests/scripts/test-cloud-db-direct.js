const { PrismaClient } = require('@prisma/client');

// Use the exact database URL from the Render dashboard
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
    }
  }
});

async function testCloudDBDirect() {
  try {
    console.log('🔍 Testing direct cloud database connection...\n');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to cloud database');

    // Check User table structure
    console.log('\n📋 Checking User table structure:');
    const userTable = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;
    console.table(userTable);

    // Check Account table structure
    console.log('\n📋 Checking Account table structure:');
    const accountTable = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Account' 
      ORDER BY ordinal_position;
    `;
    console.table(accountTable);

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

    // Check roles count
    console.log('\n👑 Checking roles:');
    const roleCount = await prisma.role.count();
    console.log('Total roles:', roleCount);

    // List all roles
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, description: true }
    });
    console.log('Available roles:', roles);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCloudDBDirect();
