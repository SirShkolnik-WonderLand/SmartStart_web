#!/usr/bin/env python3
import os
import psycopg2
import json
from datetime import datetime

# Database connection
DATABASE_URL = "postgresql://smartstart_db_4ahd_user:LYcgYXd9w9pBB4HPuNretjMOOlKxWP48@dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com/smartstart_db_4ahd"

try:
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get all users
    cursor.execute('''
        SELECT id, email, "firstName", "lastName", name, role, level, status, 
               "createdAt", "lastActive", xp, reputation, "totalPortfolioValue"
        FROM "User" 
        ORDER BY "createdAt" DESC
    ''')
    
    users = cursor.fetchall()
    
    print("=== ALL USERS IN DATABASE ===")
    print(f"Total users: {len(users)}")
    print("=" * 80)
    
    for i, user in enumerate(users, 1):
        print(f"\n{i}. User ID: {user[0]}")
        print(f"   Email: {user[1]}")
        print(f"   Name: {user[2]} {user[3]} ({user[4]})")
        print(f"   Role: {user[5]} | Level: {user[6]} | Status: {user[7]}")
        print(f"   Created: {user[8]}")
        print(f"   Last Active: {user[9]}")
        print(f"   XP: {user[10]} | Reputation: {user[11]}")
        print(f"   Portfolio Value: ${user[12]}")
        print("-" * 40)
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
