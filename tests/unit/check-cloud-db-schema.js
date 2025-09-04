const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
    }
  }
});

async function checkCloudDBSchema() {
  try {
    console.log('🔍 Checking cloud database schema...\n');

    // Check User table structure
    console.log('📋 User table structure:');
    const userTable = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;
    console.table(userTable);

    // Check Account table structure
    console.log('\n📋 Account table structure:');
    const accountTable = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Account' 
      ORDER BY ordinal_position;
    `;
    console.table(accountTable);

    // Check Role table structure
    console.log('\n📋 Role table structure:');
    const roleTable = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Role' 
      ORDER BY ordinal_position;
    `;
    console.table(roleTable);

    // Check if GUEST role exists
    console.log('\n🔍 Checking for GUEST role:');
    const guestRole = await prisma.role.findFirst({
      where: { name: 'GUEST' }
    });
    console.log('GUEST role:', guestRole);

    // Check existing users
    console.log('\n👥 Existing users:');
    const users = await prisma.user.findMany({
      take: 5,
      include: {
        accounts: {
          include: {
            role: true
          }
        }
      }
    });
    console.log('Users count:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Status: ${user.status}`);
      user.accounts.forEach(account => {
        console.log(`  Account: ${account.email} - Role: ${account.role?.name || 'No role'} - Active: ${account.isActive}`);
      });
    });

  } catch (error) {
    console.error('❌ Error checking cloud database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCloudDBSchema();
