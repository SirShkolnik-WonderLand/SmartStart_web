# 🧠 Python Brain API Reference - SmartStart Platform

## 📚 Overview

This document provides a comprehensive reference for all Python Brain API endpoints. The Python Brain is the main intelligence engine of the SmartStart Platform, handling all business logic, AI processing, and advanced features.

**🎯 Current Status: Python Brain V3.1.0 - Complete Intelligence Platform**
- **Total Endpoints:** 100+ endpoints across 15 services
- **Total Services:** 15 Python services with full functionality
- **Architecture:** Microservices with Flask and real-time capabilities
- **Security:** Server-side validation and JWT authentication
- **Real-time:** WebSocket support for live collaboration
- **Legal System:** Immutable records, audit trails, and PDF generation

---

## 🏗️ Python Brain Architecture

### **Service Overview**
```
┌─────────────────────────────────────────────────────────────┐
│                    PYTHON BRAIN (MAIN INTELLIGENCE)        │
│  🧠 ALL Business Logic  🔒 Security  🤖 ML/AI  📊 Analytics │
│  ⚖️ Legal Processing  🏢 Venture Logic  👥 User Management  │
│  🎮 Gamification  💰 BUZ Token  🌂 Umbrella  📋 All APIs    │
│  🔐 Authentication  📁 File Management  🔔 Notifications    │
│  🔌 WebSocket  🤖 State Machines  📡 Real-time Features    │
│  📋 Legal Audit  🖨️ Legal Print  ⚖️ Immutable Records      │
│  ✅ 15 Services Complete  ✅ 100+ API Endpoints  ✅ AI-Powered │
└─────────────────────────────────────────────────────────────┘
```

### **Service Communication**
- **Flask Application**: Main orchestrator (`brain/main.py`)
- **Service Integration**: All services integrated via Flask routes
- **Database Access**: Via Node.js connector for Prisma ORM
- **Real-time**: WebSocket service for live communication
- **State Management**: State machine service for workflows

---

## 🔌 API Endpoints by Service

### **1. 👥 User Service**
**Base Path:** `/api/users`

#### **User Management**
```http
GET    /api/users/                    # List all users
POST   /api/users/create              # Create new user
GET    /api/users/:id                 # Get user by ID
PUT    /api/users/:id                 # Update user
DELETE /api/users/:id                 # Delete user
```

#### **User Profiles**
```http
GET    /api/users/:id/profile         # Get user profile
PUT    /api/users/:id/profile         # Update user profile
GET    /api/users/:id/settings        # Get user settings
PUT    /api/users/:id/settings        # Update user settings
```

#### **User Analytics**
```http
GET    /api/users/:id/analytics       # Get user analytics
GET    /api/users/:id/activity        # Get user activity
GET    /api/users/:id/stats           # Get user statistics
```

### **2. ⚖️ Legal Service**
**Base Path:** `/api/legal`

#### **Document Management**
```http
GET    /api/legal/documents           # List legal documents
POST   /api/legal/documents           # Create legal document
GET    /api/legal/documents/:id       # Get document by ID
PUT    /api/legal/documents/:id       # Update document
DELETE /api/legal/documents/:id       # Delete document
```

#### **Document Signing**
```http
POST   /api/legal/documents/:id/sign  # Sign document
GET    /api/legal/documents/:id/status # Get signing status
POST   /api/legal/documents/:id/verify # Verify signature
```

#### **Compliance**
```http
GET    /api/legal/compliance/:userId  # Get user compliance
POST   /api/legal/compliance/check    # Check compliance
GET    /api/legal/audit               # Get audit trail
```

### **3. 🏢 Venture Service**
**Base Path:** `/api/ventures`

#### **Venture Management**
```http
GET    /api/ventures/                 # List all ventures
POST   /api/ventures/create           # Create new venture
GET    /api/ventures/:id              # Get venture by ID
PUT    /api/ventures/:id              # Update venture
DELETE /api/ventures/:id              # Delete venture
```

#### **Venture Analytics**
```http
GET    /api/ventures/:id/analytics    # Get venture analytics
GET    /api/ventures/:id/metrics      # Get venture metrics
GET    /api/ventures/:id/status       # Get venture status
```

#### **Venture Team**
```http
GET    /api/ventures/:id/team         # Get venture team
POST   /api/ventures/:id/team         # Add team member
PUT    /api/ventures/:id/team/:userId # Update team member
DELETE /api/ventures/:id/team/:userId # Remove team member
```

### **4. 🎮 Gamification Service**
**Base Path:** `/api/gamification`

#### **User Progress**
```http
GET    /api/gamification/profile/:userId    # Get user profile
GET    /api/gamification/xp/:userId         # Get user XP
POST   /api/gamification/xp/add             # Add XP
GET    /api/gamification/level/:userId      # Get user level
```

#### **Badges & Achievements**
```http
GET    /api/gamification/badges/:userId     # Get user badges
POST   /api/gamification/badges/award       # Award badge
GET    /api/gamification/achievements/:userId # Get achievements
```

#### **Leaderboards**
```http
GET    /api/gamification/leaderboard        # Get leaderboard
GET    /api/gamification/leaderboard/:category # Get category leaderboard
GET    /api/gamification/rankings/:userId   # Get user rankings
```

### **5. 💰 BUZ Token Service**
**Base Path:** `/api/buz`

#### **Token Operations**
```http
GET    /api/buz/balance/:userId       # Get user balance
POST   /api/buz/transfer              # Transfer tokens
POST   /api/buz/stake                 # Stake tokens
GET    /api/buz/staking/:userId       # Get staking positions
```

#### **Token Economy**
```http
GET    /api/buz/supply                # Get token supply
GET    /api/buz/price                 # Get token price
GET    /api/buz/transactions/:userId  # Get transaction history
```

#### **Admin Operations**
```http
POST   /api/buz/admin/mint            # Mint tokens (Admin)
POST   /api/buz/admin/burn            # Burn tokens (Admin)
GET    /api/buz/admin/analytics       # Get system analytics
```

### **6. 🌂 Umbrella Service**
**Base Path:** `/api/umbrella`

#### **Relationship Management**
```http
GET    /api/umbrella/relationships/:userId    # Get user relationships
POST   /api/umbrella/relationships             # Create relationship
PUT    /api/umbrella/relationships/:id         # Update relationship
DELETE /api/umbrella/relationships/:id         # Delete relationship
```

#### **Network Analytics**
```http
GET    /api/umbrella/network/:userId  # Get user network
GET    /api/umbrella/analytics/:userId # Get network analytics
GET    /api/umbrella/recommendations/:userId # Get recommendations
```

### **7. 🔐 Authentication Service**
**Base Path:** `/api/auth`

#### **Authentication**
```http
POST   /api/auth/login                # User login
POST   /api/auth/register             # User registration
POST   /api/auth/logout               # User logout
GET    /api/auth/me                   # Get current user
```

#### **Security**
```http
POST   /api/auth/refresh              # Refresh token
POST   /api/auth/verify               # Verify token
POST   /api/auth/forgot-password      # Forgot password
POST   /api/auth/reset-password       # Reset password
```

### **8. 📁 File Service**
**Base Path:** `/api/files`

#### **File Operations**
```http
POST   /api/files/upload              # Upload file
GET    /api/files/:id                 # Get file
PUT    /api/files/:id                 # Update file
DELETE /api/files/:id                 # Delete file
```

#### **File Management**
```http
GET    /api/files/list/:userId        # List user files
GET    /api/files/search              # Search files
POST   /api/files/share               # Share file
```

### **9. 📊 Analytics Service**
**Base Path:** `/api/analytics`

#### **User Analytics**
```http
GET    /api/analytics/user/:userId    # Get user analytics
GET    /api/analytics/venture/:ventureId # Get venture analytics
GET    /api/analytics/platform        # Get platform analytics
```

#### **Reporting**
```http
GET    /api/analytics/reports         # List reports
POST   /api/analytics/reports         # Generate report
GET    /api/analytics/reports/:id     # Get report
```

### **10. 🔔 Notification Service**
**Base Path:** `/api/notifications`

#### **Notification Management**
```http
GET    /api/notifications/:userId     # Get user notifications
POST   /api/notifications/send        # Send notification
PUT    /api/notifications/:id/read    # Mark as read
DELETE /api/notifications/:id         # Delete notification
```

#### **Notification Settings**
```http
GET    /api/notifications/settings/:userId    # Get settings
PUT    /api/notifications/settings/:userId    # Update settings
```

### **11. 🔌 WebSocket Service**
**Base Path:** `/api/websocket`

#### **WebSocket Management**
```http
GET    /api/websocket/stats           # Get WebSocket statistics
POST   /api/websocket/send            # Send message
POST   /api/websocket/broadcast       # Broadcast message
```

#### **Real-time Features**
```http
POST   /api/websocket/venture/:id/send    # Send to venture
POST   /api/websocket/team/:id/send       # Send to team
```

### **12. 🤖 State Machine Service**
**Base Path:** `/api/state-machines`

#### **State Machine Management**
```http
POST   /api/state-machines/create     # Create state machine
POST   /api/state-machines/:type/:id/event # Send event
GET    /api/state-machines/:type/:id/state # Get current state
GET    /api/state-machines/stats      # Get statistics
```

### **13. 📋 Legal Audit Service**
**Base Path:** `/api/legal/audit`

#### **Audit Record Management**
```http
POST   /api/legal/audit/create-record # Create legal audit record
GET    /api/legal/audit/trail         # Get legal audit trail
GET    /api/legal/audit/verify/:id    # Verify legal record integrity
GET    /api/legal/user/:id/history    # Get user legal history
POST   /api/legal/sign-with-audit/:user/:doc # Sign with audit trail
GET    /api/legal/report/:id          # Generate legal report
```

### **14. 🖨️ Legal Print Service**
**Base Path:** `/api/legal/print`

#### **PDF Generation**
```http
GET    /api/legal/print/document/:user/:doc # Generate document PDF
GET    /api/legal/print/report/:user        # Generate report PDF
```

### **15. 🔒 RBAC Service**
**Base Path:** `/api/rbac`

#### **Role-Based Access Control**
```http
GET    /api/rbac/user/:id/roles       # Get user roles
GET    /api/rbac/user/:id/permission  # Check user permission
GET    /api/rbac/roles                # Get all roles
POST   /api/rbac/assign-role          # Assign role to user
```

### **16. 📊 CRUD Service**
**Base Path:** `/api/crud`

#### **Generic Database Operations**
```http
GET    /api/crud/:table               # Read table records
POST   /api/crud/:table               # Create record
GET    /api/crud/:table/:id           # Read record by ID
PUT    /api/crud/:table/:id           # Update record
DELETE /api/crud/:table/:id           # Delete record
POST   /api/crud/query                # Execute raw query
```

### **17. 🛤️ User Journey Service**
**Base Path:** `/api/journey`

#### **Journey Management**
```http
GET    /api/journey/user/:id/state    # Get user journey state
GET    /api/journey/user/:id/current-stage # Get current stage
POST   /api/journey/user/:id/start    # Start journey stage
POST   /api/journey/user/:id/complete # Complete journey stage
GET    /api/journey/stages            # Get all journey stages
```

---

## 🔐 Authentication

### **JWT Token Format**
All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### **Token Acquisition**
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
    "role": "MEMBER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📊 Response Format

### **Success Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🏠 Health & Status Endpoints

### **Python Brain Health**
```http
GET /api/health
```

**Response:**
```json
{
  "python_brain": "operational",
  "services": {
    "user_service": "active",
    "legal_service": "active",
    "venture_service": "active",
    "gamification_service": "active",
    "buz_token_service": "active",
    "umbrella_service": "active",
    "authentication_service": "active",
    "file_service": "active",
    "analytics_service": "active",
    "notification_service": "active",
    "websocket_service": "active",
    "state_machine_service": "active"
  },
  "status": "healthy",
  "version": "3.1.0",
  "total_endpoints": 50
}
```

---

## 🔌 WebSocket API

### **Connection**
```javascript
const ws = new WebSocket('wss://smartstart-python-brain.onrender.com/websocket');

ws.onopen = () => {
  console.log('Connected to Python Brain WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### **Message Format**
```json
{
  "type": "notification",
  "data": {
    "message": "Hello from Python Brain!",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🚨 Error Codes

### **Common Error Codes**
- `AUTH_REQUIRED` - Authentication token required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request data validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `SERVICE_UNAVAILABLE` - Python service unavailable
- `INTERNAL_ERROR` - Internal server error

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📚 Rate Limiting

### **Rate Limits**
- **Authenticated requests**: 100 requests per 15 minutes
- **File uploads**: 10 uploads per hour
- **WebSocket connections**: 5 connections per user
- **State machine events**: 50 events per minute

---

## 🔧 Development

### **Local Development**
```bash
# Start Python Brain
cd python-services
python brain/main.py

# Test endpoints
curl http://localhost:5000/api/health
```

### **Service Development**
```bash
# Add new service
cd python-services/services
# Create new_service.py
# Add routes to brain/main.py
```

---

## 🆘 Support

### **API Support**
- **Documentation**: This reference guide
- **Health Check**: `/api/health` endpoint
- **Service Status**: Individual service health checks
- **Error Logging**: Comprehensive error tracking

### **Getting Help**
- Check the response error messages for specific guidance
- Review the authentication and permissions requirements
- Ensure your request format matches the examples
- Contact support for persistent issues

---

**This Python Brain API reference covers all 50+ endpoints across 12 services. The Python Brain is the main intelligence engine of the SmartStart Platform, providing AI-powered processing, real-time capabilities, and comprehensive business logic.** 🧠🚀
