'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { getApiBaseUrl, getAuthToken } from '@/lib/env'

interface Venture {
  id: string
  name: string
  purpose: string
  region: string
  status: 'ACTIVE' | 'PLANNING' | 'INACTIVE'
  createdAt: string
  teamCount: number
  projectCount: number
  revenue: number
  growth: number
  ideasCount?: number
  legalDocumentsCount?: number
  umbrellaRelationshipsCount?: number
}

export default function VenturesPage() {
  const [ventures, setVentures] = useState<Venture[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVentures: 0,
    activeTeams: 0,
    totalRevenue: 0,
    averageGrowth: 0
  })

  useEffect(() => {
    loadVentures()
  }, [])

  const loadVentures = async () => {
    try {
      setLoading(true)
      const API_BASE = getApiBaseUrl()
      const token = getAuthToken()
      if (!token) throw new Error('Missing auth token')

      const response = await fetch(`${API_BASE}/api/ventures/list/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch ventures')
      }

      const data = await response.json()
      const venturesData: Venture[] = Array.isArray(data.data) ? data.data : (data.data?.ventures || [])
      setVentures(venturesData)

      // Calculate stats from backend data
      const totalRevenue = venturesData.reduce((sum, v) => sum + (v.revenue || 0), 0)
      const activeTeams = venturesData.reduce((sum, v) => sum + (v.teamCount || 0), 0)
      const averageGrowth = venturesData.length > 0 ? 
        venturesData.reduce((sum, v) => sum + (v.growth || 0), 0) / venturesData.length : 0

      setStats({
        totalVentures: venturesData.length,
        activeTeams,
        totalRevenue,
        averageGrowth
      })
      
    } catch (error) {
      console.error('Error loading ventures:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { color: 'bg-success/20 text-success border-success/30', text: 'Active' },
      PLANNING: { color: 'bg-warning/20 text-warning border-warning/30', text: 'Planning' },
      INACTIVE: { color: 'bg-foreground-muted/20 text-foreground-muted border-foreground-muted/30', text: 'Inactive' }
    }
    const { color, text } = config[status as keyof typeof config] || config.INACTIVE
    return <Badge className={`${color} border`}>{text}</Badge>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ventures</h1>
            <p className="text-gray-600 mt-1">Discover and manage your ventures</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Venture
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Ventures</CardTitle>
              <Briefcase className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalVentures}</div>
              <p className="text-xs text-foreground-muted mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-foreground-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.activeTeams}</div>
              <p className="text-xs text-foreground-muted mt-1">Across all ventures</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-foreground-muted mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Avg Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+{stats.averageGrowth.toFixed(1)}%</div>
              <p className="text-xs text-foreground-muted mt-1">This quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Ventures Grid */}
        {ventures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ventures.map((venture) => (
              <Card key={venture.id} className="glass-card cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                          {venture.name}
                        </CardTitle>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(venture.status)}
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {venture.region}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{venture.purpose}</p>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-gray-600">Team</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{venture.teamCount}</div>
                      <div className="text-xs text-gray-500">Active members</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600">Projects</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{venture.projectCount}</div>
                      <div className="text-xs text-gray-500">In progress</div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{venture.ideasCount || 0}</div>
                      <div className="text-xs text-gray-500">Ideas</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Building2 className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{venture.legalDocumentsCount || 0}</div>
                      <div className="text-xs text-gray-500">Legal</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Globe className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{venture.umbrellaRelationshipsCount || 0}</div>
                      <div className="text-xs text-gray-500">Network</div>
                    </div>
                  </div>

                  {/* Revenue Section */}
                  {venture.revenue > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(venture.revenue)}</div>
                            <div className="text-xs text-gray-600">Total Revenue</div>
                          </div>
                        </div>
                        {venture.growth > 0 && (
                          <div className="flex items-center space-x-1 text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-sm font-medium">+{venture.growth}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(venture.createdAt)}</span>
                    </div>
                    <Link href={`/ventures/${venture.id}`}>
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 group-hover:bg-purple-50">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ventures yet</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Start building your entrepreneurial journey by creating your first venture.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Venture
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}