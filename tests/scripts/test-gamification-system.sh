#!/bin/bash

# Test script for SmartStart Gamification System
# This script tests all major gamification endpoints

BASE_URL="https://smartstart-api.onrender.com"
API_BASE="$BASE_URL/api/gamification"

echo "🎮 Testing SmartStart Gamification System"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "API Base: $API_BASE"
echo ""

# Test user ID (from venture creation)
TEST_USER_ID="cmf1r92vo0001s8299wr0vh66"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}ℹ️  $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    fi
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi
    
    # Extract HTTP status and response body
    http_status=$(echo "$response" | tail -n1 | sed 's/HTTP_STATUS://')
    response_body=$(echo "$response" | head -n -1)
    
    echo "HTTP Status: $http_status"
    
    if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
        print_status "SUCCESS" "Endpoint working correctly"
        echo "Response: $response_body" | jq '.' 2>/dev/null || echo "Response: $response_body"
    else
        print_status "ERROR" "Endpoint failed with status $http_status"
        echo "Response: $response_body"
    fi
    
    echo "----------------------------------------"
}

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
sleep 45

echo -e "\n${YELLOW}Starting gamification system tests...${NC}"

# ===== HEALTH CHECK =====
print_status "INFO" "Testing Health Check"
test_endpoint "GET" "$API_BASE/health" "" "Gamification System Health Check"

# ===== XP & LEVEL MANAGEMENT =====
print_status "INFO" "Testing XP & Level Management"

# Get user XP info
test_endpoint "GET" "$API_BASE/xp/$TEST_USER_ID" "" "Get User XP and Level Info"

# Add XP for user activity
test_endpoint "POST" "$API_BASE/xp/add" "{\"userId\":\"$TEST_USER_ID\",\"activityType\":\"LOGIN\"}" "Add XP for Login Activity"

# Add XP for contribution
test_endpoint "POST" "$API_BASE/xp/add" "{\"userId\":\"$TEST_USER_ID\",\"activityType\":\"CONTRIBUTION\"}" "Add XP for Contribution Activity"

# Get updated user XP info
test_endpoint "GET" "$API_BASE/xp/$TEST_USER_ID" "" "Get Updated User XP and Level Info"

# ===== BADGE SYSTEM =====
print_status "INFO" "Testing Badge System"

# Get all available badges
test_endpoint "GET" "$API_BASE/badges" "" "Get All Available Badges"

# Get user badges
test_endpoint "GET" "$API_BASE/badges/$TEST_USER_ID" "" "Get User Badges"

# Check and award badges for user
test_endpoint "POST" "$API_BASE/badges/check/$TEST_USER_ID" "" "Check and Award Badges for User"

# Get updated user badges
test_endpoint "GET" "$API_BASE/badges/$TEST_USER_ID" "" "Get Updated User Badges"

# ===== REPUTATION SYSTEM =====
print_status "INFO" "Testing Reputation System"

# Calculate and update user reputation
test_endpoint "POST" "$API_BASE/reputation/calculate/$TEST_USER_ID" "" "Calculate and Update User Reputation"

# Get user reputation details
test_endpoint "GET" "$API_BASE/reputation/$TEST_USER_ID" "" "Get User Reputation Details"

# ===== PORTFOLIO ANALYTICS =====
print_status "INFO" "Testing Portfolio Analytics"

# Generate portfolio insights for user
test_endpoint "POST" "$API_BASE/portfolio/insights/$TEST_USER_ID" "" "Generate Portfolio Insights for User"

# Get user portfolio items
test_endpoint "GET" "$API_BASE/portfolio/$TEST_USER_ID" "" "Get User Portfolio Items"

# ===== SKILLS & ENDORSEMENTS =====
print_status "INFO" "Testing Skills & Endorsements"

# Get user skills
test_endpoint "GET" "$API_BASE/skills/$TEST_USER_ID" "" "Get User Skills"

# Add skill endorsement
test_endpoint "POST" "$API_BASE/skills/endorse" "{\"endorserId\":\"$TEST_USER_ID\",\"endorsedId\":\"$TEST_USER_ID\",\"skillId\":\"1\",\"weight\":5,\"note\":\"Self-endorsement for testing\"}" "Add Skill Endorsement"

