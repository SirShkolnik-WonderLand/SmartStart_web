# 🎯 SmartStart Opportunities System - API Design

**Version:** 1.0  
**Last Updated:** September 9, 2025  
**Status:** Design Phase - Ready for Implementation  
**Governing Law:** Ontario, Canada

---

## 🚀 **API OVERVIEW**

The SmartStart Opportunities System API provides comprehensive endpoints for managing collaboration opportunities, applications, matches, and analytics. All endpoints are protected by RBAC and integrated with the legal framework.

### **Base URL**
```
Production: https://smartstart-api.onrender.com/api/opportunities
Development: http://localhost:3001/api/opportunities
```

### **Authentication**
All endpoints require JWT authentication with proper RBAC level validation.

---

## 📋 **CORE OPPORTUNITIES ENDPOINTS**

### **1. Opportunity Management**

#### **GET /api/opportunities**
**Description:** List all opportunities with filtering and pagination  
**RBAC Level:** MEMBER+  
**Query Parameters:**
```typescript
{
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 20)
  type?: OpportunityType;  // Filter by opportunity type
  status?: OpportunityStatus; // Filter by status
  ventureId?: string;      // Filter by venture
  location?: string;       // Filter by location
  skills?: string[];       // Filter by required skills
  remote?: boolean;        // Filter by remote work
  compensation?: CompensationType; // Filter by compensation type
  search?: string;         // Search in title/description
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    opportunities: Opportunity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    filters: {
      applied: object;
      available: object;
    };
  };
}
```

#### **POST /api/opportunities**
**Description:** Create a new opportunity  
**RBAC Level:** SUBSCRIBER+  
**Request Body:**
```typescript
{
  title: string;
  description: string;
  type: OpportunityType;
  ventureId?: string;
  projectId?: string;
  collaborationType: CollaborationType;
  requiredSkills: string[];
  preferredSkills?: string[];
  timeCommitment: string;
  duration: string;
  requiresNDA?: boolean;
  legalLevel?: string;
  location?: string;
  isRemote?: boolean;
  timezone?: string;
  compensationType: CompensationType;
  compensationValue?: number;
  equityOffered?: number;
  currency?: string;
  visibilityLevel?: VisibilityLevel;
  targetAudience?: string[];
  tags?: string[];
  expiresAt?: string; // ISO date
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    opportunity: Opportunity;
    legalDocuments: LegalDocument[];
    nextSteps: string[];
  };
}
```

#### **GET /api/opportunities/:id**
**Description:** Get opportunity details  
**RBAC Level:** MEMBER+  
**Response:**
```typescript
{
  success: boolean;
  data: {
    opportunity: Opportunity;
    creator: User;
    venture?: Venture;
    project?: Project;
    legalDocuments: LegalDocument[];
    applications: OpportunityApplication[];
    matches: OpportunityMatch[];
    analytics: OpportunityAnalytics;
  };
}
```

#### **PUT /api/opportunities/:id**
**Description:** Update opportunity  
**RBAC Level:** SUBSCRIBER+ (creator only)  
**Request Body:** Same as POST /api/opportunities  
**Response:**
```typescript
{
  success: boolean;
  data: {
    opportunity: Opportunity;
    changes: object;
  };
}
```

#### **DELETE /api/opportunities/:id**
**Description:** Delete opportunity  
**RBAC Level:** SUBSCRIBER+ (creator only)  
**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 📝 **APPLICATION ENDPOINTS**

### **2. Opportunity Applications**

#### **POST /api/opportunities/:id/applications**
**Description:** Apply to an opportunity  
**RBAC Level:** MEMBER+  
**Request Body:**
```typescript
{
  coverLetter?: string;
  relevantSkills: string[];
  experience?: string;
  availability?: string;
  motivation?: string;
  ndaAccepted: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    application: OpportunityApplication;
    legalDocuments: LegalDocument[];
    nextSteps: string[];
  };
}
```

