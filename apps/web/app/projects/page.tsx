'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../components/AppLayout'
import { apiCallWithAuth } from '../utils/api'
import '../styles/projects.css'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface Project {
  id: string
  name: string
  role: string
  ownership: number
  project: {
    id: string
    name: string
    summary?: string
    currentSprint: number
    totalSprints: number
    sprintStatus: string
    currentPhase: string
    targetLaunchDate?: string
    actualLaunchDate?: string
  }
}

interface ProjectSubmission {
  id: string
  title: string
  description: string
  category: string
  status: string
  ownerEquityProposal: number
  aliceEquityProposal: number
  contributorEquityPool: number
  reserveEquity: number
  sprintGoals: string[]
  keyMilestones: string[]
  successMetrics: string[]
  requiredSkills: string[]
  marketingStrategy?: string
  launchChannels: string[]
  pricingStrategy?: string
  submittedAt: string
}

export default function ProjectsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'projects' | 'submissions' | 'create'>('projects')
  const router = useRouter()

  // Project submission form state
  const [submissionForm, setSubmissionForm] = useState({
    title: '',
    description: '',
    category: 'SAAS',
    marketSize: '',
    targetAudience: '',
    competitiveAdvantage: '',
    revenueModel: '',
    estimatedFunding: 0,
    timeline: '',
    ownerEquityProposal: 40,
    aliceEquityProposal: 20,
    contributorEquityPool: 25,
    reserveEquity: 15,
    marketValidation: '',
    technicalFeasibility: '',
    financialProjections: '',
    sprintGoals: [''],
    keyMilestones: [''],
    successMetrics: [''],
    requiredSkills: [''],
    teamSize: 3,
    timeCommitment: '10-15 hours/week',
    marketingStrategy: '',
    launchChannels: [''],
    pricingStrategy: ''
  })

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
        
        // Fetch user projects and submissions
        await fetchUserProjects(userData.id, tokenCookie.split('=')[1])
        if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
          await fetchSubmissions(tokenCookie.split('=')[1])
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }

    getUserFromCookies()
  }, [router])

  const fetchUserProjects = async (userId: string, token: string) => {
    try {
      const projectsResponse = await apiCallWithAuth('/projects', token)
      setProjects(projectsResponse || [])
    } catch (error) {
      console.error('Error fetching user projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async (token: string) => {
    try {
      const submissionsResponse = await apiCallWithAuth('/projects/submissions', token)
      setSubmissions(submissionsResponse || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setSubmissions([])
    }
  }

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    try {
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
      
      if (!tokenCookie) {
        router.push('/login')
        return
      }

      const token = tokenCookie.split('=')[1]
      
      // Validate equity totals
      const totalEquity = submissionForm.ownerEquityProposal + 
                         submissionForm.aliceEquityProposal + 
                         submissionForm.contributorEquityPool + 
                         submissionForm.reserveEquity

      if (totalEquity !== 100) {
        alert('Equity percentages must total 100%')
        return
      }

      if (submissionForm.ownerEquityProposal < 35) {
        alert('Owner must retain minimum 35% equity')
        return
      }

      if (submissionForm.aliceEquityProposal > 25) {
        alert('AliceSolutions cannot exceed 25% equity')
        return
      }

      // Submit the project
      const response = await apiCallWithAuth('/projects/submit', token, {
        method: 'POST',
        body: JSON.stringify(submissionForm)
      })

      if (response) {
        alert('Project submitted successfully! It will be reviewed by the team.')
        setShowSubmissionForm(false)
        setActiveTab('projects')
        // Reset form
        setSubmissionForm({
          title: '',
          description: '',
          category: 'SAAS',
          marketSize: '',
          targetAudience: '',
          competitiveAdvantage: '',
          revenueModel: '',
          estimatedFunding: 0,
          timeline: '',
          ownerEquityProposal: 40,
          aliceEquityProposal: 20,
          contributorEquityPool: 25,
          reserveEquity: 15,
          marketValidation: '',
          technicalFeasibility: '',
          financialProjections: '',
          sprintGoals: [''],
          keyMilestones: [''],
          successMetrics: [''],
          requiredSkills: [''],
          teamSize: 3,
          timeCommitment: '10-15 hours/week',
          marketingStrategy: '',
          launchChannels: [''],
          pricingStrategy: ''
        })
      }
    } catch (error) {
      console.error('Error submitting project:', error)
      alert('Failed to submit project. Please try again.')
    }
  }

  const addArrayField = (field: keyof typeof submissionForm, value: string) => {
    setSubmissionForm(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }))
  }

  const removeArrayField = (field: keyof typeof submissionForm, index: number) => {
    setSubmissionForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const updateArrayField = (field: keyof typeof submissionForm, index: number, value: string) => {
    setSubmissionForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }))
  }

  if (loading) {
    return (
      <AppLayout currentPage="/projects">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading Projects...</p>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout currentPage="/projects">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>Please log in to view projects.</p>
          <button 
            onClick={() => router.push('/login')}
            className="button button-primary"
          >
            Back to Login
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="/projects">
      <div className="page-header">
        <h1 className="page-title">
          Projects & Launch Pipeline
        </h1>
        <p className="page-subtitle">
          Submit new project ideas, manage your portfolio, and track 30-day launches
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="projects-tabs">
        <button 
          className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          My Projects ({projects.length})
        </button>
        <button 
          className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions ({submissions.length})
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Submit New Project
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'projects' && (
        <div className="projects-tab">
          <div className="projects-overview">
            <div className="overview-card">
              <h3>Portfolio Overview</h3>
              <div className="overview-stats">
                <div className="stat-item">
                  <span className="stat-value">{projects.length}</span>
                  <span className="stat-label">Active Projects</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {projects.reduce((sum, p) => sum + p.ownership, 0)}%
                  </span>
                  <span className="stat-label">Total Ownership</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {projects.filter(p => p.project.sprintStatus === 'ACTIVE').length}
                  </span>
                  <span className="stat-label">Active Sprints</span>
                </div>
              </div>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="projects-grid">
              {projects.map((project, index) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3 className="project-name">{project.project.name}</h3>
                    <span className={`project-role role-${project.role.toLowerCase()}`}>
                      {project.role}
                    </span>
                  </div>
                  
                  <div className="project-content">
                    <div className="project-stats">
                      <div className="stat-row">
                        <span className="stat-label">Your Ownership:</span>
                        <span className="stat-value ownership">{project.ownership}%</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Current Sprint:</span>
                        <span className="stat-value">{project.project.currentSprint}/{project.project.totalSprints}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Phase:</span>
                        <span className="stat-value">{project.project.currentPhase}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Status:</span>
                        <span className="stat-value">{project.project.sprintStatus}</span>
                      </div>
                    </div>
                    
                    {project.project.targetLaunchDate && (
                      <div className="launch-info">
                        <span className="launch-label">Target Launch:</span>
                        <span className="launch-date">
                          {new Date(project.project.targetLaunchDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="project-actions">
                      <button className="button button-primary">View Details</button>
                      <button className="button button-secondary">Sprint Board</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🚀</div>
              <h3 className="empty-title">No projects yet</h3>
              <p className="empty-description">
                Submit your first project idea to get started with the 30-day launch pipeline!
              </p>
              <button 
                className="button button-primary"
                onClick={() => setActiveTab('create')}
              >
                Submit Project Idea
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="submissions-tab">
          {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
            <div className="submissions-list">
              <h3>Project Submissions for Review</h3>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <div key={submission.id} className="submission-card">
                    <div className="submission-header">
                      <h4>{submission.title}</h4>
                      <span className={`status-badge status-${submission.status.toLowerCase()}`}>
                        {submission.status}
                      </span>
                    </div>
                    <p className="submission-description">{submission.description}</p>
                    <div className="submission-details">
                      <div className="detail-item">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">{submission.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Equity Split:</span>
                        <span className="detail-value">
                          Owner: {submission.ownerEquityProposal}% | 
                          Alice: {submission.aliceEquityProposal}% | 
                          Contributors: {submission.contributorEquityPool}% | 
                          Reserve: {submission.reserveEquity}%
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Submitted:</span>
                        <span className="detail-value">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="submission-actions">
                      <button className="button button-primary">Review & Approve</button>
                      <button className="button button-secondary">Request Changes</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No submissions to review</p>
              )}
            </div>
          ) : (
            <div className="access-denied">
              <h3>Access Denied</h3>
              <p>Only administrators can review project submissions.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-tab">
          <div className="submission-form-container">
            <h3>Submit New Project for 30-Day Launch</h3>
            <p className="form-subtitle">
              Follow the AliceSolutions Ventures equity framework: Owner (min 35%), AliceSolutions (max 25%), Contributors, and Reserve
            </p>
            
            <form onSubmit={handleSubmissionSubmit} className="submission-form">
              {/* Basic Project Information */}
              <div className="form-section">
                <h4>Project Basics</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Project Title *</label>
                    <input
                      type="text"
                      id="title"
                      value={submissionForm.title}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="form-input"
                      placeholder="Enter your project name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      value={submissionForm.category}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, category: e.target.value }))}
                      className="form-select"
                    >
                      <option value="SAAS">SaaS</option>
                      <option value="MOBILE_APP">Mobile App</option>
                      <option value="ECOMMERCE">E-commerce</option>
                      <option value="MARKETPLACE">Marketplace</option>
                      <option value="AI_ML">AI/ML</option>
                      <option value="BLOCKCHAIN">Blockchain</option>
                      <option value="HEALTHTECH">HealthTech</option>
                      <option value="FINTECH">FinTech</option>
                      <option value="EDUTECH">EduTech</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Project Description *</label>
                  <textarea
                    id="description"
                    value={submissionForm.description}
                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    className="form-textarea"
                    placeholder="Describe your project idea, problem it solves, and target market"
                    rows={4}
                  />
                </div>
              </div>

              {/* Equity Proposal */}
              <div className="form-section">
                <h4>Equity Proposal (Must Total 100%)</h4>
                <div className="equity-grid">
                  <div className="equity-item">
                    <label htmlFor="ownerEquity">Owner Equity *</label>
                    <input
                      type="number"
                      id="ownerEquity"
                      value={submissionForm.ownerEquityProposal}
                      onChange={(e) => setSubmissionForm(prev => ({ 
                        ...prev, 
                        ownerEquityProposal: parseFloat(e.target.value) || 0 
                      }))}
                      min="35"
                      max="100"
                      required
                      className="form-input"
                    />
                    <small>Minimum 35% required</small>
                  </div>
                  
                  <div className="equity-item">
                    <label htmlFor="aliceEquity">AliceSolutions Equity *</label>
                    <input
                      type="number"
                      id="aliceEquity"
                      value={submissionForm.aliceEquityProposal}
                      onChange={(e) => setSubmissionForm(prev => ({ 
                        ...prev, 
                        aliceEquityProposal: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      max="25"
                      required
                      className="form-input"
                    />
                    <small>Maximum 25%</small>
                  </div>
                  
                  <div className="equity-item">
                    <label htmlFor="contributorEquity">Contributor Pool *</label>
                    <input
                      type="number"
                      id="contributorEquity"
                      value={submissionForm.contributorEquityPool}
                      onChange={(e) => setSubmissionForm(prev => ({ 
                        ...prev, 
                        contributorEquityPool: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      max="100"
                      required
                      className="form-input"
                    />
                    <small>For team members</small>
                  </div>
                  
                  <div className="equity-item">
                    <label htmlFor="reserveEquity">Reserve Equity *</label>
                    <input
                      type="number"
                      id="reserveEquity"
                      value={submissionForm.reserveEquity}
                      onChange={(e) => setSubmissionForm(prev => ({ 
                        ...prev, 
                        reserveEquity: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      max="100"
                      required
                      className="form-input"
                    />
                    <small>For future investors</small>
                  </div>
                </div>
                
                <div className="equity-total">
                  <strong>Total: {submissionForm.ownerEquityProposal + submissionForm.aliceEquityProposal + submissionForm.contributorEquityPool + submissionForm.reserveEquity}%</strong>
                  {submissionForm.ownerEquityProposal + submissionForm.aliceEquityProposal + submissionForm.contributorEquityPool + submissionForm.reserveEquity !== 100 && (
                    <span className="error">Must equal 100%</span>
                  )}
                </div>
              </div>

              {/* 30-Day Sprint Planning */}
              <div className="form-section">
                <h4>30-Day Sprint Planning</h4>
                <div className="form-group">
                  <label>Sprint Goals</label>
                  {submissionForm.sprintGoals.map((goal, index) => (
                    <div key={index} className="array-input-row">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => updateArrayField('sprintGoals', index, e.target.value)}
                        className="form-input"
                        placeholder={`Sprint ${index + 1} goal`}
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('sprintGoals', index)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('sprintGoals', '')}
                    className="add-btn"
                  >
                    Add Sprint Goal
                  </button>
                </div>

                <div className="form-group">
                  <label>Key Milestones</label>
                  {submissionForm.keyMilestones.map((milestone, index) => (
                    <div key={index} className="array-input-row">
                      <input
                        type="text"
                        value={milestone}
                        onChange={(e) => updateArrayField('keyMilestones', index, e.target.value)}
                        className="form-input"
                        placeholder="Key milestone"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('keyMilestones', index)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('keyMilestones', '')}
                    className="add-btn"
                  >
                    Add Milestone
                  </button>
                </div>
              </div>

              {/* Marketing & Launch Strategy */}
              <div className="form-section">
                <h4>Marketing & Launch Strategy</h4>
                <div className="form-group">
                  <label htmlFor="marketingStrategy">Go-to-Market Strategy</label>
                  <textarea
                    id="marketingStrategy"
                    value={submissionForm.marketingStrategy}
                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, marketingStrategy: e.target.value }))}
                    className="form-textarea"
                    placeholder="Describe your marketing approach and customer acquisition strategy"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Launch Channels</label>
                  {submissionForm.launchChannels.map((channel, index) => (
                    <div key={index} className="array-input-row">
                      <input
                        type="text"
                        value={channel}
                        onChange={(e) => updateArrayField('launchChannels', index, e.target.value)}
                        className="form-input"
                        placeholder="Marketing channel (e.g., Social Media, Email, SEO)"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('launchChannels', index)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('launchChannels', '')}
                    className="add-btn"
                  >
                    Add Channel
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="pricingStrategy">Pricing Strategy</label>
                  <textarea
                    id="pricingStrategy"
                    value={submissionForm.pricingStrategy}
                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, pricingStrategy: e.target.value }))}
                    className="form-textarea"
                    placeholder="Describe your pricing model and strategy"
                    rows={2}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="submit" className="button button-primary">
                  Submit Project for Review
                </button>
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={() => setActiveTab('projects')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
