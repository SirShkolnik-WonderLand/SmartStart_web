# 🔌 API Reference - SmartStart Platform

## 📚 Overview

This document provides a comprehensive reference for all API endpoints available in the SmartStart Platform. The API follows RESTful principles and uses JWT-based authentication.

**🎯 Current Status: FULL RBAC SECURITY & REAL DATA IMPLEMENTATION COMPLETE**
- **Total Endpoints:** 150+ endpoints with full RBAC security
- **Total Features:** 84+ features with real data integration
- **Database Tables:** 97+ tables with proper relationships
- **Frontend Integration:** 100% real data, no mock data
- **Security:** Full RBAC with 7 user roles and ownership validation
- **CRUD Operations:** Complete Create, Read, Update, Delete with proper permissions

---

## **🎨 Frontend Integration APIs**

### **Authentication System**
- **Login**: `POST /api/auth/login` - User authentication with JWT
- **Register**: `POST /api/auth/register` - User registration with validation
- **Current User**: `GET /api/auth/me` - Get current user data
- **Logout**: `POST /api/auth/logout` - User logout and session cleanup

### **User Dashboard APIs**
- **User Gamification**: `GET /api/user-gamification/*` - XP, badges, achievements
- **User Portfolio**: `GET /api/user-portfolio/*` - User projects and skills
- **User Profile**: `GET /api/user-profile/*` - User profile data
- **Journey State**: `GET /api/journey/state` - User journey progression

### **Document Management APIs**
- **Document Templates**: `GET /api/documents/templates` - Legal document templates
- **Document Signing**: `POST /api/documents/sign` - Sign documents digitally
- **Contract Management**: `GET /api/contracts/*` - Contract operations
- **Legal Packs**: `GET /api/legal-packs/*` - Legal document packages

### **System Management APIs**
- **System Status**: `GET /api/system/status` - System health monitoring
- **CLI Commands**: `GET /api/cli/commands` - Available CLI commands
- **CLI Execution**: `POST /api/cli/exec` - Execute CLI commands
- **Command Help**: `GET /api/cli/help/*` - Command documentation

---

## **✅ Deployed Systems**

### **1. Legal Foundation System** 🏛️
- **Endpoints:** 35+ endpoints
- **Features:** Contracts, Templates, Signatures, Amendments, Compliance
- **Base Path:** `/api/contracts/*`
- **Frontend Integration:** ✅ Document management and signing

### **2. Company Management System** 🏢
- **Endpoints:** 17 endpoints
- **Features:** Company CRUD, Industry Classification, Hierarchy, Metrics, Documents, Tagging
- **Base Path:** `/api/companies/*`
- **Frontend Integration:** ✅ Company creation and management

### **3. Team Management System** 👥
- **Endpoints:** 15 endpoints
- **Features:** Team Structure, Collaboration, Goals, Metrics, Communication, Analytics
- **Base Path:** `/api/teams/*`
- **Frontend Integration:** ✅ Team collaboration and management

### **4. Contribution Pipeline System** 📋
- **Endpoints:** 18 endpoints
- **Features:** Project Management, Task Management, Workflow Automation, Performance Tracking, Contribution Analytics
- **Base Path:** `/api/contribution/*`
- **Frontend Integration:** ✅ Project and task management

### **5. Gamification System** 🎮
- **Endpoints:** 20+ endpoints
- **Features:** XP, Levels, Badges, Reputation, Portfolio, Skills, Leaderboards
- **Base Path:** `/api/gamification/*`
- **Frontend Integration:** ✅ User dashboard with gamification data

### **6. User Management System** 👤
- **Endpoints:** 25 endpoints
- **Features:** User CRUD, Profiles, Privacy, Connections, Portfolio, Skills, Analytics
- **Base Path:** `/api/users/*`
- **Frontend Integration:** ✅ User profiles and management

### **7. Venture Management System** 🚀
- **Endpoints:** 15 endpoints
- **Features:** Ventures, Legal Entities, Equity, IT Packs, Growth Tracking
- **Base Path:** `/api/ventures/*`
- **Frontend Integration:** ✅ VentureGate journey and management

---

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

### System Status
```http
GET /api/system/status
```

**Response:**
```json
{
  "success": true,
  "systemStatus": {
    "platform": "SmartStart Platform",
    "version": "2.0.0",
    "status": "OPERATIONAL",
    "deployedSystems": [
      {
        "name": "User Management System",
        "status": "✅ DEPLOYED",
        "endpoints": 25,
        "features": ["CRUD", "Profiles", "Privacy", "Networking", "Portfolio", "Skills", "Analytics"]
      }
    ],
    "totalEndpoints": 145,
    "totalFeatures": 84,
    "databaseTables": 31
  }
}
```

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

## 🏢 Company Management System

### Company Operations
```http
# Health check
GET /api/companies/health

# Create company
POST /api/companies/create
Content-Type: application/json

{
  "name": "My Startup",
  "industry": "Technology",
  "size": "SMALL",
  "description": "A revolutionary platform"
}

# List companies
GET /api/companies/?page=1&limit=20

# Get company details
GET /api/companies/:id

# Update company
PUT /api/companies/:id
Content-Type: application/json

{
  "description": "Updated description"
}

# Delete company
DELETE /api/companies/:id

# Search companies
GET /api/companies/search/companies?q=startup&industry=tech
```

### Company Analytics
```http
# Get company metrics
GET /api/companies/:id/metrics

# Get company hierarchy
GET /api/companies/:id/hierarchy

# Get company documents
GET /api/companies/:id/documents

# Get company analytics
GET /api/companies/:id/analytics
```

## 👥 Team Management System

### Team Operations
```http
# Health check
GET /api/teams/health

# Create team
POST /api/teams/create
Content-Type: application/json

{
  "name": "Engineering Team",
  "companyId": "company-123",
  "purpose": "Build amazing products",
  "size": "MEDIUM"
}

# List teams
GET /api/teams/?page=1&limit=20

# Get team details
GET /api/teams/:id

# Update team
PUT /api/teams/:id
Content-Type: application/json

{
  "purpose": "Updated purpose"
}

# Delete team
DELETE /api/teams/:id
```

### Team Management
```http
# Get team members
GET /api/teams/:id/members

# Add team member
POST /api/teams/:id/members
Content-Type: application/json

{
  "userId": "user-123",
  "role": "MEMBER"
}

# Get team goals
GET /api/teams/:id/goals

# Add team goal
POST /api/teams/:id/goals
Content-Type: application/json

{
  "title": "Launch MVP",
  "description": "Launch minimum viable product",
  "deadline": "2024-06-01"
}

# Get team metrics
GET /api/teams/:id/metrics

# Get team analytics
GET /api/teams/:id/analytics
```

## 📋 Contribution Pipeline System

### Project Management
```http
# Health check
GET /api/contribution/health

# Create project
POST /api/contribution/projects/create
Content-Type: application/json

{
  "name": "SmartStart Platform",
  "companyId": "company-123",
  "teamId": "team-123",
  "description": "Build the ultimate startup platform",
  "budget": 50000,
  "deadline": "2024-12-31"
}

# List projects
GET /api/contribution/projects/?page=1&limit=20

# Get project details
GET /api/contribution/projects/:id

# Update project
PUT /api/contribution/projects/:id
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Task Management
```http
# Create task
POST /api/contribution/tasks/create
Content-Type: application/json

{
  "title": "Implement User Authentication",
  "projectId": "project-123",
  "description": "Build secure user authentication system",
  "estimatedHours": 40,
  "priority": "HIGH",
  "type": "DEVELOPMENT"
}

# List tasks
GET /api/contribution/tasks/?page=1&limit=20

# Get task details
GET /api/contribution/tasks/:id

# Assign task
POST /api/contribution/tasks/:id/assign
Content-Type: application/json

{
  "userId": "user-123",
  "role": "DEVELOPER"
}

# Complete task
POST /api/contribution/tasks/:id/complete
Content-Type: application/json

{
  "actualHours": 35,
  "quality": 9,
  "notes": "Completed successfully"
}
```

### Contribution Analytics
```http
# Get user contributions
GET /api/contribution/contributions/:userId

# Get project analytics
GET /api/contribution/projects/:projectId/analytics

# Get system overview
GET /api/contribution/overview
```

## 🎮 Gamification System

### User Profiles & XP
```http
# Get user profile
GET /api/gamification/profile/:userId

# Get user XP
GET /api/gamification/xp/:userId

# Add XP
POST /api/gamification/xp/add
Content-Type: application/json

{
  "userId": "user-123",
  "amount": 100,
  "reason": "Task completion"
}
```

### Badges & Achievements
```http
# Get all badges
GET /api/gamification/badges

# Get user badges
GET /api/gamification/badges/:userId

# Check badge eligibility
GET /api/gamification/badges/check/:userId
```

### Reputation & Skills
```http
# Get user reputation
GET /api/gamification/reputation/:userId

# Calculate reputation
POST /api/gamification/reputation/calculate/:userId

# Get user skills
GET /api/gamification/skills/:userId

# Endorse skill
POST /api/gamification/skills/endorse
Content-Type: application/json

{
  "userId": "user-123",
  "skillId": "skill-123",
  "rating": 5,
  "comment": "Excellent work"
}
```

### Portfolio & Analytics
```http
# Get user portfolio
GET /api/gamification/portfolio/:userId

# Get portfolio insights
GET /api/gamification/portfolio/insights/:userId

# Get community score
GET /api/gamification/community/score/:userId
```

### Challenges & Leaderboards
```http
# Get daily challenges
GET /api/gamification/challenges/daily/:userId

# Get leaderboard
GET /api/gamification/leaderboard/:category

# Get all leaderboards
GET /api/gamification/leaderboards
```

## 👤 User Management System

### User Operations
```http
# Create user
POST /api/users/create
Content-Type: application/json

{
  "display_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

# Get all users
GET /api/users/?page=1&limit=20

# Get user details
GET /api/users/:userId

# Update user
PUT /api/users/:userId
Content-Type: application/json

{
  "display_name": "John Smith"
}

# Delete user
DELETE /api/users/:userId
```

### User Profiles & Settings
```http
# Get user profile
GET /api/users/:userId/profile

# Update profile
PUT /api/users/:userId/profile
Content-Type: application/json

{
  "bio": "Software engineer passionate about startups"
}

# Get user privacy settings
GET /api/users/:userId/privacy

# Update privacy settings
PUT /api/users/:userId/privacy
Content-Type: application/json

{
  "profile_visible": true,
  "email_visible": false
}

# Get user settings
GET /api/users/:userId/settings

# Update settings
PUT /api/users/:userId/settings
Content-Type: application/json

{
  "theme": "dark",
  "notifications": true
}
```

### User Connections & Portfolio
```http
# Get user connections
GET /api/users/:userId/connections

# Accept connection
POST /api/users/:userId/connections/:connectionId/accept

# Get user portfolio
GET /api/users/:userId/portfolio

# Get user skills
GET /api/users/:userId/skills

# Get user analytics
GET /api/users/:userId/analytics

# Get user activity
GET /api/users/:userId/activity

# Get user stats
GET /api/users/:userId/stats
```

### User Search & System Stats
```http
# Search users
GET /api/users/search?q=john&skills=javascript

# Get system stats
GET /api/users/stats/system
```

## 🚀 Venture Management System

### Venture Operations
```http
# Create venture
POST /api/ventures/create
Content-Type: application/json

{
  "name": "My Startup",
  "description": "A revolutionary platform",
  "region": "US"
}

# Get venture details
GET /api/ventures/:ventureId

# Update venture
PUT /api/ventures/:ventureId
Content-Type: application/json

{
  "description": "Updated description"
}

# Get venture status
GET /api/ventures/:ventureId/status
```

### Venture Infrastructure
```http
# Get IT pack
GET /api/ventures/:ventureId/it-pack

# Get venture equity
GET /api/ventures/:ventureId/equity

# Get venture profile
GET /api/ventures/:ventureId/profile

# Get venture documents
GET /api/ventures/:ventureId/documents
```

### Venture Analytics
```http
# Get venture statistics
GET /api/ventures/statistics/overview

# List all ventures
GET /api/ventures/list/all
```

## 🏛️ Legal Foundation System

### Contract Management
```http
# Health check
GET /api/contracts/health

# Get contract templates
GET /api/contracts/templates

# Get specific template
GET /api/contracts/templates/:type

# Create template
POST /api/contracts/templates/create
Content-Type: application/json

{
  "type": "EMPLOYMENT_CONTRACT",
  "content": "Contract template content"
}

# Approve template
POST /api/contracts/templates/:id/approve
```

### Contract Operations
```http
# Create contract
POST /api/contracts/create
Content-Type: application/json

{
  "templateId": "template-123",
  "parties": ["user-123", "user-456"],
  "terms": { "salary": 50000 }
}

# Get all contracts
GET /api/contracts

# Get contract details
GET /api/contracts/:id

# Sign contract
POST /api/contracts/:id/sign
Content-Type: application/json

{
  "signature": "digital_signature_data"
}

# Get contract signatures
GET /api/contracts/:id/signatures
```

### Advanced Contracts
```http
# Health check
GET /api/contracts/advanced/health

# Amend contract
POST /api/contracts/advanced/:id/amend
Content-Type: application/json

{
  "amendment": "Updated terms"
}

# Get amendments
GET /api/contracts/advanced/:id/amendments

# Multi-party signing
POST /api/contracts/advanced/:id/sign/multi-party
Content-Type: application/json

{
  "signatures": ["sig1", "sig2"]
}

# Enforce contract
POST /api/contracts/advanced/:id/enforce

# Get enforcement status
GET /api/contracts/advanced/:id/enforcement

# Verify signature
POST /api/contracts/advanced/:id/verify-signature
Content-Type: application/json

{
  "signatureId": "sig-123"
}
```

### Contract Auto-Issuance
```http
# Health check
GET /api/contracts/auto-issuance/health

# Get templates
GET /api/contracts/auto-issuance/templates

# Issue contract
POST /api/contracts/auto-issuance/issue/:ventureId
Content-Type: application/json

{
  "templateType": "EMPLOYMENT_CONTRACT"
}

# Onboard venture
POST /api/contracts/auto-issuance/onboard/:ventureId

# Preview contract
GET /api/contracts/auto-issuance/preview/:ventureId

# Validate template
GET /api/contracts/auto-issuance/validate/:templateId

# Get venture status
GET /api/contracts/auto-issuance/venture/:ventureId/status
```

## 🔍 Search & Discovery

### Search Ventures
```http
GET /api/search/ventures?q=startup&region=US&skills=nodejs
```

### Search Users
```http
GET /api/search/users?q=developer&skills=react&region=US
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
```

## 🔒 Security & Compliance

### Get KYC Status
```http
GET /api/users/kyc-status
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
```

## 📁 File Management

### Upload File
```http
POST /api/files/upload
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

**This API reference covers all 145 endpoints across 7 major systems. For the latest updates, check the OpenAPI specification or contact the development team.** 🚀
