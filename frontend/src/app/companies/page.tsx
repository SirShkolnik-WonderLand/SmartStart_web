'use client'

import { useEffect, useState } from 'react'
import { comprehensiveApiService as apiService, Company, AnalyticsData } from '@/lib/api-comprehensive'
import { Building, Users, Calendar, TrendingUp, Plus, Search, Filter, Globe, MapPin } from 'lucide-react'
import { CompanyForm } from '@/components/company/CompanyForm'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const loadCompaniesData = async () => {
      try {
        const companiesResponse = await apiService.getCompanies()
        if (companiesResponse.success && companiesResponse.data) {
          setCompanies(companiesResponse.data)
        }

        const analyticsResponse = await apiService.getAnalytics()
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (error) {
        console.error('Error loading companies data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompaniesData()
  }, [])

  const handleCompanyCreated = (newCompany: Company) => {
    setCompanies(prev => [newCompany, ...prev])
    setShowCreateModal(false)
  }

  const handleCompanyUpdated = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(company => 
      company.id === updatedCompany.id ? updatedCompany : company
    ))
  }

  const handleCompanyDeleted = (companyId: string) => {
    setCompanies(prev => prev.filter(company => company.id !== companyId))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading companies...</p>
        </div>
      </div>
    )
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = filterIndustry === 'all' || company.industry === filterIndustry
    return matchesSearch && matchesIndustry
  })

  const industries = [...new Set(companies.map(c => c.industry))]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Companies</h1>
          <p className="text-xl text-foreground-muted">
            Discover and manage companies in the ecosystem
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="wonder-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{companies.length}</div>
          <div className="text-sm text-foreground-muted">Total Companies</div>
          <div className="text-xs text-success mt-1">+{analytics?.companyGrowth || 0}%</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{analytics?.totalUsers || 0}</div>
          <div className="text-sm text-foreground-muted">Active Members</div>
          <div className="text-xs text-success mt-1">+{analytics?.userGrowth || 0}%</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Calendar className="w-6 h-6 text-highlight" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{companies.filter(c => {
            const created = new Date(c.createdAt)
            const now = new Date()
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
          }).length}</div>
          <div className="text-sm text-foreground-muted">This Month</div>
          <div className="text-xs text-success mt-1">New companies</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{industries.length}</div>
          <div className="text-sm text-foreground-muted">Industries</div>
          <div className="text-xs text-success mt-1">Diverse sectors</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-foreground-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-foreground-muted" />
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="bg-glass-surface border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="glass rounded-xl p-6 cursor-pointer group hover:glass-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {company.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    {company.industry}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    {company.stage?.toUpperCase()}
                  </span>
                </div>
              </div>
              <Building className="w-6 h-6 text-primary" />
            </div>
            
            <p className="text-foreground-muted mb-4 line-clamp-3">
              {company.description}
            </p>
            
            <div className="space-y-2 mb-4">
              {company.website && (
                <div className="flex items-center text-sm text-foreground-muted">
                  <Globe className="w-4 h-4 mr-2" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {company.website}
                  </a>
                </div>
              )}
              {company.headquarters && (
                <div className="flex items-center text-sm text-foreground-muted">
                  <MapPin className="w-4 h-4 mr-2" />
                  {company.headquarters}
                </div>
              )}
              <div className="flex items-center text-sm text-foreground-muted">
                <Calendar className="w-4 h-4 mr-2" />
                Founded: {new Date(company.foundedDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {company.tags?.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-glass-surface text-foreground-muted rounded-md text-xs">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-foreground-muted">{company.size}</span>
              <button className="px-3 py-1 border border-glass-border rounded-md hover:bg-glass-highlight transition-colors text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
        
        {filteredCompanies.length === 0 && (
          <div className="col-span-full glass rounded-xl p-12 text-center">
            <Building className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm || filterIndustry !== 'all' ? 'No companies found' : 'No companies yet'}
            </h3>
            <p className="text-foreground-muted mb-6">
              {searchTerm || filterIndustry !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Add your first company to get started building the ecosystem.'
              }
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="wonder-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Company
            </button>
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-4xl">
            <CompanyForm 
              onSuccess={handleCompanyCreated}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
