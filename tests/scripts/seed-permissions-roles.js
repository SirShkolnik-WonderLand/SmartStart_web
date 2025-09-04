const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPermissionsAndRoles() {
    try {
        console.log('🌱 Seeding permissions and roles...');

        // Clear existing data (in correct order to avoid foreign key constraints)
        await prisma.rolePermission.deleteMany({});
        await prisma.permission.deleteMany({});
        
        // Check if roles exist
        const existingRoles = await prisma.role.count();
        if (existingRoles > 0) {
            console.log(`Found ${existingRoles} existing roles. Skipping role deletion to avoid foreign key constraints.`);
        } else {
            await prisma.role.deleteMany({});
        }

        // Create permissions
        const permissions = [
            // User management
            { name: 'user:read', description: 'Read user information', resource: 'user', action: 'read' },
            { name: 'user:write', description: 'Create and update users', resource: 'user', action: 'write' },
            { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
            { name: 'user:admin', description: 'User administration', resource: 'user', action: 'admin' },

            // Project management
            { name: 'project:read', description: 'Read project information', resource: 'project', action: 'read' },
            { name: 'project:write', description: 'Create and update projects', resource: 'project', action: 'write' },
            { name: 'project:delete', description: 'Delete projects', resource: 'project', action: 'delete' },
            { name: 'project:admin', description: 'Full project management', resource: 'project', action: 'admin' },

            // Company management
            { name: 'company:read', description: 'Read company information', resource: 'company', action: 'read' },
            { name: 'company:write', description: 'Create and update companies', resource: 'company', action: 'write' },
            { name: 'company:delete', description: 'Delete companies', resource: 'company', action: 'delete' },

            // Contract management
            { name: 'contract:read', description: 'Read contract information', resource: 'contract', action: 'read' },
            { name: 'contract:write', description: 'Create and update contracts', resource: 'contract', action: 'write' },
            { name: 'contract:sign', description: 'Sign contracts', resource: 'contract', action: 'sign' },
            { name: 'contract:issue', description: 'Issue contracts', resource: 'contract', action: 'issue' },
            { name: 'contract:admin', description: 'Contract administration', resource: 'contract', action: 'admin' },

            // Document management
            { name: 'document:read', description: 'Read documents', resource: 'document', action: 'read' },
            { name: 'document:write', description: 'Create and update documents', resource: 'document', action: 'write' },
            { name: 'document:sign', description: 'Sign documents', resource: 'document', action: 'sign' },

            // Financial management
            { name: 'financial:read', description: 'Read financial information', resource: 'financial', action: 'read' },
            { name: 'financial:write', description: 'Manage financial data', resource: 'financial', action: 'write' },
            { name: 'financial:approve', description: 'Approve financial transactions', resource: 'financial', action: 'approve' },

            // System administration
            { name: 'system:admin', description: 'System administration', resource: 'system', action: 'admin' },
            { name: 'system:config', description: 'System configuration', resource: 'system', action: 'config' },
            { name: 'system:monitor', description: 'System monitoring', resource: 'system', action: 'monitor' },

            // Journey management
            { name: 'journey:read', description: 'Read journey information', resource: 'journey', action: 'read' },
            { name: 'journey:write', description: 'Update journey state', resource: 'journey', action: 'write' },
            { name: 'journey:admin', description: 'Journey administration', resource: 'journey', action: 'admin' },
        ];

        console.log('Creating permissions...');
        for (const perm of permissions) {
            await prisma.permission.create({
                data: perm
            });
        }

        // Create roles with hierarchy
        const roles = [{
                name: 'SUPER_ADMIN',
                description: 'Super Administrator with full system access',
                level: 100,
                isSystem: true,
                permissions: permissions.map(p => p.name) // All permissions
            },
            {
                name: 'ADMIN',
                description: 'System Administrator',
                level: 90,
                isSystem: true,
                permissions: [
                    'user:read', 'user:write',
                    'project:read', 'project:write', 'project:manage',
                    'company:read', 'company:write',
                    'contract:read', 'contract:write', 'contract:issue',
                    'document:read', 'document:write',
                    'financial:read', 'financial:write',
                    'system:monitor',
                    'journey:read', 'journey:write', 'journey:admin'
                ]
            },
            {
                name: 'ORG_OWNER',
                description: 'Organization Owner',
                level: 80,
                isSystem: false,
                permissions: [
                    'user:read', 'user:write',
                    'project:read', 'project:write', 'project:manage',
                    'company:read', 'company:write',
                    'contract:read', 'contract:write', 'contract:sign', 'contract:issue',
                    'document:read', 'document:write', 'document:sign',
                    'financial:read', 'financial:write', 'financial:approve',
                    'journey:read', 'journey:write'
                ]
            },
            {
                name: 'PROJECT_OWNER',
                description: 'Project Owner',
                level: 70,
                isSystem: false,
                permissions: [
                    'user:read',
                    'project:read', 'project:write', 'project:manage',
                    'contract:read', 'contract:write', 'contract:sign',
                    'document:read', 'document:write', 'document:sign',
                    'financial:read', 'financial:write',
                    'journey:read', 'journey:write'
                ]
            },
            {
                name: 'BILLING_ADMIN',
                description: 'Billing Administrator',
                level: 60,
                isSystem: false,
                permissions: [
                    'user:read',
                    'project:read',
                    'contract:read', 'contract:write', 'contract:issue',
                    'document:read', 'document:write',
                    'financial:read', 'financial:write', 'financial:approve',
                    'journey:read'
                ]
            },
            {
                name: 'LEGAL_ADMIN',
                description: 'Legal Administrator',
                level: 60,
                isSystem: false,
                permissions: [
                    'user:read',
                    'project:read',
                    'contract:read', 'contract:write', 'contract:issue',
                    'document:read', 'document:write', 'document:sign',
                    'journey:read'
                ]
            },
            {
                name: 'SECURITY_ADMIN',
                description: 'Security Administrator',
                level: 60,
                isSystem: false,
                permissions: [
                    'user:read', 'user:write',
                    'project:read',
                    'contract:read',
                    'document:read',
                    'system:monitor',
                    'journey:read'
                ]
            },
            {
                name: 'CONTRIBUTOR',
                description: 'Active Contributor',
                level: 50,
                isSystem: false,
                permissions: [
                    'user:read',
                    'project:read', 'project:write',
                    'contract:read', 'contract:sign',
                    'document:read', 'document:sign',
                    'financial:read',
                    'journey:read', 'journey:write'
                ]
            },
            {
                name: 'TEAM_MEMBER',
                description: 'Team Member',
                level: 40,
                isSystem: false,
                permissions: [
                    'user:read',
                    'project:read',
                    'contract:read', 'contract:sign',
                    'document:read', 'document:sign',
                    'journey:read', 'journey:write'
                ]
            },
            {
                name: 'VIEWER',
                description: 'Read-only access',
                level: 30,
                isSystem: false,
                permissions: [
                    'user:read',
                    'project:read',
                    'contract:read',
                    'document:read',
                    'journey:read'
                ]
            },
            {
                name: 'GUEST',
                description: 'Guest user with minimal access',
                level: 20,
                isSystem: false,
                permissions: [
                    'journey:read'
                ]
            }
        ];

        console.log('Creating/updating roles...');
        for (const roleData of roles) {
            const { permissions: rolePermissions, ...roleInfo } = roleData;

            const role = await prisma.role.upsert({
                where: { name: roleInfo.name },
                update: roleInfo,
                create: roleInfo
            });

            // Assign permissions to role
            for (const permissionName of rolePermissions) {
                const permission = await prisma.permission.findUnique({
                    where: { name: permissionName }
                });

                if (permission) {
                    await prisma.rolePermission.create({
                        data: {
                            roleId: role.id,
                            permissionId: permission.id
                        }
                    });
                }
            }
        }

        console.log('✅ Permissions and roles seeded successfully!');
        console.log(`Created ${permissions.length} permissions and ${roles.length} roles`);

    } catch (error) {
        console.error('❌ Error seeding permissions and roles:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
if (require.main === module) {
    seedPermissionsAndRoles()
        .then(() => {
            console.log('🎉 Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedPermissionsAndRoles };