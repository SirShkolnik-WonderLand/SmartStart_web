# 🔐 ZOHO OAUTH TESTING GUIDE

## Quick OAuth Flow Test

### Step 1: Get Authorization URL
```bash
curl http://localhost:8080/api/zoho/auth-url
```

### Step 2: Complete OAuth Flow
1. **Copy the `authUrl`** from the response
2. **Open in browser** and log in to your Zoho account
3. **Authorize the application**
4. **Copy the `code`** parameter from the callback URL
5. **Exchange for tokens**:

```bash
curl -X POST http://localhost:8080/api/zoho/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"YOUR_CODE_FROM_CALLBACK"}'
```

### Step 3: Test Full Integration
After getting tokens, test the contact form:

```bash
curl -X POST http://localhost:8080/api/zoho/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OAuth Test User",
    "email": "oauth-test@example.com",
    "company": "OAuth Test Company",
    "phone": "+1-555-OAUTH",
    "service": "OAuth Testing",
    "message": "Testing OAuth integration with real Zoho APIs."
  }'
```

## Expected Results

### ✅ Success Response:
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "contactId": "123456789",
  "emailSent": true
}
```

### What Happens:
1. **Contact created** in Zoho CRM
2. **Notification email** sent to `udi.shkolnik@alicesolutionsgroup.com`
3. **Auto-reply email** sent to customer
4. **Contact ID** returned for tracking

## Production Deployment

### Environment Variables for Render:
```
ZOHO_CLIENT_ID=1000.RL5AUX1S0GDMJ72X7WIH0JDA6OQFLV
ZOHO_CLIENT_SECRET=4397551227c473f3cc6ea0f398c12f3ff01f90b80e
ZOHO_REDIRECT_URI=https://alicesolutionsgroup.com/callback
```

### Update Zoho Console:
1. Go to [Zoho API Console](https://api-console.zohocloud.ca/)
2. Update **Authorized Redirect URIs** to include:
   - `https://alicesolutionsgroup.com/callback`
   - `https://www.alicesolutionsgroup.com/callback`

## Troubleshooting

### Common Issues:
- **"Invalid redirect URI"** → Check redirect URI in Zoho console
- **"Invalid client"** → Verify client ID and secret
- **"Token expired"** → Tokens auto-refresh, but may need re-authorization
- **"Scope insufficient"** → Ensure all required scopes are granted

### Debug Commands:
```bash
# Check service status
curl http://localhost:8080/api/zoho/test

# Check auth URL
curl http://localhost:8080/api/zoho/auth-url

# Test without OAuth (should fail)
curl -X POST http://localhost:8080/api/zoho/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}'
```
