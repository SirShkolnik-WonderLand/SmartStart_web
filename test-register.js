const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testRegister() {
    try {
        console.log('🧪 Testing registration logic...');
        
        const email = 'test2@test.com';
        const password = 'test123';
        const name = 'Test User 2';
        
        // Check if user already exists
        const existingAccount = await prisma.account.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingAccount) {
            console.log('❌ User already exists');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('✅ Password hashed');

        // Get default role (GUEST)
        const defaultRole = await prisma.role.findFirst({
            where: { name: 'GUEST' }
        });

        if (!defaultRole) {
            console.log('❌ Default role not found');
            return;
        }
        
        console.log(`✅ Found GUEST role: ${defaultRole.id}`);

        // Create user and account in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    name: name || email.split('@')[0],
                    firstName: null,
                    lastName: null,
                    email: email.toLowerCase(),
                    isActive: true
                }
            });
            console.log(`✅ User created: ${user.id}`);

            // Create account
            const account = await tx.account.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    userId: user.id,
                    roleId: defaultRole.id,
                    isActive: true,
                    isVerified: false,
                    lastLoginAt: null
                }
            });
            console.log(`✅ Account created: ${account.id}`);

            return { user, account };
        });

        console.log('✅ Registration successful!');
        console.log('User:', result.user);
        console.log('Account:', result.account);
        
    } catch (error) {
        console.error('❌ Registration error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testRegister();
