'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import '../styles/admin.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface RBACInsights {
  role: string
  projectCount: number
  totalContributions: number
  portfolioValue: number
  permissions: string[]
  projectAccess: Array<{
    projectId: string
    projectName: string
    role: string
    ownership: number
  }>
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [rbacInsights, setRbacInsights] = useState<RBACInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = async () => {
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
        
        // Fetch real RBAC insights from API
        try {
          const insightsResponse = await fetch(`https://smartstart-api.onrender.com/auth/rbac-insights/${userData.id}`, {
            headers: {
              'Authorization': `Bearer ${tokenCookie.split('=')[1]}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (insightsResponse.ok) {
            const insights = await insightsResponse.json()
            setRbacInsights(insights)
          } else {
            // Fallback to basic insights if API fails
            const fallbackInsights: RBACInsights = {
              role: userData.role,
              projectCount: 0,
              totalContributions: 0,
              portfolioValue: 0,
              permissions: [],
              projectAccess: []
            }
            setRbacInsights(fallbackInsights)
          }
        } catch (error) {
          console.error('Error fetching RBAC insights:', error)
          // Fallback to basic insights if API fails
          const fallbackInsights: RBACInsights = {
            role: userData.role,
            projectCount: 0,
            totalContributions: 0,
            portfolioValue: 0,
            permissions: [],
            projectAccess: []
          }
          setRbacInsights(fallbackInsights)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  if (loading) {
    return (
      <AppLayout currentPage="/admin">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading Admin Dashboard...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <AppLayout currentPage="/admin">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>You need admin privileges to access this page.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/admin">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and RBAC management</p>
      </div>

      {/* Welcome Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Welcome, {user.email}</h3>
          <p className="card-subtitle">You have full administrative access to the SmartStart platform</p>
        </div>
      </div>

      {/* RBAC System Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">RBAC System Overview</h3>
          <p className="card-subtitle">Current user permissions and access levels</p>
        </div>
        
        <div className="card-content">
          <div className="grid grid-4">
            <div className="metric-card">
              <div className="metric-value">{rbacInsights?.role}</div>
              <div className="metric-label">User Role</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{rbacInsights?.projectCount}</div>
              <div className="metric-label">Active Projects</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{rbacInsights?.totalContributions}</div>
              <div className="metric-label">Total Contributions</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{rbacInsights?.portfolioValue}%</div>
              <div className="metric-label">Portfolio Value</div>
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="permissions-section">
            <h4 className="section-title">Admin Permissions</h4>
            <div className="permissions-grid">
              {rbacInsights?.permissions.map((permission, index) => (
                <span key={index} className="permission-badge">
                  {permission}
                </span>
              ))}
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="project-access-section">
            <h4 className="section-title">Project Access & Ownership</h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Role</th>
                    <th>Ownership %</th>
                  </tr>
                </thead>
                <tbody>
                  {rbacInsights?.projectAccess.map((project) => (
                    <tr key={project.projectId}>
                      <td>{project.projectName}</td>
                      <td>
                        <span className={`role-badge role-${project.role.toLowerCase()}`}>
                          {project.role}
                        </span>
                      </td>
                      <td>{project.ownership}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">Common administrative tasks</p>
        </div>
        
        <div className="card-content">
          <div className="actions-grid">
            <button className="btn btn-primary">
              <span>Manage Users</span>
            </button>
            <button className="btn btn-primary">
              <span>System Settings</span>
            </button>
            <button className="btn btn-primary">
              <span>View Audit Logs</span>
            </button>
            <button className="btn btn-primary">
              <span>Project Overview</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
