'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import '../styles/polls.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface Poll {
  id: string
  title: string
  description: string
  status: 'active' | 'closed' | 'draft'
  category: 'community' | 'technical' | 'business' | 'governance'
  createdBy: string
  createdAt: string
  endDate: string
  totalVotes: number
  options: Array<{
    id: string
    text: string
    votes: number
    percentage: number
  }>
  userVote?: string
}

export default function PollsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    category: 'community' as const,
    options: ['', '']
  })
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
        
        // Fetch polls data
        fetchPollsData()
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchPollsData = () => {
    // Mock polls data
    const mockPolls: Poll[] = [
      {
        id: '1',
        title: 'Platform Feature Priority',
        description: 'Which feature should we prioritize for the next SmartStart release?',
        status: 'active',
        category: 'technical',
        createdBy: 'admin@smartstart.com',
        createdAt: '2024-01-15',
        endDate: '2024-02-15',
        totalVotes: 24,
        options: [
          { id: '1a', text: 'Advanced RBAC Controls', votes: 12, percentage: 50 },
          { id: '1b', text: 'Real-time Notifications', votes: 8, percentage: 33 },
          { id: '1c', text: 'Mobile App Development', votes: 4, percentage: 17 }
        ]
      },
      {
        id: '2',
        title: 'Community Meeting Schedule',
        description: 'When should we hold our monthly community meeting?',
        status: 'active',
        category: 'community',
        createdBy: 'owner@demo.local',
        createdAt: '2024-01-20',
        endDate: '2024-01-30',
        totalVotes: 18,
        options: [
          { id: '2a', text: 'First Monday of month', votes: 10, percentage: 56 },
          { id: '2b', text: 'Second Wednesday of month', votes: 6, percentage: 33 },
          { id: '2c', text: 'Last Friday of month', votes: 2, percentage: 11 }
        ]
      },
      {
        id: '3',
        title: 'New Project Funding',
        description: 'Should we allocate funds for the AI Marketing Tool project?',
        status: 'active',
        category: 'business',
        createdBy: 'contrib@demo.local',
        createdAt: '2024-01-25',
        endDate: '2024-02-10',
        totalVotes: 15,
        options: [
          { id: '3a', text: 'Yes, allocate $50K', votes: 11, percentage: 73 },
          { id: '3b', text: 'Yes, but only $25K', votes: 3, percentage: 20 },
          { id: '3c', text: 'No, wait for more validation', votes: 1, percentage: 7 }
        ]
      }
    ]
    
    setPolls(mockPolls)
    setLoading(false)
  }

  const handleVote = async (pollId: string, optionId: string) => {
    // Mock vote submission
    setPolls(prevPolls => 
      prevPolls.map(poll => {
        if (poll.id === pollId) {
          const updatedOptions = poll.options.map(option => {
            if (option.id === optionId) {
              return { ...option, votes: option.votes + 1 }
            }
            return option
          })
          
          const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0)
          const optionsWithPercentages = updatedOptions.map(option => ({
            ...option,
            percentage: Math.round((option.votes / totalVotes) * 100)
          }))
          
          return {
            ...poll,
            totalVotes,
            options: optionsWithPercentages,
            userVote: optionId
          }
        }
        return poll
      })
    )
  }

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const poll: Poll = {
      id: Date.now().toString(),
      title: newPoll.title,
      description: newPoll.description,
      status: 'active',
      category: newPoll.category,
      createdBy: user?.email || 'Unknown',
      createdAt: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalVotes: 0,
      options: newPoll.options.filter(opt => opt.trim()).map((opt, index) => ({
        id: `${Date.now()}-${index}`,
        text: opt,
        votes: 0,
        percentage: 0
      }))
    }
    
    setPolls(prev => [poll, ...prev])
    setShowCreateForm(false)
    setNewPoll({ title: '', description: '', category: 'community', options: ['', ''] })
  }

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  if (loading) {
    return (
      <AppLayout currentPage="/polls">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading Community Polls...</span>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/polls">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view community polls.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/polls">
      <div className="page-header">
        <h1 className="page-title">Community Polls</h1>
        <p className="page-subtitle">Participate in community decisions and shape the future of SmartStart</p>
      </div>

      {/* Create Poll Button */}
      <div className="create-poll-section">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          <span>{showCreateForm ? 'Cancel' : 'Create New Poll'}</span>
        </button>
      </div>

      {/* Create Poll Form */}
      {showCreateForm && (
        <div className="card create-poll-form">
          <div className="card-header">
            <h3 className="card-title">Create New Poll</h3>
            <p className="card-subtitle">Start a community discussion</p>
          </div>
          
          <form onSubmit={handleCreatePoll} className="poll-form">
            <div className="form-group">
              <label htmlFor="poll-title" className="form-label">Poll Title</label>
              <input
                type="text"
                id="poll-title"
                value={newPoll.title}
                onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                required
                className="form-input"
                placeholder="Enter poll title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="poll-description" className="form-label">Description</label>
              <textarea
                id="poll-description"
                value={newPoll.description}
                onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                required
                className="form-textarea"
                placeholder="Describe what this poll is about"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="poll-category" className="form-label">Category</label>
              <select
                id="poll-category"
                value={newPoll.category}
                onChange={(e) => setNewPoll(prev => ({ ...prev, category: e.target.value as any }))}
                className="form-select"
              >
                <option value="community">Community</option>
                <option value="technical">Technical</option>
                <option value="business">Business</option>
                <option value="governance">Governance</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Poll Options</label>
              <div className="options-list">
                {newPoll.options.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      required
                      className="form-input"
                      placeholder={`Option ${index + 1}`}
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="remove-option-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="add-option-btn"
                >
                  + Add Option
                </button>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <span>Create Poll</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Polls Grid */}
      <div className="polls-grid">
        {polls.map((poll) => (
          <div key={poll.id} className="poll-card">
            <div className="poll-header">
              <div className="poll-info">
                <h3 className="poll-title">{poll.title}</h3>
                <p className="poll-description">{poll.description}</p>
              </div>
              <div className="poll-badges">
                <span className={`status-badge status-${poll.status}`}>
                  {poll.status}
                </span>
                <span className={`category-badge category-${poll.category}`}>
                  {poll.category}
                </span>
              </div>
            </div>

            <div className="poll-meta">
              <div className="meta-item">
                <span className="meta-label">Created by:</span>
                <span className="meta-value">{poll.createdBy}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Ends:</span>
                <span className="meta-value">{new Date(poll.endDate).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total votes:</span>
                <span className="meta-value">{poll.totalVotes}</span>
              </div>
            </div>

            <div className="poll-options">
              {poll.options.map((option) => (
                <div key={option.id} className="poll-option">
                  <div className="option-header">
                    <label className="option-label">
                      <input
                        type="radio"
                        name={`poll-${poll.id}`}
                        value={option.id}
                        checked={poll.userVote === option.id}
                        onChange={() => handleVote(poll.id, option.id)}
                        className="option-radio"
                      />
                      <span className="option-text">{option.text}</span>
                    </label>
                    <span className="option-votes">{option.votes} votes</span>
                  </div>
                  <div className="option-bar">
                    <div 
                      className="option-fill"
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                  </div>
                  <span className="option-percentage">{option.percentage}%</span>
                </div>
              ))}
            </div>

            <div className="poll-footer">
              <span className="poll-date">
                Created {new Date(poll.createdAt).toLocaleDateString()}
              </span>
              {poll.userVote && (
                <span className="user-vote-indicator">
                  ✓ You voted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {polls.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h3 className="empty-title">No polls yet</h3>
          <p className="empty-description">
            Be the first to create a community poll!
          </p>
        </div>
      )}
    </AppLayout>
  )
}
