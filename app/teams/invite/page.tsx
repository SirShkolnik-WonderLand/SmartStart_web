'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiService } from '../../services/api'

interface Team {
  id: string
  name: string
  description: string
  ventureName: string
  members: any[]
}

interface InviteFormData {
  email: string
  role: string
  message: string
}

const InviteTeamMember = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get('teamId')
  
  const [user, setUser] = useState<any>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    role: 'MEMBER',
    message: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        if (teamId) {
          await loadTeam()
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/')
      }
    }
    loadData()
  }, [router, teamId])

  const loadTeam = async () => {
    if (!teamId) return
    
    try {
      const response = await fetch(`https://smartstart-api.onrender.com/api/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setTeam(data.data)
      }
    } catch (error) {
      console.error('Failed to load team:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId) return

    setIsLoading(true)
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/teams/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId,
          ...formData
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Invitation sent successfully!')
        router.push('/teams')
      } else {
        alert(`Failed to send invitation: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !team) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Invite Team Member
        </h1>
        <p className="text-xl text-muted mb-6">
          Invite someone to join <strong>{team.name}</strong>
        </p>
      </div>

      {/* Team Info */}
      <div className="card mb-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{team.name}</h3>
          <p className="text-muted mb-4">{team.description}</p>
          <div className="flex gap-4 text-sm">
            <span className="text-muted">Venture: {team.ventureName}</span>
            <span className="text-muted">Members: {team.members.length}</span>
          </div>
        </div>
      </div>

      {/* Invitation Form */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Invitation Details</h2>
          <p className="text-muted">Send an invitation to join your team</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="Enter team member's email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="input w-full"
              required
            >
              <option value="MEMBER">Member</option>
              <option value="LEAD">Team Lead</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
            <p className="text-sm text-muted mt-1">
              Choose the appropriate role for this team member
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Personal Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="input w-full"
              rows={4}
              placeholder="Add a personal message to your invitation (optional)"
            />
            <p className="text-sm text-muted mt-1">
              This message will be included in the invitation email
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/teams')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="card mt-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h3 className="text-xl font-bold">💡 Invitation Tips</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Role Descriptions</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• <strong>Member:</strong> Basic team access</li>
                <li>• <strong>Team Lead:</strong> Can manage tasks and members</li>
                <li>• <strong>Admin:</strong> Full team management</li>
                <li>• <strong>Owner:</strong> Complete control</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">What Happens Next?</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Invitation email will be sent</li>
                <li>• Recipient can accept or decline</li>
                <li>• You'll be notified of their response</li>
                <li>• They'll get access to team features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteTeamMember
