#!/usr/bin/env python3
"""
Security Deployment Test Script
Tests all security implementations after deployment
"""

import requests
import json
import time
import sys
from typing import Dict, List

class SecurityTester:
    def __init__(self, base_url: str = "https://smartstart-api.onrender.com"):
        self.base_url = base_url
        self.test_results = []
    
    def run_security_tests(self) -> bool:
        """Run comprehensive security tests"""
        print("🔒 Running Security Deployment Tests...")
        print("=" * 50)
        
        tests = [
            ("Rate Limiting", self.test_rate_limiting),
            ("JWT Security", self.test_jwt_security),
            ("BUZ Token Security", self.test_buz_security),
            ("Input Validation", self.test_input_validation),
            ("Security Headers", self.test_security_headers)
        ]
        
        all_passed = True
        
        for test_name, test_func in tests:
            print(f"\n🧪 Testing {test_name}...")
            try:
                result = test_func()
                if result:
                    print(f"✅ {test_name}: PASSED")
                else:
                    print(f"❌ {test_name}: FAILED")
                    all_passed = False
            except Exception as e:
                print(f"❌ {test_name}: ERROR - {str(e)}")
                all_passed = False
        
        print("\n" + "=" * 50)
        if all_passed:
            print("🎉 All security tests PASSED!")
            print("✅ Security deployment successful")
        else:
            print("⚠️  Some security tests FAILED!")
            print("❌ Security deployment needs attention")
        
        return all_passed
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting implementation"""
        try:
            # Make rapid requests to test rate limiting
            responses = []
            for i in range(20):
                response = requests.get(f"{self.base_url}/api/health")
                responses.append(response.status_code)
                time.sleep(0.1)
            
            # Check if rate limiting is working (should get 429 at some point)
            return 429 in responses
        except Exception:
            return False
    
    def test_jwt_security(self) -> bool:
        """Test JWT security implementation"""
        try:
            # Test with invalid token
            headers = {'Authorization': 'Bearer invalid_token'}
            response = requests.get(f"{self.base_url}/api/v1/buz/balance/test", headers=headers)
            return response.status_code == 401
        except Exception:
            return False
    
    def test_buz_security(self) -> bool:
        """Test BUZ token security"""
        try:
            # Test negative amount (should be rejected)
            response = requests.post(f"{self.base_url}/api/v1/buz/award", json={
                'userId': 'test',
                'amount': -1000,
                'reason': 'test'
            })
            return response.status_code == 400
        except Exception:
            return False
    
    def test_input_validation(self) -> bool:
        """Test input validation"""
        try:
            # Test SQL injection attempt
            response = requests.get(f"{self.base_url}/api/users", params={
                'search': "'; DROP TABLE users; --"
            })
            return response.status_code == 400 or 'error' not in response.text.lower()
        except Exception:
            return False
    
    def test_security_headers(self) -> bool:
        """Test security headers"""
        try:
            response = requests.get(f"{self.base_url}/api/health")
            headers = response.headers
            
            required_headers = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection'
            ]
            
            return all(header in headers for header in required_headers)
        except Exception:
            return False

if __name__ == "__main__":
    tester = SecurityTester()
    success = tester.run_security_tests()
    sys.exit(0 if success else 1)