#### **GET /api/opportunities/:id/applications**
**Description:** Get applications for an opportunity (creator only)  
**RBAC Level:** SUBSCRIBER+ (creator only)  
**Response:**
```typescript
{
  success: boolean;
  data: {
    applications: OpportunityApplication[];
    applicants: User[];
    summary: {
      total: number;
      pending: number;
      accepted: number;
      rejected: number;
    };
  };
}
```

#### **PUT /api/opportunities/:id/applications/:applicationId**
**Description:** Update application status  
**RBAC Level:** SUBSCRIBER+ (creator only)  
**Request Body:**
```typescript
{
  status: ApplicationStatus;
  feedback?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    application: OpportunityApplication;
    notification: Notification;
  };
}
```

#### **GET /api/users/:userId/applications**
**Description:** Get user's applications  
**RBAC Level:** MEMBER+ (own applications only)  
**Response:**
```typescript
{
  success: boolean;
  data: {
    applications: OpportunityApplication[];
    opportunities: Opportunity[];
    summary: {
      total: number;
      pending: number;
      accepted: number;
      rejected: number;
    };
  };
}
```

---

## 🎯 **MATCHING ENDPOINTS**

### **3. Opportunity Matching**

#### **GET /api/opportunities/:id/matches**
**Description:** Get opportunity matches  
**RBAC Level:** SUBSCRIBER+ (creator only)  
**Query Parameters:**
```typescript
{
  minScore?: number;       // Minimum match score (0.0-1.0)
  status?: MatchStatus;    // Filter by match status
  limit?: number;          // Number of matches to return
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    matches: OpportunityMatch[];
    users: User[];
    summary: {
      total: number;
      averageScore: number;
      topSkills: string[];
    };
  };
}
```

#### **GET /api/users/:userId/matches**
**Description:** Get user's opportunity matches  
**RBAC Level:** MEMBER+ (own matches only)  
**Response:**
```typescript
{
  success: boolean;
  data: {
    matches: OpportunityMatch[];
    opportunities: Opportunity[];
    summary: {
      total: number;
      averageScore: number;
      topOpportunities: string[];
    };
  };
}
```

#### **POST /api/opportunities/:id/matches/:userId/apply**
**Description:** Apply to a matched opportunity  
**RBAC Level:** MEMBER+  
**Response:**
```typescript
{
  success: boolean;
  data: {
    application: OpportunityApplication;
    match: OpportunityMatch;
  };
}
```

#### **PUT /api/opportunities/:id/matches/:userId/status**
**Description:** Update match status  
**RBAC Level:** MEMBER+  
**Request Body:**
```typescript
{
  status: MatchStatus;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    match: OpportunityMatch;
  };
}
```

---

## 📊 **ANALYTICS ENDPOINTS**

### **4. Opportunity Analytics**

#### **GET /api/opportunities/:id/analytics**
**Description:** Get opportunity analytics  
**RBAC Level:** SUBSCRIBER+ (creator only)  
**Query Parameters:**
```typescript
{
  period?: string;         // "7d", "30d", "90d", "1y"
  metric?: string;         // "views", "applications", "matches"
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    analytics: OpportunityAnalytics[];
    summary: {
      totalViews: number;
      totalApplications: number;
      totalMatches: number;
      conversionRate: number;
      topSkills: string[];
      geographicDistribution: object;
    };
    trends: {
      views: number[];
      applications: number[];
      matches: number[];
    };
  };
}
```

#### **GET /api/opportunities/analytics/global**
**Description:** Get global opportunity analytics  
**RBAC Level:** ADMIN  
**Response:**
```typescript
{
  success: boolean;
  data: {
    summary: {
      totalOpportunities: number;
      activeOpportunities: number;
      totalApplications: number;
      totalMatches: number;
      averageMatchScore: number;
    };
    trends: {
      opportunityCreation: number[];
      applicationRate: number[];
      matchAccuracy: number[];
    };
    topSkills: string[];
    topLocations: string[];
    opportunityTypes: object;
  };
}
```

---

## 🔍 **SEARCH & DISCOVERY ENDPOINTS**

### **5. Advanced Search**

