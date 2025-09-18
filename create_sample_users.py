#!/usr/bin/env python3
"""
SmartStart Sample Users Creation Script
Creates sample users with different roles and permissions for testing
"""

import os
import psycopg2
import bcrypt
from datetime import datetime, timezone
import json

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://smartstart_user:smartstart_password@localhost:5432/smartstart_db')

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_user(cursor, user_data):
    """Create a user in the database"""
    try:
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
            )
        ''', (
            user_data['id'], user_data['email'], user_data['username'], user_data['name'],
            user_data['firstName'], user_data['lastName'], user_data['password'], user_data['role'],
            user_data['level'], user_data['status'], user_data['createdAt'], user_data['updatedAt'],
            user_data['tenantId'], user_data['xp'], user_data['reputation'], user_data['lastActive'],
            user_data['totalPortfolioValue'], user_data['activeProjectsCount'], user_data['totalContributions'],
            user_data['totalEquityOwned'], user_data['averageEquityPerProject'], user_data['portfolioDiversity']
        ))
        
        # Assign role
        cursor.execute('''
            INSERT INTO "UserRole" (id, "userId", "roleId", "assignedAt", "assignedBy")
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            f"ur_{user_data['id']}_{user_data['role']}",
            user_data['id'],
            user_data['role'],
            user_data['createdAt'],
            user_data['id']  # Self-assigned for initial users
        ))
        
        return True
    except Exception as e:
        print(f"Error creating user {user_data['email']}: {e}")
        return False

def main():
    """Create sample users with different roles"""
    
    # Sample users data
    sample_users = [
        {
            'id': 'super_admin_001',
            'email': 'admin@alicesolutionsgroup.com',
            'username': 'super_admin',
            'firstName': 'Udi',
            'lastName': 'Shkolnik',
            'name': 'Udi Shkolnik',
            'password': hash_password('SuperAdmin123!'),
            'role': 'SUPER_ADMIN',
            'level': 'DRAGON',
            'status': 'ACTIVE',
            'tenantId': 'alice_solutions',
            'xp': 10000,
            'reputation': 1000,
            'totalPortfolioValue': 1000000.0,
            'activeProjectsCount': 5,
            'totalContributions': 100,
            'totalEquityOwned': 50.0,
            'averageEquityPerProject': 10.0,
            'portfolioDiversity': 95.0
        },
        {
            'id': 'admin_001',
            'email': 'manager@alicesolutionsgroup.com',
            'username': 'admin_manager',
            'firstName': 'Sarah',
            'lastName': 'Johnson',
            'name': 'Sarah Johnson',
            'password': hash_password('Admin123!'),
            'role': 'ADMIN',
            'level': 'PHOENIX',
            'status': 'ACTIVE',
            'tenantId': 'alice_solutions',
            'xp': 5000,
            'reputation': 500,
            'totalPortfolioValue': 250000.0,
            'activeProjectsCount': 3,
            'totalContributions': 50,
            'totalEquityOwned': 25.0,
            'averageEquityPerProject': 8.3,
            'portfolioDiversity': 80.0
        },
        {
            'id': 'manager_001',
            'email': 'team.lead@alicesolutionsgroup.com',
            'username': 'team_lead',
            'firstName': 'Michael',
            'lastName': 'Chen',
            'name': 'Michael Chen',
            'password': hash_password('Manager123!'),
            'role': 'MANAGER',
            'level': 'EAGLE',
            'status': 'ACTIVE',
            'tenantId': 'alice_solutions',
            'xp': 3000,
            'reputation': 300,
            'totalPortfolioValue': 100000.0,
            'activeProjectsCount': 2,
            'totalContributions': 25,
            'totalEquityOwned': 15.0,
            'averageEquityPerProject': 7.5,
            'portfolioDiversity': 70.0
        },
        {
            'id': 'member_001',
            'email': 'developer@alicesolutionsgroup.com',
            'username': 'dev_member',
            'firstName': 'Emily',
            'lastName': 'Rodriguez',
            'name': 'Emily Rodriguez',
            'password': hash_password('Member123!'),
            'role': 'MEMBER',
            'level': 'OWLET',
            'status': 'ACTIVE',
            'tenantId': 'alice_solutions',
            'xp': 1000,
            'reputation': 100,
            'totalPortfolioValue': 25000.0,
            'activeProjectsCount': 1,
            'totalContributions': 10,
            'totalEquityOwned': 5.0,
            'averageEquityPerProject': 5.0,
            'portfolioDiversity': 50.0
        },
        {
            'id': 'member_002',
            'email': 'designer@alicesolutionsgroup.com',
            'username': 'design_member',
            'firstName': 'Alex',
            'lastName': 'Kim',
            'name': 'Alex Kim',
            'password': hash_password('Member123!'),
            'role': 'MEMBER',
            'level': 'OWLET',
            'status': 'ACTIVE',
            'tenantId': 'alice_solutions',
            'xp': 800,
            'reputation': 80,
            'totalPortfolioValue': 15000.0,
            'activeProjectsCount': 1,
            'totalContributions': 8,
            'totalEquityOwned': 3.0,
            'averageEquityPerProject': 3.0,
            'portfolioDiversity': 40.0
        },
        {
            'id': 'guest_001',
            'email': 'visitor@example.com',
            'username': 'guest_user',
            'firstName': 'John',
            'lastName': 'Doe',
            'name': 'John Doe',
            'password': hash_password('Guest123!'),
            'role': 'GUEST',
            'level': 'OWLET',
            'status': 'ACTIVE',
            'tenantId': 'default',
            'xp': 100,
            'reputation': 10,
            'totalPortfolioValue': 0.0,
            'activeProjectsCount': 0,
            'totalContributions': 0,
            'totalEquityOwned': 0.0,
            'averageEquityPerProject': 0.0,
            'portfolioDiversity': 0.0
        }
    ]
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("=== Creating Sample Users ===")
        
        # Add timestamps to all users
        now = datetime.now(timezone.utc).isoformat()
        for user in sample_users:
            user['createdAt'] = now
            user['updatedAt'] = now
            user['lastActive'] = now
        
        # Create users
        created_count = 0
        for user in sample_users:
            if create_user(cursor, user):
                created_count += 1
                print(f"✅ Created {user['role']}: {user['name']} ({user['email']})")
            else:
                print(f"❌ Failed to create {user['role']}: {user['name']} ({user['email']})")
        
        # Commit changes
        conn.commit()
        
        print(f"\n=== Summary ===")
        print(f"Successfully created {created_count} users")
        
        # Display user summary
        cursor.execute('''
            SELECT u.email, u.name, u.role, u.level, u.status, u.xp, u.reputation
            FROM "User" u
            ORDER BY u.role, u.xp DESC
        ''')
        
        users = cursor.fetchall()
        print(f"\n=== All Users in Database ===")
        print(f"{'Email':<35} {'Name':<20} {'Role':<12} {'Level':<8} {'Status':<8} {'XP':<6} {'Rep':<6}")
        print("-" * 100)
        
        for user in users:
            print(f"{user[0]:<35} {user[1]:<20} {user[2]:<12} {user[3]:<8} {user[4]:<8} {user[5]:<6} {user[6]:<6}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
