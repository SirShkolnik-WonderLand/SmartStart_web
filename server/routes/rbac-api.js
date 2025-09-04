const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===== HEALTH CHECK =====
router.get('/health', async(req, res) => {
    try {
        const roleCount = await prisma.role.count();
        const permissionCount = await prisma.permission.count();
        const accountCount = await prisma.account.count();

        res.json({
            success: true,
            message: 'RBAC System is healthy',
            stats: {
                roles: roleCount,
                permissions: permissionCount,
                accounts: accountCount
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'RBAC System health check failed',
            error: error.message
        });
    }
});

// ===== ROLES MANAGEMENT =====

// Get all roles
router.get('/roles', async(req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: { level: 'desc' }
        });

        res.json({
            success: true,
            data: roles,
            message: 'Roles retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve roles',
            error: error.message
        });
    }
});

// Create a new role
router.post('/roles', async(req, res) => {
    try {
        const { name, description, level, isSystem = false } = req.body;

        if (!name || !description || level === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, and level are required'
            });
        }

        const role = await prisma.role.create({
            data: {
                name,
                description,
                level: parseInt(level),
                isSystem
            }
        });

        res.status(201).json({
            success: true,
            data: role,
            message: 'Role created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create role',
            error: error.message
        });
    }
});

// ===== PERMISSIONS MANAGEMENT =====

// Get all permissions
router.get('/permissions', async(req, res) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: [
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });

        res.json({
            success: true,
            data: permissions,
            message: 'Permissions retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve permissions',
            error: error.message
        });
    }
});

// Create a new permission
router.post('/permissions', async(req, res) => {
    try {
        const { name, description, resource, action } = req.body;

        if (!name || !description || !resource || !action) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, resource, and action are required'
            });
        }

        const permission = await prisma.permission.create({
            data: {
                name,
                description,
                resource,
                action
            }
        });

        res.status(201).json({
            success: true,
            data: permission,
            message: 'Permission created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create permission',
            error: error.message
        });
    }
});

// ===== ROLE-PERMISSION ASSIGNMENT =====

// Assign permission to role
router.post('/roles/:roleId/permissions', async(req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionId, grantedBy } = req.body;

        if (!permissionId) {
            return res.status(400).json({
                success: false,
                message: 'Permission ID is required'
            });
        }

        const rolePermission = await prisma.rolePermission.create({
            data: {
                roleId,
                permissionId,
                grantedBy
            },
            include: {
                role: true,
                permission: true
            }
        });

        res.status(201).json({
            success: true,
            data: rolePermission,
            message: 'Permission assigned to role successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to assign permission to role',
            error: error.message
        });
    }
});

// Remove permission from role
router.delete('/roles/:roleId/permissions/:permissionId', async(req, res) => {
    try {
        const { roleId, permissionId } = req.params;

        await prisma.rolePermission.delete({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId
                }
            }
        });

        res.json({
            success: true,
            message: 'Permission removed from role successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove permission from role',
            error: error.message
        });
    }
});

// ===== USER ROLE ASSIGNMENT =====

