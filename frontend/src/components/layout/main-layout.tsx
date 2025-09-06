'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { useTheme } from '@/components/theme-provider'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { theme } = useTheme()
  const { isAuthenticated } = useAuthStore()
  const { setGlobalLoading } = useUIStore()

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    // Initialize loading state
    setGlobalLoading(false)
  }, [setGlobalLoading])

  return (
    <div className="min-h-screen bg-background">
      {/* Background Scene */}
      <div className="fixed inset-0 -z-10">
        {/* Checker Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `
              linear-gradient(var(--checker) 1px, transparent 1px),
              linear-gradient(90deg, var(--checker) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Keyhole Glow */}
        <div 
          className="absolute top-5 right-5 w-48 h-48 opacity-60"
          style={{
            background: `radial-gradient(circle, var(--keyhole-glow) 0%, transparent 70%)`
          }}
        />
        
        {/* Pocket Watch */}
        <div 
          className="absolute bottom-5 left-5 w-32 h-32 opacity-40"
          style={{
            background: `radial-gradient(circle, var(--pocket-watch) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar */}
        {isAuthenticated && <Sidebar />}
        
        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 min-h-[calc(100vh-4rem)] ${isAuthenticated ? "lg:ml-64" : ""}`}
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </motion.main>
      </div>

      {/* Mobile Overlay */}
      {isAuthenticated && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => useUIStore.getState().setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}

// function cn(...classes: (string | undefined | null | false)[]): string {
//   return classes.filter(Boolean).join(' ')
// }
