const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the cloud database URL
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://smartstart_user:aN8xbmGxskrJbeeQzuoviicP2YQ4BXNh@dpg-d2r25k7diees73dp78a0-a.oregon-postgres.render.com/smartstart'
        }
    }
});

async function debugAuth() {
    try {
        console.log('🔍 Starting authentication debug...\n');

        const userData = {
            email: 'debuguser@test.com',
            password: 'test123',
            name: 'Debug User',
            firstName: 'Debug',
            lastName: 'User'
        };

        console.log('📝 Test data:', userData);

        // Step 1: Check if user already exists
        console.log('\n1️⃣ Checking if user already exists...');
        const existingAccount = await prisma.account.findUnique({
            where: { email: userData.email.toLowerCase() }
        });
        console.log('Existing account:', existingAccount ? 'EXISTS' : 'NOT FOUND');

        if (existingAccount) {
            console.log('❌ User already exists, cleaning up...');
            await prisma.account.delete({
                where: { email: userData.email.toLowerCase() }
            });
            await prisma.user.deleteMany({
                where: { email: userData.email.toLowerCase() }
            });
            console.log('✅ Cleaned up existing user');
        }

        // Step 2: Hash password
        console.log('\n2️⃣ Hashing password...');
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        console.log('Password hashed successfully');
        console.log('Hash length:', hashedPassword.length);

        // Step 3: Get default role
        console.log('\n3️⃣ Getting default role...');
        const defaultRole = await prisma.role.findFirst({
            where: { name: 'GUEST' }
        });
        console.log('Default role:', defaultRole ? `FOUND (${defaultRole.name})` : 'NOT FOUND');

        if (!defaultRole) {
            console.log('❌ Default role not found');
            return;
        }

        // Step 4: Test password verification
        console.log('\n4️⃣ Testing password verification...');
        const isPasswordValid = await bcrypt.compare(userData.password, hashedPassword);
        console.log('Password verification:', isPasswordValid ? 'SUCCESS' : 'FAILED');

        // Step 5: Create user and account in transaction
        console.log('\n5️⃣ Creating user and account...');
        const result = await prisma.$transaction(async(tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    name: userData.name || userData.email.split('@')[0],
                    firstName: userData.firstName || null,
                    lastName: userData.lastName || null,
                    email: userData.email.toLowerCase(),
                    status: 'ACTIVE',
                    updatedAt: new Date()
                }
            });
            console.log('✅ User created:', user.id);

            // Create account
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
            console.log('✅ Account created:', account.id);

            return { user, account };
        });

        // Step 6: Test login with created user
        console.log('\n6️⃣ Testing login with created user...');
        const loginAccount = await prisma.account.findUnique({
            where: { email: userData.email.toLowerCase() },
            include: {
                user: true,
                role: true
            }
        });

        if (loginAccount) {
            const loginPasswordValid = await bcrypt.compare(userData.password, loginAccount.password);
            console.log('Login password verification:', loginPasswordValid ? 'SUCCESS' : 'FAILED');

            if (loginPasswordValid) {
                console.log('✅ User can authenticate successfully!');
            } else {
                console.log('❌ Password verification failed during login test');
            }
        } else {
            console.log('❌ Account not found for login test');
        }

        console.log('\n✅ Authentication debug completed successfully!');

    } catch (error) {
        console.error('❌ Authentication debug failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
    } finally {
        await prisma.$disconnect();
    }
}

debugAuth();