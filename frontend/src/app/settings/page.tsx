'use client'

import { useState } from 'react'
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'rbac' | 'security'>('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'system', name: 'System', icon: SettingsIcon },
    { id: 'rbac', name: 'RBAC', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock }
  ]

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
                  <p className="text-muted">Profile settings will be implemented here.</p>
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
                  <p className="text-muted">System settings will be implemented here.</p>
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
                  <p className="text-muted">RBAC settings will be implemented here.</p>
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
                  <p className="text-muted">Security settings will be implemented here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}