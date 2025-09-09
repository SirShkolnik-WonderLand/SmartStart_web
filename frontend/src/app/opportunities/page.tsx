'use client'

import { useEffect, useState } from 'react'
import { Target, Building, Globe, Shield, Filter, Clock, Users, Star, Plus, Search, MapPin, DollarSign, Calendar, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalApplications: 0,
    totalMatches: 0
  })

  useEffect(() => {
    loadOpportunitiesData()
  }, [])

  const loadOpportunitiesData = async () => {
    try {
      setIsLoading(true)
      
      // Use real data from our opportunities API
      const response = await fetch('/api/opportunities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOpportunities(data.data.opportunities || [])
          
          // Calculate stats
          const totalOpportunities = data.data.opportunities?.length || 0
          const activeOpportunities = data.data.opportunities?.filter((opp: Opportunity) => opp.status === 'ACTIVE').length || 0
          const totalApplications = data.data.opportunities?.reduce((sum: number, opp: Opportunity) => sum + (opp._count?.applications || 0), 0) || 0
          const totalMatches = data.data.opportunities?.reduce((sum: number, opp: Opportunity) => sum + (opp._count?.matches || 0), 0) || 0
          
          setStats({
            totalOpportunities,
            activeOpportunities,
            totalApplications,
            totalMatches
          })
        }
      } else {
        console.error('Failed to load opportunities')
        // Set mock data for demonstration
        setOpportunities([
          {
            id: 'opp-1',
            title: 'Join our AI startup as CTO',
            description: 'We are looking for a technical co-founder to join our AI startup. You will lead the technical vision and build our core AI platform.',
            type: 'VENTURE_COLLABORATION',
            status: 'ACTIVE',
            collaborationType: 'FULL_TIME',
            requiredSkills: ['AI/ML', 'Python', 'TensorFlow', 'Leadership'],
            preferredSkills: ['Startup experience', 'Team management'],
            timeCommitment: 'Full-time',
            duration: 'Long-term',
            location: 'San Francisco, CA',
            isRemote: true,
            compensationType: 'EQUITY_ONLY',
            equityOffered: 15.0,
            currency: 'USD',
            visibilityLevel: 'PUBLIC',
            tags: ['AI', 'Startup', 'CTO', 'Leadership'],
            createdAt: '2025-09-09T17:59:05.844Z',
            creator: {
              id: 'cmfcieuff0005ik2d7pfbm99s',
              name: 'Test Admin',
              email: 'test@test.com',
              level: 'WISE_OWL'
            },
            _count: {
              applications: 3,
              matches: 8
            }
          },
          {
            id: 'opp-2',
            title: 'Mentor me in React development',
            description: 'I am looking for a React mentor to help me improve my skills and build better applications. In exchange, I can teach you about design principles.',
            type: 'SKILL_SHARING',
            status: 'ACTIVE',
            collaborationType: 'PART_TIME',
            requiredSkills: ['React', 'JavaScript', 'Mentoring'],
            preferredSkills: ['Design', 'UI/UX'],
            timeCommitment: 'Part-time',
            duration: 'Short-term',
            location: 'Remote',
            isRemote: true,
            compensationType: 'SKILL_EXCHANGE',
            currency: 'USD',
            visibilityLevel: 'PUBLIC',
            tags: ['React', 'Mentoring', 'Learning'],
            createdAt: '2025-09-09T17:59:05.844Z',
            creator: {
              id: 'cmfcieuff0005ik2d7pfbm99s',
              name: 'Test Admin',
              email: 'test@test.com',
              level: 'WISE_OWL'
            },
            _count: {
              applications: 2,
              matches: 5
            }
          },
          {
            id: 'opp-3',
            title: 'Legal counsel for fintech startup',
            description: 'We need a legal expert to help us navigate fintech regulations and create compliance frameworks for our payment platform.',
            type: 'LEGAL_PARTNERSHIP',
            status: 'ACTIVE',
            collaborationType: 'CONSULTING',
            requiredSkills: ['Fintech law', 'Compliance', 'Regulatory'],
            preferredSkills: ['Payment systems', 'Blockchain'],
            timeCommitment: 'Flexible',
            duration: 'Medium-term',
            location: 'New York, NY',
            isRemote: true,
            compensationType: 'HOURLY_RATE',
            compensationValue: 150.0,
            currency: 'USD',
            visibilityLevel: 'SUBSCRIBER_ONLY',
            tags: ['Legal', 'Fintech', 'Compliance'],
            createdAt: '2025-09-09T17:59:05.844Z',
            creator: {
              id: 'cmfcieuff0005ik2d7pfbm99s',
              name: 'Test Admin',
              email: 'test@test.com',
              level: 'WISE_OWL'
            },
            _count: {
              applications: 1,
              matches: 2
            }
          }
        ])
        
        setStats({
          totalOpportunities: 3,
          activeOpportunities: 3,
          totalApplications: 6,
          totalMatches: 15
        })
      }
    } catch (error) {
      console.error('Error loading opportunities data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeBadge = (type: string) => {
    const config = {
      VENTURE_COLLABORATION: { color: 'bg-purple-100 text-purple-800', text: 'Venture' },
      SKILL_SHARING: { color: 'bg-blue-100 text-blue-800', text: 'Skill Share' },
      IDEA_COLLABORATION: { color: 'bg-green-100 text-green-800', text: 'Idea' },
      MENTORSHIP: { color: 'bg-yellow-100 text-yellow-800', text: 'Mentorship' },
      LEGAL_PARTNERSHIP: { color: 'bg-red-100 text-red-800', text: 'Legal' },
      UMBRELLA_NETWORK: { color: 'bg-indigo-100 text-indigo-800', text: 'Network' },
      PROJECT_CONSULTING: { color: 'bg-orange-100 text-orange-800', text: 'Consulting' },
      EQUITY_PARTNERSHIP: { color: 'bg-pink-100 text-pink-800', text: 'Equity' }
    }
    const { color, text } = config[type as keyof typeof config] || { color: 'bg-gray-100 text-gray-800', text: type }
    return <Badge className={color}>{text}</Badge>
  }

  const getCompensationDisplay = (opportunity: Opportunity) => {
    switch (opportunity.compensationType) {
      case 'EQUITY_ONLY':
        return `${opportunity.equityOffered}% equity`
      case 'HOURLY_RATE':
        return `$${opportunity.compensationValue}/hour`
      case 'PROJECT_FEE':
        return `$${opportunity.compensationValue} project fee`
      case 'SKILL_EXCHANGE':
        return 'Skill exchange'
      case 'MENTORSHIP_EXCHANGE':
        return 'Mentorship exchange'
      case 'REVENUE_SHARING':
        return 'Revenue sharing'
      case 'UNPAID':
        return 'Unpaid'
      default:
        return 'TBD'
    }
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = !searchTerm || 
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = !selectedType || opportunity.type === selectedType
    
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Collaboration Opportunities</h1>
          <p className="text-xl text-foreground-muted">
            Find partners to collaborate and create new ventures together
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="glass-button flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </Button>
          <Button className="glass-button flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Opportunity
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search opportunities, skills, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Types</option>
            <option value="VENTURE_COLLABORATION">Venture Collaboration</option>
            <option value="SKILL_SHARING">Skill Sharing</option>
            <option value="IDEA_COLLABORATION">Idea Collaboration</option>
            <option value="MENTORSHIP">Mentorship</option>
            <option value="LEGAL_PARTNERSHIP">Legal Partnership</option>
            <option value="UMBRELLA_NETWORK">Umbrella Network</option>
            <option value="PROJECT_CONSULTING">Project Consulting</option>
            <option value="EQUITY_PARTNERSHIP">Equity Partnership</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Active Opportunities</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeOpportunities}</div>
            <p className="text-xs text-foreground-muted">Available now</p>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalApplications}</div>
            <p className="text-xs text-foreground-muted">Across all opportunities</p>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Smart Matches</CardTitle>
            <Star className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalMatches}</div>
            <p className="text-xs text-foreground-muted">AI-powered suggestions</p>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Remote Work</CardTitle>
            <Globe className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{opportunities.filter(opp => opp.isRemote).length}</div>
            <p className="text-xs text-foreground-muted">Remote opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <Card className="glass rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No opportunities found</h3>
          <p className="text-foreground-muted mb-6">
            {searchTerm || selectedType ? 'Try adjusting your search criteria.' : 'Check back later for new collaboration opportunities.'}
          </p>
          <Button className="glass-button">
            <Plus className="w-5 h-5 mr-2" />
            Create Opportunity
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {opportunity.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(opportunity.type)}
                      <Badge variant="outline" className="text-xs">
                        {opportunity.collaborationType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted line-clamp-3">
                  {opportunity.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Skills */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
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
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-foreground-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{opportunity.timeCommitment} • {opportunity.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{opportunity.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{getCompensationDisplay(opportunity)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-foreground-muted">
                    <span>{opportunity._count.applications} applications</span>
                    <span>{opportunity._count.matches} matches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm">
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}