'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../../services/api'

interface Venture {
  id: string
  name: string
  purpose: string
  industry: string
}

interface TeamFormData {
  name: string
  description: string
  ventureId: string
  purpose: string
  skills: string[]
  maxMembers: number
}

const CreateTeam = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ventures, setVentures] = useState<Venture[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    ventureId: '',
    purpose: '',
    skills: [],
    maxMembers: 10
  })
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        await loadVentures()
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/')
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/teams/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          ownerUserId: user.id
        })
      })

      const result = await response.json()
      
      if (result.success) {
        router.push('/teams')
      } else {
        alert(`Failed to create team: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to create team:', error)
      alert('Failed to create team. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
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
        <div className="text-6xl mb-4">👥</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Create New Team
        </h1>
        <p className="text-xl text-muted mb-6">
          Build a team to bring your venture to life
        </p>
      </div>

      {/* Team Creation Form */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Team Details</h2>
          <p className="text-muted">Tell us about your team</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">Team Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter team name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Venture *</label>
              <select
                name="ventureId"
                value={formData.ventureId}
                onChange={handleInputChange}
                className="input w-full"
                required
              >
                <option value="">Select Venture</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>
                    {venture.name} ({venture.industry})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Team Purpose *</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="input w-full"
              rows={3}
              placeholder="What is this team responsible for? What are their goals?"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input w-full"
              rows={4}
              placeholder="Provide more details about your team, their responsibilities, and how they'll work together"
            />
          </div>

          <div className="grid grid-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">Max Team Members</label>
              <select
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value={5}>5 members</option>
                <option value={10}>10 members</option>
                <option value={20}>20 members</option>
                <option value={50}>50 members</option>
                <option value={100}>100+ members</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Required Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="input flex-1"
                  placeholder="Add required skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSkill}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Skills List */}
          {formData.skills.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 bg-green-900 px-3 py-1 rounded">
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {isLoading ? 'Creating Team...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="card mt-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h3 className="text-xl font-bold">💡 Team Building Tips</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Team Structure</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Define clear roles and responsibilities</li>
                <li>• Set realistic team size limits</li>
                <li>• Identify required skills and expertise</li>
                <li>• Plan for team growth and evolution</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">What Happens Next?</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Your team will be created</li>
                <li>• You can invite team members</li>
                <li>• Set up team projects and tasks</li>
                <li>• Start collaborating immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTeam
