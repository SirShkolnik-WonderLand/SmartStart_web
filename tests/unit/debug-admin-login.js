const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
    }
  }
});

async function debugAdminLogin() {
  try {
    console.log('🔍 DEBUGGING ADMIN LOGIN ISSUE');
    console.log('================================');
    
    // 1. Check admin user in database
    console.log('\n1. Checking admin user in database...');
    const adminUser = await prisma.$queryRaw`
      SELECT id, email, password, status, role, level, "firstName", "lastName", "createdAt", "updatedAt"
      FROM "User" 
      WHERE email = 'admin@smartstart.com'
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    const user = adminUser[0];
    console.log('✅ Admin user found:');
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Status: ${user.status}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Level: ${user.level}`);
    console.log(`  - Name: ${user.firstName} ${user.lastName}`);
    console.log(`  - Password: ${user.password ? 'SET' : 'NOT SET'}`);
    console.log(`  - Created: ${user.createdAt}`);
    console.log(`  - Updated: ${user.updatedAt}`);
    
    // 2. Test password validation
    if (user.password) {
      console.log('\n2. Testing password validation...');
      const testPasswords = [
        'AdminPass123!',
        'admin',
        'password123',
        'AdminPass123',
        'admin@smartstart.com'
      ];
      
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`  - "${testPassword}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      }
    }
    
    // 3. Check user verification status
    console.log('\n3. Checking user verification status...');
    const verification = await prisma.$queryRaw`
      SELECT * FROM "UserVerification" 
      WHERE "userId" = ${user.id}
    `;
    
    if (verification.length > 0) {
      const ver = verification[0];
      console.log('✅ Verification record found:');
      console.log(`  - Token: ${ver.verificationToken.substring(0, 20)}...`);
      console.log(`  - Type: ${ver.verificationType}`);
      console.log(`  - Verified: ${ver.verifiedAt ? 'YES' : 'NO'}`);
      console.log(`  - Expires: ${ver.expiresAt}`);
    } else {
      console.log('❌ No verification record found');
    }
    
    // 4. Check user journey state
    console.log('\n4. Checking user journey state...');
    const journeyState = await prisma.$queryRaw`
      SELECT ujs.*, js.name as stage_name
      FROM "UserJourneyState" ujs
      JOIN "JourneyStage" js ON ujs."stageId" = js.id
      WHERE ujs."userId" = ${user.id}
      ORDER BY ujs."createdAt" DESC
      LIMIT 1
    `;
    
    if (journeyState.length > 0) {
      const state = journeyState[0];
      console.log('✅ Journey state found:');
      console.log(`  - Stage: ${state.stage_name}`);
      console.log(`  - Status: ${state.status}`);
      console.log(`  - Started: ${state.startedAt}`);
    } else {
      console.log('❌ No journey state found');
    }
    
    // 5. Check user sessions
    console.log('\n5. Checking user sessions...');
    const sessions = await prisma.$queryRaw`
      SELECT * FROM "UserSession" 
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
    `;
    
    console.log(`Found ${sessions.length} sessions:`);
    sessions.forEach((session, index) => {
      console.log(`  - Session ${index + 1}:`);
      console.log(`    Token: ${session.sessionToken.substring(0, 20)}...`);
      console.log(`    Expires: ${session.expiresAt}`);
      console.log(`    Created: ${session.createdAt}`);
    });
    
    // 6. Test API login endpoint
    console.log('\n6. Testing API login endpoint...');
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'admin@smartstart.com', 
          password: 'AdminPass123!' 
        })
      });
      
      const data = await response.json();
      console.log(`API Response Status: ${response.status}`);
      console.log(`API Response:`, JSON.stringify(data, null, 2));
      
      if (response.ok && data.success) {
        console.log('✅ API login successful');
      } else {
        console.log('❌ API login failed');
      }
    } catch (error) {
      console.log('❌ API test failed:', error.message);
    }
    
    // 7. Summary and recommendations
    console.log('\n7. SUMMARY AND RECOMMENDATIONS:');
    console.log('================================');
    
    if (!user.password) {
      console.log('❌ CRITICAL: Admin user has no password');
      console.log('   Fix: Set password for admin user');
    } else {
      console.log('✅ Admin user has password');
    }
    
    if (verification.length === 0) {
      console.log('❌ WARNING: No verification record');
      console.log('   Fix: Create verification record');
    } else if (!verification[0].verifiedAt) {
      console.log('❌ WARNING: Email not verified');
      console.log('   Fix: Verify email or bypass verification for admin');
    } else {
      console.log('✅ Email verification complete');
    }
    
    if (journeyState.length === 0) {
      console.log('❌ WARNING: No journey state');
      console.log('   Fix: Create journey state for admin user');
    } else {
      console.log('✅ Journey state exists');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Ensure admin user has correct password');
    console.log('2. Verify email or bypass verification');
    console.log('3. Check API authentication logic');
    console.log('4. Test with different credentials');
    
  } catch (error) {
    console.error('❌ Error debugging admin login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminLogin();
