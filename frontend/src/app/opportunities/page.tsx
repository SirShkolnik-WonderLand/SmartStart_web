'use client'

import { useEffect, useState } from 'react'
import { comprehensiveApiService as apiService } from '@/lib/api-comprehensive'
import { Target, Building, Globe, Shield, Filter, Clock, Users, Star } from 'lucide-react'

export default function OpportunitiesPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [ventures, setVentures] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOpportunitiesData = async () => {
      try {
        const offersResponse = await apiService.getOffers()
        if (offersResponse.success && offersResponse.data) {
          setOffers(offersResponse.data)
        }

        const venturesResponse = await apiService.getVentures()
        if (venturesResponse.success && venturesResponse.data) {
          setVentures(venturesResponse.data)
        }

        const analyticsResponse = await apiService.getAnalytics()
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (error) {
        console.error('Error loading opportunities data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOpportunitiesData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Opportunities</h1>
          <p className="text-xl text-foreground-muted">
            Find roles that match your skills and interests
          </p>
        </div>
        <button className="glass-button flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalOffers || offers.length}</div>
          <div className="text-sm text-foreground-muted">Open Roles</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Building className="w-6 h-6 text-accent" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalVentures || ventures.length}</div>
          <div className="text-sm text-foreground-muted">Companies</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Globe className="w-6 h-6 text-highlight" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{offers.filter(offer => offer.role?.commitment === 'Remote').length}</div>
          <div className="text-sm text-foreground-muted">Remote Roles</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Shield className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{offers.filter(offer => offer.role?.ndaRequired).length}</div>
          <div className="text-sm text-foreground-muted">NDA Required</div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="glass rounded-xl p-6 cursor-pointer group hover:glass-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{offer.role?.title || 'Unknown Role'}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-foreground-muted">🏢 {offer.role?.ventureId || 'Unknown Company'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">T1</span>
                {offer.role?.ndaRequired && (
                  <div className="flex items-center space-x-1 text-xs text-accent">
                    <Shield className="w-3 h-3" />
                    <span>NDA Required</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-foreground-muted mb-4">
              {offer.role?.description || 'No description available'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {offer.role?.skills?.slice(0, 4).map((skill: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-glass-surface text-foreground-muted rounded-md text-xs">
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-foreground-muted mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{offer.role?.commitment || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Remote</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{offer.role?.openings || 0} openings</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>{offer.role?.compensation?.amount || '0%'} equity</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-foreground-muted">
                Posted {new Date(offer.createdAt).toLocaleDateString()}
              </span>
              <button className="wonder-button text-sm">
                Apply Now
              </button>
            </div>
          </div>
        ))}
        
        {offers.length === 0 && (
          <div className="col-span-full glass rounded-xl p-12 text-center">
            <Target className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No opportunities available</h3>
            <p className="text-foreground-muted mb-6">Check back later for new roles that match your skills.</p>
          </div>
        )}
      </div>
    </div>
  )
}