import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced role hierarchy with permissions
export enum SystemRole {
  SUPER_ADMIN = 'SUPER_ADMIN',    // Platform owner
  ADMIN = 'ADMIN',                // Organization admin
  OWNER = 'OWNER',                // Project owner
  MEMBER = 'MEMBER',              // Project member
  VIEWER = 'VIEWER',              // Project viewer
  GUEST = 'GUEST'                 // Limited access
}

export enum ProjectRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER', 
  VIEWER = 'VIEWER'
}

// Permission definitions
export enum Permission {
  // User management
  USER_CREATE = 'USER_CREATE',
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  
  // Project management
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_READ = 'PROJECT_READ',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  PROJECT_DELETE = 'PROJECT_DELETE',
  PROJECT_INVITE = 'PROJECT_INVITE',
  
  // Cap table management
  CAP_TABLE_READ = 'CAP_TABLE_READ',
  CAP_TABLE_UPDATE = 'CAP_TABLE_UPDATE',
  CAP_TABLE_DELETE = 'CAP_TABLE_DELETE',
  
  // Contribution management
  CONTRIBUTION_CREATE = 'CONTRIBUTION_CREATE',
  CONTRIBUTION_READ = 'CONTRIBUTION_READ',
  CONTRIBUTION_UPDATE = 'CONTRIBUTION_UPDATE',
  CONTRIBUTION_APPROVE = 'CONTRIBUTION_APPROVE',
  CONTRIBUTION_DELETE = 'CONTRIBUTION_DELETE',
  
  // Task management
  TASK_CREATE = 'TASK_CREATE',
  TASK_READ = 'TASK_READ',
  TASK_UPDATE = 'TASK_UPDATE',
  TASK_DELETE = 'TASK_DELETE',
  TASK_ASSIGN = 'TASK_ASSIGN',
  
  // Content management
  IDEA_CREATE = 'IDEA_CREATE',
  IDEA_READ = 'IDEA_READ',
  IDEA_UPDATE = 'IDEA_UPDATE',
  IDEA_DELETE = 'IDEA_DELETE',
  
  POLL_CREATE = 'POLL_CREATE',
  POLL_READ = 'POLL_READ',
  POLL_UPDATE = 'POLL_UPDATE',
  POLL_DELETE = 'POLL_DELETE',
  POLL_VOTE = 'POLL_VOTE',
  
  MESSAGE_CREATE = 'MESSAGE_CREATE',
  MESSAGE_READ = 'MESSAGE_READ',
  MESSAGE_UPDATE = 'MESSAGE_UPDATE',
  MESSAGE_DELETE = 'MESSAGE_DELETE',
  
  // Administrative
  ADMIN_SETTINGS_READ = 'ADMIN_SETTINGS_READ',
  ADMIN_SETTINGS_UPDATE = 'ADMIN_SETTINGS_UPDATE',
  AUDIT_LOG_READ = 'AUDIT_LOG_READ',
  
  // Financial
  FINANCIAL_READ = 'FINANCIAL_READ',
  FINANCIAL_UPDATE = 'FINANCIAL_UPDATE'
}

// Role permission mappings
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SystemRole.SUPER_ADMIN]: Object.values(Permission),
  
  [SystemRole.ADMIN]: [
    Permission.USER_CREATE, Permission.USER_READ, Permission.USER_UPDATE,
    Permission.PROJECT_CREATE, Permission.PROJECT_READ, Permission.PROJECT_UPDATE,
    Permission.PROJECT_INVITE, Permission.ADMIN_SETTINGS_READ, Permission.ADMIN_SETTINGS_UPDATE,
    Permission.AUDIT_LOG_READ, Permission.FINANCIAL_READ, Permission.FINANCIAL_UPDATE
  ],
  
  [SystemRole.OWNER]: [
    Permission.PROJECT_READ, Permission.PROJECT_UPDATE, Permission.PROJECT_INVITE,
    Permission.CAP_TABLE_READ, Permission.CAP_TABLE_UPDATE,
    Permission.CONTRIBUTION_READ, Permission.CONTRIBUTION_APPROVE,
    Permission.TASK_CREATE, Permission.TASK_READ, Permission.TASK_UPDATE, Permission.TASK_DELETE, Permission.TASK_ASSIGN,
    Permission.IDEA_CREATE, Permission.IDEA_READ, Permission.IDEA_UPDATE, Permission.IDEA_DELETE,
    Permission.POLL_CREATE, Permission.POLL_READ, Permission.POLL_UPDATE, Permission.POLL_DELETE,
    Permission.MESSAGE_CREATE, Permission.MESSAGE_READ, Permission.MESSAGE_UPDATE, Permission.MESSAGE_DELETE
  ],
  
  [SystemRole.MEMBER]: [
    Permission.PROJECT_READ, Permission.CAP_TABLE_READ,
    Permission.CONTRIBUTION_CREATE, Permission.CONTRIBUTION_READ,
    Permission.TASK_READ, Permission.TASK_UPDATE,
    Permission.IDEA_CREATE, Permission.IDEA_READ, Permission.IDEA_UPDATE,
    Permission.POLL_READ, Permission.POLL_VOTE,
    Permission.MESSAGE_CREATE, Permission.MESSAGE_READ, Permission.MESSAGE_UPDATE
  ],
  
  [SystemRole.VIEWER]: [
    Permission.PROJECT_READ, Permission.CAP_TABLE_READ,
    Permission.CONTRIBUTION_READ, Permission.TASK_READ,
    Permission.IDEA_READ, Permission.POLL_READ, Permission.MESSAGE_READ
  ],
  
  [SystemRole.GUEST]: [
    Permission.PROJECT_READ, Permission.IDEA_READ, Permission.POLL_READ
  ]
};

// Project role permission mappings
export const PROJECT_ROLE_PERMISSIONS: Record<ProjectRole, Permission[]> = {
  [ProjectRole.OWNER]: [
    Permission.PROJECT_UPDATE, Permission.PROJECT_INVITE,
    Permission.CAP_TABLE_UPDATE, Permission.CONTRIBUTION_APPROVE,
    Permission.TASK_CREATE, Permission.TASK_UPDATE, Permission.TASK_DELETE, Permission.TASK_ASSIGN,
    Permission.IDEA_UPDATE, Permission.IDEA_DELETE,
    Permission.POLL_UPDATE, Permission.POLL_DELETE,
    Permission.MESSAGE_UPDATE, Permission.MESSAGE_DELETE
  ],
  
  [ProjectRole.MEMBER]: [
    Permission.CONTRIBUTION_CREATE, Permission.TASK_UPDATE,
    Permission.IDEA_UPDATE, Permission.POLL_VOTE,
    Permission.MESSAGE_UPDATE
  ],
  
  [ProjectRole.VIEWER]: [
    // Read-only permissions are inherited from system role
  ]
};

export interface UserContext {
  id: string;
  email: string;
  systemRole: SystemRole;
  projectRoles: Map<string, ProjectRole>; // projectId -> role
}

export interface PermissionCheck {
  permission: Permission;
  resourceId?: string;
  resourceType?: string;
}

export class RBACService {
  /**
   * Get user context with all roles and permissions
   */
  static async getUserContext(userId: string): Promise<UserContext> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: true,
        projectMemberships: true
      }
    });

    if (!user || !user.account) {
      throw new Error('User not found');
    }

    const projectRoles = new Map<string, ProjectRole>();
    user.projectMemberships.forEach(membership => {
      projectRoles.set(membership.projectId, membership.role as ProjectRole);
    });

    return {
      id: user.id,
      email: user.email,
      systemRole: user.account.role as SystemRole,
      projectRoles
    };
  }

  /**
   * Check if user has a specific permission
   */
  static async hasPermission(userId: string, permission: Permission, resourceId?: string): Promise<boolean> {
    const userContext = await this.getUserContext(userId);
    
    // Super admin has all permissions
    if (userContext.systemRole === SystemRole.SUPER_ADMIN) {
      return true;
    }

    // Check system role permissions
    const systemPermissions = ROLE_PERMISSIONS[userContext.systemRole] || [];
    if (systemPermissions.includes(permission)) {
      return true;
    }

    // Check project-specific permissions
    if (resourceId && userContext.projectRoles.has(resourceId)) {
      const projectRole = userContext.projectRoles.get(resourceId)!;
      const projectPermissions = PROJECT_ROLE_PERMISSIONS[projectRole] || [];
      if (projectPermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check multiple permissions at once
   */
  static async hasPermissions(userId: string, permissions: Permission[], resourceId?: string): Promise<boolean[]> {
    const results = await Promise.all(
      permissions.map(permission => this.hasPermission(userId, permission, resourceId))
    );
    return results;
  }

  /**
   * Check if user has ALL required permissions
   */
  static async hasAllPermissions(userId: string, permissions: Permission[], resourceId?: string): Promise<boolean> {
    const results = await this.hasPermissions(userId, permissions, resourceId);
    return results.every(result => result === true);
  }

  /**
   * Check if user has ANY of the required permissions
   */
  static async hasAnyPermission(userId: string, permissions: Permission[], resourceId?: string): Promise<boolean> {
    const results = await this.hasPermissions(userId, permissions, resourceId);
    return results.some(result => result === true);
  }

  /**
   * Get all permissions for a user
   */
  static async getUserPermissions(userId: string, resourceId?: string): Promise<Permission[]> {
    const userContext = await this.getUserContext(userId);
    const permissions = new Set<Permission>();

    // Add system role permissions
    const systemPermissions = ROLE_PERMISSIONS[userContext.systemRole] || [];
    systemPermissions.forEach(permission => permissions.add(permission));

    // Add project-specific permissions
    if (resourceId && userContext.projectRoles.has(resourceId)) {
      const projectRole = userContext.projectRoles.get(resourceId)!;
      const projectPermissions = PROJECT_ROLE_PERMISSIONS[projectRole] || [];
      projectPermissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  }

  /**
   * Validate user can access a specific project
   */
  static async canAccessProject(userId: string, projectId: string): Promise<boolean> {
    const userContext = await this.getUserContext(userId);
    
    // Super admin and admin can access all projects
    if (userContext.systemRole === SystemRole.SUPER_ADMIN || userContext.systemRole === SystemRole.ADMIN) {
      return true;
    }

    // Check if user is a member of the project
    return userContext.projectRoles.has(projectId);
  }

  /**
   * Get effective role for user in a project
   */
  static async getProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
    const userContext = await this.getUserContext(userId);
    
    // Super admin and admin have owner-level access to all projects
    if (userContext.systemRole === SystemRole.SUPER_ADMIN || userContext.systemRole === SystemRole.ADMIN) {
      return ProjectRole.OWNER;
    }

    return userContext.projectRoles.get(projectId) || null;
  }

  /**
   * Check if user can modify project settings
   */
  static async canModifyProject(userId: string, projectId: string): Promise<boolean> {
    return this.hasPermission(userId, Permission.PROJECT_UPDATE, projectId);
  }

  /**
   * Check if user can manage project members
   */
  static async canManageProjectMembers(userId: string, projectId: string): Promise<boolean> {
    return this.hasPermission(userId, Permission.PROJECT_INVITE, projectId);
  }

  /**
   * Check if user can approve contributions
   */
  static async canApproveContributions(userId: string, projectId: string): Promise<boolean> {
    return this.hasPermission(userId, Permission.CONTRIBUTION_APPROVE, projectId);
  }

  /**
   * Check if user can view financial data
   */
  static async canViewFinancialData(userId: string, projectId?: string): Promise<boolean> {
    return this.hasPermission(userId, Permission.FINANCIAL_READ, projectId);
  }

  /**
   * Check if user can modify financial data
   */
  static async canModifyFinancialData(userId: string, projectId?: string): Promise<boolean> {
    return this.hasPermission(userId, Permission.FINANCIAL_UPDATE, projectId);
  }

  /**
   * Audit permission check
   */
  static async auditPermissionCheck(
    userId: string, 
    permission: Permission, 
    granted: boolean
  ): Promise<void> {
    await prisma.auditEvent.create({
      data: {
        actorId: userId,
        entity: 'PERMISSION_CHECK',
        action: granted ? 'PERMISSION_GRANTED' : 'PERMISSION_DENIED',
        payload: {
          permission,
          granted,
          timestamp: new Date().toISOString()
        }
      }
    });
  }
}

// Export convenience functions
export const hasPermission = RBACService.hasPermission.bind(RBACService);
export const hasPermissions = RBACService.hasPermissions.bind(RBACService);
export const hasAllPermissions = RBACService.hasAllPermissions.bind(RBACService);
export const hasAnyPermission = RBACService.hasAnyPermission.bind(RBACService);
export const getUserPermissions = RBACService.getUserPermissions.bind(RBACService);
export const canAccessProject = RBACService.canAccessProject.bind(RBACService);
export const getProjectRole = RBACService.getProjectRole.bind(RBACService);
export const canModifyProject = RBACService.canModifyProject.bind(RBACService);
export const canManageProjectMembers = RBACService.canManageProjectMembers.bind(RBACService);
export const canApproveContributions = RBACService.canApproveContributions.bind(RBACService);
export const canViewFinancialData = RBACService.canViewFinancialData.bind(RBACService);
export const canModifyFinancialData = RBACService.canModifyFinancialData.bind(RBACService);
