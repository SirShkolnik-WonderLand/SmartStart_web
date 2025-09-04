'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Navigation = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState({ name: 'Udi Shkolnik', initials: 'US' })

  const navItems = [
    { href: '/venture-gate', label: 'Journey', icon: '🚀' },
    { href: '/venture-gate/explore', label: 'Explore', icon: '🔍' },
    { href: '/venture-gate/verify', label: 'Security', icon: '🔐' },
    { href: '/venture-gate/plans', label: 'Plans', icon: '💳' },
    { href: '/venture-gate/legal', label: 'Legal', icon: '📋' },
    { href: '/venture-gate/profile', label: 'Profile', icon: '👤' },
    { href: '/documents', label: 'Documents', icon: '📚' }
  ]

  const handleLogout = () => {
    // Clear any stored auth data
    document.cookie = 'web_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/')
  }

  // Set user data on mount (no API calls to avoid errors)
  useEffect(() => {
    setUser({ name: 'Udi Shkolnik', initials: 'US' })
  }, [])

  return (
    <nav className="nav">
      <div className="container">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/venture-gate" className="nav-brand">
            AliceSolutions Ventures
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex nav-links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-secondary">Welcome, {user.name}</span>
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.initials}
              </div>
            </div>
            
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden btn btn-secondary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
