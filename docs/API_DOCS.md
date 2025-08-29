# 🔌 SmartStart API Documentation

> **Complete API reference for SmartStart platform**

## 📋 **Overview**

SmartStart provides a comprehensive REST API for managing projects, contributions, users, and community features. All endpoints are secured with RBAC (Role-Based Access Control) and include comprehensive validation.

## 🔐 **Authentication**

### **Session-Based Authentication**
SmartStart uses secure HTTP-only cookies for session management:

```bash
# Login to get session
POST /auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

# Session is automatically maintained via cookies
# No need to pass tokens in headers
```

### **Security Features**
- **HTTP-only cookies** (XSS protection)
- **Secure cookies** in production
- **24-hour session expiration**
- **Automatic logout** on inactivity
- **Rate limiting** on auth endpoints

## 📊 **Base URL & Headers**

```bash
# Base URL
https://your-domain.com/api

# Required Headers
Content-Type: application/json
Accept: application/json

# Optional Headers
X-Request-ID: unique-request-id  # For tracking
```

## 🧪 **Testing the API**

### **Health Check**
```bash
# Check API status
GET /health
# Response: {"ok": true}

# Check database connectivity
GET /ready
# Response: {"ok": true, "database": "connected"}
```

## 👤 **Authentication Endpoints**

### **User Registration**
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "MEMBER"  // Optional: ADMIN, OWNER, MEMBER
}

# Response
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER"
  }
}
```

**Permissions**: None (public endpoint)
**Rate Limit**: 5 requests per 15 minutes

### **User Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

# Response
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER"
  }
}
```

**Permissions**: None (public endpoint)
**Rate Limit**: 5 requests per 15 minutes

### **User Logout**
```http
POST /auth/logout

# Response
{
  "ok": true
}
```

**Permissions**: Authenticated user only

### **Get Current User**
```http
GET /me

# Response
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER",
    "projects": [
      {
        "projectId": "proj_123",
        "role": "OWNER",
        "project": {
          "id": "proj_123",
          "name": "My Project",
          "summary": "Project description"
        }
      }
    ]
  }
}
```

**Permissions**: Authenticated user only

## 🏗️ **Project Management**

### **Create Project**
```http
POST /projects
Content-Type: application/json

{
  "name": "My Amazing Project",
  "summary": "A revolutionary SaaS platform",
  "ownerMinPct": 35,
  "aliceCapPct": 25,
  "reservePct": 40
}

# Response
{
  "id": "proj_123",
  "name": "My Amazing Project",
  "summary": "A revolutionary SaaS platform",
  "ownerId": "user_123",
  "ownerMinPct": 35,
  "aliceCapPct": 25,
  "reservePct": 40,
  "capEntries": [
    {
      "id": "cap_123",
      "holderType": "OWNER",
      "holderId": "user_123",
      "pct": 35,
      "source": "INIT"
    },
    {
      "id": "cap_124",
      "holderType": "ALICE",
      "pct": 25,
      "source": "INIT"
    },
    {
      "id": "cap_125",
      "holderType": "RESERVE",
      "pct": 40,
      "source": "INIT"
    }
  ],
  "members": [
    {
      "userId": "user_123",
      "role": "OWNER"
    }
  ],
  "visibility": {
    "capTableHubMasked": true,
    "tasksHubVisible": false,
    "ideasHubVisible": true,
    "pollsHubVisible": true
  }
}
```

**Permissions**: `PROJECT_CREATE` (ADMIN, OWNER roles)
**Rate Limit**: 30 requests per 15 minutes

### **List Projects**
```http
GET /projects?page=1&pageSize=20

# Response
{
  "projects": [
    {
      "id": "proj_123",
      "name": "My Amazing Project",
      "summary": "A revolutionary SaaS platform",
      "owner": {
        "id": "user_123",
        "name": "John Doe"
      },
      "capEntries": [...],
      "visibility": {...}
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "pages": 1
  }
}
```

**Permissions**: `PROJECT_READ` (authenticated users see their projects)
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 20, max: 100)

### **Get Project Details**
```http
GET /projects/:projectId

# Response
{
  "id": "proj_123",
  "name": "My Amazing Project",
  "summary": "A revolutionary SaaS platform",
  "owner": {...},
  "capEntries": [...],
  "members": [...],
  "visibility": {...},
  "tasks": [...],
  "ideas": [...],
  "polls": [...],
  "messages": [...]
}
```

**Permissions**: `PROJECT_READ` + project membership

### **Update Project**
```http
PUT /projects/:projectId
Content-Type: application/json

{
  "name": "Updated Project Name",
  "summary": "Updated description"
}

# Response
{
  "id": "proj_123",
  "name": "Updated Project Name",
  "summary": "Updated description",
  ...
}
```

**Permissions**: `PROJECT_UPDATE` + project OWNER role

## 💰 **Cap Table Management**

### **Get Cap Table**
```http
GET /projects/:projectId/cap-table

# Response
{
  "entries": [
    {
      "id": "cap_123",
      "holderType": "OWNER",
      "holderId": "user_123",
      "pct": 35,
      "source": "INIT",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "summary": {
    "owner": 35,
    "alice": 25,
    "reserve": 40,
    "userTotal": 0
  }
}
```

**Permissions**: `CAP_TABLE_READ` + project membership

### **Update Cap Table**
```http
PUT /projects/:projectId/cap-table
Content-Type: application/json

{
  "entries": [
    {
      "holderType": "USER",
      "holderId": "user_456",
      "pct": 5,
      "source": "CONTRIB"
    }
  ]
}

# Response
{
  "ok": true,
  "entries": [...]
}
```

**Permissions**: `CAP_TABLE_UPDATE` + project OWNER role

## 📝 **Contribution Management**

### **Propose Contribution**
```http
POST /projects/:projectId/contributions/propose
Content-Type: application/json

{
  "taskId": "task_123",
  "effort": 8,
  "impact": 4,
  "proposedPct": 2.5
}

# Response
{
  "id": "contrib_123",
  "taskId": "task_123",
  "contributorId": "user_123",
  "effort": 8,
  "impact": 4,
  "proposedPct": 2.5,
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `CONTRIBUTION_CREATE` + project membership

### **List Pending Contributions**
```http
GET /projects/:projectId/contributions/pending

# Response
{
  "contributions": [
    {
      "id": "contrib_123",
      "effort": 8,
      "impact": 4,
      "proposedPct": 2.5,
      "status": "PENDING",
      "contributor": {
        "id": "user_123",
        "name": "John Doe"
      },
      "task": {
        "id": "task_123",
        "title": "Implement feature"
      }
    }
  ]
}
```

**Permissions**: `CONTRIBUTION_READ` + project membership

### **Accept Contribution**
```http
POST /contributions/:contributionId/accept
Content-Type: application/json

{
  "finalPct": 2.5
}

# Response
{
  "ok": true,
  "contribution": {
    "id": "contrib_123",
    "finalPct": 2.5,
    "status": "APPROVED",
    "acceptedAt": "2024-01-01T00:00:00Z"
  },
  "capTableUpdate": {
    "entries": [...]
  }
}
```

**Permissions**: `CONTRIBUTION_APPROVE` + project OWNER role

### **Counter Contribution**
```http
POST /contributions/:contributionId/counter
Content-Type: application/json

{
  "finalPct": 2.0,
  "message": "Great work, but let's adjust the percentage"
}

# Response
{
  "ok": true,
  "contribution": {
    "id": "contrib_123",
    "finalPct": 2.0,
    "status": "COUNTERED",
    "counterMessage": "Great work, but let's adjust the percentage"
  }
}
```

**Permissions**: `CONTRIBUTION_APPROVE` + project OWNER role

## 📋 **Task Management**

### **Create Task**
```http
POST /tasks
Content-Type: application/json

{
  "title": "Implement user authentication",
  "type": "CODE",
  "projectId": "proj_123",
  "assigneeId": "user_456"
}

# Response
{
  "id": "task_123",
  "title": "Implement user authentication",
  "type": "CODE",
  "status": "TODO",
  "projectId": "proj_123",
  "assigneeId": "user_456",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `TASK_CREATE` + project membership

### **Update Task**
```http
PUT /tasks/:taskId
Content-Type: application/json

{
  "status": "DOING",
  "assigneeId": "user_789"
}

# Response
{
  "id": "task_123",
  "status": "DOING",
  "assigneeId": "user_789",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `TASK_UPDATE` + project membership

### **List Tasks**
```http
GET /projects/:projectId/tasks?status=TODO&assigneeId=user_123

# Response
{
  "tasks": [
    {
      "id": "task_123",
      "title": "Implement user authentication",
      "type": "CODE",
      "status": "TODO",
      "assignee": {
        "id": "user_123",
        "name": "John Doe"
      }
    }
  ]
}
```

**Permissions**: `TASK_READ` + project membership

## 💡 **Ideas Management**

### **Submit Idea**
```http
POST /ideas
Content-Type: application/json

{
  "title": "Add dark mode support",
  "body": "Implement a dark theme option for better user experience",
  "projectId": "proj_123"
}

# Response
{
  "id": "idea_123",
  "title": "Add dark mode support",
  "body": "Implement a dark theme option for better user experience",
  "status": "BACKLOG",
  "votes": 0,
  "proposer": {
    "id": "user_123",
    "name": "John Doe"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `IDEA_CREATE` + project membership

### **List Ideas**
```http
GET /ideas?projectId=proj_123&status=BACKLOG

# Response
{
  "ideas": [
    {
      "id": "idea_123",
      "title": "Add dark mode support",
      "body": "Implement a dark theme option for better user experience",
      "status": "BACKLOG",
      "votes": 0,
      "proposer": {...}
    }
  ]
}
```

**Permissions**: `IDEA_READ` (public for hub-visible ideas)

### **Update Idea Status**
```http
PUT /ideas/:ideaId
Content-Type: application/json

{
  "status": "GREENLIT"
}

# Response
{
  "id": "idea_123",
  "status": "GREENLIT",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `IDEA_UPDATE` + project OWNER role

## 📊 **Polls & Voting**

### **Create Poll**
```http
POST /polls
Content-Type: application/json

{
  "question": "Should we add dark mode?",
  "type": "YESNO",
  "closesAt": "2024-01-31T23:59:59Z",
  "projectId": "proj_123"
}

# Response
{
  "id": "poll_123",
  "question": "Should we add dark mode?",
  "type": "YESNO",
  "closesAt": "2024-01-31T23:59:59Z",
  "votes": [],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `POLL_CREATE` + project membership

### **Vote on Poll**
```http
POST /polls/:pollId/vote
Content-Type: application/json

{
  "value": "YES"
}

# Response
{
  "ok": true,
  "vote": {
    "id": "vote_123",
    "pollId": "poll_123",
    "voterId": "user_123",
    "value": "YES"
  }
}
```

**Permissions**: `POLL_VOTE` + project membership

### **Get Poll Results**
```http
GET /polls/:pollId

# Response
{
  "id": "poll_123",
  "question": "Should we add dark mode?",
  "type": "YESNO",
  "closesAt": "2024-01-31T23:59:59Z",
  "votes": [
    {
      "id": "vote_123",
      "voter": {
        "id": "user_123",
        "name": "John Doe"
      },
      "value": "YES"
    }
  ],
  "results": {
    "YES": 5,
    "NO": 2,
    "total": 7
  }
}
```

**Permissions**: `POLL_READ` (public for hub-visible polls)

## 💬 **Messaging**

### **Send Message**
```http
POST /messages
Content-Type: application/json

{
  "body": "Great work on the authentication feature!",
  "projectId": "proj_123"
}

# Response
{
  "id": "msg_123",
  "body": "Great work on the authentication feature!",
  "projectId": "proj_123",
  "author": {
    "id": "user_123",
    "name": "John Doe"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `MESSAGE_CREATE` + project membership

### **Get Messages**
```http
GET /projects/:projectId/messages?page=1&pageSize=50

# Response
{
  "messages": [
    {
      "id": "msg_123",
      "body": "Great work on the authentication feature!",
      "author": {...},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

**Permissions**: `MESSAGE_READ` + project membership

## 👏 **Kudos System**

### **Give Kudos**
```http
POST /kudos
Content-Type: application/json

{
  "toUserEmail": "jane@example.com",
  "message": "Amazing work on the UI redesign!"
}

# Response
{
  "id": "kudos_123",
  "toUser": {
    "id": "user_456",
    "name": "Jane Smith"
  },
  "fromUser": {
    "id": "user_123",
    "name": "John Doe"
  },
  "message": "Amazing work on the UI redesign!",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Permissions**: `MESSAGE_CREATE` (authenticated users)

### **List Kudos**
```http
GET /kudos?toUserId=user_456

# Response
{
  "kudos": [
    {
      "id": "kudos_123",
      "message": "Amazing work on the UI redesign!",
      "fromUser": {...},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Permissions**: `MESSAGE_READ` (authenticated users)

## 📊 **Portfolio Management**

### **Get Personal Portfolio**
```http
GET /portfolio

# Response
{
  "summary": {
    "totalProjects": 3,
    "totalOwnership": 45.5,
    "totalContributions": 12
  },
  "projects": [
    {
      "id": "proj_123",
      "name": "My Project",
      "role": "OWNER",
      "ownership": 35,
      "contributions": [
        {
          "id": "contrib_123",
          "pct": 2.5,
          "status": "APPROVED",
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  ],
  "timeline": [
    {
      "date": "2024-01-01",
      "events": [
        {
          "type": "CONTRIBUTION_APPROVED",
          "project": "My Project",
          "pct": 2.5
        }
      ]
    }
  ]
}
```

**Permissions**: Authenticated user only

## 🔍 **Audit & Notifications**

### **Get Notifications**
```http
GET /notifications?read=false

# Response
{
  "notifications": [
    {
      "id": "notif_123",
      "kind": "CONTRIB_APPROVED",
      "payload": {
        "projectId": "proj_123",
        "projectName": "My Project",
        "pct": 2.5
      },
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Permissions**: Authenticated user only

### **Mark Notification as Read**
```http
POST /notifications/read
Content-Type: application/json

{
  "notificationIds": ["notif_123", "notif_124"]
}

# Response
{
  "ok": true,
  "updated": 2
}
```

**Permissions**: Authenticated user only

## ⚙️ **Admin & System**

### **Get Admin Settings**
```http
GET /admin/settings

# Response
{
  "guardrails": {
    "ownerMinPct": 35,
    "aliceCapPct": 25,
    "contributionMinPct": 0.5,
    "contributionMaxPct": 5
  },
  "system": {
    "version": "1.0.0",
    "environment": "production"
  }
}
```

**Permissions**: `ADMIN_SETTINGS_READ` (ADMIN role only)

### **Update Admin Settings**
```http
PUT /admin/settings
Content-Type: application/json

{
  "guardrails": {
    "contributionMaxPct": 6
  }
}

# Response
{
  "ok": true,
  "settings": {
    "guardrails": {
      "ownerMinPct": 35,
      "aliceCapPct": 25,
      "contributionMinPct": 0.5,
      "contributionMaxPct": 6
    }
  }
}
```

**Permissions**: `ADMIN_SETTINGS_UPDATE` (ADMIN role only)

## 📝 **Error Handling**

### **Error Response Format**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### **Common Error Codes**
- `AUTHENTICATION_REQUIRED` - User not logged in
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `VALIDATION_ERROR` - Request data is invalid
- `RATE_LIMIT_EXCEEDED` - Too many requests

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 **Rate Limiting**

### **Limits by Endpoint Type**
- **Authentication**: 5 requests per 15 minutes
- **Read operations**: 100 requests per 15 minutes
- **Write operations**: 30 requests per 15 minutes
- **Admin operations**: 10 requests per 15 minutes

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📊 **Pagination**

### **Pagination Headers**
```http
X-Page: 1
X-PageSize: 20
X-Total: 150
X-TotalPages: 8
```

### **Pagination Query Parameters**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 20, max: 100)

## 🔐 **Permission Matrix**

| Endpoint | Permission Required | Role Required |
|----------|-------------------|---------------|
| `POST /projects` | `PROJECT_CREATE` | ADMIN, OWNER |
| `GET /projects` | `PROJECT_READ` | Any authenticated |
| `PUT /projects/:id` | `PROJECT_UPDATE` | Project OWNER |
| `POST /contributions/propose` | `CONTRIBUTION_CREATE` | Project MEMBER+ |
| `POST /contributions/:id/accept` | `CONTRIBUTION_APPROVE` | Project OWNER |
| `GET /portfolio` | None | Authenticated user |
| `GET /admin/settings` | `ADMIN_SETTINGS_READ` | ADMIN+ |

## 🧪 **Testing Examples**

### **cURL Examples**

```bash
# Health check
curl https://your-domain.com/api/health

# Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create project (requires session cookie)
curl -X POST https://your-domain.com/api/projects \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test Project","summary":"Test description"}'
```

### **JavaScript Examples**

```javascript
// Login and get session
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Create project (session automatically included)
const projectResponse = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'My Project',
    summary: 'Project description'
  })
});
```

## 📚 **Additional Resources**

- [RBAC System Guide](../RBAC_SYSTEM.md)
- [Quick Start Guide](../QUICKSTART.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Database Schema](../prisma/schema.prisma)

---

**SmartStart API** - Enterprise-grade REST API for community development 🚀
