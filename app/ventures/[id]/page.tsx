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
  legalDocuments?: Array<{
    id: string
    name: string
    type: string
    status: string
    createdAt: string
  }>
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinedAt: string
}

interface Project {
  id: string
  name: string
  description: string
  status: string
  progress: number
  createdAt: string
}

const VentureDetailsPage = () => {
  const router = useRouter()
  const params = useParams()
  const ventureId = params.id as string

  const [venture, setVenture] = useState<Venture | null>(null)
  const [teams, setTeams] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditForm, setShowEditForm] = useState(false)
  const [editData, setEditData] = useState<Partial<Venture>>({})

  useEffect(() => {
    if (ventureId) {
      loadVentureDetails()
    }
  }, [ventureId])

  const loadVentureDetails = async () => {
    try {
      setIsLoading(true)
      
      // Load venture details
      const ventureResponse = await fetch(`https://smartstart-api.onrender.com/api/ventures/${ventureId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const ventureData = await ventureResponse.json()
      
      if (ventureData.success) {
        setVenture(ventureData.venture)
        setEditData(ventureData.venture)
      }

      // Load team members (placeholder - would need team API)
      setTeams([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Co-Founder',
          status: 'ACTIVE',
          joinedAt: '2025-01-01'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'CTO',
          status: 'ACTIVE',
          joinedAt: '2025-01-15'
        }
      ])

      // Load projects (placeholder - would need project API)
      setProjects([
        {
          id: '1',
          name: 'MVP Development',
          description: 'Building the minimum viable product',
          status: 'IN_PROGRESS',
          progress: 75,
          createdAt: '2025-01-01'
        },
        {
          id: '2',
          name: 'Market Research',
          description: 'Analyzing target market and competitors',
          status: 'COMPLETED',
          progress: 100,
          createdAt: '2025-01-01'
        }
      ])

    } catch (error) {
      console.error('Failed to load venture details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateVenture = async () => {
    try {
      const response = await fetch(`https://smartstart-api.onrender.com/api/ventures/${ventureId}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      const result = await response.json()
      
      if (result.success) {
        setVenture(prev => prev ? { ...prev, ...editData } : null)
        setShowEditForm(false)
        alert('Venture updated successfully!')
      } else {
        alert(`Failed to update venture: ${result.message}`)
      }
    } catch (error) {
      console.error('Failed to update venture:', error)
      alert('Failed to update venture. Please try again.')
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
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
        setVenture(prev => prev ? { ...prev, status: newStatus } : null)
        alert('Venture status updated successfully!')
      } else {
        alert(`Failed to update status: ${result.message}`)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const handleDeleteVenture = async () => {
    if (!confirm('Are you sure you want to delete this venture? This action cannot be undone.')) {
      return
    }

    try {
      // Soft delete - update status to DELETED
      await handleStatusUpdate('DELETED')
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
    { id: 'equity', label: 'Equity', icon: '💎' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#00ff88' }}>
            {venture.name}
          </h1>
          <p className="text-muted mb-4">{venture.purpose}</p>
          <div className="flex gap-2">
            <span className="badge badge-secondary">{venture.industry}</span>
            <span className="badge badge-secondary">{venture.region}</span>
            <span className={`badge ${
              venture.status === 'ACTIVE' ? 'badge-success' : 
              venture.status === 'DRAFT' ? 'badge-warning' : 
              venture.status === 'PENDING_CONTRACTS' ? 'badge-info' : 'badge-secondary'
            }`}>
              {venture.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary"
            onClick={() => router.push('/ventures')}
          >
            Back to Ventures
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowEditForm(true)}
          >
            Edit Venture
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-2 gap-8">
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">Basic Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-400">Venture Name</label>
                  <p className="text-lg">{venture.name}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400">Purpose & Mission</label>
                  <p className="text-gray-300">{venture.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400">Description</label>
                  <p className="text-gray-300">{venture.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-400">Industry</label>
                    <p>{venture.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400">Region</label>
                    <p>{venture.region}</p>
                  </div>
                </div>
                <div className="grid grid-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-400">Created</label>
                    <p>{new Date(venture.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400">Last Updated</label>
                    <p>{new Date(venture.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">Owner Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-400">Owner Name</label>
                  <p className="text-lg">{venture.owner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400">Email</label>
                  <p className="text-gray-300">{venture.owner.email}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-400">Owner ID</label>
                  <p className="text-sm text-gray-400 font-mono">{venture.owner.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Entity */}
          {venture.ventureLegalEntity && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-bold">Legal Entity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-400">Entity Name</label>
                    <p className="text-lg">{venture.ventureLegalEntity.legalEntity.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400">Entity Type</label>
                    <p>{venture.ventureLegalEntity.legalEntity.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400">Jurisdiction</label>
                    <p>{venture.ventureLegalEntity.legalEntity.jurisdiction}</p>
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
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-400">Owner Equity</label>
                    <p className="text-lg text-green-400">{venture.equityFramework.ownerPercent}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400">Alice Solutions</label>
                    <p className="text-lg text-blue-400">{venture.equityFramework.alicePercent}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400">Contributor Pool</label>
                    <p className="text-lg text-purple-400">{venture.equityFramework.cepPercent}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">Team Members</h3>
          </div>
          <div className="p-6">
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <h4 className="text-lg font-bold mb-2">No Team Members Yet</h4>
                <p className="text-muted mb-4">Start building your team by inviting collaborators</p>
                <button className="btn btn-primary">Invite Team Members</button>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-bold">{member.name}</h4>
                      <p className="text-sm text-muted">{member.email}</p>
                      <span className="badge badge-secondary text-xs">{member.role}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                      <span className={`badge ${
                        member.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'
                      } text-xs`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">Projects</h3>
          </div>
          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <h4 className="text-lg font-bold mb-2">No Projects Yet</h4>
                <p className="text-muted mb-4">Start your first project to begin building</p>
                <button className="btn btn-primary">Create Project</button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{project.name}</h4>
                      <span className={`badge ${
                        project.status === 'COMPLETED' ? 'badge-success' : 
                        project.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted mb-3">{project.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex-1 mr-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted mt-1">{project.progress}% complete</p>
                      </div>
                      <p className="text-xs text-muted">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'legal' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">Legal Documents</h3>
          </div>
          <div className="p-6">
            {venture.legalDocuments && venture.legalDocuments.length > 0 ? (
              <div className="space-y-4">
                {venture.legalDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-bold">{doc.name}</h4>
                      <p className="text-sm text-muted">{doc.type}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        doc.status === 'EFFECTIVE' ? 'badge-success' : 
                        doc.status === 'PENDING' ? 'badge-warning' : 'badge-secondary'
                      }`}>
                        {doc.status}
                      </span>
                      <p className="text-xs text-muted mt-1">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚖️</div>
                <h4 className="text-lg font-bold mb-2">No Legal Documents</h4>
                <p className="text-muted mb-4">Legal documents will appear here once generated</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'equity' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">Equity Management</h3>
          </div>
          <div className="p-6">
            {venture.equityFramework ? (
              <div className="space-y-6">
                <div className="grid grid-3 gap-6">
                  <div className="text-center p-4 border border-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {venture.equityFramework.ownerPercent}%
                    </div>
                    <p className="text-sm text-muted">Owner Equity</p>
                  </div>
                  <div className="text-center p-4 border border-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {venture.equityFramework.alicePercent}%
                    </div>
                    <p className="text-sm text-muted">Alice Solutions</p>
                  </div>
                  <div className="text-center p-4 border border-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {venture.equityFramework.cepPercent}%
                    </div>
                    <p className="text-sm text-muted">Contributor Pool</p>
                  </div>
                </div>
                <div className="text-center">
                  <button className="btn btn-primary">Manage Equity</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💎</div>
                <h4 className="text-lg font-bold mb-2">No Equity Framework</h4>
                <p className="text-muted mb-4">Equity framework will be set up during venture creation</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-2 gap-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">Venture Settings</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Status</label>
                  <select 
                    value={venture.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="input w-full"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_CONTRACTS">Pending Contracts</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Region</label>
                  <select 
                    value={venture.region}
                    onChange={(e) => setEditData(prev => ({ ...prev, region: e.target.value }))}
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
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={handleUpdateVenture}
                  >
                    Save Changes
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteVenture}
                  >
                    Delete Venture
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">Danger Zone</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-red-400 mb-2">Delete Venture</h4>
                  <p className="text-sm text-muted mb-4">
                    This will permanently delete the venture and all associated data. This action cannot be undone.
                  </p>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteVenture}
                  >
                    Delete Venture
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Edit Venture</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateVenture(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Venture Name</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Purpose & Mission</label>
                  <textarea
                    value={editData.purpose || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, purpose: e.target.value }))}
                    className="input w-full"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Description</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="input w-full"
                    rows={4}
                  />
                </div>
                <div className="grid grid-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Industry</label>
                    <select
                      value={editData.industry || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, industry: e.target.value }))}
                      className="input w-full"
                    >
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
                      value={editData.region || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, region: e.target.value }))}
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
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VentureDetailsPage
