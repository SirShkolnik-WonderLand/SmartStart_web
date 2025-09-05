'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../../services/api'

const PlatformOrientation = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Example venture for platform orientation (read-only)
  const exampleVenture = {
    id: 'example-1',
    name: 'SmartStart Example Venture',
    description: 'This is an example venture to show you how the platform works. You can explore features and see what\'s possible when you create your own ventures.',
    stage: 'mvp',
    industry: 'Technology',
    teamSize: 3,
    lookingFor: ['Developer', 'Designer', 'Product Manager'],
    rewards: { type: 'equity', amount: 'TBD' },
    owner: { name: 'Platform Demo', avatar: '👤' },
    createdAt: '2024-01-01',
    status: 'active',
    tags: ['Example', 'Demo', 'Platform']
  }

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    // Complete the onboarding journey
    router.push('/venture-gate/legal')
  }

  const handleSkip = () => {
    // Skip to next step
    router.push('/venture-gate/legal')
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading platform orientation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Platform Orientation
        </h1>
        <p className="text-xl text-muted mb-6">
          Learn how the SmartStart platform works
        </p>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <h3>🎯 What You'll Learn</h3>
          </div>
          <div className="grid grid-2 gap-4">
            <div className="text-left">
              <h4>✅ Platform Features</h4>
              <ul className="text-sm text-muted">
                <li>• Create and manage ventures</li>
                <li>• Build and lead teams</li>
                <li>• Execute legal agreements</li>
                <li>• Distribute equity fairly</li>
              </ul>
            </div>
            <div className="text-left">
              <h4>✅ Collaboration Tools</h4>
              <ul className="text-sm text-muted">
                <li>• Find team members</li>
                <li>• Manage projects</li>
                <li>• Track progress</li>
                <li>• Launch successfully</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Example Venture */}
      <div className="card mb-8">
        <div className="card-header">
          <h3>📋 Example Venture</h3>
          <p className="text-muted">Here's how a venture looks on our platform</p>
        </div>
        
        <div className="grid grid-2 gap-6">
          <div>
            <h4 className="text-lg font-bold mb-2">{exampleVenture.name}</h4>
            <p className="text-muted mb-4">{exampleVenture.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="status status-info text-xs">
                {exampleVenture.stage?.toUpperCase() || 'UNKNOWN'}
              </span>
              <span className="status status-info text-xs">
                {exampleVenture.industry || 'Unknown Industry'}
              </span>
            </div>

            <div className="text-sm text-muted">
              <p><strong>Team Size:</strong> {exampleVenture.teamSize || 'TBD'}</p>
              <p><strong>Looking For:</strong> {(exampleVenture.lookingFor || []).join(', ')}</p>
              <p><strong>Rewards:</strong> {exampleVenture.rewards?.amount || 'TBD'}</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">{exampleVenture.owner?.avatar || '👤'}</div>
            <h5 className="font-bold">{exampleVenture.owner?.name || 'Unknown Owner'}</h5>
            <p className="text-sm text-muted">Venture Owner</p>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="grid grid-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h4 className="font-bold mb-2">Create Ventures</h4>
          <p className="text-sm text-muted">
            Start your own venture or join existing ones
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">👥</div>
          <h4 className="font-bold mb-2">Build Teams</h4>
          <p className="text-sm text-muted">
            Find talented team members and collaborators
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">⚖️</div>
          <h4 className="font-bold mb-2">Legal Framework</h4>
          <p className="text-sm text-muted">
            Handle contracts, equity, and legal matters
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card">
        <div className="card-header">
          <h3>🎯 Next Steps</h3>
          <p className="text-muted">Complete your onboarding to access the full platform</p>
        </div>
        
        <div className="grid grid-2 gap-6">
          <div>
            <h4 className="font-bold mb-2">1. Sign Legal Agreements</h4>
            <p className="text-sm text-muted mb-4">
              Review and sign the required platform agreements
            </p>
            
            <h4 className="font-bold mb-2">2. Choose Your Plan</h4>
            <p className="text-sm text-muted mb-4">
              Select the subscription plan that fits your needs
            </p>
            
            <h4 className="font-bold mb-2">3. Access Dashboard</h4>
            <p className="text-sm text-muted">
              Start creating ventures and building your network
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="font-bold mb-2">You're Almost There!</h4>
            <p className="text-sm text-muted">
              Just a few more steps to unlock the full platform
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          className="btn btn-secondary"
          onClick={handleSkip}
        >
          Skip Orientation
        </button>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
        >
          Continue to Legal Agreements
        </button>
      </div>
    </div>
  )
}

export default PlatformOrientation