// Assign role to user
router.post('/users/:userId/roles', async(req, res) => {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;

        if (!roleId) {
            return res.status(400).json({
                success: false,
                message: 'Role ID is required'
            });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if role exists
        const role = await prisma.role.findUnique({
            where: { id: roleId }
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Create or update account with role
        const account = await prisma.account.upsert({
            where: { userId },
            update: { roleId },
            create: {
                email: user.email,
                roleId,
                userId,
                isActive: true
            },
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
        });

        res.status(201).json({
            success: true,
            data: account,
            message: 'Role assigned to user successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to assign role to user',
            error: error.message
        });
    }
});

// Get user roles and permissions
router.get('/users/:userId/permissions', async(req, res) => {
    try {
        const { userId } = req.params;

        const account = await prisma.account.findUnique({
            where: { userId },
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
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }

        const permissions = account.role.rolePermissions.map(rp => rp.permission);

        res.json({
            success: true,
            data: {
                user: {
                    id: account.userId,
                    email: account.email
                },
                role: account.role,
                permissions: permissions
            },
            message: 'User permissions retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user permissions',
            error: error.message
        });
    }
});

// ===== PERMISSION CHECKING =====

// Check if user has specific permission
router.post('/check-permission', async(req, res) => {
    try {
        const { userId, resource, action } = req.body;

        if (!userId || !resource || !action) {
            return res.status(400).json({
                success: false,
                message: 'User ID, resource, and action are required'
            });
        }

        const account = await prisma.account.findUnique({
            where: { userId },
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
        });

        if (!account) {
            return res.json({
                success: true,
                hasPermission: false,
                message: 'User account not found'
            });
        }

        const hasPermission = account.role.rolePermissions.some(rp =>
            rp.permission.resource === resource && rp.permission.action === action
        );

        res.json({
            success: true,
            hasPermission,
            data: {
                user: {
                    id: account.userId,
                    email: account.email
                },
                role: account.role.name,
                resource,
                action
            },
            message: hasPermission ? 'User has permission' : 'User does not have permission'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check permission',
            error: error.message
        });
    }
});

// ===== SEED DEFAULT ROLES AND PERMISSIONS =====

// Seed default roles and permissions
router.post('/seed', async(req, res) => {
    try {
        console.log('🌱 Seeding default roles and permissions...');

        // Create default roles
        const roles = [
            { name: 'SUPER_ADMIN', description: 'Full system access', level: 100, isSystem: true },
            { name: 'ADMIN', description: 'Administrative access', level: 80, isSystem: true },
            { name: 'OWNER', description: 'Venture owner', level: 60, isSystem: false },
            { name: 'CONTRIBUTOR', description: 'Active contributor', level: 40, isSystem: false },
            { name: 'MEMBER', description: 'Team member', level: 20, isSystem: false },
            { name: 'VIEWER', description: 'Read-only access', level: 10, isSystem: false }
        ];

        const createdRoles = [];
        for (const roleData of roles) {
            const role = await prisma.role.upsert({
                where: { name: roleData.name },
                update: roleData,
                create: roleData
            });
            createdRoles.push(role);
        }

        // Create default permissions
        const permissions = [
            // User management
            { name: 'user:read', description: 'Read user information', resource: 'user', action: 'read' },
            { name: 'user:write', description: 'Modify user information', resource: 'user', action: 'write' },
            { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
            { name: 'user:admin', description: 'Admin user operations', resource: 'user', action: 'admin' },

            // Project management
            { name: 'project:read', description: 'Read project information', resource: 'project', action: 'read' },
            { name: 'project:write', description: 'Modify project information', resource: 'project', action: 'write' },
            { name: 'project:delete', description: 'Delete projects', resource: 'project', action: 'delete' },
            { name: 'project:admin', description: 'Admin project operations', resource: 'project', action: 'admin' },

            // Subscription management
            { name: 'subscription:read', description: 'Read subscription information', resource: 'subscription', action: 'read' },
            { name: 'subscription:write', description: 'Modify subscriptions', resource: 'subscription', action: 'write' },
            { name: 'subscription:admin', description: 'Admin subscription operations', resource: 'subscription', action: 'admin' },

            // Legal pack management
            { name: 'legal:read', description: 'Read legal documents', resource: 'legal', action: 'read' },
            { name: 'legal:write', description: 'Modify legal documents', resource: 'legal', action: 'write' },
            { name: 'legal:sign', description: 'Sign legal documents', resource: 'legal', action: 'sign' },

            // System administration
            { name: 'system:read', description: 'Read system information', resource: 'system', action: 'read' },
            { name: 'system:write', description: 'Modify system settings', resource: 'system', action: 'write' },
            { name: 'system:admin', description: 'Admin system operations', resource: 'system', action: 'admin' }
        ];

        const createdPermissions = [];
        for (const permData of permissions) {
            const permission = await prisma.permission.upsert({
                where: { name: permData.name },
                update: permData,
                create: permData
            });
            createdPermissions.push(permission);
        }

        // Assign permissions to roles
        const rolePermissionAssignments = [
            // SUPER_ADMIN gets all permissions
            { roleName: 'SUPER_ADMIN', permissions: createdPermissions.map(p => p.name) },

            // ADMIN gets most permissions except system admin
            { roleName: 'ADMIN', permissions: createdPermissions.filter(p => !p.name.includes('system:admin')).map(p => p.name) },

            // OWNER gets project and legal permissions
            {
                roleName: 'OWNER',
                permissions: createdPermissions.filter(p =>
                    p.name.includes('project:') || p.name.includes('legal:') || p.name.includes('subscription:')
                ).map(p => p.name)
            },

            // CONTRIBUTOR gets read/write on projects and legal read
            {
                roleName: 'CONTRIBUTOR',
                permissions: createdPermissions.filter(p =>
                    (p.name.includes('project:') && !p.name.includes('admin')) ||
                    (p.name.includes('legal:') && p.name.includes('read'))
                ).map(p => p.name)
            },

            // MEMBER gets read permissions
            {
                roleName: 'MEMBER',
                permissions: createdPermissions.filter(p =>
                    p.name.includes('read') && !p.name.includes('admin')
                ).map(p => p.name)
            },

            // VIEWER gets only read permissions
            {
                roleName: 'VIEWER',
                permissions: createdPermissions.filter(p =>
                    p.name.includes('read') && !p.name.includes('admin')
                ).map(p => p.name)
            }
        ];

        for (const assignment of rolePermissionAssignments) {
            const role = createdRoles.find(r => r.name === assignment.roleName);
            if (role) {
                for (const permissionName of assignment.permissions) {
                    const permission = createdPermissions.find(p => p.name === permissionName);
                    if (permission) {
                        await prisma.rolePermission.upsert({
                            where: {
                                roleId_permissionId: {
                                    roleId: role.id,
                                    permissionId: permission.id
                                }
                            },
                            update: {},
                            create: {
                                roleId: role.id,
                                permissionId: permission.id
                            }
                        });
                    }
                }
            }
        }

        res.json({
            success: true,
            data: {
                roles: createdRoles.length,
                permissions: createdPermissions.length,
                assignments: rolePermissionAssignments.length
            },
            message: 'Default roles and permissions seeded successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to seed roles and permissions',
            error: error.message
        });
    }
});

module.exports = router;