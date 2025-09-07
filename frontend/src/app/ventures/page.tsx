'use client'

import { useEffect, useState } from 'react'
import { comprehensiveApiService as apiService, AnalyticsData, Venture } from '@/lib/api-comprehensive'
import { Briefcase, Users, Calendar, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default function VenturesPage() {
  const [ventures, setVentures] = useState<Venture[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVenturesData = async () => {
      try {
        const venturesResponse = await apiService.getVentures()
        if (venturesResponse.success && venturesResponse.data) {
          setVentures(venturesResponse.data)
        }

        const analyticsResponse = await apiService.getAnalytics()
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (error) {
        console.error('Error loading ventures data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVenturesData()
  }, [])


  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading ventures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Ventures</h1>
          <p className="text-xl text-foreground-muted">
            Discover and manage your ventures
          </p>
        </div>
        <Link 
          href="/ventures/create"
          className="wonder-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Venture
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalVentures || ventures.length}</div>
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
          <div className="text-sm text-foreground-muted">Active Teams</div>
          <div className="text-xs text-success mt-1">+{analytics?.userGrowth || 0}%</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Calendar className="w-6 h-6 text-highlight" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{ventures.filter(v => {
            const created = new Date(v.createdAt)
            const now = new Date()
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
          }).length}</div>
          <div className="text-sm text-foreground-muted">This Month</div>
          <div className="text-xs text-success mt-1">New ventures</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">+{analytics?.ventureGrowth || 0}%</div>
          <div className="text-sm text-foreground-muted">Growth Rate</div>
          <div className="text-xs text-success mt-1">This quarter</div>
        </div>
      </div>

      {/* Ventures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ventures.map((venture) => (
          <div key={venture.id} className="glass rounded-xl p-6 cursor-pointer group hover:glass-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{venture.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">{venture.tier}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white">{venture.stage?.toUpperCase()}</span>
                </div>
              </div>
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            
            <p className="text-foreground-muted mb-4">
              {venture.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-foreground-muted mb-4">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {venture.teamSize} members
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(venture.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {venture.tags?.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-glass-surface text-foreground-muted rounded-md text-xs">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-foreground-muted">{venture.industry}</span>
              <button className="px-3 py-1 border border-glass-border rounded-md hover:bg-glass-highlight transition-colors text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
        
        {ventures.length === 0 && (
          <div className="col-span-full glass rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No ventures yet</h3>
            <p className="text-foreground-muted mb-6">Create your first venture to get started on your entrepreneurial journey.</p>
            <Link 
              href="/ventures/create"
              className="wonder-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Venture
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}