'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Users, MessageCircle, Calendar, Star, Coins, Target, 
  DollarSign, Clock, MapPin, Globe, Share2, Heart, Send, 
  CheckCircle, XCircle, AlertCircle, Building2, Briefcase,
  FileText, Image, Download, Eye, ThumbsUp, MessageSquare
} from 'lucide-react'

interface Venture {
  id: string
  name: string
  description: string
  industry: string
  stage: string
  teamSize: number
  maxTeamSize: number
  tier: string
  owner: {
    id: string
    name: string
    avatar?: string
    bio?: string
    skills?: string[]
  }
  tags: string[]
  website?: string
  socialMedia?: Record<string, string>
  isPublic: boolean
  allowApplications: boolean
  rewardType: 'equity' | 'cash' | 'hybrid'
  equityPercentage?: number
  cashAmount?: number
  paymentSchedule?: string
  createdAt: string
  updatedAt: string
  views: number
  applications: number
  likes: number
  isLiked?: boolean
  files?: Array<{
    id: string
    name: string
    type: string
    url: string
    size: number
  }>
  teamMembers?: Array<{
    id: string
    name: string
    role: string
    avatar?: string
    joinedAt: string
  }>
  milestones?: Array<{
    id: string
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed'
    dueDate: string
  }>
}

interface Application {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  role: string
  message: string
  skills: string[]
  experience: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: string
}

