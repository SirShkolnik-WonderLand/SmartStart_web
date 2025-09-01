'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import { apiCallWithAuth } from '../utils/api'
import '../styles/mesh.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface MeshItem {
  id: string
  type: 'win' | 'milestone' | 'need_help' | 'kudos' | 'idea_spark' | 'poll_active' | 'sprint_update'
  title: string
  description: string
  author: {
    id: string
    name: string
    role: string
    avatar: string
  }
  project?: {
    id: string
    name: string
    color: string
  }
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  relevantUsers: string[]
  actionItems?: string[]
  reactions: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  metadata?: {
    equityEarned?: number
    sprintNumber?: number
    milestoneName?: string
    helpType?: string
    skillNeeded?: string
  }
}

interface CommunityInsight {
  type: 'trending' | 'opportunity' | 'collaboration' | 'milestone'
  title: string
  description: string
  priority: number
  relevantUsers: string[]
  actionItems: string[]
  confidence: number
}

export default function MeshPage() {
  const [user, setUser] = useState<User | null>(null)
  const [meshItems, setMeshItems] = useState<MeshItem[]>([])
  const [insights, setInsights] = useState<CommunityInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [authToken, setAuthToken] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = () => {
      const cookies = document.cookie.split(';')
      const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!userCookie || !tokenCookie) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userCookie.split('=')[1])
        const token = tokenCookie.split('=')[1]
        setUser(userData)
        setAuthToken(token)
        
        // Fetch mesh data
        fetchMeshData(token)
        fetchCommunityInsights(token)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchMeshData = async (token: string) => {
    try {
      
      // Fetch mesh items from API
      try {
        const data = await apiCallWithAuth('/mesh/items', token)
        if (data && Array.isArray(data)) {
          setMeshItems(data)
        } else {
          setMeshItems([])
        }
      } catch (error) {
        console.error('Failed to fetch mesh data')
        setMeshItems([])
      }
    } catch (error) {
      console.error('Error fetching mesh data:', error)
      setMeshItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityInsights = async (token: string) => {
    try {
      
      // Fetch insights from API
      try {
        const data = await apiCallWithAuth('/mesh/insights', token)
        if (data && Array.isArray(data)) {
          setInsights(data)
        } else {
          setInsights([])
        }
      } catch (error) {
        console.error('Failed to fetch insights')
        setInsights([])
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      setInsights([])
    }
  }

  const handleReaction = async (itemId: string, emoji: string) => {
    try {
      if (!authToken) {
        router.push('/login')
        return
      }
      
      // Add reaction via API
      await apiCallWithAuth(`/mesh/items/${itemId}/reactions`, authToken, {
        method: 'POST',
        body: JSON.stringify({ emoji })
      })

      // Refresh mesh data to get updated reactions
      await fetchMeshData(authToken)
    } catch (error) {
      console.error('Error adding reaction:', error)
      // Fallback to local state update
      setMeshItems(prev => 
        prev.map(item => {
          if (item.id === itemId) {
            const existingReaction = item.reactions.find(r => r.emoji === emoji)
            
            if (existingReaction) {
              return {
                ...item,
                reactions: item.reactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, users: [...r.users, user?.id || 'unknown'] }
                    : r
                )
              }
            } else {
              return {
                ...item,
                reactions: [...item.reactions, { 
                  emoji, 
                  count: 1, 
                  users: [user?.id || 'unknown'] 
                }]
              }
            }
          }
          return item
        })
      )
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'win': return '🏆'
      case 'milestone': return '🎯'
      case 'need_help': return '🤝'
      case 'kudos': return '👏'
      case 'idea_spark': return '💡'
      case 'poll_active': return '🗳️'
      case 'sprint_update': return '🚀'
      default: return '📝'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'win': return 'type-win'
      case 'milestone': return 'type-milestone'
      case 'need_help': return 'type-need-help'
      case 'kudos': return 'type-kudos'
      case 'idea_spark': return 'type-idea-spark'
      case 'poll_active': return 'type-poll-active'
      case 'sprint_update': return 'type-sprint-update'
      default: return 'type-default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'priority-low'
      case 'medium': return 'priority-medium'
      case 'high': return 'priority-high'
      case 'critical': return 'priority-critical'
      default: return 'priority-medium'
    }
  }

  // Filter items based on search and filter
  const filteredItems = meshItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || item.type === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <AppLayout currentPage="/mesh">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading Community Mesh...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/mesh">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view the community mesh.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/mesh">
      <div className="page-header">
        <h1 className="page-title">Community Mesh</h1>
        <p className="page-subtitle">Live community pulse, wins, milestones, and collaboration opportunities</p>
      </div>

      <div className="mesh-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search mesh items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Items</option>
            <option value="win">Wins & Celebrations</option>
            <option value="milestone">Milestones</option>
            <option value="need_help">Needs Help</option>
            <option value="kudos">Kudos & Recognition</option>
            <option value="idea_spark">Idea Sparks</option>
            <option value="poll_active">Active Polls</option>
            <option value="sprint_update">Sprint Updates</option>
          </select>
        </div>
      </div>

      <div className="mesh-layout">
        {/* Community Insights */}
        <div className="insights-section">
          <h2 className="section-title">Community Intelligence</h2>
          <div className="insights-grid">
            {insights.map((insight) => (
              <div key={insight.type} className="insight-card">
                <div className="insight-header">
                  <span className={`insight-type insight-type-${insight.type}`}>
                    {insight.type === 'trending' && '📈'}
                    {insight.type === 'opportunity' && '🎯'}
                    {insight.type === 'collaboration' && '🤝'}
                    {insight.type === 'milestone' && '🏆'}
                  </span>
                  <span className="insight-confidence">{Math.round(insight.confidence * 100)}%</span>
                </div>
                <h3 className="insight-title">{insight.title}</h3>
                <p className="insight-description">{insight.description}</p>
                <div className="insight-actions">
                  {insight.actionItems.map((action, index) => (
                    <span key={index} className="action-item">• {action}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mesh Feed */}
        <div className="mesh-feed">
          <h2 className="section-title">Live Community Feed</h2>
          <div className="mesh-items">
            {filteredItems.map((item) => (
              <div key={item.id} className="mesh-item">
                <div className="item-header">
                  <div className="item-type">
                    <span className={`type-icon ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </span>
                    <span className={`type-label ${getTypeColor(item.type)}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="item-priority">
                    <span className={`priority-badge ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <div className="item-content">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">{item.description}</p>
                  
                  {item.project && (
                    <div className="item-project">
                      <span className="project-tag" style={{ backgroundColor: item.project.color }}>
                        {item.project.name}
                      </span>
                    </div>
                  )}

                  {item.metadata && (
                    <div className="item-metadata">
                      {item.metadata.equityEarned && (
                        <span className="metadata-item">
                          <span className="metadata-label">Equity Earned:</span>
                          <span className="metadata-value">{item.metadata.equityEarned}%</span>
                        </span>
                      )}
                      {item.metadata.sprintNumber && (
                        <span className="metadata-item">
                          <span className="metadata-label">Sprint:</span>
                          <span className="metadata-value">#{item.metadata.sprintNumber}</span>
                        </span>
                      )}
                      {item.metadata.helpType && (
                        <span className="metadata-item">
                          <span className="metadata-label">Help Type:</span>
                          <span className="metadata-value">{item.metadata.helpType}</span>
                        </span>
                      )}
                      {item.metadata.skillNeeded && (
                        <span className="metadata-item">
                          <span className="metadata-label">Skills:</span>
                          <span className="metadata-value">{item.metadata.skillNeeded}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {item.actionItems && (
                    <div className="item-actions">
                      <h4 className="actions-title">Action Items:</h4>
                      <div className="actions-list">
                        {item.actionItems.map((action, index) => (
                          <span key={index} className="action-item">• {action}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="item-footer">
                  <div className="item-author">
                    <div className="author-avatar">{item.author.avatar}</div>
                    <div className="author-info">
                      <span className="author-name">{item.author.name}</span>
                      <span className="author-role">{item.author.role}</span>
                    </div>
                  </div>
                  
                  <div className="item-reactions">
                    {item.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => handleReaction(item.id, reaction.emoji)}
                        className="reaction-button"
                      >
                        <span className="reaction-emoji">{reaction.emoji}</span>
                        <span className="reaction-count">{reaction.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="item-time">
                    {new Date(item.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No items found</h3>
              <p className="empty-description">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
