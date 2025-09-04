const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== ENHANCED RBAC SYSTEM FOR 1000+ USERS =====

// Health check for Enhanced RBAC system
router.get('/health', async (req, res) => {
    try {
        const roles = await prisma.role.count();
        const permissions = await prisma.permission.count();
        const accounts = await prisma.account.count();
        const rolePermissions = await prisma.rolePermission.count();
        
        res.json({
            success: true,
            message: 'Enhanced RBAC System is healthy',
            stats: { 
                roles, 
                permissions, 
                accounts, 
                rolePermissions,
                roleHierarchy: 'IMPLEMENTED',
                permissionMatrix: 'IMPLEMENTED',
                enterpriseFeatures: 'ACTIVE'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Enhanced RBAC health check failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Enhanced RBAC System health check failed', 
            error: error.message 
        });
    }
});

// Seed enterprise roles and permissions
router.post('/seed-enterprise-rbac', async (req, res) => {
    try {
        console.log('🚀 Seeding enterprise RBAC system...');

        const enterpriseRoles = [
            // Executive Roles
            { name: 'FOUNDER', description: 'Venture founder with full control', level: 95, isSystem: false },
            { name: 'CEO', description: 'Chief Executive Officer', level: 90, isSystem: false },
            { name: 'CTO', description: 'Chief Technology Officer', level: 85, isSystem: false },
            { name: 'CFO', description: 'Chief Financial Officer', level: 85, isSystem: false },
            { name: 'COO', description: 'Chief Operating Officer', level: 85, isSystem: false },
            
            // Management Roles
            { name: 'VP_ENGINEERING', description: 'Vice President of Engineering', level: 80, isSystem: false },
            { name: 'VP_MARKETING', description: 'Vice President of Marketing', level: 80, isSystem: false },
            { name: 'VP_SALES', description: 'Vice President of Sales', level: 80, isSystem: false },
            { name: 'DIRECTOR', description: 'Department Director', level: 75, isSystem: false },
            { name: 'MANAGER', description: 'Team Manager', level: 70, isSystem: false },
            
            // Professional Roles
            { name: 'SENIOR_DEVELOPER', description: 'Senior Software Developer', level: 60, isSystem: false },
            { name: 'DEVELOPER', description: 'Software Developer', level: 50, isSystem: false },
            { name: 'SENIOR_DESIGNER', description: 'Senior UI/UX Designer', level: 60, isSystem: false },
            { name: 'DESIGNER', description: 'UI/UX Designer', level: 50, isSystem: false },
            { name: 'PRODUCT_MANAGER', description: 'Product Manager', level: 65, isSystem: false },
            { name: 'MARKETING_MANAGER', description: 'Marketing Manager', level: 60, isSystem: false },
            { name: 'SALES_MANAGER', description: 'Sales Manager', level: 60, isSystem: false },
            { name: 'ANALYST', description: 'Data Analyst', level: 55, isSystem: false },
            
            // Support Roles
            { name: 'EMPLOYEE', description: 'Regular Employee', level: 40, isSystem: false },
            { name: 'INTERN', description: 'Intern', level: 20, isSystem: false },
            { name: 'FREELANCER', description: 'External Freelancer', level: 30, isSystem: false },
            { name: 'CONSULTANT', description: 'Business Consultant', level: 45, isSystem: false },
            { name: 'CONTRACTOR', description: 'External Contractor', level: 35, isSystem: false },
            
            // External Roles
            { name: 'INVESTOR', description: 'Investor', level: 70, isSystem: false },
            { name: 'ADVISOR', description: 'Business Advisor', level: 65, isSystem: false },
            { name: 'MENTOR', description: 'Mentor', level: 60, isSystem: false },
            { name: 'BOARD_MEMBER', description: 'Board Member', level: 85, isSystem: false },
            
            // Platform Roles
            { name: 'MODERATOR', description: 'Community Moderator', level: 50, isSystem: false },
            { name: 'SUPPORT_AGENT', description: 'Customer Support Agent', level: 30, isSystem: false },
            { name: 'AUDITOR', description: 'System Auditor', level: 75, isSystem: false },
            { name: 'COMPLIANCE_OFFICER', description: 'Compliance Officer', level: 70, isSystem: false },
            
            // Existing System Roles
            { name: 'SUPER_ADMIN', description: 'Full system access and control', level: 100, isSystem: true },
            { name: 'ADMIN', description: 'Administrative access to all features', level: 80, isSystem: true },
            { name: 'OWNER', description: 'Project owner with full project control', level: 60, isSystem: false },
            { name: 'CONTRIBUTOR', description: 'Active project contributor', level: 40, isSystem: false },
            { name: 'MEMBER', description: 'Regular platform member', level: 20, isSystem: false },
            { name: 'VIEWER', description: 'Read-only access', level: 10, isSystem: false },
            { name: 'GUEST', description: 'Limited guest access', level: 5, isSystem: false }
        ];

        const enterprisePermissions = [
            // User Management
            { name: 'user:read', resource: 'user', action: 'read', description: 'Read user information' },
            { name: 'user:write', resource: 'user', action: 'write', description: 'Modify user information' },
            { name: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' },
            { name: 'user:admin', resource: 'user', action: 'admin', description: 'Admin user operations' },
            { name: 'user:impersonate', resource: 'user', action: 'impersonate', description: 'Impersonate users' },
            { name: 'user:bulk_operations', resource: 'user', action: 'bulk_operations', description: 'Bulk user operations' },
            
            // Project Management
            { name: 'project:read', resource: 'project', action: 'read', description: 'Read project information' },
            { name: 'project:write', resource: 'project', action: 'write', description: 'Modify project information' },
            { name: 'project:delete', resource: 'project', action: 'delete', description: 'Delete projects' },
            { name: 'project:admin', resource: 'project', action: 'admin', description: 'Admin project operations' },
            { name: 'project:archive', resource: 'project', action: 'archive', description: 'Archive projects' },
            { name: 'project:restore', resource: 'project', action: 'restore', description: 'Restore archived projects' },
            
            // Company Management
            { name: 'company:read', resource: 'company', action: 'read', description: 'Read company information' },
            { name: 'company:write', resource: 'company', action: 'write', description: 'Modify company information' },
            { name: 'company:delete', resource: 'company', action: 'delete', description: 'Delete companies' },
            { name: 'company:admin', resource: 'company', action: 'admin', description: 'Admin company operations' },
            { name: 'company:merge', resource: 'company', action: 'merge', description: 'Merge companies' },
            { name: 'company:split', resource: 'company', action: 'split', description: 'Split companies' },
            
            // Team Management
            { name: 'team:read', resource: 'team', action: 'read', description: 'Read team information' },
            { name: 'team:write', resource: 'team', action: 'write', description: 'Modify team information' },
            { name: 'team:delete', resource: 'team', action: 'delete', description: 'Delete teams' },
            { name: 'team:admin', resource: 'team', action: 'admin', description: 'Admin team operations' },
            { name: 'team:invite', resource: 'team', action: 'invite', description: 'Invite team members' },
            { name: 'team:remove', resource: 'team', action: 'remove', description: 'Remove team members' },
            
            // Venture Management
            { name: 'venture:read', resource: 'venture', action: 'read', description: 'Read venture information' },
            { name: 'venture:write', resource: 'venture', action: 'write', description: 'Modify venture information' },
            { name: 'venture:delete', resource: 'venture', action: 'delete', description: 'Delete ventures' },
            { name: 'venture:admin', resource: 'venture', action: 'admin', description: 'Admin venture operations' },
            { name: 'venture:funding', resource: 'venture', action: 'funding', description: 'Manage venture funding' },
            { name: 'venture:legal', resource: 'venture', action: 'legal', description: 'Manage venture legal matters' },
            
            // Equity Management
            { name: 'equity:read', resource: 'equity', action: 'read', description: 'Read equity information' },
            { name: 'equity:write', resource: 'equity', action: 'write', description: 'Update equity allocations' },
            { name: 'equity:admin', resource: 'equity', action: 'admin', description: 'Full equity management' },
            { name: 'equity:vest', resource: 'equity', action: 'vest', description: 'Vest equity' },
            { name: 'equity:transfer', resource: 'equity', action: 'transfer', description: 'Transfer equity' },
            { name: 'equity:dilute', resource: 'equity', action: 'dilute', description: 'Dilute equity' },
            
            // Contract Management
            { name: 'contract:read', resource: 'contract', action: 'read', description: 'Read contracts' },
            { name: 'contract:write', resource: 'contract', action: 'write', description: 'Create and update contracts' },
            { name: 'contract:sign', resource: 'contract', action: 'sign', description: 'Sign contracts' },
            { name: 'contract:admin', resource: 'contract', action: 'admin', description: 'Full contract management' },
            { name: 'contract:template', resource: 'contract', action: 'template', description: 'Manage contract templates' },
            { name: 'contract:approve', resource: 'contract', action: 'approve', description: 'Approve contracts' },
            
            // Legal Management
            { name: 'legal:read', resource: 'legal', action: 'read', description: 'Read legal documents' },
            { name: 'legal:write', resource: 'legal', action: 'write', description: 'Modify legal documents' },
            { name: 'legal:sign', resource: 'legal', action: 'sign', description: 'Sign legal documents' },
            { name: 'legal:admin', resource: 'legal', action: 'admin', description: 'Full legal management' },
            { name: 'legal:compliance', resource: 'legal', action: 'compliance', description: 'Manage compliance' },
            { name: 'legal:audit', resource: 'legal', action: 'audit', description: 'Legal audit operations' },
            
            // Funding Management
            { name: 'funding:read', resource: 'funding', action: 'read', description: 'Read funding information' },
            { name: 'funding:write', resource: 'funding', action: 'write', description: 'Modify funding information' },
            { name: 'funding:admin', resource: 'funding', action: 'admin', description: 'Full funding management' },
            { name: 'funding:approve', resource: 'funding', action: 'approve', description: 'Approve funding rounds' },
            { name: 'funding:close', resource: 'funding', action: 'close', description: 'Close funding rounds' },
            
            // Subscription Management
            { name: 'subscription:read', resource: 'subscription', action: 'read', description: 'Read subscription information' },
            { name: 'subscription:write', resource: 'subscription', action: 'write', description: 'Modify subscriptions' },
            { name: 'subscription:admin', resource: 'subscription', action: 'admin', description: 'Admin subscription operations' },
            { name: 'subscription:cancel', resource: 'subscription', action: 'cancel', description: 'Cancel subscriptions' },
            { name: 'subscription:upgrade', resource: 'subscription', action: 'upgrade', description: 'Upgrade subscriptions' },
            
            // Billing Management
            { name: 'billing:read', resource: 'billing', action: 'read', description: 'Read billing information' },
            { name: 'billing:write', resource: 'billing', action: 'write', description: 'Modify billing information' },
            { name: 'billing:admin', resource: 'billing', action: 'admin', description: 'Admin billing operations' },
            { name: 'billing:refund', resource: 'billing', action: 'refund', description: 'Process refunds' },
            { name: 'billing:invoice', resource: 'billing', action: 'invoice', description: 'Generate invoices' },
            
            // Analytics Management
            { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'Read analytics data' },
            { name: 'analytics:write', resource: 'analytics', action: 'write', description: 'Modify analytics data' },
            { name: 'analytics:admin', resource: 'analytics', action: 'admin', description: 'Admin analytics operations' },
            { name: 'analytics:export', resource: 'analytics', action: 'export', description: 'Export analytics data' },
            { name: 'analytics:report', resource: 'analytics', action: 'report', description: 'Generate reports' },
            
            // Notification Management
            { name: 'notification:read', resource: 'notification', action: 'read', description: 'Read notifications' },
            { name: 'notification:write', resource: 'notification', action: 'write', description: 'Send notifications' },
            { name: 'notification:admin', resource: 'notification', action: 'admin', description: 'Admin notification operations' },
            { name: 'notification:template', resource: 'notification', action: 'template', description: 'Manage notification templates' },
            
            // Audit Management
            { name: 'audit:read', resource: 'audit', action: 'read', description: 'Read audit logs' },
            { name: 'audit:write', resource: 'audit', action: 'write', description: 'Write audit logs' },
            { name: 'audit:admin', resource: 'audit', action: 'admin', description: 'Admin audit operations' },
            { name: 'audit:export', resource: 'audit', action: 'export', description: 'Export audit logs' },
            
            // Integration Management
            { name: 'integration:read', resource: 'integration', action: 'read', description: 'Read integration information' },
            { name: 'integration:write', resource: 'integration', action: 'write', description: 'Modify integrations' },
            { name: 'integration:admin', resource: 'integration', action: 'admin', description: 'Admin integration operations' },
            { name: 'integration:webhook', resource: 'integration', action: 'webhook', description: 'Manage webhooks' },
            
            // API Management
            { name: 'api:read', resource: 'api', action: 'read', description: 'Read API information' },
            { name: 'api:write', resource: 'api', action: 'write', description: 'Modify API settings' },
            { name: 'api:admin', resource: 'api', action: 'admin', description: 'Admin API operations' },
            { name: 'api:rate_limit', resource: 'api', action: 'rate_limit', description: 'Manage API rate limits' },
            
            // Security Management
            { name: 'security:read', resource: 'security', action: 'read', description: 'Read security information' },
            { name: 'security:write', resource: 'security', action: 'write', description: 'Modify security settings' },
            { name: 'security:admin', resource: 'security', action: 'admin', description: 'Admin security operations' },
            { name: 'security:audit', resource: 'security', action: 'audit', description: 'Security audit operations' },
            
            // System Management
            { name: 'system:read', resource: 'system', action: 'read', description: 'Read system information' },
            { name: 'system:write', resource: 'system', action: 'write', description: 'Modify system settings' },
            { name: 'system:admin', resource: 'system', action: 'admin', description: 'Admin system operations' },
            { name: 'system:backup', resource: 'system', action: 'backup', description: 'System backup operations' },
            { name: 'system:restore', resource: 'system', action: 'restore', description: 'System restore operations' },
            { name: 'system:maintenance', resource: 'system', action: 'maintenance', description: 'System maintenance operations' }
        ];

        await prisma.$transaction(async (tx) => {
            // Create or update roles
            const createdRoles = await Promise.all(enterpriseRoles.map(data =>
                tx.role.upsert({
                    where: { name: data.name },
                    update: data,
                    create: data,
                })
            ));

            // Create or update permissions
            const createdPermissions = await Promise.all(enterprisePermissions.map(data =>
                tx.permission.upsert({
                    where: { name: data.name },
                    update: data,
                    create: data,
                })
            ));

            // Assign permissions to roles based on hierarchy
            await assignPermissionsToRoles(tx, createdRoles, createdPermissions);

            const rolesCount = await tx.role.count();
            const permissionsCount = await tx.permission.count();
            const assignmentsCount = await tx.rolePermission.count();

            res.json({
                success: true,
                data: {
                    roles: rolesCount,
                    permissions: permissionsCount,
                    assignments: assignmentsCount
                },
                message: 'Enterprise RBAC system seeded successfully'
            });
        });
    } catch (error) {
        console.error('Error seeding enterprise RBAC:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to seed enterprise RBAC system', 
            error: error.message 
        });
    }
});

// Helper function to assign permissions to roles
async function assignPermissionsToRoles(tx, roles, permissions) {
    const rolePermissionMap = {
        'SUPER_ADMIN': permissions.map(p => p.name), // All permissions
        'ADMIN': permissions.filter(p => !p.name.includes('system:') && !p.name.includes('audit:')).map(p => p.name),
        'FOUNDER': [
            'user:read', 'user:write', 'user:admin',
            'project:read', 'project:write', 'project:admin', 'project:delete',
            'company:read', 'company:write', 'company:admin', 'company:delete',
            'team:read', 'team:write', 'team:admin', 'team:delete', 'team:invite', 'team:remove',
            'venture:read', 'venture:write', 'venture:admin', 'venture:delete', 'venture:funding', 'venture:legal',
            'equity:read', 'equity:write', 'equity:admin', 'equity:vest', 'equity:transfer', 'equity:dilute',
            'contract:read', 'contract:write', 'contract:sign', 'contract:admin', 'contract:template', 'contract:approve',
            'legal:read', 'legal:write', 'legal:sign', 'legal:admin', 'legal:compliance', 'legal:audit',
            'funding:read', 'funding:write', 'funding:admin', 'funding:approve', 'funding:close',
            'subscription:read', 'subscription:write', 'subscription:admin', 'subscription:cancel', 'subscription:upgrade',
            'billing:read', 'billing:write', 'billing:admin', 'billing:refund', 'billing:invoice',
            'analytics:read', 'analytics:write', 'analytics:admin', 'analytics:export', 'analytics:report',
            'notification:read', 'notification:write', 'notification:admin', 'notification:template',
            'integration:read', 'integration:write', 'integration:admin', 'integration:webhook',
            'api:read', 'api:write', 'api:admin', 'api:rate_limit',
            'security:read', 'security:write', 'security:admin', 'security:audit'
        ],
        'CEO': [
            'user:read', 'user:write',
            'project:read', 'project:write', 'project:admin',
            'company:read', 'company:write', 'company:admin',
            'team:read', 'team:write', 'team:admin', 'team:invite', 'team:remove',
            'venture:read', 'venture:write', 'venture:admin', 'venture:funding',
            'equity:read', 'equity:write', 'equity:admin',
            'contract:read', 'contract:write', 'contract:sign', 'contract:admin',
            'legal:read', 'legal:write', 'legal:admin',
            'funding:read', 'funding:write', 'funding:admin', 'funding:approve',
            'subscription:read', 'subscription:write', 'subscription:admin',
            'billing:read', 'billing:write', 'billing:admin',
            'analytics:read', 'analytics:write', 'analytics:admin', 'analytics:export', 'analytics:report',
            'notification:read', 'notification:write', 'notification:admin',
            'integration:read', 'integration:write', 'integration:admin'
        ],
        'CTO': [
            'user:read', 'user:write',
            'project:read', 'project:write', 'project:admin',
            'team:read', 'team:write', 'team:admin', 'team:invite', 'team:remove',
            'venture:read', 'venture:write',
            'contract:read', 'contract:write', 'contract:sign',
            'analytics:read', 'analytics:write', 'analytics:admin', 'analytics:export', 'analytics:report',
            'notification:read', 'notification:write', 'notification:admin',
            'integration:read', 'integration:write', 'integration:admin', 'integration:webhook',
            'api:read', 'api:write', 'api:admin', 'api:rate_limit',
            'security:read', 'security:write', 'security:admin'
        ],
        'CFO': [
            'user:read',
            'project:read',
            'company:read', 'company:write',
            'venture:read', 'venture:write', 'venture:funding',
            'equity:read', 'equity:write', 'equity:admin',
            'contract:read', 'contract:write', 'contract:sign',
            'legal:read', 'legal:write',
            'funding:read', 'funding:write', 'funding:admin', 'funding:approve', 'funding:close',
            'subscription:read', 'subscription:write', 'subscription:admin',
            'billing:read', 'billing:write', 'billing:admin', 'billing:refund', 'billing:invoice',
            'analytics:read', 'analytics:write', 'analytics:export', 'analytics:report'
        ],
        'MANAGER': [
            'user:read', 'user:write',
            'project:read', 'project:write',
            'team:read', 'team:write', 'team:invite', 'team:remove',
            'venture:read', 'venture:write',
            'contract:read', 'contract:write', 'contract:sign',
            'analytics:read', 'analytics:write', 'analytics:export',
            'notification:read', 'notification:write'
        ],
        'DEVELOPER': [
            'user:read',
            'project:read', 'project:write',
            'team:read',
            'venture:read',
            'contract:read', 'contract:sign',
            'analytics:read',
            'notification:read'
        ],
        'EMPLOYEE': [
            'user:read', 'user:write',
            'project:read', 'project:write',
            'team:read',
            'venture:read',
            'contract:read', 'contract:sign',
            'analytics:read',
            'notification:read'
        ],
        'FREELANCER': [
            'user:read', 'user:write',
            'project:read',
            'team:read',
            'venture:read',
            'contract:read', 'contract:sign',
            'analytics:read',
            'notification:read'
        ],
        'INVESTOR': [
            'user:read',
            'project:read',
            'venture:read', 'venture:funding',
            'equity:read',
            'contract:read',
            'funding:read',
            'analytics:read', 'analytics:export',
            'notification:read'
        ],
        'ADVISOR': [
            'user:read',
            'project:read',
            'venture:read',
            'contract:read',
            'analytics:read',
            'notification:read'
        ],
        'VIEWER': [
            'user:read',
            'project:read',
            'team:read',
            'venture:read',
            'analytics:read',
            'notification:read'
        ],
        'GUEST': [
            'user:read',
            'project:read',
            'notification:read'
        ]
    };

    for (const [roleName, permissionNames] of Object.entries(rolePermissionMap)) {
        const role = roles.find(r => r.name === roleName);
        if (role) {
            for (const permissionName of permissionNames) {
                const permission = permissions.find(p => p.name === permissionName);
                if (permission) {
                    await tx.rolePermission.upsert({
                        where: {
                            roleId_permissionId: {
                                roleId: role.id,
                                permissionId: permission.id
                            }
                        },
                        update: {},
                        create: {
                            roleId: role.id,
                            permissionId: permission.id,
                            grantedBy: 'system'
                        }
                    });
                }
            }
        }
    }
}

// Get role hierarchy
router.get('/hierarchy', async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { level: 'desc' },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        const hierarchy = roles.map(role => ({
            name: role.name,
            description: role.description,
            level: role.level,
            isSystem: role.isSystem,
            permissionCount: role.rolePermissions.length,
            permissions: role.rolePermissions.map(rp => rp.permission.name)
        }));

        res.json({
            success: true,
            data: hierarchy,
            message: 'Role hierarchy retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting role hierarchy:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve role hierarchy', 
            error: error.message 
        });
    }
});

