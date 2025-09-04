const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function checkAdminUser() {
    try {
        console.log('🔍 CHECKING ADMIN USER DETAILS');
        console.log('===============================');

        // Check admin user details
        const adminUser = await prisma.$queryRaw `
      SELECT id, email, password, "firstName", "lastName", status, role, level, "createdAt", "updatedAt"
      FROM "User" 
      WHERE email = 'admin@smartstart.com'
    `;

        if (adminUser.length > 0) {
            const user = adminUser[0];
            console.log('Admin user details:');
            console.log(`  - ID: ${user.id}`);
            console.log(`  - Email: ${user.email}`);
            console.log(`  - Password: ${user.password ? 'SET' : 'NOT SET'}`);
            console.log(`  - First Name: ${user.firstName}`);
            console.log(`  - Last Name: ${user.lastName}`);
            console.log(`  - Status: ${user.status}`);
            console.log(`  - Role: ${user.role}`);
            console.log(`  - Level: ${user.level}`);
            console.log(`  - Created: ${user.createdAt}`);
            console.log(`  - Updated: ${user.updatedAt}`);

            // Check if password is properly hashed
            if (user.password) {
                console.log(`  - Password starts with: ${user.password.substring(0, 10)}...`);
                console.log(`  - Password length: ${user.password.length}`);
            }
        } else {
            console.log('❌ Admin user not found!');
        }

        // Compare with a working user
        console.log('\n🔍 COMPARING WITH WORKING USER');
        console.log('===============================');

        const workingUser = await prisma.$queryRaw `
      SELECT id, email, password, "firstName", "lastName", status, role, level, "createdAt", "updatedAt"
      FROM "User" 
      WHERE email = 'test-db@example.com'
    `;

        if (workingUser.length > 0) {
            const user = workingUser[0];
            console.log('Working user details:');
            console.log(`  - ID: ${user.id}`);
            console.log(`  - Email: ${user.email}`);
            console.log(`  - Password: ${user.password ? 'SET' : 'NOT SET'}`);
            console.log(`  - First Name: ${user.firstName}`);
            console.log(`  - Last Name: ${user.lastName}`);
            console.log(`  - Status: ${user.status}`);
            console.log(`  - Role: ${user.role}`);
            console.log(`  - Level: ${user.level}`);
            console.log(`  - Created: ${user.createdAt}`);
            console.log(`  - Updated: ${user.updatedAt}`);

            if (user.password) {
                console.log(`  - Password starts with: ${user.password.substring(0, 10)}...`);
                console.log(`  - Password length: ${user.password.length}`);
            }
        }

    } catch (error) {
        console.error('❌ Error checking admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdminUser();