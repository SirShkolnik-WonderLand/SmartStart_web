'use client'

import { useEffect, useState } from 'react'
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  Users,
  Calendar,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react'
import { comprehensiveApiService as apiService, Offer } from '@/lib/api-comprehensive'

export default function ApprovalsPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const response = await apiService.getOffers()
        if (response.success && response.data) {
          setOffers(response.data)
        }
      } catch (error) {
        console.error('Error loading offers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOffers()
  }, [])

  const handleApprove = async (offerId: string) => {
    try {
      await apiService.updateOfferStatus(offerId, 'approved')
      setOffers(offers.map(offer => 
        offer.id === offerId ? { ...offer, status: 'approved' } : offer
      ))
    } catch (error) {
      console.error('Error approving offer:', error)
    }
  }

  const handleReject = async (offerId: string) => {
    try {
      await apiService.updateOfferStatus(offerId, 'rejected')
      setOffers(offers.map(offer => 
        offer.id === offerId ? { ...offer, status: 'rejected' } : offer
      ))
    } catch (error) {
      console.error('Error rejecting offer:', error)
    }
  }

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true
    return offer.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offered': return 'text-warning'
      case 'approved': return 'text-success'
      case 'rejected': return 'text-destructive'
      default: return 'text-foreground-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'offered': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approvals</h1>
          <p className="text-foreground-muted">Review and manage pending offers and requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search offers..."
              className="pl-10 pr-4 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-glass-surface border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {offers.filter(o => o.status === 'offered').length}
            </span>
          </div>
          <div className="text-sm text-foreground-muted">Pending Review</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {offers.filter(o => o.status === 'approved').length}
            </span>
          </div>
          <div className="text-sm text-foreground-muted">Approved</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {offers.filter(o => o.status === 'rejected').length}
            </span>
          </div>
          <div className="text-sm text-foreground-muted">Rejected</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{offers.length}</span>
          </div>
          <div className="text-sm text-foreground-muted">Total Offers</div>
        </div>
      </div>

      {/* Offers List */}
      <div className="glass rounded-xl">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Recent Offers</h2>
        </div>
        <div className="divide-y divide-border/50">
          {filteredOffers.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No offers found</h3>
              <p className="text-foreground-muted">There are no offers matching your current filter.</p>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <div key={offer.id} className="p-6 hover:bg-glass-surface transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{offer.user.name}</h3>
                        <p className="text-sm text-foreground-muted">{offer.user.email}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                        {getStatusIcon(offer.status)}
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="ml-13">
                      <p className="text-foreground-body mb-2">
                        <strong>Role:</strong> {offer.role?.title || 'Unknown Role'}
                      </p>
                      {offer.notes && (
                        <p className="text-foreground-muted text-sm mb-3">
                          <strong>Notes:</strong> {offer.notes}
                        </p>
                      )}
                      {offer.portfolioLink && (
                        <a 
                          href={offer.portfolioLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View Portfolio →
                        </a>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </div>
                        {offer.role?.ndaRequired && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            NDA Required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {offer.status === 'offered' && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(offer.id)}
                        className="px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(offer.id)}
                        className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-foreground-muted" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
