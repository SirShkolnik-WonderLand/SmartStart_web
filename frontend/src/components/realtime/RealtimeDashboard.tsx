'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Users, 
  Building2, 
  Target, 
  Bell, 
  Wifi, 
  WifiOff,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { getRealtimeService, RealtimeNotification } from '@/lib/realtime-api'

interface RealtimeDashboardProps {
  userId: string
}

interface LiveUpdate {
  id: string
  type: 'VENTURE' | 'TEAM' | 'PROJECT' | 'USER' | 'NOTIFICATION'
  title: string
  message: string
  timestamp: string
  data?: any
}

export default function RealtimeDashboard({ userId }: RealtimeDashboardProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([])
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [stats, setStats] = useState({
    totalUpdates: 0,
    unreadNotifications: 0,
    activeConnections: 0,
    lastUpdate: null as string | null
  })
  
  const realtimeService = useRef(getRealtimeService(userId))
  const updatesRef = useRef<LiveUpdate[]>([])

  useEffect(() => {
    if (!userId) return
    
    const service = realtimeService.current
    
    // Connect to WebSocket
    service.connect()
      .then(() => {
        setIsConnected(true)
        console.log('✅ Real-time dashboard connected')
      })
      .catch(error => {
        console.error('❌ Failed to connect to real-time service:', error)
        setIsConnected(false)
      })

    // Set up message handlers
    service.onMessage('NOTIFICATION', (notification: RealtimeNotification) => {
      handleNotification(notification)
    })

    service.onMessage('VENTURE_UPDATE', (data: any) => {
      handleLiveUpdate('VENTURE', 'Venture Updated', `Venture "${data.name}" has been updated`, data)
    })

    service.onMessage('TEAM_UPDATE', (data: any) => {
      handleLiveUpdate('TEAM', 'Team Updated', `Team "${data.name}" has been updated`, data)
    })

    service.onMessage('PROJECT_UPDATE', (data: any) => {
      handleLiveUpdate('PROJECT', 'Project Updated', `Project "${data.title}" has been updated`, data)
    })

    service.onMessage('USER_UPDATE', (data: any) => {
      handleLiveUpdate('USER', 'User Updated', `User profile has been updated`, data)
    })

    // Subscribe to user updates
    service.subscribe('USER', userId, (data) => {
      handleLiveUpdate('USER', 'Your Profile Updated', 'Your profile has been updated', data)
    })

    // Cleanup on unmount
    return () => {
      service.disconnect()
    }
  }, [userId])

  const handleNotification = (notification: RealtimeNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
    setStats(prev => ({
      ...prev,
      unreadNotifications: prev.unreadNotifications + 1,
      lastUpdate: new Date().toISOString()
    }))
  }

  const handleLiveUpdate = (type: string, title: string, message: string, data: any) => {
    const update: LiveUpdate = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      title,
      message,
      timestamp: new Date().toISOString(),
      data
    }

    updatesRef.current = [update, ...updatesRef.current.slice(0, 99)] // Keep last 100
    setLiveUpdates(updatesRef.current)
    
    setStats(prev => ({
      ...prev,
      totalUpdates: prev.totalUpdates + 1,
      lastUpdate: new Date().toISOString()
    }))
  }

  const getUpdateIcon = (type: string) => {
    const icons = {
      'VENTURE': <Building2 className="w-4 h-4" />,
      'TEAM': <Users className="w-4 h-4" />,
      'PROJECT': <Target className="w-4 h-4" />,
      'USER': <Activity className="w-4 h-4" />,
      'NOTIFICATION': <Bell className="w-4 h-4" />
    }
    return icons[type as keyof typeof icons] || <Activity className="w-4 h-4" />
  }

  const getUpdateColor = (type: string) => {
    const colors = {
      'VENTURE': 'text-blue-600',
      'TEAM': 'text-green-600',
      'PROJECT': 'text-purple-600',
      'USER': 'text-orange-600',
      'NOTIFICATION': 'text-red-600'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const clearUpdates = () => {
    updatesRef.current = []
    setLiveUpdates([])
  }

  const refreshConnection = () => {
    const service = realtimeService.current
    service.disconnect()
    service.connect()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Activity className="w-6 h-6" />
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Real-time Dashboard</h2>
            <p className="text-muted-foreground">
              Live updates and collaboration features
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refreshConnection} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearUpdates} variant="outline" size="sm">
            Clear Updates
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Real-time updates active' : 'Trying to reconnect...'}
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUpdates}</p>
                <p className="text-sm text-muted-foreground">Total Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                <p className="text-sm text-muted-foreground">Unread Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeConnections}</p>
                <p className="text-sm text-muted-foreground">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">
                  {stats.lastUpdate ? formatTimeAgo(stats.lastUpdate) : 'Never'}
                </p>
                <p className="text-sm text-muted-foreground">Last Update</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Updates Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Live Updates Feed</span>
            {liveUpdates.length > 0 && (
              <Badge variant="secondary">{liveUpdates.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveUpdates.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No live updates</h3>
              <p className="text-muted-foreground">
                Live updates will appear here as they happen.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {liveUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    getUpdateColor(update.type).replace('text-', 'bg-').replace('-600', '-100')
                  }`}>
                    <span className={getUpdateColor(update.type)}>
                      {getUpdateIcon(update.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{update.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {update.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {update.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(update.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Recent Notifications</span>
              <Badge variant="secondary">{notifications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge 
                        variant={notification.priority === 'URGENT' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
