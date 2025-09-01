#!/bin/bash

# SmartStart API Full Test Script
# This script tests all the new endpoints once they're deployed

API_BASE="https://smartstart-api.onrender.com/api/v1"

echo "🚀 SmartStart API Full Test Script"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
curl -s "$API_BASE/../health" | jq '.'
echo ""

# Test 2: Database Status
echo "2️⃣ Testing Database Status..."
curl -s "$API_BASE/test/status" | jq '.'
echo ""

# Test 3: Migration (Create Tables)
echo "3️⃣ Testing Migration Endpoint..."
MIGRATION_RESPONSE=$(curl -s -X POST "$API_BASE/migrate")
echo "$MIGRATION_RESPONSE" | jq '.'
echo ""

# Wait a bit for tables to be created
echo "⏳ Waiting for tables to be created..."
sleep 5

# Test 4: Check Status Again
echo "4️⃣ Checking Database Status After Migration..."
curl -s "$API_BASE/test/status" | jq '.'
echo ""

# Test 5: Create Test User
echo "5️⃣ Testing Create User..."
USER_RESPONSE=$(curl -s -X POST "$API_BASE/test/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "level": "WISE_OWL",
    "xp": 150
  }')
echo "$USER_RESPONSE" | jq '.'
USER_ID=$(echo "$USER_RESPONSE" | jq -r '.user.id // empty')
echo ""

# Test 6: Create Test Badge
echo "6️⃣ Testing Create Badge..."
curl -s -X POST "$API_BASE/test/badges" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First Badge",
    "description": "Awarded for first test",
    "icon": "🌟",
    "category": "achievement",
    "rarity": "COMMON"
  }' | jq '.'
echo ""

# Test 7: Create Test Skill
echo "7️⃣ Testing Create Skill..."
curl -s -X POST "$API_BASE/test/skills" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Testing",
    "category": "testing",
    "description": "Skill in testing APIs"
  }' | jq '.'
echo ""

# Test 8: Upload Test File
echo "8️⃣ Testing File Upload..."
curl -s -X POST "$API_BASE/test/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.txt",
    "content": "This is a test file content",
    "mimeType": "text/plain"
  }' | jq '.'
echo ""

# Test 9: Get All Data
echo "9️⃣ Testing Get All Data..."
curl -s "$API_BASE/test/data" | jq '.'
echo ""

# Test 10: Get All Files
echo "🔟 Testing Get Files..."
curl -s "$API_BASE/test/files" | jq '.'
echo ""

# Test 11: Update User (if we have a user ID)
if [ ! -z "$USER_ID" ]; then
    echo "1️⃣1️⃣ Testing Update User..."
    curl -s -X PUT "$API_BASE/test/users/$USER_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Updated Test User",
        "xp": 200
      }' | jq '.'
    echo ""
else
    echo "1️⃣1️⃣ Skipping Update User (no user ID)"
    echo ""
fi

# Test 12: Get All Data Again
echo "1️⃣2️⃣ Testing Get All Data (After Creation)..."
curl -s "$API_BASE/test/data" | jq '.'
echo ""

# Test 13: Delete User (if we have a user ID)
if [ ! -z "$USER_ID" ]; then
    echo "1️⃣3️⃣ Testing Delete User..."
    curl -s -X DELETE "$API_BASE/test/users/$USER_ID" | jq '.'
    echo ""
else
    echo "1️⃣3️⃣ Skipping Delete User (no user ID)"
    echo ""
fi

# Test 14: Final Status Check
echo "1️⃣4️⃣ Final Database Status Check..."
curl -s "$API_BASE/test/status" | jq '.'
echo ""

echo "✅ Full API Testing Complete!"
echo "Check the responses above for any errors or issues."
echo ""
echo "🎉 If everything worked, you now have:"
echo "   • Database tables created"
echo "   • Test data created and managed"
echo "   • Full CRUD operations working"
echo "   • File upload simulation working"
echo "   • Ready for frontend development!"
