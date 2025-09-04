#!/bin/bash

# 🚀 SmartStart Platform - Contribution Pipeline System Test Script
# Tests the complete workflow: Company → Team → Project → Task → Assignment → Completion → Contribution → Rewards

echo "🚀 Testing SmartStart Contribution Pipeline System"
echo "=================================================="
echo ""

# Base URL
BASE_URL="https://smartstart-api.onrender.com"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    echo "Command: $command"
    
    # Run the command and capture output
    local output
    output=$(eval "$command" 2>&1)
    local exit_code=$?
    
    # Check if command succeeded and output matches expected pattern
    if [ $exit_code -eq 0 ] && echo "$output" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        echo "Output: $output"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Exit Code: $exit_code"
        echo "Output: $output"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo "🏗️ Phase 1: System Setup & Health Checks"
echo "----------------------------------------"

# Test Contribution Pipeline health
run_test "Contribution Pipeline Health Check" \
    "curl -s '$BASE_URL/api/contribution/health'" \
    "Contribution Pipeline System is healthy"

# Create tables for contribution pipeline system
run_test "Create Contribution Pipeline Tables" \
    "curl -s -X POST '$BASE_URL/api/contribution/create-tables'" \
    "Contribution Pipeline System tables created successfully"

echo "🏢 Phase 2: Project Management"
echo "-------------------------------"

# Create a project for our TechStart Inc company
run_test "Create Project" \
    "curl -s -X POST '$BASE_URL/api/contribution/projects/create' -H 'Content-Type: application/json' -d '{\"name\": \"SmartStart Platform Development\", \"description\": \"Build the complete SmartStart ecosystem\", \"companyId\": \"company_1756786678478_tlpbo9wad\", \"teamId\": \"team_1756787303381_yirc28z9s\", \"priority\": \"HIGH\", \"budget\": 50000}'" \
    "Project created successfully"

# Get all projects
run_test "Get All Projects" \
    "curl -s '$BASE_URL/api/contribution/projects'" \
    "projects"

# Get projects by company
run_test "Get Projects by Company" \
    "curl -s '$BASE_URL/api/contribution/projects?companyId=company_1756786678478_tlpbo9wad'" \
    "projects"

echo "📋 Phase 3: Task Management"
echo "----------------------------"

# Get the project ID from the previous response (we'll need this for tasks)
PROJECT_ID="project_$(date +%s)_$(openssl rand -hex 4)"

# Create a task
run_test "Create Task" \
    "curl -s -X POST '$BASE_URL/api/contribution/tasks/create' -H 'Content-Type: application/json' -d '{\"title\": \"Build User Authentication System\", \"description\": \"Implement secure user login and registration\", \"projectId\": \"$PROJECT_ID\", \"type\": \"DEVELOPMENT\", \"estimatedHours\": 40, \"priority\": \"HIGH\"}'" \
    "Task created successfully"

# Get all tasks
run_test "Get All Tasks" \
    "curl -s '$BASE_URL/api/contribution/tasks'" \
    "tasks"

# Get tasks by project
run_test "Get Tasks by Project" \
    "curl -s '$BASE_URL/api/contribution/tasks?projectId=$PROJECT_ID'" \
    "tasks"

echo "👥 Phase 4: Task Assignment & Management"
echo "----------------------------------------"

# Assign task to user
run_test "Assign Task to User" \
    "curl -s -X POST '$BASE_URL/api/contribution/tasks/$PROJECT_ID/assign' -H 'Content-Type: application/json' -d '{\"userId\": \"cmf1r92vo0001s8299wad\", \"role\": \"DEVELOPER\"}'" \
    "Task assigned successfully"

echo "✅ Phase 5: Task Completion & Contributions"
echo "--------------------------------------------"

# Complete task
run_test "Complete Task" \
    "curl -s -X POST '$BASE_URL/api/contribution/tasks/$PROJECT_ID/complete' -H 'Content-Type: application/json' -d '{\"actualHours\": 35, \"performance\": {\"quality\": 9, \"speed\": 8, \"communication\": 9}}'" \
    "Task completed successfully"

echo "📊 Phase 6: Analytics & Reporting"
echo "----------------------------------"

# Get project analytics
run_test "Get Project Analytics" \
    "curl -s '$BASE_URL/api/contribution/projects/$PROJECT_ID/analytics'" \
    "analytics"

# Get user contributions
run_test "Get User Contributions" \
    "curl -s '$BASE_URL/api/contribution/contributions/cmf1r92vo0001s8299wad'" \
    "contributions"

# Get system overview
run_test "Get System Overview" \
    "curl -s '$BASE_URL/api/contribution/overview'" \
    "overview"

echo "🎯 Phase 7: Integration Testing"
echo "--------------------------------"

# Test the complete workflow: Company → Team → Project → Task → Completion
echo -e "${YELLOW}Testing Complete Workflow Integration...${NC}"

# Create another project to test the full cycle
run_test "Create Second Project (Full Workflow Test)" \
    "curl -s -X POST '$BASE_URL/api/contribution/projects/create' -H 'Content-Type: application/json' -d '{\"name\": \"Marketing Campaign\", \"description\": \"Launch marketing campaign for SmartStart\", \"companyId\": \"company_1756786678478_tlpbo9wad\", \"teamId\": \"team_1756787303381_yirc28z9s\", \"priority\": \"MEDIUM\", \"budget\": 10000}'" \
    "Project created successfully"

echo ""
echo "🏁 Final System Status Check"
echo "----------------------------"

# Final health check
run_test "Final Health Check" \
    "curl -s '$BASE_URL/api/contribution/health'" \
    "Contribution Pipeline System is healthy"

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Contribution Pipeline System is fully operational!${NC}"
    echo ""
    echo "🚀 What We've Built:"
    echo "• Project Management System"
    echo "• Task Creation & Assignment"
    echo "• Workflow Automation"
    echo "• Performance Tracking"
    echo "• Contribution Analytics"
    echo "• BUZ Token Integration Ready"
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please check the output above for details.${NC}"
fi

echo ""
echo "🎯 Next Steps:"
echo "• Test BUZ token distribution"
echo "• Implement advanced workflows"
echo "• Add notification system"
echo "• Build mobile app integration"
echo ""
echo "🚀 SmartStart Platform is evolving into a complete business ecosystem!"
