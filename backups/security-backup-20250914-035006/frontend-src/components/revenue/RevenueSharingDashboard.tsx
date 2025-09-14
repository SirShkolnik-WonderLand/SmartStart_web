'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface RevenueData {
  totalRevenue: number
  totalDistributed: number
  pendingDistributions: number
  calculations: RevenueCalculation[]
  distributions: RevenueDistribution[]
  analytics: RevenueAnalytics
}

interface RevenueCalculation {
  id: string
  ventureId: string
  ventureName: string
  totalRevenue: number
  calculationPeriod: string
  calculationDate: string
  status: 'PENDING' | 'DISTRIBUTED' | 'CANCELLED'
  participantCount: number
}

interface RevenueDistribution {
  id: string
  calculationId: string
  recipientName: string
  recipientType: 'TEAM_MEMBER' | 'UMBRELLA_NETWORK'
  amount: number
  percentage: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  scheduledAt: string
  completedAt?: string
}

interface RevenueAnalytics {
  totalCalculations: number
  totalRevenue: number
  totalDistributed: number
  distributionsByStatus: Array<{
    status: string
    count: number
    amount: number
  }>
  topRecipients: Array<{
    recipientId: string
    recipientName: string
    totalAmount: number
    distributionCount: number
  }>
  revenueByPeriod: Array<{
    period: string
    totalRevenue: number
    calculationCount: number
  }>
}

interface RevenueSharingDashboardProps {
  ventureId?: string
  userId?: string
  onRefresh?: () => void
}

