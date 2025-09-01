'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, User, Shield, TrendingUp, Users, Briefcase, Settings } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: {
    id: string
    name: string
    level: number
  }
  permissions: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        } else {
          localStorage.removeItem('auth-token')
          router.push('/')
        }
      } else {
        localStorage.removeItem('auth-token')
        router.push('/')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth-token')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('auth-token')
    router.push('/')
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'text-red-400 bg-red-900/20'
      case 'ADMIN':
        return 'text-orange-400 bg-orange-900/20'
      case 'OWNER':
        return 'text-purple-400 bg-purple-900/20'
      case 'CONTRIBUTOR':
        return 'text-blue-400 bg-blue-900/20'
      case 'MEMBER':
        return 'text-green-400 bg-green-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getPermissionGroups = (permissions: string[]) => {
    const groups: { [key: string]: string[] } = {}
    permissions.forEach(permission => {
      const [resource] = permission.split(':')
      if (!groups[resource]) {
        groups[resource] = []
      }
      groups[resource].push(permission)
    })
    return groups
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-sm border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold gradient-text">SmartStart Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-dark-300">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-dark-300">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm text-dark-400">Role</span>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role.name)}`}>
                  {user.role.name}
                </div>
              </div>
              <div>
                <span className="text-sm text-dark-400">Role Level</span>
                <p className="text-white">{user.role.level}</p>
              </div>
            </div>
          </motion.div>

          {/* Permissions & Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Permissions Overview */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(getPermissionGroups(user.permissions)).map(([resource, perms]) => (
                  <div key={resource} className="bg-dark-800/50 rounded-lg p-4">
                    <h4 className="text-primary-400 font-medium mb-2 capitalize">{resource}</h4>
                    <div className="space-y-1">
                      {perms.map(permission => (
                        <div key={permission} className="text-sm text-dark-300">
                          • {permission}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.permissions.includes('project:write') && (
                  <button className="flex flex-col items-center space-y-2 p-4 bg-primary-600/20 hover:bg-primary-600/30 rounded-lg transition-colors">
                    <Briefcase className="w-6 h-6 text-primary-400" />
                    <span className="text-sm text-white">Create Project</span>
                  </button>
                )}
                {user.permissions.includes('user:read') && (
                  <button className="flex flex-col items-center space-y-2 p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors">
                    <Users className="w-6 h-6 text-blue-400" />
                    <span className="text-sm text-white">View Users</span>
                  </button>
                )}
                {user.permissions.includes('system:read') && (
                  <button className="flex flex-col items-center space-y-2 p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors">
                    <Settings className="w-6 h-6 text-purple-400" />
                    <span className="text-sm text-white">System Settings</span>
                  </button>
                )}
                <button className="flex flex-col items-center space-y-2 p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <span className="text-sm text-white">Analytics</span>
                </button>
              </div>
            </div>

            {/* API Server Info */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">API Server Status</h3>
              <p className="text-dark-300 mb-4">
                This dashboard is now connected to the dedicated API server at: <code className="bg-dark-800 px-2 py-1 rounded">{API_BASE_URL}</code>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">API Connected</span>
                  </div>
                </div>
                <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-400">RBAC Active</span>
                  </div>
                </div>
                <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-400">Real-time Data</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
