'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../../services/api'

interface Venture {
  id: string
  name: string
  purpose: string
  region: string
  status: string
  industry: string
  description: string
  createdAt: string
  updatedAt: string
}

const VenturesPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ventures, setVentures] = useState<Venture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        await loadVentures()
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [router])

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
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#00ff88' }}>
            My Ventures
          </h1>
          <p className="text-muted">Manage and track your ventures</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="btn btn-secondary"
            onClick={() => router.push('/venture-gate/explore')}
          >
            Explore Ventures
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/venture-gate/create')}
          >
            Create New Venture
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {ventures.length}
            </div>
            <p className="text-sm text-muted">Total Ventures</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {ventures.filter(v => v.status === 'ACTIVE').length}
            </div>
            <p className="text-sm text-muted">Active Ventures</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {ventures.filter(v => v.status === 'DRAFT').length}
            </div>
            <p className="text-sm text-muted">Draft Ventures</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              0
            </div>
            <p className="text-sm text-muted">Team Members</p>
          </div>
        </div>
      </div>

      {/* Ventures List */}
      {ventures.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-bold mb-4">No Ventures Yet</h3>
          <p className="text-muted mb-6">
            Create your first venture to start building something amazing
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => router.push('/venture-gate/create')}
          >
            Create Your First Venture
          </button>
        </div>
      ) : (
        <div className="grid grid-2 gap-6">
          {ventures.map((venture) => (
            <div key={venture.id} className="card hover:border-green-500 transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{venture.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className="badge badge-secondary">{venture.industry}</span>
                      <span className="badge badge-secondary">{venture.region}</span>
                      <span className={`badge ${
                        venture.status === 'ACTIVE' ? 'badge-success' : 
                        venture.status === 'DRAFT' ? 'badge-warning' : 'badge-secondary'
                      }`}>
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
                    <div>Created: {new Date(venture.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(venture.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm">
                      View Details
                    </button>
                    <button className="btn btn-primary btn-sm">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mt-8">
        <div className="card-header">
          <h3 className="text-xl font-bold">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-3 gap-4">
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/venture-gate/create')}
            >
              🚀 Create New Venture
            </button>
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/venture-gate/explore')}
            >
              🔍 Explore Ventures
            </button>
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/dashboard')}
            >
              📊 View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenturesPage
