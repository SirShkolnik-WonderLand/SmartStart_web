const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRoles() {
    try {
        console.log('🔍 Checking roles in database...');
        
        const roles = await prisma.role.findMany({
            orderBy: { level: 'desc' }
        });
        
        console.log(`Found ${roles.length} roles:`);
        roles.forEach(role => {
            console.log(`- ${role.name} (Level: ${role.level}, System: ${role.isSystem})`);
        });
        
        const guestRole = await prisma.role.findFirst({
            where: { name: 'GUEST' }
        });
        
        if (guestRole) {
            console.log(`✅ GUEST role found: ID=${guestRole.id}, Level=${guestRole.level}`);
        } else {
            console.log('❌ GUEST role not found');
        }
        
    } catch (error) {
        console.error('Error checking roles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRoles();
