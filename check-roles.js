const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRoles() {
    try {
        const roles = await prisma.role.findMany();
        console.log('Available roles:', roles);
        
        if (roles.length === 0) {
            console.log('No roles found. Creating default roles...');
            
            // Create default roles
            const defaultRoles = [
                { name: 'ADMIN', description: 'System Administrator' },
                { name: 'TEAM_MEMBER', description: 'Team Member' },
                { name: 'USER', description: 'Regular User' }
            ];
            
            for (const roleData of defaultRoles) {
                const role = await prisma.role.create({
                    data: roleData
                });
                console.log('✅ Created role:', role);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking roles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRoles();