export default function VentureCollaboratePage() {
  const params = useParams()
  const router = useRouter()
  const ventureId = params.id as string
  
  const [venture, setVenture] = useState<Venture | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'files' | 'applications'>('overview')
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    role: '',
    message: '',
    skills: [] as string[],
    experience: ''
  })

  // Mock data
  const mockVenture: Venture = {
    id: ventureId,
    name: 'AI-Powered Healthcare Platform',
    description: 'Revolutionary AI platform for personalized healthcare diagnostics and treatment recommendations. We are building the future of healthcare with cutting-edge machine learning algorithms that can analyze medical data and provide accurate diagnoses.',
    industry: 'Healthcare',
    stage: 'mvp',
    teamSize: 3,
    maxTeamSize: 8,
    tier: 'T1',
    owner: {
      id: 'user1',
      name: 'Dr. Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      bio: 'Healthcare AI researcher with 10+ years experience in machine learning and medical diagnostics.',
      skills: ['AI/ML', 'Healthcare', 'Python', 'TensorFlow', 'Medical Research']
    },
    tags: ['AI', 'Healthcare', 'Machine Learning', 'Diagnostics', 'Medical Tech'],
    website: 'https://healthai.com',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/healthai',
      twitter: '@healthai_platform'
    },
    isPublic: true,
    allowApplications: true,
    rewardType: 'hybrid',
    equityPercentage: 15,
    cashAmount: 80000,
    paymentSchedule: 'monthly',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    views: 1247,
    applications: 23,
    likes: 89,
    isLiked: false,
    files: [
      { id: '1', name: 'pitch-deck.pdf', type: 'pdf', url: '/files/pitch-deck.pdf', size: 2048000 },
      { id: '2', name: 'product-demo.mp4', type: 'video', url: '/files/demo.mp4', size: 15728640 },
      { id: '3', name: 'business-plan.docx', type: 'document', url: '/files/business-plan.docx', size: 512000 },
      { id: '4', name: 'logo.png', type: 'image', url: '/files/logo.png', size: 256000 }
    ],
    teamMembers: [
      {
        id: 'user1',
        name: 'Dr. Sarah Chen',
        role: 'CEO & Founder',
        avatar: '/avatars/sarah.jpg',
        joinedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'user2',
        name: 'Alex Kumar',
        role: 'CTO',
        avatar: '/avatars/alex.jpg',
        joinedAt: '2024-01-16T09:00:00Z'
      },
      {
        id: 'user3',
        name: 'Maria Rodriguez',
        role: 'Lead Developer',
        avatar: '/avatars/maria.jpg',
        joinedAt: '2024-01-18T14:30:00Z'
      }
    ],
    milestones: [
      {
        id: '1',
        title: 'MVP Development',
        description: 'Complete the minimum viable product with core diagnostic features',
        status: 'in_progress',
        dueDate: '2024-03-15T00:00:00Z'
      },
      {
        id: '2',
        title: 'Beta Testing',
        description: 'Launch beta version with select healthcare providers',
        status: 'pending',
        dueDate: '2024-04-30T00:00:00Z'
      },
      {
        id: '3',
        title: 'FDA Approval',
        description: 'Submit application for FDA approval',
        status: 'pending',
        dueDate: '2024-06-30T00:00:00Z'
      }
    ]
  }

  const mockApplications: Application[] = [
    {
      id: 'app1',
      userId: 'user4',
      userName: 'John Smith',
      userAvatar: '/avatars/john.jpg',
      role: 'Frontend Developer',
      message: 'I have 5+ years experience in React and healthcare applications. I\'m excited about the potential of AI in healthcare.',
      skills: ['React', 'TypeScript', 'Healthcare', 'UI/UX'],
      experience: '5 years',
      status: 'pending',
      appliedAt: '2024-01-22T10:30:00Z'
    },
    {
      id: 'app2',
      userId: 'user5',
      userName: 'Lisa Wang',
      userAvatar: '/avatars/lisa.jpg',
      role: 'Data Scientist',
      message: 'PhD in Machine Learning with focus on medical imaging. I\'ve worked on similar diagnostic tools before.',
      skills: ['Python', 'TensorFlow', 'Medical Imaging', 'Deep Learning'],
      experience: '7 years',
      status: 'accepted',
      appliedAt: '2024-01-20T15:45:00Z'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVenture(mockVenture)
      setApplications(mockApplications)
      setIsLoading(false)
    }, 1000)
  }, [ventureId])

  const handleLike = () => {
    if (venture) {
      setVenture(prev => prev ? {
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      } : null)
    }
  }

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement application submission
    console.log('Submitting application:', applicationData)
    setShowApplicationForm(false)
  }

  const handleApplicationStatus = (applicationId: string, status: 'accepted' | 'rejected') => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status } : app
    ))
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'idea': return '💡'
      case 'mvp': return '🚀'
      case 'growth': return '📈'
      case 'scale': return '🏆'
      default: return '💡'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'T1': return 'text-yellow-600 bg-yellow-50'
      case 'T2': return 'text-blue-600 bg-blue-50'
      case 'T3': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'accepted': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading venture details...</p>
        </div>
      </div>
    )
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Venture not found</h2>
          <p className="text-muted-foreground mb-6">The venture you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getStageIcon(venture.stage)}</span>
                <h1 className="text-3xl font-bold">{venture.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(venture.tier)}`}>
                  {venture.tier}
                </span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{venture.industry}</span>
                <span>•</span>
                <span>{venture.teamSize}/{venture.maxTeamSize} members</span>
                <span>•</span>
                <span>{venture.views} views</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-3 rounded-lg transition-colors ${
                  venture.isLiked 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-6 h-6 ${venture.isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'files', label: 'Files', icon: FileText },
              { id: 'applications', label: 'Applications', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">About This Venture</h2>
                <p className="text-muted-foreground leading-relaxed">{venture.description}</p>
              </div>

              {/* Milestones */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Project Milestones</h2>
                <div className="space-y-4">
                  {venture.milestones?.map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : milestone.status === 'in_progress' ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{milestone.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Venture Owner</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {venture.owner.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{venture.owner.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{venture.owner.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {venture.owner.skills?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Compensation</h3>
                <div className="space-y-3">
                  {venture.rewardType === 'equity' && (
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="font-medium">{venture.equityPercentage}% equity</span>
                    </div>
                  )}
                  {venture.rewardType === 'cash' && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">${venture.cashAmount?.toLocaleString()}/year</span>
                    </div>
                  )}
                  {venture.rewardType === 'hybrid' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="font-medium">{venture.equityPercentage}% equity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-medium">${venture.cashAmount?.toLocaleString()}/year</span>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Payment: {venture.paymentSchedule}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {venture.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              {venture.allowApplications && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Briefcase className="w-5 h-5" />
                  Apply to Join
                </button>
              )}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venture.teamMembers?.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Venture Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venture.files?.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {file.type === 'image' ? (
                          <Image className="w-5 h-5 text-primary" />
                        ) : (
                          <FileText className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Team Applications</h2>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {application.userName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{application.userName}</h3>
                          <p className="text-sm text-muted-foreground">{application.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        {application.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleApplicationStatus(application.id, 'accepted')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(application.id, 'rejected')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{application.message}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {application.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Experience: {application.experience}</span>
                      <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Apply to Join</h2>
            <form onSubmit={handleApplicationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input
                  type="text"
                  value={applicationData.role}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Frontend Developer"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={applicationData.message}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us why you want to join this venture..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience</label>
                <input
                  type="text"
                  value={applicationData.experience}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g., 5 years in React development"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
