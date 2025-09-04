const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAccountForUser() {
    try {
        // First, find the user we created
        const user = await prisma.user.findUnique({
            where: { email: 'udi.test@example.com' }
        });

        if (!user) {
            console.error('❌ User not found');
            return;
        }

        console.log('✅ Found user:', user.email);

        // Check if account already exists
        const existingAccount = await prisma.account.findUnique({
            where: { userId: user.id }
        });

        if (existingAccount) {
            console.log('✅ Account already exists for user');
            return;
        }

        // Find a default role (MEMBER)
        const role = await prisma.role.findFirst({
            where: { name: 'MEMBER' }
        });

        if (!role) {
            console.error('❌ MEMBER role not found');
            return;
        }

        // Create the account
        const account = await prisma.account.create({
            data: {
                email: user.email,
                password: user.password, // Use the same hashed password
                roleId: role.id,
                userId: user.id,
                isActive: true
            }
        });

        console.log('✅ Account created successfully:', {
            id: account.id,
            email: account.email,
            userId: account.userId,
            roleId: account.roleId
        });

    } catch (error) {
        console.error('❌ Error creating account:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAccountForUser();
