'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Navigation = () => {
  const router = useRouter()
  const [user, setUser] = useState({ name: 'Udi Shkolnik', initials: 'US' })

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/venture-gate', label: 'Journey', icon: '🚀' },
    { href: '/documents', label: 'Documents', icon: '📚' },
    { href: '/cli-dashboard', label: 'System', icon: '💻' }
  ]

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem('user-id')
    localStorage.removeItem('user-data')
    router.push('/')
  }

  // Set user data on mount
  useEffect(() => {
    setUser({ name: 'Udi Shkolnik', initials: 'US' })
  }, [])

  return (
    <nav className="bg-gray-900/50 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-white">SmartStart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.initials}
              </div>
              <span className="text-sm text-gray-300">{user.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation