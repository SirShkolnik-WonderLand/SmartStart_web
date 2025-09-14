#!/usr/bin/env python3
"""
Test direct database connection
"""

import psycopg2
from psycopg2.extras import RealDictCursor

def test_database():
    """Test direct database connection"""
    try:
        # Database connection parameters
        conn_params = {
            'host': 'dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com',
            'port': 5432,
            'database': 'smartstart_db_4ahd',
            'user': 'smartstart_db_4ahd_user',
            'password': 'LYcgYXd9w9pBB4HPuNretjMOOlKxWP48'
        }
        
        print("🔗 Connecting to database...")
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Database connected successfully!")
        
        # Test basic queries
        cursor.execute("SELECT COUNT(*) FROM \"User\"")
        user_count = cursor.fetchone()['count']
        print(f"✅ Users: {user_count}")
        
        cursor.execute("SELECT COUNT(*) FROM \"Role\"")
        role_count = cursor.fetchone()['count']
        print(f"✅ Roles: {role_count}")
        
        cursor.execute("SELECT COUNT(*) FROM \"JourneyStage\"")
        stage_count = cursor.fetchone()['count']
        print(f"✅ Journey Stages: {stage_count}")
        
        cursor.execute("SELECT COUNT(*) FROM \"LegalDocumentTemplate\"")
        legal_count = cursor.fetchone()['count']
        print(f"✅ Legal Templates: {legal_count}")
        
        # Test a simple query
        cursor.execute("SELECT id, email, name FROM \"User\" LIMIT 3")
        users = cursor.fetchall()
        print(f"✅ Sample users: {len(users)}")
        for user in users:
            print(f"   - {user['email']} ({user['name']})")
        
        cursor.close()
        conn.close()
        
        print("🎉 Database test completed successfully!")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")

if __name__ == "__main__":
    test_database()
