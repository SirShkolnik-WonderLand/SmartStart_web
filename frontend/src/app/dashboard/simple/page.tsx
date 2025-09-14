'use client'

import { useEffect, useState } from 'react'
import { apiService, User } from '@/lib/api'

export default function SimpleDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Simple dashboard: Starting data load...')
        
        const userResponse = await apiService.getCurrentUser()
        console.log('👤 Simple dashboard: User response:', userResponse)
        
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
          console.log('✅ Simple dashboard: User loaded successfully')
        } else {
          setError('Failed to load user data')
        }
      } catch (err) {
        console.error('❌ Simple dashboard: Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
        console.log('🏁 Simple dashboard: Loading complete')
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-purple-100">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading simple dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Simple Dashboard</h1>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-purple-100">
          <h2 className="text-2xl font-bold mb-4">User Information</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ) : (
            <p>No user data available</p>
          )}
        </div>

        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-purple-100">
          <h2 className="text-2xl font-bold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Loading State:</strong> {isLoading ? 'Loading' : 'Complete'}</p>
            <p><strong>Error State:</strong> {error || 'None'}</p>
            <p><strong>User State:</strong> {user ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
