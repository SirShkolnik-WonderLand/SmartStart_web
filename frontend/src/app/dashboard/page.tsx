'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  Clock, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Briefcase,
  Target,
  FileText,
  Star,
  Award,
  ChevronRight,
  Bell
} from 'lucide-react'
import { comprehensiveApiService as apiService, User, AnalyticsData, Venture, Offer } from '@/lib/api-comprehensive'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [ventures, setVentures] = useState<Venture[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user data
        const userResponse = await apiService.getCurrentUser()
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
        }

        // Load analytics data
        const analyticsResponse = await apiService.getAnalytics()
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data)
        }

        // Load ventures data
        const venturesResponse = await apiService.getVentures()
        if (venturesResponse.success && venturesResponse.data) {
          setVentures(venturesResponse.data)
        }

        // Load offers data
        const offersResponse = await apiService.getOffers()
        if (offersResponse.success && offersResponse.data) {
          setOffers(offersResponse.data)
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8">
            {/* Welcome Section */}
            <div className="glass rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name || 'Alice'}! 👋</h2>
                  <p className="text-foreground-muted">Ready to continue your journey through Wonderland?</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-foreground-muted">Online</span>
                </div>
              </div>
              
              {/* Journey Progress */}
              <div className="glass rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Your Journey Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-foreground-body">Account Setup Complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-foreground-body">Legal Pack Signed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-foreground-body">Subscription Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-accent rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                    </div>
                    <span className="text-foreground-body">Create Your First Venture</span>
                    <ChevronRight className="w-4 h-4 text-foreground-muted ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalVentures || ventures.length}</div>
                <div className="text-sm text-foreground-muted">Active Ventures</div>
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
                <div className="text-sm text-foreground-muted">Team Members</div>
                <div className="text-xs text-success mt-1">+{analytics?.userGrowth || 0}%</div>
              </div>

              <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Target className="w-6 h-6 text-highlight" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalOffers || offers.length}</div>
                <div className="text-sm text-foreground-muted">Open Roles</div>
                <div className="text-xs text-success mt-1">+{analytics?.offerGrowth || 0}%</div>
              </div>

              <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Award className="w-6 h-6 text-success" />
                  </div>
                  <Star className="w-5 h-5 text-warning" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {user?.xp || 0}
                </div>
                <div className="text-sm text-foreground-muted">XP Points</div>
                <div className="text-xs text-warning mt-1">
                  Level: {user?.level || 'Unknown'}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {ventures.slice(0, 3).map((venture) => (
                    <div key={venture.id} className="flex items-start gap-3 p-3 hover:bg-glass-surface rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground-body">Venture: {venture.name}</p>
                        <p className="text-xs text-foreground-muted">Stage: {venture.stage}</p>
                      </div>
                    </div>
                  ))}
                  {ventures.length === 0 && (
                    <div className="flex items-start gap-3 p-3 hover:bg-glass-surface rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground-body">No ventures yet. Create your first venture to get started!</p>
                        <p className="text-xs text-foreground-muted">Click the &quot;Create New&quot; button above</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-highlight" />
                  Pending Actions
                </h3>
                <div className="space-y-4">
                  {offers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground-body">Review offer for {offer.role?.title || 'Unknown Role'}</p>
                        <p className="text-xs text-foreground-muted">From: {offer.user?.name || 'Unknown User'}</p>
                      </div>
                      <button className="px-3 py-1 bg-warning text-warning-foreground text-xs rounded-lg hover:bg-warning/90 transition-colors">
                        Review
                      </button>
                    </div>
                  ))}
                  {offers.length === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground-body">No pending actions</p>
                        <p className="text-xs text-foreground-muted">All caught up!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-highlight" />
                Quick Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="group flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-all duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">Create Venture</div>
                    <div className="text-sm text-foreground-muted">Start a new project</div>
                  </div>
                </button>
                
                <button className="group flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg hover:bg-accent/10 transition-all duration-200">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">Post Role</div>
                    <div className="text-sm text-foreground-muted">Find contributors</div>
                  </div>
                </button>
                
                <button className="group flex items-center gap-3 p-4 bg-highlight/5 border border-highlight/20 rounded-lg hover:bg-highlight/10 transition-all duration-200">
                  <div className="w-10 h-10 bg-highlight/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-5 h-5 text-highlight" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">Generate NDA</div>
                    <div className="text-sm text-foreground-muted">Create legal docs</div>
                  </div>
                </button>
              </div>
            </div>
    </div>
  )
}