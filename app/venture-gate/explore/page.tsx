'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

interface Venture {
  id: string
  name: string
  purpose: string
  region: string
  status: string
  industry: string
  description: string
  owner: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

const ExploreVentures = () => {
  const router = useRouter()
  const [ventures, setVentures] = useState<Venture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterRegion, setFilterRegion] = useState('')

  useEffect(() => {
    loadVentures()
  }, [])

  const loadVentures = async () => {
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/ventures/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setVentures(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load ventures:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVentures = ventures.filter(venture => {
    const matchesSearch = venture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venture.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venture.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = !filterIndustry || venture.industry === filterIndustry
    const matchesRegion = !filterRegion || venture.region === filterRegion
    
    return matchesSearch && matchesIndustry && matchesRegion
  })

  const handleContinue = () => {
    // Complete the platform orientation step
    router.push('/venture-gate/welcome')
  }

  const handleSkip = () => {
    // Skip to next step
    router.push('/venture-gate/welcome')
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading ventures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Explore Ventures
        </h1>
        <p className="text-xl text-muted mb-6">
          Discover amazing ventures and find opportunities to contribute
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="p-6">
          <div className="grid grid-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-2">Search Ventures</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
                placeholder="Search by name, purpose, or description..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Industry</label>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="input w-full"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="input w-full"
              >
                <option value="">All Regions</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="EU">European Union</option>
                <option value="AU">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ventures Grid */}
      {filteredVentures.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-bold mb-4">No Ventures Found</h3>
          <p className="text-muted mb-6">
            {ventures.length === 0 
              ? "Be the first to create a venture on the platform!"
              : "Try adjusting your search filters to find more ventures."
            }
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => router.push('/venture-gate/create')}
          >
            Create Your First Venture
          </button>
        </div>
      ) : (
        <div className="grid grid-2 gap-6 mb-8">
          {filteredVentures.map((venture) => (
            <div key={venture.id} className="card hover:border-green-500 transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{venture.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className="badge badge-secondary">{venture.industry}</span>
                      <span className="badge badge-secondary">{venture.region}</span>
                      <span className={`badge ${venture.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {venture.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-muted mb-4 line-clamp-3">{venture.purpose}</p>
                
                {venture.description && (
                  <p className="text-sm text-muted mb-4 line-clamp-2">{venture.description}</p>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted">
                    <div>Owner: {venture.owner.name}</div>
                    <div>Created: {new Date(venture.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm">
                      View Details
                    </button>
                    <button className="btn btn-primary btn-sm">
                      Join Venture
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="text-center">
        <div className="flex gap-4 justify-center">
          <button 
            className="btn btn-secondary"
            onClick={handleSkip}
          >
            Skip for Now
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleContinue}
          >
            Continue to Dashboard
          </button>
        </div>
        <p className="text-sm text-muted mt-4">
          You can always explore ventures later from your dashboard
        </p>
      </div>
    </div>
  )
}

export default ExploreVentures