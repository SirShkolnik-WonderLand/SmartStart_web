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
      title: 'Discover',
      description: 'Explore the SmartStart ecosystem and see what we offer',
      status: 'completed',
      icon: '🔍',
      actions: ['Browse public ventures', 'View platform features', 'Read success stories'],
      requirements: []
    },
    {
      id: 'stage_2',
      title: 'Create Account',
      description: 'Establish your identity and accept our terms',
      status: 'completed',
      icon: '👤',
      actions: ['Email verification', 'Password setup', 'Terms acceptance'],
      requirements: ['Valid email address']
    },
    {
      id: 'stage_3',
      title: 'Verify & Secure',
      description: 'Complete security setup and identity verification',
      status: 'current',
      icon: '🔐',
      actions: ['Enable MFA', 'Device verification', 'KYC completion'],
      requirements: ['MFA enabled', 'Email verified']
    },
    {
      id: 'stage_4',
      title: 'Choose Plan & Pay',
      description: 'Select your subscription tier and complete payment',
      status: 'available',
      icon: '💳',
      actions: ['Select plan', 'Payment processing', 'Invoice generation'],
      requirements: ['Active subscription']
    },
    {
      id: 'stage_5',
      title: 'Platform Legal Pack',
      description: 'Sign the mandatory platform participation agreement',
      status: 'locked',
      icon: '📋',
      actions: ['Review PPA', 'Sign NDA', 'Accept terms'],
      requirements: ['Active subscription', 'MFA enabled']
    },
    {
      id: 'stage_6',
      title: 'Profile & Fit',
      description: 'Complete your profile for better matching',
      status: 'locked',
      icon: '🎯',
      actions: ['Skills setup', 'Availability', 'Portfolio connection'],
      requirements: ['Legal pack signed']
    },
    {
      id: 'stage_7',
      title: 'Explore Ventures',
      description: 'Browse and discover projects in safe mode',
      status: 'locked',
      icon: '🚀',
      actions: ['Browse projects', 'View briefs', 'Create ventures'],
      requirements: ['Profile complete']
    },
    {
      id: 'stage_8',
      title: 'Offer to Contribute',
      description: 'Submit structured offers to projects',
      status: 'locked',
      icon: '🤝',
      actions: ['Submit offers', 'Define scope', 'Set preferences'],
      requirements: ['Project access']
    },
    {
      id: 'stage_9',
      title: 'Per-Project NDA',
      description: 'Sign project-specific confidentiality agreements',
      status: 'locked',
      icon: '📄',
      actions: ['Review NDA', 'Sign agreement', 'Accept terms'],
      requirements: ['Offer accepted']
    },
    {
      id: 'stage_10',
      title: 'Approval & Provisioning',
      description: 'Get approved and receive access to project resources',
      status: 'locked',
      icon: '✅',
      actions: ['Get approved', 'Receive access', 'Start contributing'],
      requirements: ['NDA signed']
    },
    {
      id: 'stage_11',
      title: 'Work, Track, Reward',
      description: 'Contribute to projects and earn rewards',
      status: 'locked',
      icon: '🏆',
      actions: ['Complete tasks', 'Earn XP', 'Receive rewards'],
      requirements: ['Provisioned access']
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

      // For stages that need to be started first
      if (resolvedUserId && ['stage_1', 'stage_7', 'stage_8'].includes(stage.id)) {
        await apiService.startJourneyStage(resolvedUserId, stage.id)
      }

      switch (stage.id) {
        case 'stage_1':
          // Discover stage - just redirect to register
          router.push('/register')
          break
        case 'stage_2':
          router.push('/register')
          break
        case 'stage_3':
          router.push('/venture-gate/verify')
          break
        case 'stage_4':
          router.push('/venture-gate/plans')
          break
        case 'stage_5':
          router.push('/venture-gate/legal')
          break
        case 'stage_6':
          router.push('/venture-gate/profile')
          break
        case 'stage_7':
          // Explore ventures - can be completed inline
          router.push('/venture-gate/explore')
          break
        case 'stage_8':
          // Submit offers - can be completed inline
          router.push('/venture-gate/explore')
          break
        case 'stage_9':
          router.push('/documents')
          break
        case 'stage_10':
          router.push('/dashboard')
          break
        case 'stage_11':
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
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Streamlined Header */}
      <div className="text-center mb-6 animate-fade-in">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>VentureGate™ Journey</h1>
        <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
          Step {currentStage + 1} of {journeyStages.length} • {Math.round((currentStage / (journeyStages.length - 1)) * 100)}% Complete
        </p>
        {user && (
          <div className="mt-3">
            <span className="status status-info" style={{ fontSize: '0.9rem' }}>
              Welcome, {user.name}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8 animate-slide-in">
        <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
          <div 
            className="progress-bar" 
            style={{ 
              width: `${(currentStage / (journeyStages.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg, #00ff88, #00cc6a)',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Current Step - Focused */}
      <div className="card mb-6 animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">{currentStageData.icon}</div>
          <h2 className="text-2xl font-bold mb-3">{currentStageData.title}</h2>
          <p className="text-lg text-secondary mb-6">{currentStageData.description}</p>
          
          {/* Essential Actions Only */}
          {currentStageData.actions.length > 0 && (
            <div className="mb-6">
              <div className="grid gap-2" style={{ maxWidth: '400px', margin: '0 auto' }}>
                {currentStageData.actions.slice(0, 3).map((action, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)' 
                  }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                      background: 'var(--accent-primary)', 
                      color: 'white' 
                    }}>
                      {i + 1}
                    </div>
                    <span className="text-primary text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button - Single Focus */}
      <div className="text-center animate-fade-in">
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => handleStageAction(currentStageData)}
          style={{ 
            padding: '12px 32px', 
            fontSize: '1.1rem',
            minWidth: '200px'
          }}
        >
          {currentStageData.id === 'stage_1' ? 'Start Journey' : 
           currentStageData.id === 'stage_2' ? 'Create Account' :
           currentStageData.id === 'stage_3' ? 'Setup Security' :
           currentStageData.id === 'stage_4' ? 'Choose Plan' :
           currentStageData.id === 'stage_5' ? 'Sign Legal Pack' :
           currentStageData.id === 'stage_6' ? 'Complete Profile' :
           currentStageData.id === 'stage_7' ? 'Explore Ventures' :
           currentStageData.id === 'stage_8' ? 'Submit Offer' :
           currentStageData.id === 'stage_9' ? 'Sign NDA' :
           currentStageData.id === 'stage_10' ? 'Get Approved' :
           'Continue'} →
        </button>
        
        {/* Quick Complete for simple stages */}
        {(currentStageData.id === 'stage_1' || 
          currentStageData.id === 'stage_7' || 
          currentStageData.id === 'stage_8') && (
          <div className="mt-4">
            <button 
              className="btn btn-success"
              onClick={completeCurrentStage}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              ✓ Mark as Complete
            </button>
          </div>
        )}
      </div>

      {/* Next Steps Preview - Only show next 2 steps */}
      {currentStage < journeyStages.length - 1 && (
        <div className="card mt-8 animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="text-center">
            <h3 className="mb-4" style={{ fontSize: '1.2rem' }}>Coming Next</h3>
            <div className="grid gap-3">
              {journeyStages.slice(currentStage + 1, currentStage + 3).map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ 
                  background: 'var(--bg-secondary)', 
                  opacity: 0.7 
                }}>
                  <div className="text-2xl">{stage.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{stage.title}</div>
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
