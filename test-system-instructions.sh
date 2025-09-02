#!/bin/bash

# 🚀 SmartStart System Instructions API - Test Script
# Tests the comprehensive system documentation endpoint

BASE_URL="https://smartstart-api.onrender.com"
API_BASE="/api/system"

echo "🌟 SmartStart System Instructions API - Testing Suite"
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
    
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    echo "Command: $command"
    
    # Run the command and capture output
    local output
    local exit_code
    
    output=$(eval "$command" 2>/dev/null)
    exit_code=$?
    
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
    local test_name="$3"
    
    local curl_cmd="curl -s -X $method '$BASE_URL$API_BASE$endpoint'"
    
    run_test "$test_name" "$curl_cmd"
}

echo "🚀 Starting System Instructions API Tests..."
echo ""

# ===== MAIN SYSTEM INSTRUCTIONS TESTS =====
echo "📚 Main System Instructions Tests"
echo "--------------------------------"

# Test main instructions endpoint
test_api "/" "GET" "Get Complete System Instructions"

# Test system status endpoint
test_api "/status" "GET" "Get System Status"

# Test API explorer endpoint
test_api "/explorer" "GET" "Get API Explorer Guide"

# ===== COMPREHENSIVE SYSTEM TEST =====
echo "🎭 Comprehensive System Test"
echo "----------------------------"

echo "🔍 Testing complete system instructions..."
MAIN_RESPONSE=$(curl -s "$BASE_URL$API_BASE/")
echo "Response received: ${#MAIN_RESPONSE} characters"

# Check if response contains key system information
if [[ "$MAIN_RESPONSE" == *"SmartStart Platform"* ]]; then
    echo -e "${GREEN}✅ System name found in response${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ System name not found in response${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$MAIN_RESPONSE" == *"coreSystems"* ]]; then
    echo -e "${GREEN}✅ Core systems section found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Core systems section not found${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$MAIN_RESPONSE" == *"apiEndpoints"* ]]; then
    echo -e "${GREEN}✅ API endpoints section found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ API endpoints section not found${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$MAIN_RESPONSE" == *"dataModels"* ]]; then
    echo -e "${GREEN}✅ Data models section found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Data models section not found${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$MAIN_RESPONSE" == *"features"* ]]; then
    echo -e "${GREEN}✅ Features section found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Features section not found${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$MAIN_RESPONSE" == *"integrationPatterns"* ]]; then
    echo -e "${GREEN}✅ Integration patterns section found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Integration patterns section not found${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# ===== SYSTEM STATUS TEST =====
echo "📊 System Status Test"
echo "--------------------"

echo "🔍 Testing system status endpoint..."
STATUS_RESPONSE=$(curl -s "$BASE_URL$API_BASE/status")
echo "Response received: ${#STATUS_RESPONSE} characters"

# Check if status response contains key information
if [[ "$STATUS_RESPONSE" == *"OPERATIONAL"* ]]; then
    echo -e "${GREEN}✅ System status operational${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ System status not operational${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$STATUS_RESPONSE" == *"deployedSystems"* ]]; then
    echo -e "${GREEN}✅ Deployed systems section found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Deployed systems section not found${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$STATUS_RESPONSE" == *"totalEndpoints"* ]]; then
    echo -e "${GREEN}✅ Total endpoints count found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Total endpoints count not found${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# ===== API EXPLORER TEST =====
echo "🔍 API Explorer Test"
echo "-------------------"

echo "🔍 Testing API explorer endpoint..."
EXPLORER_RESPONSE=$(curl -s "$BASE_URL$API_BASE/explorer")
echo "Response received: ${#EXPLORER_RESPONSE} characters"

# Check if explorer response contains key information
if [[ "$EXPLORER_RESPONSE" == *"API Explorer"* ]]; then
    echo -e "${GREEN}✅ API Explorer title found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ API Explorer title not found${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$EXPLORER_RESPONSE" == *"quickStart"* ]]; then
    echo -e "${GREEN}✅ Quick start guide found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Quick start guide not found${NC}"
    ((TESTS_FAILED++))
fi

if [[ "$EXPLORER_RESPONSE" == *"testingTools"* ]]; then
    echo -e "${GREEN}✅ Testing tools section found${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Testing tools section not found${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# ===== CONTENT VALIDATION TEST =====
echo "✅ Content Validation Test"
echo "-------------------------"

echo "🔍 Validating system instructions content..."

# Test main instructions content
MAIN_CONTENT=$(curl -s "$BASE_URL$API_BASE/" | jq -r '.instructions.system.name // empty')
if [ "$MAIN_CONTENT" = "SmartStart Platform" ]; then
    echo -e "${GREEN}✅ System name correctly returned${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ System name incorrect: $MAIN_CONTENT${NC}"
    ((TESTS_FAILED++))
fi

# Test system status content
STATUS_CONTENT=$(curl -s "$BASE_URL$API_BASE/status" | jq -r '.systemStatus.status // empty')
if [ "$STATUS_CONTENT" = "OPERATIONAL" ]; then
    echo -e "${GREEN}✅ System status correctly returned${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ System status incorrect: $STATUS_CONTENT${NC}"
    ((TESTS_FAILED++))
fi

# Test API explorer content
EXPLORER_CONTENT=$(curl -s "$BASE_URL$API_BASE/explorer" | jq -r '.apiExplorer.title // empty')
if [ "$EXPLORER_CONTENT" = "SmartStart API Explorer" ]; then
    echo -e "${GREEN}✅ API Explorer title correctly returned${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ API Explorer title incorrect: $EXPLORER_CONTENT${NC}"
    ((TESTS_FAILED++))
fi

echo ""

# ===== TEST SUMMARY =====
echo "📋 Test Summary"
echo "==============="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! System Instructions API is working perfectly!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
fi

echo ""
echo "🚀 System Instructions API Testing Complete!"
echo "=========================================="
echo ""
echo "📚 Available Endpoints:"
echo "  • GET /api/system/          - Complete system instructions"
echo "  • GET /api/system/status    - System status and metrics"
echo "  • GET /api/system/explorer  - API explorer and quick start guide"
echo ""
echo "🌟 This API provides comprehensive documentation for:"
echo "  • All system features and capabilities"
echo "  • Complete API endpoint documentation"
echo "  • Data models and relationships"
echo "  • Integration patterns and workflows"
echo "  • Development and testing guides"
echo "  • System status and metrics"