export default function RevenueSharingDashboard({ 
  ventureId, 
  userId, 
  onRefresh 
}: RevenueSharingDashboardProps) {
  const [data, setData] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'calculations' | 'distributions' | 'analytics'>('overview')

  useEffect(() => {
    loadRevenueData()
  }, [ventureId, userId])

  const loadRevenueData = async () => {
    try {
      setIsLoading(true)
      // This would call the actual API
      // const response = await apiService.getRevenueSharingData(ventureId, userId)
      // setData(response.data)
      
      // Mock data for now
      setData({
        totalRevenue: 125000,
        totalDistributed: 118750,
        pendingDistributions: 6250,
        calculations: [
          {
            id: '1',
            ventureId: 'venture_1',
            ventureName: 'Alpha Project',
            totalRevenue: 50000,
            calculationPeriod: 'monthly',
            calculationDate: '2024-02-01T00:00:00Z',
            status: 'DISTRIBUTED',
            participantCount: 5
          },
          {
            id: '2',
            ventureId: 'venture_1',
            ventureName: 'Alpha Project',
            totalRevenue: 75000,
            calculationPeriod: 'monthly',
            calculationDate: '2024-03-01T00:00:00Z',
            status: 'PENDING',
            participantCount: 6
          }
        ],
        distributions: [
          {
            id: '1',
            calculationId: '1',
            recipientName: 'John Doe',
            recipientType: 'TEAM_MEMBER',
            amount: 20000,
            percentage: 40,
            status: 'COMPLETED',
            scheduledAt: '2024-02-01T00:00:00Z',
            completedAt: '2024-02-01T12:00:00Z'
          },
          {
            id: '2',
            calculationId: '1',
            recipientName: 'Jane Smith',
            recipientType: 'TEAM_MEMBER',
            amount: 10000,
            percentage: 20,
            status: 'COMPLETED',
            scheduledAt: '2024-02-01T00:00:00Z',
            completedAt: '2024-02-01T12:00:00Z'
          },
          {
            id: '3',
            calculationId: '2',
            recipientName: 'Bob Johnson',
            recipientType: 'TEAM_MEMBER',
            amount: 30000,
            percentage: 40,
            status: 'PENDING',
            scheduledAt: '2024-03-01T00:00:00Z'
          }
        ],
        analytics: {
          totalCalculations: 2,
          totalRevenue: 125000,
          totalDistributed: 118750,
          distributionsByStatus: [
            { status: 'COMPLETED', count: 2, amount: 30000 },
            { status: 'PENDING', count: 1, amount: 30000 }
          ],
          topRecipients: [
            { recipientId: '1', recipientName: 'John Doe', totalAmount: 20000, distributionCount: 1 },
            { recipientId: '2', recipientName: 'Jane Smith', totalAmount: 10000, distributionCount: 1 },
            { recipientId: '3', recipientName: 'Bob Johnson', totalAmount: 30000, distributionCount: 1 }
          ],
          revenueByPeriod: [
            { period: 'monthly', totalRevenue: 125000, calculationCount: 2 }
          ]
        }
      })
    } catch (error) {
      console.error('Error loading revenue data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'DISTRIBUTED': 'bg-green-100 text-green-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      'PENDING': <Clock className="w-4 h-4" />,
      'PROCESSING': <Clock className="w-4 h-4" />,
      'COMPLETED': <CheckCircle className="w-4 h-4" />,
      'FAILED': <AlertCircle className="w-4 h-4" />,
      'CANCELLED': <AlertCircle className="w-4 h-4" />,
      'DISTRIBUTED': <CheckCircle className="w-4 h-4" />
    }
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load revenue data</p>
        <Button onClick={loadRevenueData} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Sharing Dashboard</h2>
          <p className="text-muted-foreground">Track and manage revenue distributions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onRefresh} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Distributed</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalDistributed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(data.pendingDistributions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">{data.calculations[0]?.participantCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Distribution Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Distribution Progress</span>
              <span className="text-sm text-muted-foreground">
                {((data.totalDistributed / data.totalRevenue) * 100).toFixed(1)}% Complete
              </span>
            </div>
            <Progress 
              value={(data.totalDistributed / data.totalRevenue) * 100} 
              className="h-2" 
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(data.totalRevenue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'calculations', label: 'Calculations', icon: Calculator },
          { id: 'distributions', label: 'Distributions', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Calculations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.calculations.slice(0, 3).map((calculation) => (
                  <div key={calculation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{calculation.ventureName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(calculation.calculationDate)} • {calculation.participantCount} participants
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(calculation.totalRevenue)}</p>
                      <Badge className={getStatusColor(calculation.status)}>
                        {getStatusIcon(calculation.status)}
                        <span className="ml-1">{calculation.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Top Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.analytics.topRecipients.slice(0, 5).map((recipient, index) => (
                  <div key={recipient.recipientId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{recipient.recipientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {recipient.distributionCount} distributions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(recipient.totalAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'calculations' && (
        <div className="space-y-4">
          {data.calculations.map((calculation) => (
            <Card key={calculation.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{calculation.ventureName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(calculation.calculationDate)} • {calculation.participantCount} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(calculation.totalRevenue)}</p>
                      <p className="text-sm text-muted-foreground">{calculation.calculationPeriod}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(calculation.status)}>
                        {getStatusIcon(calculation.status)}
                        <span className="ml-1">{calculation.status}</span>
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'distributions' && (
        <div className="space-y-4">
          {data.distributions.map((distribution) => (
            <Card key={distribution.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{distribution.recipientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {distribution.recipientType} • {distribution.percentage}% share
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled {formatDate(distribution.scheduledAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(distribution.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {distribution.percentage}% of total
                      </p>
                    </div>
                    <Badge className={getStatusColor(distribution.status)}>
                      {getStatusIcon(distribution.status)}
                      <span className="ml-1">{distribution.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.analytics.distributionsByStatus.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(status.status)}>
                        {getStatusIcon(status.status)}
                        <span className="ml-1">{status.status}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {status.count} distributions
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(status.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Period */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.analytics.revenueByPeriod.map((period) => (
                  <div key={period.period} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{period.period}</p>
                      <p className="text-sm text-muted-foreground">
                        {period.calculationCount} calculations
                      </p>
                    </div>
                    <span className="font-medium">{formatCurrency(period.totalRevenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
