'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

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
  const [isLoading, setIsLoading] = useState(true)

  const journeyStages: JourneyStage[] = [
    {
      id: 'discover',
      title: 'Discover',
      description: 'Explore the SmartStart ecosystem and see what we offer',
      status: 'completed',
      icon: '🔍',
      actions: ['Browse public ventures', 'View platform features', 'Read success stories'],
      requirements: []
    },
    {
      id: 'create-account',
      title: 'Create Account',
      description: 'Establish your identity and accept our terms',
      status: 'completed',
      icon: '👤',
      actions: ['Email verification', 'Password setup', 'Terms acceptance'],
      requirements: ['Valid email address']
    },
    {
      id: 'verify-secure',
      title: 'Verify & Secure',
      description: 'Complete security setup and identity verification',
      status: 'current',
      icon: '🔐',
      actions: ['Enable MFA', 'Device verification', 'KYC completion'],
      requirements: ['MFA enabled', 'Email verified']
    },
    {
      id: 'choose-plan',
      title: 'Choose Plan & Pay',
      description: 'Select your subscription tier and complete payment',
      status: 'available',
      icon: '💳',
      actions: ['Select plan', 'Payment processing', 'Invoice generation'],
      requirements: ['Active subscription']
    },
    {
      id: 'platform-legal',
      title: 'Platform Legal Pack',
      description: 'Sign the mandatory platform participation agreement',
      status: 'locked',
      icon: '📋',
      actions: ['Review PPA', 'Sign NDA', 'Accept terms'],
      requirements: ['Active subscription', 'MFA enabled']
    },
    {
      id: 'profile-fit',
      title: 'Profile & Fit',
      description: 'Complete your profile for better matching',
      status: 'locked',
      icon: '🎯',
      actions: ['Skills setup', 'Availability', 'Portfolio connection'],
      requirements: ['Legal pack signed']
    },
    {
      id: 'explore-ventures',
      title: 'Explore Ventures',
      description: 'Browse and discover projects in safe mode',
      status: 'locked',
      icon: '🚀',
      actions: ['Browse projects', 'View briefs', 'Create ventures'],
      requirements: ['Profile complete']
    },
    {
      id: 'offer-contribute',
      title: 'Offer to Contribute',
      description: 'Submit structured offers to projects',
      status: 'locked',
      icon: '🤝',
      actions: ['Submit offers', 'Define scope', 'Set preferences'],
      requirements: ['Project access']
    },
    {
      id: 'project-nda',
      title: 'Per-Project NDA',
      description: 'Sign project-specific confidentiality agreements',
      status: 'locked',
      icon: '📄',
      actions: ['Review NDA', 'Sign agreement', 'Accept terms'],
      requirements: ['Offer accepted']
    },
    {
      id: 'approval-provisioning',
      title: 'Approval & Provisioning',
      description: 'Get approved and receive access to project resources',
      status: 'locked',
      icon: '✅',
      actions: ['Get approved', 'Receive access', 'Start contributing'],
      requirements: ['NDA signed']
    },
    {
      id: 'work-track-reward',
      title: 'Work, Track, Reward',
      description: 'Contribute to projects and earn rewards',
      status: 'locked',
      icon: '🏆',
      actions: ['Complete tasks', 'Earn XP', 'Receive rewards'],
      requirements: ['Provisioned access']
    }
  ]

  useEffect(() => {
    // Set user data without API calls to avoid 404 errors
    const loadUserData = () => {
      try {
        // Set demo user data
        setUser({ 
          id: '1', 
          email: 'udi.shkolnik@alicesolutions.com', 
          name: 'Udi Shkolnik' 
        })
        setCurrentStage(2) // Start at verification stage
      } catch (error) {
        console.error('Error setting user data:', error)
        // Fallback to demo user
        setUser({ id: '1', email: 'udi.shkolnik@alicesolutions.com', name: 'Udi Shkolnik' })
        setCurrentStage(2)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const getStageStatus = (index: number): JourneyStage['status'] => {
    if (index < currentStage) return 'completed'
    if (index === currentStage) return 'current'
    if (index === currentStage + 1) return 'available'
    return 'locked'
  }

  const handleStageAction = (stage: JourneyStage) => {
    switch (stage.id) {
      case 'verify-secure':
        router.push('/venture-gate/verify')
        break
      case 'choose-plan':
        router.push('/venture-gate/plans')
        break
      case 'platform-legal':
        router.push('/venture-gate/legal')
        break
      case 'profile-fit':
        router.push('/venture-gate/profile')
        break
      case 'explore-ventures':
        router.push('/venture-gate/explore')
        break
      default:
        console.log(`Action for ${stage.id} not implemented yet`)
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

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>VentureGate™ Journey</h1>
        <p className="text-secondary">
          Your path from discovery to trusted contributor
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
          <h3>Journey Progress</h3>
          <p className="text-muted">
            Complete each stage to unlock the next level of access
          </p>
        </div>
        <div className="progress mb-4">
          <div 
            className="progress-bar" 
            style={{ width: `${(currentStage / (journeyStages.length - 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>Stage {currentStage + 1} of {journeyStages.length}</span>
          <span>{Math.round((currentStage / (journeyStages.length - 1)) * 100)}% Complete</span>
        </div>
      </div>

      {/* Journey Stages */}
      <div className="grid grid-2 gap-6">
        {journeyStages.map((stage, index) => {
          const status = getStageStatus(index)
          const isClickable = status === 'current' || status === 'available'
          
          return (
            <div
              key={stage.id}
              className={`card ${isClickable ? 'cursor-pointer' : ''} ${
                status === 'current' ? 'border-accent' : ''
              }`}
              onClick={() => isClickable && handleStageAction(stage)}
              style={{
                opacity: status === 'locked' ? 0.6 : 1,
                cursor: isClickable ? 'pointer' : 'default',
                borderColor: status === 'current' ? 'var(--accent-primary)' : undefined
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{stage.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="card-title">{stage.title}</h3>
                    <span className={`status ${
                      status === 'completed' ? 'status-success' :
                      status === 'current' ? 'status-info' :
                      status === 'available' ? 'status-warning' :
                      'status-danger'
                    }`}>
                      {status === 'completed' ? '✓' :
                       status === 'current' ? '→' :
                       status === 'available' ? '!' : '🔒'}
                    </span>
                  </div>
                  <p className="text-secondary mb-4">{stage.description}</p>
                  
                  {stage.actions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Actions:
                      </h4>
                      <ul className="text-sm text-muted">
                        {stage.actions.map((action, i) => (
                          <li key={i} className="mb-1">• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {stage.requirements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Requirements:
                      </h4>
                      <ul className="text-sm text-muted">
                        {stage.requirements.map((req, i) => (
                          <li key={i} className="mb-1">• {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Current Stage Actions */}
      {currentStage < journeyStages.length && (
        <div className="card mt-8 animate-fade-in">
          <div className="card-header">
            <h3>Next Steps</h3>
            <p className="text-muted">
              Complete the current stage to continue your journey
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              className="btn btn-primary"
              onClick={() => handleStageAction(journeyStages[currentStage])}
            >
              Continue to {journeyStages[currentStage].title}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => router.push('/venture-gate/help')}
            >
              Get Help
            </button>
          </div>
        </div>
      )}

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
