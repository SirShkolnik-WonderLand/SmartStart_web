# 🔌 API Reference - SmartStart Platform

## 📚 Overview

This document provides a comprehensive reference for all API endpoints available in the SmartStart Platform. The API follows RESTful principles and uses JWT-based authentication.

## 🔐 Authentication

### JWT Token Format
All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Acquisition
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "display_name": "User Name",
    "role": {
      "id": "role-123",
      "name": "MEMBER",
      "level": 20
    },
    "permissions": ["user:read", "project:read"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🏠 Health & Status Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "database": "connected",
  "services": {
    "worker": true,
    "storage": true,
    "monitor": true
  }
}
```

### System Status
```http
GET /api/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "database": "healthy",
  "redis": "connected",
  "uptime": 86400,
  "memory": {
    "heapUsed": 150000000,
    "heapTotal": 200000000,
    "external": 50000000
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 👤 User Management

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "display_name": "User Name",
    "email": "user@example.com",
    "kyc_status": "verified",
    "trust_score": 75.50,
    "country_code": "US",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "display_name": "New Display Name",
  "country_code": "CA"
}
```

### Get User Portfolio
```http
GET /api/users/portfolio
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "ventures": [
      {
        "id": "venture-123",
        "name": "My Startup",
        "role": "owner",
        "equity_percentage": 60.0,
        "start_date": "2024-01-01",
        "impact_summary": "Led technical development and team growth"
      }
    ],
    "skills": [
      {
        "slug": "nodejs",
        "name": "Node.js",
        "level": "expert",
        "verified": true
      }
    ],
    "badges": [
      {
        "slug": "top_contributor_q1_2024",
        "name": "Top Contributor Q1 2024",
        "awarded_at": "2024-04-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 🏢 Venture Management

### List Ventures
```http
GET /api/ventures?page=1&limit=20&status=active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "ventures": [
    {
      "id": "venture-123",
      "name": "My Startup",
      "description": "A revolutionary platform",
      "region": "US",
      "status": "active",
      "owner": {
        "id": "user-123",
        "display_name": "User Name",
        "email": "user@example.com"
      },
      "equity_summary": {
        "total_equity": 100.0,
        "owner_equity": 60.0,
        "alice_equity": 20.0,
        "contributor_equity": 20.0
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Create Venture
```http
POST /api/ventures
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Venture",
  "description": "Description of the venture",
  "region": "US"
}
```

**Required Permissions:** `venture:create`

### Get Venture Details
```http
GET /api/ventures/{ventureId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "venture": {
    "id": "venture-123",
    "name": "My Startup",
    "description": "A revolutionary platform",
    "region": "US",
    "status": "active",
    "owner": {
      "id": "user-123",
      "display_name": "User Name"
    },
    "equity_ledger": [
      {
        "holder_type": "user",
        "holder_id": "user-123",
        "percent": 60.0,
        "effective_from": "2024-01-01",
        "vesting_policy": {
          "cliff_months": 12,
          "duration_months": 48
        }
      }
    ],
    "it_pack": {
      "m365_tenant_id": "tenant-123",
      "email_address": "admin@mystartup.com",
      "github_org": "mystartup",
      "status": "active"
    }
  }
}
```

### Update Venture
```http
PUT /api/ventures/{ventureId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "status": "active"
}
```

**Required Permissions:** `venture:write`

## 💰 Equity Management

### Get Equity Ledger
```http
GET /api/ventures/{ventureId}/equity
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "equity_ledger": [
    {
      "id": "equity-123",
      "holder_type": "user",
      "holder": {
        "id": "user-123",
        "display_name": "User Name"
      },
      "percent": 60.0,
      "effective_from": "2024-01-01",
      "vesting_policy": {
        "cliff_months": 12,
        "duration_months": 48,
        "vested_percentage": 25.0
      }
    }
  ],
  "total_equity": 100.0
}
```

### Update Equity
```http
PUT /api/ventures/{ventureId}/equity
Authorization: Bearer <token>
Content-Type: application/json

{
  "equity_changes": [
    {
      "holder_type": "user",
      "holder_id": "user-456",
      "percent": 10.0,
      "effective_from": "2024-02-01"
    }
  ]
}
```

**Required Permissions:** `equity:write`

## 🎯 Task Management

### List Tasks
```http
GET /api/ventures/{ventureId}/tasks?status=open&assignee={userId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-123",
      "title": "Implement user authentication",
      "type": "code",
      "weight": 1.2,
      "criticality": "high",
      "status": "open",
      "assignee": {
        "id": "user-123",
        "display_name": "User Name"
      },
      "created_by": {
        "id": "user-456",
        "display_name": "Creator Name"
      },
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Task
```http
POST /api/ventures/{ventureId}/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New task title",
  "type": "code",
  "weight": 1.0,
  "criticality": "medium",
  "assignee_id": "user-123"
}
```

**Required Permissions:** `task:create`

### Submit Task
```http
POST /api/tasks/{taskId}/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "artifact_hash": "sha256-hash-of-submitted-work",
  "notes": "Task completion notes"
}
```

### Review Task
```http
POST /api/tasks/{taskId}/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "quality_score": 85,
  "comments": "Good work, minor improvements needed",
  "decision": "approve"
}
```

**Required Permissions:** `task:review`

## 🏆 BUZ Token System

### Get BUZ Balance
```http
GET /api/users/buz-balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "balance": {
    "available": 15000,
    "locked": 5000,
    "total": 20000,
    "pending_vesting": 2500
  }
}
```

### Get BUZ Transactions
```http
GET /api/users/buz-transactions?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "tx-123",
      "type": "earn",
      "amount": 1000,
      "venture": {
        "id": "venture-123",
        "name": "My Startup"
      },
      "artifact_hash": "sha256-hash",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Convert BUZ to Equity
```http
POST /api/ventures/{ventureId}/convert-buz
Authorization: Bearer <token>
Content-Type: application/json

{
  "buz_amount": 10000
}
```

## 📋 Contract Management

### List Contracts
```http
GET /api/ventures/{ventureId}/contracts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "contracts": [
    {
      "id": "contract-123",
      "type": "contributor",
      "version": 1,
      "status": "signed",
      "signers": [
        {
          "user_id": "user-123",
          "name": "User Name",
          "signed_at": "2024-01-15T10:00:00.000Z"
        }
      ],
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Sign Contract
```http
POST /api/contracts/{contractId}/sign
Authorization: Bearer <token>
Content-Type: application/json

{
  "digital_signature": "base64-encoded-signature"
}
```

## 🔍 Search & Discovery

### Search Ventures
```http
GET /api/search/ventures?q=startup&region=US&skills=nodejs
Authorization: Bearer <token>
```

### Search Users
```http
GET /api/search/users?q=developer&skills=react&region=US
Authorization: Bearer <token>
```

### Get Skills
```http
GET /api/skills?category=engineering
```

**Response:**
```json
{
  "success": true,
  "skills": [
    {
      "id": "skill-123",
      "slug": "nodejs",
      "name": "Node.js",
      "category": "engineering"
    }
  ]
}
```

## 📊 Analytics & Reporting

### Get Venture Analytics
```http
GET /api/ventures/{ventureId}/analytics?period=q1_2024
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "period": "q1_2024",
    "contributions": {
      "total_tasks": 45,
      "completed_tasks": 42,
      "completion_rate": 93.3
    },
    "equity_changes": {
      "total_transactions": 12,
      "equity_redistributed": 15.5
    },
    "buz_issued": 25000,
    "active_contributors": 8
  }
}
```

### Get User Analytics
```http
GET /api/users/analytics?period=q1_2024
Authorization: Bearer <token>
```

## 🔒 Security & Compliance

### Get KYC Status
```http
GET /api/users/kyc-status
Authorization: Bearer <token>
```

### Submit KYC Documents
```http
POST /api/users/kyc-documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "doc_type": "passport",
  "document": <file>
}
```

### Get Device Posture
```http
GET /api/users/device-posture
Authorization: Bearer <token>
```

## 📁 File Management

### Upload File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "venture_id": "venture-123",
  "category": "document"
}
```

**Required Permissions:** `file:upload`

### List Files
```http
GET /api/ventures/{ventureId}/files?category=document
Authorization: Bearer <token>
```

## 📧 Email & Notifications

### Send Email
```http
POST /api/send-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "text": "Plain text content",
  "html": "<p>HTML content</p>"
}
```

**Required Permissions:** `email:send`

### Get Notifications
```http
GET /api/users/notifications?unread_only=true
Authorization: Bearer <token>
```

## 🚨 Error Codes

### Common Error Codes
- `AUTH_REQUIRED` - Authentication token required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request data validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate venture name)
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Internal server error

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📚 Rate Limiting

### Rate Limits
- **Authenticated requests**: 100 requests per 15 minutes
- **File uploads**: 10 uploads per hour
- **Email sending**: 50 emails per hour
- **Login attempts**: 5 attempts per 15 minutes

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642230000
```

## 🔧 SDK & Libraries

### JavaScript/TypeScript Client
```typescript
import { SmartStartClient } from '@smartstart/sdk';

const client = new SmartStartClient({
  baseUrl: 'https://api.smartstart.com',
  token: 'your-jwt-token'
});

// Use the client
const ventures = await client.ventures.list();
const user = await client.users.getCurrent();
```

### cURL Examples
```bash
# Get current user
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.smartstart.com/api/auth/me

# Create venture
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Startup","region":"US"}' \
  https://api.smartstart.com/api/ventures
```

## 📖 OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
```
https://api.smartstart.com/docs/openapi.json
```

## 🆘 Support

### API Support
- **Documentation**: This reference guide
- **OpenAPI Spec**: Machine-readable API specification
- **Postman Collection**: Importable API collection
- **GitHub Issues**: Report bugs or request features

### Getting Help
- Check the response error messages for specific guidance
- Review the authentication and permissions requirements
- Ensure your request format matches the examples
- Contact support for persistent issues

---

**This API reference covers all available endpoints. For the latest updates, check the OpenAPI specification or contact the development team.** 🚀
