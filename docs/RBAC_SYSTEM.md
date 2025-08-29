# 🔐 SmartStart RBAC System Documentation

## Overview

SmartStart implements a comprehensive **Role-Based Access Control (RBAC)** system designed for enterprise-grade security and future SaaS scalability. The system provides fine-grained permissions, audit logging, and tenant isolation capabilities.

## 🏗️ Architecture

### Core Components

1. **RBAC Service** (`apps/api/src/services/rbac.ts`)
   - Permission definitions and role mappings
   - Permission checking logic
   - User context management

2. **RBAC Middleware** (`apps/api/src/middleware/rbac.ts`)
   - Express middleware for permission enforcement
   - Request enrichment with RBAC context
   - Resource-level access control

3. **Audit Service** (`apps/api/src/services/audit.ts`)
   - Comprehensive activity logging
   - Compliance and security monitoring
   - Data retention management

4. **Tenancy Service** (`apps/api/src/services/tenancy.ts`)
   - Multi-tenant architecture support
   - Feature flags and usage limits
   - Billing integration preparation

## 👥 Role Hierarchy

### System Roles (Global)

| Role | Description | Key Capabilities |
|------|-------------|------------------|
| **SUPER_ADMIN** | Platform owner | All permissions, user deletion, system configuration |
| **ADMIN** | Organization admin | User management, project creation, financial access |
| **OWNER** | Project owner | Project management, contribution approval, cap table control |
| **MEMBER** | Active contributor | Contribution creation, task management, content creation |
| **VIEWER** | Read-only access | Project viewing, cap table viewing, content reading |
| **GUEST** | Limited access | Public project viewing, idea/poll reading |

### Project Roles (Resource-Specific)

| Role | Description | Capabilities |
|------|-------------|--------------|
| **OWNER** | Project owner | Full project control, member management, settings |
| **MEMBER** | Active member | Task updates, contribution creation, content editing |
| **VIEWER** | Read-only | View access, no modifications |

## 🔑 Permission System

### Permission Categories

#### User Management
- `USER_CREATE` - Create new users
- `USER_READ` - View user information
- `USER_UPDATE` - Modify user details
- `USER_DELETE` - Remove users (SUPER_ADMIN only)

#### Project Management
- `PROJECT_CREATE` - Create new projects
- `PROJECT_READ` - View project information
- `PROJECT_UPDATE` - Modify project settings
- `PROJECT_DELETE` - Remove projects
- `PROJECT_INVITE` - Manage project members

#### Cap Table Management
- `CAP_TABLE_READ` - View ownership percentages
- `CAP_TABLE_UPDATE` - Modify cap table entries
- `CAP_TABLE_DELETE` - Remove cap table entries

#### Contribution Management
- `CONTRIBUTION_CREATE` - Propose contributions
- `CONTRIBUTION_READ` - View contribution details
- `CONTRIBUTION_UPDATE` - Modify contributions
- `CONTRIBUTION_APPROVE` - Approve/reject contributions
- `CONTRIBUTION_DELETE` - Remove contributions

#### Task Management
- `TASK_CREATE` - Create new tasks
- `TASK_READ` - View task information
- `TASK_UPDATE` - Modify task details
- `TASK_DELETE` - Remove tasks
- `TASK_ASSIGN` - Assign tasks to users

#### Content Management
- `IDEA_CREATE/READ/UPDATE/DELETE` - Idea management
- `POLL_CREATE/READ/UPDATE/DELETE` - Poll management
- `MESSAGE_CREATE/READ/UPDATE/DELETE` - Message management
- `POLL_VOTE` - Participate in polls

#### Administrative
- `ADMIN_SETTINGS_READ/UPDATE` - System configuration
- `AUDIT_LOG_READ` - View audit logs
- `FINANCIAL_READ/UPDATE` - Financial data access

### Permission Inheritance

```
SUPER_ADMIN → All permissions
    ↓
ADMIN → Most permissions (except USER_DELETE)
    ↓
OWNER → Project management + contribution approval
    ↓
MEMBER → Content creation + task management
    ↓
VIEWER → Read-only access
    ↓
GUEST → Limited public access
```

## 🚀 Usage Examples

### Basic Permission Checking

```typescript
import { hasPermission, Permission } from '../services/rbac';

// Check if user can create projects
const canCreateProject = await hasPermission(userId, Permission.PROJECT_CREATE);

// Check if user can modify a specific project
const canModifyProject = await hasPermission(userId, Permission.PROJECT_UPDATE, projectId);
```

### Multiple Permission Checking

```typescript
import { hasAllPermissions, hasAnyPermission } from '../services/rbac';

// Check if user has ALL required permissions
const canManageProject = await hasAllPermissions(userId, [
  Permission.PROJECT_UPDATE,
  Permission.PROJECT_INVITE
], projectId);

// Check if user has ANY of the required permissions
const canViewOrEdit = await hasAnyPermission(userId, [
  Permission.PROJECT_READ,
  Permission.PROJECT_UPDATE
], projectId);
```

### Middleware Usage

```typescript
import { requirePermission, requireProjectAccess } from '../middleware/rbac';

// Require specific permission
app.post('/projects/:id/members', 
  requirePermission(Permission.PROJECT_INVITE, 'id'),
  addProjectMember
);

// Require project access with minimum role
app.get('/projects/:id/cap-table',
  requireProjectAccess('MEMBER'),
  getCapTable
);

// Require financial access
app.get('/projects/:id/financials',
  requireFinancialAccess('id'),
  getFinancialData
);
```

### Project Access Control

```typescript
import { canAccessProject, getProjectRole } from '../services/rbac';

// Check if user can access project
const hasAccess = await canAccessProject(userId, projectId);

// Get user's role in project
const projectRole = await getProjectRole(userId, projectId);
```

## 🔍 Audit System

### Audit Events

The system logs all significant actions:

- **User Actions**: Login, logout, role changes
- **Project Actions**: Creation, updates, member changes
- **Financial Actions**: Cap table changes, contribution approvals
- **Permission Checks**: Granted/denied access attempts
- **Security Events**: Suspicious activity, rate limit violations

### Audit Log Access

```typescript
import { AuditService } from '../services/audit';

// Get user's audit trail
const userEvents = await AuditService.getUserAuditEvents(userId);

// Get project audit trail
const projectEvents = await AuditService.getProjectAuditEvents(projectId);

// Search audit events
const searchResults = await AuditService.searchAuditEvents({
  entity: 'PROJECT',
  action: 'PROJECT_CREATED',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
```

## 🏢 Tenant Isolation

### Current Implementation

SmartStart currently operates as a **single-tenant** system with multi-tenant architecture prepared for future expansion.

### Future Multi-Tenant Features

- **Subdomain-based tenancy**: `company1.smartstart.com`
- **Custom domain support**: `projects.company.com`
- **API key-based tenancy**: `X-Tenant-ID` header
- **Feature flags per tenant**: Enable/disable features
- **Usage limits**: User counts, project limits, storage quotas

### Tenant Configuration

```typescript
import { TenancyService } from '../services/tenancy';

// Initialize tenant context
const tenant = await TenancyService.initializeTenantContext(req);

// Check feature availability
if (TenancyService.isFeatureEnabled('audit_logs')) {
  // Enable audit logging
}

// Check usage limits
const withinLimits = await TenancyService.checkLimit('maxUsers', currentUserCount);
```

## 🧪 Testing

### Running RBAC Tests

```bash
# Run all RBAC tests
pnpm --filter @smartstart/api test rbac.spec.ts

# Run with coverage
pnpm --filter @smartstart/api test:coverage
```

### Test Coverage

The RBAC system includes comprehensive tests covering:

- ✅ Role permission mappings
- ✅ Permission checking logic
- ✅ Project access control
- ✅ Role inheritance
- ✅ Error handling
- ✅ Edge cases

## 🔒 Security Features

### Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **Configurable per tenant**

### Input Validation

- **Zod schemas** for all inputs
- **SQL injection prevention** via Prisma
- **XSS protection** via input sanitization

### Session Security

- **HTTP-only cookies**
- **Secure cookies in production**
- **24-hour session expiration**
- **Automatic logout on inactivity**

## 📊 Monitoring & Compliance

### Audit Log Retention

- **Default retention**: 365 days
- **Configurable per tenant**
- **Export capabilities** (JSON/CSV)
- **Compliance reporting** ready

### Security Monitoring

- **Failed authentication attempts**
- **Permission violations**
- **Rate limit exceeded events**
- **Suspicious activity detection**

## 🚀 Deployment Considerations

### Environment Variables

