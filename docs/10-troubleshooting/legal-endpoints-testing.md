# Legal Endpoints Testing Guide

## Overview

This guide provides comprehensive testing procedures for all legal endpoints in the SmartStart Platform. The legal system is split into two main route groups:

- **`/api/legal-signing`** - Session-based document signing
- **`/api/legal-documents`** - Document management, audit, and compliance

## Quick Testing Script

Use the provided script to test all legal endpoints:

```bash
# Test with default production URL
./docs/10-troubleshooting/legal-endpoints-curl-checks.sh

# Test with custom URL and auth token
./docs/10-troubleshooting/legal-endpoints-curl-checks.sh https://smartstart-api.onrender.com "your-jwt-token-here"

# Test local development
./docs/10-troubleshooting/legal-endpoints-curl-checks.sh http://localhost:3001 "your-jwt-token-here"
```

## Manual Testing

### 1. Legal Signing Endpoints

#### Health Check
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-signing/health"
```

#### Get Available Documents
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-signing/documents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Start Signing Session
```bash
curl -X POST "https://smartstart-api.onrender.com/api/legal-signing/session/start" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentIds": ["doc-123", "doc-456"]}'
```

#### Sign in Session
```bash
curl -X POST "https://smartstart-api.onrender.com/api/legal-signing/session/SESSION_ID/sign" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc-123", "signatureData": {"method": "CLICK_SIGN", "location": "web"}}'
```

#### Get User Signatures
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-signing/user/signatures" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get User Compliance
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-signing/user/compliance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Verify Signature
```bash
curl -X POST "https://smartstart-api.onrender.com/api/legal-signing/verify" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc-123", "signatureHash": "abc123..."}'
```

#### Get User Status
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-signing/status/USER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Legal Documents Endpoints

#### Get Documents List
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-documents/documents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Required Documents
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-documents/documents/required" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Pending Documents
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-documents/documents/pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Sign Document
```bash
curl -X POST "https://smartstart-api.onrender.com/api/legal-documents/documents/DOC_ID/sign" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "CLICK_SIGN", "location": "web", "mfa_verified": false}'
```

#### Verify Document Signature
```bash
curl -X POST "https://smartstart-api.onrender.com/api/legal-documents/documents/verify" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc-123", "signatureHash": "abc123..."}'
```

#### Get Audit Trail
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-documents/audit?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Compliance Report
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-documents/compliance/report?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Document Templates
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-documents/templates" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Download Document
```bash
curl -X GET "https://smartstart-api.onrender.com/api/legal-documents/documents/DOC_ID/download" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o "document.pdf"
```

## Expected Responses

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "documentId",
      "reason": "Document ID is required"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Common Issues and Solutions

### 1. Authentication Errors (401/403)
- **Issue**: Missing or invalid JWT token
- **Solution**: Ensure you have a valid JWT token from login
- **Test**: Use `/api/auth/login` to get a token

### 2. Document Not Found (404)
- **Issue**: Document ID doesn't exist
- **Solution**: Use valid document IDs from `/api/legal-documents/documents`
- **Test**: First get available documents, then use their IDs

### 3. Validation Errors (400)
- **Issue**: Missing required fields or invalid data format
- **Solution**: Check request body matches expected schema
- **Test**: Use the exact JSON structure shown in examples

### 4. Server Errors (500)
- **Issue**: Backend service issues
- **Solution**: Check server logs and health endpoints
- **Test**: Use `/api/legal-signing/health` to verify service status

## Testing Checklist

- [ ] Health check endpoints respond
- [ ] Authentication works with valid JWT
- [ ] Document listing returns data
- [ ] Required/pending documents are accessible
- [ ] Signing sessions can be created
- [ ] Documents can be signed
- [ ] Audit trail is accessible
- [ ] Compliance reports generate
- [ ] Document downloads work
- [ ] Error handling works correctly

## Integration with Frontend

The frontend uses the `legal-documents-api.ts` service which automatically routes requests to the correct endpoints:

- **Signing operations** → `/api/legal-signing/*`
- **Document management** → `/api/legal-documents/*`

This split ensures proper separation of concerns and better API organization.

## Monitoring and Alerts

Set up monitoring for:
- Response times < 2 seconds
- Error rates < 1%
- Authentication success rates > 99%
- Document signing completion rates

## Support

For issues with legal endpoints:
1. Check this testing guide
2. Run the curl checks script
3. Review server logs
4. Contact the development team with specific error details
