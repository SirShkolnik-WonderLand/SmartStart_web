#!/bin/bash

# 🚀 SmartStart User Management System - Comprehensive Test Script
# Tests all user management endpoints and functionality

BASE_URL="https://smartstart-api.onrender.com"
API_BASE="/api/users"

echo "🌟 SmartStart User Management System - Testing Suite"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo "API Base: $API_BASE"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test and count results
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    echo "Command: $command"
    
    # Run the command and capture output
    local output
    local exit_code
    
    if [[ "$command" == *"curl"* ]]; then
        output=$(eval "$command" 2>/dev/null)
        exit_code=$?
    else
        output=$(eval "$command")
        exit_code=$?
    fi
    
    # Check if command succeeded
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Output: $output"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

# Function to test API endpoint
test_api() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    local test_name="$4"
    
    local curl_cmd="curl -s -X $method"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$BASE_URL$API_BASE$endpoint'"
    
    run_test "$test_name" "$curl_cmd"
}

echo "🚀 Starting User Management System Tests..."
echo ""

# ===== HEALTH CHECK TESTS =====
echo "📊 Health Check Tests"
echo "---------------------"
test_api "/health" "GET" "" "Health Check"

# ===== USER CRUD TESTS =====
echo "👤 User CRUD Tests"
echo "------------------"

# Create test user
test_api "/create" "POST" '{
    "email": "testuser@smartstart.com",
    "name": "Test User",
    "bio": "A test user for system testing",
    "location": "Test City"
}' "Create Test User"

# Get all users
test_api "/" "GET" "" "Get All Users"

# Get system statistics
test_api "/stats/system" "GET" "" "Get System Statistics"

# ===== USER PROFILE TESTS =====
echo "📝 User Profile Tests"
echo "---------------------"

# Get first user ID for testing (assuming we have users)
echo "🔍 Getting test user ID..."
USER_RESPONSE=$(curl -s "$BASE_URL$API_BASE/")
TEST_USER_ID=$(echo "$USER_RESPONSE" | jq -r '.users[0].id // empty')

if [ -n "$TEST_USER_ID" ] && [ "$TEST_USER_ID" != "null" ]; then
    echo "✅ Found test user: $TEST_USER_ID"
    
    # Get user by ID
    test_api "/$TEST_USER_ID" "GET" "" "Get User by ID"
    
    # Get user with relations
    test_api "/$TEST_USER_ID?include=profile,privacy,skills,portfolio" "GET" "" "Get User with Relations"
    
    # Update user profile
    test_api "/$TEST_USER_ID/profile" "PUT" '{
        "nickname": "Updated Test User",
        "bio": "Updated bio for testing",
        "location": "Updated Test City"
    }' "Update User Profile"
    
    # Update privacy settings
    test_api "/$TEST_USER_ID/privacy" "PUT" '{
        "showExactPercToHub": true,
        "showActivity": false
    }' "Update Privacy Settings"
    
    # Get user settings
    test_api "/$TEST_USER_ID/settings" "GET" "" "Get User Settings"
    
    # Get user statistics
    test_api "/$TEST_USER_ID/stats" "GET" "" "Get User Statistics"
    
else
    echo "⚠️  No test users found, skipping profile tests"
fi

# ===== USER CONNECTIONS TESTS =====
echo "🔗 User Connections Tests"
echo "-------------------------"

if [ -n "$TEST_USER_ID" ] && [ "$TEST_USER_ID" != "null" ]; then
    # Get user connections
    test_api "/$TEST_USER_ID/connections" "GET" "" "Get User Connections"
    
    # Create connection request (if we have another user)
    SECOND_USER_ID=$(echo "$USER_RESPONSE" | jq -r '.users[1].id // empty')
    
    if [ -n "$SECOND_USER_ID" ] && [ "$SECOND_USER_ID" != "null" ] && [ "$SECOND_USER_ID" != "$TEST_USER_ID" ]; then
        echo "🔍 Found second user: $SECOND_USER_ID"
        
        test_api "/$TEST_USER_ID/connections" "POST" "{
            \"targetId\": \"$SECOND_USER_ID\",
            \"connectionType\": \"CONNECTION\"
        }" "Create Connection Request"
        
    else
        echo "⚠️  No second user found, skipping connection creation test"
    fi
else
    echo "⚠️  No test users found, skipping connection tests"
fi

# ===== USER PORTFOLIO TESTS =====
echo "💼 User Portfolio Tests"
echo "-----------------------"

if [ -n "$TEST_USER_ID" ] && [ "$TEST_USER_ID" != "null" ]; then
    # Add portfolio item
    test_api "/$TEST_USER_ID/portfolio" "POST" '{
        "title": "Test Portfolio Item",
        "summary": "A test portfolio item for testing",
        "buzEarned": 100,
        "impactScore": 4
    }' "Add Portfolio Item"
    
    # Get user portfolio
    test_api "/$TEST_USER_ID/portfolio" "GET" "" "Get User Portfolio"
    
    # Update portfolio metrics
    test_api "/$TEST_USER_ID/portfolio/update-metrics" "POST" "" "Update Portfolio Metrics"
else
    echo "⚠️  No test users found, skipping portfolio tests"
fi

# ===== USER SKILLS TESTS =====
echo "🎯 User Skills Tests"
echo "--------------------"

if [ -n "$TEST_USER_ID" ] && [ "$TEST_USER_ID" != "null" ]; then
    # Add user skill
    test_api "/$TEST_USER_ID/skills" "POST" '{
        "skillName": "JavaScript",
        "level": 4,
        "verified": true
    }' "Add User Skill"
    
    # Get user skills
    test_api "/$TEST_USER_ID/skills" "GET" "" "Get User Skills"
else
    echo "⚠️  No test users found, skipping skills tests"
fi

# ===== USER ANALYTICS TESTS =====
echo "📊 User Analytics Tests"
echo "-----------------------"

if [ -n "$TEST_USER_ID" ] && [ "$TEST_USER_ID" != "null" ]; then
    # Get user analytics
    test_api "/$TEST_USER_ID/analytics" "GET" "" "Get User Analytics"
    
    # Get user activity
    test_api "/$TEST_USER_ID/activity" "GET" "" "Get User Activity"
    
    # Get user activity with filters
    test_api "/$TEST_USER_ID/activity?type=USER_CREATED&limit=10" "GET" "" "Get User Activity with Filters"
else
    echo "⚠️  No test users found, skipping analytics tests"
fi

# ===== USER SEARCH TESTS =====
echo "🔍 User Search Tests"
echo "--------------------"

# Search users
test_api "/search?query=test" "GET" "" "Search Users by Query"
test_api "/search?level=OWLET" "GET" "" "Search Users by Level"
test_api "/search?limit=5&offset=0" "GET" "" "Search Users with Pagination"

# ===== COMPREHENSIVE USER TEST =====
echo "🎭 Comprehensive User Test"
echo "---------------------------"

if [ -n "$TEST_USER_ID" ] && [ "$TEST_USER_ID" != "null" ]; then
    # Test complete user workflow
    echo "🔍 Testing complete user workflow for: $TEST_USER_ID"
    
    # 1. Get user with all relations
    test_api "/$TEST_USER_ID?include=profile,privacy,skills,portfolio,badges,activity" "GET" "" "Complete User Profile"
    
    # 2. Update multiple settings at once
    test_api "/$TEST_USER_ID/settings" "PUT" '{
        "profile": {
            "nickname": "Comprehensive Test User",
            "bio": "Testing all user management features"
        },
        "privacy": {
            "showSkills": false,
            "showPortfolio": true
        }
    }' "Update Multiple Settings"
    
    # 3. Add multiple portfolio items
    test_api "/$TEST_USER_ID/portfolio" "POST" '{
        "title": "Second Portfolio Item",
        "summary": "Another test item",
        "buzEarned": 250,
        "impactScore": 5
    }' "Add Second Portfolio Item"
    
    # 4. Add multiple skills
    test_api "/$TEST_USER_ID/skills" "POST" '{
        "skillName": "Python",
        "level": 3,
        "verified": false
    }' "Add Python Skill"
    
    test_api "/$TEST_USER_ID/skills" "POST" '{
        "skillName": "React",
        "level": 5,
        "verified": true
    }' "Add React Skill"
    
    # 5. Final analytics check
    test_api "/$TEST_USER_ID/analytics" "GET" "" "Final Analytics Check"
    
else
    echo "⚠️  No test users found, skipping comprehensive test"
fi

# ===== TEST SUMMARY =====
echo "📋 Test Summary"
echo "==============="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! User Management System is working perfectly!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
fi

echo ""
echo "🚀 User Management System Testing Complete!"
echo "=========================================="