```bash
# Session security
SESSION_SECRET=your-super-secret-key-here

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Audit logging
AUDIT_LOG_RETENTION_DAYS=365
ENABLE_AUDIT_LOGGING=true
```

### Database Indexes

The system automatically creates indexes for:

- User lookups by email
- Project membership queries
- Audit event searches
- Permission checks

### Performance Optimization

- **Permission caching** in memory
- **Database query optimization** via Prisma
- **Efficient role hierarchy** lookups
- **Minimal database round trips**

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Permission Models**
   - Time-based permissions
   - Location-based access
   - Conditional permissions

2. **Integration Capabilities**
   - SAML/SSO integration
   - LDAP/Active Directory
   - OAuth 2.0 providers

3. **Advanced Auditing**
   - Real-time security alerts
   - Machine learning anomaly detection
   - Compliance automation

4. **Multi-Tenant Features**
   - Custom branding per tenant
   - Tenant-specific workflows
   - Advanced billing integration

## 📚 API Reference

### RBAC Service Methods

```typescript
class RBACService {
  static async hasPermission(userId: string, permission: Permission, resourceId?: string): Promise<boolean>
  static async hasPermissions(userId: string, permissions: Permission[], resourceId?: string): Promise<boolean[]>
  static async hasAllPermissions(userId: string, permissions: Permission[], resourceId?: string): Promise<boolean>
  static async hasAnyPermission(userId: string, permissions: Permission[], resourceId?: string): Promise<boolean>
  static async getUserPermissions(userId: string, resourceId?: string): Promise<Permission[]>
  static async canAccessProject(userId: string, projectId: string): Promise<boolean>
  static async getProjectRole(userId: string, projectId: string): Promise<ProjectRole | null>
  static async canModifyProject(userId: string, projectId: string): Promise<boolean>
  static async canManageProjectMembers(userId: string, projectId: string): Promise<boolean>
  static async canApproveContributions(userId: string, projectId: string): Promise<boolean>
  static async canViewFinancialData(userId: string, projectId?: string): Promise<boolean>
  static async canModifyFinancialData(userId: string, projectId?: string): Promise<boolean>
}
```

### Middleware Functions

```typescript
export const requirePermission = (permission: Permission, resourceIdParam?: string)
export const requireAllPermissions = (permissions: Permission[], resourceIdParam?: string)
export const requireAnyPermission = (permissions: Permission[], resourceIdParam?: string)
export const requireProjectAccess = (minRole: string = 'MEMBER')
export const requireFinancialAccess = (resourceIdParam?: string)
export const requireAdminAccess = ()
export const requireSuperAdminAccess = ()
export const enrichWithPermissions = (resourceIdParam?: string)
export const canModifyResource = (resourceType: string, resourceIdParam?: string)
export const canDeleteResource = (resourceType: string, resourceIdParam?: string)
```

## 🎯 Best Practices

### Permission Design

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Role-Based Design**: Design roles around job functions, not individuals
3. **Resource Isolation**: Use resource IDs for fine-grained control
4. **Audit Everything**: Log all permission checks and access attempts

### Security Implementation

1. **Validate Inputs**: Use Zod schemas for all API inputs
2. **Check Permissions Early**: Verify permissions before processing requests
3. **Log Security Events**: Track all authentication and authorization attempts
4. **Regular Reviews**: Periodically review and audit permission assignments

### Performance Considerations

1. **Cache Permissions**: Store frequently accessed permissions in memory
2. **Batch Checks**: Use `hasPermissions` for multiple permission checks
3. **Efficient Queries**: Leverage database indexes for permission lookups
4. **Minimize Database Calls**: Fetch user context once per request

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check user's system role
   - Verify project membership
   - Confirm resource-specific permissions

2. **Performance Issues**
   - Review database query performance
   - Check permission cache efficiency
   - Monitor audit log size

3. **Audit Log Issues**
   - Verify database connectivity
   - Check log retention settings
   - Monitor storage usage

### Debug Mode

Enable debug logging for RBAC operations:

```bash
DEBUG=rbac:* pnpm dev
```

## 📞 Support

For questions about the RBAC system:

1. **Check the tests** in `apps/api/test/rbac.spec.ts`
2. **Review the source code** in `apps/api/src/services/rbac.ts`
3. **Examine middleware** in `apps/api/src/middleware/rbac.ts`
4. **Run the test suite** to verify functionality

---

**SmartStart RBAC System** - Enterprise-grade access control for modern applications 🚀
