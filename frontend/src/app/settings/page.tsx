'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Key, 
  Palette,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  Crown,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react'
import { comprehensiveApiService } from '@/lib/api-comprehensive'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  level: number
  xp: number
  reputation: number
  status: string
  lastActive: string
  profile?: {
    bio?: string
    avatar?: string
    phone?: string
    location?: string
    website?: string
    timezone?: string
  }
}

interface SystemSettings {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    marketing: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
    loginAlerts: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
  }
}

interface RBACSettings {
  roles: Array<{
    id: string
    name: string
    level: number
    permissions: string[]
    description: string
  }>
  permissions: Array<{
    id: string
    name: string
    category: string
    description: string
  }>
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'rbac' | 'security'>('profile')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      loginAlerts: true
    },
    appearance: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC'
    }
  })
  const [rbacSettings, setRbacSettings] = useState<RBACSettings>({
    roles: [],
    permissions: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    loadUserData()
    loadRBACData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await comprehensiveApiService.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRBACData = async () => {
    try {
      // Mock RBAC data - in real implementation, this would come from API
      setRbacSettings({
        roles: [
          {
            id: 'admin',
            name: 'Administrator',
            level: 1,
            permissions: ['all'],
            description: 'Full system access and control'
          },
          {
            id: 'manager',
            name: 'Manager',
            level: 2,
            permissions: ['manage_users', 'view_analytics', 'manage_projects'],
            description: 'Team and project management capabilities'
          },
          {
            id: 'user',
            name: 'User',
            level: 3,
            permissions: ['view_own_data', 'create_projects'],
            description: 'Standard user access'
          },
          {
            id: 'guest',
            name: 'Guest',
            level: 4,
            permissions: ['view_public'],
            description: 'Limited read-only access'
          }
        ],
        permissions: [
          { id: 'all', name: 'All Permissions', category: 'System', description: 'Full system access' },
          { id: 'manage_users', name: 'Manage Users', category: 'User Management', description: 'Create, edit, and delete users' },
          { id: 'view_analytics', name: 'View Analytics', category: 'Analytics', description: 'Access to system analytics and reports' },
          { id: 'manage_projects', name: 'Manage Projects', category: 'Projects', description: 'Create and manage projects' },
          { id: 'view_own_data', name: 'View Own Data', category: 'Personal', description: 'Access to own user data' },
          { id: 'create_projects', name: 'Create Projects', category: 'Projects', description: 'Create new projects' },
          { id: 'view_public', name: 'View Public', category: 'Public', description: 'View public information only' }
        ]
      })
    } catch (error) {
      console.error('Error loading RBAC data:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      const response = await comprehensiveApiService.updateUserProfile(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.profile?.bio || ''
      })
      
      if (response.success) {
        // Show success message
        console.log('Profile updated successfully')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSystemSettings = async () => {
    setIsSaving(true)
    try {
      // In real implementation, this would save to API
      console.log('Saving system settings:', systemSettings)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving system settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match')
      return
    }
    
    setIsSaving(true)
    try {
      // In real implementation, this would call password change API
      console.log('Changing password...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'system', name: 'System', icon: SettingsIcon },
    { id: 'rbac', name: 'RBAC', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="wonderland-card glass-surface p-8 text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wonderland-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-muted">Manage your account, system preferences, and access controls</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="wonderland-card glass-surface p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'profile' | 'system' | 'rbac' | 'security')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-muted hover:bg-glass-surface hover:text-primary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="wonderland-card glass-surface p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Profile Settings</h2>
                  </div>

                  {user && (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">First Name</label>
                          <input
                            type="text"
                            value={user.firstName}
                            onChange={(e) => setUser({...user, firstName: e.target.value})}
                            className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Last Name</label>
                          <input
                            type="text"
                            value={user.lastName}
                            onChange={(e) => setUser({...user, lastName: e.target.value})}
                            className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Email</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg text-muted cursor-not-allowed"
                        />
                        <p className="text-sm text-muted mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Bio</label>
                        <textarea
                          value={user.profile?.bio || ''}
                          onChange={(e) => setUser({
                            ...user, 
                            profile: {...user.profile, bio: e.target.value}
                          })}
                          rows={4}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Phone</label>
                          <input
                            type="tel"
                            value={user.profile?.phone || ''}
                            onChange={(e) => setUser({
                              ...user, 
                              profile: {...user.profile, phone: e.target.value}
                            })}
                            className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Location</label>
                          <input
                            type="text"
                            value={user.profile?.location || ''}
                            onChange={(e) => setUser({
                              ...user, 
                              profile: {...user.profile, location: e.target.value}
                            })}
                            className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Website</label>
                        <input
                          type="url"
                          value={user.profile?.website || ''}
                          onChange={(e) => setUser({
                            ...user, 
                            profile: {...user.profile, website: e.target.value}
                          })}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSaving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {isSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="wonderland-card glass-surface p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">System Settings</h2>
                  </div>

                  {/* Notifications */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(systemSettings.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <label className="text-primary font-medium capitalize">{key} Notifications</label>
                            <p className="text-sm text-muted">
                              {key === 'email' && 'Receive notifications via email'}
                              {key === 'push' && 'Receive push notifications in browser'}
                              {key === 'sms' && 'Receive SMS notifications'}
                              {key === 'marketing' && 'Receive marketing and promotional emails'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                notifications: {
                                  ...systemSettings.notifications,
                                  [key]: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Privacy
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Profile Visibility</label>
                        <select
                          value={systemSettings.privacy.profileVisibility}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            privacy: {
                              ...systemSettings.privacy,
                              profileVisibility: e.target.value as 'public' | 'private' | 'friends'
                            }
                          })}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      {Object.entries(systemSettings.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <label className="text-primary font-medium capitalize">
                              {key === 'showEmail' && 'Show Email'}
                              {key === 'showPhone' && 'Show Phone'}
                              {key === 'showLocation' && 'Show Location'}
                            </label>
                            <p className="text-sm text-muted">
                              {key === 'showEmail' && 'Display email address on profile'}
                              {key === 'showPhone' && 'Display phone number on profile'}
                              {key === 'showLocation' && 'Display location on profile'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                privacy: {
                                  ...systemSettings.privacy,
                                  [key]: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Appearance */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Appearance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Theme</label>
                        <select
                          value={systemSettings.appearance.theme}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            appearance: {
                              ...systemSettings.appearance,
                              theme: e.target.value as 'light' | 'dark' | 'auto'
                            }
                          })}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Language</label>
                        <select
                          value={systemSettings.appearance.language}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            appearance: {
                              ...systemSettings.appearance,
                              language: e.target.value
                            }
                          })}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSystemSettings}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RBAC Settings */}
            {activeTab === 'rbac' && (
              <div className="space-y-6">
                <div className="wonderland-card glass-surface p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Role-Based Access Control</h2>
                  </div>

                  {/* Current User Role */}
                  {user && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Your Current Role
                      </h3>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xl font-bold">Level {user.level} User</h4>
                            <p className="text-purple-100">Standard access permissions</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{user.xp} XP</div>
                            <div className="text-purple-100">Experience Points</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Roles */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Available Roles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rbacSettings.roles.map((role) => (
                        <div key={role.id} className="border border-glass-border rounded-lg p-4 hover:bg-glass-surface transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-primary">{role.name}</h4>
                            <span className="text-sm text-muted">Level {role.level}</span>
                          </div>
                          <p className="text-sm text-muted mb-3">{role.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <span key={permission} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {permission}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="text-xs text-muted">+{role.permissions.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permissions Matrix */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Permissions Matrix
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border">
                            <th className="text-left py-3 px-4 font-semibold text-primary">Permission</th>
                            <th className="text-left py-3 px-4 font-semibold text-primary">Category</th>
                            <th className="text-left py-3 px-4 font-semibold text-primary">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rbacSettings.permissions.map((permission) => (
                            <tr key={permission.id} className="border-b border-glass-border hover:bg-glass-surface">
                              <td className="py-3 px-4 font-medium text-primary">{permission.name}</td>
                              <td className="py-3 px-4 text-muted">{permission.category}</td>
                              <td className="py-3 px-4 text-muted">{permission.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="wonderland-card glass-surface p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Security Settings</h2>
                  </div>

                  {/* Password Change */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={isSaving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Key className="w-4 h-4" />
                        )}
                        {isSaving ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>

                  {/* Security Options */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Options
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-primary font-medium">Two-Factor Authentication</label>
                          <p className="text-sm text-muted">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings.security.twoFactor}
                            onChange={(e) => setSystemSettings({
                              ...systemSettings,
                              security: {
                                ...systemSettings.security,
                                twoFactor: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-primary font-medium">Login Alerts</label>
                          <p className="text-sm text-muted">Get notified when someone logs into your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings.security.loginAlerts}
                            onChange={(e) => setSystemSettings({
                              ...systemSettings,
                              security: {
                                ...systemSettings.security,
                                loginAlerts: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          min="5"
                          max="480"
                          value={systemSettings.security.sessionTimeout}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            security: {
                              ...systemSettings.security,
                              sessionTimeout: parseInt(e.target.value)
                            }
                          })}
                          className="w-full px-4 py-3 bg-glass-surface border border-glass-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Status */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Security Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">Password</span>
                        </div>
                        <p className="text-sm text-green-700">Strong password set</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-amber-800">2FA</span>
                        </div>
                        <p className="text-sm text-amber-700">Not enabled</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Sessions</span>
                        </div>
                        <p className="text-sm text-blue-700">1 active session</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
