-- SmartStart RBAC System Setup
-- Comprehensive Role-Based Access Control with User Management

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS "UserRole" CASCADE;
DROP TABLE IF EXISTS "RolePermission" CASCADE;
DROP TABLE IF EXISTS "Permission" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;

-- Create Permission table
CREATE TABLE "Permission" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Role table
CREATE TABLE "Role" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 0, -- Higher number = more privileges
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RolePermission junction table
CREATE TABLE "RolePermission" (
    id VARCHAR(50) PRIMARY KEY,
    "roleId" VARCHAR(50) NOT NULL REFERENCES "Role"(id) ON DELETE CASCADE,
    "permissionId" VARCHAR(50) NOT NULL REFERENCES "Permission"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("roleId", "permissionId")
);

-- Create UserRole junction table
CREATE TABLE "UserRole" (
    id VARCHAR(50) PRIMARY KEY,
    "userId" VARCHAR(50) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "roleId" VARCHAR(50) NOT NULL REFERENCES "Role"(id) ON DELETE CASCADE,
    "assignedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" VARCHAR(50) REFERENCES "User"(id),
    UNIQUE("userId", "roleId")
);

-- Insert Permissions
INSERT INTO "Permission" (id, name, description, resource, action) VALUES
-- User Management
('user.create', 'Create Users', 'Create new user accounts', 'user', 'create'),
('user.read', 'Read Users', 'View user information', 'user', 'read'),
('user.update', 'Update Users', 'Modify user information', 'user', 'update'),
('user.delete', 'Delete Users', 'Delete user accounts', 'user', 'delete'),
('user.list', 'List Users', 'View list of all users', 'user', 'list'),

-- Venture Management
('venture.create', 'Create Ventures', 'Create new ventures', 'venture', 'create'),
('venture.read', 'Read Ventures', 'View venture information', 'venture', 'read'),
('venture.update', 'Update Ventures', 'Modify venture information', 'venture', 'update'),
('venture.delete', 'Delete Ventures', 'Delete ventures', 'venture', 'delete'),
('venture.list', 'List Ventures', 'View list of all ventures', 'venture', 'list'),
('venture.approve', 'Approve Ventures', 'Approve venture applications', 'venture', 'approve'),

-- Team Management
('team.create', 'Create Teams', 'Create new teams', 'team', 'create'),
('team.read', 'Read Teams', 'View team information', 'team', 'read'),
('team.update', 'Update Teams', 'Modify team information', 'team', 'update'),
('team.delete', 'Delete Teams', 'Delete teams', 'team', 'delete'),
('team.list', 'List Teams', 'View list of all teams', 'team', 'list'),
('team.manage', 'Manage Teams', 'Full team management', 'team', 'manage'),

-- BUZ Token Management
('buz.view', 'View BUZ', 'View BUZ token information', 'buz', 'view'),
('buz.transfer', 'Transfer BUZ', 'Transfer BUZ tokens', 'buz', 'transfer'),
('buz.stake', 'Stake BUZ', 'Stake BUZ tokens', 'buz', 'stake'),
('buz.unstake', 'Unstake BUZ', 'Unstake BUZ tokens', 'buz', 'unstake'),
('buz.admin', 'Admin BUZ', 'Full BUZ token administration', 'buz', 'admin'),

-- Subscription Management
('subscription.create', 'Create Subscriptions', 'Create new subscriptions', 'subscription', 'create'),
('subscription.read', 'Read Subscriptions', 'View subscription information', 'subscription', 'read'),
('subscription.update', 'Update Subscriptions', 'Modify subscription information', 'subscription', 'update'),
('subscription.delete', 'Delete Subscriptions', 'Delete subscriptions', 'subscription', 'delete'),
('subscription.list', 'List Subscriptions', 'View list of all subscriptions', 'subscription', 'list'),
('subscription.manage', 'Manage Subscriptions', 'Full subscription management', 'subscription', 'manage'),

-- Legal Management
('legal.create', 'Create Legal Docs', 'Create legal documents', 'legal', 'create'),
('legal.read', 'Read Legal Docs', 'View legal documents', 'legal', 'read'),
('legal.update', 'Update Legal Docs', 'Modify legal documents', 'legal', 'update'),
('legal.delete', 'Delete Legal Docs', 'Delete legal documents', 'legal', 'delete'),
('legal.sign', 'Sign Legal Docs', 'Sign legal documents', 'legal', 'sign'),
('legal.approve', 'Approve Legal Docs', 'Approve legal documents', 'legal', 'approve'),

-- Analytics
('analytics.view', 'View Analytics', 'View analytics data', 'analytics', 'view'),
('analytics.export', 'Export Analytics', 'Export analytics data', 'analytics', 'export'),
('analytics.admin', 'Admin Analytics', 'Full analytics administration', 'analytics', 'admin'),

