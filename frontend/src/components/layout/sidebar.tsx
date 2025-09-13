'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Building2, 
  Search, 
  FileText, 
  CheckCircle, 
  Settings,
  ChevronLeft,
  Key,
  Clock,
  Building,
  Users,
  Trophy,
  Network,
  Coins,
  Wallet,
  TrendingUp,
  Shield,
  DollarSign,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

const navigation = [
  { name: 'Home', href: '/', icon: Home, current: true },
  { name: 'Ventures', href: '/ventures', icon: Building2, current: false },
  { name: 'Companies', href: '/companies', icon: Building, current: false },
  { name: 'Teams', href: '/teams', icon: Users, current: false },
  { name: 'Umbrella', href: '/umbrella', icon: Network, current: false },
  { name: 'Opportunities', href: '/opportunities', icon: Search, current: false },
  { name: 'BUZ Tokens', href: '/buz', icon: Coins, current: false },
  { name: 'Documents', href: '/documents', icon: FileText, current: false },
  { name: 'Legal Compliance', href: '/legal-compliance', icon: Shield, current: false },
  { name: 'Revenue Sharing', href: '/revenue-sharing', icon: DollarSign, current: false },
  { name: 'Gamification', href: '/gamification', icon: Trophy, current: false },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, current: false },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, current: false },
  { name: 'Notifications', href: '/notifications', icon: Bell, current: false },
  { name: 'Search', href: '/search', icon: Search, current: false },
  { name: 'Approvals', href: '/approvals', icon: CheckCircle, current: false },
  { name: 'Admin', href: '/admin', icon: Settings, current: false },
  { name: 'Admin BUZ', href: '/admin/buz', icon: Wallet, current: false },
  { name: 'Settings', href: '/settings', icon: Settings, current: false },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-background/95 backdrop-blur border-r transition-all duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Key className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium">Navigation</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ x: 4 }}
              onHoverStart={() => setHoveredItem(item.name)}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <a
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  item.current
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    item.current ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {hoveredItem === item.name && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-2 w-2 rounded-full bg-highlight"
                  />
                )}
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="glass-card p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Journey Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level 3</span>
                <span>1,250 XP</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Next level in 250 XP
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
