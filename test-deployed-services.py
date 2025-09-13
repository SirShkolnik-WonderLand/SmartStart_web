#!/usr/bin/env python3
"""
Test script for deployed SmartStart services
"""

import requests
import json
import time

def test_deployed_services():
    """Test the deployed services"""
    
    print("🚀 Testing Deployed SmartStart Services...")
    print("=" * 50)
    
    # Test Node.js API
    print("📡 Testing Node.js API...")
    try:
        response = requests.get("https://smartstart-api.onrender.com/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Node.js API: {data['status']} (v{data.get('version', 'unknown')})")
        else:
            print(f"❌ Node.js API failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Node.js API error: {e}")
    
    # Test Python Brain
    print("\n🧠 Testing Python Brain...")
    try:
        response = requests.get("https://smartstart-python-brain.onrender.com/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Python Brain: {data['status']} (v{data['version']})")
            print(f"🔧 Python Services: {len(data['python_services'])}")
            print(f"🌐 API Endpoints: {data['api_endpoints']['total_endpoints']}")
            
            # List services
            print("\n📋 Python Services:")
            for service, status in data['python_services'].items():
                print(f"  - {service}: {status}")
                
        else:
            print(f"❌ Python Brain failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Python Brain error: {e}")
    
    # Test Frontend
    print("\n🎨 Testing Frontend...")
    try:
        response = requests.get("https://smartstart-frontend.onrender.com", timeout=10)
        if response.status_code == 200:
            print("✅ Frontend: Accessible")
        else:
            print(f"❌ Frontend failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend error: {e}")
    
    print("\n🎉 Deployment testing completed!")
    print("\n🌐 Service URLs:")
    print("  - Node.js API: https://smartstart-api.onrender.com")
    print("  - Python Brain: https://smartstart-python-brain.onrender.com")
    print("  - Frontend: https://smartstart-frontend.onrender.com")

if __name__ == "__main__":
    test_deployed_services()
