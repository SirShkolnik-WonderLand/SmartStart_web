'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

const LegalPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading legal documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Legal Documents
        </h1>
        <p className="text-xl text-muted">
          Manage your legal agreements and compliance
        </p>
      </div>

      {/* Legal Documents Grid */}
      <div className="grid grid-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">📋 Platform Agreements</h3>
            <p className="text-muted">Core platform terms and conditions</p>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="text-green-400">✓</div>
                <span>Terms of Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-400">✓</div>
                <span>Privacy Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-400">✓</div>
                <span>Platform Participation Agreement</span>
              </div>
            </div>
            <button className="btn btn-primary w-full">
              View Documents
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">🤝 Venture Agreements</h3>
            <p className="text-muted">Legal documents for your ventures</p>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">○</div>
                <span>Non-Disclosure Agreements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-400">○</div>
                <span>Partnership Agreements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-400">○</div>
                <span>Investment Agreements</span>
              </div>
            </div>
            <button className="btn btn-secondary w-full">
              Create Documents
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">⚖️ Compliance</h3>
            <p className="text-muted">Regulatory compliance and reporting</p>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">○</div>
                <span>Tax Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-400">○</div>
                <span>Regulatory Filings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-400">○</div>
                <span>Audit Reports</span>
              </div>
            </div>
            <button className="btn btn-secondary w-full">
              Manage Compliance
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">📄 Document Templates</h3>
            <p className="text-muted">Pre-built legal document templates</p>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="text-green-400">✓</div>
                <span>SOBA Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-green-400">✓</div>
                <span>PUOHA Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-gray-400">○</div>
                <span>Custom Templates</span>
              </div>
            </div>
            <button className="btn btn-primary w-full">
              Browse Templates
            </button>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="text-center">
        <button 
          className="btn btn-secondary"
          onClick={() => router.push('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default LegalPage
