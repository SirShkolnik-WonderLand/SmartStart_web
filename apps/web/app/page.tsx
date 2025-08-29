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

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const userData = await apiCall('/auth/me')
        setUser(userData)
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
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
    <AppLayout currentPage="home">
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
              <span className="status-text">Active Projects: 3</span>
            </li>
            <li className="status-item">
              <span className="status-text">Community Members: 12</span>
            </li>
            <li className="status-item">
              <span className="status-text">Total Contributions: 47</span>
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
            <li className="status-item">
              <span className="status-text">New project proposal submitted</span>
            </li>
            <li className="status-item">
              <span className="status-text">Community poll created</span>
            </li>
            <li className="status-item">
              <span className="status-text">Equity distribution updated</span>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
}
