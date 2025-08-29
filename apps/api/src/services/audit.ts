import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum AuditAction {
  // User actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Project actions
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  PROJECT_MEMBER_ADDED = 'PROJECT_MEMBER_ADDED',
  PROJECT_MEMBER_REMOVED = 'PROJECT_MEMBER_REMOVED',
  PROJECT_MEMBER_ROLE_CHANGED = 'PROJECT_MEMBER_ROLE_CHANGED',
  
  // Cap table actions
  CAP_TABLE_ENTRY_CREATED = 'CAP_TABLE_ENTRY_CREATED',
  CAP_TABLE_ENTRY_UPDATED = 'CAP_TABLE_ENTRY_UPDATED',
  CAP_TABLE_ENTRY_DELETED = 'CAP_TABLE_ENTRY_DELETED',
  
  // Contribution actions
  CONTRIBUTION_PROPOSED = 'CONTRIBUTION_PROPOSED',
  CONTRIBUTION_APPROVED = 'CONTRIBUTION_APPROVED',
  CONTRIBUTION_REJECTED = 'CONTRIBUTION_REJECTED',
  CONTRIBUTION_COUNTERED = 'CONTRIBUTION_COUNTERED',
  
  // Task actions
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  
  // Content actions
  IDEA_CREATED = 'IDEA_CREATED',
  IDEA_UPDATED = 'IDEA_UPDATED',
  IDEA_DELETED = 'IDEA_DELETED',
  IDEA_STATUS_CHANGED = 'IDEA_STATUS_CHANGED',
  
  POLL_CREATED = 'POLL_CREATED',
  POLL_UPDATED = 'POLL_UPDATED',
  POLL_DELETED = 'POLL_DELETED',
  POLL_VOTE_CAST = 'POLL_VOTE_CAST',
  
  MESSAGE_CREATED = 'MESSAGE_CREATED',
  MESSAGE_UPDATED = 'MESSAGE_UPDATED',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  
  // Permission actions
  PERMISSION_CHECK = 'PERMISSION_CHECK',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // System actions
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // Financial actions
  FINANCIAL_DATA_VIEWED = 'FINANCIAL_DATA_VIEWED',
  FINANCIAL_DATA_UPDATED = 'FINANCIAL_DATA_UPDATED',
  
  // Security actions
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED'
}

export enum AuditEntity {
  USER = 'USER',
  PROJECT = 'PROJECT',
  CAP_TABLE = 'CAP_TABLE',
  CONTRIBUTION = 'CONTRIBUTION',
  TASK = 'TASK',
  IDEA = 'IDEA',
  POLL = 'POLL',
  MESSAGE = 'MESSAGE',
  PERMISSION = 'PERMISSION',
  SYSTEM = 'SYSTEM',
  FINANCIAL = 'FINANCIAL',
  SECURITY = 'SECURITY'
}

export interface AuditEventData {
  actorId?: string;
  entity: AuditEntity;
  action: AuditAction;
  payload: Record<string, any>;
  resourceId?: string;
  resourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async logEvent(data: AuditEventData): Promise<void> {
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: data.actorId,
          entity: data.entity,
          action: data.action,
          payload: {
            ...data.payload,
            timestamp: new Date().toISOString(),
            resourceId: data.resourceId,
            resourceType: data.resourceType,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            sessionId: data.sessionId,
            metadata: data.metadata
          }
        }
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit failures shouldn't break the application
    }
  }

  /**
   * Log user authentication events
   */
  static async logUserAuth(
    userId: string, 
    action: AuditAction.USER_LOGIN | AuditAction.USER_LOGOUT,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      actorId: userId,
      entity: AuditEntity.USER,
      action,
      payload: { action },
      metadata
    });
  }

  /**
   * Log user creation/update events
   */
  static async logUserChange(
    actorId: string,
    action: AuditAction.USER_CREATED | AuditAction.USER_UPDATED | AuditAction.USER_DELETED,
    userId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      actorId,
      entity: AuditEntity.USER,
      action,
      payload: { userId, changes },
      resourceId: userId
    });
  }

  /**
   * Log project events
   */
  static async logProjectEvent(
    actorId: string,
    action: AuditAction,
    projectId: string,
    payload: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      actorId,
      entity: AuditEntity.PROJECT,
      action,
      payload,
      resourceId: projectId,
      resourceType: 'project'
    });
  }

  /**
   * Log cap table events
   */
  static async logCapTableEvent(
    actorId: string,
    action: AuditAction,
    projectId: string,
    payload: Record<string, any>,
    entryId?: string
  ): Promise<void> {
    await this.logEvent({
      actorId,
      entity: AuditEntity.CAP_TABLE,
      action,
      payload: { ...payload, entryId },
      metadata: { projectId, resourceType: 'cap_table' }
    });
  }

  /**
   * Log contribution events
   */
  static async logContributionEvent(
    actorId: string,
    action: AuditAction,
    contributionId: string,
    projectId: string,
    payload: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      actorId,
      entity: AuditEntity.CONTRIBUTION,
      action,
      payload,
      metadata: { contributionId, projectId, resourceType: 'contribution' }
    });
  }

  /**
   * Log permission check events
   */
  static async logPermissionCheck(
    userId: string,
    permission: string,
    granted: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      actorId: userId,
      entity: AuditEntity.PERMISSION,
      action: granted ? AuditAction.PERMISSION_GRANTED : AuditAction.PERMISSION_DENIED,
      payload: { permission, granted },
      metadata
    });
  }

  /**
   * Log financial data access
   */
  static async logFinancialAccess(
    userId: string,
    action: AuditAction.FINANCIAL_DATA_VIEWED | AuditAction.FINANCIAL_DATA_UPDATED,
    payload: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      actorId: userId,
      entity: AuditEntity.FINANCIAL,
      action,
      payload,
      metadata: { resourceType: 'financial' }
    });
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(
    action: AuditAction.SUSPICIOUS_ACTIVITY | AuditAction.RATE_LIMIT_EXCEEDED | AuditAction.AUTHENTICATION_FAILED,
    payload: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      entity: AuditEntity.SECURITY,
      action,
      payload
    });
  }

  /**
   * Get audit events for a specific user
   */
  static async getUserAuditEvents(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    return prisma.auditEvent.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get audit events for a specific project
   */
  static async getProjectAuditEvents(
    projectId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    return prisma.auditEvent.findMany({
      where: {
        OR: [
          { 
            payload: { 
              path: ['projectId'], 
              equals: projectId 
            } 
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get audit events by entity type
   */
  static async getAuditEventsByEntity(
    entity: AuditEntity,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    return prisma.auditEvent.findMany({
      where: { entity },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get audit events by action
   */
  static async getAuditEventsByAction(
    action: AuditAction,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    return prisma.auditEvent.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Search audit events
   */
  static async searchAuditEvents(
    query: {
      entity?: AuditEntity;
      action?: AuditAction;
      actorId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    const where: any = {};
    
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = query.actorId;
    
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = query.startDate;
      if (query.endDate) where.createdAt.lte = query.endDate;
    }

    return prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Clean old audit events (for data retention)
   */
  static async cleanOldAuditEvents(olderThanDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.auditEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  /**
   * Export audit events for compliance
   */
  static async exportAuditEvents(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    const events = await prisma.auditEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['ID', 'Actor ID', 'Entity', 'Action', 'Payload', 'Created At'];
      const csvRows = [headers.join(',')];
      
      events.forEach(event => {
        const row = [
          event.id,
          event.actorId || '',
          event.entity,
          event.action,
          JSON.stringify(event.payload),
          event.createdAt.toISOString()
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }

    return events;
  }
}

// Export convenience functions
export const logEvent = AuditService.logEvent.bind(AuditService);
export const logUserAuth = AuditService.logUserAuth.bind(AuditService);
export const logUserChange = AuditService.logUserChange.bind(AuditService);
export const logProjectEvent = AuditService.logProjectEvent.bind(AuditService);
export const logCapTableEvent = AuditService.logCapTableEvent.bind(AuditService);
export const logContributionEvent = AuditService.logContributionEvent.bind(AuditService);
export const logPermissionCheck = AuditService.logPermissionCheck.bind(AuditService);
export const logFinancialAccess = AuditService.logFinancialAccess.bind(AuditService);
export const logSecurityEvent = AuditService.logSecurityEvent.bind(AuditService);