-- System Administration
('system.admin', 'System Admin', 'Full system administration', 'system', 'admin'),
('system.logs', 'View Logs', 'View system logs', 'system', 'logs'),
('system.settings', 'Manage Settings', 'Manage system settings', 'system', 'settings'),
('system.backup', 'System Backup', 'Perform system backups', 'system', 'backup'),

-- Umbrella System
('umbrella.view', 'View Umbrella', 'View umbrella relationships', 'umbrella', 'view'),
('umbrella.create', 'Create Umbrella', 'Create umbrella relationships', 'umbrella', 'create'),
('umbrella.update', 'Update Umbrella', 'Update umbrella relationships', 'umbrella', 'update'),
('umbrella.delete', 'Delete Umbrella', 'Delete umbrella relationships', 'umbrella', 'delete'),

-- Journey Management
('journey.view', 'View Journey', 'View user journey progress', 'journey', 'view'),
('journey.update', 'Update Journey', 'Update user journey progress', 'journey', 'update'),
('journey.admin', 'Admin Journey', 'Full journey administration', 'journey', 'admin');

-- Insert Roles
INSERT INTO "Role" (id, name, description, level) VALUES
('SUPER_ADMIN', 'Super Administrator', 'Full system access with all permissions', 100),
('ADMIN', 'Administrator', 'High-level administrative access', 80),
('MANAGER', 'Manager', 'Management level access for teams and ventures', 60),
('MEMBER', 'Member', 'Standard member access', 40),
('GUEST', 'Guest', 'Limited read-only access', 20);

-- Assign Permissions to Roles
-- SUPER_ADMIN gets all permissions
INSERT INTO "RolePermission" (id, "roleId", "permissionId")
SELECT 
    'rp_' || "Role".id || '_' || "Permission".id,
    "Role".id,
    "Permission".id
FROM "Role", "Permission"
WHERE "Role".id = 'SUPER_ADMIN';

-- ADMIN gets most permissions except system admin
INSERT INTO "RolePermission" (id, "roleId", "permissionId")
SELECT 
    'rp_' || "Role".id || '_' || "Permission".id,
    "Role".id,
    "Permission".id
FROM "Role", "Permission"
WHERE "Role".id = 'ADMIN'
AND "Permission".id NOT IN ('system.admin', 'system.backup');

-- MANAGER gets management permissions
INSERT INTO "RolePermission" (id, "roleId", "permissionId")
SELECT 
    'rp_' || "Role".id || '_' || "Permission".id,
    "Role".id,
    "Permission".id
FROM "Role", "Permission"
WHERE "Role".id = 'MANAGER'
AND "Permission".id IN (
    'user.read', 'user.list',
    'venture.create', 'venture.read', 'venture.update', 'venture.list', 'venture.approve',
    'team.create', 'team.read', 'team.update', 'team.list', 'team.manage',
    'buz.view', 'buz.transfer', 'buz.stake', 'buz.unstake',
    'subscription.read', 'subscription.list',
    'legal.read', 'legal.sign',
    'analytics.view',
    'umbrella.view', 'umbrella.create', 'umbrella.update',
    'journey.view', 'journey.update'
);

-- MEMBER gets basic permissions
INSERT INTO "RolePermission" (id, "roleId", "permissionId")
SELECT 
    'rp_' || "Role".id || '_' || "Permission".id,
    "Role".id,
    "Permission".id
FROM "Role", "Permission"
WHERE "Role".id = 'MEMBER'
AND "Permission".id IN (
    'user.read',
    'venture.create', 'venture.read', 'venture.update', 'venture.list',
    'team.read', 'team.list',
    'buz.view', 'buz.transfer', 'buz.stake', 'buz.unstake',
    'subscription.read',
    'legal.read', 'legal.sign',
    'analytics.view',
    'umbrella.view', 'umbrella.create',
    'journey.view'
);

-- GUEST gets read-only permissions
INSERT INTO "RolePermission" (id, "roleId", "permissionId")
SELECT 
    'rp_' || "Role".id || '_' || "Permission".id,
    "Role".id,
    "Permission".id
FROM "Role", "Permission"
WHERE "Role".id = 'GUEST'
AND "Permission".id IN (
    'user.read',
    'venture.read', 'venture.list',
    'team.read', 'team.list',
    'buz.view',
    'subscription.read',
    'legal.read',
    'analytics.view',
    'umbrella.view',
    'journey.view'
);

-- Create indexes for performance
CREATE INDEX idx_userrole_user_id ON "UserRole"("userId");
CREATE INDEX idx_userrole_role_id ON "UserRole"("roleId");
CREATE INDEX idx_rolepermission_role_id ON "RolePermission"("roleId");
CREATE INDEX idx_rolepermission_permission_id ON "RolePermission"("permissionId");

-- Update the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_permission_updated_at BEFORE UPDATE ON "Permission" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_updated_at BEFORE UPDATE ON "Role" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
