#!/bin/bash

# Legal Endpoints Curl Checks Script
# This script tests all legal endpoints to verify they're working correctly
# Usage: ./legal-endpoints-curl-checks.sh [BASE_URL] [AUTH_TOKEN]

set -e

# Default values
BASE_URL=${1:-"https://smartstart-api.onrender.com"}
AUTH_TOKEN=${2:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Legal Endpoints Curl Checks${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Auth Token: ${AUTH_TOKEN:0:20}...${NC}"
echo ""

# Function to make curl request and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=${4:-200}
    local data=$5
    
    echo -e "${YELLOW}Testing: ${method} ${endpoint}${NC}"
    echo -e "Description: ${description}"
    
    # Build curl command
    local curl_cmd="curl -s -w '%{http_code}' -o /tmp/response.json"
    
    if [ -n "$AUTH_TOKEN" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $AUTH_TOKEN'"
    fi
    
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        curl_cmd="$curl_cmd -X POST -d '$data'"
    elif [ "$method" = "GET" ]; then
        curl_cmd="$curl_cmd -X GET"
    fi
    
    curl_cmd="$curl_cmd '$BASE_URL$endpoint'"
    
    # Execute curl command
    local response_code=$(eval $curl_cmd)
    
    # Check response
    if [ "$response_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ SUCCESS (${response_code})${NC}"
        if [ -f /tmp/response.json ]; then
            echo -e "${GREEN}Response: $(cat /tmp/response.json | head -c 100)...${NC}"
        fi
    else
        echo -e "${RED}❌ FAILED (${response_code}, expected ${expected_status})${NC}"
        if [ -f /tmp/response.json ]; then
            echo -e "${RED}Response: $(cat /tmp/response.json)${NC}"
        fi
    fi
    
    echo ""
}

# Test Legal Signing Endpoints
echo -e "${BLUE}📝 Legal Signing Endpoints${NC}"
echo "================================"

test_endpoint "GET" "/api/legal-signing/health" "Health check"
test_endpoint "GET" "/api/legal-signing/documents" "Get available documents"
test_endpoint "GET" "/api/legal-signing/documents/test-doc-id" "Get specific document" 404
test_endpoint "POST" "/api/legal-signing/session/start" "Start signing session" 400 '{"documentIds": []}'
test_endpoint "GET" "/api/legal-signing/session/test-session-id" "Get session status" 404
test_endpoint "GET" "/api/legal-signing/user/signatures" "Get user signatures"
test_endpoint "GET" "/api/legal-signing/user/compliance" "Get user compliance"
test_endpoint "POST" "/api/legal-signing/verify" "Verify signature" 400 '{"documentId": "", "signatureHash": ""}'
test_endpoint "GET" "/api/legal-signing/status/test-user-id" "Get user status" 404

# Test Legal Documents Endpoints
echo -e "${BLUE}📋 Legal Documents Endpoints${NC}"
echo "================================"

test_endpoint "GET" "/api/legal-documents/documents" "Get documents list"
test_endpoint "GET" "/api/legal-documents/documents/test-doc-id" "Get specific document" 404
test_endpoint "GET" "/api/legal-documents/documents/required" "Get required documents"
test_endpoint "GET" "/api/legal-documents/documents/pending" "Get pending documents"
test_endpoint "POST" "/api/legal-documents/documents/test-doc-id/sign" "Sign document" 404 '{"method": "CLICK_SIGN"}'
test_endpoint "POST" "/api/legal-documents/documents/verify" "Verify document signature" 400 '{"documentId": "", "signatureHash": ""}'
test_endpoint "GET" "/api/legal-documents/audit" "Get audit trail"
test_endpoint "GET" "/api/legal-documents/compliance/report" "Get compliance report" 400
test_endpoint "GET" "/api/legal-documents/templates" "Get document templates"
test_endpoint "GET" "/api/legal-documents/documents/test-doc-id/download" "Download document" 404

# Test with query parameters
echo -e "${BLUE}🔍 Testing with Query Parameters${NC}"
echo "================================"

test_endpoint "GET" "/api/legal-documents/audit?page=1&limit=10" "Get audit trail with pagination"
test_endpoint "GET" "/api/legal-documents/compliance/report?startDate=2024-01-01&endDate=2024-12-31" "Get compliance report with date range"

# Summary
echo -e "${BLUE}📊 Summary${NC}"
echo "================================"
echo -e "${GREEN}✅ All legal endpoints tested${NC}"
echo -e "${YELLOW}Note: Some endpoints may return 404/400 for test data, which is expected${NC}"
echo -e "${YELLOW}Note: Authentication required for most endpoints${NC}"
echo ""

# Cleanup
rm -f /tmp/response.json

echo -e "${BLUE}🎉 Legal endpoints curl checks completed!${NC}"
