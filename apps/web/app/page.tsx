'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from './components/AppLayout'
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
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
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
      <AppLayout currentPage="home">
        <div className="loading">Loading...</div>
      </AppLayout>
    )
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
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">UI/UX designer for mobile app</span>
                <span className="status-badge badge-primary">Open</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Data analyst for metrics</span>
                <span className="status-badge badge-info">Urgent</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Kudos */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Kudos
            </h3>
            <p className="card-subtitle">Recognition and appreciation</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Sarah for excellent sprint leadership</span>
                <span className="status-badge badge-success">Today</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Mike for hitting all milestone targets</span>
                <span className="status-badge badge-success">Yesterday</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Team for collaborative problem-solving</span>
                <span className="status-badge badge-success">This week</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="call-to-action">
        <div className="cta-content">
          <h3 className="cta-title">
            Ready to contribute?
          </h3>
          <p className="cta-text">
            Check the Projects tab to see available opportunities, or submit your ideas in the Ideas section. 
            Every contribution builds your portfolio and strengthens the community!
          </p>
          <div className="cta-actions">
            <a href="/projects" className="btn btn-primary">
              <span>View Projects</span>
              <span>→</span>
            </a>
            <a href="/ideas" className="btn">
              <span>Submit Idea</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
