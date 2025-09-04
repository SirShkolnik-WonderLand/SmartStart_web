const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the same database URL that production would use
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://smartstart_user:smartstart_password@dpg-d2r25ufdiees73dp7mt0-a.oregon-postgres.render.com/smartstart_db'
        }
    }
});

async function debugRegistration() {
    try {
        console.log('🔍 Debugging registration process...\n');

        const userData = {
            email: 'debug@test.com',
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
        console.log('Existing account:', existingAccount);

        if (existingAccount) {
            console.log('❌ User already exists');
            return;
        }

        // Step 2: Hash password
        console.log('\n2️⃣ Hashing password...');
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        console.log('Password hashed successfully');

        // Step 3: Get default role
        console.log('\n3️⃣ Getting default role...');
        const defaultRole = await prisma.role.findFirst({
            where: { name: 'GUEST' }
        });
        console.log('Default role:', defaultRole);

        if (!defaultRole) {
            console.log('❌ Default role not found');
            return;
        }

        // Step 4: Create user and account in transaction
        console.log('\n4️⃣ Creating user and account...');
        const result = await prisma.$transaction(async(tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    name: userData.name || userData.email.split('@')[0],
                    firstName: userData.firstName || null,
                    lastName: userData.lastName || null,
                    email: userData.email.toLowerCase(),
                    status: 'ACTIVE'
                }
            });
            console.log('✅ User created:', user);

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
            console.log('✅ Account created:', account);

            return { user, account };
        });

        // Step 5: Get account with user and role for token generation
        console.log('\n5️⃣ Getting account with user and role...');
        const accountWithUser = await prisma.account.findUnique({
            where: { id: result.account.id },
            include: {
                user: true,
                role: true
            }
        });
        console.log('Account with user and role:', accountWithUser);

        if (!accountWithUser) {
            console.log('❌ Account with user and role not found');
            return;
        }

        // Step 6: Get user with role information
        console.log('\n6️⃣ Getting user with role information...');
        const userWithRole = await prisma.user.findUnique({
            where: { id: result.user.id },
            include: {
                account: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        console.log('User with role:', userWithRole);

        console.log('\n✅ Registration debug completed successfully!');

    } catch (error) {
        console.error('❌ Registration debug failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
    } finally {
        await prisma.$disconnect();
    }
}

