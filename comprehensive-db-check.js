const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function comprehensiveDatabaseCheck() {
    try {
        console.log('🔍 COMPREHENSIVE DATABASE CHECK');
        console.log('================================');

        // 1. Check all tables
        console.log('\n1. CHECKING ALL TABLES:');
        const tables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

        console.log(`Found ${tables.length} tables:`);
        tables.forEach(table => {
            console.log(`  ✅ ${table.table_name}`);
        });

        // 2. Check User table structure
        console.log('\n2. USER TABLE STRUCTURE:');
        const userColumns = await prisma.$queryRaw `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;

        userColumns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // 3. Check user data
        console.log('\n3. USER DATA:');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                role: true,
                level: true,
                password: true,
                createdAt: true
            }
        });

        console.log(`Total users: ${users.length}`);
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`);
            console.log(`    Status: ${user.status}, Role: ${user.role || 'NO_ROLE'}, Level: ${user.level || 'NO_LEVEL'}`);
            console.log(`    Password: ${user.password ? 'SET' : 'NOT SET'}, Created: ${user.createdAt}`);
        });

        // 4. Check JourneyStage data
        console.log('\n4. JOURNEY STAGES:');
        try {
            const stages = await prisma.$queryRaw `SELECT * FROM "JourneyStage" ORDER BY "order"`;
            console.log(`Found ${stages.length} journey stages:`);
            stages.forEach(stage => {
                console.log(`  - ${stage.name}: ${stage.description} (Order: ${stage.order})`);
            });
        } catch (error) {
            console.log('  ❌ JourneyStage table not accessible or empty');
        }

        // 5. Check JourneyGate data
        console.log('\n5. JOURNEY GATES:');
        try {
            const gates = await prisma.$queryRaw `SELECT * FROM "JourneyGate" ORDER BY "createdAt"`;
            console.log(`Found ${gates.length} journey gates:`);
            gates.forEach(gate => {
                console.log(`  - ${gate.name}: ${gate.type} (Stage: ${gate.stageId})`);
            });
        } catch (error) {
            console.log('  ❌ JourneyGate table not accessible or empty');
        }

        // 6. Check UserJourneyState data
        console.log('\n6. USER JOURNEY STATES:');
        try {
            const userStates = await prisma.$queryRaw `SELECT * FROM "UserJourneyState" ORDER BY "createdAt"`;
            console.log(`Found ${userStates.length} user journey states:`);
            userStates.forEach(state => {
                console.log(`  - User: ${state.userId}, Stage: ${state.stageId}, Status: ${state.status}`);
            });
        } catch (error) {
            console.log('  ❌ UserJourneyState table not accessible or empty');
        }

        // 7. Check UserVerification data
        console.log('\n7. USER VERIFICATIONS:');
        try {
            const verifications = await prisma.$queryRaw `SELECT * FROM "UserVerification" ORDER BY "createdAt"`;
            console.log(`Found ${verifications.length} user verifications:`);
            verifications.forEach(verification => {
                console.log(`  - User: ${verification.userId}, Token: ${verification.verificationToken.substring(0, 10)}..., Verified: ${verification.verifiedAt ? 'YES' : 'NO'}`);
            });
        } catch (error) {
            console.log('  ❌ UserVerification table not accessible or empty');
        }

        // 8. Check UserSession data
        console.log('\n8. USER SESSIONS:');
        try {
            const sessions = await prisma.$queryRaw `SELECT * FROM "UserSession" ORDER BY "createdAt"`;
            console.log(`Found ${sessions.length} user sessions:`);
            sessions.forEach(session => {
                console.log(`  - User: ${session.userId}, Token: ${session.sessionToken.substring(0, 10)}..., Expires: ${session.expiresAt}`);
            });
        } catch (error) {
            console.log('  ❌ UserSession table not accessible or empty');
        }

        // 9. Check other important tables
        console.log('\n9. OTHER IMPORTANT TABLES:');
        const importantTables = ['Company', 'Team', 'Project', 'Venture', 'Role', 'Permission', 'Account'];

        for (const table of importantTables) {
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

