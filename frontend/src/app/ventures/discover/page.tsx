'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Users, MapPin, Calendar, Star, Coins, Zap, Target, Building2, Briefcase, DollarSign, Clock, Eye, Heart, Share2, MessageCircle } from 'lucide-react'
import { apiService } from '@/lib/api-unified'

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
  }
  tags: string[]
  website?: string
  socialMedia?: Record<string, string>
  isPublic: boolean
  allowApplications: boolean
  rewardType: 'equity' | 'cash' | 'hybrid'
  equityPercentage?: number
  cashAmount?: number
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
  }>
}

const industries = [
  'All', 'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing',
  'Real Estate', 'Entertainment', 'Food & Beverage', 'Transportation', 'Energy',
  'Agriculture', 'Retail', 'Consulting', 'Marketing', 'Other'
]

const stages = [
  'All', 'Idea Stage', 'MVP Stage', 'Growth Stage', 'Scale Stage'
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'applications', label: 'Most Applications' },
  { value: 'teamSize', label: 'Team Size' }
]

export default function DiscoverVenturesPage() {
  const [ventures, setVentures] = useState<Venture[]>([])
  const [filteredVentures, setFilteredVentures] = useState<Venture[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [selectedStage, setSelectedStage] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Mock data for demonstration
  const mockVentures: Venture[] = [
    {
      id: '1',
      name: 'AI-Powered Healthcare Platform',
      description: 'Revolutionary AI platform for personalized healthcare diagnostics and treatment recommendations.',
      industry: 'Healthcare',
      stage: 'mvp',
      teamSize: 3,
      maxTeamSize: 8,
      tier: 'T1',
      owner: {
        id: 'user1',
        name: 'Dr. Sarah Chen',
        avatar: '/avatars/sarah.jpg'
      },
      tags: ['AI', 'Healthcare', 'Machine Learning', 'Diagnostics'],
      website: 'https://healthai.com',
      isPublic: true,
      allowApplications: true,
      rewardType: 'hybrid',
      equityPercentage: 15,
      cashAmount: 80000,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      views: 1247,
      applications: 23,
      likes: 89,
      isLiked: false,
      files: [
        { id: '1', name: 'pitch-deck.pdf', type: 'pdf', url: '/files/pitch-deck.pdf' },
        { id: '2', name: 'product-demo.mp4', type: 'video', url: '/files/demo.mp4' }
      ]
    },
    {
      id: '2',
      name: 'Sustainable Energy Solutions',
      description: 'Clean energy solutions for residential and commercial buildings with smart grid integration.',
      industry: 'Energy',
      stage: 'idea',
      teamSize: 2,
      maxTeamSize: 6,
      tier: 'T2',
      owner: {
        id: 'user2',
        name: 'Mike Rodriguez',
        avatar: '/avatars/mike.jpg'
      },
      tags: ['Clean Energy', 'Sustainability', 'Smart Grid', 'Green Tech'],
      isPublic: true,
      allowApplications: true,
      rewardType: 'equity',
      equityPercentage: 20,
      createdAt: '2024-01-18T09:15:00Z',
      updatedAt: '2024-01-22T11:45:00Z',
      views: 892,
      applications: 15,
      likes: 67,
      isLiked: true
    },
    {
      id: '3',
      name: 'EdTech Learning Platform',
      description: 'Interactive learning platform with gamification and personalized curriculum for students.',
      industry: 'Education',
      stage: 'growth',
      teamSize: 5,
      maxTeamSize: 12,
      tier: 'T1',
      owner: {
        id: 'user3',
        name: 'Emily Watson',
        avatar: '/avatars/emily.jpg'
      },
      tags: ['Education', 'Gamification', 'Learning', 'Students'],
      website: 'https://learnsmart.com',
      isPublic: true,
      allowApplications: true,
      rewardType: 'hybrid',
      equityPercentage: 12,
      cashAmount: 95000,
      createdAt: '2024-01-10T08:30:00Z',
      updatedAt: '2024-01-25T16:20:00Z',
      views: 2156,
      applications: 45,
      likes: 156,
      isLiked: false
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVentures(mockVentures)
      setFilteredVentures(mockVentures)
      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = ventures

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(venture =>
        venture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venture.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venture.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by industry
    if (selectedIndustry !== 'All') {
      filtered = filtered.filter(venture => venture.industry === selectedIndustry)
    }

    // Filter by stage
    if (selectedStage !== 'All') {
      const stageMap: Record<string, string> = {
        'Idea Stage': 'idea',
        'MVP Stage': 'mvp',
        'Growth Stage': 'growth',
        'Scale Stage': 'scale'
      }
      filtered = filtered.filter(venture => venture.stage === stageMap[selectedStage])
    }

    // Sort ventures
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'popular':
          return b.views - a.views
        case 'applications':
          return b.applications - a.applications
        case 'teamSize':
          return b.teamSize - a.teamSize
        default:
          return 0
      }
    })

    setFilteredVentures(filtered)
  }, [ventures, searchQuery, selectedIndustry, selectedStage, sortBy])

  const handleLike = (ventureId: string) => {
    setVentures(prev => prev.map(venture => 
      venture.id === ventureId 
        ? { 
            ...venture, 
            isLiked: !venture.isLiked,
            likes: venture.isLiked ? venture.likes - 1 : venture.likes + 1
          }
        : venture
    ))
  }

  const handleApply = (ventureId: string) => {
    // TODO: Implement application logic
    console.log('Applying to venture:', ventureId)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ventures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Discover Ventures</h1>
              <p className="text-muted-foreground">Find exciting opportunities to join and collaborate</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{filteredVentures.length} ventures found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search ventures, skills, or industries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border rounded-lg p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {stages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Ventures Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVentures.map((venture) => (
            <motion.div
              key={venture.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card border rounded-lg hover:shadow-lg transition-all duration-200 group"
            >
              {/* Venture Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getStageIcon(venture.stage)}</span>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {venture.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(venture.tier)}`}>
                        {venture.tier}
                      </span>
                      <span className="text-sm text-muted-foreground">{venture.industry}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(venture.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        venture.isLiked 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${venture.isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-muted-foreground line-clamp-3">{venture.description}</p>
              </div>

              {/* Venture Details */}
              <div className="p-6 space-y-4">
                {/* Team Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {venture.teamSize}/{venture.maxTeamSize} members
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{venture.views}</span>
                  </div>
                </div>

                {/* Reward Info */}
                <div className="flex items-center gap-2">
                  {venture.rewardType === 'equity' && (
                    <div className="flex items-center gap-1 text-sm">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">{venture.equityPercentage}% equity</span>
                    </div>
                  )}
                  {venture.rewardType === 'cash' && (
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">${venture.cashAmount?.toLocaleString()}/year</span>
                    </div>
                  )}
                  {venture.rewardType === 'hybrid' && (
                    <div className="flex items-center gap-1 text-sm">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">{venture.equityPercentage}% + ${venture.cashAmount?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {venture.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {venture.tags.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      +{venture.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Owner Info */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {venture.owner.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{venture.owner.name}</p>
                    <p className="text-xs text-muted-foreground">Venture Owner</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(venture.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {venture.allowApplications ? (
                    <button
                      onClick={() => handleApply(venture.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Briefcase className="w-4 h-4" />
                      Apply to Join
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" />
                      Applications Closed
                    </button>
                  )}
                  <button className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVentures.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No ventures found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedIndustry('All')
                setSelectedStage('All')
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
