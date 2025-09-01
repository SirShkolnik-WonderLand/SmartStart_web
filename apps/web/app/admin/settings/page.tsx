'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../../components/AppLayout'
import { apiCallWithAuth } from '../../utils/api'
import '../../styles/admin.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface SystemSettings {
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

export default function SystemSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<SystemSettings>({
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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [authToken, setAuthToken] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!userCookie || !tokenCookie) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userCookie.split('=')[1])
        const token = tokenCookie.split('=')[1]
        setUser(userData)
        setAuthToken(token)
        
        // Check if user is admin
        if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
          router.push('/portfolio')
          return
        }
        
        // Fetch settings data
        fetchSettingsData(token)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchSettingsData = async (token: string) => {
    try {
      
      // Fetch settings from API
      const data = await apiCallWithAuth('/admin/settings', token)
      
      // Transform API data to match our interface
      const transformedSettings: SystemSettings = {
        general: {
          platformName: data.general?.platformName || 'SmartStart',
          platformDescription: data.general?.platformDescription || 'Community-driven development platform for building the future together',
          contactEmail: data.general?.contactEmail || 'contact@smartstart.com',
          supportEmail: data.general?.supportEmail || 'support@smartstart.com',
          timezone: data.general?.timezone || 'UTC',
          dateFormat: data.general?.dateFormat || 'MM/DD/YYYY'
        },
        security: {
          require2FA: data.security?.require2FA !== false,
          sessionTimeout: data.security?.sessionTimeout || 24,
          maxLoginAttempts: data.security?.maxLoginAttempts || 5,
          passwordMinLength: data.security?.passwordMinLength || 12,
          requireStrongPasswords: data.security?.requireStrongPasswords !== false,
          enableAuditLogging: data.security?.enableAuditLogging !== false
        },
        community: {
          allowPublicRegistration: data.community?.allowPublicRegistration === true,
          requireEmailVerification: data.community?.requireEmailVerification !== false,
          requireAdminApproval: data.community?.requireAdminApproval !== false,
          maxProjectsPerUser: data.community?.maxProjectsPerUser || 10,
          maxTeamSize: data.community?.maxTeamSize || 20,
          enableCommunityChallenges: data.community?.enableCommunityChallenges !== false,
          enableGamification: data.community?.enableGamification !== false
        },
        notifications: {
          emailNotifications: data.notifications?.emailNotifications !== false,
          pushNotifications: data.notifications?.pushNotifications !== false,
          weeklyDigest: data.notifications?.weeklyDigest !== false,
          milestoneAlerts: data.notifications?.milestoneAlerts !== false,
          contributionUpdates: data.notifications?.contributionUpdates !== false
        },
        integrations: {
          enableGitHub: data.integrations?.enableGitHub !== false,
          enableSlack: data.integrations?.enableSlack === true,
          enableTeams: data.integrations?.enableTeams === true,
          enableDiscord: data.integrations?.enableDiscord === true
        }
      }
      
      setSettings(transformedSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Keep default settings if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    
    try {
      if (!authToken) {
        router.push('/login')
        return
      }
      
      // Save settings via API
      await apiCallWithAuth('/admin/settings', authToken, {
        method: 'PUT',
        body: JSON.stringify(settings)
      })

      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      // Reset to default values
      setSettings({
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
      })
    }
  }

  if (loading) {
    return (
      <AppLayout currentPage="/admin">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading System Settings...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <AppLayout currentPage="/admin">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Admin access required to manage system settings.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/admin">
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure platform settings, security policies, and community rules</p>
      </div>

      {/* Settings Navigation */}
      <div className="settings-navigation">
        <button
          className={`nav-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span className="tab-icon">⚙️</span>
          General
        </button>
        <button
          className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <span className="tab-icon">🔒</span>
          Security
        </button>
        <button
          className={`nav-tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <span className="tab-icon">👥</span>
          Community
        </button>
        <button
          className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="tab-icon">🔔</span>
          Notifications
        </button>
        <button
          className={`nav-tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <span className="tab-icon">🔗</span>
          Integrations
        </button>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <h2 className="section-title">General Platform Settings</h2>
            <div className="settings-grid">
              <div className="setting-group">
                <label htmlFor="platform-name" className="setting-label">Platform Name</label>
                <input
                  type="text"
                  id="platform-name"
                  value={settings.general.platformName}
                  onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                  className="setting-input"
                />
              </div>
              
              <div className="setting-group">
                <label htmlFor="platform-description" className="setting-label">Platform Description</label>
                <textarea
                  id="platform-description"
                  value={settings.general.platformDescription}
                  onChange={(e) => handleSettingChange('general', 'platformDescription', e.target.value)}
                  className="setting-textarea"
                  rows={3}
                />
              </div>
              
              <div className="setting-group">
                <label htmlFor="contact-email" className="setting-label">Contact Email</label>
                <input
                  type="email"
                  id="contact-email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                  className="setting-input"
                />
              </div>
              
              <div className="setting-group">
                <label htmlFor="support-email" className="setting-label">Support Email</label>
                <input
                  type="email"
                  id="support-email"
                  value={settings.general.supportEmail}
                  onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                  className="setting-input"
                />
              </div>
              
              <div className="setting-group">
                <label htmlFor="timezone" className="setting-label">Default Timezone</label>
                <select
                  id="timezone"
                  value={settings.general.timezone}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  className="setting-select"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              
              <div className="setting-group">
                <label htmlFor="date-format" className="setting-label">Date Format</label>
                <select
                  id="date-format"
                  value={settings.general.dateFormat}
                  onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                  className="setting-select"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <h2 className="section-title">Security & Authentication</h2>
            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.security.require2FA}
                    onChange={(e) => handleSettingChange('security', 'require2FA', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Require Two-Factor Authentication
                </label>
                <p className="setting-description">All users must enable 2FA for enhanced security</p>
              </div>
              
              <div className="setting-group">
                <label htmlFor="session-timeout" className="setting-label">Session Timeout (hours)</label>
                <input
                  type="number"
                  id="session-timeout"
                  min="1"
                  max="168"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="setting-input"
                />
                <p className="setting-description">How long before users are automatically logged out</p>
              </div>
              
              <div className="setting-group">
                <label htmlFor="max-login-attempts" className="setting-label">Max Login Attempts</label>
                <input
                  type="number"
                  id="max-login-attempts"
                  min="3"
                  max="10"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="setting-input"
                />
                <p className="setting-description">Number of failed attempts before account lockout</p>
              </div>
              
              <div className="setting-group">
                <label htmlFor="password-min-length" className="setting-label">Minimum Password Length</label>
                <input
                  type="number"
                  id="password-min-length"
                  min="8"
                  max="32"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="setting-input"
                />
                <p className="setting-description">Minimum characters required for passwords</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.security.requireStrongPasswords}
                    onChange={(e) => handleSettingChange('security', 'requireStrongPasswords', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Require Strong Passwords
                </label>
                <p className="setting-description">Passwords must include uppercase, lowercase, numbers, and symbols</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.security.enableAuditLogging}
                    onChange={(e) => handleSettingChange('security', 'enableAuditLogging', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Enable Audit Logging
                </label>
                <p className="setting-description">Log all security-related activities for compliance</p>
              </div>
            </div>
          </div>
        )}

        {/* Community Settings */}
        {activeTab === 'community' && (
          <div className="settings-section">
            <h2 className="section-title">Community & Collaboration</h2>
            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.community.allowPublicRegistration}
                    onChange={(e) => handleSettingChange('community', 'allowPublicRegistration', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Allow Public Registration
                </label>
                <p className="setting-description">Anyone can sign up without an invitation</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.community.requireEmailVerification}
                    onChange={(e) => handleSettingChange('community', 'requireEmailVerification', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Require Email Verification
                </label>
                <p className="setting-description">Users must verify their email before accessing the platform</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.community.requireAdminApproval}
                    onChange={(e) => handleSettingChange('community', 'requireAdminApproval', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Require Admin Approval
                </label>
                <p className="setting-description">New registrations must be approved by an admin</p>
              </div>
              
              <div className="setting-group">
                <label htmlFor="max-projects" className="setting-label">Max Projects Per User</label>
                <input
                  type="number"
                  id="max-projects"
                  min="1"
                  max="50"
                  value={settings.community.maxProjectsPerUser}
                  onChange={(e) => handleSettingChange('community', 'maxProjectsPerUser', parseInt(e.target.value))}
                  className="setting-input"
                />
                <p className="setting-description">Maximum number of projects a user can own</p>
              </div>
              
              <div className="setting-group">
                <label htmlFor="max-team-size" className="setting-label">Max Team Size</label>
                <input
                  type="number"
                  id="max-team-size"
                  min="2"
                  max="100"
                  value={settings.community.maxTeamSize}
                  onChange={(e) => handleSettingChange('community', 'maxTeamSize', parseInt(e.target.value))}
                  className="setting-input"
                />
                <p className="setting-description">Maximum number of members per project team</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.community.enableCommunityChallenges}
                    onChange={(e) => handleSettingChange('community', 'enableCommunityChallenges', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Enable Community Challenges
                </label>
                <p className="setting-description">Allow community-wide challenges and competitions</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.community.enableGamification}
                    onChange={(e) => handleSettingChange('community', 'enableGamification', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Enable Gamification
                </label>
                <p className="setting-description">Levels, badges, and XP system for engagement</p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2 className="section-title">Notification Preferences</h2>
            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Email Notifications
                </label>
                <p className="setting-description">Send notifications via email</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Push Notifications
                </label>
                <p className="setting-description">Send browser push notifications</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyDigest}
                    onChange={(e) => handleSettingChange('notifications', 'weeklyDigest', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Weekly Digest
                </label>
                <p className="setting-description">Send weekly summary of activities</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.milestoneAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'milestoneAlerts', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Milestone Alerts
                </label>
                <p className="setting-description">Notify when project milestones are reached</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.contributionUpdates}
                    onChange={(e) => handleSettingChange('notifications', 'contributionUpdates', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Contribution Updates
                </label>
                <p className="setting-description">Notify about contribution acceptances and rejections</p>
              </div>
            </div>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div className="settings-section">
            <h2 className="section-title">Third-Party Integrations</h2>
            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.integrations.enableGitHub}
                    onChange={(e) => handleSettingChange('integrations', 'enableGitHub', e.target.checked)}
                    className="setting-checkbox"
                  />
                  GitHub Integration
                </label>
                <p className="setting-description">Connect projects to GitHub repositories</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.integrations.enableSlack}
                    onChange={(e) => handleSettingChange('integrations', 'enableSlack', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Slack Integration
                </label>
                <p className="setting-description">Send notifications to Slack channels</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.integrations.enableTeams}
                    onChange={(e) => handleSettingChange('integrations', 'enableTeams', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Microsoft Teams Integration
                </label>
                <p className="setting-description">Send notifications to Teams channels</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.integrations.enableDiscord}
                    onChange={(e) => handleSettingChange('integrations', 'enableDiscord', e.target.checked)}
                    className="setting-checkbox"
                  />
                  Discord Integration
                </label>
                <p className="setting-description">Send notifications to Discord servers</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="settings-actions">
        <button
          onClick={handleResetToDefaults}
          className="btn btn-secondary"
        >
          Reset to Defaults
        </button>
        
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Save Success Message */}
      {showSaveSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          Settings saved successfully!
        </div>
      )}
    </AppLayout>
  )
}
