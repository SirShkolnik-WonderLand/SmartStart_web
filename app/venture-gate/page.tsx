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
      description: 'User creates account and verifies email',
      status: 'completed',
      icon: '👤',
      actions: ['Email verification', 'Password setup', 'Terms acceptance'],
      requirements: ['Valid email address']
    },
    {
      id: 'stage_2',
      title: 'Profile Setup',
      description: 'User completes profile information',
      status: 'current',
      icon: '🎯',
      actions: ['Complete profile', 'Add skills', 'Set preferences'],
      requirements: ['Profile completion']
    },
    {
      id: 'stage_3',
      title: 'Platform Legal Pack',
      description: 'User signs platform agreements',
      status: 'locked',
      icon: '📋',
      actions: ['Review PPA', 'Sign NDA', 'Accept terms'],
      requirements: ['Platform agreements']
    },
    {
      id: 'stage_4',
      title: 'Subscription Selection',
      description: 'User selects subscription plan',
      status: 'locked',
      icon: '💳',
      actions: ['Select plan', 'Payment processing', 'Invoice generation'],
      requirements: ['Active subscription']
    },
    {
      id: 'stage_5',
      title: 'Venture Creation',
      description: 'User creates their first venture',
      status: 'locked',
      icon: '🚀',
      actions: ['Create venture', 'Set up structure', 'Define goals'],
      requirements: ['Venture created']
    },
    {
      id: 'stage_6',
      title: 'Team Building',
      description: 'User invites team members',
      status: 'locked',
      icon: '👥',
      actions: ['Invite members', 'Set roles', 'Build team'],
      requirements: ['Team members']
    },
    {
      id: 'stage_7',
      title: 'Project Planning',
      description: 'User creates project and sets goals',
      status: 'locked',
      icon: '📊',
      actions: ['Create project', 'Set goals', 'Plan milestones'],
      requirements: ['Project setup']
    },
    {
      id: 'stage_8',
      title: 'Legal Entity Setup',
      description: 'User sets up legal entity for venture',
      status: 'locked',
      icon: '🏢',
      actions: ['Set up entity', 'Legal structure', 'Compliance'],
      requirements: ['Legal entity']
    },
    {
      id: 'stage_9',
      title: 'Equity Distribution',
      description: 'User distributes equity to team',
      status: 'locked',
      icon: '💰',
      actions: ['Distribute equity', 'Set vesting', 'Cap table'],
      requirements: ['Equity distribution']
    },
    {
      id: 'stage_10',
      title: 'Contract Execution',
      description: 'User executes team contracts',
      status: 'locked',
      icon: '📄',
      actions: ['Execute contracts', 'Legal agreements', 'Team contracts'],
      requirements: ['Contract execution']
    },
    {
      id: 'stage_11',
      title: 'Launch Preparation',
      description: 'User prepares for venture launch',
      status: 'locked',
      icon: '🚀',
      actions: ['Launch prep', 'Final checks', 'Go live'],
      requirements: ['Launch ready']
    }
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Check if user is authenticated by looking at localStorage first
      const storedUserData = typeof window !== 'undefined' ? localStorage.getItem('user-data') : null
      const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('user-id') : null
      
      if (storedUserData && storedUserId) {
        // User is authenticated, use stored data
        const userData = JSON.parse(storedUserData)
        setUser(userData)
        
        // Load journey state
        const journey = await apiService.getJourneyState(storedUserId)
        setJourneyState(journey)
        
        if (journey) {
          setCurrentStage(journey.currentStage)
          console.log('Journey state loaded:', journey)
        } else {
          // No journey state found - user needs to start from beginning
          console.log('No journey state found, starting from stage 0')
          setCurrentStage(0) // Start at stage 0 (discover)
        }
      } else {
        // User is not authenticated, redirect to login
        console.log('User not authenticated, redirecting to login')
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // If there's an error, clear stored data and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-data')
        localStorage.removeItem('user-id')
      }
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
          // Venture Creation
          router.push('/venture-gate/explore')
          break
        case 'stage_6':
          // Team Building
          router.push('/dashboard')
          break
        case 'stage_7':
          // Project Planning
          router.push('/dashboard')
          break
        case 'stage_8':
          // Legal Entity Setup
          router.push('/dashboard')
          break
        case 'stage_9':
          // Equity Distribution
          router.push('/dashboard')
          break
        case 'stage_10':
          // Contract Execution
          router.push('/dashboard')
          break
        case 'stage_11':
          // Launch Preparation
          router.push('/dashboard')
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
             currentStageData.id === 'stage_5' ? 'Create Venture' :
             currentStageData.id === 'stage_6' ? 'Build Team' :
             currentStageData.id === 'stage_7' ? 'Plan Project' :
             currentStageData.id === 'stage_8' ? 'Setup Legal Entity' :
             currentStageData.id === 'stage_9' ? 'Distribute Equity' :
             currentStageData.id === 'stage_10' ? 'Execute Contracts' :
             currentStageData.id === 'stage_11' ? 'Launch Preparation' :
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
