'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Rocket, 
  Users, 
  Building2, 
  Target, 
  Award, 
  DollarSign,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  Star
} from 'lucide-react'
import PlatformNavigation from '../components/PlatformNavigation'

const PlatformHub = () => {
  const [activeSection, setActiveSection] = useState('overview')

  const heroFeatures = [
    {
      icon: Users,
      title: 'Role-Based Dashboards',
      description: 'Personalized experiences for every user type'
    },
    {
      icon: Target,
      title: 'Task Management',
      description: 'Stay organized and track progress'
    },
    {
      icon: Award,
      title: 'Gamification',
      description: 'Level up your skills and career'
    },
    {
      icon: DollarSign,
      title: 'Funding Pipeline',
      description: 'Track investments and financial health'
    }
  ]

  const userTypes = [
    {
      role: 'STARTUP_FOUNDER',
      title: '🚀 Startup Founders',
      description: 'Build, scale, and lead your startup to success',
      color: 'from-blue-600 to-purple-600',
      icon: Rocket,
      features: ['Venture Dashboard', 'Funding Pipeline', 'Team Management', 'Market Validation']
    },
    {
      role: 'TEAM_MEMBER',
      title: '👥 Team Members',
      description: 'Grow your skills and contribute to team success',
      color: 'from-green-600 to-teal-600',
      icon: Users,
      features: ['Task Dashboard', 'Skill Development', 'Performance Tracking', 'Team Collaboration']
    },
    {
      role: 'COMPANY_MANAGER',
      title: '🏢 Company Managers',
      description: 'Oversee operations and drive strategic growth',
      color: 'from-orange-600 to-red-600',
      icon: Building2,
      features: ['Company Overview', 'Team Performance', 'Project Status', 'Resource Allocation']
    },
    {
      role: 'FREELANCER',
      title: '💼 Freelancers',
      description: 'Showcase your work and grow your business',
      color: 'from-purple-600 to-pink-600',
      icon: Target,
      features: ['Portfolio Showcase', 'Client Management', 'Skill Marketing', 'Income Tracking']
    }
  ]

  const sections = [
    { id: 'overview', label: 'Platform Overview', icon: Globe },
    { id: 'systems', label: 'All Systems', icon: Target },
    { id: 'journey', label: 'User Journey', icon: Users }
  ]

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SmartStart Hub
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          The complete platform for startup founders, team members, company managers, and freelancers. 
          Everything you need to build, grow, and succeed in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Start Your Journey</span>
          </button>
          <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-200">
            Explore Platform
          </button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {heroFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <feature.icon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* User Types */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Every Role</h2>
          <p className="text-gray-600 text-lg">Choose your path and get a personalized experience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userTypes.map((userType, index) => (
            <motion.div
              key={userType.role}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-6 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer group`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 bg-gradient-to-r ${userType.color} rounded-xl text-white`}>
                  <userType.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{userType.title}</h3>
                  <p className="text-gray-600 mb-4">{userType.description}</p>
                  <ul className="space-y-2">
                    {userType.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:underline">
                  Experience Dashboard →
                </button>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Platform Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
      >
        <h2 className="text-3xl font-bold mb-8">Platform at a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold mb-2">12+</div>
            <div className="text-blue-100">Live Systems</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">4</div>
            <div className="text-blue-100">User Types</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-blue-100">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-blue-100">Support</div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'systems':
        return <PlatformNavigation />
      case 'journey':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">User Journey Experience</h2>
            <p className="text-gray-600 mb-8">Experience the personalized dashboard for your role</p>
            <a 
              href="/user-journey" 
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <span>Launch User Journey</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )
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
                <Shield className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeSection}
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

export default PlatformHub
