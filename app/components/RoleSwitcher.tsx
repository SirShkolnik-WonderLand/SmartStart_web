'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Rocket, 
  Users, 
  Building2, 
  Briefcase, 
  ChevronDown,
  Check
} from 'lucide-react'

interface Role {
  id: string
  title: string
  description: string
  color: string
  icon: any
  features: string[]
}

interface RoleSwitcherProps {
  currentRole: string
  onRoleChange: (role: string) => void
}

const RoleSwitcher = ({ currentRole, onRoleChange }: RoleSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const roles: Role[] = [
    {
      id: 'STARTUP_FOUNDER',
      title: '🚀 Startup Founder',
      description: 'Build, scale, and lead your startup to success',
      color: 'from-blue-600 to-purple-600',
      icon: Rocket,
      features: ['Venture Dashboard', 'Funding Pipeline', 'Team Management', 'Market Validation']
    },
    {
      id: 'TEAM_MEMBER',
      title: '👥 Team Member',
      description: 'Grow your skills and contribute to team success',
      color: 'bg-gradient-to-r from-green-600 to-teal-600',
      icon: Users,
      features: ['Task Dashboard', 'Skill Development', 'Performance Tracking', 'Team Collaboration']
    },
    {
      id: 'COMPANY_MANAGER',
      title: '🏢 Company Manager',
      description: 'Oversee operations and drive strategic growth',
      color: 'bg-gradient-to-r from-orange-600 to-red-600',
      icon: Building2,
      features: ['Company Overview', 'Team Performance', 'Project Status', 'Resource Allocation']
    },
    {
      id: 'FREELANCER',
      title: '💼 Freelancer',
      description: 'Showcase your work and grow your business',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      icon: Briefcase,
      features: ['Portfolio Showcase', 'Client Management', 'Skill Marketing', 'Income Tracking']
    }
  ]

  const currentRoleData = roles.find(role => role.id === currentRole) || roles[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
      >
        <div className={`p-2 bg-gradient-to-r ${currentRoleData.color} rounded-lg text-white`}>
          <currentRoleData.icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-900">{currentRoleData.title}</p>
          <p className="text-sm text-gray-500">{currentRoleData.description}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Switch Role</h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange(role.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      currentRole === role.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 bg-gradient-to-r ${role.color} rounded-lg text-white`}>
                      <role.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{role.title}</p>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                    {currentRole === role.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RoleSwitcher
