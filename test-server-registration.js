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

async function testServerRegistration() {
    try {
        console.log('🔍 Testing server-side registration logic...\n');

        const userData = {
            email: 'newuser@example.com',
            password: 'test123',
            name: 'New User',
            firstName: 'New',
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

        // Step 4: Create user and account in transaction (exactly like server)
        console.log('\n4️⃣ Creating user and account in transaction...');
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

        // Step 5: Get account with user and role for token generation
        console.log('\n5️⃣ Getting account with user and role...');
        const accountWithUser = await prisma.account.findUnique({
            where: { id: result.account.id },
            include: {
                user: true,
                role: true
            }
        });
        console.log('Account with user and role:', accountWithUser ? 'FOUND' : 'NOT FOUND');

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
        console.log('User with role:', userWithRole ? 'FOUND' : 'NOT FOUND');

        if (userWithRole) {
            console.log('✅ Registration simulation completed successfully!');
            console.log('User ID:', userWithRole.id);
            console.log('Account ID:', userWithRole.account.id);
            console.log('Role:', userWithRole.account.role.name);
            console.log('Permissions:', userWithRole.account.role.rolePermissions.map(rp => rp.permission.name));
        } else {
            console.log('❌ User with role information not found');
        }

    } catch (error) {
        console.error('❌ Server registration test failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
    } finally {
        await prisma.$disconnect();
    }
}

testServerRegistration();