'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Star,
  CheckCheck
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error' | 'achievement'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'achievements'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock notifications - replace with real API calls
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Level Up! 🎉',
        message: 'Congratulations! You\'ve reached Level 5 and earned the "Contributor" badge.',
        timestamp: '2 minutes ago',
        read: false,
        actionUrl: '/leaderboard',
        actionText: 'View Badges'
      },
      {
        id: '2',
        type: 'success',
        title: 'Team Invitation Accepted',
        message: 'Sarah Johnson has accepted your invitation to join the "Quantum AI Labs" team.',
        timestamp: '1 hour ago',
        read: false,
        actionUrl: '/teams',
        actionText: 'View Team'
      },
      {
        id: '3',
        type: 'info',
        title: 'New Venture Opportunity',
        message: 'A new venture "GreenTech Innovations" is looking for a Frontend Developer.',
        timestamp: '3 hours ago',
        read: true,
        actionUrl: '/opportunities',
        actionText: 'View Opportunity'
      },
      {
        id: '4',
        type: 'warning',
        title: 'Document Expiring Soon',
        message: 'Your NDA with "Blockchain Solutions" will expire in 7 days.',
        timestamp: '1 day ago',
        read: true,
        actionUrl: '/documents',
        actionText: 'Review Document'
      },
      {
        id: '5',
        type: 'achievement',
        title: 'XP Milestone! ⚡',
        message: 'You\'ve earned 100 XP for completing your first project contribution.',
        timestamp: '2 days ago',
        read: true,
        actionUrl: '/leaderboard',
        actionText: 'View Progress'
      },
      {
        id: '6',
        type: 'success',
        title: 'Company Created',
        message: 'Your company "TechStart Solutions" has been successfully created and is now live.',
        timestamp: '3 days ago',
        read: true,
        actionUrl: '/companies',
        actionText: 'View Company'
      }
    ]

    setTimeout(() => {
      setNotifications(mockNotifications)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'info':
        return <Info className="w-5 h-5 text-primary" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error" />
      case 'achievement':
        return <Star className="w-5 h-5 text-warning" />
      default:
        return <Bell className="w-5 h-5 text-foreground-muted" />
    }
  }

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success/5 border-success/20'
      case 'info':
        return 'bg-primary/5 border-primary/20'
      case 'warning':
        return 'bg-warning/5 border-warning/20'
      case 'error':
        return 'bg-error/5 border-error/20'
      case 'achievement':
        return 'bg-warning/5 border-warning/20'
      default:
        return 'bg-glass-surface border-border'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'achievements') return notification.type === 'achievement'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="relative w-full max-w-md glass rounded-xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1 hover:bg-glass-surface rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4 text-foreground-muted" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-glass-surface rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-foreground-muted" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('achievements')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'achievements' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              Achievements
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-foreground-muted">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No notifications</h3>
              <p className="text-sm text-foreground-muted">
                {filter === 'unread' 
                  ? 'All caught up! No unread notifications.'
                  : filter === 'achievements'
                  ? 'No achievements yet. Keep contributing!'
                  : 'You\'re all caught up!'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-glass-surface transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border ${getNotificationBg(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-foreground-muted">
                          {notification.timestamp}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 hover:bg-glass-surface rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3 text-foreground-muted" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-glass-surface rounded transition-colors"
                            title="Delete notification"
                          >
                            <X className="w-3 h-3 text-foreground-muted" />
                          </button>
                        </div>
                      </div>
                      
                      {notification.actionUrl && notification.actionText && (
                        <button
                          onClick={() => {
                            markAsRead(notification.id)
                            // Navigate to actionUrl
                            window.location.href = notification.actionUrl!
                          }}
                          className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          {notification.actionText} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                // Navigate to full notifications page
                window.location.href = '/notifications'
              }}
              className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
