'use client'

import { useState, useEffect } from 'react'
// UI components are now using Wonderland theme classes
import { 
  Plus, 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  DollarSign,
  Target,
  ArrowRight,
  MoreHorizontal,
  Building2,
  Lightbulb,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { comprehensiveApiService as apiService, Venture, AnalyticsData } from '@/lib/api-comprehensive'

// Venture interface is now imported from api-comprehensive

export default function VenturesPage() {
  const [ventures, setVentures] = useState<Venture[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVenturesData()
  }, [])

  const loadVenturesData = async () => {
    try {
      setLoading(true)
      
      // Load ventures and analytics in parallel
      const [venturesResponse, analyticsResponse] = await Promise.all([
        apiService.getVentures(),
        apiService.getAnalytics()
      ])

      if (venturesResponse.success && venturesResponse.data) {
        setVentures(venturesResponse.data)
      }

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data)
      }
      
    } catch (error) {
      console.error('Error loading ventures data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { color: 'bg-success/20 text-success border-success/30', text: 'Active' },
      PLANNING: { color: 'bg-warning/20 text-warning border-warning/30', text: 'Planning' },
      INACTIVE: { color: 'bg-foreground-muted/20 text-foreground-muted border-foreground-muted/30', text: 'Inactive' },
      PENDING_CONTRACTS: { color: 'bg-highlight/20 text-highlight border-highlight/30', text: 'Pending' },
      COMPLETED: { color: 'bg-success/20 text-success border-success/30', text: 'Completed' }
    }
    const { color, text } = config[status as keyof typeof config] || config.INACTIVE
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} border`}>{text}</span>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen wonderland-bg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-glass-surface rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-glass-surface rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass p-6 rounded-lg">
                  <div className="h-4 bg-glass-surface rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-glass-surface rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-glass-surface rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wonderland-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Ventures</h1>
            <p className="text-xl text-foreground-muted mt-1">Discover and manage your ventures</p>
          </div>
          <Link href="/ventures/create">
            <button className="wonder-button flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Venture
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{ventures.length}</div>
            <div className="text-sm text-foreground-muted">Total Ventures</div>
            <div className="text-xs text-success mt-1">+{analytics?.ventureGrowth || 0}%</div>
          </div>

          <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalUsers || 0}</div>
            <div className="text-sm text-foreground-muted">Active Members</div>
            <div className="text-xs text-success mt-1">+{analytics?.userGrowth || 0}%</div>
          </div>

          <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <DollarSign className="w-6 h-6 text-highlight" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{formatCurrency(analytics?.totalRevenue || 0)}</div>
            <div className="text-sm text-foreground-muted">Total Revenue</div>
            <div className="text-xs text-success mt-1">+{analytics?.revenueGrowth || 0}%</div>
          </div>

          <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalOffers || 0}</div>
            <div className="text-sm text-foreground-muted">Open Roles</div>
            <div className="text-xs text-success mt-1">+{analytics?.offerGrowth || 0}%</div>
          </div>
        </div>

        {/* Ventures Grid */}
        {ventures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ventures.map((venture) => (
              <div key={venture.id} className="glass rounded-xl p-6 cursor-pointer group hover:glass-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {venture.name}
                      </h3>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(venture.status)}
                        <div className="flex items-center text-sm text-foreground-muted">
                          <MapPin className="w-4 h-4 mr-1" />
                          {venture.region || 'Global'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-glass-highlight rounded-lg">
                    <MoreHorizontal className="w-4 h-4 text-foreground-muted" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-foreground-muted mb-6 line-clamp-2 leading-relaxed">{venture.purpose || venture.description || 'No description available'}</p>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-glass-surface rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-foreground-muted">Team</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">{venture.teamSize || 0}</div>
                      <div className="text-xs text-foreground-muted">Active members</div>
                    </div>
                    <div className="bg-glass-surface rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="w-4 h-4 text-accent" />
                        <span className="text-xs font-medium text-foreground-muted">Stage</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">{venture.stage || 'Planning'}</div>
                      <div className="text-xs text-foreground-muted">Current stage</div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Lightbulb className="w-4 h-4 text-highlight" />
                      </div>
                      <div className="text-sm font-bold text-foreground">{venture.lookingFor?.length || 0}</div>
                      <div className="text-xs text-foreground-muted">Looking For</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Building2 className="w-4 h-4 text-success" />
                      </div>
                      <div className="text-sm font-bold text-foreground">{venture.tier || 'T1'}</div>
                      <div className="text-xs text-foreground-muted">Tier</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-sm font-bold text-foreground">{venture.industry || 'Tech'}</div>
                      <div className="text-xs text-foreground-muted">Industry</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                    <div className="flex items-center space-x-2 text-sm text-foreground-muted">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(venture.createdAt)}</span>
                    </div>
                    <Link href={`/ventures/${venture.id}`}>
                      <button className="px-3 py-1 border border-glass-border rounded-md hover:bg-glass-highlight transition-colors text-sm text-primary hover:text-primary">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1 inline" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-glass-surface rounded-full flex items-center justify-center mb-4 mx-auto">
              <Briefcase className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No ventures yet</h3>
            <p className="text-foreground-muted text-center mb-6 max-w-md mx-auto">
              Start building your entrepreneurial journey by creating your first venture.
            </p>
            <Link href="/ventures/create">
              <button className="wonder-button">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Venture
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}