#### **POST /api/opportunities/search**
**Description:** Advanced opportunity search  
**RBAC Level:** MEMBER+  
**Request Body:**
```typescript
{
  query?: string;          // Search text
  filters: {
    type?: OpportunityType[];
    status?: OpportunityStatus[];
    location?: string[];
    skills?: string[];
    compensation?: CompensationType[];
    remote?: boolean;
    ventureId?: string[];
    tags?: string[];
  };
  sort?: {
    field: string;         // "createdAt", "matchScore", "compensation"
    order: "asc" | "desc";
  };
  pagination?: {
    page: number;
    limit: number;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    opportunities: Opportunity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    filters: {
      applied: object;
      available: object;
    };
    suggestions: {
      skills: string[];
      locations: string[];
      tags: string[];
    };
  };
}
```

#### **GET /api/opportunities/suggestions**
**Description:** Get personalized opportunity suggestions  
**RBAC Level:** MEMBER+  
**Response:**
```typescript
{
  success: boolean;
  data: {
    suggestions: OpportunityMatch[];
    reasons: string[];
    skills: string[];
    interests: string[];
  };
}
```

---

## 🔒 **LEGAL & COMPLIANCE ENDPOINTS**

### **6. Legal Document Management**

#### **GET /api/opportunities/:id/legal-documents**
**Description:** Get required legal documents  
**RBAC Level:** MEMBER+  
**Response:**
```typescript
{
  success: boolean;
  data: {
    documents: LegalDocument[];
    requirements: {
      ndaRequired: boolean;
      legalLevel: string;
      complianceStatus: string;
    };
  };
}
```

#### **POST /api/opportunities/:id/legal-documents/:documentId/sign**
**Description:** Sign required legal document  
**RBAC Level:** MEMBER+  
**Request Body:**
```typescript
{
  signatureData: {
    method: string;        // "click", "typed", "drawn"
    timestamp: string;     // ISO timestamp
    ipAddress: string;
    userAgent: string;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    signature: DocumentSignature;
    nextSteps: string[];
  };
}
```

---

## 🔔 **NOTIFICATION ENDPOINTS**

### **7. Notifications**

#### **GET /api/opportunities/notifications**
**Description:** Get opportunity-related notifications  
**RBAC Level:** MEMBER+  
**Response:**
```typescript
{
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}
```

#### **PUT /api/opportunities/notifications/:id/read**
**Description:** Mark notification as read  
**RBAC Level:** MEMBER+  
**Response:**
```typescript
{
  success: boolean;
  data: {
    notification: Notification;
  };
}
```

---

## 🚀 **IMPLEMENTATION NOTES**

### **Error Handling**
All endpoints return consistent error responses:
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: object;
  };
}
```

### **Rate Limiting**
- **Public endpoints**: 100 requests/hour
- **Authenticated endpoints**: 1000 requests/hour
- **Admin endpoints**: 5000 requests/hour

### **Caching**
- **Opportunity listings**: 5 minutes
- **User matches**: 1 hour
- **Analytics**: 1 day

### **Security**
- **JWT Authentication**: Required for all endpoints
- **RBAC Validation**: User level checked on every request
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Protection**: Parameterized queries only
- **XSS Protection**: Output encoding for all user data

---

## 📈 **PERFORMANCE TARGETS**

### **Response Times**
- **Simple queries**: < 200ms
- **Complex searches**: < 500ms
- **Analytics**: < 1000ms
- **Matching**: < 2000ms

### **Throughput**
- **Read operations**: 1000 requests/second
- **Write operations**: 100 requests/second
- **Search operations**: 500 requests/second

---

## 🎯 **CONCLUSION**

The SmartStart Opportunities System API provides a comprehensive, secure, and scalable foundation for collaboration matching. With proper RBAC integration, legal framework compliance, and advanced matching capabilities, it transforms SmartStart into a true collaboration platform.

The API design follows RESTful principles while providing the flexibility needed for complex collaboration scenarios. All endpoints are designed with security, performance, and user experience in mind.
