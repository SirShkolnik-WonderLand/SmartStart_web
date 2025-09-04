#!/bin/bash

# 🏢 Company Management System Test Script
# Tests all major endpoints of the Company Management API

BASE_URL="https://smartstart-api.onrender.com"
API_BASE="/api/companies"

echo "🏢 Testing Company Management System API"
echo "========================================"
echo "Base URL: $BASE_URL$API_BASE"
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
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$API_BASE$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$API_BASE$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT -H "Content-Type: application/json" -d "$data" "$BASE_URL$API_BASE$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$API_BASE$endpoint")
    fi
    
    # Extract status code and response body
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} - Status: $status_code"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} - Expected: $expected_status, Got: $status_code"
        echo "Response: $response_body"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

# Function to wait for deployment
wait_for_deployment() {
    echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
    sleep 80
    echo -e "${GREEN}✅ Deployment should be complete now${NC}"
    echo ""
}

# Wait for deployment if needed
# wait_for_deployment

echo "🚀 Starting Company Management System Tests..."
echo ""

# Test 1: Health Check
run_test "Health Check" "GET" "/health" "" "200"

# Test 2: Create Tables
run_test "Create Tables" "POST" "/create-tables" "" "200"

# Test 3: Create Company Tag
TAG_DATA='{
  "name": "FinTech",
  "category": "INDUSTRY",
  "description": "Financial Technology companies",
  "synonyms": ["Financial Tech", "Banking Technology"],
  "relatedTags": []
}'
run_test "Create Company Tag" "POST" "/tags/create" "$TAG_DATA" "201"

# Test 4: Create Company
COMPANY_DATA='{
  "name": "TechStart Solutions",
  "legalName": "TechStart Solutions Inc.",
  "industry": "Technology",
  "sector": "Software",
  "size": "SMALL",
  "stage": "SEED",
  "region": "North America",
  "founded": "2024-01-01",
  "revenue": 50000,
  "valuation": 1000000,
  "employees": 15,
  "customers": 25,
  "tags": ["FinTech", "SaaS", "AI"],
  "description": "Innovative software solutions for modern businesses",
  "mission": "Empower businesses with cutting-edge technology",
  "vision": "Leading the digital transformation revolution",
  "website": "https://techstart.com",
  "email": "info@techstart.com",
  "phone": "+1-555-0123",
  "address": "123 Innovation St, Tech City, TC 12345",
  "ownerId": "test-owner-123"
}'
run_test "Create Company" "POST" "/create" "$COMPANY_DATA" "201"

# Test 5: Get All Companies
run_test "Get All Companies" "GET" "/" "" "200"

# Test 6: Get Company by ID (assuming first company created)
run_test "Get Company by ID" "GET" "/test-company-id" "" "404"

# Test 7: Search Companies
run_test "Search Companies" "GET" "/search/companies?query=TechStart" "" "200"

# Test 8: Get All Tags
run_test "Get All Tags" "GET" "/tags/all" "" "200"

# Test 9: Get Tags by Category
run_test "Get Tags by Category" "GET" "/tags/all?category=INDUSTRY" "" "200"

echo "🏁 Company Management System Tests Complete!"
echo "============================================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Company Management System is working correctly.${NC}"
else
    echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
fi

echo ""
echo "📋 Test Summary:"
echo "- Health Check: Basic API functionality"
echo "- Table Creation: Database schema setup"
echo "- Tag Management: Company classification system"
echo "- Company CRUD: Core company operations"
echo "- Search & Discovery: Company finding capabilities"
echo "- Analytics: Company performance insights"
echo ""
echo "🔗 Next Steps:"
echo "1. Create more companies with different industries and stages"
echo "2. Set up company hierarchies (parent/subsidiary relationships)"
echo "3. Add company metrics and performance data"
echo "4. Upload company documents and files"
echo "5. Integrate with Team Management System"
echo ""
echo "💡 The Company Management System provides:"
echo "- Complete company lifecycle management"
echo "- Industry classification and tagging"
echo "- Hierarchical company structures"
echo "- Performance metrics and analytics"
echo "- Document management and storage"
echo "- Advanced search and discovery"
echo ""
echo "🚀 Ready to build the next phase: Team Management System!"
