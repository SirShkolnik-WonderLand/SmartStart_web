'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import { apiCallWithAuth } from '../utils/api'
import '../styles/ideas.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface Idea {
  id: string
  title: string
  description: string
  category: 'product' | 'feature' | 'business' | 'community' | 'technical'
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_progress'
  priority: 'low' | 'medium' | 'high' | 'critical'
  impact: 'low' | 'medium' | 'high' | 'transformative'
  submittedBy: {
    id: string
    name: string
    email: string
    role: string
  }
  submittedAt: string
  votes: {
    upvotes: number
    downvotes: number
    userVote?: 'up' | 'down' | null
  }
  tags: string[]
  estimatedEffort: '1-2 weeks' | '1 month' | '2-3 months' | '3+ months'
  estimatedValue: number
  team: string[]
  comments: Array<{
    id: string
    content: string
    author: {
      id: string
      name: string
      role: string
    }
    timestamp: string
  }>
}

export default function IdeasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'product' as const,
    priority: 'medium' as const,
    impact: 'medium' as const,
    tags: '',
    estimatedEffort: '1-2 weeks' as const,
    estimatedValue: 0
  })
  const router = useRouter()

  useEffect(() => {
    // Get user data from cookies
    const getUserFromCookies = async () => {
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
        
        // Fetch ideas data
        await fetchIdeasData()
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchIdeasData = async () => {
    // Mock ideas data
    const mockIdeas: Idea[] = [
      {
        id: '1',
        title: 'AI-Powered Project Matching',
        description: 'Develop an AI system that automatically matches community members with projects based on their skills, interests, and availability. This would increase project success rates and member engagement.',
        category: 'feature',
        status: 'under_review',
        priority: 'high',
        impact: 'high',
        submittedBy: {
          id: 'user-1',
          name: 'Alice Johnson',
          email: 'alice@smartstart.com',
          role: 'SUPER_ADMIN'
        },
        submittedAt: '2024-01-15T10:00:00Z',
        votes: {
          upvotes: 28,
          downvotes: 2,
          userVote: 'up'
        },
        tags: ['AI', 'Machine Learning', 'Project Management', 'User Experience'],
        estimatedEffort: '2-3 months',
        estimatedValue: 75000,
        team: ['AI Team', 'Frontend Team', 'Backend Team'],
        comments: [
          {
            id: 'c1',
            content: 'This would be a game-changer for our community! I love the idea of intelligent project matching.',
            author: {
              id: 'user-2',
              name: 'Bob Chen',
              role: 'ADMIN'
            },
            timestamp: '2024-01-16T14:30:00Z'
          },
          {
            id: 'c2',
            content: 'We should consider integrating this with our existing RBAC system for better permission management.',
            author: {
              id: 'user-3',
              name: 'Carol Rodriguez',
              role: 'OWNER'
            },
            timestamp: '2024-01-17T09:15:00Z'
          }
        ]
      },
      {
        id: '2',
        title: 'Community Marketplace',
        description: 'Create a marketplace where community members can offer and request services, skills, and resources. This would foster collaboration and create additional revenue streams.',
        category: 'business',
        status: 'approved',
        priority: 'medium',
        impact: 'high',
        submittedBy: {
          id: 'user-4',
          name: 'David Kim',
          email: 'david@demo.local',
          role: 'CONTRIBUTOR'
        },
        submittedAt: '2024-01-10T16:45:00Z',
        votes: {
          upvotes: 35,
          downvotes: 1,
          userVote: null
        },
        tags: ['Marketplace', 'E-commerce', 'Community', 'Monetization'],
        estimatedEffort: '3+ months',
        estimatedValue: 120000,
        team: ['Full-Stack Team', 'Design Team', 'Business Team'],
        comments: [
          {
            id: 'c3',
            content: 'This aligns perfectly with our community-driven approach. Great idea!',
            author: {
              id: 'user-1',
              name: 'Alice Johnson',
              role: 'SUPER_ADMIN'
            },
            timestamp: '2024-01-11T11:20:00Z'
          }
        ]
      },
      {
        id: '3',
        title: 'Advanced Analytics Dashboard',
        description: 'Build a comprehensive analytics dashboard that provides insights into project performance, member contributions, portfolio growth, and community health metrics.',
        category: 'feature',
        status: 'in_progress',
        priority: 'high',
        impact: 'medium',
        submittedBy: {
          id: 'user-5',
          name: 'Emma Wilson',
          email: 'emma@demo.local',
          role: 'MEMBER'
        },
        submittedAt: '2024-01-05T13:20:00Z',
        votes: {
          upvotes: 22,
          downvotes: 0,
          userVote: 'up'
        },
        tags: ['Analytics', 'Dashboard', 'Data Visualization', 'Business Intelligence'],
        estimatedEffort: '1 month',
        estimatedValue: 45000,
        team: ['Data Team', 'Frontend Team'],
        comments: []
      },
      {
        id: '4',
        title: 'Mobile App Development',
        description: 'Develop native mobile applications for iOS and Android to provide on-the-go access to SmartStart features, notifications, and project management.',
        category: 'product',
        status: 'draft',
        priority: 'medium',
        impact: 'high',
        submittedBy: {
          id: 'user-6',
          name: 'Frank Miller',
          email: 'frank@demo.local',
          role: 'VIEWER'
        },
        submittedAt: '2024-01-20T15:30:00Z',
        votes: {
          upvotes: 18,
          downvotes: 3,
          userVote: null
        },
        tags: ['Mobile', 'iOS', 'Android', 'React Native', 'User Experience'],
        estimatedEffort: '3+ months',
        estimatedValue: 95000,
        team: ['Mobile Team', 'Backend Team'],
        comments: []
      }
    ]
    
    setIdeas(mockIdeas)
    setFilteredIdeas(mockIdeas)
    setLoading(false)
  }

  useEffect(() => {
    // Filter ideas based on search and filters
    let filtered = ideas

    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(idea => idea.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(idea => idea.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(idea => idea.priority === priorityFilter)
    }

    setFilteredIdeas(filtered)
  }, [ideas, searchTerm, categoryFilter, statusFilter, priorityFilter])

  const handleVote = (ideaId: string, voteType: 'up' | 'down') => {
    setIdeas(prev => 
      prev.map(idea => {
        if (idea.id === ideaId) {
          const currentVote = idea.votes.userVote
          let upvotes = idea.votes.upvotes
          let downvotes = idea.votes.downvotes
          let userVote: 'up' | 'down' | null = voteType

          if (currentVote === voteType) {
            // Remove vote
            if (voteType === 'up') upvotes--
            else downvotes--
            userVote = null
          } else if (currentVote === null) {
            // Add new vote
            if (voteType === 'up') upvotes++
            else downvotes++
          } else {
            // Change vote
            if (currentVote === 'up') upvotes--
            else downvotes--
            if (voteType === 'up') upvotes++
            else downvotes++
          }

          return {
            ...idea,
            votes: { upvotes, downvotes, userVote }
          }
        }
        return idea
      })
    )
  }

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    const idea: Idea = {
      id: Date.now().toString(),
      title: newIdea.title,
      description: newIdea.description,
      category: newIdea.category,
      status: 'submitted',
      priority: newIdea.priority,
      impact: newIdea.impact,
      submittedBy: {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role
      },
      submittedAt: new Date().toISOString(),
      votes: {
        upvotes: 0,
        downvotes: 0,
        userVote: null
      },
      tags: newIdea.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      estimatedEffort: newIdea.estimatedEffort,
      estimatedValue: newIdea.estimatedValue,
      team: [],
      comments: []
    }
    
    setIdeas(prev => [idea, ...prev])
    setShowCreateForm(false)
    setNewIdea({
      title: '',
      description: '',
      category: 'product',
      priority: 'medium',
      impact: 'medium',
      tags: '',
      estimatedEffort: '1-2 weeks',
      estimatedValue: 0
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'status-draft'
      case 'submitted': return 'status-submitted'
      case 'under_review': return 'status-under-review'
      case 'approved': return 'status-approved'
      case 'rejected': return 'status-rejected'
      case 'in_progress': return 'status-in-progress'
      default: return 'status-default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'priority-low'
      case 'medium': return 'priority-medium'
      case 'high': return 'priority-high'
      case 'critical': return 'priority-critical'
      default: return 'priority-default'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'impact-low'
      case 'medium': return 'impact-medium'
      case 'high': return 'impact-high'
      case 'transformative': return 'impact-transformative'
      default: return 'impact-default'
    }
  }

  if (loading) {
    return (
      <AppLayout currentPage="/ideas">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading Innovation Hub...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/ideas">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view the innovation hub.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/ideas">
      <div className="page-header">
        <h1 className="page-title">Innovation Hub</h1>
        <p className="page-subtitle">Submit, vote, and discuss ideas that shape the future of SmartStart</p>
      </div>

      {/* Create Idea Button */}
      <div className="create-idea-section">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          <span>{showCreateForm ? 'Cancel' : 'Submit New Idea'}</span>
        </button>
      </div>

      {/* Create Idea Form */}
      {showCreateForm && (
        <div className="card create-idea-form">
          <div className="card-header">
            <h3 className="card-title">Submit New Idea</h3>
            <p className="card-subtitle">Share your vision with the community</p>
          </div>
          
          <form onSubmit={handleCreateIdea} className="idea-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idea-title" className="form-label">Idea Title</label>
                <input
                  type="text"
                  id="idea-title"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="form-input"
                  placeholder="Enter a clear, descriptive title"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idea-description" className="form-label">Description</label>
                <textarea
                  id="idea-description"
                  value={newIdea.description}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="form-textarea"
                  placeholder="Describe your idea in detail, including benefits and implementation approach"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idea-category" className="form-label">Category</label>
                <select
                  id="idea-category"
                  value={newIdea.category}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, category: e.target.value as any }))}
                  className="form-select"
                >
                  <option value="product">Product</option>
                  <option value="feature">Feature</option>
                  <option value="business">Business</option>
                  <option value="community">Community</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="idea-priority" className="form-label">Priority</label>
                <select
                  id="idea-priority"
                  value={newIdea.priority}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="idea-impact" className="form-label">Impact</label>
                <select
                  id="idea-impact"
                  value={newIdea.impact}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, impact: e.target.value as any }))}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="transformative">Transformative</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idea-tags" className="form-label">Tags</label>
                <input
                  type="text"
                  id="idea-tags"
                  value={newIdea.tags}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, tags: e.target.value }))}
                  className="form-input"
                  placeholder="Enter tags separated by commas (e.g., AI, Mobile, UX)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="idea-effort" className="form-label">Estimated Effort</label>
                <select
                  id="idea-effort"
                  value={newIdea.estimatedEffort}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, estimatedEffort: e.target.value as any }))}
                  className="form-select"
                >
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2-3 months">2-3 months</option>
                  <option value="3+ months">3+ months</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="idea-value" className="form-label">Estimated Value ($)</label>
                <input
                  type="number"
                  id="idea-value"
                  value={newIdea.estimatedValue}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, estimatedValue: parseInt(e.target.value) || 0 }))}
                  className="form-input"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <span>Submit Idea</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search ideas by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters-container">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="product">Product</option>
            <option value="feature">Feature</option>
            <option value="business">Business</option>
            <option value="community">Community</option>
            <option value="technical">Technical</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="in_progress">In Progress</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="ideas-grid">
        {filteredIdeas.map((idea) => (
          <div key={idea.id} className="idea-card">
            <div className="idea-header">
              <div className="idea-info">
                <h3 className="idea-title">{idea.title}</h3>
                <p className="idea-description">{idea.description}</p>
              </div>
              <div className="idea-badges">
                <span className={`status-badge ${getStatusColor(idea.status)}`}>
                  {idea.status.replace('_', ' ')}
                </span>
                <span className={`priority-badge ${getPriorityColor(idea.priority)}`}>
                  {idea.priority}
                </span>
                <span className={`impact-badge ${getImpactColor(idea.impact)}`}>
                  {idea.impact}
                </span>
              </div>
            </div>

            <div className="idea-meta">
              <div className="meta-item">
                <span className="meta-label">Submitted by:</span>
                <span className="meta-value">{idea.submittedBy.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{idea.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Submitted:</span>
                <span className="meta-value">{new Date(idea.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="idea-tags">
              {idea.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="idea-stats">
              <div className="stat-item">
                <div className="stat-value">{idea.votes.upvotes - idea.votes.downvotes}</div>
                <div className="stat-label">Net Votes</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{idea.estimatedEffort}</div>
                <div className="stat-label">Effort</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">${idea.estimatedValue.toLocaleString()}</div>
                <div className="stat-label">Value</div>
              </div>
            </div>

            <div className="idea-voting">
              <button
                onClick={() => handleVote(idea.id, 'up')}
                className={`vote-button vote-up ${idea.votes.userVote === 'up' ? 'active' : ''}`}
              >
                <span>👍</span>
                <span className="vote-count">{idea.votes.upvotes}</span>
              </button>
              <button
                onClick={() => handleVote(idea.id, 'down')}
                className={`vote-button vote-down ${idea.votes.userVote === 'down' ? 'active' : ''}`}
              >
                <span>👎</span>
                <span className="vote-count">{idea.votes.downvotes}</span>
              </button>
            </div>

            {idea.comments.length > 0 && (
              <div className="idea-comments">
                <h4 className="comments-title">Comments ({idea.comments.length})</h4>
                <div className="comments-list">
                  {idea.comments.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author.name}</span>
                        <span className="comment-role">{comment.author.role}</span>
                        <span className="comment-time">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
                  {idea.comments.length > 2 && (
                    <div className="more-comments">
                      +{idea.comments.length - 2} more comments
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIdeas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3 className="empty-title">No ideas found</h3>
          <p className="empty-description">
            Try adjusting your search terms or filters, or be the first to submit an idea!
          </p>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {filteredIdeas.length} of {ideas.length} ideas</p>
      </div>
    </AppLayout>
  )
}
