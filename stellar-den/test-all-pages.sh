#!/bin/bash

# AliceSolutionsGroup - Complete Site Testing Script
# Tests all pages and routes for production readiness

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   🧪  ALICESOLUTIONSGROUP - COMPLETE SITE TEST              ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Testing all pages and routes..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to test a page
test_page() {
    local url=$1
    local expected_text=$2
    local page_name=$3
    
    echo -n "Testing $page_name... "
    
    # Check if server is running
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 > /dev/null 2>&1; then
        echo -e "${RED}✗ Server not running${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
    
    # Test the page
    if curl -s http://localhost:8080$url | grep -q "$expected_text"; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Test all pages
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing Main Pages..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_page "/" "AliceSolutionsGroup" "Home Page"
test_page "/about" "I help teams ship" "About Page"
test_page "/services" "build and implement" "Services Page"
test_page "/contact" "Secure Your Future" "Contact Page"
test_page "/smartstart-hub" "Grow Differently" "SmartStart Hub"
test_page "/community" "Connect, Learn, and Grow" "Community Page"
test_page "/iso-studio" "ISO Studio" "ISO Studio"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing API Endpoints..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test API endpoints
echo -n "Testing /api/ping... "
if curl -s http://localhost:8080/api/ping | grep -q "pong"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /api/iso/controls... "
if curl -s http://localhost:8080/api/iso/controls | grep -q "controls"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /api/iso/questions... "
if curl -s http://localhost:8080/api/iso/questions | grep -q "questions"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing Static Assets..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test logos
echo -n "Testing /logo.png... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/logo.png | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /logos/alice-logo-main.png... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/logos/alice-logo-main.png | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /logos/cyber-owl.png... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/logos/cyber-owl.png | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing Certificates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test certificates
echo -n "Testing /certificates/cissp.png... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/certificates/cissp.png | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /certificates/cism.png... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/certificates/cism.png | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /certificates/iso27001-lead-auditor.png... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/certificates/iso27001-lead-auditor.png | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing Icons..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test icons
echo -n "Testing /icons/cybersecurity-shield.svg... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/icons/cybersecurity-shield.svg | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /icons/automation-robot.svg... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/icons/automation-robot.svg | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo -n "Testing /icons/advisory-target.svg... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/icons/advisory-target.svg | grep -q "200"; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL=$((PASSED + FAILED))
PASS_RATE=$((PASSED * 100 / TOTAL))

echo "Total Tests: $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   ✅  ALL TESTS PASSED!                                      ║"
    echo "║                                                               ║"
    echo "║   🚀  SITE IS PRODUCTION-READY!                             ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    exit 0
else
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   ⚠️   SOME TESTS FAILED                                     ║"
    echo "║                                                               ║"
    echo "║   Please review the failed tests above                       ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    exit 1
fi

