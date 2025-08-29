import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum TenantType {
  SINGLE = 'SINGLE',           // Single organization
  MULTI = 'MULTI',             // Multiple organizations
  ENTERPRISE = 'ENTERPRISE'    // Enterprise with custom domains
}

export interface TenantContext {
  id: string;
  name: string;
  type: TenantType;
  domain?: string;
  settings: Record<string, any>;
  features: string[];
  limits: Record<string, number>;
}

export interface TenantLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorageGB: number;
  maxApiCallsPerMonth: number;
  maxAuditLogRetentionDays: number;
}

export class TenancyService {
  private static currentTenant: TenantContext | null = null;
  private static tenantCache = new Map<string, TenantContext>();

  /**
   * Initialize tenant context from request
   */
  static async initializeTenantContext(req: any): Promise<TenantContext | null> {
    try {
      // For now, we'll use a single tenant approach
      // In the future, this can be extended to support:
      // - Subdomain-based tenancy
      // - Custom domain tenancy
      // - API key-based tenancy
      
      const tenantId = req.headers['x-tenant-id'] || 
                      req.query.tenantId || 
                      process.env.DEFAULT_TENANT_ID || 
                      'default';
      
      if (this.tenantCache.has(tenantId)) {
        return this.tenantCache.get(tenantId)!;
      }

      // For now, return a default tenant context
      const defaultTenant: TenantContext = {
        id: tenantId,
        name: 'SmartStart',
        type: TenantType.SINGLE,
        settings: {
          allowPublicProjects: false,
          requireApprovalForContributions: true,
          enableAuditLogging: true,
          enableRateLimiting: true,
          maxFileSizeMB: 10,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg']
        },
        features: [
          'projects',
          'cap_table',
          'contributions',
          'tasks',
          'ideas',
          'polls',
          'messages',
          'audit_logs',
          'rbac'
        ],
        limits: {
          maxUsers: 1000,
          maxProjects: 100,
          maxStorageGB: 10,
          maxApiCallsPerMonth: 100000,
          maxAuditLogRetentionDays: 365
        }
      };

      this.tenantCache.set(tenantId, defaultTenant);
      this.currentTenant = defaultTenant;
      
      return defaultTenant;
    } catch (error) {
      console.error('Failed to initialize tenant context:', error);
      return null;
    }
  }

  /**
   * Get current tenant context
   */
  static getCurrentTenant(): TenantContext | null {
    return this.currentTenant;
  }

  /**
   * Check if feature is enabled for current tenant
   */
  static isFeatureEnabled(feature: string): boolean {
    const tenant = this.getCurrentTenant();
    if (!tenant) return false;
    
    return tenant.features.includes(feature);
  }

  /**
   * Check if tenant has reached a limit
   */
  static async checkLimit(limitType: keyof TenantLimits, currentValue: number): Promise<boolean> {
    const tenant = this.getCurrentTenant();
    if (!tenant) return false;
    
    const limit = tenant.limits[limitType];
    if (typeof limit !== 'number') return true; // No limit set
    
    return currentValue < limit;
  }

  /**
   * Get tenant setting value
   */
  static getSetting(key: string, defaultValue?: any): any {
    const tenant = this.getCurrentTenant();
    if (!tenant) return defaultValue;
    
    return tenant.settings[key] ?? defaultValue;
  }

  /**
   * Apply tenant isolation to database queries
   */
  static applyTenantFilter(query: any, resourceType: string): any {
    const tenant = this.getCurrentTenant();
    if (!tenant || tenant.type === TenantType.SINGLE) {
      return query; // No filtering needed for single tenant
    }

    // For multi-tenant setups, add tenant ID filter
    // This is a placeholder for future implementation
    return {
      ...query,
      where: {
        ...query.where,
        tenantId: tenant.id
      }
    };
  }

  /**
   * Validate tenant-specific business rules
   */
  static async validateTenantRules(
    action: string, 
    resourceType: string, 
    data: any
  ): Promise<{ valid: boolean; errors: string[] }> {
    const tenant = this.getCurrentTenant();
    if (!tenant) {
      return { valid: false, errors: ['Tenant context not available'] };
    }

    const errors: string[] = [];

    // Check feature availability
    if (!this.isFeatureEnabled(resourceType)) {
      errors.push(`Feature '${resourceType}' is not available for this tenant`);
    }

    // Check limits
    switch (resourceType) {
      case 'users':
        if (!await this.checkLimit('maxUsers', data.currentUserCount || 0)) {
          errors.push(`User limit reached (${tenant.limits.maxUsers})`);
        }
        break;
      
      case 'projects':
        if (!await this.checkLimit('maxProjects', data.currentProjectCount || 0)) {
          errors.push(`Project limit reached (${tenant.limits.maxProjects})`);
        }
        break;
      
      case 'storage':
        if (!await this.checkLimit('maxStorageGB', data.currentStorageGB || 0)) {
          errors.push(`Storage limit reached (${tenant.limits.maxStorageGB}GB)`);
        }
        break;
    }

    // Check tenant-specific settings
    if (resourceType === 'projects' && !tenant.settings.allowPublicProjects) {
      if (data.isPublic) {
        errors.push('Public projects are not allowed for this tenant');
      }
    }

    if (resourceType === 'contributions' && tenant.settings.requireApprovalForContributions) {
      if (!data.requiresApproval) {
        errors.push('Contributions require approval for this tenant');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get tenant usage statistics
   */
  static async getTenantUsage(tenantId: string): Promise<Record<string, any>> {
    try {
      const [userCount, projectCount, auditEventCount] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.auditEvent.count()
      ]);

      // Calculate storage usage (placeholder)
      const storageUsageGB = 0; // Would need to implement file storage tracking

      return {
        users: userCount,
        projects: projectCount,
        auditEvents: auditEventCount,
        storageGB: storageUsageGB,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get tenant usage:', error);
      return {};
    }
  }

  /**
   * Check if tenant is within usage limits
   */
  static async isTenantWithinLimits(tenantId: string): Promise<boolean> {
    const usage = await this.getTenantUsage(tenantId);
    const tenant = this.getCurrentTenant();
    
    if (!tenant) return false;

    return (
      usage.users < tenant.limits.maxUsers &&
      usage.projects < tenant.limits.maxProjects &&
      usage.storageGB < tenant.limits.maxStorageGB
    );
  }

  /**
   * Get tenant billing information (placeholder for future)
   */
  static async getTenantBilling(tenantId: string): Promise<Record<string, any>> {
    // This would integrate with billing systems like Stripe
    return {
      plan: 'standard',
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 99.00,
      currency: 'USD'
    };
  }

  /**
   * Upgrade tenant plan
   */
  static async upgradeTenantPlan(
    tenantId: string, 
    newPlan: string, 
    features: string[], 
    limits: Partial<TenantLimits>
  ): Promise<boolean> {
    try {
      // This would integrate with billing systems and update tenant configuration
      console.log(`Upgrading tenant ${tenantId} to plan ${newPlan}`);
      
      // Update tenant cache
      const tenant = this.tenantCache.get(tenantId);
      if (tenant) {
        tenant.features = features;
        tenant.limits = { ...tenant.limits, ...limits };
        this.tenantCache.set(tenantId, tenant);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to upgrade tenant plan:', error);
      return false;
    }
  }

  /**
   * Clean up tenant data (for account deletion)
   */
  static async cleanupTenant(tenantId: string): Promise<boolean> {
    try {
      // This would implement data cleanup according to retention policies
      console.log(`Cleaning up tenant ${tenantId}`);
      
      // Remove from cache
      this.tenantCache.delete(tenantId);
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup tenant:', error);
      return false;
    }
  }
}

// Export convenience functions
export const initializeTenantContext = TenancyService.initializeTenantContext.bind(TenancyService);
export const getCurrentTenant = TenancyService.getCurrentTenant.bind(TenancyService);
export const isFeatureEnabled = TenancyService.isFeatureEnabled.bind(TenancyService);
export const checkLimit = TenancyService.checkLimit.bind(TenancyService);
export const getSetting = TenancyService.getSetting.bind(TenancyService);
export const applyTenantFilter = TenancyService.applyTenantFilter.bind(TenancyService);
export const validateTenantRules = TenancyService.validateTenantRules.bind(TenancyService);
export const getTenantUsage = TenancyService.getTenantUsage.bind(TenancyService);
export const isTenantWithinLimits = TenancyService.isTenantWithinLimits.bind(TenancyService);
export const getTenantBilling = TenancyService.getTenantBilling.bind(TenancyService);
export const upgradeTenantPlan = TenancyService.upgradeTenantPlan.bind(TenancyService);
export const cleanupTenant = TenancyService.cleanupTenant.bind(TenancyService);
