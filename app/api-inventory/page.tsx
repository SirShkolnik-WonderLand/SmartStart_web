'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  Users, 
  Building2, 
  Target, 
  Award, 
  DollarSign,
  FileText,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Settings,
  Briefcase,
  TrendingUp,
  BarChart3,
  User,
  Lock,
  Unlock
} from 'lucide-react'

interface APIEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  category: string
  requiresAuth: boolean
  icon: any
  color: string
  status?: 'tested' | 'pending' | 'error'
}

const APIInventory = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isTesting, setIsTesting] = useState(false)

  const categories = [
    { id: 'all', name: 'All APIs', count: 0 },
    { id: 'auth', name: 'Authentication', count: 0 },
    { id: 'user', name: 'User Management', count: 0 },
    { id: 'business', name: 'Business Systems', count: 0 },
    { id: 'advanced', name: 'Advanced Features', count: 0 },
    { id: 'system', name: 'System & Health', count: 0 }
  ]

  const allEndpoints: APIEndpoint[] = [
    // Authentication APIs
    {
      id: 'auth-login',
      method: 'POST',
      path: '/api/simple-auth/login',
      description: 'User login with email and password (working endpoint)',
      category: 'auth',
      requiresAuth: false,
      icon: Lock,
      color: 'from-blue-600 to-purple-600'
    },
    {
      id: 'auth-register',
      method: 'POST',
      path: '/api/auth/register',
      description: 'Create new user account with email verification',
      category: 'auth',
      requiresAuth: false,
      icon: User,
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 'auth-profile',
      method: 'GET',
      path: '/api/auth/profile',
      description: 'Get current user profile and authentication status',
      category: 'auth',
      requiresAuth: true,
      icon: User,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'auth-csrf',
      method: 'GET',
      path: '/api/auth/csrf',
      description: 'Get CSRF token for secure form submissions',
      category: 'auth',
      requiresAuth: false,
      icon: Shield,
      color: 'from-orange-600 to-red-600'
    },

    // User Management APIs
    {
      id: 'user-profile',
      method: 'GET',
      path: '/api/user-profile/profile/:userId',
      description: 'Get detailed user profile with skills and achievements',
      category: 'user',
      requiresAuth: true,
      icon: User,
      color: 'from-cyan-600 to-blue-600'
    },
    {
      id: 'user-portfolio',
      method: 'GET',
      path: '/api/user-portfolio/analytics',
      description: 'Get user portfolio analytics and project metrics',
      category: 'user',
      requiresAuth: true,
      icon: BarChart3,
      color: 'from-violet-600 to-purple-600'
    },
    {
      id: 'user-gamification',
      method: 'GET',
      path: '/api/user-gamification/dashboard/:userId',
      description: 'Get user gamification data, XP, levels, and badges',
      category: 'user',
      requiresAuth: true,
      icon: Award,
      color: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'user-management',
      method: 'GET',
      path: '/api/user-management/:userId',
      description: 'Get user management data and connections',
      category: 'user',
      requiresAuth: true,
      icon: Users,
      color: 'from-teal-600 to-green-600'
    },

    // Business Systems APIs
    {
      id: 'role-dashboard',
      method: 'GET',
      path: '/api/role-dashboard/dashboard',
      description: 'Get role-based dashboard data for current user',
      category: 'business',
      requiresAuth: true,
      icon: BarChart3,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'task-management',
      method: 'GET',
      path: '/api/tasks/tasks',
      description: 'Get all tasks for current user with filtering',
      category: 'business',
      requiresAuth: true,
      icon: Target,
      color: 'from-emerald-600 to-green-600'
    },
    {
      id: 'task-today',
      method: 'GET',
      path: '/api/tasks/today',
      description: 'Get today\'s tasks and priorities',
      category: 'business',
      requiresAuth: true,
      icon: Clock,
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 'company-management',
      method: 'GET',
      path: '/api/companies/',
      description: 'Get company listings and management data',
      category: 'business',
      requiresAuth: true,
      icon: Building2,
      color: 'from-orange-600 to-red-600'
    },
    {
      id: 'team-management',
      method: 'GET',
      path: '/api/teams/',
      description: 'Get team listings and member management',
      category: 'business',
      requiresAuth: true,
      icon: Users,
      color: 'from-purple-600 to-pink-600'
    },

    // Advanced Features APIs
    {
      id: 'funding-pipeline',
      method: 'GET',
      path: '/api/funding/pipeline',
      description: 'Get funding pipeline and investment tracking',
      category: 'advanced',
      requiresAuth: true,
      icon: DollarSign,
      color: 'from-red-600 to-pink-600'
    },
    {
      id: 'venture-management',
      method: 'GET',
      path: '/api/ventures/',
      description: 'Get venture listings and startup tracking',
      category: 'advanced',
      requiresAuth: true,
      icon: Rocket,
      color: 'from-blue-600 to-purple-600'
    },
    {
      id: 'contracts',
      method: 'GET',
      path: '/api/contracts/',
      description: 'Get contract listings and legal documents',
      category: 'advanced',
      requiresAuth: true,
      icon: FileText,
      color: 'from-indigo-600 to-blue-600'
    },
    {
      id: 'contribution-pipeline',
      method: 'GET',
      path: '/api/contribution/overview',
      description: 'Get contribution pipeline and project analytics',
      category: 'advanced',
      requiresAuth: true,
      icon: TrendingUp,
      color: 'from-teal-600 to-green-600'
    },
    {
      id: 'digital-documents',
      method: 'GET',
      path: '/api/documents/legal',
      description: 'Get digital documents and signing status',
      category: 'advanced',
      requiresAuth: true,
      icon: FileText,
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'file-management',
      method: 'GET',
      path: '/api/files/',
      description: 'Get file listings and document management',
      category: 'advanced',
      requiresAuth: true,
      icon: FileText,
      color: 'from-gray-600 to-blue-600'
    },

    // System & Health APIs
    {
      id: 'system-health',
      method: 'GET',
      path: '/health',
      description: 'Get overall system health and status',
      category: 'system',
      requiresAuth: false,
      icon: CheckCircle,
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'cli-health',
      method: 'GET',
      path: '/api/cli/health',
      description: 'Get CLI system health and command status',
      category: 'system',
      requiresAuth: false,
      icon: Zap,
      color: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'system-instructions',
      method: 'GET',
      path: '/api/system/instructions',
      description: 'Get system instructions and feature documentation',
      category: 'system',
      requiresAuth: false,
      icon: Settings,
      color: 'from-gray-600 to-slate-600'
    },
    {
      id: 'ai-cli-status',
      method: 'GET',
      path: '/api/ai-cli/status',
      description: 'Get AI CLI system status and capabilities',
      category: 'system',
      requiresAuth: false,
      icon: Zap,
      color: 'from-purple-600 to-pink-600'
    }
  ]

  useEffect(() => {
    setEndpoints(allEndpoints)
  }, [])

  const filteredEndpoints = selectedCategory === 'all' 
    ? endpoints 
    : endpoints.filter(ep => ep.category === selectedCategory)

  const testEndpoint = async (endpoint: APIEndpoint) => {
    setIsTesting(true)
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'
    
    try {
      const url = `${API_BASE}${endpoint.path}`
      const options: RequestInit = {
        method: endpoint.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }

      const response = await fetch(url, options)
      const data = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          data: data,
          timestamp: new Date().toISOString()
        }
      }))

      // Update endpoint status
      setEndpoints(prev => prev.map(ep => 
        ep.id === endpoint.id 
          ? { ...ep, status: response.ok ? 'tested' : 'error' }
          : ep
      ))

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint.id]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }))

      setEndpoints(prev => prev.map(ep => 
        ep.id === endpoint.id 
          ? { ...ep, status: 'error' }
          : ep
      ))
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusIcon = (endpoint: APIEndpoint) => {
    if (endpoint.status === 'tested') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (endpoint.status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'PATCH': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">API Inventory</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/platform-hub" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Platform Hub
              </a>
              <a href="/user-journey" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                User Journey
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SmartStart API Inventory
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Complete list of all available APIs with testing capabilities
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{endpoints.filter(ep => ep.status === 'tested').length} Tested</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{endpoints.filter(ep => !ep.status).length} Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>{endpoints.filter(ep => ep.status === 'error').length} Errors</span>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.id === 'all' ? endpoints.length : endpoints.filter(ep => ep.category === category.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* API Endpoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEndpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${endpoint.color} rounded-xl text-white`}>
                  <endpoint.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(endpoint)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {endpoint.path}
              </h3>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {endpoint.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {endpoint.requiresAuth ? (
                    <Lock className="w-4 h-4 text-red-500" />
                  ) : (
                    <Unlock className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {endpoint.requiresAuth ? 'Auth Required' : 'Public'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 capitalize">
                  {endpoint.category}
                </span>
              </div>

              <button
                onClick={() => testEndpoint(endpoint)}
                disabled={isTesting}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Test API</span>
              </button>

              {/* Test Results */}
              {testResults[endpoint.id] && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Test Result</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      testResults[endpoint.id].status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {testResults[endpoint.id].statusCode || 'Error'}
                    </span>
                  </div>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(testResults[endpoint.id].data || testResults[endpoint.id].error, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">API Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{endpoints.length}</div>
              <div className="text-sm text-gray-600">Total APIs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{endpoints.filter(ep => !ep.requiresAuth).length}</div>
              <div className="text-sm text-gray-600">Public APIs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{endpoints.filter(ep => ep.requiresAuth).length}</div>
              <div className="text-sm text-gray-600">Protected APIs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default APIInventory
