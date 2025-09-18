#!/usr/bin/env python3
"""
RBAC Setup using Python - Direct Database Connection
"""

import psycopg2
import bcrypt
from datetime import datetime, timezone

# Database connection
DATABASE_URL = "postgresql://smartstart_user:smartstart_password@postgres:5432/smartstart_db"

def setup_rbac_system():
    """Set up the complete RBAC system"""
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("=== Setting up RBAC System ===")
        
        # 1. Create Roles
        print("1. Creating roles...")
        roles = [
            ('SUPER_ADMIN', 'Super Administrator', 'Full system access', 100),
            ('ADMIN', 'Administrator', 'High-level administrative access', 80),
            ('MANAGER', 'Manager', 'Management level access', 60),
            ('MEMBER', 'Member', 'Standard member access', 40),
            ('GUEST', 'Guest', 'Limited read-only access', 20)
        ]
        
        for role_id, name, description, level in roles:
            cursor.execute('''
                INSERT INTO "Role" (id, name, description, level, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            ''', (role_id, name, description, level, datetime.now(timezone.utc), datetime.now(timezone.utc)))
            print(f"  ✅ Role: {name}")
        
        # 2. Create Permissions
        print("2. Creating permissions...")
        permissions = [
            # User Management
            ('user.create', 'Create Users', 'user', 'create'),
            ('user.read', 'Read Users', 'user', 'read'),
            ('user.update', 'Update Users', 'user', 'update'),
            ('user.delete', 'Delete Users', 'user', 'delete'),
            ('user.list', 'List Users', 'user', 'list'),
            
            # Venture Management
            ('venture.create', 'Create Ventures', 'venture', 'create'),
            ('venture.read', 'Read Ventures', 'venture', 'read'),
            ('venture.update', 'Update Ventures', 'venture', 'update'),
            ('venture.delete', 'Delete Ventures', 'venture', 'delete'),
            ('venture.list', 'List Ventures', 'venture', 'list'),
            
            # BUZ Management
            ('buz.view', 'View BUZ', 'buz', 'view'),
            ('buz.transfer', 'Transfer BUZ', 'buz', 'transfer'),
            ('buz.stake', 'Stake BUZ', 'buz', 'stake'),
            ('buz.admin', 'Admin BUZ', 'buz', 'admin'),
            
            # System
            ('system.admin', 'System Admin', 'system', 'admin'),
            ('analytics.view', 'View Analytics', 'analytics', 'view')
        ]
        
        for perm_id, name, resource, action in permissions:
            cursor.execute('''
                INSERT INTO "Permission" (id, name, resource, action, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            ''', (perm_id, name, resource, action, datetime.now(timezone.utc), datetime.now(timezone.utc)))
            print(f"  ✅ Permission: {name}")
        
        # 3. Assign permissions to roles
        print("3. Assigning permissions to roles...")
        
        # SUPER_ADMIN gets all permissions
        cursor.execute('''
            INSERT INTO "RolePermission" (id, "roleId", "permissionId", "createdAt")
            SELECT 'rp_SUPER_ADMIN_' || p.id, 'SUPER_ADMIN', p.id, %s
            FROM "Permission" p
            ON CONFLICT (id) DO NOTHING
        ''', (datetime.now(timezone.utc),))
        
        # MEMBER gets basic permissions
        member_perms = ['user.read', 'venture.create', 'venture.read', 'venture.update', 'venture.list', 'buz.view', 'buz.transfer', 'buz.stake', 'analytics.view']
        for perm in member_perms:
            cursor.execute('''
                INSERT INTO "RolePermission" (id, "roleId", "permissionId", "createdAt")
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            ''', (f'rp_MEMBER_{perm}', 'MEMBER', perm, datetime.now(timezone.utc)))
        
        print("  ✅ Permission assignments completed")
        
        # 4. Create sample users
        print("4. Creating sample users...")
        
        sample_users = [
            {
                'id': 'super_admin_001',
                'email': 'admin@alicesolutionsgroup.com',
                'username': 'super_admin',
                'firstName': 'Udi',
                'lastName': 'Shkolnik',
                'name': 'Udi Shkolnik',
                'password': bcrypt.hashpw('SuperAdmin123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                'role': 'SUPER_ADMIN',
                'level': 'DRAGON',
                'status': 'ACTIVE'
            },
            {
                'id': 'member_001',
                'email': 'developer@alicesolutionsgroup.com',
                'username': 'dev_member',
                'firstName': 'Emily',
                'lastName': 'Rodriguez',
                'name': 'Emily Rodriguez',
                'password': bcrypt.hashpw('Member123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                'role': 'MEMBER',
                'level': 'OWLET',
                'status': 'ACTIVE'
            }
        ]
        
        now = datetime.now(timezone.utc)
        for user in sample_users:
            # Insert user
            cursor.execute('''
                INSERT INTO "User" (
                    id, email, username, name, "firstName", "lastName", 
                    password, role, level, status, "createdAt", "updatedAt",
                    "tenantId", xp, reputation, "lastActive", "totalPortfolioValue",
                    "activeProjectsCount", "totalContributions", "totalEquityOwned",
                    "averageEquityPerProject", "portfolioDiversity"
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                ) ON CONFLICT (id) DO NOTHING
            ''', (
                user['id'], user['email'], user['username'], user['name'],
                user['firstName'], user['lastName'], user['password'], user['role'],
                user['level'], user['status'], now, now, 'alice_solutions',
                1000, 100, now, 0.0, 0, 0, 0.0, 0.0, 0.0
            ))
            
            # Assign role
            cursor.execute('''
                INSERT INTO "UserRole" (id, "userId", "roleId", "assignedAt", "assignedBy")
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            ''', (f"ur_{user['id']}_{user['role']}", user['id'], user['role'], now, user['id']))
            
            print(f"  ✅ User: {user['name']} ({user['role']})")
        
        # Commit all changes
        conn.commit()
        
        print("\n=== RBAC Setup Complete ===")
        print("✅ Roles created")
        print("✅ Permissions created") 
        print("✅ Role-permission assignments created")
        print("✅ Sample users created")
        
        # Show summary
        cursor.execute('SELECT COUNT(*) FROM "Role"')
        role_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM "Permission"')
        perm_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM "User"')
        user_count = cursor.fetchone()[0]
        
        print(f"\nSummary:")
        print(f"- Roles: {role_count}")
        print(f"- Permissions: {perm_count}")
        print(f"- Users: {user_count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_rbac_system()
