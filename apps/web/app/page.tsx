'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from './components/AppLayout'
import { apiCall } from './utils/api'
import './styles/home.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface DashboardStats {
  activeProjects: number
  communityMembers: number
  totalContributions: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    communityMembers: 0,
    totalContributions: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const userData = await apiCall('/auth/me')
        setUser(userData)
        
        // Fetch dashboard stats
        await fetchDashboardStats()
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch projects count
      const projectsResponse = await apiCall('/projects')
      const activeProjects = projectsResponse?.length || 0

      // Fetch users count
      const usersResponse = await apiCall('/users')
      const communityMembers = usersResponse?.length || 0

      // Fetch contributions count
      const contributionsResponse = await apiCall('/contributions')
      const totalContributions = contributionsResponse?.length || 0

      // Fetch recent activity (from various sources)
      const recentActivity = await fetchRecentActivity()

      setStats({
        activeProjects,
        communityMembers,
        totalContributions,
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const activities = []
      
      // Get recent contributions
      const contributions = await apiCall('/contributions')
      if (contributions?.length > 0) {
        const recentContributions = contributions
          .slice(0, 3)
          .map((contribution: any) => ({
            id: contribution.id,
            type: 'CONTRIBUTION',
            description: `New contribution submitted for ${contribution.task?.title || 'task'}`,
            timestamp: contribution.createdAt
          }))
        activities.push(...recentContributions)
      }

      // Get recent ideas
      const ideas = await apiCall('/ideas')
      if (ideas?.length > 0) {
        const recentIdeas = ideas
          .slice(0, 2)
          .map((idea: any) => ({
            id: idea.id,
            type: 'IDEA',
            description: `New idea proposal: ${idea.title}`,
            timestamp: idea.createdAt
          }))
        activities.push(...recentIdeas)
      }

      // Get recent polls
      const polls = await apiCall('/polls')
      if (polls?.length > 0) {
        const recentPolls = polls
          .slice(0, 1)
          .map((poll: any) => ({
            id: poll.id,
            type: 'POLL',
            description: `New community poll created: ${poll.title}`,
            timestamp: poll.createdAt
          }))
        activities.push(...recentPolls)
      }

      // Sort by timestamp and take the most recent 3
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <AppLayout currentPage="/">
      <div className="page-header">
        <h1 className="page-title">
          SmartStart
        </h1>
        <p className="page-subtitle">
          Community-driven development platform for building ventures together
        </p>
      </div>

      <div className="grid grid-3">
        {/* Welcome */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Welcome to SmartStart
            </h3>
            <p className="card-subtitle">Your community-driven development platform</p>
          </div>
          <div className="card-content">
            <p>SmartStart brings together project management, equity tracking, contribution management, and community collaboration in one secure, scalable solution.</p>
            <div className="button-group">
              <a href="/projects" className="button button-primary">View Projects</a>
              <a href="/mesh" className="button button-secondary">Community Mesh</a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Platform Stats
            </h3>
            <p className="card-subtitle">Current activity overview</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <span className="status-text">Active Projects: {stats.activeProjects}</span>
            </li>
            <li className="status-item">
              <span className="status-text">Community Members: {stats.communityMembers}</span>
            </li>
            <li className="status-item">
              <span className="status-text">Total Contributions: {stats.totalContributions}</span>
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Recent Activity
            </h3>
            <p className="card-subtitle">Latest community updates</p>
          </div>
          <ul className="status-list">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <li key={activity.id} className="status-item">
                  <span className="status-text">{activity.description}</span>
                  <span className="status-time">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="status-item">
                <span className="status-text">No recent activity</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}
