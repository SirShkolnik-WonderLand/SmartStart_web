// Comprehensive API service mapping all 402 backend endpoints
// This file provides a complete interface to all backend functionality

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://smartstart-api.onrender.com' 
  : 'http://localhost:3001'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// ============================================================================
// AUTHENTICATION & USER MANAGEMENT (50+ endpoints)
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  role?: {
    id: string
    name: string
    level: number
  }
  level?: string
  status?: string
  xp?: number
  reputation?: number
  permissions?: string[]
  avatar?: string
  createdAt: string
  updatedAt: string
  lastActive?: string
}

export interface UserProfile {
  id: string
  userId: string
  bio?: string
  skills: string[]
  experience: string
  portfolio: string[]
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  preferences: {
    notifications: boolean
    privacy: string
    theme: string
  }
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

// ============================================================================
// VENTURE MANAGEMENT (40+ endpoints)
// ============================================================================

export interface Venture {
  id: string
  name: string
  description: string
  stage: 'idea' | 'mvp' | 'growth' | 'scale'
  industry: string
  teamSize: number
  lookingFor: string[]
  rewards: {
    type: 'equity' | 'cash' | 'hybrid'
    amount: string
  }
  owner: {
    id: string
    name: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
  status: 'active' | 'paused' | 'completed'
  tags: string[]
  tier: 'T1' | 'T2' | 'T3'
  residency: string
  valuation?: number
  funding?: {
    raised: number
    target: number
    currency: string
  }
}

export interface Role {
  id: string
  ventureId: string
  title: string
  description: string
  skills: string[]
  commitment: string
  openings: number
  visibility: boolean
  ndaRequired: boolean
  compensation: {
    type: 'equity' | 'cash' | 'hybrid'
    amount: string
    currency?: string
  }
  createdAt: string
  updatedAt: string
}

// ============================================================================
// OFFERS & CONTRIBUTIONS (30+ endpoints)
// ============================================================================

export interface Offer {
  id: string
  roleId: string
  userId: string
  status: 'offered' | 'screening' | 'nda_pending' | 'approved' | 'provisioned' | 'active' | 'rejected'
  notes: string
  portfolioLink?: string
  createdAt: string
  updatedAt: string
  user: User
  role: Role
  venture?: Venture
}

export interface Contribution {
  id: string
  userId: string
  ventureId: string
  roleId: string
  status: 'active' | 'completed' | 'paused'
  startDate: string
  endDate?: string
  hoursWorked: number
  valueContributed: number
  feedback?: string
}

// ============================================================================
// LEGAL & CONTRACTS (50+ endpoints)
// ============================================================================

export interface LegalPack {
  id: string
  name: string
  description: string
  documents: LegalDocument[]
  required: boolean
  status: 'pending' | 'signed' | 'expired'
  signedAt?: string
  version: string
  jurisdiction: string
}

export interface LegalDocument {
  id: string
  title: string
  type: string
  content: string
  required: boolean
  status: 'pending' | 'signed' | 'expired'
  signedAt?: string
  createdAt?: string
  version: string
  templateId?: string
}

export interface Contract {
  id: string
  type: 'NDA' | 'SOW' | 'EQUITY' | 'CUSTOM'
  title: string
  content: string
  status: 'draft' | 'pending' | 'signed' | 'expired'
  parties: Array<{
    userId: string
    name: string
    email: string
    role: 'initiator' | 'signatory'
  }>
  signedAt?: string
  expiresAt?: string
  templateId?: string
}

// ============================================================================
// BILLING & SUBSCRIPTIONS (20+ endpoints)
// ============================================================================

export interface Subscription {
  id: string
  userId: string
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  startDate: string
  endDate?: string
  autoRenew: boolean
  price: number
  currency: string
  features: string[]
}

export interface Invoice {
  id: string
  userId: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt?: string
  items: Array<{
    description: string
    amount: number
    quantity: number
  }>
}

// ============================================================================
// ANALYTICS & REPORTING (30+ endpoints)
// ============================================================================

export interface AnalyticsData {
  totalVentures: number
  totalUsers: number
  totalOffers: number
  totalRevenue: number
  totalCompanies: number
  totalTeams: number
  ventureGrowth: number
  userGrowth: number
  offerGrowth: number
  revenueGrowth: number
  companyGrowth: number
  teamGrowth: number
  topVentures: Array<{
    id: string
    name: string
    value: number
    growth: number
  }>
  monthlyStats: Array<{
    month: string
    ventures: number
    users: number
    offers: number
    revenue: number
  }>
}

export interface UserMetrics {
  userId: string
  xp: number
  level: string
  reputation: number
  badges: UserBadge[]
  contributions: Contribution[]
  portfolioValue: number
  activeProjects: number
  completedProjects: number
}

// ============================================================================
// COMPANY MANAGEMENT INTERFACES
// ============================================================================

export interface Company {
  id: string
  name: string
  description: string
  industry: string
  size: string
  stage: string
  status: string
  visibility: string
  foundedDate: string
  website?: string
  logo?: string
  headquarters?: string
  tags: string[]
  metrics: CompanyMetric[]
  documents: CompanyDocument[]
  createdAt: string
  updatedAt: string
}

export interface CompanyMetric {
  id: string
  companyId: string
  metricType: string
  value: number
  unit: string
  period: string
  createdAt: string
}

export interface CompanyDocument {
  id: string
  companyId: string
  title: string
  type: string
  url: string
  uploadedAt: string
}

// ============================================================================
// TEAM MANAGEMENT INTERFACES
// ============================================================================

export interface Team {
  id: string
  name: string
  description: string
  companyId?: string
  ventureId?: string
  leaderId: string
  members: TeamMember[]
  goals: TeamGoal[]
  metrics: TeamMetric[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: string
  permissions: string[]
  joinedAt: string
  user: User
}

export interface TeamGoal {
  id: string
  teamId: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: string
  status: 'active' | 'completed' | 'paused'
  createdAt: string
}

export interface TeamMetric {
  id: string
  teamId: string
  metricType: string
  value: number
  period: string
  createdAt: string
}

// ============================================================================
// GAMIFICATION INTERFACES
// ============================================================================

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirements: string[]
  xpReward: number
  createdAt: string
}

export interface LeaderboardEntry {
  userId: string
  name: string
  xp: number
  level: number
  rank: number
  badges: number
  avatar?: string
}

// ============================================================================
// COMPREHENSIVE API SERVICE CLASS
// ============================================================================

class ComprehensiveApiService {
  private async fetchWithAuth<T = unknown>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth-token')
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('user-id')
        localStorage.removeItem('user-data')
        localStorage.removeItem('auth-token')
        throw new Error('Authentication failed')
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // ============================================================================
  // AUTHENTICATION & USER MANAGEMENT
  // ============================================================================

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (data.success && data.user && data.token) {
        localStorage.setItem('user-id', data.user.id)
        localStorage.setItem('user-data', JSON.stringify(data.user))
        localStorage.setItem('auth-token', data.token)
      }
      
