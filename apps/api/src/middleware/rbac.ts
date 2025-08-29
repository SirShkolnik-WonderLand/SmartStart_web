import { Request, Response, NextFunction } from 'express';
import { 
  Permission, 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission,
  canAccessProject,
  getProjectRole,
  RBACService
} from '../services/rbac.js';

// Extend Express Request to include RBAC context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      rbacContext?: {
        permissions: Permission[];
        projectRole?: string;
        canAccess: boolean;
      };
    }
  }
}

/**
 * Middleware to check if user has a specific role
 */
export const checkRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has a specific permission
 */
export const requirePermission = (permission: Permission, resourceIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const resourceId = resourceIdParam ? req.params[resourceIdParam] : undefined;
      const hasAccess = await hasPermission(req.user.id, permission, resourceId);

      if (!hasAccess) {
        // Audit the denied access
        await RBACService.auditPermissionCheck(req.user.id, permission, false);
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          resourceId
        });
      }

      // Audit the granted access
      await RBACService.auditPermissionCheck(req.user.id, permission, true);
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check if user has ALL required permissions
 */
export const requireAllPermissions = (permissions: Permission[], resourceIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const resourceId = resourceIdParam ? req.params[resourceIdParam] : undefined;
      const hasAccess = await hasAllPermissions(req.user.id, permissions, resourceId);

      if (!hasAccess) {
        // Audit the denied access
        await Promise.all(permissions.map(permission => 
          RBACService.auditPermissionCheck(req.user!.id, permission, false)
        ));
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permissions,
          resourceId
        });
      }

      // Audit the granted access
      await Promise.all(permissions.map(permission => 
        RBACService.auditPermissionCheck(req.user!.id, permission, true)
      ));
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check if user has ANY of the required permissions
 */
export const requireAnyPermission = (permissions: Permission[], resourceIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const resourceId = resourceIdParam ? req.params[resourceIdParam] : undefined;
      const hasAccess = await hasAnyPermission(req.user.id, permissions, resourceId);

      if (!hasAccess) {
        // Audit the denied access
        await Promise.all(permissions.map(permission => 
          RBACService.auditPermissionCheck(req.user!.id, permission, false)
        ));
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permissions,
          resourceId
        });
      }

      // Audit the granted access
      await Promise.all(permissions.map(permission => 
        RBACService.auditPermissionCheck(req.user!.id, permission, true)
      ));
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check project access and enrich request with RBAC context
 */
export const requireProjectAccess = (minRole: string = 'MEMBER') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    try {
      // Check if user can access the project
      const canAccess = await canAccessProject(req.user.id, projectId);
      if (!canAccess) {
        return res.status(403).json({ error: 'Project access denied' });
      }

      // Get user's role in the project
      const projectRole = await getProjectRole(req.user.id, projectId);
      
      // Check role hierarchy
      const roleHierarchy = { OWNER: 3, MEMBER: 2, VIEWER: 1 };
      const userRoleLevel = roleHierarchy[projectRole as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[minRole as keyof typeof roleHierarchy] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ 
          error: 'Insufficient project permissions',
          required: minRole,
          current: projectRole
        });
      }

      // Enrich request with RBAC context
      req.rbacContext = {
        permissions: await RBACService.getUserPermissions(req.user.id, projectId),
        projectRole: projectRole || undefined,
        canAccess: true
      };

      next();
    } catch (error) {
      console.error('Project access check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check financial data access
 */
export const requireFinancialAccess = (resourceIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const resourceId = resourceIdParam ? req.params[resourceIdParam] : undefined;
      const canView = await RBACService.canViewFinancialData(req.user.id, resourceId);

      if (!canView) {
        return res.status(403).json({ 
          error: 'Financial data access denied',
          resourceId
        });
      }

      next();
    } catch (error) {
      console.error('Financial access check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check admin access
 */
export const requireAdminAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const hasAdminAccess = await hasPermission(req.user.id, Permission.ADMIN_SETTINGS_READ);
      
      if (!hasAdminAccess) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      next();
    } catch (error) {
      console.error('Admin access check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check super admin access
 */
export const requireSuperAdminAccess = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const hasSuperAdminAccess = await hasPermission(req.user.id, Permission.USER_DELETE);
      
      if (!hasSuperAdminAccess) {
        return res.status(403).json({ error: 'Super admin access required' });
      }

      next();
    } catch (error) {
      console.error('Super admin access check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to enrich request with user permissions
 */
export const enrichWithPermissions = (resourceIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const resourceId = resourceIdParam ? req.params[resourceIdParam] : undefined;
      const permissions = await RBACService.getUserPermissions(req.user.id, resourceId);

      req.rbacContext = {
        permissions,
        canAccess: true
      };

      next();
    } catch (error) {
      console.error('Permission enrichment error:', error);
      // Don't fail the request, just continue without permissions
      next();
    }
  };
};

/**
 * Middleware to check if user can modify a resource
 */
export const canModifyResource = (resourceType: string, resourceIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const resourceId = resourceIdParam ? req.params[resourceIdParam] : undefined;
      
      let requiredPermission: Permission;
      switch (resourceType) {
        case 'project':
          requiredPermission = Permission.PROJECT_UPDATE;
          break;
        case 'task':
          requiredPermission = Permission.TASK_UPDATE;
          break;
        case 'idea':
          requiredPermission = Permission.IDEA_UPDATE;
          break;
        case 'poll':
          requiredPermission = Permission.POLL_UPDATE;
          break;
        case 'message':
          requiredPermission = Permission.MESSAGE_UPDATE;
          break;
        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }

      const canModify = await hasPermission(req.user.id, requiredPermission, resourceId);
      
      if (!canModify) {
        return res.status(403).json({ 
          error: 'Cannot modify resource',
          resourceType,
          resourceId
        });
      }

      next();
    } catch (error) {
      console.error('Resource modification check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check if user can delete a resource
 */
export const canDeleteResource = (resourceType: string, resourceIdParam?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const resourceId = resourceIdParam ? req.params[resourceIdParam] : undefined;
      
      let requiredPermission: Permission;
      switch (resourceType) {
        case 'project':
          requiredPermission = Permission.PROJECT_DELETE;
          break;
        case 'task':
          requiredPermission = Permission.TASK_DELETE;
          break;
        case 'idea':
          requiredPermission = Permission.IDEA_DELETE;
          break;
        case 'poll':
          requiredPermission = Permission.POLL_DELETE;
          break;
        case 'message':
          requiredPermission = Permission.MESSAGE_DELETE;
          break;
        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }

      const canDelete = await hasPermission(req.user.id, requiredPermission, resourceId);
      
      if (!canDelete) {
        return res.status(403).json({ 
          error: 'Cannot delete resource',
          resourceType,
          resourceId
        });
      }

      next();
    } catch (error) {
      console.error('Resource deletion check error:', error);
      res.status(500).json({ error: 'Permission check error' });
    }
  };
};
