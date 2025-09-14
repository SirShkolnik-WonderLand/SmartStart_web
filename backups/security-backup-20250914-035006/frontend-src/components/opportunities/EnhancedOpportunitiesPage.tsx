'use client'

import { useEffect, useState } from 'react'
import { 
  Target, Building, Globe, Filter, Clock, Users, Star, Plus, Search, 
  MapPin, DollarSign, Bell, Zap, TrendingUp, Award, Briefcase,
  CheckCircle, XCircle, Eye, Heart, Share2, MessageSquare, Coins, Wallet
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { comprehensiveApiService as apiService } from '@/lib/api-comprehensive'
import { RealtimeNotifications } from '@/components/notifications/RealtimeNotifications'
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard'
import { DigitalSignatureCanvas } from '@/components/legal/DigitalSignatureCanvas'

interface Opportunity {
  id: string
  title: string
  description: string
  type: string
  status: string
  collaborationType: string
  requiredSkills: string[]
  preferredSkills: string[]
  timeCommitment: string
  duration: string
  location?: string
  isRemote: boolean
  compensationType: string
  compensationValue?: number
  equityOffered?: number
  currency: string
  buzReward?: number
  buzRewardType?: 'FIXED' | 'PERCENTAGE' | 'BONUS'
  visibilityLevel: string
  tags: string[]
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
    level: string
  }
  venture?: {
    id: string
    name: string
    status: string
  }
  project?: {
    id: string
    name: string
    status: string
  }
  _count: {
    applications: number
    matches: number
  }
}

interface Application {
  id: string
  opportunityId: string
  applicantId: string
  coverLetter: string
  portfolioItems: string[]
  availability: string
  status: string
  appliedAt: string
}

