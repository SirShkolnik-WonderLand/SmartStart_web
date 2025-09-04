const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function checkProductionDatabase() {
    try {
        console.log('🔍 CHECKING PRODUCTION DATABASE STATE');
        console.log('=====================================');

        // Check if password column exists
        console.log('\n1. Checking User table structure...');
        const userColumns = await prisma.$queryRaw `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;

        console.log('User table columns:');
        userColumns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });

        // Check if password column exists
        const hasPasswordColumn = userColumns.some(col => col.column_name === 'password');
        console.log(`\nPassword column exists: ${hasPasswordColumn ? '✅ YES' : '❌ NO'}`);

        // Check existing users
        console.log('\n2. Checking existing users...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                role: true,
                level: true
            }
        });

        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - ${user.status} - ${user.role || 'NO_ROLE'}`);
        });

        // Check if admin user exists
        const adminUser = users.find(u => u.email === 'admin@smartstart.com');
        console.log(`\nAdmin user exists: ${adminUser ? '✅ YES' : '❌ NO'}`);

        if (!hasPasswordColumn) {
            console.log('\n❌ MISSING: Password column in User table');
            console.log('Need to add password column to production database');
        }

        if (!adminUser) {
            console.log('\n❌ MISSING: Admin user');
            console.log('Need to create admin user in production database');
        }

        // Check other important tables
        console.log('\n3. Checking other important tables...');
        const tables = ['UserVerification', 'UserSession', 'PasswordReset', 'JourneyStage', 'JourneyGate', 'UserJourneyState'];

        for (const table of tables) {
            try {
                const count = await prisma.$queryRaw `SELECT COUNT(*) as count FROM "${table}"`;
                console.log(`  - ${table}: ${count[0].count} records`);
            } catch (error) {
                console.log(`  - ${table}: ❌ TABLE NOT EXISTS`);
            }
        }

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProductionDatabase();