# SmartStart Legal Document API Documentation
## Complete API Reference for Legal Document Management System

**Version:** 2.0  
**Last Updated:** September 2025  
**Base URL:** `https://api.smartstart.com`  
**Governing Law:** Ontario, Canada

---

## Overview

This documentation provides comprehensive information about the SmartStart Legal Document Management API, including authentication, endpoints, request/response formats, and examples.

---

## Authentication

### **JWT Token Authentication**
All API requests require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### **Token Format**
```json
{
  "sub": "user-id",
  "accountId": "account-id",
  "userId": "user-id",
  "roleId": "role-id",
  "roleName": "MEMBER",
  "roleLevel": 1,
  "iat": 1640995200,
  "exp": 1641081600
}
```

### **Token Refresh**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

---

## Base URL and Versioning

### **Base URL**
```
Production: https://api.smartstart.com
Staging: https://staging-api.smartstart.com
Development: http://localhost:5000
```

### **API Versioning**
All endpoints are versioned using the URL path:
```
/api/v1/legal/documents
```

---

## Error Handling

### **Error Response Format**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "requestId": "req-123456789"
  }
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### **Common Error Codes**
- `INVALID_TOKEN` - Invalid or expired JWT token
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `DOCUMENT_NOT_FOUND` - Requested document not found
- `DOCUMENT_ALREADY_SIGNED` - Document already signed by user
- `INVALID_SIGNATURE_DATA` - Invalid signature data provided
- `RATE_LIMIT_EXCEEDED` - API rate limit exceeded

---

## Legal Documents API

### **Get Available Documents**
Retrieve all documents available for the authenticated user based on their RBAC level.

```http
GET /api/v1/legal/documents
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ppa",
      "name": "Platform Participation Agreement",
      "legal_name": "Platform Participation Agreement (PPA)",
      "version": "2.0",
      "category": "01-core-platform",
      "rbac_level": "GUEST",
      "template_path": "docs/08-legal/01-core-platform/platform-participation-agreement.md",
      "is_required": true,
      "is_template": false,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "userStatus": {
        "status": "required",
        "signed_at": null,
        "expires_at": null,
        "document_version": "2.0",
        "signature_hash": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### **Get Required Documents**
Retrieve only documents that are required for the user's current access level.

```http
GET /api/v1/legal/documents/required
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ppa",
      "name": "Platform Participation Agreement",
      "legal_name": "Platform Participation Agreement (PPA)",
      "version": "2.0",
      "category": "01-core-platform",
      "rbac_level": "GUEST",
      "is_required": true,
      "userStatus": {
        "status": "required"
      }
    }
  ]
}
```

### **Get Pending Documents**
Retrieve documents that will be required for the next access level.

```http
GET /api/v1/legal/documents/pending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mnda",
      "name": "Mutual Non-Disclosure Agreement",
      "legal_name": "Mutual Non-Disclosure Agreement (MNDA)",
      "version": "2.0",
      "category": "01-core-platform",
      "rbac_level": "MEMBER",
      "is_required": true,
      "userStatus": {
        "status": "not_required"
      }
    }
  ]
}
```

### **Get Specific Document**
Retrieve details for a specific document.

```http
GET /api/v1/legal/documents/{documentId}
Authorization: Bearer <token>
```

**Parameters:**
- `documentId` (string, required) - The ID of the document to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ppa",
    "name": "Platform Participation Agreement",
    "legal_name": "Platform Participation Agreement (PPA)",
    "version": "2.0",
    "category": "01-core-platform",
    "rbac_level": "GUEST",
    "template_path": "docs/08-legal/01-core-platform/platform-participation-agreement.md",
    "is_required": true,
    "is_template": false,
    "content": "# Platform Participation Agreement\n\n...",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "userStatus": {
      "status": "required",
      "signed_at": null,
      "expires_at": null,
      "document_version": "2.0",
      "signature_hash": null
    }
  }
}
```

### **Sign Document**
Sign a legal document with digital signature.

```http
POST /api/v1/legal/documents/{documentId}/sign
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "click",
  "mfa_verified": true,
  "location": {
    "country": "CA",
    "region": "ON",
    "city": "Toronto"
  },
  "device_info": {
    "browser": "Chrome",
    "version": "120.0.0.0",
    "os": "Windows 10"
  }
}
```

**Parameters:**
- `documentId` (string, required) - The ID of the document to sign

**Request Body:**
- `method` (string, required) - Signature method ("click", "biometric", "certificate")
- `mfa_verified` (boolean, required) - Whether MFA was verified
- `location` (object, optional) - Geographic location data
- `device_info` (object, optional) - Device and browser information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sig-123456789",
    "user_id": "user-123",
    "document_id": "ppa",
    "document_version": "2.0",
    "signature_method": "click",
    "signature_data": {
      "method": "click",
      "mfa_verified": true,
      "location": {
        "country": "CA",
        "region": "ON",
        "city": "Toronto"
      },
      "device_info": {
        "browser": "Chrome",
        "version": "120.0.0.0",
        "os": "Windows 10"
      }
    },
    "document_hash": "a1b2c3d4e5f6...",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "location_data": {
      "country": "CA",
      "region": "ON",
      "city": "Toronto"
    },
    "mfa_verified": true,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### **Get User Document Status**
Retrieve the document status for the authenticated user.

```http
GET /api/v1/legal/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user-123",
    "rbac_level": "MEMBER",
    "documents": [
      {
        "document_id": "ppa",
        "status": "signed",
        "signed_at": "2025-01-01T00:00:00.000Z",
        "expires_at": null,
        "document_version": "2.0",
        "signature_hash": "a1b2c3d4e5f6..."
      },
      {
        "document_id": "mnda",
        "status": "required",
        "signed_at": null,
        "expires_at": null,
        "document_version": "2.0",
        "signature_hash": null
      }
    ],
    "summary": {
      "total_documents": 2,
      "signed_documents": 1,
      "required_documents": 1,
      "pending_documents": 0,
      "expired_documents": 0
    }
  }
}
```

### **Verify Document Signature**
Verify the integrity of a document signature.

```http
POST /api/v1/legal/documents/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_id": "ppa",
  "signature_hash": "a1b2c3d4e5f6..."
}
```

**Request Body:**
- `document_id` (string, required) - The ID of the document
- `signature_hash` (string, required) - The signature hash to verify

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "ppa",
    "signature_hash": "a1b2c3d4e5f6...",
    "is_valid": true,
    "verified_at": "2025-01-01T00:00:00.000Z",
    "document_version": "2.0",
    "signature_details": {
      "signed_at": "2025-01-01T00:00:00.000Z",
      "signature_method": "click",
      "mfa_verified": true
    }
  }
}
```

---

## Document Templates API

### **Get Document Templates**
Retrieve available document templates.

```http
GET /api/v1/legal/templates
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "per-project-nda",
      "name": "Per-Project NDA Addendum",
      "description": "Project-specific confidentiality addendum",
      "category": "08-templates",
      "template_path": "docs/08-legal/08-templates/per-project-nda-addendum-template.md",
      "is_template": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### **Generate Document from Template**
Generate a new document from a template.

```http
POST /api/v1/legal/templates/{templateId}/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_name": "My Project",
  "project_description": "Project description",
  "confidentiality_level": "HIGH",
  "parties": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Project Lead"
    }
  ]
}
```

**Parameters:**
- `templateId` (string, required) - The ID of the template to use

**Request Body:**
- `project_name` (string, required) - Name of the project
- `project_description` (string, required) - Description of the project
- `confidentiality_level` (string, required) - Level of confidentiality
- `parties` (array, required) - List of parties involved

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-123456789",
    "name": "Per-Project NDA Addendum - My Project",
    "legal_name": "Per-Project NDA Addendum - My Project",
    "version": "1.0",
    "category": "08-templates",
    "rbac_level": "MEMBER",
    "template_path": "generated/per-project-nda-my-project.md",
    "is_required": false,
    "is_template": false,
    "generated_from": "per-project-nda",
    "generated_at": "2025-01-01T00:00:00.000Z",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Audit and Compliance API

### **Get Document Audit Log**
Retrieve audit log entries for document access and actions.

```http
GET /api/v1/legal/audit
Authorization: Bearer <token>
```

**Query Parameters:**
- `document_id` (string, optional) - Filter by document ID
- `action` (string, optional) - Filter by action type
- `start_date` (string, optional) - Start date for filtering (ISO 8601)
- `end_date` (string, optional) - End date for filtering (ISO 8601)
- `page` (integer, optional) - Page number for pagination
- `limit` (integer, optional) - Number of results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "audit-123456789",
      "user_id": "user-123",
      "document_id": "ppa",
      "action": "sign",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "metadata": {
        "signature_method": "click",
        "mfa_verified": true
      },
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### **Get Compliance Report**
Generate a compliance report for the authenticated user.

```http
GET /api/v1/legal/compliance/report
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date` (string, required) - Start date for report (ISO 8601)
- `end_date` (string, required) - End date for report (ISO 8601)
- `format` (string, optional) - Report format ("json", "pdf", "csv")

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": "report-123456789",
    "user_id": "user-123",
    "period": {
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-01-31T23:59:59.999Z"
    },
    "generated_at": "2025-01-01T00:00:00.000Z",
    "summary": {
      "total_documents": 5,
      "signed_documents": 3,
      "required_documents": 2,
      "pending_documents": 0,
      "expired_documents": 0
    },
    "details": {
      "document_signings": [
        {
          "document_id": "ppa",
          "signed_at": "2025-01-15T10:30:00.000Z",
          "signature_method": "click",
          "mfa_verified": true
        }
      ],
      "access_logs": [
        {
          "document_id": "ppa",
          "action": "view",
          "timestamp": "2025-01-15T10:25:00.000Z",
          "ip_address": "192.168.1.1"
        }
      ]
    }
  }
}
```

---

## Rate Limiting

### **Rate Limits**
- **General API**: 100 requests per 15 minutes per IP
- **Document Signing**: 5 requests per minute per user
- **Audit Logs**: 50 requests per hour per user
- **Compliance Reports**: 10 requests per hour per user

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### **Rate Limit Exceeded Response**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": "You have exceeded the rate limit of 100 requests per 15 minutes.",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "requestId": "req-123456789"
  }
}
```

---

## Webhooks

### **Webhook Events**
- `document.signed` - Document was signed
- `document.expired` - Document signature expired
- `document.updated` - Document was updated
- `user.level_changed` - User access level changed

### **Webhook Payload**
```json
{
  "event": "document.signed",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "data": {
    "user_id": "user-123",
    "document_id": "ppa",
    "signature_id": "sig-123456789",
    "signed_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### **Webhook Configuration**
```http
POST /api/v1/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/legal-documents",
  "events": ["document.signed", "document.expired"],
  "secret": "your-webhook-secret"
}
```

---

## SDKs and Libraries

### **JavaScript/Node.js**
```bash
npm install @smartstart/legal-documents-sdk
```

```javascript
const { LegalDocumentsClient } = require('@smartstart/legal-documents-sdk');

const client = new LegalDocumentsClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.smartstart.com'
});

// Get available documents
const documents = await client.getAvailableDocuments();

// Sign a document
const signature = await client.signDocument('ppa', {
  method: 'click',
  mfa_verified: true
});
```

### **Python**
```bash
pip install smartstart-legal-documents
```

```python
from smartstart_legal_documents import LegalDocumentsClient

client = LegalDocumentsClient(
    api_key='your-api-key',
    base_url='https://api.smartstart.com'
)

# Get available documents
documents = client.get_available_documents()

# Sign a document
signature = client.sign_document('ppa', {
    'method': 'click',
    'mfa_verified': True
})
```

### **PHP**
```bash
composer require smartstart/legal-documents-php
```

```php
use SmartStart\LegalDocuments\Client;

$client = new Client([
    'api_key' => 'your-api-key',
    'base_url' => 'https://api.smartstart.com'
]);

// Get available documents
$documents = $client->getAvailableDocuments();

// Sign a document
$signature = $client->signDocument('ppa', [
    'method' => 'click',
    'mfa_verified' => true
]);
```

---

## Testing

### **Sandbox Environment**
- **Base URL**: `https://sandbox-api.smartstart.com`
- **Test Users**: Available for testing different RBAC levels
- **Test Documents**: Mock documents for testing
- **Rate Limits**: Higher limits for testing

### **Test Credentials**
```json
{
  "guest_user": {
    "email": "guest@test.smartstart.com",
    "password": "test123",
    "rbac_level": "GUEST"
  },
  "member_user": {
    "email": "member@test.smartstart.com",
    "password": "test123",
    "rbac_level": "MEMBER"
  }
}
```

### **Postman Collection**
Download our Postman collection for easy API testing:
[SmartStart Legal Documents API Collection](https://api.smartstart.com/postman/collection.json)

---

## Support

### **API Support**
- **Email**: api-support@smartstart.com
- **Documentation**: https://docs.smartstart.com
- **Status Page**: https://status.smartstart.com
- **GitHub**: https://github.com/smartstart/legal-documents-api

### **Developer Resources**
- **API Changelog**: https://docs.smartstart.com/changelog
- **SDK Documentation**: https://docs.smartstart.com/sdks
- **Webhook Guide**: https://docs.smartstart.com/webhooks
- **Rate Limiting Guide**: https://docs.smartstart.com/rate-limiting

---

**This API documentation provides comprehensive information for integrating with the SmartStart legal document management system.**

*Last updated: September 2025*  
*Compliant with Canadian law and international best practices*
