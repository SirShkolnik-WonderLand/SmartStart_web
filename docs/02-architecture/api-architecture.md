# 🔌 API Architecture - SmartStart Platform

## 📚 Overview

The SmartStart Platform API is built with Express.js and follows RESTful principles with comprehensive authentication, authorization, and data validation. This document outlines the API architecture, design patterns, and implementation details.

## 🏗️ Architecture Principles

### **1. RESTful Design**
- **Resource-based URLs** - Clear, intuitive endpoint structure
- **HTTP Methods** - Proper use of GET, POST, PUT, DELETE
- **Status Codes** - Meaningful HTTP response codes
- **JSON Format** - Consistent JSON request/response format

### **2. Security First**
- **JWT Authentication** - Stateless token-based authentication
- **RBAC Authorization** - Role-based access control
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - Protection against abuse

### **3. Scalability**
- **Modular Structure** - Organized by business domains
- **Middleware Pattern** - Reusable cross-cutting concerns
- **Database Abstraction** - Prisma ORM for database operations
- **Error Handling** - Centralized error management

## 🎯 API Structure

### **Base URL Structure**
```
https://api.smartstart.com/api/v1/
```

### **Endpoint Categories**

#### **Authentication & Authorization**
```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
GET    /api/auth/me             # Current user info
POST   /api/auth/logout         # User logout
GET    /api/auth/refresh        # Token refresh
```

#### **User Management**
```
GET    /api/users/              # List users
POST   /api/users/create        # Create user
GET    /api/users/:id           # Get user details
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
GET    /api/users/:id/profile   # User profile
GET    /api/users/:id/analytics # User analytics
```

#### **Venture Management**
```
GET    /api/ventures/           # List ventures
POST   /api/ventures/create     # Create venture
GET    /api/ventures/:id        # Get venture details
PUT    /api/ventures/:id        # Update venture
DELETE /api/ventures/:id        # Delete venture
GET    /api/ventures/:id/status # Venture status
```

#### **Company Management**
```
GET    /api/companies/          # List companies
POST   /api/companies/create    # Create company
GET    /api/companies/:id       # Get company details
PUT    /api/companies/:id       # Update company
DELETE /api/companies/:id       # Delete company
GET    /api/companies/:id/analytics # Company analytics
```

#### **Team Management**
```
GET    /api/teams/              # List teams
POST   /api/teams/create        # Create team
GET    /api/teams/:id           # Get team details
PUT    /api/teams/:id           # Update team
DELETE /api/teams/:id           # Delete team
GET    /api/teams/:id/members   # Team members
POST   /api/teams/:id/members   # Add team member
```

#### **Gamification System**
```
GET    /api/gamification/profile/:userId    # User profile
GET    /api/gamification/xp/:userId         # User XP
POST   /api/gamification/xp/add             # Add XP
GET    /api/gamification/badges/:userId     # User badges
GET    /api/gamification/leaderboard        # Leaderboard
GET    /api/gamification/reputation/:userId # User reputation
```

#### **Legal & Contracts**
```
GET    /api/contracts/                      # List contracts
POST   /api/contracts/create                # Create contract
GET    /api/contracts/:id                   # Get contract
POST   /api/contracts/:id/sign              # Sign contract
GET    /api/legal-pack/templates            # Legal templates
POST   /api/legal-pack/sign                 # Sign legal pack
```

## 🔐 Authentication & Authorization

### **JWT Token Structure**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_123",
    "email": "user@example.com",
    "role": "MEMBER",
    "permissions": ["user:read", "venture:create"],
    "iat": 1642230000,
    "exp": 1642233600
  }
}
```

### **Role-Based Access Control (RBAC)**

#### **User Roles**
- **SUPER_ADMIN**: All permissions
- **ADMIN**: User, project, equity, contract, system management
- **OWNER**: User, project, equity, contract management
- **CONTRIBUTOR**: User read, project write, equity read, contract read/sign
- **MEMBER**: User read, project read, equity read, contract read
- **VIEWER**: User read, project read
- **GUEST**: User read only

#### **Permission Matrix**
```javascript
const permissions = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'user:read', 'user:write', 'user:delete',
    'project:read', 'project:write', 'project:delete',
    'equity:read', 'equity:write',
    'contract:read', 'contract:write', 'contract:sign',
    'system:read', 'system:write'
  ],
  OWNER: [
    'user:read', 'user:write',
    'project:read', 'project:write', 'project:delete',
    'equity:read', 'equity:write',
    'contract:read', 'contract:write', 'contract:sign'
  ],
  CONTRIBUTOR: [
    'user:read',
    'project:read', 'project:write',
    'equity:read',
    'contract:read', 'contract:sign'
  ],
  MEMBER: [
    'user:read',
    'project:read',
    'equity:read',
    'contract:read'
  ],
  VIEWER: [
    'user:read',
    'project:read'
  ],
  GUEST: [
    'user:read'
  ]
};
```

## 📊 Request/Response Format

### **Standard Request Format**
```json
{
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0"
  }
}
```

### **Standard Response Format**

#### **Success Response**
```json
{
  "success": true,
  "data": {
    "id": "resource_123",
    "name": "Resource Name",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### **Paginated Response**
```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛡️ Security Implementation

### **Authentication Middleware**
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication token required' }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }
    req.user = user;
    next();
  });
};
```

### **Authorization Middleware**
```javascript
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
      return res.status(403).json({
        success: false,
        error: { 
          code: 'INSUFFICIENT_PERMISSIONS', 
          message: `Permission '${permission}' required` 
        }
      });
    }
    next();
  };
};
```

### **Input Validation**
```javascript
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.details
        }
      });
    }
    next();
  };
};
```

## 🔄 Error Handling

### **Error Types**
- **ValidationError**: Invalid input data
- **AuthenticationError**: Authentication failed
- **AuthorizationError**: Insufficient permissions
- **NotFoundError**: Resource not found
- **ConflictError**: Resource conflict
- **RateLimitError**: Too many requests
- **InternalError**: Server error

### **Error Handler**
```javascript
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.details
      }
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication required'
      }
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
};
```

## 📈 Performance Optimization

### **Database Optimization**
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient database queries
- **Indexing**: Proper database indexes
- **Caching**: Redis for frequently accessed data

### **API Optimization**
- **Response Compression**: Gzip compression
- **Rate Limiting**: Prevent API abuse
- **Pagination**: Limit response size
- **Field Selection**: Allow specific field requests

### **Monitoring**
- **Request Logging**: Track API usage
- **Performance Metrics**: Response time monitoring
- **Error Tracking**: Centralized error logging
- **Health Checks**: Service status monitoring

## 🔧 Development Tools

### **API Testing**
- **Postman Collection**: Importable API collection
- **OpenAPI Specification**: Machine-readable API docs
- **Test Scripts**: Automated API testing
- **Mock Data**: Development data seeding

### **Documentation**
- **Interactive Docs**: Swagger UI interface
- **Code Examples**: Request/response examples
- **SDK Generation**: Client library generation
- **Version Management**: API versioning strategy

## 🚀 Deployment Considerations

### **Production Configuration**
- **Environment Variables**: Secure configuration
- **SSL/TLS**: HTTPS enforcement
- **CORS**: Cross-origin request handling
- **Security Headers**: Security best practices

### **Scaling**
- **Load Balancing**: Multiple server instances
- **Database Scaling**: Read replicas and sharding
- **Caching Strategy**: Multi-level caching
- **CDN Integration**: Static asset delivery

---

**This API architecture provides a robust, scalable, and secure foundation for the SmartStart Platform, supporting all business requirements while maintaining high performance and reliability.** 🚀
