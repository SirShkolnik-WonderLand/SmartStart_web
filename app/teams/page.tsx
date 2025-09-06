'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar?: string
  joinedAt: string
  skills: string[]
}

interface Team {
  id: string
  name: string
  description: string
  ventureId: string
  ventureName: string
  members: TeamMember[]
  createdAt: string
  updatedAt: string
}

const TeamsPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        await loadTeams()
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [router])

  const loadTeams = async () => {
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/teams/list/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }

  const handleCreateTeam = () => {
    setShowCreateForm(true)
  }

  const handleInviteMember = (teamId: string) => {
    // TODO: Implement invite member functionality
    console.log('Invite member to team:', teamId)
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading teams...</p>
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
            My Teams
          </h1>
          <p className="text-muted">Build and manage your teams</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="btn btn-secondary"
            onClick={() => router.push('/ventures')}
          >
            View Ventures
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleCreateTeam}
          >
            Create New Team
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {teams.length}
            </div>
            <p className="text-sm text-muted">Total Teams</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {teams.reduce((acc, team) => acc + team.members.length, 0)}
            </div>
            <p className="text-sm text-muted">Total Members</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {teams.filter(t => t.members.length > 1).length}
            </div>
            <p className="text-sm text-muted">Active Teams</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              0
            </div>
            <p className="text-sm text-muted">Pending Invites</p>
          </div>
        </div>
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold mb-4">No Teams Yet</h3>
          <p className="text-muted mb-6">
            Create your first team to start collaborating with others
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleCreateTeam}
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-2 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="card hover:border-green-500 transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                    <p className="text-sm text-muted mb-2">{team.ventureName}</p>
                    <div className="flex gap-2">
                      <span className="badge badge-secondary">
                        {team.members.length} members
                      </span>
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted mb-4 line-clamp-2">{team.description}</p>

                {/* Team Members Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold mb-2">Team Members</h4>
                  <div className="flex flex-wrap gap-2">
                    {team.members.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded">
                        <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{member.name}</span>
                        <span className="text-xs text-muted">({member.role})</span>
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded">
                        <span className="text-sm text-muted">
                          +{team.members.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted">
                    <div>Created: {new Date(team.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(team.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedTeam(team)}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleInviteMember(team.id)}
                    >
                      Invite Member
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
              onClick={handleCreateTeam}
            >
              👥 Create New Team
            </button>
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/ventures')}
            >
              🚀 View Ventures
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

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <div className="card-header">
              <h3 className="text-xl font-bold">Create New Team</h3>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Team Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Description</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    placeholder="Describe your team's purpose"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-2">Venture</label>
                  <select className="input w-full">
                    <option value="">Select Venture</option>
                    {/* TODO: Load user's ventures */}
                  </select>
                </div>
                <div className="flex gap-4 justify-end">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamsPage
