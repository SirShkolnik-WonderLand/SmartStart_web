'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Check, 
  X, 
  Trash2, 
  MoreVertical,
  Users,
  FileText,
  Trophy,
  Target,
  DollarSign,
  AlertCircle,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Notification {
  id: string
  type: 'TEAM_INVITATION' | 'DOCUMENT_SIGNED' | 'GOAL_COMPLETED' | 'REVENUE_DISTRIBUTED' | 'ACHIEVEMENT_EARNED' | 'GENERAL'
  title: string
  message: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'UNREAD' | 'READ'
  data?: any
  createdAt: string
  readAt?: string
}

interface RealtimeNotificationsProps {
  userId: string
  onNotificationClick?: (notification: Notification) => void
  onMarkAsRead?: (notificationId: string) => void
  onDelete?: (notificationId: string) => void
}

export default function RealtimeNotifications({
  userId,
  onNotificationClick,
  onMarkAsRead,
  onDelete
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadNotifications()
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [userId])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      // This would call the actual API
      // const response = await apiService.getUserNotifications(userId)
      // setNotifications(response.data.notifications)
      // setUnreadCount(response.data.unreadCount)
      
      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'TEAM_INVITATION',
          title: 'Team Invitation',
          message: 'You\'ve been invited to join Alpha Team as a Senior Member',
          priority: 'NORMAL',
          status: 'UNREAD',
          data: { teamId: 'team_1', role: 'SENIOR_MEMBER' },
          createdAt: '2024-02-10T10:30:00Z'
        },
        {
          id: '2',
          type: 'DOCUMENT_SIGNED',
          title: 'Document Signed',
          message: 'Your PPA document has been successfully signed',
          priority: 'HIGH',
          status: 'UNREAD',
          data: { documentId: 'doc_1', documentType: 'PPA' },
          createdAt: '2024-02-10T09:15:00Z'
        },
        {
          id: '3',
          type: 'GOAL_COMPLETED',
          title: 'Goal Completed!',
          message: 'Congratulations! You\'ve completed the Q1 objectives goal',
          priority: 'HIGH',
          status: 'READ',
          data: { goalId: 'goal_1', xpReward: 100 },
          createdAt: '2024-02-09T16:45:00Z',
          readAt: '2024-02-09T17:00:00Z'
        },
        {
          id: '4',
          type: 'REVENUE_DISTRIBUTED',
          title: 'Revenue Distributed',
          message: 'Your revenue share of $2,500 has been distributed',
          priority: 'NORMAL',
          status: 'READ',
          data: { amount: 2500, ventureId: 'venture_1' },
          createdAt: '2024-02-08T14:20:00Z',
          readAt: '2024-02-08T15:00:00Z'
        },
        {
          id: '5',
          type: 'ACHIEVEMENT_EARNED',
          title: 'Achievement Unlocked!',
          message: 'You\'ve earned the "Team Player" badge',
          priority: 'NORMAL',
          status: 'READ',
          data: { badgeId: 'badge_1', badgeName: 'Team Player' },
          createdAt: '2024-02-07T11:30:00Z',
          readAt: '2024-02-07T12:00:00Z'
        }
      ]
      
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => n.status === 'UNREAD').length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWebSocket = () => {
    try {
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://smartstart-api.onrender.com/notifications?userId=${userId}`
        : `ws://localhost:3001/notifications?userId=${userId}`
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'NOTIFICATION') {
            const newNotification = data.data
            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket()
        }, 5000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('Error connecting WebSocket:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'UNREAD') {
      markAsRead(notification.id)
    }
    onNotificationClick?.(notification)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // This would call the actual API
      // await apiService.markNotificationAsRead(notificationId)
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'READ' as const, readAt: new Date().toISOString() }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      onMarkAsRead?.(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // This would call the actual API
      // await apiService.markAllNotificationsAsRead(userId)
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.status === 'UNREAD'
            ? { ...notification, status: 'READ' as const, readAt: new Date().toISOString() }
            : notification
        )
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // This would call the actual API
      // await apiService.deleteNotification(notificationId)
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId)
        return notification?.status === 'UNREAD' ? Math.max(0, prev - 1) : prev
      })
      onDelete?.(notificationId)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons = {
      'TEAM_INVITATION': <Users className="w-5 h-5" />,
      'DOCUMENT_SIGNED': <FileText className="w-5 h-5" />,
      'GOAL_COMPLETED': <Target className="w-5 h-5" />,
      'REVENUE_DISTRIBUTED': <DollarSign className="w-5 h-5" />,
      'ACHIEVEMENT_EARNED': <Trophy className="w-5 h-5" />,
      'GENERAL': <Bell className="w-5 h-5" />
    }
    return icons[type as keyof typeof icons] || <Bell className="w-5 h-5" />
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'bg-gray-100 text-gray-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityIcon = (priority: string) => {
    const icons = {
      'LOW': <Info className="w-4 h-4" />,
      'NORMAL': <Info className="w-4 h-4" />,
      'HIGH': <AlertCircle className="w-4 h-4" />,
      'URGENT': <AlertCircle className="w-4 h-4" />
    }
    return icons[priority as keyof typeof icons] || <Info className="w-4 h-4" />
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground">
              {unreadCount} unread • {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button onClick={loadNotifications} variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`flex items-center space-x-2 p-3 rounded-lg ${
        isConnected ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium">
          {isConnected ? 'Real-time notifications active' : 'Connecting...'}
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                notification.status === 'UNREAD' ? 'border-l-4 border-l-primary' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.status === 'UNREAD' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          {notification.status === 'UNREAD' && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {getPriorityIcon(notification.priority)}
                            <span className="ml-1">{notification.priority}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {notification.status === 'UNREAD' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
