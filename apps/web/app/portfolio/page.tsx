'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import '../styles/portfolio.css'

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
  status: 'active' | 'completed' | 'paused'
  description: string
  startDate: string
  lastContribution: string
  totalContributions: number
  estimatedValue: number
}

interface PortfolioStats {
  totalProjects: number
  totalOwnership: number
  totalContributions: number
  portfolioValue: number
  activeProjects: number
  completedProjects: number
}

export default function PortfolioPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<PortfolioStats>({
    totalProjects: 0,
    totalOwnership: 0,
    totalContributions: 0,
    portfolioValue: 0,
    activeProjects: 0,
    completedProjects: 0
  })
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
        
        // Fetch portfolio data
        fetchPortfolioData()
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchPortfolioData = async () => {
    try {
      // Get auth token from cookies
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!tokenCookie) {
        router.push('/login')
        return
      }

      const token = tokenCookie.split('=')[1]
      
      // Fetch user's projects from API
      const response = await fetch('/api/projects/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data')
      }

      const data = await response.json()
      
      // Transform API data to match our interface
      const transformedProjects: Project[] = (data.projects || []).map((apiProject: any) => ({
        id: apiProject.id,
        name: apiProject.name,
        role: apiProject.userRole || 'MEMBER',
        ownership: apiProject.ownership || 0,
        status: apiProject.status?.toLowerCase() || 'active',
        description: apiProject.description || 'No description available',
        startDate: apiProject.createdAt || '2024-01-01',
        lastContribution: apiProject.updatedAt || new Date().toISOString(),
        totalContributions: apiProject.totalContributions || 0,
        estimatedValue: apiProject.estimatedValue || 0
      }))
      
      setProjects(transformedProjects)
      
      // Calculate portfolio stats
      const totalProjects = transformedProjects.length
      const totalOwnership = transformedProjects.reduce((sum, p) => sum + p.ownership, 0)
      const totalContributions = transformedProjects.reduce((sum, p) => sum + p.totalContributions, 0)
      const portfolioValue = transformedProjects.reduce((sum, p) => sum + p.estimatedValue, 0)
      const activeProjects = transformedProjects.filter(p => p.status === 'active').length
      const completedProjects = transformedProjects.filter(p => p.status === 'completed').length
      
      setStats({
        totalProjects,
        totalOwnership,
        totalContributions,
        portfolioValue,
        activeProjects,
        completedProjects
      })
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      // Fallback to mock data
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'SmartStart Platform',
          role: 'OWNER',
          ownership: 35,
          status: 'active',
          description: 'The core platform that powers AliceSolutions Ventures community and project management.',
          startDate: '2024-01-01',
          lastContribution: '2024-02-01',
          totalContributions: 8,
          estimatedValue: 50000
        },
        {
          id: '2',
          name: 'AI Marketing Tool',
          role: 'CONTRIBUTOR',
          ownership: 5,
          status: 'active',
          description: 'AI-powered marketing automation platform for small businesses.',
          startDate: '2024-01-15',
          lastContribution: '2024-01-28',
          totalContributions: 3,
          estimatedValue: 15000
        },
        {
          id: '3',
          name: 'E-commerce Platform',
          role: 'CONTRIBUTOR',
          ownership: 4,
          status: 'active',
          description: 'Modern e-commerce solution with advanced inventory management.',
          startDate: '2024-01-20',
          lastContribution: '2024-01-30',
          totalContributions: 2,
          estimatedValue: 12000
        },
        {
          id: '4',
          name: 'Mobile App Framework',
          role: 'OWNER',
          ownership: 40,
          status: 'completed',
          description: 'Cross-platform mobile development framework for rapid app creation.',
          startDate: '2023-11-01',
          lastContribution: '2024-01-15',
          totalContributions: 12,
          estimatedValue: 80000
        }
      ]
      
      setProjects(mockProjects)
      
      // Calculate portfolio stats
      const totalProjects = mockProjects.length
      const totalOwnership = mockProjects.reduce((sum, p) => sum + p.ownership, 0)
      const totalContributions = mockProjects.reduce((sum, p) => sum + p.totalContributions, 0)
      const portfolioValue = mockProjects.reduce((sum, p) => sum + p.estimatedValue, 0)
      const activeProjects = mockProjects.filter(p => p.status === 'active').length
      const completedProjects = mockProjects.filter(p => p.status === 'completed').length
      
      setStats({
        totalProjects,
        totalOwnership,
        totalContributions,
        portfolioValue,
        activeProjects,
        completedProjects
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout currentPage="/portfolio">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading Your Portfolio...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/portfolio">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view your portfolio.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/portfolio">
      <div className="page-header">
        <h1 className="page-title">Your Venture Portfolio</h1>
        <p className="page-subtitle">Track your ownership across multiple ventures and see how your contributions grow your portfolio.</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-4">
        <div className="metric-card">
          <div className="metric-value">{stats.totalProjects}</div>
          <div className="metric-label">Total Projects</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats.totalOwnership}%</div>
          <div className="metric-label">Total Ownership</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats.totalContributions}</div>
          <div className="metric-label">Contributions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">${stats.portfolioValue.toLocaleString()}</div>
          <div className="metric-label">Portfolio Value</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats.activeProjects}</div>
          <div className="metric-label">Active Projects</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{stats.completedProjects}</div>
          <div className="metric-label">Completed</div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Portfolio Overview</h3>
          <p className="card-subtitle">Visual representation of your venture portfolio</p>
        </div>
        
        <div className="card-content">
          <div className="overview-grid">
            {/* Ownership Distribution */}
            <div className="overview-section">
              <h4 className="section-title">Ownership Distribution</h4>
              <div className="ownership-chart">
                {projects.map((project) => (
                  <div key={project.id} className="ownership-item">
                    <span className="project-name">{project.name}</span>
                    <div className="ownership-bar">
                      <div 
                        className="ownership-fill"
                        style={{ width: `${(project.ownership / Math.max(...projects.map(p => p.ownership))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ownership-percentage">{project.ownership}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="overview-section">
              <h4 className="section-title">Recent Activity</h4>
              <div className="activity-list">
                {projects
                  .sort((a, b) => new Date(b.lastContribution).getTime() - new Date(a.lastContribution).getTime())
                  .slice(0, 5)
                  .map((project) => (
                    <div key={project.id} className="activity-item">
                      <span className="activity-project">{project.name}</span>
                      <span className="activity-date">
                        {new Date(project.lastContribution).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <div className="project-info">
                <h3 className="project-title">{project.name}</h3>
                <p className="project-description">{project.description}</p>
              </div>
              <div className="project-badges">
                <span className={`status-badge status-${project.status}`}>
                  {project.status}
                </span>
                <span className={`role-badge role-${project.role.toLowerCase()}`}>
                  {project.role}
                </span>
              </div>
            </div>

            <div className="project-stats">
              <div className="stat-item">
                <div className="stat-value">{project.ownership}%</div>
                <div className="stat-label">Ownership</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{project.totalContributions}</div>
                <div className="stat-label">Contributions</div>
              </div>
            </div>

            <div className="project-details">
              <div className="detail-row">
                <span className="detail-label">Start Date:</span>
                <span className="detail-value">{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Contribution:</span>
                <span className="detail-value">{new Date(project.lastContribution).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estimated Value:</span>
                <span className="detail-value">${project.estimatedValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="project-actions">
              <button className="btn btn-primary">
                <span>View Details</span>
              </button>
              <button className="btn">
                <span>Track Progress</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3 className="empty-title">No projects yet</h3>
          <p className="empty-description">
            Start contributing to projects to build your portfolio!
          </p>
        </div>
      )}
    </AppLayout>
  )
}
