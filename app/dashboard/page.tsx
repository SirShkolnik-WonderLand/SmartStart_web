'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

const MainDashboard = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user data:', error)
        // Redirect to login if not authenticated
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted mb-4">Please log in to access your dashboard.</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/')}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ventures', label: 'My Ventures', icon: '🚀' },
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#00ff88' }}>
            Welcome back, {user.firstName || user.name || 'there'}!
          </h1>
          <p className="text-muted">Ready to build something amazing?</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="btn btn-secondary"
            onClick={() => router.push('/venture-gate/profile')}
          >
            Edit Profile
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('ventures')}
          >
            Create Venture
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card mb-8">
        <div className="flex gap-2 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">📊 Dashboard Overview</h2>
            
            <div className="grid grid-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">🚀</div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted">My Ventures</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted">Team Members</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted">Active Projects</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⚖️</div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted">Legal Documents</p>
              </div>
            </div>

            <div className="grid grid-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">🎯 Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    className="btn btn-primary w-full justify-start"
                    onClick={() => setActiveTab('ventures')}
                  >
                    🚀 Create Your First Venture
                  </button>
                  <button 
                    className="btn btn-secondary w-full justify-start"
                    onClick={() => setActiveTab('explore')}
                  >
                    🔍 Explore Other Ventures
                  </button>
                  <button 
                    className="btn btn-secondary w-full justify-start"
                    onClick={() => setActiveTab('team')}
                  >
                    👥 Build Your Team
                  </button>
                  <button 
                    className="btn btn-secondary w-full justify-start"
                    onClick={() => setActiveTab('legal')}
                  >
                    ⚖️ Handle Legal Matters
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">📈 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="font-bold">Onboarding Complete</p>
                      <p className="text-sm text-muted">Welcome to SmartStart!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <p className="font-bold">Profile Setup</p>
                      <p className="text-sm text-muted">Your profile is complete</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                    <div className="text-2xl">📋</div>
                    <div>
                      <p className="font-bold">Legal Agreements</p>
                      <p className="text-sm text-muted">Platform agreements signed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ventures' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">🚀 My Ventures</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-4">No Ventures Yet</h3>
              <p className="text-muted mb-6">
                Create your first venture to start building something amazing
              </p>
              <button className="btn btn-primary btn-lg">
                Create Your First Venture
              </button>
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">🔍 Explore Ventures</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-4">Discover Opportunities</h3>
              <p className="text-muted mb-6">
                Browse ventures, find projects to contribute to, and connect with other entrepreneurs
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => router.push('/venture-gate/explore')}
              >
                Browse Ventures
              </button>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">👥 Team Management</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-4">Build Your Team</h3>
              <p className="text-muted mb-6">
                Find talented team members, manage roles, and collaborate effectively
              </p>
              <button className="btn btn-primary btn-lg">
                Start Building Your Team
              </button>
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">⚖️ Legal & Compliance</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold mb-4">Legal Framework</h3>
              <p className="text-muted mb-6">
                Handle legal entities, equity distribution, contracts, and compliance
              </p>
              <button className="btn btn-primary btn-lg">
                Manage Legal Matters
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">👤 Profile & Settings</h2>
            <div className="grid grid-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Name</label>
                    <p className="text-muted">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Email</label>
                    <p className="text-muted">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Level</label>
                    <p className="text-muted">{user.level || 'OWLET'}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => router.push('/venture-gate/profile')}
                >
                  Edit Profile
                </button>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <button className="btn btn-secondary w-full justify-start">
                    🔒 Change Password
                  </button>
                  <button className="btn btn-secondary w-full justify-start">
                    📧 Email Preferences
                  </button>
                  <button className="btn btn-secondary w-full justify-start">
                    🔔 Notification Settings
                  </button>
                  <button className="btn btn-secondary w-full justify-start">
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MainDashboard