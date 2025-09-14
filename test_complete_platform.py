#!/usr/bin/env python3
"""
Complete SmartStart Platform Test Suite
Tests all major functionality end-to-end
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE = "https://smartstart-api.onrender.com"
PYTHON_BRAIN = "https://smartstart-python-brain.onrender.com"
FRONTEND = "https://smartstart-frontend.onrender.com"

# Test user credentials
TEST_USER = {
    "email": "udi.admin@alicesolutionsgroup.com",
    "password": "Id200633048!",
    "name": "Udi Shkolnik"
}

class SmartStartTester:
    def __init__(self):
        self.session = requests.Session()
        self.results = {
            "passed": 0,
            "failed": 0,
            "total": 0,
            "details": []
        }
    
    def log_test(self, test_name, success, message="", data=None):
        """Log test result"""
        self.results["total"] += 1
        if success:
            self.results["passed"] += 1
            status = "✅ PASS"
        else:
            self.results["failed"] += 1
            status = "❌ FAIL"
        
        self.results["details"].append({
            "test": test_name,
            "status": status,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
        
        print(f"{status} {test_name}: {message}")
    
    def test_health_checks(self):
        """Test all health check endpoints"""
        print("\n🏥 Testing Health Checks...")
        
        # API Health
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                self.log_test("API Health Check", True, "API is healthy")
            else:
                self.log_test("API Health Check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")
        
        # Python Brain Health
        try:
            response = self.session.get(f"{PYTHON_BRAIN}/health")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Python Brain Health", True, f"Status: {data.get('status')}")
            else:
                self.log_test("Python Brain Health", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Python Brain Health", False, f"Error: {str(e)}")
        
        # Frontend Health
        try:
            response = self.session.get(FRONTEND)
            if response.status_code == 200:
                self.log_test("Frontend Health", True, "Frontend is accessible")
            else:
                self.log_test("Frontend Health", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Frontend Health", False, f"Error: {str(e)}")
    
    def test_authentication(self):
        """Test authentication flow"""
        print("\n🔐 Testing Authentication...")
        
        # Test Login
        try:
            response = self.session.post(f"{API_BASE}/api/auth/login", json=TEST_USER)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.token = data["user"]["token"]
                    self.user_id = data["user"]["id"]
                    self.log_test("User Login", True, f"Logged in as {data['user']['name']}")
                else:
                    self.log_test("User Login", False, data.get("error", "Unknown error"))
            else:
                self.log_test("User Login", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("User Login", False, f"Error: {str(e)}")
        
        # Test Registration
        try:
            test_registration = {
                "email": f"test_{int(time.time())}@example.com",
                "password": "password123",
                "name": "Test User"
            }
            response = self.session.post(f"{API_BASE}/api/auth/register", json=test_registration)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("User Registration", True, f"Registered user: {data['user']['email']}")
                else:
                    self.log_test("User Registration", False, data.get("error", "Unknown error"))
            else:
                self.log_test("User Registration", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("User Registration", False, f"Error: {str(e)}")
    
    def test_buz_token_system(self):
        """Test BUZ token economy"""
        print("\n💰 Testing BUZ Token System...")
        
        # Test BUZ Supply
        try:
            response = self.session.get(f"{API_BASE}/api/v1/buz/supply")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    supply_data = data["data"]
                    self.log_test("BUZ Supply", True, f"Total Supply: {supply_data.get('total_supply'):,}")
                else:
                    self.log_test("BUZ Supply", False, data.get("error", "Unknown error"))
            else:
                self.log_test("BUZ Supply", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("BUZ Supply", False, f"Error: {str(e)}")
        
        # Test BUZ Wallet
        try:
            response = self.session.get(f"{API_BASE}/api/v1/buz/wallet/{self.user_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    wallet_data = data["data"]
                    self.log_test("BUZ Wallet", True, f"Balance: {wallet_data.get('balance'):,} BUZ")
                else:
                    self.log_test("BUZ Wallet", False, data.get("error", "Unknown error"))
            else:
                self.log_test("BUZ Wallet", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("BUZ Wallet", False, f"Error: {str(e)}")
        
        # Test BUZ Rules
        try:
            response = self.session.get(f"{API_BASE}/api/v1/buz/rules")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    rules_data = data["data"]
                    self.log_test("BUZ Rules", True, f"Costs: {len(rules_data.get('costs', {}))}, Rewards: {len(rules_data.get('rewards', {}))}")
                else:
                    self.log_test("BUZ Rules", False, data.get("error", "Unknown error"))
            else:
                self.log_test("BUZ Rules", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("BUZ Rules", False, f"Error: {str(e)}")
    
    def test_venture_management(self):
        """Test venture creation and management"""
        print("\n🚀 Testing Venture Management...")
        
        # Test Venture Creation
        try:
            venture_data = {
                "name": f"Test Venture {int(time.time())}",
                "description": "Testing venture creation via API",
                "industry": "Technology",
                "stage": "idea",
                "teamSize": 1,
                "tier": "T1",
                "residency": "US",
                "lookingFor": ["Developer"],
                "requiredSkills": ["JavaScript", "React"],
                "rewardType": "equity",
                "equityPercentage": 10,
                "tags": ["test", "api"],
                "website": "https://test.com"
            }
            response = self.session.post(f"{API_BASE}/api/ventures/create", json=venture_data)
            if response.status_code == 201:
                data = response.json()
                if data.get("success"):
                    self.venture_id = data["data"]["id"]
                    self.log_test("Venture Creation", True, f"Created venture: {data['data']['name']}")
                else:
                    self.log_test("Venture Creation", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Venture Creation", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Venture Creation", False, f"Error: {str(e)}")
        
        # Test Ventures List
        try:
            response = self.session.get(f"{API_BASE}/api/v1/ventures/list/all")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    ventures = data["data"]["ventures"]
                    self.log_test("Ventures List", True, f"Found {len(ventures)} ventures")
                else:
                    self.log_test("Ventures List", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Ventures List", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Ventures List", False, f"Error: {str(e)}")
    
    def test_legal_documents(self):
        """Test legal document system"""
        print("\n⚖️ Testing Legal Documents...")
        
        # Test Legal Documents Status
        try:
            response = self.session.get(f"{API_BASE}/api/legal-documents/status")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    legal_data = data["data"]
                    self.log_test("Legal Documents Status", True, f"Signed: {legal_data.get('documents_signed')}/{legal_data.get('documents_required')}")
                else:
                    self.log_test("Legal Documents Status", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Legal Documents Status", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Legal Documents Status", False, f"Error: {str(e)}")
        
        # Test Legal Documents List
        try:
            response = self.session.get(f"{API_BASE}/api/legal-documents/documents")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    documents = data["data"]
                    self.log_test("Legal Documents List", True, f"Found {len(documents)} documents")
                else:
                    self.log_test("Legal Documents List", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Legal Documents List", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Legal Documents List", False, f"Error: {str(e)}")
    
    def test_journey_system(self):
        """Test user journey system"""
        print("\n🛤️ Testing Journey System...")
        
        # Test Journey Status
        try:
            response = self.session.get(f"{API_BASE}/api/journey/status/{self.user_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    journey_data = data["data"]
                    self.log_test("Journey Status", True, f"Current Stage: {journey_data.get('currentStage')}, Progress: {journey_data.get('stageProgress')}%")
                else:
                    self.log_test("Journey Status", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Journey Status", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Journey Status", False, f"Error: {str(e)}")
    
    def test_opportunities(self):
        """Test opportunities system"""
        print("\n🎯 Testing Opportunities...")
        
        # Test Opportunities List
        try:
            response = self.session.get(f"{API_BASE}/api/opportunities")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    opportunities = data["data"]["opportunities"]
                    self.log_test("Opportunities List", True, f"Found {len(opportunities)} opportunities")
                else:
                    self.log_test("Opportunities List", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Opportunities List", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Opportunities List", False, f"Error: {str(e)}")
    
    def test_analytics(self):
        """Test analytics system"""
        print("\n📊 Testing Analytics...")
        
        # Test Dashboard Analytics
        try:
            response = self.session.get(f"{API_BASE}/api/dashboard/")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    analytics_data = data["data"]
                    self.log_test("Dashboard Analytics", True, f"Users: {analytics_data.get('total_users')}, Ventures: {analytics_data.get('active_ventures')}")
                else:
                    self.log_test("Dashboard Analytics", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Dashboard Analytics", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Dashboard Analytics", False, f"Error: {str(e)}")
    
    def test_python_brain_services(self):
        """Test Python Brain specific services"""
        print("\n🧠 Testing Python Brain Services...")
        
        # Test Venture Legal Dashboard
        try:
            response = self.session.get(f"{PYTHON_BRAIN}/api/venture-legal/dashboard/{self.user_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    legal_data = data["data"]
                    self.log_test("Venture Legal Dashboard", True, f"Legal Health Score: {legal_data.get('legal_health_score')}")
                else:
                    self.log_test("Venture Legal Dashboard", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Venture Legal Dashboard", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Venture Legal Dashboard", False, f"Error: {str(e)}")
        
        # Test Team Charters
        try:
            response = self.session.get(f"{PYTHON_BRAIN}/api/venture-legal/charters")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    charters = data["data"]["charters"]
                    self.log_test("Team Charters", True, f"Found {len(charters)} charters")
                else:
                    self.log_test("Team Charters", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Team Charters", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Team Charters", False, f"Error: {str(e)}")
    
    def test_gamification(self):
        """Test gamification system"""
        print("\n🏆 Testing Gamification...")
        
        # Test Leaderboard
        try:
            response = self.session.get(f"{API_BASE}/api/gamification/leaderboard")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    leaderboard = data["data"]["leaderboard"]
                    self.log_test("Leaderboard", True, f"Found {len(leaderboard)} users on leaderboard")
                else:
                    self.log_test("Leaderboard", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Leaderboard", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Leaderboard", False, f"Error: {str(e)}")
    
    def test_umbrella_network(self):
        """Test umbrella network system"""
        print("\n🌂 Testing Umbrella Network...")
        
        # Test Umbrella Relationships
        try:
            response = self.session.get(f"{API_BASE}/api/umbrella/relationships")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    relationships = data["data"]
                    self.log_test("Umbrella Relationships", True, f"Found {len(relationships)} relationships")
                else:
                    self.log_test("Umbrella Relationships", False, data.get("error", "Unknown error"))
            else:
                self.log_test("Umbrella Relationships", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Umbrella Relationships", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting SmartStart Platform Complete Test Suite")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_health_checks()
        self.test_authentication()
        self.test_buz_token_system()
        self.test_venture_management()
        self.test_legal_documents()
        self.test_journey_system()
        self.test_opportunities()
        self.test_analytics()
        self.test_python_brain_services()
        self.test_gamification()
        self.test_umbrella_network()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.results['total']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        print(f"Success Rate: {(self.results['passed'] / self.results['total'] * 100):.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        
        # Print failed tests
        if self.results['failed'] > 0:
            print("\n❌ FAILED TESTS:")
            for test in self.results['details']:
                if "FAIL" in test['status']:
                    print(f"  - {test['test']}: {test['message']}")
        
        # Save detailed results
        with open('test_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to test_results.json")
        
        return self.results

if __name__ == "__main__":
    tester = SmartStartTester()
    results = tester.run_all_tests()
