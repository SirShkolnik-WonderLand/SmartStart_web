'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3,
  Users,
  Building2,
  FileText,
  Target,
  Award,
  DollarSign,
  Rocket,
  Shield,
  Settings,
  Globe,
  Zap
} from 'lucide-react'

interface System {
  id: string
  name: string
  description: string
  icon: any
  color: string
  status: 'live' | 'beta' | 'coming-soon'
  url: string
}

const PlatformNavigation = () => {
  const [activeCategory, setActiveCategory] = useState('all')

  const systems: System[] = [
    // Core Systems
    {
      id: 'user-journey',
      name: 'User Journey',
      description: 'Personalized dashboards and role-based experiences',
      icon: Users,
      color: 'from-blue-600 to-purple-600',
      status: 'live',
      url: '/user-journey'
    },
    {
      id: 'cli-system',
      name: 'CLI Interface',
      description: 'Terminal-style command interface for power users',
      icon: Zap,
      color: 'from-green-600 to-teal-600',
      status: 'live',
      url: '/cli-dashboard'
    },
    {
      id: 'company-management',
      name: 'Company Management',
      description: 'Manage companies, teams, and organizational structure',
      icon: Building2,
      color: 'from-orange-600 to-red-600',
      status: 'live',
      url: '/companies'
    },
    // Business Systems
    {
      id: 'venture-management',
      name: 'Venture Management',
      description: 'Startup tracking, milestones, and progress monitoring',
      icon: Rocket,
      color: 'from-purple-600 to-pink-600',
      status: 'live',
      url: '/ventures'
    },
    {
      id: 'contract-system',
      name: 'Legal Contracts',
      description: 'Digital contracts, signatures, and legal compliance',
      icon: FileText,
      color: 'from-indigo-600 to-blue-600',
      status: 'live',
      url: '/contracts'
    },
    {
      id: 'task-management',
      name: 'Task Management',
      description: 'Project tasks, deadlines, and team collaboration',
      icon: Target,
      color: 'from-emerald-600 to-green-600',
      status: 'live',
      url: '/tasks'
    },
    // User Systems
    {
      id: 'user-profile',
      name: 'User Profiles',
      description: 'Professional profiles, skills, and achievements',
      icon: Users,
      color: 'from-cyan-600 to-blue-600',
      status: 'live',
      url: '/profiles'
    },
    {
      id: 'portfolio-system',
      name: 'Portfolio System',
      description: 'Showcase projects, work samples, and client feedback',
      icon: BarChart3,
      color: 'from-violet-600 to-purple-600',
      status: 'live',
      url: '/portfolio'
    },
    {
      id: 'gamification',
      name: 'Gamification',
      description: 'XP system, badges, levels, and career progression',
      icon: Award,
      color: 'from-yellow-600 to-orange-600',
      status: 'live',
      url: '/gamification'
    },
    // Advanced Systems
    {
      id: 'funding-pipeline',
      name: 'Funding Pipeline',
      description: 'Investment tracking, runway analysis, and financial planning',
      icon: DollarSign,
      color: 'from-red-600 to-pink-600',
      status: 'live',
      url: '/funding'
    },
    {
      id: 'contribution-pipeline',
      name: 'Contribution Pipeline',
      description: 'Project contributions, rewards, and recognition system',
      icon: Target,
      color: 'from-teal-600 to-green-600',
      status: 'live',
      url: '/contributions'
    },
    {
      id: 'ai-cli',
      name: 'AI CLI Assistant',
      description: 'AI-powered command interface and intelligent suggestions',
      icon: Zap,
      color: 'from-purple-600 to-indigo-600',
      status: 'beta',
      url: '/ai-cli'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Systems', count: systems.length },
    { id: 'core', name: 'Core Systems', count: systems.filter(s => ['user-journey', 'cli-system', 'company-management'].includes(s.id)).length },
    { id: 'business', name: 'Business Tools', count: systems.filter(s => ['venture-management', 'contract-system', 'task-management'].includes(s.id)).length },
    { id: 'user', name: 'User Experience', count: systems.filter(s => ['user-profile', 'portfolio-system', 'gamification'].includes(s.id)).length },
    { id: 'advanced', name: 'Advanced Features', count: systems.filter(s => ['funding-pipeline', 'contribution-pipeline', 'ai-cli'].includes(s.id)).length }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800'
      case 'beta': return 'bg-blue-100 text-blue-800'
      case 'coming-soon': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE'
      case 'beta': return 'BETA'
      case 'coming-soon': return 'SOON'
      default: return 'UNKNOWN'
    }
  }

  const filteredSystems = activeCategory === 'all' 
    ? systems 
    : systems.filter(system => {
        switch (activeCategory) {
          case 'core': return ['user-journey', 'cli-system', 'company-management'].includes(system.id)
          case 'business': return ['venture-management', 'contract-system', 'task-management'].includes(system.id)
          case 'user': return ['user-profile', 'portfolio-system', 'gamification'].includes(system.id)
          case 'advanced': return ['funding-pipeline', 'contribution-pipeline', 'ai-cli'].includes(system.id)
          default: return true
        }
      })

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Systems</h2>
        <p className="text-gray-600">Explore all available systems and tools in the SmartStart platform</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSystems.map((system, index) => (
          <motion.div
            key={system.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${system.color} rounded-xl text-white`}>
                  <system.icon className="w-6 h-6" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
                  {getStatusText(system.status)}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {system.name}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {system.description}
              </p>

              <div className="flex items-center justify-between">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:underline">
                  Access System →
                </button>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Globe className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Platform Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{systems.filter(s => s.status === 'live').length}</div>
            <div className="text-sm text-gray-600">Live Systems</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{systems.filter(s => s.status === 'beta').length}</div>
            <div className="text-sm text-gray-600">Beta Features</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{systems.length}</div>
            <div className="text-sm text-gray-600">Total Systems</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformNavigation
