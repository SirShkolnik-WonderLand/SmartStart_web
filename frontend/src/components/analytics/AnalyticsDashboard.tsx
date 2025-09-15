'use client'

import { useState, useEffect } from 'react'
import { apiService, AnalyticsData } from '@/lib/api-unified'
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Target, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AnalyticsDashboardProps {
  timeRange?: '7d' | '30d' | '90d' | '1y'
}

export function AnalyticsDashboard({ timeRange = '30d' }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'ventures' | 'users' | 'companies' | 'teams'>('ventures')

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await apiService.getAnalytics()
        if (response.success && response.data) {
          setAnalytics(response.data)
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-foreground-muted">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <BarChart3 className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Analytics Data</h3>
        <p className="text-foreground-muted">Analytics data will appear here once you have some activity.</p>
      </div>
    )
  }

  const metrics = [
    {
      key: 'ventures' as const,
      label: 'Ventures',
      value: analytics.totalVentures,
      growth: analytics.ventureGrowth,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      key: 'users' as const,
      label: 'Users',
      value: analytics.totalUsers,
      growth: analytics.userGrowth,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      key: 'companies' as const,
      label: 'Companies',
      value: analytics.totalCompanies,
      growth: analytics.companyGrowth,
      icon: Building2,
      color: 'text-highlight',
      bgColor: 'bg-highlight/10'
    },
    {
      key: 'teams' as const,
      label: 'Teams',
      value: analytics.totalTeams,
      growth: analytics.teamGrowth,
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ]

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-success" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-error" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-success' : 'text-error'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-foreground-muted">Key metrics and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-foreground-muted" />
          <select
            value={timeRange}
            onChange={(e) => setSelectedMetric(e.target.value as 'ventures' | 'users' | 'companies' | 'teams')}
            className="bg-glass-surface border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.key}
              className={`glass rounded-xl p-6 cursor-pointer transition-all duration-200 hover:glass-lg ${
                selectedMetric === metric.key ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedMetric(metric.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="flex items-center gap-1">
                  {getGrowthIcon(metric.growth)}
                  <span className={`text-sm font-medium ${getGrowthColor(metric.growth)}`}>
                    {Math.abs(metric.growth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="text-sm text-foreground-muted">{metric.label}</div>
            </div>
          )
        })}
      </div>

      {/* Revenue Metric */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Total Revenue</h3>
              <p className="text-foreground-muted">Platform revenue metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getGrowthIcon(analytics.revenueGrowth)}
            <span className={`text-sm font-medium ${getGrowthColor(analytics.revenueGrowth)}`}>
              {Math.abs(analytics.revenueGrowth).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground mb-2">
          ${analytics.totalRevenue.toLocaleString()}
        </div>
        <div className="text-sm text-foreground-muted">
          {timeRange === '7d' ? 'This week' : 
           timeRange === '30d' ? 'This month' :
           timeRange === '90d' ? 'This quarter' : 'This year'}
        </div>
      </div>

      {/* Top Ventures */}
      {analytics.topVentures.length > 0 && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Performing Ventures</h3>
              <p className="text-foreground-muted">Highest value ventures this period</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics.topVentures.map((venture, index) => (
              <div key={venture.id} className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{venture.name}</h4>
                    <p className="text-sm text-foreground-muted">Venture ID: {venture.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    ${venture.value.toLocaleString()}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${
                    venture.growth >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {venture.growth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(venture.growth).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Stats Chart */}
      {analytics.monthlyStats.length > 0 && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Monthly Trends</h3>
              <p className="text-foreground-muted">Growth over the last 6 months</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics.monthlyStats.slice(-6).map((stat) => (
              <div key={stat.month} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{stat.month}</span>
                  <span className="text-sm text-foreground-muted">
                    {stat.ventures} ventures, {stat.users} users
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-glass-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stat.ventures / Math.max(...analytics.monthlyStats.map(s => s.ventures))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-glass-border rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stat.users / Math.max(...analytics.monthlyStats.map(s => s.users))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-highlight/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-highlight" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Platform Activity</h3>
              <p className="text-sm text-foreground-muted">Recent engagement</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Active Users</span>
              <span className="font-medium text-foreground">{analytics.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Total Ventures</span>
              <span className="font-medium text-foreground">{analytics.totalVentures}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Open Opportunities</span>
              <span className="font-medium text-foreground">{analytics.totalOffers}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Growth Metrics</h3>
              <p className="text-sm text-foreground-muted">Performance indicators</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Venture Growth</span>
              <span className={`font-medium ${getGrowthColor(analytics.ventureGrowth)}`}>
                {analytics.ventureGrowth >= 0 ? '+' : ''}{analytics.ventureGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">User Growth</span>
              <span className={`font-medium ${getGrowthColor(analytics.userGrowth)}`}>
                {analytics.userGrowth >= 0 ? '+' : ''}{analytics.userGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Revenue Growth</span>
              <span className={`font-medium ${getGrowthColor(analytics.revenueGrowth)}`}>
                {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
