const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        const hashedPassword = await bcrypt.hash('SmartStart123!', 12);

        const user = await prisma.user.create({
            data: {
                email: 'udi.test@example.com',
                password: hashedPassword,
                name: 'Udi',
                firstName: 'Udi',
                lastName: 'Shkolnik',
                username: 'udi'
            }
        });

        console.log('✅ Test user created:', user);
        return user;
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        throw error;
    }
}

createTestUser()
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });