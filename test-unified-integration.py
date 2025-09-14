#!/usr/bin/env python3
"""
Unified SmartStart Integration Test
Tests the integration of all systems: BUZ Tokens, Umbrella Network, Venture Management, Legal, Opportunities, Analytics
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE = "https://smartstart-python-brain.onrender.com"
TEST_USER_ID = "test-user-123"

def test_api_endpoint(endpoint, method="GET", data=None, expected_status=200):
    """Test an API endpoint"""
    url = f"{API_BASE}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=30)
        else:
            return False, f"Unsupported method: {method}"
        
        success = response.status_code == expected_status
        return success, {
            "status_code": response.status_code,
            "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        }
    except Exception as e:
        return False, str(e)

def test_buz_token_system():
    """Test BUZ token system integration"""
    print("🧪 Testing BUZ Token System...")
    
    # Test earning BUZ tokens
    success, result = test_api_endpoint(
        "/api/buz/earn",
        method="POST",
        data={
            "user_id": TEST_USER_ID,
            "amount": 100.0,
            "activity": "Integration test",
            "source_system": "test",
            "source_id": "test-001"
        }
    )
    print(f"  ✅ Earn BUZ tokens: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test spending BUZ tokens
    success, result = test_api_endpoint(
        "/api/buz/spend",
        method="POST",
        data={
            "user_id": TEST_USER_ID,
            "amount": 25.0,
            "service": "Test service",
            "source_system": "test",
            "source_id": "test-002"
        }
    )
    print(f"  ✅ Spend BUZ tokens: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test staking BUZ tokens
    success, result = test_api_endpoint(
        "/api/buz/stake",
        method="POST",
        data={
            "user_id": TEST_USER_ID,
            "amount": 50.0,
            "tier": "SILVER",
            "duration_days": 90
        }
    )
    print(f"  ✅ Stake BUZ tokens: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test getting BUZ balance
    success, result = test_api_endpoint(f"/api/buz/balance/{TEST_USER_ID}")
    print(f"  ✅ Get BUZ balance: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    else:
        print(f"    Balance: {result.get('response', {}).get('data', {}).get('balance', 'N/A')} BUZ")

def test_umbrella_network_system():
    """Test Umbrella network system integration"""
    print("🧪 Testing Umbrella Network System...")
    
    # Test creating umbrella relationship
    success, result = test_api_endpoint(
        "/api/umbrella/relationships",
        method="POST",
        data={
            "referrer_id": TEST_USER_ID,
            "referred_id": "test-user-456",
            "share_rate": 1.5
        }
    )
    print(f"  ✅ Create umbrella relationship: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test calculating revenue shares
    success, result = test_api_endpoint(
        "/api/umbrella/revenue/calculate",
        method="POST",
        data={
            "project_id": "test-project-001",
            "revenue": 1000.0,
            "project_type": "venture"
        }
    )
    print(f"  ✅ Calculate revenue shares: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test getting umbrella relationships
    success, result = test_api_endpoint(f"/api/umbrella/relationships/{TEST_USER_ID}")
    print(f"  ✅ Get umbrella relationships: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")

def test_venture_management_system():
    """Test Venture management system integration"""
    print("🧪 Testing Venture Management System...")
    
    # Test creating venture
    success, result = test_api_endpoint(
        "/api/ventures",
        method="POST",
        data={
            "owner_id": TEST_USER_ID,
            "name": "Test Venture",
            "description": "Integration test venture",
            "buz_budget": 500.0
        }
    )
    print(f"  ✅ Create venture: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test completing venture milestone
    if success and 'response' in result and 'data' in result['response']:
        venture_id = result['response']['data'].get('venture_id')
        if venture_id:
            success, result = test_api_endpoint(
                f"/api/ventures/{venture_id}/milestone",
                method="POST",
                data={"milestone": "FOUNDATION"}
            )
            print(f"  ✅ Complete venture milestone: {'PASS' if success else 'FAIL'}")
            if not success:
                print(f"    Error: {result}")
    
    # Test getting user ventures
    success, result = test_api_endpoint(f"/api/ventures/{TEST_USER_ID}")
    print(f"  ✅ Get user ventures: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")

def test_legal_system():
    """Test Legal system integration"""
    print("🧪 Testing Legal System...")
    
    # Test generating legal document
    success, result = test_api_endpoint(
        "/api/legal/documents",
        method="POST",
        data={
            "user_id": TEST_USER_ID,
            "doc_type": "NDA",
            "context": {
                "party1": "Test User",
                "party2": "Test Company"
            }
        }
    )
    print(f"  ✅ Generate legal document: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test getting user legal documents
    success, result = test_api_endpoint(f"/api/legal/documents/{TEST_USER_ID}")
    print(f"  ✅ Get user legal documents: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")

def test_opportunities_system():
    """Test Opportunities system integration"""
    print("🧪 Testing Opportunities System...")
    
    # Test creating opportunity
    success, result = test_api_endpoint(
        "/api/opportunities",
        method="POST",
        data={
            "creator_id": TEST_USER_ID,
            "title": "Test Opportunity",
            "description": "Integration test opportunity",
            "type": "VENTURE_COLLABORATION",
            "buz_reward": 100.0
        }
    )
    print(f"  ✅ Create opportunity: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test applying to opportunity
    if success and 'response' in result and 'data' in result['response']:
        opportunity_id = result['response']['data'].get('opportunity_id')
        if opportunity_id:
            success, result = test_api_endpoint(
                f"/api/opportunities/{opportunity_id}/apply",
                method="POST",
                data={"user_id": "test-user-456"}
            )
            print(f"  ✅ Apply to opportunity: {'PASS' if success else 'FAIL'}")
            if not success:
                print(f"    Error: {result}")
    
    # Test getting opportunities
    success, result = test_api_endpoint("/api/opportunities")
    print(f"  ✅ Get opportunities: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")

def test_analytics_system():
    """Test Analytics system integration"""
    print("🧪 Testing Analytics System...")
    
    # Test getting unified analytics
    success, result = test_api_endpoint(f"/api/analytics/unified/{TEST_USER_ID}")
    print(f"  ✅ Get unified analytics: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test getting platform analytics
    success, result = test_api_endpoint("/api/analytics/platform")
    print(f"  ✅ Get platform analytics: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")

def test_cross_system_integration():
    """Test cross-system integration"""
    print("🧪 Testing Cross-System Integration...")
    
    # Test logging cross-system activity
    success, result = test_api_endpoint(
        "/api/integration/activity",
        method="POST",
        data={
            "user_id": TEST_USER_ID,
            "activity_type": "integration_test",
            "systems_involved": ["buz", "umbrella", "venture", "legal", "opportunity"],
            "metadata": {
                "test_run": True,
                "timestamp": datetime.now().isoformat()
            }
        }
    )
    print(f"  ✅ Log cross-system activity: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    
    # Test getting integration health
    success, result = test_api_endpoint("/api/integration/health")
    print(f"  ✅ Get integration health: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    else:
        health_data = result.get('response', {}).get('data', {})
        overall_status = health_data.get('overall_status', 'unknown')
        print(f"    Overall Status: {overall_status}")

def test_system_health():
    """Test overall system health"""
    print("🧪 Testing System Health...")
    
    success, result = test_api_endpoint("/health")
    print(f"  ✅ Health check: {'PASS' if success else 'FAIL'}")
    if not success:
        print(f"    Error: {result}")
    else:
        health_data = result.get('response', {})
        print(f"    Status: {health_data.get('status', 'unknown')}")
        print(f"    Service: {health_data.get('service', 'unknown')}")

def main():
    """Run all integration tests"""
    print("🚀 Starting Unified SmartStart Integration Tests")
    print("=" * 60)
    
    start_time = time.time()
    
    # Test system health first
    test_system_health()
    print()
    
    # Test individual systems
    test_buz_token_system()
    print()
    
    test_umbrella_network_system()
    print()
    
    test_venture_management_system()
    print()
    
    test_legal_system()
    print()
    
    test_opportunities_system()
    print()
    
    test_analytics_system()
    print()
    
    # Test cross-system integration
    test_cross_system_integration()
    print()
    
    end_time = time.time()
    duration = end_time - start_time
    
    print("=" * 60)
    print(f"🎉 Integration tests completed in {duration:.2f} seconds")
    print("=" * 60)

if __name__ == "__main__":
    main()
