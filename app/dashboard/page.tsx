'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

const MainDashboard = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  const loadSubscriptionData = async () => {
    if (!user?.id) return
    
    setSubscriptionLoading(true)
    try {
      const response = await fetch(`https://smartstart-api.onrender.com/api/subscriptions/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        setSubscription(data.data[0]) // Get the first (most recent) subscription
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    } finally {
      setSubscriptionLoading(false)
    }
  }

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

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionData()
    }
  }, [user])

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
    { id: 'subscription', label: 'Subscription', icon: '💳' },
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
            onClick={() => setActiveTab('profile')}
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
              <h3 className="text-xl font-bold mb-4">Venture Management</h3>
              <p className="text-muted mb-6">
                Create, manage, and track your ventures
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => router.push('/ventures')}
                >
                  Manage Ventures
                </button>
                <button 
                  className="btn btn-secondary btn-lg"
                  onClick={() => router.push('/venture-gate/create')}
                >
                  Create New Venture
                </button>
              </div>
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
              <div className="flex gap-4 justify-center">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => router.push('/venture-gate/explore')}
                >
                  Browse Ventures
                </button>
                <button 
                  className="btn btn-secondary btn-lg"
                  onClick={() => router.push('/ventures')}
                >
                  My Ventures
                </button>
              </div>
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
            
            <div className="grid grid-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Legal Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                    <div className="text-2xl">📋</div>
                    <div>
                      <p className="font-bold">Platform Agreements</p>
                      <p className="text-sm text-muted">Terms of service and privacy policy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-bold">NDA Documents</p>
                      <p className="text-sm text-muted">Non-disclosure agreements</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                    <div className="text-2xl">📝</div>
                    <div>
                      <p className="font-bold">Contract Templates</p>
                      <p className="text-sm text-muted">Pre-built legal templates</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    className="btn btn-primary w-full"
                    onClick={() => router.push('/venture-gate/legal')}
                  >
                    📋 Manage Legal Documents
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="btn btn-secondary w-full justify-start">
                    🏢 Create Legal Entity
                  </button>
                  <button className="btn btn-secondary w-full justify-start">
                    📊 Equity Distribution
                  </button>
                  <button className="btn btn-secondary w-full justify-start">
                    📋 Contract Management
                  </button>
                  <button className="btn btn-secondary w-full justify-start">
                    ✅ Compliance Check
                  </button>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-bold mb-3">Legal Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Platform Agreements:</span>
                      <span className="text-green-400">✅ Signed</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>NDA Status:</span>
                      <span className="text-green-400">✅ Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Legal Entity:</span>
                      <span className="text-yellow-400">⚠️ Not Created</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">💳 Subscription Management</h2>
            
            {subscriptionLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner"></div>
                <p className="text-muted mt-4">Loading subscription data...</p>
              </div>
            ) : subscription ? (
              <div className="grid grid-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Current Subscription</h3>
                  <div className="card bg-gray-800 border border-green-500">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-green-400">{subscription.plan.name}</h4>
                          <p className="text-sm text-muted">{subscription.plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            ${subscription.plan.price}
                          </div>
                          <div className="text-sm text-muted">per {subscription.plan.interval.toLowerCase()}</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Status:</span>
                          <span className={`font-bold ${subscription.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {subscription.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Start Date:</span>
                          <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>End Date:</span>
                          <span>{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Lifetime'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Auto Renew:</span>
                          <span>{subscription.autoRenew ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button className="btn btn-secondary w-full">
                          📋 View Invoice
                        </button>
                        <button className="btn btn-secondary w-full">
                          🔄 Change Plan
                        </button>
                        {subscription.autoRenew && (
                          <button className="btn btn-secondary w-full">
                            ⏸️ Pause Auto-Renew
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Plan Features</h3>
                  <div className="space-y-3">
                    {subscription.plan.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                        <div className="text-green-400">✓</div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-bold mb-3">Available Plans</h4>
                    <button 
                      className="btn btn-primary w-full"
                      onClick={() => router.push('/venture-gate/plans')}
                    >
                      💳 View All Plans
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-xl font-bold mb-4">No Active Subscription</h3>
                <p className="text-muted mb-6">
                  Choose a subscription plan to unlock all platform features
                </p>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => router.push('/venture-gate/plans')}
                >
                  Choose Your Plan
                </button>
              </div>
            )}
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
                  Edit Profile Details
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