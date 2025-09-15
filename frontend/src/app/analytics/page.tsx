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
import { apiService, UserAnalytics } from '@/lib/api-unified'

export default function AnalyticsPage() {
  const [data, setData] = useState<UserAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await apiService.getAnalytics()
        if (response.success && response.data) {
          setData(response.data)
        } else {
          console.error('Failed to load analytics:', response.error)
        }
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
          <h1 className="text-3xl font-bold text-foreground">User Analytics</h1>
          <p className="text-foreground-muted">Track your personal performance and growth metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-glass-surface rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-foreground-muted" />
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
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.total_ventures)}</div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Total Ventures</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-accent" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.active_ventures)}</div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Active Ventures</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-highlight" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.buz_balance)}</div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">BUZ Balance</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-success" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.xp_points)}</div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">XP Points</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{data.level}</div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Current Level</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatNumber(data.total_contributions)}</div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Total Contributions</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-highlight" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{formatCurrency(data.portfolio_value)}</div>
            </div>
          </div>
          <div className="text-sm text-foreground-muted">Portfolio Value</div>
        </div>
      </div>

      {/* Summary */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
        <div className="text-foreground-muted">
          <p>You have <strong>{data.total_ventures}</strong> total ventures with <strong>{data.active_ventures}</strong> currently active.</p>
          <p>Your current level is <strong>{data.level}</strong> with <strong>{data.xp_points}</strong> XP points.</p>
          <p>You have contributed <strong>{data.total_contributions}</strong> times and have a portfolio value of <strong>{formatCurrency(data.portfolio_value)}</strong>.</p>
          <p>Your BUZ token balance is <strong>{data.buz_balance}</strong> tokens.</p>
        </div>
      </div>
    </div>
  )
}
