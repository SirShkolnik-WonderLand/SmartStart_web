'use client'

import { useState, useEffect } from 'react'
import { getApiBaseUrl } from '@/lib/env';
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
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    loadUmbrellaData()
  }, [])

  const loadUmbrellaData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token')
      
      // Use correct API base URL
      const API_BASE = (process as any).env.NODE_ENV === 'production' 
        ? 'https://smartstart-api.onrender.com' 
        : 'http://localhost:3001'
      
      // Load relationships
      const relationshipsResponse = await fetch(`${API_BASE}/api/umbrella/relationships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (relationshipsResponse.ok) {
        const relationshipsData = await relationshipsResponse.json()
        setRelationships(relationshipsData.data || [])
      } else {
        console.error('Failed to load relationships:', relationshipsResponse.status, relationshipsResponse.statusText)
        setRelationships([])
      }

      // Load revenue shares
      const sharesResponse = await fetch(`${API_BASE}/api/umbrella/revenue/shares`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (sharesResponse.ok) {
        const sharesData = await sharesResponse.json()
        setRevenueShares(sharesData.data || [])
      } else {
        console.error('Failed to load revenue shares:', sharesResponse.status, sharesResponse.statusText)
        setRevenueShares([])
      }
    } catch (error) {
      console.error('Failed to load umbrella data:', error)
      setRelationships([])
      setRevenueShares([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'PENDING_AGREEMENT': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Active' },
      'SUSPENDED': { color: 'bg-red-100 text-red-800', text: 'Suspended' },
      'TERMINATED': { color: 'bg-gray-100 text-gray-800', text: 'Terminated' }
    }
    
    const config = statusConfig[status] || statusConfig['PENDING_AGREEMENT']
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
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
          <h1 className="text-3xl font-bold text-foreground">Umbrella Network</h1>
          <p className="text-foreground-muted">Manage your referral relationships and revenue sharing</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            className="glass-button"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Relationship
          </Button>
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="glass-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-foreground-muted">From all relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Active Relationships</CardTitle>
            <Users className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeRelationships}</div>
            <p className="text-xs text-foreground-muted">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Pending Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingShares}</div>
            <p className="text-xs text-foreground-muted">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">Total Referrals</CardTitle>
            <Network className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{relationships.length}</div>
            <p className="text-xs text-foreground-muted">All time</p>
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
              {relationships.length > 0 ? (
                <div className="space-y-4">
                  {relationships.slice(0, 5).map((relationship) => (
                    <div key={relationship.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{relationship.referred.name}</p>
                          <p className="text-sm text-foreground-muted">{relationship.referred.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(relationship.status)}
                        <span className="text-sm text-foreground-muted">
                          {relationship.defaultShareRate}% share
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No umbrella relationships yet</h3>
                  <p className="text-gray-600 mb-4">Create your first umbrella relationship to start earning revenue shares</p>
                  <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Relationship
                  </Button>
                </div>
              )}
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

      {/* Create Relationship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Umbrella Relationship</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referred User Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Rate (%)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  defaultValue="1.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="glass-button"
                onClick={() => {
                  // TODO: Implement create relationship API call
                  setShowCreateModal(false);
                }}
              >
                Create Relationship
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite User to SmartStart</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Join me on SmartStart and let's build something amazing together!"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="glass-button"
                onClick={() => {
                  // TODO: Implement invite user API call
                  setShowInviteModal(false);
                }}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
