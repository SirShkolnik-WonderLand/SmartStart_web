'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  owner: {
    id: string
    name: string
    email: string
  }
  ventureLegalEntity?: {
    id: string
    legalEntity: {
      name: string
      type: string
      jurisdiction: string
    }
  }
  equityFramework?: {
    id: string
    ownerPercent: number
    alicePercent: number
    cepPercent: number
  }
  ventureProfile?: {
    id: string
    description: string
    industry: string
    stage: string
    fundingRound: string
    teamSize: number
    website: string
  }
}

const VentureDetailsPage = () => {
  const router = useRouter()
  const params = useParams()
  const ventureId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [venture, setVenture] = useState<Venture | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Venture>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        await loadVenture()
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [router, ventureId])

  const loadVenture = async () => {
    try {
      const response = await fetch(`https://smartstart-api.onrender.com/api/ventures/${ventureId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setVenture(data.venture)
        setEditData(data.venture)
      } else {
        console.error('Failed to load venture:', data.message)
        router.push('/ventures')
      }
    } catch (error) {
      console.error('Failed to load venture:', error)
      router.push('/ventures')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(venture || {})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(venture || {})
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!venture) return
    
    setIsSaving(true)
    try {
      // Update venture profile
      if (editData.name || editData.purpose || editData.region) {
        const response = await fetch(`https://smartstart-api.onrender.com/api/ventures/${ventureId}/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editData.name,
            purpose: editData.purpose,
            region: editData.region,
            description: editData.description
          })
        })
        
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.message || 'Failed to update venture')
        }
      }

      // Reload venture data
      await loadVenture()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save venture:', error)
      alert('Failed to save venture. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!venture) return
    
    try {
      const response = await fetch(`https://smartstart-api.onrender.com/api/ventures/${ventureId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const result = await response.json()
      if (result.success) {
        await loadVenture() // Reload data
      } else {
        alert(`Failed to update status: ${result.message}`)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!venture) return
    
    if (!confirm(`Are you sure you want to delete "${venture.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      // For now, we'll just update status to CLOSED (soft delete)
      await handleStatusUpdate('CLOSED')
      router.push('/ventures')
    } catch (error) {
      console.error('Failed to delete venture:', error)
      alert('Failed to delete venture. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading venture details...</p>
        </div>
      </div>
    )
  }

  if (!venture) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Venture Not Found</h1>
          <p className="text-muted mb-4">The venture you're looking for doesn't exist or you don't have access to it.</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/ventures')}
          >
            Back to Ventures
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === venture.owner.id

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <button 
              className="btn btn-secondary"
              onClick={() => router.push('/ventures')}
            >
              ← Back to Ventures
            </button>
            <h1 className="text-4xl font-bold" style={{ color: '#00ff88' }}>
              {isEditing ? 'Edit Venture' : venture.name}
            </h1>
          </div>
          <div className="flex gap-2 mb-2">
            <span className="badge badge-secondary">{venture.region}</span>
            <span className={`badge ${
              venture.status === 'ACTIVE' ? 'badge-success' : 
              venture.status === 'DRAFT' ? 'badge-warning' : 
              venture.status === 'PENDING_CONTRACTS' ? 'badge-info' : 'badge-secondary'
            }`}>
              {venture.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button 
                  className="btn btn-secondary"
                  onClick={handleEdit}
                >
                  Edit Venture
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Venture
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-2 gap-8">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">Basic Information</h3>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Venture Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name || ''}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Purpose & Mission</label>
                    <textarea
                      name="purpose"
                      value={editData.purpose || ''}
                      onChange={handleInputChange}
                      className="input w-full"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={editData.description || ''}
                      onChange={handleInputChange}
                      className="input w-full"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Region</label>
                    <select
                      name="region"
                      value={editData.region || ''}
                      onChange={handleInputChange}
                      className="input w-full"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="EU">European Union</option>
                      <option value="AU">Australia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Venture Name</label>
                    <p className="text-muted">{venture.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Purpose & Mission</label>
                    <p className="text-muted">{venture.purpose}</p>
                  </div>
                  {venture.description && (
                    <div>
                      <label className="block text-sm font-bold mb-2">Description</label>
                      <p className="text-muted">{venture.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold mb-2">Region</label>
                    <p className="text-muted">{venture.region}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Owner Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">Owner Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-bold mb-1">Owner Name</label>
                  <p className="text-muted">{venture.owner.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Email</label>
                  <p className="text-muted">{venture.owner.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          {isOwner && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold">Status Management</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Current Status</label>
                    <p className="text-muted">{venture.status.replace('_', ' ')}</p>
                  </div>
                  <div className="flex gap-2">
                    {venture.status === 'DRAFT' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusUpdate('PENDING_CONTRACTS')}
                      >
                        Submit for Review
                      </button>
                    )}
                    {venture.status === 'PENDING_CONTRACTS' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate('ACTIVE')}
                      >
                        Activate Venture
                      </button>
                    )}
                    {venture.status === 'ACTIVE' && (
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleStatusUpdate('SUSPENDED')}
                      >
                        Suspend Venture
                      </button>
                    )}
                    {venture.status === 'SUSPENDED' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate('ACTIVE')}
                      >
                        Reactivate Venture
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Advanced Info */}
        <div className="space-y-6">
          {/* Legal Entity */}
          {venture.ventureLegalEntity && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold">Legal Entity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-bold mb-1">Entity Name</label>
                    <p className="text-muted">{venture.ventureLegalEntity.legalEntity.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Entity Type</label>
                    <p className="text-muted">{venture.ventureLegalEntity.legalEntity.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Jurisdiction</label>
                    <p className="text-muted">{venture.ventureLegalEntity.legalEntity.jurisdiction}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equity Framework */}
          {venture.equityFramework && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold">Equity Framework</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Owner Equity:</span>
                    <span className="font-bold">{venture.equityFramework.ownerPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AliceSolutions Equity:</span>
                    <span className="font-bold">{venture.equityFramework.alicePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contributor Pool:</span>
                    <span className="font-bold">{venture.equityFramework.cepPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Venture Profile */}
          {venture.ventureProfile && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold">Venture Profile</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-bold mb-1">Industry</label>
                    <p className="text-muted">{venture.ventureProfile.industry}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Stage</label>
                    <p className="text-muted">{venture.ventureProfile.stage}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Funding Round</label>
                    <p className="text-muted">{venture.ventureProfile.fundingRound}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Team Size</label>
                    <p className="text-muted">{venture.ventureProfile.teamSize}</p>
                  </div>
                  {venture.ventureProfile.website && (
                    <div>
                      <label className="block text-sm font-bold mb-1">Website</label>
                      <a 
                        href={venture.ventureProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {venture.ventureProfile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">Timestamps</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-bold mb-1">Created</label>
                  <p className="text-muted">{new Date(venture.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Last Updated</label>
                  <p className="text-muted">{new Date(venture.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-8">
        <div className="card-header">
          <h3 className="text-xl font-bold">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-3 gap-4">
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/ventures')}
            >
              📋 Back to Ventures
            </button>
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/teams')}
            >
              👥 Manage Teams
            </button>
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/projects')}
            >
              📋 Manage Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentureDetailsPage
