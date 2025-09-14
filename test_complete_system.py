#!/usr/bin/env python3
"""
Complete SmartStart System Test
Test all functionality from registration to venture creation
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
PYTHON_BRAIN_URL = "https://smartstart-python-brain.onrender.com"
NODEJS_API_URL = "https://smartstart-api.onrender.com"
FRONTEND_URL = "https://smartstart-frontend.onrender.com"

def test_service_health():
    """Test all services are healthy"""
    print("🔍 Testing service health...")
    
    services = {
        "Python Brain": f"{PYTHON_BRAIN_URL}/health",
        "Node.js API": f"{NODEJS_API_URL}/health",
        "Frontend": f"{FRONTEND_URL}"
    }
    
    for name, url in services.items():
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"✅ {name}: Healthy")
            else:
                print(f"❌ {name}: Unhealthy ({response.status_code})")
        except Exception as e:
            print(f"❌ {name}: Error - {e}")

def test_python_brain_services():
    """Test Python Brain services"""
    print("\n🧠 Testing Python Brain services...")
    
    # Test RBAC service
    try:
        response = requests.get(f"{PYTHON_BRAIN_URL}/rbac/roles", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ RBAC Service: {len(data.get('data', []))} roles found")
        else:
            print(f"❌ RBAC Service: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ RBAC Service: Error - {e}")
    
    # Test CRUD service
    try:
        response = requests.get(f"{PYTHON_BRAIN_URL}/crud/User?limit=5", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ CRUD Service: {data.get('count', 0)} users found")
        else:
            print(f"❌ CRUD Service: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ CRUD Service: Error - {e}")
    
    # Test User Journey service
    try:
        response = requests.get(f"{PYTHON_BRAIN_URL}/journey/stages", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User Journey Service: {len(data.get('data', []))} stages found")
        else:
            print(f"❌ User Journey Service: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ User Journey Service: Error - {e}")

def test_database_connection():
    """Test direct database connection"""
    print("\n🗄️ Testing database connection...")
    
    try:
        import psycopg2
        
        # Database connection parameters
        conn_params = {
            'host': 'dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com',
            'port': 5432,
            'database': 'smartstart_db_4ahd',
            'user': 'smartstart_db_4ahd_user',
            'password': 'LYcgYXd9w9pBB4HPuNretjMOOlKxWP48'
        }
        
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        
        # Test basic queries
        cursor.execute("SELECT COUNT(*) FROM \"User\"")
        user_count = cursor.fetchone()[0]
        print(f"✅ Database: {user_count} users found")
        
        cursor.execute("SELECT COUNT(*) FROM \"Role\"")
        role_count = cursor.fetchone()[0]
        print(f"✅ Database: {role_count} roles found")
        
        cursor.execute("SELECT COUNT(*) FROM \"JourneyStage\"")
        stage_count = cursor.fetchone()[0]
        print(f"✅ Database: {stage_count} journey stages found")
        
        cursor.execute("SELECT COUNT(*) FROM \"LegalDocumentTemplate\"")
        legal_count = cursor.fetchone()[0]
        print(f"✅ Database: {legal_count} legal templates found")
        
        cursor.close()
        conn.close()
        
    except ImportError:
        print("❌ Database: psycopg2 not installed")
    except Exception as e:
        print(f"❌ Database: Error - {e}")

def test_user_registration():
    """Test user registration flow"""
    print("\n👤 Testing user registration...")
    
    # Test data
    test_user = {
        "email": f"test_{int(time.time())}@example.com",
        "password": "TestPassword123!",
        "name": "Test User"
    }
    
    try:
        # Test Python Brain registration
        response = requests.post(f"{PYTHON_BRAIN_URL}/auth/register", 
                               json=test_user, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ User Registration: Success - {data['user']['email']}")
                return data['user']['id']
            else:
                print(f"❌ User Registration: Failed - {data.get('error')}")
        else:
            print(f"❌ User Registration: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ User Registration: Error - {e}")
    
    return None

def test_user_login(user_id):
    """Test user login flow"""
    print("\n🔐 Testing user login...")
    
    login_data = {
        "email": f"test_{int(time.time())}@example.com",
        "password": "TestPassword123!"
    }
    
    try:
        response = requests.post(f"{PYTHON_BRAIN_URL}/auth/login", 
                               json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ User Login: Success - Token received")
                return data.get('token')
            else:
                print(f"❌ User Login: Failed - {data.get('error')}")
        else:
            print(f"❌ User Login: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ User Login: Error - {e}")
    
    return None

def test_rbac_system(user_id):
    """Test RBAC system"""
    print("\n🔐 Testing RBAC system...")
    
    try:
        # Test get user roles
        response = requests.get(f"{PYTHON_BRAIN_URL}/rbac/user/{user_id}/roles", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                roles = data.get('data', [])
                print(f"✅ RBAC: User has {len(roles)} roles")
            else:
                print(f"❌ RBAC: Failed to get roles")
        else:
            print(f"❌ RBAC: HTTP {response.status_code}")
        
        # Test permission check
        permission_data = {"resource": "user", "action": "read"}
        response = requests.post(f"{PYTHON_BRAIN_URL}/rbac/user/{user_id}/permission", 
                               json=permission_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                has_permission = data.get('has_permission', False)
                print(f"✅ RBAC: Permission check - {has_permission}")
            else:
                print(f"❌ RBAC: Permission check failed")
        else:
            print(f"❌ RBAC: Permission check HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ RBAC: Error - {e}")

def test_user_journey(user_id):
    """Test user journey system"""
    print("\n🚀 Testing user journey...")
    
    try:
        # Test get journey progress
        response = requests.get(f"{PYTHON_BRAIN_URL}/journey/user/{user_id}/progress", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                progress = data.get('data', {})
                print(f"✅ User Journey: {progress.get('completed_stages', 0)}/{progress.get('total_stages', 0)} stages completed")
            else:
                print(f"❌ User Journey: Failed to get progress")
        else:
            print(f"❌ User Journey: HTTP {response.status_code}")
        
        # Test get current stage
        response = requests.get(f"{PYTHON_BRAIN_URL}/journey/user/{user_id}/current-stage", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                stage = data.get('data')
                if stage:
                    print(f"✅ User Journey: Current stage - {stage.get('name', 'Unknown')}")
                else:
                    print(f"✅ User Journey: No current stage")
            else:
                print(f"❌ User Journey: Failed to get current stage")
        else:
            print(f"❌ User Journey: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ User Journey: Error - {e}")

def test_legal_system(user_id):
    """Test legal system"""
    print("\n⚖️ Testing legal system...")
    
    try:
        # Test get legal documents
        response = requests.get(f"{PYTHON_BRAIN_URL}/legal/user/{user_id}/documents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                docs = data.get('data', {}).get('documents', [])
                print(f"✅ Legal System: {len(docs)} documents available")
            else:
                print(f"❌ Legal System: Failed to get documents")
        else:
            print(f"❌ Legal System: HTTP {response.status_code}")
        
        # Test compliance check
        response = requests.get(f"{PYTHON_BRAIN_URL}/legal/user/{user_id}/compliance", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                compliance = data.get('data', {})
                print(f"✅ Legal System: Compliance - {compliance.get('compliance_status', 'Unknown')}")
            else:
                print(f"❌ Legal System: Failed to check compliance")
        else:
            print(f"❌ Legal System: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Legal System: Error - {e}")

def test_venture_creation(user_id):
    """Test venture creation"""
    print("\n🚀 Testing venture creation...")
    
    venture_data = {
        "owner_id": user_id,
        "name": f"Test Venture {int(time.time())}",
        "summary": "A test venture created by the system test",
        "equityModel": "EQUALITY"
    }
    
    try:
        response = requests.post(f"{PYTHON_BRAIN_URL}/venture/create", 
                               json=venture_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                venture = data.get('data', {})
                print(f"✅ Venture Creation: Success - {venture.get('name', 'Unknown')}")
                return venture.get('id')
            else:
                print(f"❌ Venture Creation: Failed - {data.get('error')}")
        else:
            print(f"❌ Venture Creation: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Venture Creation: Error - {e}")
    
    return None

def test_crud_operations():
    """Test CRUD operations"""
    print("\n📊 Testing CRUD operations...")
    
    try:
        # Test read users
        response = requests.get(f"{PYTHON_BRAIN_URL}/crud/User?limit=5", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                users = data.get('data', [])
                print(f"✅ CRUD: Read {len(users)} users")
            else:
                print(f"❌ CRUD: Failed to read users")
        else:
            print(f"❌ CRUD: HTTP {response.status_code}")
        
        # Test search
        search_data = {
            "search_term": "test",
            "search_columns": ["name", "email"],
            "limit": 10
        }
        response = requests.post(f"{PYTHON_BRAIN_URL}/crud/User/search", 
                               json=search_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                results = data.get('data', [])
                print(f"✅ CRUD: Search found {len(results)} results")
            else:
                print(f"❌ CRUD: Search failed")
        else:
            print(f"❌ CRUD: Search HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ CRUD: Error - {e}")

def main():
    """Run complete system test"""
    print("🧪 SmartStart Complete System Test")
    print("=" * 50)
    
    # Test service health
    test_service_health()
    
    # Test Python Brain services
    test_python_brain_services()
    
    # Test database connection
    test_database_connection()
    
    # Test user registration
    user_id = test_user_registration()
    
    if user_id:
        # Test user login
        token = test_user_login(user_id)
        
        # Test RBAC system
        test_rbac_system(user_id)
        
        # Test user journey
        test_user_journey(user_id)
        
        # Test legal system
        test_legal_system(user_id)
        
        # Test venture creation
        venture_id = test_venture_creation(user_id)
        
        if venture_id:
            print(f"✅ Venture created with ID: {venture_id}")
    
    # Test CRUD operations
    test_crud_operations()
    
    print("\n🎉 Complete system test finished!")

if __name__ == "__main__":
    main()
