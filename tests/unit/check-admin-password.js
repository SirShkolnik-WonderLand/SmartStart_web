const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
    }
  }
});

async function checkAdminPassword() {
  try {
    console.log('🔍 CHECKING ADMIN PASSWORD FIELD');
    console.log('=================================');
    
    // 1. Check using Prisma ORM
    console.log('\n1. Checking with Prisma ORM...');
    try {
      const user = await prisma.user.findFirst({
        where: { email: 'admin@smartstart.com' },
        select: {
          id: true,
          email: true,
          password: true,
          status: true,
          role: true
        }
      });
      
      if (user) {
        console.log('✅ Prisma ORM found user:');
        console.log(`  - ID: ${user.id}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Password: ${user.password ? 'SET' : 'NOT SET'}`);
        console.log(`  - Status: ${user.status}`);
        console.log(`  - Role: ${user.role}`);
      } else {
        console.log('❌ Prisma ORM: User not found');
      }
    } catch (error) {
      console.log('❌ Prisma ORM error:', error.message);
    }
    
    // 2. Check using raw SQL
    console.log('\n2. Checking with raw SQL...');
    try {
      const user = await prisma.$queryRaw`
        SELECT id, email, password, status, role
        FROM "User" 
        WHERE email = 'admin@smartstart.com'
      `;
      
      if (user.length > 0) {
        const u = user[0];
        console.log('✅ Raw SQL found user:');
        console.log(`  - ID: ${u.id}`);
        console.log(`  - Email: ${u.email}`);
        console.log(`  - Password: ${u.password ? 'SET' : 'NOT SET'}`);
        console.log(`  - Status: ${u.status}`);
        console.log(`  - Role: ${u.role}`);
      } else {
        console.log('❌ Raw SQL: User not found');
      }
    } catch (error) {
      console.log('❌ Raw SQL error:', error.message);
    }
    
    // 3. Check table structure
    console.log('\n3. Checking User table structure...');
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        ORDER BY ordinal_position;
      `;
      
      console.log('User table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } catch (error) {
      console.log('❌ Table structure error:', error.message);
    }
    
    // 4. Test password field specifically
    console.log('\n4. Testing password field specifically...');
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          CASE WHEN password IS NULL THEN 'NULL' 
               WHEN password = '' THEN 'EMPTY' 
               ELSE 'HAS_VALUE' 
          END as password_status,
          LENGTH(password) as password_length
        FROM "User" 
        WHERE email = 'admin@smartstart.com'
      `;
      
      if (result.length > 0) {
        const r = result[0];
        console.log(`✅ Password status: ${r.password_status}`);
        console.log(`✅ Password length: ${r.password_length}`);
      }
    } catch (error) {
      console.log('❌ Password field test error:', error.message);
    }
    
    // 5. Check if there's a schema mismatch
    console.log('\n5. Checking for schema mismatches...');
    try {
      // Try to find user with different field names
      const altUser = await prisma.$queryRaw`
        SELECT id, email, "firstName", "lastName", status, role
        FROM "User" 
        WHERE email = 'admin@smartstart.com'
      `;
      
      if (altUser.length > 0) {
        console.log('✅ Alternative query successful - user exists');
        console.log('❌ This suggests the password field might not be accessible via Prisma');
      }
    } catch (error) {
      console.log('❌ Alternative query error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPassword();
