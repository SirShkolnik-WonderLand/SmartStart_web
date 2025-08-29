'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import '../styles/login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/proxy/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Set cookies for authentication
        document.cookie = `authToken=${data.token}; path=/; max-age=86400`
        document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=86400`
        document.cookie = `userRole=${data.user.role}; path=/; max-age=86400`
        
        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/portfolio')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-placeholder">
              <span className="logo-text">Smart</span>
            </div>
            <div className="logo-text">
              <div className="logo-title">SmartStart</div>
              <div className="logo-subtitle">AliceSolutions Ventures Hub</div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="auth-form-container">
          <div className="auth-form-card">
            <h2 className="auth-form-title">Sign In</h2>
            <p className="auth-form-subtitle">Access your SmartStart portfolio</p>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                />
              </div>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary auth-submit-btn"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="demo-accounts">
              <h3 className="demo-title">Demo Accounts</h3>
              <div className="demo-accounts-grid">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@smartstart.com', 'admin123')}
                  className="demo-account-btn"
                >
                  <div className="demo-email">admin@smartstart.com</div>
                  <div className="demo-role">Admin Access</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('owner@demo.local', 'owner123')}
                  className="demo-account-btn"
                >
                  <div className="demo-email">owner@demo.local</div>
                  <div className="demo-role">Owner Access</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('contrib@demo.local', 'contrib123')}
                  className="demo-account-btn"
                >
                  <div className="demo-email">contrib@demo.local</div>
                  <div className="demo-role">Contributor Access</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>Powered by Express, Prisma, and PostgreSQL</p>
        </div>
      </div>
    </div>
  )
}
