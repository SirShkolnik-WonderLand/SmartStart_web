'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Briefcase, 
  Target,
  Award,
  Download,
  RefreshCw
} from 'lucide-react'
import { AnalyticsData } from '@/lib/api-comprehensive'

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Mock data for now - replace with real API calls
        const mockData: AnalyticsData = {
          totalVentures: 24,
          totalUsers: 156,
          totalOffers: 89,
          totalRevenue: 125000,
          totalCompanies: 18,
          totalTeams: 42,
          ventureGrowth: 12.5,
          userGrowth: 8.3,
          offerGrowth: 15.2,
          revenueGrowth: 22.1,
          companyGrowth: 10.5,
          teamGrowth: 14.2,
          topVentures: [
            { id: '1', name: 'Quantum AI Labs', value: 45000, growth: 18.5 },
            { id: '2', name: 'Blockchain Solutions', value: 32000, growth: 12.3 },
            { id: '3', name: 'GreenTech Innovations', value: 28000, growth: 8.7 },
            { id: '4', name: 'HealthTech Platform', value: 21000, growth: 15.2 },
          ],
          monthlyStats: [
            { month: 'Jan', ventures: 18, users: 120, offers: 65, revenue: 95000 },
            { month: 'Feb', ventures: 20, users: 135, offers: 72, revenue: 108000 },
            { month: 'Mar', ventures: 22, users: 145, offers: 78, revenue: 115000 },
            { month: 'Apr', ventures: 24, users: 156, offers: 89, revenue: 125000 },
          ]
        }
        setData(mockData)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No analytics data available</h3>
        <p className="text-foreground-muted">Analytics data will appear here once you have some activity.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-foreground-muted">Track your platform performance and growth metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="bg-glass-surface border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-foreground-muted" />
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.totalVentures)}</div>
              <div className={`text-sm flex items-center gap-1 ${data.ventureGrowth > 0 ? 'text-success' : 'text-destructive'}`}>
                {data.ventureGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data.ventureGrowth)}%
              </div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Total Ventures</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.totalUsers)}</div>
              <div className={`text-sm flex items-center gap-1 ${data.userGrowth > 0 ? 'text-success' : 'text-destructive'}`}>
                {data.userGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data.userGrowth)}%
              </div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Active Users</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-highlight" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.totalOffers)}</div>
              <div className={`text-sm flex items-center gap-1 ${data.offerGrowth > 0 ? 'text-success' : 'text-destructive'}`}>
                {data.offerGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data.offerGrowth)}%
              </div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Total Offers</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatCurrency(data.totalRevenue)}</div>
              <div className={`text-sm flex items-center gap-1 ${data.revenueGrowth > 0 ? 'text-success' : 'text-destructive'}`}>
                {data.revenueGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data.revenueGrowth)}%
              </div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Total Revenue</div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Ventures */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Ventures</h3>
          <div className="space-y-4">
            {data.topVentures.map((venture, index) => (
              <div key={venture.id} className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{venture.name}</div>
                    <div className="text-sm text-foreground-muted">{formatCurrency(venture.value)} value</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm flex items-center gap-1 ${venture.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                    {venture.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(venture.growth)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Growth Trends</h3>
          <div className="space-y-4">
            {data.monthlyStats.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{month.month}</span>
                  <span className="text-xs text-foreground-muted">
                    {formatCurrency(month.revenue)} revenue
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-primary/10 rounded px-2 py-1 text-center">
                    {month.ventures} ventures
                  </div>
                  <div className="bg-accent/10 rounded px-2 py-1 text-center">
                    {month.users} users
                  </div>
                  <div className="bg-highlight/10 rounded px-2 py-1 text-center">
                    {month.offers} offers
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 hover:bg-glass-surface rounded-lg transition-colors">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground-body">New venture &quot;Quantum AI Labs&quot; reached $45K valuation</p>
              <p className="text-xs text-foreground-muted">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 hover:bg-glass-surface rounded-lg transition-colors">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground-body">12 new users joined the platform</p>
              <p className="text-xs text-foreground-muted">5 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 hover:bg-glass-surface rounded-lg transition-colors">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground-body">8 new offers submitted for review</p>
              <p className="text-xs text-foreground-muted">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