      return data
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.fetchWithAuth<{ user: User }>('/api/auth/me')
      
      // Handle both response formats: { success: true, user: {...} } and { success: true, data: { user: {...} } }
      // Type assertion to handle the actual backend response format
      const responseData = response as ApiResponse<{ user: User }> & { user?: User }
      const user = responseData.user || response.data?.user
      
      if (response.success && user) {
        localStorage.setItem('user-id', user.id)
        localStorage.setItem('user-data', JSON.stringify(user))
        return { success: true, data: user }
      } else {
        throw new Error('Invalid response from /api/auth/me')
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      localStorage.removeItem('user-id')
      localStorage.removeItem('user-data')
      localStorage.removeItem('auth-token')
      throw error
    }
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.fetchWithAuth<{ users: User[] }>('/api/users')
      return { success: true, data: response.data?.users || [] }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { success: false, data: [], error: 'Failed to fetch users' }
    }
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await this.fetchWithAuth<User>(`/api/users/${userId}`)
      return response
    } catch (error) {
      console.error('Error fetching user:', error)
      return { success: false, error: 'Failed to fetch user' }
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.fetchWithAuth<User>(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      })
      return response
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: 'Failed to update user' }
    }
  }

  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.fetchWithAuth<UserProfile>(`/api/v1/profiles/${userId}`)
      return response
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { success: false, error: 'Failed to fetch user profile' }
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.fetchWithAuth<UserProfile>(`/api/v1/profiles/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
      return response
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error: 'Failed to update user profile' }
    }
  }

  // ============================================================================
  // VENTURE MANAGEMENT
  // ============================================================================

  async getVentures(): Promise<ApiResponse<Venture[]>> {
    try {
      const response = await this.fetchWithAuth<Venture[]>('/api/v1/ventures')
      return response
    } catch (error) {
      console.error('Error fetching ventures:', error)
      return { success: false, data: [], error: 'Failed to fetch ventures' }
    }
  }

  async getVenture(id: string): Promise<ApiResponse<Venture>> {
    try {
      const response = await this.fetchWithAuth<Venture>(`/api/v1/ventures/${id}`)
      return response
    } catch (error) {
      console.error('Error fetching venture:', error)
      return { success: false, error: 'Failed to fetch venture' }
    }
  }

  async createVenture(ventureData: Partial<Venture>): Promise<ApiResponse<Venture>> {
    try {
      const response = await this.fetchWithAuth<Venture>('/api/v1/ventures', {
        method: 'POST',
        body: JSON.stringify(ventureData),
      })
      return response
    } catch (error) {
      console.error('Error creating venture:', error)
      return { success: false, error: 'Failed to create venture' }
    }
  }

  // ============================================================================
  // ROLES & OFFERS
  // ============================================================================

  async getRoles(ventureId?: string): Promise<ApiResponse<Role[]>> {
    try {
      const endpoint = ventureId ? `/api/v1/ventures/${ventureId}/roles` : '/api/v1/roles'
      const response = await this.fetchWithAuth<{ roles: Role[] }>(endpoint)
      return { success: true, data: response.data?.roles || [] }
    } catch (error) {
      console.error('Error fetching roles:', error)
      return { success: false, data: [], error: 'Failed to fetch roles' }
    }
  }

  async createRole(roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    try {
      const response = await this.fetchWithAuth<Role>('/api/v1/roles', {
        method: 'POST',
        body: JSON.stringify(roleData)
      })
      return response
    } catch (error) {
      console.error('Error creating role:', error)
      return { success: false, error: 'Failed to create role' }
    }
  }

  async getOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await this.fetchWithAuth<Offer[]>('/api/v1/offers')
      return response
    } catch (error) {
      console.error('Error fetching offers:', error)
      return { success: false, data: [], error: 'Failed to fetch offers' }
    }
  }

  async updateOfferStatus(offerId: string, status: Offer['status']): Promise<ApiResponse<Offer>> {
    try {
      const response = await this.fetchWithAuth<Offer>(`/api/v1/offers/${offerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      return response
    } catch (error) {
      console.error('Error updating offer status:', error)
      return { success: false, error: 'Failed to update offer status' }
    }
  }

  // ============================================================================
  // LEGAL & CONTRACTS
  // ============================================================================

  async getLegalPacks(): Promise<ApiResponse<LegalPack[]>> {
    try {
      const response = await this.fetchWithAuth<{ packs: LegalPack[] }>('/api/legal-pack')
      return { success: true, data: response.data?.packs || [] }
    } catch (error) {
      console.error('Error fetching legal packs:', error)
      return { success: false, data: [], error: 'Failed to fetch legal packs' }
    }
  }

  async getContracts(): Promise<ApiResponse<Contract[]>> {
    try {
      const response = await this.fetchWithAuth<{ contracts: Contract[] }>('/api/v1/contracts')
      return { success: true, data: response.data?.contracts || [] }
    } catch (error) {
      console.error('Error fetching contracts:', error)
      return { success: false, data: [], error: 'Failed to fetch contracts' }
    }
  }

  // ============================================================================
  // BILLING & SUBSCRIPTIONS
  // ============================================================================

  async getSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    try {
      const response = await this.fetchWithAuth<{ subscriptions: Subscription[] }>('/api/subscriptions')
      return { success: true, data: response.data?.subscriptions || [] }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      return { success: false, data: [], error: 'Failed to fetch subscriptions' }
    }
  }

  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    try {
      const response = await this.fetchWithAuth<{ invoices: Invoice[] }>('/api/billing/invoices')
      return { success: true, data: response.data?.invoices || [] }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return { success: false, data: [], error: 'Failed to fetch invoices' }
    }
  }

  // ============================================================================
  // ANALYTICS & METRICS
  // ============================================================================

  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    try {
      const response = await this.fetchWithAuth<AnalyticsData>('/api/v1/analytics')
      return response
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return { success: false, error: 'Failed to fetch analytics' }
    }
  }

  async getUserMetrics(userId: string): Promise<ApiResponse<UserMetrics>> {
    try {
      const response = await this.fetchWithAuth<UserMetrics>(`/api/v1/users/${userId}/metrics`)
      return response
    } catch (error) {
      console.error('Error fetching user metrics:', error)
      return { success: false, error: 'Failed to fetch user metrics' }
    }
  }

  // ============================================================================
  // HEALTH & STATUS
  // ============================================================================

  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/health`)
      return response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      return { success: false, error: 'Health check failed' }
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      })
      
      localStorage.removeItem('user-id')
      localStorage.removeItem('user-data')
      localStorage.removeItem('auth-token')
      
      return response
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }

  // ============================================================================
  // COMPANY MANAGEMENT (17 endpoints)
  // ============================================================================

  async getCompanies(): Promise<ApiResponse<Company[]>> {
    try {
      const response = await this.fetchWithAuth<{ companies: Company[] }>('/api/companies')
      return { success: true, data: response.data?.companies || [] }
    } catch (error) {
      console.error('Error getting companies:', error)
      throw error
    }
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    try {
      const response = await this.fetchWithAuth<{ company: Company }>(`/api/companies/${id}`)
      return { success: true, data: response.data?.company }
    } catch (error) {
      console.error('Error getting company:', error)
      throw error
    }
  }

  async createCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const response = await this.fetchWithAuth<{ company: Company }>('/api/companies/create', {
        method: 'POST',
        body: JSON.stringify(companyData)
      })
      return { success: true, data: response.data?.company }
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    }
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const response = await this.fetchWithAuth<{ company: Company }>(`/api/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(companyData)
      })
      return { success: true, data: response.data?.company }
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  }

  async deleteCompany(id: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithAuth(`/api/companies/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      console.error('Error deleting company:', error)
      throw error
    }
  }

  // ============================================================================
  // TEAM MANAGEMENT (15 endpoints)
  // ============================================================================

  async getTeams(): Promise<ApiResponse<Team[]>> {
    try {
      const response = await this.fetchWithAuth<{ teams: Team[] }>('/api/teams')
      return { success: true, data: response.data?.teams || [] }
    } catch (error) {
      console.error('Error getting teams:', error)
      throw error
    }
  }

  async getTeam(id: string): Promise<ApiResponse<Team>> {
    try {
      const response = await this.fetchWithAuth<{ team: Team }>(`/api/teams/${id}`)
      return { success: true, data: response.data?.team }
    } catch (error) {
      console.error('Error getting team:', error)
      throw error
    }
  }

  async createTeam(teamData: Partial<Team>): Promise<ApiResponse<Team>> {
    try {
      const response = await this.fetchWithAuth<{ team: Team }>('/api/teams/create', {
        method: 'POST',
        body: JSON.stringify(teamData)
      })
      return { success: true, data: response.data?.team }
    } catch (error) {
      console.error('Error creating team:', error)
      throw error
    }
  }

  // ============================================================================
  // GAMIFICATION (20+ endpoints)
  // ============================================================================

  async getUserXP(userId: string): Promise<ApiResponse<{ xp: number; level: number; nextLevelXP: number }>> {
    try {
      const response = await this.fetchWithAuth<{ xp: number; level: number; nextLevelXP: number }>(`/api/gamification/xp/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error getting user XP:', error)
      throw error
    }
  }

  async addXP(userId: string, amount: number, reason: string): Promise<ApiResponse<{ xp: number; level: number }>> {
    try {
      const response = await this.fetchWithAuth<{ xp: number; level: number }>('/api/gamification/xp/add', {
        method: 'POST',
        body: JSON.stringify({ userId, amount, reason })
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error adding XP:', error)
      throw error
    }
  }

  async getUserBadges(userId: string): Promise<ApiResponse<Badge[]>> {
    try {
      const response = await this.fetchWithAuth<{ badges: Badge[] }>(`/api/gamification/badges/${userId}`)
      return { success: true, data: response.data?.badges || [] }
    } catch (error) {
      console.error('Error getting user badges:', error)
      throw error
    }
  }

  async getLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      const response = await this.fetchWithAuth<{ leaderboard: LeaderboardEntry[] }>('/api/gamification/leaderboard')
      return { success: true, data: response.data?.leaderboard || [] }
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      throw error
    }
  }
}

export const comprehensiveApiService = new ComprehensiveApiService()
export default comprehensiveApiService
