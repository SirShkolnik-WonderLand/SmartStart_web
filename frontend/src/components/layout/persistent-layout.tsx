'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Crown, 
  Search,
  Bell,
  Settings,
  LogOut,
  Home,
  Briefcase,
  Target,
  FileText,
  UserCheck,
  BarChart3,
  Menu,
  Sun,
  Moon
} from 'lucide-react'
import { comprehensiveApiService as apiService, User } from '@/lib/api-comprehensive'
import { useThemeStore } from '@/store/useThemeStore'

interface PersistentLayoutProps {
  children: React.ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme, toggleTheme, initializeTheme } = useThemeStore()
  const router = useRouter()
  const pathname = usePathname()

  // Pages that don't need the persistent layout
  const authPages = ['/auth/login', '/auth/register']
  const isAuthPage = authPages.includes(pathname)

  useEffect(() => {
    // Initialize theme
    initializeTheme()
    
    if (isAuthPage) {
      setIsLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          router.push('/auth/login')
          return
        }

        const response = await apiService.getCurrentUser()
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          // Clear invalid token and redirect
          localStorage.removeItem('auth-token')
          localStorage.removeItem('user-id')
          localStorage.removeItem('user-data')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid token and redirect
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-id')
        localStorage.removeItem('user-data')
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, isAuthPage, initializeTheme])

  const handleLogout = async () => {
    try {
      await apiService.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      localStorage.clear()
      router.push('/auth/login')
    }
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen wonderland-bg">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-glass-surface rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-foreground-muted" />
              </button>
              <div className="flex items-center gap-2">
                <Crown className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">SmartStart Wonderland</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search ventures, opportunities..."
                  className="pl-10 pr-4 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 w-64"
                />
              </div>
              
              <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-foreground-muted" />
              </button>
              
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 hover:bg-glass-surface rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-foreground-muted" />
              </button>
              
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-glass-surface rounded-lg transition-colors"
                title={`Current: ${theme} - Click to cycle themes`}
              >
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-foreground-muted" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground-muted" />
                )}
              </button>
              
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-glass-surface rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-foreground-muted" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 wonderland-sidebar glass-surface min-h-screen sticky top-16 z-40`}>
          <div className="p-6">
            <nav className="space-y-2">
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/dashboard' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground-muted hover:text-foreground hover:bg-glass-surface'
                }`}
              >
                <Home className="w-5 h-5" />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
              <Link 
                href="/ventures" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/ventures' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground-muted hover:text-foreground hover:bg-glass-surface'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                {sidebarOpen && <span>My Ventures</span>}
              </Link>
              <Link 
                href="/opportunities" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/opportunities' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground-muted hover:text-foreground hover:bg-glass-surface'
                }`}
              >
                <Target className="w-5 h-5" />
                {sidebarOpen && <span>Opportunities</span>}
              </Link>
              <Link 
                href="/approvals" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/approvals' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground-muted hover:text-foreground hover:bg-glass-surface'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                {sidebarOpen && <span>Approvals</span>}
                {sidebarOpen && <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">3</span>}
              </Link>
              <Link 
                href="/documents" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/documents' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground-muted hover:text-foreground hover:bg-glass-surface'
                }`}
              >
                <FileText className="w-5 h-5" />
                {sidebarOpen && <span>Documents</span>}
              </Link>
              <Link 
                href="/analytics" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/analytics' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground-muted hover:text-foreground hover:bg-glass-surface'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                {sidebarOpen && <span>Analytics</span>}
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 wonderland-bg min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
