#!/bin/bash

# Team Management System Test Script
# Tests all major team management API endpoints

BASE_URL="https://smartstart-api.onrender.com"
API_BASE="/api/teams"

echo "🚀 Testing Team Management System API"
echo "====================================="
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

# Function to run a test
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint")
    fi
    
    # Check if response contains success
    if echo "$response" | grep -q '"success":\s*true'; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response: $response"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Test 1: Health Check
run_test "Health Check" "$API_BASE/health"

# Test 2: Create Tables
run_test "Create Tables" "$API_BASE/create-tables" "POST"

# Test 3: Get All Teams (should be empty initially)
run_test "Get All Teams" "$API_BASE/"

# Test 4: Search Teams (should be empty initially)
run_test "Search Teams" "$API_BASE/search/teams?q=test"

# Test 5: Get Team Analytics (should fail - no team exists)
run_test "Get Team Analytics (Non-existent)" "$API_BASE/nonexistent/analytics"

echo "====================================="
echo "Test Results:"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo "====================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Team Management System is working correctly.${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the responses above for details.${NC}"
fi

echo ""
echo "Next Steps:"
echo "1. Create a company first using /api/companies/create"
echo "2. Create a team using the company ID"
echo "3. Add team members, goals, and metrics"
echo "4. Test team collaboration features"