// Get permission matrix
router.get('/permission-matrix', async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        const permissions = await prisma.permission.findMany();
        
        const matrix = roles.map(role => {
            const rolePermissions = role.rolePermissions.map(rp => rp.permission.name);
            const permissionMap = {};
            
            permissions.forEach(permission => {
                permissionMap[permission.name] = rolePermissions.includes(permission.name);
            });

            return {
                role: role.name,
                level: role.level,
                permissions: permissionMap
            };
        });

        res.json({
            success: true,
            data: {
                roles: roles.map(r => ({ name: r.name, level: r.level })),
                permissions: permissions.map(p => ({ name: p.name, resource: p.resource, action: p.action })),
                matrix: matrix
            },
            message: 'Permission matrix retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting permission matrix:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve permission matrix', 
            error: error.message 
        });
    }
});

// Bulk role assignment
router.post('/bulk-assign-roles', async (req, res) => {
    try {
        const { assignments } = req.body; // [{ userId, roleId }, ...]
        
        if (!Array.isArray(assignments)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Assignments must be an array' 
            });
        }

        const results = await Promise.all(assignments.map(async (assignment) => {
            try {
                const userAccount = await prisma.account.upsert({
                    where: { userId: assignment.userId },
                    update: { roleId: assignment.roleId },
                    create: { 
                        userId: assignment.userId, 
                        roleId: assignment.roleId, 
                        isActive: true 
                    },
                    include: {
                        role: true
                    }
                });

                return {
                    userId: assignment.userId,
                    success: true,
                    role: userAccount.role.name
                };
            } catch (error) {
                return {
                    userId: assignment.userId,
                    success: false,
                    error: error.message
                };
            }
        }));

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        res.json({
            success: true,
            data: {
                total: assignments.length,
                successful: successCount,
                failed: failureCount,
                results: results
            },
            message: `Bulk role assignment completed: ${successCount} successful, ${failureCount} failed`
        });
    } catch (error) {
        console.error('Error in bulk role assignment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to perform bulk role assignment', 
            error: error.message 
        });
    }
});

// Get users by role
router.get('/roles/:roleName/users', async (req, res) => {
    try {
        const { roleName } = req.params;
        
        const role = await prisma.role.findUnique({
            where: { name: roleName },
            include: {
                accounts: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                level: true,
                                xp: true,
                                status: true,
                                lastActive: true
                            }
                        }
                    }
                }
            }
        });

        if (!role) {
            return res.status(404).json({ 
                success: false, 
                message: 'Role not found' 
            });
        }

        const users = role.accounts.map(account => ({
            ...account.user,
            accountId: account.id,
            isActive: account.isActive,
            assignedAt: account.createdAt
        }));

        res.json({
            success: true,
            data: {
                role: {
                    name: role.name,
                    description: role.description,
                    level: role.level
                },
                users: users,
                count: users.length
            },
            message: `Users with role ${roleName} retrieved successfully`
        });
    } catch (error) {
        console.error('Error getting users by role:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve users by role', 
            error: error.message 
        });
    }
});

module.exports = router;
