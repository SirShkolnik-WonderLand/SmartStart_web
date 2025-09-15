'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Coins, 
  Network, 
  Building2, 
  FileText, 
  Search, 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Target,
  Activity
} from 'lucide-react'

// Import existing components
import UmbrellaDashboard from '@/components/umbrella/UmbrellaDashboard'
import VentureManagementDashboard from '@/components/venture/VentureManagementDashboard'
import { apiService } from '@/lib/api-unified'

interface UnifiedAnalytics {
  buz_summary: {
    balance: number
    earned: number
    spent: number
    staked: number
    rewards: number
    net_worth: number
  }
  umbrella_summary: {
    total_relationships: number
    total_revenue: number
  }
  venture_summary: {
    total_ventures: number
    total_venture_earnings: number
  }
  platform_analytics: {
    total_users: number
    active_users: number
    total_buz_supply: number
    buz_in_circulation: number
  }
}

interface CrossSystemActivity {
  id: string
  type: string
  description: string
  systems_involved: string[]
  buz_earned: number
  timestamp: string
}

export default function UnifiedDashboard() {
  const [analytics, setAnalytics] = useState<UnifiedAnalytics | null>(null)
  const [recentActivity, setRecentActivity] = useState<CrossSystemActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUnifiedData()
  }, [])

  const loadUnifiedData = async () => {
    try {
      setLoading(true)
      
      // Get user ID from token
      const token = localStorage.getItem('auth-token')
      if (!token) return
      
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      const currentUserId = decoded.userId || decoded.id
      setUserId(currentUserId)
      
      if (!currentUserId) return

      // Load unified analytics
      const analyticsResponse = await fetch(`/api/analytics/unified/${currentUserId}?period=monthly`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.data)
      }

      // Load recent activity
      const activityResponse = await fetch(`/api/integration/activity?user_id=${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.data || [])
      }

    } catch (error) {
      console.error('Failed to load unified data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSystemIcon = (system: string) => {
    const icons = {
      'buz': Coins,
      'umbrella': Network,
      'venture': Building2,
      'legal': FileText,
      'opportunity': Search,
      'analytics': BarChart3
    }
    return icons[system] || Activity
  }

  const getSystemColor = (system: string) => {
    const colors = {
      'buz': 'text-yellow-500',
      'umbrella': 'text-purple-500',
      'venture': 'text-blue-500',
      'legal': 'text-green-500',
      'opportunity': 'text-orange-500',
      'analytics': 'text-pink-500'
    }
    return colors[system] || 'text-gray-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Unified Dashboard</h1>
          <p className="text-foreground-muted">Complete view of your SmartStart ecosystem</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-foreground-muted">All Systems Online</span>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BUZ Net Worth</CardTitle>
              <Coins className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.buz_summary.net_worth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.buz_summary.balance.toFixed(2)} available, {analytics.buz_summary.staked.toFixed(2)} staked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umbrella Revenue</CardTitle>
              <Network className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.umbrella_summary.total_revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.umbrella_summary.total_relationships} relationships
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venture Earnings</CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.venture_summary.total_venture_earnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.venture_summary.total_ventures} ventures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
              <Activity className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.platform_analytics.active_users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.platform_analytics.total_users.toLocaleString()} total users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="buz">BUZ Tokens</TabsTrigger>
          <TabsTrigger value="umbrella">Umbrella</TabsTrigger>
          <TabsTrigger value="ventures">Ventures</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Cross-System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-1">
                          {activity.systems_involved.map((system) => {
                            const Icon = getSystemIcon(system)
                            return (
                              <Icon key={system} className={`w-4 h-4 ${getSystemColor(system)}`} />
                            )
                          })}
                        </div>
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.buz_earned > 0 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            +{activity.buz_earned} BUZ
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'BUZ Tokens', status: 'healthy', icon: Coins, color: 'text-yellow-500' },
                  { name: 'Umbrella Network', status: 'healthy', icon: Network, color: 'text-purple-500' },
                  { name: 'Venture Management', status: 'healthy', icon: Building2, color: 'text-blue-500' },
                  { name: 'Legal System', status: 'healthy', icon: FileText, color: 'text-green-500' },
                  { name: 'Opportunities', status: 'healthy', icon: Search, color: 'text-orange-500' },
                  { name: 'Analytics', status: 'healthy', icon: BarChart3, color: 'text-pink-500' }
                ].map((system) => {
                  const Icon = system.icon
                  return (
                    <div key={system.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Icon className={`w-5 h-5 ${system.color}`} />
                      <div>
                        <p className="font-medium">{system.name}</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-muted-foreground capitalize">{system.status}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                BUZ Token Economy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Token Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Available Balance:</span>
                        <span className="font-mono">{analytics.buz_summary.balance.toFixed(2)} BUZ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Staked Amount:</span>
                        <span className="font-mono">{analytics.buz_summary.staked.toFixed(2)} BUZ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Earned:</span>
                        <span className="font-mono text-green-600">{analytics.buz_summary.earned.toFixed(2)} BUZ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Spent:</span>
                        <span className="font-mono text-red-600">{analytics.buz_summary.spent.toFixed(2)} BUZ</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Net Worth:</span>
                        <span className="font-mono text-blue-600">{analytics.buz_summary.net_worth.toFixed(2)} BUZ</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline">
                        <Coins className="w-4 h-4 mr-2" />
                        Stake Tokens
                      </Button>
                      <Button className="w-full" variant="outline">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Transactions
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Target className="w-4 h-4 mr-2" />
                        Set Goals
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading BUZ token data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="umbrella" className="space-y-6">
          <UmbrellaDashboard />
        </TabsContent>

        <TabsContent value="ventures" className="space-y-6">
          {userId && <VentureManagementDashboard ventureId={userId} />}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-500" />
                Opportunities & Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Opportunities system integration coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-500" />
                Cross-System Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Advanced analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
