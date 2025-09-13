'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Briefcase,
  Target,
  FileText,
  Star,
  Award,
  ChevronRight,
  Bell,
  Sparkles,
  Rocket,
  Trophy,
  Heart,
  Lightbulb,
  PartyPopper,
  Coins,
  Wallet,
  TrendingDown
} from 'lucide-react'
import { comprehensiveApiService as apiService, User, AnalyticsData, Venture, Offer } from '@/lib/api-comprehensive'
import Link from 'next/link'

// Utility function to extract user ID from JWT token
  const getUserIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) return null
      
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded.userId || null
    } catch (error) {
      console.error('Error decoding JWT token:', error)
      return null
    }
  }

  const getStepForStage = (stageName: string): number => {
    // Map ONLY onboarding stages to steps (no duplicates/non-onboarding)
    const stageToStepMap: Record<string, number> = {
      'Account Creation': 0,
      'Profile Setup': 0,
      'Platform Legal Pack': 1,
      'Subscription Selection': 2,
      'Platform Orientation': 3
    }
    return stageToStepMap[stageName] ?? 0
  }

  // Onboarding stages considered for the wizard
  const ONBOARDING_STAGE_NAMES = new Set([
    'Account Creation',
    'Profile Setup',
    'Platform Legal Pack',
    'Subscription Selection',
    'Platform Orientation'
  ])

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [ventures, setVentures] = useState<Venture[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [buzBalance, setBuzBalance] = useState<number>(0)
  const [buzStaked, setBuzStaked] = useState<number>(0)
  const [buzRewards, setBuzRewards] = useState<number>(0)
  const [buzPrice, setBuzPrice] = useState<number>(0.01)
  const [legalPackStatus, setLegalPackStatus] = useState<{
    signed: boolean
    signedAt?: string
    documents: Array<{
      id: string
      name: string
      status: string
      signedAt?: string
    }>
  } | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    active: boolean
    planName?: string
    status?: string
    expiresAt?: string
  } | null>(null)
  const [journeyStatus, setJourneyStatus] = useState<{
    userStates: Array<{
      id: string
      status: string
      stage: {
        id: string
        name: string
        description: string
        order: number
      }
      startedAt?: string
      completedAt?: string
    }>
    progress: {
      completedStages: number
      totalStages: number
      percentage: number
    }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fun motivational messages based on user progress
  const getMotivationalMessage = () => {
    const completedStages = journeyStatus?.progress.completedStages || 0
    const totalStages = journeyStatus?.progress.totalStages || 4
    
    if (completedStages === 0) {
      return { message: "Ready to start your magical journey? ✨", icon: Sparkles, color: "text-primary" }
    } else if (completedStages === 1) {
      return { message: "Great start! You're on your way! 🚀", icon: Rocket, color: "text-secondary" }
    } else if (completedStages === 2) {
      return { message: "Halfway there! Keep the momentum going! 💪", icon: Trophy, color: "text-success" }
    } else if (completedStages === 3) {
      return { message: "Almost there! You're doing amazing! 🌟", icon: Star, color: "text-warning" }
    } else if (completedStages === totalStages) {
      return { message: "Congratulations! You've completed your journey! 🎉", icon: PartyPopper, color: "text-accent" }
    }
    return { message: "Keep going! Every step counts! 💫", icon: Heart, color: "text-error" }
  }

  // Fun activity suggestions based on user data
  const getActivitySuggestions = () => {
    const suggestions = []
    
    if (ventures.length === 0) {
      suggestions.push({
        title: "Create Your First Venture",
        description: "Start your entrepreneurial journey!",
        icon: Rocket,
        color: "bg-gradient-to-r from-primary to-accent",
        href: "/ventures/create"
      })
    }
    
    if (offers.length === 0) {
      suggestions.push({
        title: "Post Your First Role",
        description: "Find amazing contributors for your projects",
        icon: Users,
        color: "bg-gradient-to-r from-secondary to-primary",
        href: "/offers/create"
      })
    }
    
    if (!legalPackStatus?.signed) {
      suggestions.push({
        title: "Complete Legal Pack",
        description: "Sign your documents to unlock full access",
        icon: FileText,
        color: "bg-gradient-to-r from-green-500 to-emerald-500",
        href: "/documents"
      })
    }
    
    // Add BUZ token management
    suggestions.push({
      title: "Manage BUZ Tokens",
      description: "View balance, stake, and transfer tokens",
      icon: Coins,
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      href: "/buz"
    })
    
    // Add wallet management
    suggestions.push({
      title: "Personal Wallet",
      description: "Access your BUZ token wallet",
      icon: Wallet,
      color: "bg-gradient-to-r from-blue-500 to-indigo-500",
      href: "/wallet"
    })
    
    // Add some fun activities
    suggestions.push({
      title: "Explore Opportunities",
      description: "Discover exciting projects to contribute to",
      icon: Lightbulb,
      color: "bg-gradient-to-r from-green-500 to-teal-500",
      href: "/opportunities"
    })
    
    suggestions.push({
      title: "Check Analytics",
      description: "See how your ventures are performing",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500",
      href: "/analytics"
    })
    
    return suggestions.slice(0, 4) // Show max 4 suggestions
  }

  // Fun facts about the user's progress
  const getFunFacts = () => {
    const facts = []
    
    if (ventures.length > 0) {
      facts.push({
        icon: Briefcase,
        text: `You've created ${ventures.length} venture${ventures.length !== 1 ? 's' : ''}!`,
        color: "text-purple-600"
      })
    }
    
    if (user?.xp && user.xp > 0) {
      facts.push({
        icon: Award,
        text: `You've earned ${user.xp} XP points!`,
        color: "text-yellow-600"
      })
    }
    
    if (legalPackStatus?.signed) {
      facts.push({
        icon: CheckCircle,
        text: "You're legally compliant! 🎉",
        color: "text-green-600"
      })
    }
    
    if (subscriptionStatus?.active) {
      facts.push({
        icon: Star,
        text: `You're on the ${subscriptionStatus.planName || 'Pro'} plan!`,
        color: "text-blue-600"
      })
    }
    
    if (buzBalance > 0) {
      facts.push({
        icon: Coins,
        text: `You have ${buzBalance.toLocaleString()} BUZ tokens!`,
        color: "text-yellow-600"
      })
    }
    
    if (buzStaked > 0) {
      facts.push({
        icon: Wallet,
        text: `You have ${buzStaked.toLocaleString()} BUZ staked!`,
        color: "text-blue-600"
      })
    }
    
    return facts
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Dashboard loading timeout - showing with default data')
          setIsLoading(false)
        }, 10000) // 10 second timeout

        // Load user data first (most important)
        const userResponse = await apiService.getCurrentUser()
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
        }

        // Load other data in parallel with timeout protection
        const dataPromises = [
          apiService.getAnalytics().catch(err => {
            console.warn('Analytics failed:', err)
            return { success: false, data: null }
          }),
          apiService.getVentures().catch(err => {
            console.warn('Ventures failed:', err)
            return { success: false, data: [] }
          }),
          apiService.getOffers().catch(err => {
            console.warn('Offers failed:', err)
            return { success: false, data: [] }
          }),
          // Load BUZ token data
          apiService.getBUZSupply().catch(err => {
            console.warn('BUZ supply failed:', err)
            return { success: false, data: { currentPrice: 0.01 } }
          }),
          apiService.getBUZBalance('current-user').catch(err => {
            console.warn('BUZ balance failed:', err)
            return { success: false, data: { balance: 0, stakedBalance: 0 } }
          })
        ]

        // Wait for all data with timeout
        const [analyticsResponse, venturesResponse, offersResponse, buzSupplyResponse, buzBalanceResponse] = await Promise.allSettled(
          dataPromises.map(promise => Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]))
        )

        // Process results
        if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value && (analyticsResponse.value as { success: boolean }).success) {
          setAnalytics((analyticsResponse.value as { success: boolean; data: AnalyticsData }).data)
        }
        if (venturesResponse.status === 'fulfilled' && venturesResponse.value && (venturesResponse.value as { success: boolean }).success) {
          setVentures((venturesResponse.value as { success: boolean; data: Venture[] }).data)
        }
        if (offersResponse.status === 'fulfilled' && offersResponse.value && (offersResponse.value as { success: boolean }).success) {
          setOffers((offersResponse.value as { success: boolean; data: Offer[] }).data)
        }
        if (buzSupplyResponse.status === 'fulfilled' && buzSupplyResponse.value && (buzSupplyResponse.value as { success: boolean }).success) {
          const supplyData = (buzSupplyResponse.value as { success: boolean; data: any }).data
          setBuzPrice(supplyData.currentPrice || 0.01)
        }
        if (buzBalanceResponse.status === 'fulfilled' && buzBalanceResponse.value && (buzBalanceResponse.value as { success: boolean }).success) {
          const balanceData = (buzBalanceResponse.value as { success: boolean; data: any }).data
          setBuzBalance(balanceData.balance || 0)
          setBuzStaked(balanceData.stakedBalance || 0)
        }

        // Load user-specific data if user is available
        // Use user ID from JWT token to ensure consistency, fallback to user response
        const userIdFromToken = getUserIdFromToken()
        if (userResponse.success && userResponse.data) {
          const userId = userIdFromToken || userResponse.data.id
          
          // Load additional user data in parallel
          const userDataPromises = [
            apiService.getJourneyStatus(userId).catch(err => {
              console.warn('Journey status failed:', err)
              return { success: false, data: null }
            }),
            apiService.getLegalPackStatus(userId).catch(err => {
              console.warn('Legal pack status failed:', err)
              return { success: false, data: null }
            }),
            apiService.getSubscriptionStatus(userId).catch(err => {
              console.warn('Subscription status failed:', err)
              return { success: false, data: null }
            })
          ]

          const [journeyResponse, legalPackResponse, subscriptionResponse] = await Promise.allSettled(
            userDataPromises.map(promise => Promise.race([
              promise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]))
          )

          if (journeyResponse.status === 'fulfilled' && journeyResponse.value && (journeyResponse.value as { success: boolean }).success) {
            setJourneyStatus((journeyResponse.value as { success: boolean; data: typeof journeyStatus }).data)
          }
          if (legalPackResponse.status === 'fulfilled' && legalPackResponse.value && (legalPackResponse.value as { success: boolean }).success) {
            setLegalPackStatus((legalPackResponse.value as { success: boolean; data: typeof legalPackStatus }).data)
          }
          if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value && (subscriptionResponse.value as { success: boolean }).success) {
            setSubscriptionStatus((subscriptionResponse.value as { success: boolean; data: typeof subscriptionStatus }).data)
          }
        }

        clearTimeout(timeoutId)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-purple-100">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading your magical dashboard...</p>
        </div>
      </div>
    )
  }

  const motivational = getMotivationalMessage()
  const activitySuggestions = getActivitySuggestions()
  const funFacts = getFunFacts()

  return (
    <div className="space-y-8">
      {/* Welcome Section with Fun Elements */}
      <div className="wonderland-card glass-surface p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'Alice'}! 👋
            </h2>
            <p className="text-muted mb-3">Ready to continue your journey through Wonderland?</p>
            <div className="flex items-center gap-2">
              <motivational.icon className={`w-5 h-5 ${motivational.color}`} />
              <span className={`font-medium ${motivational.color}`}>{motivational.message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted">Online</span>
          </div>
        </div>
        
        {/* Fun Facts */}
        {funFacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {funFacts.map((fact, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-3">
                  <fact.icon className={`w-5 h-5 ${fact.color}`} />
                  <span className="text-sm font-medium">{fact.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Journey Progress */}
        <div className="wonderland-card glass-surface p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Your Onboarding Progress
            {(() => {
              if (!journeyStatus?.userStates) return null
              const filtered = journeyStatus.userStates.filter(us => ONBOARDING_STAGE_NAMES.has(us.stage.name))
              const completed = filtered.filter(us => us.status === 'COMPLETED').length
              const total = filtered.length || 1
              const percentage = Math.round((completed / total) * 100)
              return (
                <span className="text-sm text-muted ml-auto">
                  {completed}/{total} completed ({percentage}%)
                </span>
              )
            })()}
          </h3>
          <div className="space-y-3">
            {/* Show actual journey stages */}
            {journeyStatus?.userStates ? (
              journeyStatus.userStates
                .filter(us => ONBOARDING_STAGE_NAMES.has(us.stage.name))
                .sort((a, b) => a.stage.order - b.stage.order)
                .map((userState) => (
                  <div key={userState.id} className="flex items-center gap-3">
                    {userState.status === 'COMPLETED' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : userState.status === 'IN_PROGRESS' ? (
                      <div className="w-5 h-5 border-2 border-purple-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                      </div>
                    )}
                    <div className="flex-1">
                      <span className={`${userState.status === 'COMPLETED' ? 'line-through' : ''}`}>
                        {userState.stage.name}
                      </span>
                      {userState.completedAt && (
                        <div className="text-xs text-muted">
                          Completed: {new Date(userState.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {userState.status === 'NOT_STARTED' && (
                      <Link 
                        href={`/onboarding?step=${getStepForStage(userState.stage.name)}`}
                        className="text-xs text-purple-600 hover:text-purple-700 transition-colors font-medium"
                      >
                        Start →
                      </Link>
                    )}
                  </div>
                ))
            ) : (
              // Fallback to old display if journey status not available
              <>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Account Setup Complete</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {legalPackStatus?.signed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                  )}
                  <span>
                    {legalPackStatus?.signed ? 'Legal Pack Signed' : 'Legal Pack Pending'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {subscriptionStatus?.active ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                  )}
                  <span>
                    {subscriptionStatus?.active ? 'Subscription Active' : 'Subscription Pending'}
                  </span>
                </div>
                
                {ventures.length === 0 ? (
                  <Link 
                    href="/ventures/create"
                    className="flex items-center gap-3 w-full hover:bg-purple-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-5 h-5 border-2 border-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span>Create Your First Venture</span>
                    <ChevronRight className="w-4 h-4 text-muted ml-auto" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>First Venture Created</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold mb-1">{analytics?.totalVentures || ventures.length}</div>
          <div className="text-sm text-muted">Active Ventures</div>
          <div className="text-xs text-green-600 mt-1">+{analytics?.ventureGrowth || 0}%</div>
        </div>

        <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold mb-1">{analytics?.totalUsers || 0}</div>
          <div className="text-sm text-muted">Team Members</div>
          <div className="text-xs text-green-600 mt-1">+{analytics?.userGrowth || 0}%</div>
        </div>

        <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold mb-1">{analytics?.totalOffers || offers.length}</div>
          <div className="text-sm text-muted">Open Roles</div>
          <div className="text-xs text-green-600 mt-1">+{analytics?.offerGrowth || 0}%</div>
        </div>

        <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {user?.xp || 0}
          </div>
          <div className="text-sm text-muted">XP Points</div>
          <div className="text-xs text-yellow-600 mt-1">
            Level: {user?.level || 'Unknown'}
          </div>
        </div>

        {/* BUZ Token Cards */}
        <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Coins className="w-6 h-6 text-yellow-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold mb-1">{buzBalance.toLocaleString()}</div>
          <div className="text-sm text-muted">BUZ Balance</div>
          <div className="text-xs text-green-600 mt-1">
            ${(buzBalance * buzPrice).toFixed(2)} USD
          </div>
        </div>

        <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingDown className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mb-1">{buzStaked.toLocaleString()}</div>
          <div className="text-sm text-muted">Staked BUZ</div>
          <div className="text-xs text-blue-600 mt-1">
            ${(buzStaked * buzPrice).toFixed(2)} USD
          </div>
        </div>
      </div>

      {/* Activity Suggestions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="wonderland-card glass-surface p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activitySuggestions.map((suggestion, index) => (
              <Link
                key={index}
                href={suggestion.href}
                className={`${suggestion.color} text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 group`}
              >
                <div className="flex items-center gap-3">
                  <suggestion.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  <div>
                    <div className="font-semibold text-sm">{suggestion.title}</div>
                    <div className="text-xs opacity-90">{suggestion.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="wonderland-card glass-surface p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {ventures.length > 0 ? (
              ventures.slice(0, 3).map((venture) => (
                <div key={venture.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{venture.name}</div>
                    <div className="text-xs text-muted">Stage: {venture.stage || 'Planning'}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted text-sm">No recent activity</p>
                <p className="text-muted text-xs">Create your first venture to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fun Bottom Section */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 rounded-xl p-6 border border-purple-200">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
            <PartyPopper className="w-6 h-6 text-pink-600" />
            Ready for Your Next Adventure?
            <PartyPopper className="w-6 h-6 text-pink-600" />
          </h3>
          <p className="text-muted mb-4">
            Explore new opportunities, connect with amazing people, and build something incredible together!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/ventures"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Explore Ventures
            </Link>
            <Link
              href="/opportunities"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Find Opportunities
            </Link>
            <Link
              href="/analytics"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              View Analytics
            </Link>
            <Link
              href="/buz"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Coins className="w-4 h-4" />
              BUZ Tokens
            </Link>
            <Link
              href="/wallet"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              My Wallet
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}