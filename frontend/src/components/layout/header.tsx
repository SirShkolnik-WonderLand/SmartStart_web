'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, Plus, Menu, Sun, Moon, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/components/theme-provider'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { setSidebarOpen } = useUIStore()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Search:', searchQuery)
  }

  // const handleLogout = () => {
  //   logout()
  // }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Key className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-foreground">SmartStart</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search ventures, roles, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'wonderlight' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <Button size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>

          {/* User Profile */}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{typeof user.role === 'string' ? user.role : user.role?.name || 'User'}</p>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export { Header }
