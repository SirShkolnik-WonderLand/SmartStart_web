'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  Lock,
  Save,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Palette,
  Database,
  Key,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Crown
} from 'lucide-react'
import { comprehensiveApiService as apiService, User as UserType } from '@/lib/api-comprehensive'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'rbac' | 'security' | 'subscriptions'>('profile')
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  })
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'system', name: 'System', icon: SettingsIcon },
    { id: 'subscriptions', name: 'Subscriptions', icon: Crown },
    { id: 'rbac', name: 'RBAC', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock }
  ]

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await apiService.getCurrentUser()
        if (response.success && response.data) {
          setUser(response.data)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      const response = await apiService.updateUser(user.id, {
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
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

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    setIsSaving(true)
    try {
      // This would call a password change API endpoint
      console.log('Changing password...')
      // await apiService.changePassword(currentPassword, newPassword)
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading settings...</p>
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
          <p className="text-foreground-muted">Manage your account, system preferences, and access controls</p>
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
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                          : 'text-foreground-muted hover:bg-glass-surface hover:text-primary'
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
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                          className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                      <textarea
                        value={user?.bio || ''}
                        onChange={(e) => setUser(prev => prev ? { ...prev, bio: e.target.value } : null)}
                        rows={3}
                        className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                        <input
                          type="text"
                          value={user?.location || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, location: e.target.value } : null)}
                          className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                        <input
                          type="url"
                          value={user?.website || ''}
                          onChange={(e) => setUser(prev => prev ? { ...prev, website: e.target.value } : null)}
                          className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="wonder-button flex items-center gap-2 px-6 py-2"
                      >
                        {isSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
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
                  
                  <div className="space-y-6">
                    {/* Theme Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Appearance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
                          <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                            <div>
                              <div className="font-medium text-foreground capitalize">{key} notifications</div>
                              <div className="text-sm text-foreground-muted">
                                {key === 'email' && 'Receive notifications via email'}
                                {key === 'push' && 'Receive push notifications'}
                                {key === 'sms' && 'Receive SMS notifications'}
                                {key === 'marketing' && 'Receive marketing communications'}
                              </div>
                            </div>
                            <button
                              onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                value ? 'bg-primary' : 'bg-gray-300'
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Data Management */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Data Management
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="flex items-center gap-3 p-4 bg-glass-surface rounded-lg hover:bg-glass-highlight transition-colors">
                          <Download className="w-5 h-5 text-primary" />
                          <div className="text-left">
                            <div className="font-medium text-foreground">Export Data</div>
                            <div className="text-sm text-foreground-muted">Download your data</div>
                          </div>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-glass-surface rounded-lg hover:bg-glass-highlight transition-colors">
                          <Upload className="w-5 h-5 text-accent" />
                          <div className="text-left">
                            <div className="font-medium text-foreground">Import Data</div>
                            <div className="text-sm text-foreground-muted">Upload your data</div>
                          </div>
                        </button>
                      </div>
                    </div>
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
                  
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <Shield className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">RBAC Management</h3>
                      <p className="text-foreground-muted mb-6">
                        Role-based access control settings will be available here. This feature allows you to manage user permissions and roles.
                      </p>
                      <div className="flex justify-center gap-4">
                        <button className="wonder-button flex items-center gap-2 px-4 py-2">
                          <User className="w-4 h-4" />
                          Manage Users
                        </button>
                        <button className="wonder-button flex items-center gap-2 px-4 py-2">
                          <Shield className="w-4 h-4" />
                          Manage Roles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Settings */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="wonderland-card glass-surface p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Crown className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Subscription Management</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Current Plan</h3>
                      <div className="glass rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-semibold text-foreground">Pro Plan</div>
                            <div className="text-foreground-muted">$29/month • Billed monthly</div>
                            <div className="text-sm text-success mt-1">✓ Active</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">$29</div>
                            <div className="text-sm text-foreground-muted">per month</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Plan Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-glass-surface rounded-lg">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span className="text-foreground">Unlimited ventures</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-glass-surface rounded-lg">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span className="text-foreground">Advanced analytics</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-glass-surface rounded-lg">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span className="text-foreground">Priority support</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-glass-surface rounded-lg">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span className="text-foreground">Custom integrations</span>
                        </div>
                      </div>
                    </div>

                    {/* Billing History */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Billing History</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">Pro Plan - Monthly</div>
                            <div className="text-sm text-foreground-muted">Dec 1, 2024</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">$29.00</div>
                            <div className="text-sm text-success">Paid</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">Pro Plan - Monthly</div>
                            <div className="text-sm text-foreground-muted">Nov 1, 2024</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">$29.00</div>
                            <div className="text-sm text-success">Paid</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button className="wonder-button px-6 py-2">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </button>
                      <button className="px-6 py-2 bg-glass-surface text-foreground rounded-lg hover:bg-glass-highlight transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </button>
                      <button className="px-6 py-2 bg-glass-surface text-foreground rounded-lg hover:bg-glass-highlight transition-colors">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Billing
                      </button>
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
                  
                  <div className="space-y-6">
                    {/* Password Change */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="w-full px-3 py-2 pr-10 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground-muted hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button className="wonder-button flex items-center gap-2 px-4 py-2">
                          <Key className="w-4 h-4" />
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Two-Factor Authentication
                      </h3>
                      <div className="p-4 bg-glass-surface rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">2FA Status</div>
                            <div className="text-sm text-foreground-muted">Add an extra layer of security to your account</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground-muted">Disabled</span>
                            <button className="wonder-button px-4 py-2">
                              Enable 2FA
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Active Sessions
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">Current Session</div>
                            <div className="text-sm text-foreground-muted">Chrome on macOS • San Francisco, CA</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span className="text-sm text-success">Active</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">Mobile App</div>
                            <div className="text-sm text-foreground-muted">iOS App • Last seen 2 hours ago</div>
                          </div>
                          <button className="text-destructive hover:text-destructive/80 flex items-center gap-1">
                            <Trash2 className="w-4 h-4" />
                            Revoke
                          </button>
                        </div>
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