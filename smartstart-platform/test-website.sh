#!/bin/bash

# Comprehensive Website Testing Script
# Tests all critical functionality before deployment

echo "🧪 Starting comprehensive website tests..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project directory
cd "$(dirname "$0")"

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s http://localhost:3346 > /dev/null; then
    echo -e "${GREEN}✅ Server is running on port 3346${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "   Starting server..."
    npm start &
    sleep 5
fi

# Test counter
tests_passed=0
tests_failed=0

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing: $description... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo -e "${GREEN}✅ PASS${NC}"
        tests_passed=$((tests_passed + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        tests_failed=$((tests_failed + 1))
        return 1
    fi
}

# Test all critical pages
echo ""
echo "📄 Testing critical pages..."
test_url "http://localhost:3346/" "Homepage"
test_url "http://localhost:3346/about.html" "About page"
test_url "http://localhost:3346/services.html" "Services page"
test_url "http://localhost:3346/smartstart.html" "SmartStart page"
test_url "http://localhost:3346/contact.html" "Contact page"
test_url "http://localhost:3346/booking.html" "Booking page"
test_url "http://localhost:3346/search.html" "Search page"
test_url "http://localhost:3346/404.html" "404 page"
test_url "http://localhost:3346/admin.html" "Admin panel"

# Test service pages
echo ""
echo "📄 Testing service pages..."
test_url "http://localhost:3346/services/cybersecurity-compliance.html" "Cybersecurity & Compliance"
test_url "http://localhost:3346/services/automation-ai.html" "Automation & AI"
test_url "http://localhost:3346/services/advisory-audits.html" "Advisory & Audits"
test_url "http://localhost:3346/services/teaching-training.html" "Teaching & Training"

# Test location pages
echo ""
echo "📄 Testing location pages..."
test_url "http://localhost:3346/locations/toronto.html" "Toronto"
test_url "http://localhost:3346/locations/mississauga.html" "Mississauga"
test_url "http://localhost:3346/locations/markham.html" "Markham"

# Test community pages
echo ""
echo "📄 Testing community pages..."
test_url "http://localhost:3346/community/community.html" "Community Hub"
test_url "http://localhost:3346/community/news.html" "Community News"

# Test static assets
echo ""
echo "📄 Testing static assets..."
test_url "http://localhost:3346/assets/css/styles.css" "Main CSS"
test_url "http://localhost:3346/assets/js/script.js" "Main JS"
test_url "http://localhost:3346/assets/js/load-components.js" "Load Components JS"
test_url "http://localhost:3346/assets/js/search.js" "Search JS"
test_url "http://localhost:3346/favicon.ico" "Favicon"

# Test API endpoints
echo ""
echo "📄 Testing API endpoints..."
test_url "http://localhost:3346/api/admin/analytics" "Analytics API"
test_url "http://localhost:3346/api/admin/debug" "Debug API"

# Test SEO files
echo ""
echo "📄 Testing SEO files..."
test_url "http://localhost:3346/robots.txt" "robots.txt"
test_url "http://localhost:3346/sitemap.xml" "sitemap.xml"

# Check for console errors in HTML
echo ""
echo "🔍 Checking HTML validity..."
echo -n "Checking homepage HTML... "
if curl -s http://localhost:3346/ | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ PASS${NC}"
    tests_passed=$((tests_passed + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    tests_failed=$((tests_failed + 1))
fi

# Check for mobile menu
echo -n "Checking mobile menu... "
if curl -s http://localhost:3346/ | grep -q "mobile-menu-toggle"; then
    echo -e "${GREEN}✅ PASS${NC}"
    tests_passed=$((tests_passed + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    tests_failed=$((tests_failed + 1))
fi

# Check for search functionality
echo -n "Checking search functionality... "
if curl -s http://localhost:3346/ | grep -q "search.html"; then
    echo -e "${GREEN}✅ PASS${NC}"
    tests_passed=$((tests_passed + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    tests_failed=$((tests_failed + 1))
fi

# Check for analytics tracking
echo -n "Checking analytics tracking... "
if curl -s http://localhost:3346/ | grep -q "analytics-tracker"; then
    echo -e "${GREEN}✅ PASS${NC}"
    tests_passed=$((tests_passed + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    tests_failed=$((tests_failed + 1))
fi

# Performance check
echo ""
echo "⚡ Performance check..."
echo -n "Homepage load time... "
load_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3346/)
if (( $(echo "$load_time < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS (${load_time}s)${NC}"
    tests_passed=$((tests_passed + 1))
else
    echo -e "${YELLOW}⚠️  SLOW (${load_time}s)${NC}"
    tests_failed=$((tests_failed + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary:"
echo "  ✅ Passed: $tests_passed"
echo "  ❌ Failed: $tests_failed"
echo "  📊 Total:  $((tests_passed + tests_failed))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $tests_failed -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Website is ready for deployment.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please review and fix issues before deploying.${NC}"
    exit 1
fi

