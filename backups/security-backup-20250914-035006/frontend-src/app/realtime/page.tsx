'use client'

import { useEffect, useState } from 'react'
import { Bell, Activity, Users, MessageSquare } from 'lucide-react'
import RealtimeDashboard from '@/components/realtime/RealtimeDashboard'
import LiveCollaboration from '@/components/realtime/LiveCollaboration'
import RealtimeNotifications from '@/components/notifications/RealtimeNotifications'

// Utility function to extract user ID from JWT token
const getUserIdFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('auth-token')
    if (!token) return null
    
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.userId || null
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

export default function RealtimePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'collaboration' | 'notifications'>('dashboard')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = getUserIdFromToken()
    setUserId(id)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-purple-100">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading real-time features...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-purple-100">
          <Bell className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted mb-4">Please log in to access real-time features.</p>
          <a 
            href="/auth/login" 
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'dashboard' as const,
      name: 'Live Dashboard',
      icon: Activity,
      description: 'Real-time updates and activity feed'
    },
    {
      id: 'collaboration' as const,
      name: 'Live Collaboration',
      icon: Users,
      description: 'Real-time editing and team collaboration'
    },
    {
      id: 'notifications' as const,
      name: 'Notifications',
      icon: Bell,
      description: 'Real-time notifications and alerts'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real-time Features</h1>
          <p className="text-muted text-lg">
            Experience live collaboration and real-time updates
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-sm opacity-80">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="wonderland-card glass-surface p-6">
          {activeTab === 'dashboard' && (
            <RealtimeDashboard userId={userId} />
          )}
          
          {activeTab === 'collaboration' && (
            <LiveCollaboration 
              userId={userId}
              ventureId="sample-venture-id"
              teamId="sample-team-id"
              projectId="sample-project-id"
            />
          )}
          
          {activeTab === 'notifications' && (
            <RealtimeNotifications 
              userId={userId}
              onNotificationClick={(notification) => {
                console.log('Notification clicked:', notification)
              }}
              onMarkAsRead={(notificationId) => {
                console.log('Mark as read:', notificationId)
              }}
              onDelete={(notificationId) => {
                console.log('Delete notification:', notificationId)
              }}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="wonderland-card glass-surface p-6 text-center">
            <Activity className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Updates</h3>
            <p className="text-sm text-muted mb-4">
              Get real-time updates on all your activities
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              View Dashboard
            </button>
          </div>

          <div className="wonderland-card glass-surface p-6 text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm text-muted mb-4">
              Work together in real-time with your team
            </p>
            <button
              onClick={() => setActiveTab('collaboration')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              Start Collaborating
            </button>
          </div>

          <div className="wonderland-card glass-surface p-6 text-center">
            <Bell className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Notifications</h3>
            <p className="text-sm text-muted mb-4">
              Stay informed with instant notifications
            </p>
            <button
              onClick={() => setActiveTab('notifications')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              View Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
