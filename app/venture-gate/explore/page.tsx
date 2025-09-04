'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, Venture } from '../../services/api'

// Venture interface is now imported from api service

const ExploreVentures = () => {
  const router = useRouter()
  const [ventures, setVentures] = useState<Venture[]>([])
  const [filteredVentures, setFilteredVentures] = useState<Venture[]>([])
  const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null)
  const [filters, setFilters] = useState({
    stage: '',
    industry: '',
    rewardType: '',
    search: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - in real app, this would come from API
  const mockVentures: Venture[] = [
    {
      id: '1',
      name: 'EcoTrack',
      description: 'AI-powered carbon footprint tracking for businesses. Help us build the next generation of sustainability tools.',
      stage: 'mvp',
      industry: 'Sustainability',
      teamSize: 3,
      lookingFor: ['Frontend Developer', 'Data Scientist', 'Product Manager'],
      rewards: { type: 'hybrid', amount: '$5k + 0.5% equity' },
      owner: { name: 'Sarah Chen', avatar: '👩‍💼' },
      createdAt: '2024-01-15',
      status: 'active',
      tags: ['AI', 'Sustainability', 'B2B', 'React', 'Python']
    },
    {
      id: '2',
      name: 'HealthConnect',
      description: 'Telemedicine platform connecting patients with specialists. Looking for experienced developers to scale our platform.',
      stage: 'growth',
      industry: 'Healthcare',
      teamSize: 8,
      lookingFor: ['Backend Developer', 'DevOps Engineer', 'UI/UX Designer'],
      rewards: { type: 'cash', amount: '$8k/month' },
      owner: { name: 'Dr. Michael Rodriguez', avatar: '👨‍⚕️' },
      createdAt: '2024-01-10',
      status: 'active',
      tags: ['Healthcare', 'Telemedicine', 'Node.js', 'AWS', 'React Native']
    },
    {
      id: '3',
      name: 'EduFlow',
      description: 'Personalized learning platform using AI to adapt to student needs. Seeking passionate educators and developers.',
      stage: 'idea',
      industry: 'EdTech',
      teamSize: 2,
      lookingFor: ['Full Stack Developer', 'AI/ML Engineer', 'Educational Designer'],
      rewards: { type: 'equity', amount: '1-3% equity' },
      owner: { name: 'Alex Thompson', avatar: '👨‍🎓' },
      createdAt: '2024-01-20',
      status: 'active',
      tags: ['EdTech', 'AI', 'Machine Learning', 'Vue.js', 'Python']
    },
    {
      id: '4',
      name: 'FinTech Pro',
      description: 'Cryptocurrency trading platform with advanced analytics. Looking for blockchain and finance experts.',
      stage: 'scale',
      industry: 'FinTech',
      teamSize: 12,
      lookingFor: ['Blockchain Developer', 'Security Engineer', 'Financial Analyst'],
      rewards: { type: 'hybrid', amount: '$10k + 0.2% equity' },
      owner: { name: 'Jennifer Park', avatar: '👩‍💻' },
      createdAt: '2024-01-05',
      status: 'active',
      tags: ['Blockchain', 'Cryptocurrency', 'Trading', 'Solidity', 'Security']
    }
  ]

  useEffect(() => {
    const loadVentures = async () => {
      try {
        const venturesData = await apiService.getVentures()
        setVentures(venturesData)
        setFilteredVentures(venturesData)
      } catch (error) {
        console.error('Failed to load ventures:', error)
        // Fallback to mock data if API fails
        setVentures(mockVentures)
        setFilteredVentures(mockVentures)
      } finally {
        setIsLoading(false)
      }
    }

    loadVentures()
  }, [])

  useEffect(() => {
    let filtered = ventures

    if (filters.stage) {
      filtered = filtered.filter(v => v.stage === filters.stage)
    }
    if (filters.industry) {
      filtered = filtered.filter(v => v.industry === filters.industry)
    }
    if (filters.rewardType) {
      filtered = filtered.filter(v => v.rewards.type === filters.rewardType)
    }
    if (filters.search) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        v.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        v.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    setFilteredVentures(filtered)
  }, [filters, ventures])

  const handleVentureClick = (venture: Venture) => {
    setSelectedVenture(venture)
  }

  const handleOfferContribution = (venture: Venture) => {
    router.push(`/venture-gate/offer/${venture.id}`)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'idea': return 'var(--accent-warning)'
      case 'mvp': return 'var(--accent-info)'
      case 'growth': return 'var(--accent-primary)'
      case 'scale': return 'var(--accent-secondary)'
      default: return 'var(--text-muted)'
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'equity': return '📈'
      case 'cash': return '💰'
      case 'hybrid': return '💎'
      default: return '🎁'
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <h1>Loading Ventures...</h1>
            <p>Discovering amazing opportunities for you</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>Explore Ventures</h1>
        <p className="text-secondary">
          Discover exciting projects and find your next opportunity
        </p>
        <div className="mt-4">
          <span className="status status-info">
            {filteredVentures.length} ventures available
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8 animate-slide-in">
        <div className="card-header">
          <h3>🔍 Filter Ventures</h3>
          <p className="text-muted">
            Narrow down your search to find the perfect match
          </p>
        </div>
        
        <div className="grid grid-2 gap-6">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, description, or tags..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Stage</label>
            <select
              className="form-input"
              value={filters.stage}
              onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
            >
              <option value="">All Stages</option>
              <option value="idea">Idea Stage</option>
              <option value="mvp">MVP Stage</option>
              <option value="growth">Growth Stage</option>
              <option value="scale">Scale Stage</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Industry</label>
            <select
              className="form-input"
              value={filters.industry}
              onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
            >
              <option value="">All Industries</option>
              <option value="Sustainability">Sustainability</option>
              <option value="Healthcare">Healthcare</option>
              <option value="EdTech">EdTech</option>
              <option value="FinTech">FinTech</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reward Type</label>
            <select
              className="form-input"
              value={filters.rewardType}
              onChange={(e) => setFilters(prev => ({ ...prev, rewardType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="equity">Equity Only</option>
              <option value="cash">Cash Only</option>
              <option value="hybrid">Hybrid (Cash + Equity)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ventures Grid */}
      <div className="grid grid-2 gap-6 mb-8">
        {filteredVentures.map((venture) => (
          <div
            key={venture.id}
            className="card cursor-pointer"
            onClick={() => handleVentureClick(venture)}
            style={{ transition: 'all 0.3s ease' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="card-title">{venture.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="status"
                    style={{ 
                      background: `rgba(${getStageColor(venture.stage)}, 0.2)`,
                      color: getStageColor(venture.stage),
                      border: `1px solid ${getStageColor(venture.stage)}`
                    }}
                  >
                    {venture.stage.toUpperCase()}
                  </span>
                  <span className="status status-info">{venture.industry}</span>
                </div>
              </div>
              <div className="text-2xl">{venture.owner.avatar}</div>
            </div>

            <p className="text-secondary mb-4">{venture.description}</p>

            <div className="mb-4">
              <h5 className="mb-2">Looking for:</h5>
              <div className="flex flex-wrap gap-2">
                {venture.lookingFor.map((role, index) => (
                  <span key={index} className="status status-warning">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-2">Rewards:</h5>
              <div className="flex items-center gap-2">
                <span className="text-xl">{getRewardIcon(venture.rewards.type)}</span>
                <span className="font-medium">{venture.rewards.amount}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted">
                Team: {venture.teamSize} members
              </div>
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOfferContribution(venture)
                }}
              >
                Offer to Contribute
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Venture Detail Modal */}
      {selectedVenture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedVenture.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span 
                    className="status"
                    style={{ 
                      background: `rgba(${getStageColor(selectedVenture.stage)}, 0.2)`,
                      color: getStageColor(selectedVenture.stage),
                      border: `1px solid ${getStageColor(selectedVenture.stage)}`
                    }}
                  >
                    {selectedVenture.stage.toUpperCase()}
                  </span>
                  <span className="status status-info">{selectedVenture.industry}</span>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedVenture(null)}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">About the Venture</h4>
              <p className="text-secondary">{selectedVenture.description}</p>
            </div>

            <div className="grid grid-2 gap-6 mb-6">
              <div>
                <h4 className="mb-3">Team Details</h4>
                <div className="text-sm text-muted">
                  <div className="mb-2">👥 Team Size: {selectedVenture.teamSize} members</div>
                  <div className="mb-2">👤 Founder: {selectedVenture.owner.name}</div>
                  <div>📅 Created: {new Date(selectedVenture.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div>
                <h4 className="mb-3">Compensation</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{getRewardIcon(selectedVenture.rewards.type)}</span>
                  <span className="font-medium">{selectedVenture.rewards.amount}</span>
                </div>
                <div className="text-sm text-muted">
                  {selectedVenture.rewards.type === 'equity' && 'Equity-based compensation'}
                  {selectedVenture.rewards.type === 'cash' && 'Cash compensation'}
                  {selectedVenture.rewards.type === 'hybrid' && 'Cash + Equity compensation'}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">Open Roles</h4>
              <div className="grid grid-2 gap-3">
                {selectedVenture.lookingFor.map((role, index) => (
                  <div key={index} className="card">
                    <h5 className="font-medium">{role}</h5>
                    <p className="text-sm text-muted">Role details would be provided during the application process</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">Technologies & Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVenture.tags.map((tag, index) => (
                  <span key={index} className="status status-info">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="btn btn-primary"
                onClick={() => handleOfferContribution(selectedVenture)}
              >
                Submit Contribution Offer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedVenture(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Mode Notice */}
      <div className="card mt-8 animate-fade-in">
        <div className="text-center">
          <h3>🛡️ Safe Mode Active</h3>
          <p className="text-muted mb-4">
            You're viewing redacted briefs only. Full project details require signing a project-specific NDA.
          </p>
          <div className="grid grid-3 gap-4 text-sm">
            <div>
              <div className="text-accent-primary mb-1">🔍</div>
              <div>Preview Only</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">🔒</div>
              <div>No Sensitive Data</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">📋</div>
              <div>NDA Required</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExploreVentures
