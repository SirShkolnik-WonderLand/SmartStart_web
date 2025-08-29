'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
      const response = await fetch(`/api/auth/rbac-insights/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const insights = await response.json()
        setProjects(insights.projectAccess || [])
      }
    } catch (error) {
      console.error('Error fetching user projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Projects...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view projects.</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">SmartStart</h1>
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Projects
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.email}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Active Projects
              </h2>
              <p className="text-gray-600">
                Manage your projects, track contributions, and monitor your progress.
              </p>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Project Overview
              </h3>
              
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {project.name}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {project.role}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Your Ownership:</span>
                          <span className="text-lg font-bold text-green-600">
                            {project.ownership}%
                          </span>
                        </div>
                        
                        <div className="pt-3 space-y-2">
                          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm">
                            View Project Details
                          </button>
                          <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
                            View Contributions
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500">
                    You haven't been added to any projects yet. Contact an administrator to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
