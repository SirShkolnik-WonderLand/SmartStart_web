'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

interface Project {
  id: string
  name: string
  description: string
  status: string
  priority: string
  ventureId: string
  ventureName: string
  teamId?: string
  teamName?: string
  startDate: string
  endDate: string
  progress: number
  tasks: any[]
  createdAt: string
  updatedAt: string
}

const ProjectsPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
        await loadProjects()
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [router])

  const loadProjects = async () => {
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/projects/list/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesStatus = !filterStatus || project.status === filterStatus
    const matchesPriority = !filterPriority || project.priority === filterPriority
    return matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'badge-success'
      case 'PLANNING': return 'badge-warning'
      case 'COMPLETED': return 'badge-secondary'
      case 'ON_HOLD': return 'badge-danger'
      default: return 'badge-secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-green-400'
      default: return 'text-muted'
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading projects...</p>
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
            My Projects
          </h1>
          <p className="text-muted">Manage and track your projects</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="btn btn-secondary"
            onClick={() => router.push('/teams')}
          >
            View Teams
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/projects/create')}
          >
            Create New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {projects.length}
            </div>
            <p className="text-sm text-muted">Total Projects</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {projects.filter(p => p.status === 'ACTIVE').length}
            </div>
            <p className="text-sm text-muted">Active Projects</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {projects.filter(p => p.status === 'COMPLETED').length}
            </div>
            <p className="text-sm text-muted">Completed</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00ff88' }}>
              {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) || 0}%
            </div>
            <p className="text-sm text-muted">Avg Progress</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="p-6">
          <div className="grid grid-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-full"
              >
                <option value="">All Statuses</option>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input w-full"
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="btn btn-secondary w-full"
                onClick={() => {
                  setFilterStatus('')
                  setFilterPriority('')
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-4">No Projects Found</h3>
          <p className="text-muted mb-6">
            {projects.length === 0 
              ? "Create your first project to start tracking progress"
              : "Try adjusting your filters to find more projects."
            }
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => router.push('/projects/create')}
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-2 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:border-green-500 transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                    <p className="text-sm text-muted mb-2">{project.ventureName}</p>
                    <div className="flex gap-2 mb-2">
                      <span className={`badge ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className={`text-sm ${getPriorityColor(project.priority)}`}>
                        {project.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-muted mb-4 line-clamp-2">{project.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">Progress</span>
                    <span className="text-sm text-muted">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="mb-4">
                  <div className="grid grid-2 gap-4 text-sm text-muted">
                    <div>
                      <div>Start: {new Date(project.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(project.endDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div>Tasks: {project.tasks.length}</div>
                      {project.teamName && <div>Team: {project.teamName}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted">
                    <div>Created: {new Date(project.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(project.updatedAt).toLocaleDateString()}</div>
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
              onClick={() => router.push('/projects/create')}
            >
              📋 Create New Project
            </button>
            <button 
              className="btn btn-secondary w-full justify-start"
              onClick={() => router.push('/teams')}
            >
              👥 View Teams
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

export default ProjectsPage
