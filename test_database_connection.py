#!/usr/bin/env python3
"""
Test database connection and data retrieval
"""

import sys
import os
sys.path.append('/Users/udishkolnik/S1/python-services')

from database_connector import db

def test_database_connection():
    """Test database connection and data retrieval"""
    print("🧪 Testing database connection...")
    
    try:
        # Test user data
        print("\n👤 Testing user data...")
        user = db.get_user_by_id('udi-super-admin-001')
        if user:
            print(f"✅ User found: {user['name']} ({user['email']})")
            print(f"   Level: {user.get('level', 'Unknown')}")
            print(f"   XP: {user.get('xp', 0)}")
        else:
            print("❌ User not found")
        
        # Test ventures data
        print("\n🏢 Testing ventures data...")
        ventures = db.get_user_ventures('udi-super-admin-001')
        print(f"✅ Found {len(ventures)} ventures for user")
        for venture in ventures:
            print(f"   - {venture['name']}: {venture['description']}")
        
        # Test BUZ token data
        print("\n💰 Testing BUZ token data...")
        buz_data = db.get_user_buz_tokens('udi-super-admin-001')
        if buz_data:
            print(f"✅ BUZ balance: {buz_data['balance']}")
            print(f"   Staked: {buz_data['stakedBalance']}")
        else:
            print("❌ No BUZ token data found")
        
        # Test analytics
        print("\n📊 Testing analytics...")
        analytics = db.get_user_analytics('udi-super-admin-001')
        print(f"✅ Analytics: {analytics}")
        
        print("\n🎉 Database connection test completed successfully!")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_database_connection()
