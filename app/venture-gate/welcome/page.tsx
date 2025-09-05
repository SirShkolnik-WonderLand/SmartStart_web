'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../../services/api'

const WelcomeDashboard = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleAccessDashboard = async () => {
    try {
      // Complete the onboarding journey
      if (user?.id) {
        await apiService.updateJourneyState(user.id, 6) // Complete stage 6
      }
      
      // Redirect to main dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      // Still redirect to dashboard even if API call fails
      router.push('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading welcome...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-5xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Welcome to SmartStart!
        </h1>
        <p className="text-xl text-muted mb-6">
          You've successfully completed the onboarding process
        </p>
        {user && (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header">
              <h3>👋 Hello, {user.firstName || user.name || 'there'}!</h3>
            </div>
            <div className="text-center">
              <p className="text-muted">
                Your account is ready and you now have full access to the SmartStart platform.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Complete */}
      <div className="card mb-8">
        <div className="card-header">
          <h3>✅ Onboarding Complete</h3>
          <p className="text-muted">You've successfully completed all 6 onboarding steps</p>
        </div>
        
        <div className="grid grid-3 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">👤</div>
            <h4 className="font-bold text-sm">Account Created</h4>
            <p className="text-xs text-muted">Email verified</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-bold text-sm">Profile Setup</h4>
            <p className="text-xs text-muted">Skills & experience added</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">📋</div>
            <h4 className="font-bold text-sm">Legal Pack</h4>
            <p className="text-xs text-muted">Agreements signed</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">💳</div>
            <h4 className="font-bold text-sm">Subscription</h4>
            <p className="text-xs text-muted">Plan selected</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🎓</div>
            <h4 className="font-bold text-sm">Orientation</h4>
            <p className="text-xs text-muted">Platform learned</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">🏠</div>
            <h4 className="font-bold text-sm">Dashboard</h4>
            <p className="text-xs text-muted">Ready to go!</p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="grid grid-2 gap-8 mb-8">
        <div className="card">
          <div className="card-header">
            <h3>🚀 What You Can Do Now</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-bold">Create Your Venture</h4>
                <p className="text-sm text-muted">
                  Start your own venture or join existing ones
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">👥</div>
              <div>
                <h4 className="font-bold">Build Your Team</h4>
                <p className="text-sm text-muted">
                  Find talented team members and collaborators
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔍</div>
              <div>
                <h4 className="font-bold">Explore Opportunities</h4>
                <p className="text-sm text-muted">
                  Browse ventures and find projects to contribute to
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚖️</div>
              <div>
                <h4 className="font-bold">Handle Legal Matters</h4>
                <p className="text-sm text-muted">
                  Set up legal entities, distribute equity, execute contracts
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>📊 Your Dashboard Features</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📈</div>
              <div>
                <h4 className="font-bold">Progress Tracking</h4>
                <p className="text-sm text-muted">
                  Monitor your ventures and team progress
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-bold">Goal Setting</h4>
                <p className="text-sm text-muted">
                  Set and track milestones for your projects
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <h4 className="font-bold">Team Communication</h4>
                <p className="text-sm text-muted">
                  Collaborate with your team members
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">📋</div>
              <div>
                <h4 className="font-bold">Project Management</h4>
                <p className="text-sm text-muted">
                  Organize tasks and manage project workflows
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stats */}
      <div className="card mb-8">
        <div className="card-header">
          <h3>🎯 Onboarding Success</h3>
        </div>
        <div className="grid grid-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold" style={{ color: '#00ff88' }}>6</div>
            <p className="text-sm text-muted">Steps Completed</p>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: '#00ff88' }}>100%</div>
            <p className="text-sm text-muted">Onboarding Success</p>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: '#00ff88' }}>∞</div>
            <p className="text-sm text-muted">Possibilities</p>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: '#00ff88' }}>🚀</div>
            <p className="text-sm text-muted">Ready to Launch</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleAccessDashboard}
          style={{ 
            fontSize: '1.2rem', 
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🚀 Access Your Dashboard
        </button>
        <p className="text-sm text-muted mt-4">
          Start building your venture and collaborating with the SmartStart community
        </p>
      </div>
    </div>
  )
}

export default WelcomeDashboard
