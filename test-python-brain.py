#!/usr/bin/env python3
"""
Test script for SmartStart Python Brain
"""

import requests
import json
import time

def test_python_brain():
    """Test the Python Brain service"""
    
    # Test health endpoint
    print("🧠 Testing Python Brain Health...")
    try:
        response = requests.get("http://localhost:5000/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"📊 Version: {data['version']}")
            print(f"🔧 Python Services: {len(data['python_services'])}")
            print(f"🌐 API Endpoints: {data['api_endpoints']['total_endpoints']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test user service
    print("\n👥 Testing User Service...")
    try:
        test_user = {
            "name": "Test User",
            "email": "test@smartstart.com",
            "password": "test123",
            "role": "FOUNDER"
        }
        response = requests.post("http://localhost:5000/users/create", 
                               json=test_user, timeout=10)
        if response.status_code == 200:
            print("✅ User service working")
        else:
            print(f"⚠️ User service response: {response.status_code}")
    except Exception as e:
        print(f"⚠️ User service error: {e}")
    
    # Test venture service
    print("\n🏢 Testing Venture Service...")
    try:
        test_venture = {
            "name": "Test Venture",
            "description": "A test venture",
            "owner_id": "test_user_123",
            "type": "TECHNOLOGY"
        }
        response = requests.post("http://localhost:5000/ventures/create", 
                               json=test_venture, timeout=10)
        if response.status_code == 200:
            print("✅ Venture service working")
        else:
            print(f"⚠️ Venture service response: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Venture service error: {e}")
    
    # Test gamification service
    print("\n🎮 Testing Gamification Service...")
    try:
        test_xp = {
            "user_id": "test_user_123",
            "activity": "VENTURE_CREATED",
            "metadata": {"venture_id": "test_venture_123"}
        }
        response = requests.post("http://localhost:5000/gamification/xp/award", 
                               json=test_xp, timeout=10)
        if response.status_code == 200:
            print("✅ Gamification service working")
        else:
            print(f"⚠️ Gamification service response: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Gamification service error: {e}")
    
    # Test BUZ token service
    print("\n💰 Testing BUZ Token Service...")
    try:
        response = requests.get("http://localhost:5000/tokens/balance/test_user_123", timeout=10)
        if response.status_code == 200:
            print("✅ BUZ Token service working")
        else:
            print(f"⚠️ BUZ Token service response: {response.status_code}")
    except Exception as e:
        print(f"⚠️ BUZ Token service error: {e}")
    
    print("\n🎉 Python Brain testing completed!")
    return True

if __name__ == "__main__":
    print("🚀 Starting SmartStart Python Brain Test...")
    print("Make sure the Python Brain is running on http://localhost:5000")
    print("=" * 50)
    
    test_python_brain()