export default function EnhancedOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedBuzReward, setSelectedBuzReward] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalApplications: 0,
    totalMatches: 0,
    myApplications: 0,
    myOpportunities: 0
  })

  useEffect(() => {
    loadOpportunitiesData()
    loadApplicationsData()
  }, [])

  const loadOpportunitiesData = async () => {
    try {
      setIsLoading(true)
      
      const response = await apiService.getOpportunities({
        page: 1,
        limit: 50,
        status: selectedStatus || undefined,
        type: selectedType || undefined,
        search: searchTerm || undefined
      })

      if (response.success && response.data) {
        setOpportunities(response.data.opportunities || [])
        setStats(prev => ({
          ...prev,
          totalOpportunities: response.data.pagination?.total || 0,
          activeOpportunities: response.data.opportunities?.filter(o => o.status === 'ACTIVE').length || 0
        }))
      }
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadApplicationsData = async () => {
    try {
      const response = await apiService.getUserApplications()
      if (response.success && response.data) {
        setApplications(response.data)
        setStats(prev => ({
          ...prev,
          myApplications: response.data.length
        }))
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const handleApply = async (opportunity: Opportunity) => {
    try {
      const coverLetter = prompt('Enter your cover letter:')
      if (!coverLetter) return

      const response = await apiService.applyToOpportunity(opportunity.id, {
        coverLetter,
        portfolioItems: [],
        availability: 'Immediately available'
      })

      if (response.success) {
        alert('Application submitted successfully!')
        loadApplicationsData()
        loadOpportunitiesData()
      } else {
        alert('Failed to submit application: ' + response.message)
      }
    } catch (error) {
      console.error('Error applying to opportunity:', error)
      alert('Error submitting application')
    }
  }

  const handleCreateOpportunity = () => {
    // This would open a modal or navigate to create opportunity page
    alert('Create opportunity functionality would open here')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CLOSED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      PAUSED: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      VENTURE_COLLABORATION: { color: 'bg-blue-100 text-blue-800', icon: Building },
      MENTORSHIP: { color: 'bg-purple-100 text-purple-800', icon: Users },
      CONSULTING: { color: 'bg-orange-100 text-orange-800', icon: Briefcase }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.VENTURE_COLLABORATION
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {type.replace('_', ' ')}
      </Badge>
    )
  }

  const getCompensationDisplay = (opportunity: Opportunity) => {
    const compensations = []
    
    if (opportunity.compensationType === 'EQUITY_ONLY') {
      compensations.push(`${opportunity.equityOffered}% equity`)
    } else if (opportunity.compensationType === 'REVENUE_SHARING') {
      compensations.push(`${opportunity.compensationValue}% revenue share`)
    } else if (opportunity.compensationValue) {
      compensations.push(`${opportunity.currency} ${opportunity.compensationValue.toLocaleString()}`)
    }
    
    if (opportunity.buzReward) {
      const buzText = opportunity.buzRewardType === 'PERCENTAGE' 
        ? `${opportunity.buzReward}% BUZ bonus`
        : `${opportunity.buzReward.toLocaleString()} BUZ tokens`
      compensations.push(buzText)
    }
    
    return compensations.length > 0 ? compensations.join(' + ') : 'Negotiable'
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = !searchTerm || 
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.requiredSkills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesType = !selectedType || opportunity.type === selectedType
    const matchesStatus = !selectedStatus || opportunity.status === selectedStatus
    
    const matchesBuzReward = !selectedBuzReward || 
      (selectedBuzReward === 'buz' && opportunity.buzReward) ||
      (selectedBuzReward === 'equity' && opportunity.compensationType === 'EQUITY_ONLY') ||
      (selectedBuzReward === 'cash' && opportunity.compensationValue && !opportunity.equityOffered && !opportunity.buzReward) ||
      (selectedBuzReward === 'mixed' && (opportunity.buzReward || opportunity.equityOffered) && opportunity.compensationValue)
    
    return matchesSearch && matchesType && matchesStatus && matchesBuzReward
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with enhanced features */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Work</h1>
              <p className="text-gray-600 mt-1">Discover opportunities and grow your career</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {stats.myApplications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.myApplications}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowGamification(!showGamification)}
              >
                <Award className="w-4 h-4 mr-2" />
                Progress
              </Button>
              <Button onClick={handleCreateOpportunity}>
                <Plus className="w-4 h-4 mr-2" />
                Post Opportunity
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeOpportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.myApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="VENTURE_COLLABORATION">Venture Collaboration</option>
              <option value="MENTORSHIP">Mentorship</option>
              <option value="CONSULTING">Consulting</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="PAUSED">Paused</option>
            </select>
            <select
              value={selectedBuzReward}
              onChange={(e) => setSelectedBuzReward(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Rewards</option>
              <option value="buz">BUZ Token Rewards</option>
              <option value="equity">Equity Only</option>
              <option value="cash">Cash Only</option>
              <option value="mixed">Mixed Compensation</option>
            </select>
            <Button onClick={loadOpportunitiesData} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="mb-8">
            <RealtimeNotifications />
          </div>
        )}

        {/* Gamification Panel */}
        {showGamification && (
          <div className="mb-8">
            <GamificationDashboard />
          </div>
        )}

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {opportunity.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getStatusBadge(opportunity.status)}
                      {getTypeBadge(opportunity.type)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {opportunity.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {opportunity.timeCommitment} • {opportunity.duration}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {opportunity.isRemote ? 'Remote' : opportunity.location || 'Location TBD'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {getCompensationDisplay(opportunity)}
                  </div>
                  
                  {opportunity.buzReward && (
                    <div className="flex items-center text-sm text-yellow-600">
                      <Coins className="w-4 h-4 mr-2" />
                      {opportunity.buzRewardType === 'PERCENTAGE' 
                        ? `${opportunity.buzReward}% BUZ bonus`
                        : `${opportunity.buzReward.toLocaleString()} BUZ tokens`
                      }
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {opportunity._count.applications} applications
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {opportunity.requiredSkills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {opportunity.requiredSkills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{opportunity.requiredSkills.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Posted by {opportunity.creator.name}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApply(opportunity)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOpportunity(opportunity)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or create a new opportunity.
            </p>
            <Button onClick={handleCreateOpportunity}>
              <Plus className="w-4 h-4 mr-2" />
              Post Opportunity
            </Button>
          </div>
        )}
      </div>

      {/* Digital Signature Modal */}
      {showSignatureModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Digital Signature Required</h3>
            <p className="text-gray-600 mb-4">
              Please sign to apply for: {selectedOpportunity.title}
            </p>
            <DigitalSignatureCanvas
              onSignatureComplete={(signatureData) => {
                console.log('Signature completed:', signatureData)
                setShowSignatureModal(false)
                setSelectedOpportunity(null)
              }}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowSignatureModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
