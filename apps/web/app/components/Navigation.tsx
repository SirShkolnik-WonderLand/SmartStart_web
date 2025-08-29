'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface NavigationProps {
  currentPage: string
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      
      if (userCookie) {
        try {
          const userData = JSON.parse(userCookie.split('=')[1])
          setUser(userData)
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }

    getUserFromCookies()
  }, [])

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/login.html')
  }

  const navItems = [
    {
      href: '/mesh',
      label: 'Mesh',
      description: 'Community status & updates',
      icon: '🌐'
    },
    {
      href: '/portfolio',
      label: 'Portfolio',
      description: 'Your projects & equity',
      icon: '📊'
    },
    {
      href: '/projects',
      label: 'Projects',
      description: 'Manage & contribute',
      icon: '🚀'
    },
    {
      href: '/ideas',
      label: 'Ideas',
      description: 'Submit & vote on ideas',
      icon: '💡'
    },
    {
      href: '/polls',
      label: 'Polls',
      description: 'Community decisions',
      icon: '🗳️'
    },
    {
      href: '/messages',
      label: 'Messages',
      description: 'Team communication',
      icon: '💬'
    },
    {
      href: '/people',
      label: 'People',
      description: 'Team members & roles',
      icon: '👥'
    }
  ]

  // Admin navigation items
  const adminNavItems = [
    {
      href: '/admin',
      label: 'Admin',
      description: 'System overview & analytics',
      icon: '⚙️'
    },
    {
      href: '/admin/users',
      label: 'Users',
      description: 'Manage community members',
      icon: '👥'
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      description: 'Platform configuration',
      icon: '🔧'
    }
  ]

  return (
    <nav className="sidebar-nav">
      <div className="nav-header">
        <h3 className="nav-title">Navigation</h3>
        <p className="nav-subtitle">Quick access to all features</p>
      </div>
      
      <div className="nav-content">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${currentPage === item.href ? 'active' : ''}`}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-text">
              <div className="nav-label">{item.label}</div>
              <div className="nav-description">{item.description}</div>
            </div>
            {currentPage === item.href && <div className="nav-indicator" />}
          </Link>
        ))}
        
        {/* Admin Navigation */}
        {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <>
            <div className="nav-divider">
              <span className="divider-text">Admin</span>
            </div>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${currentPage === item.href ? 'active' : ''}`}
              >
                <div className="nav-icon">{item.icon}</div>
                <div className="nav-text">
                  <div className="nav-label">{item.label}</div>
                  <div className="nav-description">{item.description}</div>
                </div>
                {currentPage === item.href && <div className="nav-indicator" />}
              </Link>
            ))}
          </>
        )}
      </div>

      <div className="nav-footer">
        <div className="system-status">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span className="status-text">System Online</span>
          </div>
        </div>
        
        {user && (
          <div className="user-section">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">User Account</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        )}
        
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </nav>
  )
}
