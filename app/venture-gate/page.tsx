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

      switch (stage.id) {
        case 'stage_1':
          // Mark stage_1 as completed and move to next
          if (resolvedUserId) {
            await apiService.updateJourneyState(resolvedUserId, 1) // Move to stage_2
          }
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
          router.push('/venture-gate/explore')
          break
        case 'stage_8':
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

      // First, ensure the current stage is started
      const currentStageId = `stage_${currentStage + 1}`
      await apiService.startJourneyStage(resolvedUserId, currentStageId)

      // Then complete the current stage
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
      } else {
        // Journey complete - redirect to dashboard
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
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>VentureGate™ Journey</h1>
        <p className="text-secondary">
          Complete this step to continue your journey
        </p>
        {user && (
          <div className="mt-4">
            <span className="status status-info">
              Welcome, {user.name}
            </span>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="card mb-8 animate-slide-in">
        <div className="card-header">
          <h3>Current Step</h3>
          <p className="text-muted">
            Step {currentStage + 1} of {journeyStages.length}
          </p>
        </div>
        <div className="progress mb-4">
          <div 
            className="progress-bar" 
            style={{ width: `${(currentStage / (journeyStages.length - 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>{currentStageData.title}</span>
          <span>{Math.round((currentStage / (journeyStages.length - 1)) * 100)}% Complete</span>
        </div>
      </div>

      {/* Current Step Focus */}
      <div className="card mb-8 animate-fade-in">
        <div className="flex items-start gap-6">
          <div className="text-6xl">{currentStageData.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold">{currentStageData.title}</h2>
              <span className="status status-info">Current Step</span>
            </div>
            <p className="text-lg text-secondary mb-6">{currentStageData.description}</p>
            
            {currentStageData.actions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  What you need to do:
                </h3>
                <div className="grid gap-3">
                  {currentStageData.actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                        {i + 1}
                      </div>
                      <span className="text-primary">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentStageData.requirements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Requirements:
                </h3>
                <div className="grid gap-2">
                  {currentStageData.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-primary)' }}></div>
                      <span className="text-secondary">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card animate-fade-in">
        <div className="text-center">
          <h3 className="mb-4">Ready to continue?</h3>
          <div className="flex gap-4 justify-center">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => handleStageAction(currentStageData)}
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
               'Continue'}
            </button>
            
            {/* Show "Mark as Complete" button for stages that can be completed inline */}
            {(currentStageData.id === 'stage_1' || 
              currentStageData.id === 'stage_7' || 
              currentStageData.id === 'stage_8') && (
              <button 
                className="btn btn-success"
                onClick={completeCurrentStage}
              >
                ✓ Mark as Complete
              </button>
            )}
            
            <button 
              className="btn btn-secondary"
              onClick={() => router.push('/venture-gate/help')}
            >
              Get Help
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Security Notice */}
      <div className="card mt-8 animate-fade-in">
        <div className="text-center">
          <h3>Trust-by-Design Security</h3>
          <p className="text-muted mb-4">
            Your journey is protected by enterprise-grade security measures
          </p>
          <div className="grid grid-4 gap-4 text-sm">
            <div>
              <div className="text-accent-primary mb-1">🔐</div>
              <div>MFA Required</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">📋</div>
              <div>Legal Compliance</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">🛡️</div>
              <div>Data Protection</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">📊</div>
              <div>Audit Trail</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentureGateJourney
