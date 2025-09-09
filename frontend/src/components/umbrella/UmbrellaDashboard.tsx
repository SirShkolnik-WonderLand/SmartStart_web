'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Network, 
  DollarSign, 
  Users, 
  TrendingUp,
  Plus,
  Eye,
  Settings,
  FileText,
  BarChart3,
  UserPlus
} from 'lucide-react'

interface UmbrellaRelationship {
  id: string
  referrerId: string
  referredId: string
  status: string
  defaultShareRate: number
  createdAt: string
  referrer: { id: string; name: string; email: string; level: string }
  referred: { id: string; name: string; email: string; level: string }
  revenueShares: Array<{
    id: string
    projectRevenue: number
    shareAmount: number
    status: string
    calculatedAt: string
  }>
}

interface RevenueShare {
  id: string
  projectRevenue: number
  shareAmount: number
  status: string
  calculatedAt: string
  project: { id: string; name: string }
  referred: { id: string; name: string; email: string }
}

export default function UmbrellaDashboard() {
  const [relationships, setRelationships] = useState<UmbrellaRelationship[]>([])
  const [revenueShares, setRevenueShares] = useState<RevenueShare[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadUmbrellaData()
  }, [])

  const loadUmbrellaData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token')
      
      // Load relationships
      const relationshipsResponse = await fetch('/api/umbrella/relationships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (relationshipsResponse.ok) {
        const relationshipsData = await relationshipsResponse.json()
        setRelationships(relationshipsData.data || [])
      }

      // Load revenue shares
      const sharesResponse = await fetch('/api/umbrella/revenue/shares', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (sharesResponse.ok) {
        const sharesData = await sharesResponse.json()
        setRevenueShares(sharesData.data || [])
      }
    } catch (error) {
      console.error('Failed to load umbrella data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING_AGREEMENT': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Active' },
      'SUSPENDED': { color: 'bg-red-100 text-red-800', text: 'Suspended' },
      'TERMINATED': { color: 'bg-gray-100 text-gray-800', text: 'Terminated' }
    }
    
    const config = statusConfig[status] || statusConfig['PENDING_AGREEMENT']
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'CALCULATED': { color: 'bg-blue-100 text-blue-800', text: 'Calculated' },
      'APPROVED': { color: 'bg-purple-100 text-purple-800', text: 'Approved' },
      'PAID': { color: 'bg-green-100 text-green-800', text: 'Paid' },
      'FAILED': { color: 'bg-red-100 text-red-800', text: 'Failed' }
    }
    
    const config = statusConfig[status] || statusConfig['PENDING']
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const totalRevenue = revenueShares.reduce((sum, share) => sum + share.shareAmount, 0)
  const activeRelationships = relationships.filter(rel => rel.status === 'ACTIVE').length
  const pendingShares = revenueShares.filter(share => share.status === 'CALCULATED').length
  const paidShares = revenueShares.filter(share => share.status === 'PAID').length

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
          <h1 className="text-3xl font-bold text-gray-900">Umbrella Network</h1>
          <p className="text-gray-600">Manage your referral relationships and revenue sharing</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Relationship
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Relationships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRelationships}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingShares}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationships.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relationships.slice(0, 5).map((relationship) => (
                  <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{relationship.referred.name}</p>
                        <p className="text-sm text-gray-600">{relationship.referred.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(relationship.status)}
                      <span className="text-sm text-gray-600">
                        {relationship.defaultShareRate}% share
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relationships.map((relationship) => (
                  <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Network className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{relationship.referred.name}</p>
                        <p className="text-sm text-gray-600">{relationship.referred.email}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(relationship.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(relationship.status)}
                      <span className="text-sm text-gray-600">
                        {relationship.defaultShareRate}% share
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Shares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueShares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{share.project.name}</p>
                        <p className="text-sm text-gray-600">From {share.referred.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(share.calculatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getPaymentStatusBadge(share.status)}
                      <span className="text-sm font-medium">
                        ${share.shareAmount.toFixed(2)}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Network Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">+12%</div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">+25%</div>
                <p className="text-sm text-gray-600">This quarter</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
