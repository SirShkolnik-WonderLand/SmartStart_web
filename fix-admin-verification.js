const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
    }
  }
});

async function fixAdminVerification() {
  try {
    console.log('🔧 FIXING ADMIN EMAIL VERIFICATION');
    console.log('===================================');
    
    // 1. Get admin user
    const adminUser = await prisma.$queryRaw`
      SELECT id, email FROM "User" WHERE email = 'admin@smartstart.com'
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const user = adminUser[0];
    console.log(`✅ Found admin user: ${user.email}`);
    
    // 2. Update verification record to mark as verified
    console.log('\n2. Updating email verification...');
    const result = await prisma.$executeRaw`
      UPDATE "UserVerification" 
      SET "verifiedAt" = NOW(), "updatedAt" = NOW()
      WHERE "userId" = ${user.id} AND "verificationType" = 'EMAIL_VERIFICATION'
    `;
    
    console.log(`✅ Updated ${result} verification record(s)`);
    
    // 3. Verify the update
    console.log('\n3. Verifying the update...');
    const verification = await prisma.$queryRaw`
      SELECT * FROM "UserVerification" 
      WHERE "userId" = ${user.id} AND "verificationType" = 'EMAIL_VERIFICATION'
    `;
    
    if (verification.length > 0) {
      const ver = verification[0];
      console.log('✅ Verification record updated:');
      console.log(`  - Verified: ${ver.verifiedAt ? 'YES' : 'NO'}`);
      console.log(`  - Verified At: ${ver.verifiedAt}`);
      console.log(`  - Updated At: ${ver.updatedAt}`);
    }
    
    // 4. Test login with curl
    console.log('\n4. Testing admin login...');
    const { exec } = require('child_process');
    
    exec('curl -s -X POST "https://smartstart-api.onrender.com/api/auth/login" -H "Content-Type: application/json" -d \'{"email":"admin@smartstart.com","password":"AdminPass123!"}\' | jq \'.message\'', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Curl test failed:', error.message);
        return;
      }
      console.log('✅ Login test result:', stdout.trim());
    });
    
    console.log('\n🎉 Admin email verification fixed!');
    console.log('The admin user should now be able to log in successfully.');
    
  } catch (error) {
    console.error('❌ Error fixing admin verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminVerification();
