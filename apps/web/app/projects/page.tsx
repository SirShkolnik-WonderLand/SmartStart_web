'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import { apiCallWithAuth } from '../utils/api'
import '../styles/projects.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface Project {
  id: string
  name: string
  role: string
  ownership: number
}

export default function ProjectsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!userCookie || !tokenCookie) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userCookie.split('=')[1])
        setUser(userData)
        
        // Fetch user projects
        fetchUserProjects(userData.id, tokenCookie.split('=')[1])
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchUserProjects = async (userId: string, token: string) => {
    try {
      const insights = await apiCallWithAuth(`/auth/rbac-insights/${userId}`, token)
      setProjects(insights.projectAccess || [])
    } catch (error) {
      console.error('Error fetching user projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout currentPage="/projects">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading Projects...</p>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/projects">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view projects.</p>
          <button 
            onClick={() => router.push('/login')}
            className="button button-primary"
          >
            Back to Login
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/projects">
      <div className="page-header">
        <h1 className="page-title">
          Your Projects
        </h1>
        <p className="page-subtitle">
          Manage your projects, track contributions, and monitor your progress
        </p>
      </div>

      <div className="grid grid-3">
        {/* Welcome Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Project Overview
            </h3>
            <p className="card-subtitle">Your active project portfolio</p>
          </div>
          <div className="card-content">
            <p>You have access to {projects.length} project{projects.length !== 1 ? 's' : ''} with varying levels of ownership and contribution opportunities.</p>
            <div className="button-group">
              <button className="button button-primary">Create New Project</button>
              <button className="button button-secondary">View All Projects</button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Portfolio Stats
            </h3>
            <p className="card-subtitle">Your project statistics</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <span className="status-text">Total Projects: {projects.length}</span>
            </li>
            <li className="status-item">
              <span className="status-text">Total Ownership: {projects.reduce((sum, p) => sum + p.ownership, 0)}%</span>
            </li>
            <li className="status-item">
              <span className="status-text">Active Projects: {projects.filter(p => p.role !== 'VIEWER').length}</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Quick Actions
            </h3>
            <p className="card-subtitle">Common project tasks</p>
          </div>
          <div className="card-content">
            <div className="button-group">
              <button className="button button-secondary">Join Project</button>
              <button className="button button-secondary">View Contributions</button>
              <button className="button button-secondary">Project Analytics</button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-section">
        <h2 className="section-title">Your Active Projects</h2>
        
        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-header">
                  <h3 className="project-name">{project.name}</h3>
                  <span className={`project-role role-${project.role.toLowerCase()}`}>
                    {project.role}
                  </span>
                </div>
                
                <div className="project-content">
                  <div className="project-stat">
                    <span className="stat-label">Your Ownership:</span>
                    <span className="stat-value ownership">{project.ownership}%</span>
                  </div>
                  
                  <div className="project-actions">
                    <button className="button button-primary">View Details</button>
                    <button className="button button-secondary">Contributions</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="empty-title">No projects yet</h3>
            <p className="empty-description">
              You haven't been added to any projects yet. Contact an administrator to get started.
            </p>
            <button className="button button-primary">Join Project</button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
