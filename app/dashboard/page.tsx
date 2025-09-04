'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, User, Shield, TrendingUp, Users, Briefcase, Settings, Star, Target, Zap, Award } from 'lucide-react'
import { apiService, User as ApiUser, GamificationData, PortfolioData, JourneyState } from '../services/api'

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null)
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

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

  const loadUserData = async () => {
    if (!user) return
    
    try {
      // Load gamification data
      const gamification = await apiService.getUserGamification(user.id)
      setGamificationData(gamification)
      
      // Load portfolio data
      const portfolio = await apiService.getUserPortfolio(user.id)
      setPortfolioData(portfolio)
      
      // Load journey state
      const journey = await apiService.getJourneyState(user.id)
      setJourneyState(journey)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth-token')
      router.push('/')
    }
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
        {/* Gamification & Portfolio Overview */}
        {(gamificationData || portfolioData) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {gamificationData && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Level</p>
                      <p className="text-2xl font-bold">{gamificationData.level}</p>
                    </div>
                    <Star className="w-8 h-8 text-purple-200" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Experience Points</p>
                      <p className="text-2xl font-bold">{gamificationData.xp.toLocaleString()}</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-200" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Reputation</p>
                      <p className="text-2xl font-bold">{gamificationData.reputation}</p>
                    </div>
                    <Award className="w-8 h-8 text-green-200" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm">Badges Earned</p>
                      <p className="text-2xl font-bold">{gamificationData.badges.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-200" />
                  </div>
                </motion.div>
              </>
            )}

            {portfolioData && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm">Portfolio Value</p>
                      <p className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-indigo-200" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-200 text-sm">Active Projects</p>
                      <p className="text-2xl font-bold">{portfolioData.activeProjects}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-pink-200" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-200 text-sm">Total Contributions</p>
                      <p className="text-2xl font-bold">{portfolioData.totalContributions}</p>
                    </div>
                    <Users className="w-8 h-8 text-teal-200" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-200 text-sm">Equity Owned</p>
                      <p className="text-2xl font-bold">{portfolioData.equityOwned.toFixed(2)}%</p>
                    </div>
                    <Shield className="w-8 h-8 text-amber-200" />
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* Journey Progress */}
        {journeyState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-dark-600"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Journey Progress</h3>
              <span className="text-dark-300 text-sm">Stage {journeyState.currentStage} of {journeyState.totalStages}</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${journeyState.progress}%` }}
              />
            </div>
            <p className="text-dark-300 text-sm">
              {journeyState.nextAction && `Next: ${journeyState.nextAction}`}
            </p>
          </motion.div>
        )}
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
