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
  Settings
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

const UserJourney = () => {
  const [user, setUser] = useState<User>({
    id: 'user-123',
    username: 'Alex Chen',
    role: 'STARTUP_FOUNDER',
    company: 'TechFlow Solutions',
    team: 'Core Team',
    level: 8,
    xp: 3200,
    reputation: 92
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    tasks: [],
    projects: [],
    metrics: {},
    recentActivity: []
  })

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
  }

  const currentRole = roleConfig[user.role as keyof typeof roleConfig]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      // In real app, this would fetch from our APIs
      setDashboardData({
        tasks: [
          { id: 1, title: 'Review Q4 financial projections', status: 'pending', priority: 'high', dueDate: '2025-09-15' },
          { id: 2, title: 'Prepare investor pitch deck', status: 'in_progress', priority: 'high', dueDate: '2025-09-20' },
          { id: 3, title: 'Team performance review', status: 'completed', priority: 'medium', dueDate: '2025-09-10' }
        ],
        projects: [
          { id: 1, name: 'Product Launch v2.0', progress: 75, status: 'active', team: 'Core Team' },
          { id: 2, name: 'Market Expansion', progress: 45, status: 'active', team: 'Growth Team' },
          { id: 3, name: 'Investor Relations', progress: 90, status: 'active', team: 'Finance Team' }
        ],
        metrics: {
          totalRevenue: '$2.4M',
          monthlyGrowth: '+12%',
          teamSize: 24,
          activeProjects: 8
        },
        recentActivity: [
          { id: 1, action: 'Completed milestone', project: 'Product Launch', time: '2 hours ago' },
          { id: 2, action: 'New team member joined', member: 'Sarah Kim', time: '1 day ago' },
          { id: 3, action: 'Funding round closed', amount: '$500K', time: '3 days ago' }
        ]
      })
    }

    loadDashboardData()
  }, [])

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${currentRole.color} rounded-2xl p-8 text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}! 👋</h1>
            <p className="text-xl opacity-90">{currentRole.description}</p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Level {user.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>{user.xp} XP</span>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics.totalRevenue}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-gray-600">Monthly Growth</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData.metrics.monthlyGrowth}</p>
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
              <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics.teamSize}</p>
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
              <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics.activeProjects}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Projects */}
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
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
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
            {dashboardData.projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-gray-500">{project.team}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{project.progress}% complete</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
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
          {dashboardData.tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
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
              {['Leadership', 'Strategic Planning', 'Team Management', 'Financial Analysis'].map((skill, index) => (
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
              {['Team Leader Badge', 'Project Excellence', 'Innovation Award', 'Growth Champion'].map((achievement, index) => (
                <div key={achievement} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'tasks':
        return renderTasks()
      case 'skills':
        return renderSkills()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Banner with Switcher */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-r ${currentRole.color} rounded-xl text-white`}>
                <currentRole.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentRole.title}</h2>
                <p className="text-gray-600">{currentRole.description}</p>
              </div>
            </div>
            <RoleSwitcher 
              currentRole={user.role} 
              onRoleChange={(role) => setUser(prev => ({ ...prev, role }))} 
            />
          </div>
        </motion.div>

        {/* Navigation Tabs */}
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

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
}

export default UserJourney