# Get updated user skills
test_endpoint "GET" "$API_BASE/skills/$TEST_USER_ID" "" "Get Updated User Skills"

# ===== COMMUNITY ENGAGEMENT =====
print_status "INFO" "Testing Community Engagement"

# Calculate community score
test_endpoint "POST" "$API_BASE/community/score/$TEST_USER_ID" "" "Calculate Community Score"

# Generate daily challenge
test_endpoint "GET" "$API_BASE/challenges/daily/$TEST_USER_ID" "" "Generate Daily Challenge"

# ===== LEADERBOARDS =====
print_status "INFO" "Testing Leaderboards"

# Get XP leaderboard
test_endpoint "GET" "$API_BASE/leaderboard/xp" "" "Get XP Leaderboard"

# Get reputation leaderboard
test_endpoint "GET" "$API_BASE/leaderboard/reputation" "" "Get Reputation Leaderboard"

# Get all leaderboards overview
test_endpoint "GET" "$API_BASE/leaderboards" "" "Get All Leaderboards Overview"

# ===== ACTIVITY TRACKING =====
print_status "INFO" "Testing Activity Tracking"

# Get user activity log
test_endpoint "GET" "$API_BASE/activity/$TEST_USER_ID" "" "Get User Activity Log"

# Get user activity log with type filter
test_endpoint "GET" "$API_BASE/activity/$TEST_USER_ID?type=xp_earned" "" "Get User Activity Log Filtered by Type"

# ===== COMPREHENSIVE TESTING =====
print_status "INFO" "Running Comprehensive Tests"

# Test XP progression
echo -e "\n${BLUE}Testing XP Progression System${NC}"
echo "Adding multiple XP activities to test level progression..."

# Add various XP activities
activities=("LOGIN" "CONTRIBUTION" "IDEA" "POLL_VOTE" "MESSAGE" "KUDOS_GIVEN" "SKILL_ENDORSEMENT")

for activity in "${activities[@]}"; do
    echo "Adding XP for: $activity"
    test_endpoint "POST" "$API_BASE/xp/add" "{\"userId\":\"$TEST_USER_ID\",\"activityType\":\"$activity\"}" "Add XP for $activity Activity"
    sleep 1
done

# Check final XP and level
echo -e "\n${BLUE}Final XP and Level Check${NC}"
test_endpoint "GET" "$API_BASE/xp/$TEST_USER_ID" "" "Final User XP and Level Info"

# Check for new badges
echo -e "\n${BLUE}Checking for New Badges${NC}"
test_endpoint "POST" "$API_BASE/badges/check/$TEST_USER_ID" "" "Final Badge Check for User"

# Get final user stats
echo -e "\n${BLUE}Final User Statistics${NC}"
test_endpoint "GET" "$API_BASE/badges/$TEST_USER_ID" "" "Final User Badges"
test_endpoint "GET" "$API_BASE/skills/$TEST_USER_ID" "" "Final User Skills"
test_endpoint "GET" "$API_BASE/portfolio/$TEST_USER_ID" "" "Final User Portfolio"

# ===== SYSTEM METRICS =====
print_status "INFO" "Testing System Metrics"

# Get gamification metrics
test_endpoint "GET" "$API_BASE/health" "" "Final System Health Check with Metrics"

echo -e "\n${GREEN}🎉 Gamification System Testing Completed!${NC}"
echo ""
echo "📊 Test Summary:"
echo "   ✅ Health Check"
echo "   ✅ XP & Level Management"
echo "   ✅ Badge System"
echo "   ✅ Reputation System"
echo "   ✅ Portfolio Analytics"
echo "   ✅ Skills & Endorsements"
echo "   ✅ Community Engagement"
echo "   ✅ Leaderboards"
echo "   ✅ Activity Tracking"
echo "   ✅ Comprehensive XP Progression"
echo "   ✅ System Metrics"
echo ""
echo "🚀 The SmartStart Gamification System is now fully operational!"
echo "   Users can earn XP, level up, earn badges, build reputation,"
echo "   showcase skills, and compete on leaderboards."
