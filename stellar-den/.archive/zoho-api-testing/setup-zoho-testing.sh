#!/bin/bash
# Zoho Integration Local Testing Setup

echo "🚀 Setting up Zoho integration for local testing..."

# Set environment variables for current session
export ZOHO_CLIENT_ID="1000.RL5AUX1S0GDMJ72X7WIH0JDA6OQFLV"
export ZOHO_CLIENT_SECRET="4397551227c473f3cc6ea0f398c12f3ff01f90b80e"
export ZOHO_REDIRECT_URI="http://localhost:8080/callback"

echo "✅ Zoho environment variables set:"
echo "   ZOHO_CLIENT_ID: $ZOHO_CLIENT_ID"
echo "   ZOHO_CLIENT_SECRET: [HIDDEN]"
echo "   ZOHO_REDIRECT_URI: $ZOHO_REDIRECT_URI"

echo ""
echo "🧪 To test Zoho integration:"
echo "1. Start the server: npm run dev"
echo "2. Test auth URL: curl http://localhost:8080/api/zoho/auth-url"
echo "3. Test contact form: curl -X POST http://localhost:8080/api/zoho/contact -H 'Content-Type: application/json' -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Test message\"}'"
echo "4. Test connection: curl http://localhost:8080/api/zoho/test"
echo ""
echo "📝 Note: You'll need to complete OAuth flow to get access tokens for full functionality"
