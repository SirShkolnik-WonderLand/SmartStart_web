'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
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
        setUser(userData)
        
        // Fetch mesh data
        fetchMeshData()
        fetchCommunityInsights()
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchMeshData = async () => {
    try {
      // Get auth token from cookies
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!tokenCookie) {
        router.push('/login')
        return
      }

      const token = tokenCookie.split('=')[1]
      
      // Fetch mesh items from API
      const response = await fetch('/api/mesh/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMeshItems(data)
      } else {
        console.error('Failed to fetch mesh data')
        // Fallback to mock data
        setMeshItems(getMockMeshItems())
      }
    } catch (error) {
      console.error('Error fetching mesh data:', error)
      // Fallback to mock data
      setMeshItems(getMockMeshItems())
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityInsights = async () => {
    try {
      // Get auth token from cookies
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!tokenCookie) {
        router.push('/login')
        return
      }

      const token = tokenCookie.split('=')[1]
      
      // Fetch insights from API
      const response = await fetch('/api/mesh/insights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      } else {
        console.error('Failed to fetch insights')
        // Fallback to mock data
        setInsights(getMockInsights())
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      // Fallback to mock data
      setInsights(getMockInsights())
    }
  }

  const getMockMeshItems = (): MeshItem[] => {
    return [
      {
        id: '1',
        type: 'win',
        title: 'Project Alpha Launched Successfully!',
        description: 'After 3 months of hard work, we finally launched our MVP and got our first 100 users!',
        author: {
          id: 'user-1',
          name: 'Sarah Chen',
          role: 'Project Lead',
          avatar: '👩‍💼'
        },
        project: {
          id: 'project-1',
          name: 'Alpha',
          color: '#4CAF50'
        },
        timestamp: '2024-01-15T10:30:00Z',
        priority: 'high',
        relevantUsers: ['user-1', 'user-2', 'user-3'],
        reactions: [
          { emoji: '🎉', count: 12, users: ['user-2', 'user-3', 'user-4'] },
          { emoji: '🚀', count: 8, users: ['user-1', 'user-5'] }
        ],
        metadata: {
          equityEarned: 15,
          sprintNumber: 6
        }
      },
      {
        id: '2',
        type: 'need_help',
        title: 'Need Frontend Developer for Beta Project',
        description: 'Looking for a React/TypeScript developer to help with our beta launch. 2-3 weeks commitment.',
        author: {
          id: 'user-2',
          name: 'Mike Johnson',
          role: 'Tech Lead',
          avatar: '👨‍💻'
        },
        project: {
          id: 'project-2',
          name: 'Beta',
          color: '#2196F3'
        },
        timestamp: '2024-01-15T09:15:00Z',
        priority: 'critical',
        relevantUsers: ['user-2', 'user-6', 'user-7'],
        reactions: [
          { emoji: '🤝', count: 5, users: ['user-6', 'user-7'] },
          { emoji: '💡', count: 3, users: ['user-8'] }
        ],
        metadata: {
          helpType: 'Development',
          skillNeeded: 'React, TypeScript, UI/UX'
        },
        actionItems: [
          'Review project requirements',
          'Schedule technical interview',
          'Define equity split'
        ]
      },
      {
        id: '3',
        type: 'milestone',
        title: 'Reached 50% Equity Distribution',
        description: 'Successfully distributed equity to 15 team members across 3 projects. Great milestone for our community!',
        author: {
          id: 'user-3',
          name: 'Alex Rodriguez',
          role: 'Community Manager',
          avatar: '👨‍💼'
        },
        timestamp: '2024-01-15T08:45:00Z',
        priority: 'medium',
        relevantUsers: ['user-3', 'user-9', 'user-10'],
        reactions: [
          { emoji: '🏆', count: 18, users: ['user-9', 'user-10', 'user-11'] },
          { emoji: '💰', count: 7, users: ['user-12', 'user-13'] }
        ],
        metadata: {
          milestoneName: 'Equity Distribution'
        }
      }
    ]
  }

  const getMockInsights = (): CommunityInsight[] => {
    return [
      {
        type: 'trending',
        title: 'AI & Machine Learning Projects',
        description: '3 out of 5 active projects involve AI/ML components. Community interest in AI is at an all-time high.',
        priority: 8,
        confidence: 0.85,
        relevantUsers: ['user-1', 'user-4', 'user-6'],
        actionItems: [
          'Consider AI-focused community challenge',
          'Share AI/ML resources',
          'Connect AI enthusiasts'
        ]
      },
      {
        type: 'opportunity',
        title: 'Growth Marketing Skills Gap',
        description: 'Multiple projects seeking growth marketing help. Consider organizing a growth sprint or skill-sharing session.',
        priority: 9,
        confidence: 0.92,
        relevantUsers: ['user-2', 'user-5'],
        actionItems: [
          'Organize growth marketing workshop',
          'Create skill-sharing program',
          'Match projects with available talent'
        ]
      },
      {
        type: 'collaboration',
        title: 'Cross-Project Synergies',
        description: '2 projects could benefit from shared backend infrastructure. Opportunity for technical collaboration.',
        priority: 7,
        confidence: 0.78,
        relevantUsers: ['user-3', 'user-7', 'user-8'],
        actionItems: [
          'Schedule technical alignment meeting',
          'Explore shared infrastructure options',
          'Define collaboration framework'
        ]
      }
    ]
  }

  const handleReaction = async (itemId: string, emoji: string) => {
    try {
      // Get auth token from cookies
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!tokenCookie) {
        router.push('/login')
        return
      }

      const token = tokenCookie.split('=')[1]
      
      // Add reaction via API
      const response = await fetch(`/api/mesh/items/${itemId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      })

      if (!response.ok) {
        throw new Error('Failed to add reaction')
      }

      // Refresh mesh data to get updated reactions
      await fetchMeshData()
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
