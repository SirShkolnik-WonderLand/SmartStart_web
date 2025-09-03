'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Briefcase, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Building2,
  Rocket,
  Lightbulb,
  Shield,
  Globe,
  Settings,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import RoleSwitcher from '../components/RoleSwitcher'

interface User {
  id: string
  username: string
  role: string
  company: string
  team: string
  level: number
  xp: number
  reputation: number
  avatar?: string
}

interface DashboardData {
  tasks: any[]
  projects: any[]
  metrics: any
  recentActivity: any[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'

const UserJourney = () => {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    tasks: [],
    projects: [],
    metrics: {},
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [lastSync, setLastSync] = useState<{ label: string; at: string }[]>([])

  const roleConfig = {
    STARTUP_FOUNDER: {
      title: '🚀 Startup Founder',
      description: 'Build, scale, and lead your startup to success',
      color: 'from-blue-600 to-purple-600',
      icon: Rocket,
      features: ['Venture Dashboard', 'Funding Pipeline', 'Team Management', 'Market Validation']
    },
    TEAM_MEMBER: {
      title: '👥 Team Member',
      description: 'Grow your skills and contribute to team success',
      color: 'from-green-600 to-teal-600',
      icon: Users,
      features: ['Task Dashboard', 'Skill Development', 'Performance Tracking', 'Team Collaboration']
    },
    COMPANY_MANAGER: {
      title: '🏢 Company Manager',
      description: 'Oversee operations and drive strategic growth',
      color: 'from-orange-600 to-red-600',
      icon: Building2,
      features: ['Company Overview', 'Team Performance', 'Project Status', 'Resource Allocation']
    },
    FREELANCER: {
      title: '💼 Freelancer',
      description: 'Showcase your work and grow your business',
      color: 'from-purple-600 to-pink-600',
      icon: Briefcase,
      features: ['Portfolio Showcase', 'Client Management', 'Skill Marketing', 'Income Tracking']
    }
  } as const

  const currentRole = user ? roleConfig[user.role as keyof typeof roleConfig] : null

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const secureGet = async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error(`${path} ${res.status}`)
    return res.json()
  }

  const loadAll = async (selectedRole?: string) => {
    setIsLoading(true)
    setError('')
    const syncMarks: { label: string; at: string }[] = []
    try {
      // 1) Auth context
      const profile = await secureGet('/api/auth/profile')
      const userId = profile && (profile.id || profile.userId)
      const resolvedUser: User = {
        id: userId,
        username: profile.username || profile.email || 'user',
        role: selectedRole || profile.role || 'TEAM_MEMBER',
        company: profile.companyName || 'SmartStart',
        team: profile.teamName || 'Core',
        level: profile.level || 1,
        xp: profile.xp || 0,
        reputation: profile.reputation || 0
      }
      setUser(resolvedUser)
      syncMarks.push({ label: 'Profile', at: new Date().toISOString() })

      // 2) Parallel fetches
      const requests: Array<Promise<any>> = [
        secureGet('/api/role-dashboard/dashboard'),
        secureGet('/api/tasks/tasks'),
        secureGet('/api/tasks/today'),
        secureGet(`/api/user-gamification/dashboard/${encodeURIComponent(userId)}`)
      ]

      // Portfolio and profile detail endpoints may vary; try both analytics and portfolio detail
      requests.push(
        secureGet(`/api/user-portfolio/analytics`).catch(() => null),
        secureGet(`/api/user-profile/profile/${encodeURIComponent(userId)}`).catch(() => null)
      )

      const [roleDash, tasks, tasksToday, gamification, portfolioAnalytics, profileDetail] = await Promise.all(requests)

      const metrics = {
        totalTasks: Array.isArray(tasks) ? tasks.length : (tasks && tasks.tasks ? tasks.tasks.length : 0),
        todayTasks: Array.isArray(tasksToday) ? tasksToday.length : (tasksToday && tasksToday.tasks ? tasksToday.tasks.length : 0),
        level: gamification && (gamification.level || gamification.data?.level) || resolvedUser.level,
        xp: gamification && (gamification.xp || gamification.data?.xp) || resolvedUser.xp,
        badges: gamification && (gamification.badges || gamification.data?.badges) || []
      }

      const projects = (roleDash && roleDash.projects) || (portfolioAnalytics && portfolioAnalytics.topProjects) || []
      const recentActivity = (roleDash && roleDash.activity) || []

      setDashboardData({
        tasks: (tasks && tasks.tasks) || tasks || [],
        projects,
        metrics,
        recentActivity
      })

      const now = new Date().toISOString()
      syncMarks.push({ label: 'Role Dashboard', at: now })
      syncMarks.push({ label: 'Tasks', at: now })
      syncMarks.push({ label: 'Gamification', at: now })
      if (portfolioAnalytics) syncMarks.push({ label: 'Portfolio', at: now })
      if (profileDetail) syncMarks.push({ label: 'Profile Detail', at: now })
      setLastSync(syncMarks)
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll().catch(() => {})
  }, [])

  const onRoleChange = (role: string) => {
    if (!user) return
    setUser(prev => prev ? { ...prev, role } : prev)
    loadAll(role).catch(() => {})
  }

  const renderIntegrity = () => (
    <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-800">Data integrity</span>
        </div>
        <div className="text-xs text-gray-500">{new Date().toLocaleString()}</div>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
        <div>Tasks: {(dashboardData.tasks || []).length}</div>
        <div>Projects: {(dashboardData.projects || []).length}</div>
        <div>Level / XP: {dashboardData.metrics?.level || 0} / {dashboardData.metrics?.xp || 0}</div>
      </div>
      {lastSync.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Last sync: {lastSync.map(s => `${s.label} @ ${new Date(s.at).toLocaleTimeString()}`).join(' • ')}
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center space-x-3 text-gray-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your dashboard…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white border border-red-200 text-red-700 rounded-xl p-6 max-w-md">
          <div className="flex items-center space-x-2 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>Failed to load dashboard</span>
          </div>
          <div className="mt-2 text-sm">{error}</div>
          <button onClick={() => loadAll()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-gray-900">Sign in required</h2>
          <p className="text-sm text-gray-600 mt-1">Please sign in to access your dashboard.</p>
          <a href="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Login</a>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {renderIntegrity()}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${currentRole?.color} rounded-2xl p-8 text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}! 👋</h1>
            <p className="text-xl opacity-90">{currentRole?.description}</p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Level {dashboardData.metrics?.level || user.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>{dashboardData.metrics?.xp || user.xp} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>{user.reputation} Reputation</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{user.company}</div>
            <div className="opacity-90">{user.team}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics?.totalTasks || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasks Today</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData.metrics?.todayTasks || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Size</p>
              <p className="text-2xl font-bold text-gray-900">{user.team ? 1 : 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{(dashboardData.projects || []).length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {(dashboardData.recentActivity || []).length === 0 && (
              <div className="text-sm text-gray-500">No recent activity yet.</div>
            )}
            {dashboardData.recentActivity.map((activity: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action || activity.type || 'Activity'}</p>
                  <p className="text-xs text-gray-500">{activity.time || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Active Projects
          </h3>
          <div className="space-y-4">
            {(dashboardData.projects || []).length === 0 && (
              <div className="text-sm text-gray-500">No projects yet. <a href="/cli-dashboard" className="text-blue-600 underline">Create your first project</a></div>
            )}
            {dashboardData.projects.map((project: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{project.name || project.title || 'Project'}</span>
                  <span className="text-sm text-gray-500">{project.team || ''}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{project.progress || 0}% complete</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    (project.status || 'active') === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status || 'active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
        <div className="space-y-4">
          {(dashboardData.tasks || []).length === 0 && (
            <div className="text-sm text-gray-500">No tasks yet. <a href="/cli-dashboard" className="text-blue-600 underline">Create your first task</a></div>
          )}
          {dashboardData.tasks.map((task: any) => (
            <div key={task.id || task.taskId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">{task.title || task.name}</p>
                  {task.dueDate && <p className="text-sm text-gray-500">Due: {task.dueDate}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {task.priority && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                )}
                {task.status && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Skills & Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Core Skills</h4>
            <div className="space-y-3">
              {['Leadership', 'Strategic Planning', 'Team Management', 'Financial Analysis'].map((skill) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm">{skill}</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Recent Achievements</h4>
            <div className="space-y-3">
              {Array.isArray(dashboardData.metrics?.badges) && dashboardData.metrics.badges.length > 0 ? (
                dashboardData.metrics.badges.map((b: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">{b.name || b.title || 'Badge'}</span>
                  </div>
                ))
              ) : (
                ['Team Leader Badge', 'Project Excellence'].map((achievement) => (
                  <div key={achievement} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">{achievement}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SmartStart Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Globe className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Shield className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user.username.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-r ${currentRole?.color} rounded-xl text-white`}>
                {currentRole && <currentRole.icon className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentRole?.title || 'Your Dashboard'}</h2>
                <p className="text-gray-600">{currentRole?.description || 'Live, role-aware data and actions'}</p>
              </div>
            </div>
            <RoleSwitcher 
              currentRole={user.role} 
              onRoleChange={onRoleChange} 
            />
          </div>
        </motion.div>

        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'skills' && renderSkills()}
          {activeTab !== 'overview' && activeTab !== 'tasks' && activeTab !== 'skills' && renderOverview()}
        </motion.div>
      </main>
    </div>
  )
}

export default UserJourney
