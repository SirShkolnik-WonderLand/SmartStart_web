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

interface Team {
  id: string
  name: string
  description: string
  ventureId: string
}

interface ProjectFormData {
  name: string
  description: string
  ventureId: string
  teamId: string
  priority: string
  startDate: string
  endDate: string
  objectives: string[]
}

const CreateProject = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ventures, setVentures] = useState<Venture[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    ventureId: '',
    teamId: '',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    objectives: []
  })
  const [newObjective, setNewObjective] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        await loadVentures()
        await loadTeams()
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

  const loadTeams = async () => {
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/teams/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setTeams(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddObjective = () => {
    if (newObjective.trim() && !formData.objectives.includes(newObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }))
      setNewObjective('')
    }
  }

  const handleRemoveObjective = (objectiveToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(obj => obj !== objectiveToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/projects/create', {
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
        router.push('/projects')
      } else {
        alert(`Failed to create project: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project. Please try again.')
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
        <div className="text-6xl mb-4">📋</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Create New Project
        </h1>
        <p className="text-xl text-muted mb-6">
          Plan and organize your next project
        </p>
      </div>

      {/* Project Creation Form */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Project Details</h2>
          <p className="text-muted">Tell us about your project</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">Project Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="input w-full"
                required
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input w-full"
              rows={4}
              placeholder="Describe your project, its goals, and what you want to achieve"
              required
            />
          </div>

          <div className="grid grid-2 gap-6 mb-6">
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

            <div>
              <label className="block text-sm font-bold mb-2">Team (Optional)</label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value="">No Team Assigned</option>
                {teams.filter(team => team.ventureId === formData.ventureId).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="input w-full"
                required
              />
            </div>
          </div>

          {/* Project Objectives */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Project Objectives</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                className="input flex-1"
                placeholder="Add project objective"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddObjective}
              >
                Add
              </button>
            </div>
            
            {formData.objectives.length > 0 && (
              <div className="space-y-2">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2 bg-green-900 px-3 py-2 rounded">
                    <span className="text-sm flex-1">{objective}</span>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleRemoveObjective(objective)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/projects')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="card mt-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h3 className="text-xl font-bold">💡 Project Planning Tips</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Project Structure</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Set clear, measurable objectives</li>
                <li>• Choose realistic timelines</li>
                <li>• Assign appropriate priority levels</li>
                <li>• Link projects to specific ventures</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">What Happens Next?</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Your project will be created</li>
                <li>• You can assign tasks and milestones</li>
                <li>• Team members can collaborate</li>
                <li>• Track progress in real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProject
