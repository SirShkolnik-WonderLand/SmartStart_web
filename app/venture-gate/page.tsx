'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, JourneyState } from '../services/api'

interface JourneyStage {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'locked' | 'available'
  icon: string
  actions: string[]
  requirements: string[]
}

const VentureGateJourney = () => {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const journeyStages: JourneyStage[] = [
    {
      id: 'stage_1',
      title: 'Account Creation',
      description: 'Create your account and verify email',
      status: 'completed',
      icon: '👤',
      actions: ['Email verification', 'Password setup', 'Terms acceptance'],
      requirements: ['Valid email address']
    },
    {
      id: 'stage_2',
      title: 'Profile Setup',
      description: 'Complete your profile with skills and experience',
      status: 'current',
      icon: '🎯',
      actions: ['Complete profile', 'Add skills', 'Set preferences'],
      requirements: ['Profile completion']
    },
    {
      id: 'stage_3',
      title: 'Platform Legal Pack',
      description: 'Sign required platform agreements',
      status: 'locked',
      icon: '📋',
      actions: ['Review PPA', 'Sign NDA', 'Accept terms'],
      requirements: ['Platform agreements']
    },
    {
      id: 'stage_4',
      title: 'Subscription Selection',
      description: 'Choose your subscription plan',
      status: 'locked',
      icon: '💳',
      actions: ['Select plan', 'Payment processing', 'Invoice generation'],
      requirements: ['Active subscription']
    },
    {
      id: 'stage_5',
      title: 'Platform Orientation',
      description: 'Learn how the platform works',
      status: 'locked',
      icon: '🎓',
      actions: ['Platform tour', 'Feature overview', 'Examples'],
      requirements: ['Platform understanding']
    },
    {
      id: 'stage_6',
      title: 'Welcome & Dashboard',
      description: 'Access your main dashboard',
      status: 'locked',
      icon: '🏠',
      actions: ['Dashboard access', 'Next steps', 'Get started'],
      requirements: ['Onboarding complete']
    }
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Try to get current user from API (this will check localStorage first, then API)
      const userData = await apiService.getCurrentUser()
      setUser(userData)
      
      // Load journey state
      const journey = await apiService.getJourneyState(userData.id)
      setJourneyState(journey)
      
      if (journey) {
        setCurrentStage(journey.currentStage)
        console.log('Journey state loaded:', journey)
      } else {
        // No journey state found - user needs to start from beginning
        console.log('No journey state found, starting from stage 0')
        setCurrentStage(0) // Start at stage 0 (discover)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // If there's an error, clear stored data and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-data')
        localStorage.removeItem('user-id')
        localStorage.removeItem('auth-token')
      }
      console.log('User not authenticated, redirecting to login')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const getStageStatus = (index: number): JourneyStage['status'] => {
    if (index < currentStage) return 'completed'
    if (index === currentStage) return 'current'
    if (index === currentStage + 1) return 'available'
    return 'locked'
  }

  const handleStageAction = async (stage: JourneyStage) => {
    try {
      // Get user ID for API calls
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('user-id') : null
      const resolvedUserId = (user as any)?.id || (user as any)?.data?.id || storedId

      // For stages that need to be started first (only if not already started)
      if (resolvedUserId && ['stage_5', 'stage_6', 'stage_7'].includes(stage.id)) {
        try {
          await apiService.startJourneyStage(resolvedUserId, stage.id)
        } catch (error) {
          // Stage might already be started, continue anyway
          console.log('Stage might already be started:', error)
        }
      }

      switch (stage.id) {
        case 'stage_1':
          // Account Creation - redirect to register (already completed)
          router.push('/register')
          break
        case 'stage_2':
          // Profile Setup
          router.push('/venture-gate/profile')
          break
        case 'stage_3':
          // Platform Legal Pack
          router.push('/venture-gate/legal')
          break
        case 'stage_4':
          // Subscription Selection
          router.push('/venture-gate/plans')
          break
        case 'stage_5':
          // Platform Orientation
          router.push('/venture-gate/orientation')
          break
        case 'stage_6':
          // Welcome & Dashboard
          router.push('/venture-gate/welcome')
          break
        default:
          console.log(`Action for ${stage.id} not implemented yet`)
      }
    } catch (error) {
      console.error('Error handling stage action:', error)
    }
  }

  const completeCurrentStage = async () => {
    try {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('user-id') : null
      const resolvedUserId = (user as any)?.id || (user as any)?.data?.id || storedId

      if (!resolvedUserId) {
        console.error('No user ID found')
        return
      }

      // Mark current stage as completed
      const currentStageData = journeyStages[currentStage]
      console.log(`Completing stage: ${currentStageData.title}`)

      // Complete the current stage
      await apiService.updateJourneyState(resolvedUserId, currentStage)

      // Update journey state to next stage
      const nextStageIndex = currentStage + 1
      if (nextStageIndex < journeyStages.length) {
        // Start the next stage
        const nextStageId = `stage_${nextStageIndex + 1}`
        await apiService.startJourneyStage(resolvedUserId, nextStageId)
        
        // Reload journey state to get updated progress
        const updatedJourney = await apiService.getJourneyState(resolvedUserId)
        setJourneyState(updatedJourney)
        setCurrentStage(nextStageIndex)
        
        // Show success message
        console.log(`✅ Stage completed! Moved to: ${journeyStages[nextStageIndex].title}`)
      } else {
        // Journey complete - redirect to dashboard
        console.log('🎉 Journey complete! Redirecting to dashboard...')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error completing stage:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <h1>Loading VentureGate™ Journey...</h1>
            <p>Preparing your personalized experience</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has completed all stages
  const isJourneyComplete = currentStage >= journeyStages.length - 1 && journeyState?.progress === 100

  // If journey is complete, redirect to main dashboard
  if (isJourneyComplete) {
    router.push('/dashboard')
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <h1>🎉 Journey Complete!</h1>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Get current stage
  const currentStageData = journeyStages[currentStage]

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
      {/* Compact Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-3xl">{currentStageData.icon}</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{currentStageData.title}</h1>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Step {currentStage + 1} of {journeyStages.length} • {Math.round((currentStage / (journeyStages.length - 1)) * 100)}% Complete
            </p>
          </div>
        </div>
        {user && (
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ 
            background: 'var(--accent-primary)', 
            color: 'white' 
          }}>
            Welcome, {user.name}
          </div>
        )}
      </div>

      {/* Compact Progress Bar */}
      <div className="mb-6">
        <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
          <div 
            className="progress-bar" 
            style={{ 
              width: `${(currentStage / (journeyStages.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg, #00ff88, #00cc6a)',
              borderRadius: '3px'
            }}
          />
        </div>
      </div>

      {/* Main Action Card - Compact */}
      <div className="card mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="text-center p-4">
          <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>{currentStageData.description}</p>
          
          {/* Essential Actions - Compact */}
          {currentStageData.actions.length > 0 && (
            <div className="mb-4">
              <div className="grid gap-2" style={{ maxWidth: '350px', margin: '0 auto' }}>
                {currentStageData.actions.slice(0, 2).map((action, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-md text-sm" style={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)' 
                  }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                      background: 'var(--accent-primary)', 
                      color: 'white' 
                    }}>
                      {i + 1}
                    </div>
                    <span className="text-primary">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button 
            className="btn btn-primary"
            onClick={() => handleStageAction(currentStageData)}
            style={{ 
              padding: '10px 24px', 
              fontSize: '1rem',
              minWidth: '180px'
            }}
          >
            {currentStageData.id === 'stage_1' ? 'Account Created' : 
             currentStageData.id === 'stage_2' ? 'Complete Profile' :
             currentStageData.id === 'stage_3' ? 'Sign Legal Pack' :
             currentStageData.id === 'stage_4' ? 'Choose Plan' :
             currentStageData.id === 'stage_5' ? 'Learn Platform' :
             currentStageData.id === 'stage_6' ? 'Access Dashboard' :
             'Continue'} →
          </button>
          
          {/* Quick Complete for simple stages */}
          {(currentStageData.id === 'stage_5' || 
            currentStageData.id === 'stage_6' || 
            currentStageData.id === 'stage_7') && (
            <div className="mt-3">
              <button 
                className="btn btn-success"
                onClick={completeCurrentStage}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              >
                ✓ Mark as Complete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps Preview - Compact */}
      {currentStage < journeyStages.length - 1 && (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="text-center p-3">
            <h3 className="mb-3" style={{ fontSize: '1rem' }}>Coming Next</h3>
            <div className="grid gap-2">
              {journeyStages.slice(currentStage + 1, currentStage + 2).map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-2 p-2 rounded-md text-sm" style={{ 
                  background: 'var(--bg-secondary)', 
                  opacity: 0.8 
                }}>
                  <div className="text-lg">{stage.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{stage.title}</div>
                    <div className="text-xs text-secondary">{stage.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VentureGateJourney
