import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SystemSettingData {
  category: string
  key: string
  value: string
  description?: string
}

export interface SystemSettings {
  general: {
    platformName: string
    platformDescription: string
    contactEmail: string
    supportEmail: string
    timezone: string
    dateFormat: string
  }
  security: {
    require2FA: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireStrongPasswords: boolean
    enableAuditLogging: boolean
  }
  community: {
    allowPublicRegistration: boolean
    requireEmailVerification: boolean
    requireAdminApproval: boolean
    maxProjectsPerUser: number
    maxTeamSize: number
    enableCommunityChallenges: boolean
    enableGamification: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    weeklyDigest: boolean
    milestoneAlerts: boolean
    contributionUpdates: boolean
  }
  integrations: {
    enableGitHub: boolean
    enableSlack: boolean
    enableTeams: boolean
    enableDiscord: boolean
  }
}

export class SystemSettingsService {
  // Get all settings
  async getAllSettings(): Promise<SystemSettings> {
    const settings = await prisma.systemSetting.findMany()
    
    const result: SystemSettings = {
      general: {
        platformName: 'SmartStart',
        platformDescription: 'Community-driven development platform for building the future together',
        contactEmail: 'contact@smartstart.com',
        supportEmail: 'support@smartstart.com',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY'
      },
      security: {
        require2FA: true,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 12,
        requireStrongPasswords: true,
        enableAuditLogging: true
      },
      community: {
        allowPublicRegistration: false,
        requireEmailVerification: true,
        requireAdminApproval: true,
        maxProjectsPerUser: 10,
        maxTeamSize: 20,
        enableCommunityChallenges: true,
        enableGamification: true
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: true,
        milestoneAlerts: true,
        contributionUpdates: true
      },
      integrations: {
        enableGitHub: true,
        enableSlack: false,
        enableTeams: false,
        enableDiscord: false
      }
    }

    // Override defaults with database values
    settings.forEach(setting => {
      const category = setting.category as keyof SystemSettings
      const key = setting.key as keyof SystemSettings[typeof category]
      
      if (result[category] && key in result[category]) {
        const value = setting.value
        const target = result[category] as any
        
        // Convert string values to appropriate types
        if (typeof target[key] === 'boolean') {
          target[key] = value === 'true'
        } else if (typeof target[key] === 'number') {
          target[key] = parseInt(value)
        } else {
          target[key] = value
        }
      }
    })

    return result
  }

  // Get settings by category
  async getSettingsByCategory(category: string) {
    return await prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    })
  }

  // Get specific setting
  async getSetting(category: string, key: string) {
    return await prisma.systemSetting.findUnique({
      where: {
        category_key: {
          category,
          key
        }
      }
    })
  }

  // Update setting
  async updateSetting(category: string, key: string, value: string, description?: string) {
    return await prisma.systemSetting.upsert({
      where: {
        category_key: {
          category,
          key
        }
      },
      update: {
        value,
        description,
        updatedAt: new Date()
      },
      create: {
        category,
        key,
        value,
        description
      }
    })
  }

  // Update multiple settings
  async updateSettings(settings: SystemSettingData[]) {
    const results = []
    
    for (const setting of settings) {
      const result = await this.updateSetting(
        setting.category,
        setting.key,
        setting.value,
        setting.description
      )
      results.push(result)
    }
    
    return results
  }

  // Update settings from object
  async updateSettingsFromObject(settings: Partial<SystemSettings>) {
    const updates: SystemSettingData[] = []
    
    Object.entries(settings).forEach(([category, categorySettings]) => {
      Object.entries(categorySettings as any).forEach(([key, value]) => {
        updates.push({
          category,
          key,
          value: String(value)
        })
      })
    })
    
    return await this.updateSettings(updates)
  }

  // Delete setting
  async deleteSetting(category: string, key: string) {
    return await prisma.systemSetting.delete({
      where: {
        category_key: {
          category,
          key
        }
      }
    })
  }

  // Reset settings to defaults
  async resetToDefaults() {
    const defaultSettings: SystemSettingData[] = [
      // General
      { category: 'general', key: 'platformName', value: 'SmartStart' },
      { category: 'general', key: 'platformDescription', value: 'Community-driven development platform for building the future together' },
      { category: 'general', key: 'contactEmail', value: 'contact@smartstart.com' },
      { category: 'general', key: 'supportEmail', value: 'support@smartstart.com' },
      { category: 'general', key: 'timezone', value: 'UTC' },
      { category: 'general', key: 'dateFormat', value: 'MM/DD/YYYY' },
      
      // Security
      { category: 'security', key: 'require2FA', value: 'true' },
      { category: 'security', key: 'sessionTimeout', value: '24' },
      { category: 'security', key: 'maxLoginAttempts', value: '5' },
      { category: 'security', key: 'passwordMinLength', value: '12' },
      { category: 'security', key: 'requireStrongPasswords', value: 'true' },
      { category: 'security', key: 'enableAuditLogging', value: 'true' },
      
      // Community
      { category: 'community', key: 'allowPublicRegistration', value: 'false' },
      { category: 'community', key: 'requireEmailVerification', value: 'true' },
      { category: 'community', key: 'requireAdminApproval', value: 'true' },
      { category: 'community', key: 'maxProjectsPerUser', value: '10' },
      { category: 'community', key: 'maxTeamSize', value: '20' },
      { category: 'community', key: 'enableCommunityChallenges', value: 'true' },
      { category: 'community', key: 'enableGamification', value: 'true' },
      
      // Notifications
      { category: 'notifications', key: 'emailNotifications', value: 'true' },
      { category: 'notifications', key: 'pushNotifications', value: 'true' },
      { category: 'notifications', key: 'weeklyDigest', value: 'true' },
      { category: 'notifications', key: 'milestoneAlerts', value: 'true' },
      { category: 'notifications', key: 'contributionUpdates', value: 'true' },
      
      // Integrations
      { category: 'integrations', key: 'enableGitHub', value: 'true' },
      { category: 'integrations', key: 'enableSlack', value: 'false' },
      { category: 'integrations', key: 'enableTeams', value: 'false' },
      { category: 'integrations', key: 'enableDiscord', value: 'false' }
    ]
    
    // Clear existing settings
    await prisma.systemSetting.deleteMany({})
    
    // Insert default settings
    return await prisma.systemSetting.createMany({
      data: defaultSettings
    })
  }

  // Get setting value with type conversion
  async getSettingValue<T>(category: string, key: string, defaultValue: T): Promise<T> {
    const setting = await this.getSetting(category, key)
    
    if (!setting) return defaultValue
    
    const value = setting.value
    
    // Convert string value to appropriate type
    if (typeof defaultValue === 'boolean') {
      return (value === 'true') as T
    } else if (typeof defaultValue === 'number') {
      return parseInt(value) as T
    } else {
      return value as T
    }
  }

  // Check if feature is enabled
  async isFeatureEnabled(feature: string): Promise<boolean> {
    const setting = await this.getSetting('community', feature)
    return setting ? setting.value === 'true' : false
  }

  // Get security settings
  async getSecuritySettings() {
    return {
      require2FA: await this.getSettingValue('security', 'require2FA', true),
      sessionTimeout: await this.getSettingValue('security', 'sessionTimeout', 24),
      maxLoginAttempts: await this.getSettingValue('security', 'maxLoginAttempts', 5),
      passwordMinLength: await this.getSettingValue('security', 'passwordMinLength', 12),
      requireStrongPasswords: await this.getSettingValue('security', 'requireStrongPasswords', true),
      enableAuditLogging: await this.getSettingValue('security', 'enableAuditLogging', true)
    }
  }

  // Get community settings
  async getCommunitySettings() {
    return {
      allowPublicRegistration: await this.getSettingValue('community', 'allowPublicRegistration', false),
      requireEmailVerification: await this.getSettingValue('community', 'requireEmailVerification', true),
      requireAdminApproval: await this.getSettingValue('community', 'requireAdminApproval', true),
      maxProjectsPerUser: await this.getSettingValue('community', 'maxProjectsPerUser', 10),
      maxTeamSize: await this.getSettingValue('community', 'maxTeamSize', 20),
      enableCommunityChallenges: await this.getSettingValue('community', 'enableCommunityChallenges', true),
      enableGamification: await this.getSettingValue('community', 'enableGamification', true)
    }
  }
}
