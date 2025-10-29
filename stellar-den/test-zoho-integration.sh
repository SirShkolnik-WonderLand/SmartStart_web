#!/bin/bash
# Zoho Integration Testing Script

echo "🧪 ZOHO INTEGRATION LOCAL TESTING"
echo "=================================="

# Set environment variables
export ZOHO_CLIENT_ID="1000.RL5AUX1S0GDMJ72X7WIH0JDA6OQFLV"
export ZOHO_CLIENT_SECRET="4397551227c473f3cc6ea0f398c12f3ff01f90b80e"
export ZOHO_REDIRECT_URI="http://localhost:8080/callback"

echo "📋 Environment Variables Set:"
echo "   ZOHO_CLIENT_ID: $ZOHO_CLIENT_ID"
echo "   ZOHO_CLIENT_SECRET: [HIDDEN]"
echo "   ZOHO_REDIRECT_URI: $ZOHO_REDIRECT_URI"
echo ""

# Check if server is running
echo "🔍 Checking if server is running on localhost:8080..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Server is running!"
else
    echo "❌ Server is not running. Please start it with: npm run dev"
    echo "   Then run this script again."
    exit 1
fi

echo ""
echo "🧪 Running Zoho Integration Tests..."
echo "===================================="

# Test 1: Check Zoho service configuration
echo ""
echo "Test 1: Zoho Service Configuration"
echo "---------------------------------"
curl -s http://localhost:8080/api/zoho/test | jq '.' || echo "❌ Test 1 failed"

# Test 2: Get OAuth authorization URL
echo ""
echo "Test 2: OAuth Authorization URL"
echo "-------------------------------"
AUTH_RESPONSE=$(curl -s http://localhost:8080/api/zoho/auth-url)
echo "$AUTH_RESPONSE" | jq '.' || echo "❌ Test 2 failed"

# Extract auth URL for manual testing
AUTH_URL=$(echo "$AUTH_RESPONSE" | jq -r '.authUrl' 2>/dev/null)
if [ "$AUTH_URL" != "null" ] && [ "$AUTH_URL" != "" ]; then
    echo ""
    echo "🔗 Manual OAuth Test URL:"
    echo "   $AUTH_URL"
    echo ""
    echo "📝 To complete OAuth flow:"
    echo "   1. Open the URL above in your browser"
    echo "   2. Authorize the application"
    echo "   3. Copy the 'code' parameter from the callback URL"
    echo "   4. Use it in Test 3 below"
fi

# Test 3: Test contact form (without OAuth - should show error)
echo ""
echo "Test 3: Contact Form (Without OAuth)"
echo "-----------------------------------"
CONTACT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/zoho/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "phone": "+1-555-0123",
    "service": "General Inquiry",
    "message": "This is a test message from the local testing script."
  }')

echo "$CONTACT_RESPONSE" | jq '.' || echo "❌ Test 3 failed"

# Test 4: Test email sending (without OAuth - should show error)
echo ""
echo "Test 4: Email Sending (Without OAuth)"
echo "-------------------------------------"
EMAIL_RESPONSE=$(curl -s -X POST http://localhost:8080/api/zoho/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email from Zoho Integration",
    "content": "This is a test email sent via Zoho Mail API.",
    "from": "noreply@alicesolutionsgroup.com"
  }')

echo "$EMAIL_RESPONSE" | jq '.' || echo "❌ Test 4 failed"

# Test 5: Test calendar event creation (without OAuth - should show error)
echo ""
echo "Test 5: Calendar Event (Without OAuth)"
echo "--------------------------------------"
CALENDAR_RESPONSE=$(curl -s -X POST http://localhost:8080/api/zoho/calendar/event \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "startTime": "2025-01-15T10:00:00Z",
    "endTime": "2025-01-15T11:00:00Z",
    "description": "Test calendar event from Zoho integration",
    "attendees": ["test@example.com"]
  }')

echo "$CALENDAR_RESPONSE" | jq '.' || echo "❌ Test 5 failed"

echo ""
echo "📊 TEST SUMMARY"
echo "==============="
echo "✅ All tests completed!"
echo ""
echo "📝 Next Steps:"
echo "1. Complete OAuth flow using the auth URL above"
echo "2. Test with real OAuth token"
echo "3. Verify contact forms work end-to-end"
echo "4. Test email sending with real Zoho Mail"
echo "5. Test calendar integration"
echo ""
echo "🔧 To test with OAuth token:"
echo "   curl -X POST http://localhost:8080/api/zoho/auth/callback \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"code\":\"YOUR_OAUTH_CODE\"}'"
