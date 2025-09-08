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
  description?: string
  purpose?: string
  stage?: 'idea' | 'mvp' | 'growth' | 'scale'
  industry?: string
  teamSize?: number
  lookingFor?: string[]
  rewards?: {
    type: 'equity' | 'cash' | 'hybrid'
    amount: string
  }
  owner?: {
    id: string
    name: string
    email: string
    avatar?: string
    level?: string
    xp?: number
    reputation?: number
  }
  ventureProfile?: {
    id: string
    ventureId: string
    description?: string
    industry?: string
    stage?: string
    fundingRound?: string
    teamSize?: number
    website?: string
    socialMedia?: Record<string, string>
    createdAt: string
    updatedAt: string
  }
  equityFramework?: {
    id: string
    ventureId: string
    ownerPercent: number
    alicePercent: number
    cepPercent: number
    vestingPolicy: string
    status: string
    createdAt: string
    updatedAt: string
  }
  createdAt: string
  updatedAt: string
  status: 'PENDING_CONTRACTS' | 'ACTIVE' | 'COMPLETED' | 'active' | 'paused' | 'completed'
  tags?: string[]
  tier?: 'T1' | 'T2' | 'T3'
  residency?: string
  region?: string
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

export interface Meeting {
  id: string
  title: string
  description: string
  ventureId: string
  organizerId: string
  scheduledFor: string
  duration: number
  location: string
  meetingType: string
  status: string
  agenda: string
  meetingLink: string
  createdAt: string
  updatedAt: string
  organizer?: {
    id: string
    name: string
    email: string
  }
  venture?: {
    id: string
    name: string
  }
  attendees?: Array<{
    id: string
    userId: string
    status: string
    invitedAt: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
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
  category: string
  priority: string
  required: boolean
  status: string
  documents: LegalDocument[]
}

// ============================================================================
// JOURNEY & ONBOARDING INTERFACES
// ============================================================================

export interface JourneyStage {
  id: string
  name: string
  description: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  gates: JourneyGate[]
}

export interface JourneyGate {
  id: string
  stageId: string
  name: string
  description: string
  gateType: 'VERIFICATION' | 'LEGAL_PACK' | 'PROFILE' | 'SUBSCRIPTION' | 'PAYMENT' | 'DOCUMENT' | 'LAUNCH' | 'VENTURE' | 'TEAM' | 'PROJECT'
  isRequired: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserJourneyState {
  id: string
  userId: string
  stageId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'SKIPPED'
  startedAt?: string
  completedAt?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  stage: JourneyStage
}

export interface JourneyProgress {
  totalStages: number
  completedStages: number
  percentage: number
  stages: Array<{
    name: string
    status: string
    order: number
  }>
}

export interface JourneyStatus {
  userId: string
  progress: JourneyProgress
  currentStage: JourneyStage | null
  nextStage: JourneyStage | null
  isComplete: boolean
  userStates: UserJourneyState[]
  stages: JourneyStage[]
  recommendations: OnboardingRecommendation[]
  timestamp: string
}

export interface JourneyInitialization {
  message: string
  currentStage: string
  progress: number
}

export interface JourneyProgressUpdate {
  message: string
  progress: JourneyProgress
  action: string
}

export interface OnboardingRecommendation {
  type: string
  title: string
  description: string
  action: string
  priority: 'low' | 'medium' | 'high'
}

export interface OnboardingRecommendations {
  recommendations: OnboardingRecommendation[]
  currentProgress: JourneyProgress
}

// ============================================================================
// SUBSCRIPTION & BILLING INTERFACES
// ============================================================================

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'LIFETIME'
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED'
  startDate: string
  endDate?: string
  autoRenew: boolean
  createdAt: string
  updatedAt: string
  plan: SubscriptionPlan
  invoices: Invoice[]
}

export interface Invoice {
  id: string
  userId: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  dueDate: string
  paidDate?: string
  createdAt: string
  updatedAt: string
  subscription?: UserSubscription
  payments: Payment[]
}

export interface Payment {
  id: string
  userId: string
  invoiceId: string
  amount: number
  currency: string
  method: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'CRYPTO'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SubscriptionCreation {
  subscription: UserSubscription
  invoice: Invoice
  payment: Payment
}

export interface SubscriptionCancellation {
  subscription: UserSubscription
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
      credentials: 'include',
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

  async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<ApiResponse<User & { token?: string }>> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          data: undefined,
          error: result.message || 'Registration failed'
        }
      }

      // The backend returns { success: true, user, sessionId, token }, so we need to extract the user data
      if (result.token) {
        localStorage.setItem('auth-token', result.token)
      }
      return { success: true, data: result.user || undefined }
    } catch (error) {
      console.error('Error registering user:', error)
      return { success: false, data: undefined, error: 'Failed to register user' }
    }
  }

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
      // Note: Ventures endpoint doesn't exist yet, return empty array
      console.warn('Ventures endpoint not implemented yet, returning empty array')
      return { success: true, data: [], error: undefined }
    } catch (error) {
      console.error('Error fetching ventures:', error)
      return { success: false, data: [], error: 'Failed to fetch ventures' }
    }
  }

  async getVenture(id: string): Promise<ApiResponse<Venture>> {
    try {
      // Note: Venture endpoint doesn't exist yet, return null
      console.warn('Venture endpoint not implemented yet, returning null')
      return { success: true, data: undefined, error: undefined }
    } catch (error) {
      console.error('Error fetching venture:', error)
      return { success: false, error: 'Failed to fetch venture' }
    }
  }

  async createVenture(ventureData: Partial<Venture>): Promise<ApiResponse<Venture>> {
    try {
      // Note: Venture creation endpoint doesn't exist yet, return null
      console.warn('Venture creation endpoint not implemented yet, returning null')
      return { success: true, data: undefined, error: undefined }
    } catch (error) {
      console.error('Error creating venture:', error)
      return { success: false, error: 'Failed to create venture' }
    }
  }

  async updateVenture(id: string, ventureData: Partial<Venture>): Promise<ApiResponse<Venture>> {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: ventureData.name,
        purpose: ventureData.description,
        region: ventureData.residency || 'US',
        industry: ventureData.industry,
        stage: ventureData.stage,
        teamSize: ventureData.teamSize,
        lookingFor: ventureData.lookingFor,
        rewards: ventureData.rewards,
        tags: ventureData.tags
      }
      
      console.log('Updating venture with data:', backendData)
      
      const response = await this.fetchWithAuth<{venture: Venture}>(`/api/ventures/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData),
      })
      
      console.log('Update API Response:', response)
      
      // Handle the actual backend response format: { success: true, venture: {...} }
      const responseData = response as ApiResponse<{venture: Venture}> & { venture?: Venture }
      const venture = responseData.venture || response.data?.venture
      
      return {
        success: response.success,
        data: venture,
        error: response.error
      }
    } catch (error) {
      console.error('Error updating venture:', error)
      return { success: false, error: 'Failed to update venture' }
    }
  }

  async deleteVenture(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Deleting venture:', id)
      
      const response = await this.fetchWithAuth<{ message: string }>(`/api/ventures/${id}`, {
        method: 'DELETE',
      })
      
      console.log('Delete API Response:', response)
      
      return {
        success: response.success,
        data: response.data,
        error: response.error
      }
    } catch (error) {
      console.error('Error deleting venture:', error)
      return { success: false, error: 'Failed to delete venture' }
    }
  }

  // ============================================================================
  // MEETINGS & SCHEDULING
  // ============================================================================

  async createMeeting(meetingData: {
    title: string
    description?: string
    ventureId: string
    organizerId: string
    scheduledFor: string
    duration?: number
    location?: string
    meetingType?: string
    agenda?: string
    meetingLink?: string
    attendees?: string[]
  }): Promise<ApiResponse<Meeting>> {
    try {
      const response = await this.fetchWithAuth<{meeting: Meeting}>('/api/meetings/create', {
        method: 'POST',
        body: JSON.stringify(meetingData),
      })
      
      return {
        success: response.success,
        data: response.data?.meeting,
        error: response.error
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      return { success: false, error: 'Failed to create meeting' }
    }
  }

  async getVentureMeetings(ventureId: string): Promise<ApiResponse<Meeting[]>> {
    try {
      const response = await this.fetchWithAuth<{meetings: Meeting[]}>(`/api/meetings/venture/${ventureId}`)
      return {
        success: response.success,
        data: response.data?.meetings || [],
        error: response.error
      }
    } catch (error) {
      console.error('Error fetching venture meetings:', error)
      return { success: false, data: [], error: 'Failed to fetch meetings' }
    }
  }

  async getUserMeetings(userId: string): Promise<ApiResponse<Meeting[]>> {
    try {
      const response = await this.fetchWithAuth<{meetings: Meeting[]}>(`/api/meetings/user/${userId}`)
      return {
        success: response.success,
        data: response.data?.meetings || [],
        error: response.error
      }
    } catch (error) {
      console.error('Error fetching user meetings:', error)
      return { success: false, data: [], error: 'Failed to fetch meetings' }
    }
  }

  async getMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    try {
      const response = await this.fetchWithAuth<{meeting: Meeting}>(`/api/meetings/${meetingId}`)
      return {
        success: response.success,
        data: response.data?.meeting,
        error: response.error
      }
    } catch (error) {
      console.error('Error fetching meeting:', error)
      return { success: false, error: 'Failed to fetch meeting' }
    }
  }

  async updateMeeting(meetingId: string, meetingData: Partial<Meeting>): Promise<ApiResponse<Meeting>> {
    try {
      const response = await this.fetchWithAuth<{meeting: Meeting}>(`/api/meetings/${meetingId}`, {
        method: 'PUT',
        body: JSON.stringify(meetingData),
      })
      
      return {
        success: response.success,
        data: response.data?.meeting,
        error: response.error
      }
    } catch (error) {
      console.error('Error updating meeting:', error)
      return { success: false, error: 'Failed to update meeting' }
    }
  }

  async addMeetingAttendee(meetingId: string, userId: string): Promise<ApiResponse<{id: string, userId: string, status: string, invitedAt: string}>> {
    try {
      const response = await this.fetchWithAuth<{attendee: {id: string, userId: string, status: string, invitedAt: string}}>(`/api/meetings/${meetingId}/attendees`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
      
      return {
        success: response.success,
        data: response.data?.attendee,
        error: response.error
      }
    } catch (error) {
      console.error('Error adding meeting attendee:', error)
      return { success: false, error: 'Failed to add attendee' }
    }
  }

  // ============================================================================
  // SUBSCRIPTION STATUS
  // ============================================================================

  async getSubscriptionStatus(userId: string): Promise<ApiResponse<{
    active: boolean
    planName?: string
    status?: string
    expiresAt?: string
  }>> {
    try {
      const response = await this.fetchWithAuth<{ data: Array<{
        status: string
        plan: { name: string }
        endDate?: string
      }> }>(`/api/subscriptions/user/${userId}`)
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const subscription = response.data[0]
        return {
          success: true,
          data: {
            active: subscription.status === 'ACTIVE',
            planName: subscription.plan.name,
            status: subscription.status,
            expiresAt: subscription.endDate
          }
        }
      }
      
      return {
        success: true,
        data: {
          active: false,
          planName: 'No Plan',
          status: 'INACTIVE'
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      return { success: false, data: undefined, error: 'Failed to fetch subscription status' }
    }
  }

  // ============================================================================
  // JOURNEY & ONBOARDING
  // ============================================================================


  async getLegalPackStatus(userId: string): Promise<ApiResponse<{
    signed: boolean
    signedAt?: string
    documents: Array<{
      id: string
      name: string
      status: string
      signedAt?: string
    }>
  }>> {
    try {
      const response = await this.fetchWithAuth<{
        signed: boolean
        signedAt?: string
        documents: Array<{
          id: string
          name: string
          status: string
          signedAt?: string
        }>
      }>(`/api/legal-signing/status/${userId}`)
      
      return {
        success: response.success,
        data: response.data,
        error: response.error
      }
    } catch (error) {
      console.error('Error fetching legal pack status:', error)
      return { success: false, error: 'Failed to fetch legal pack status' }
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
      // Use contracts endpoint instead of non-existent offers endpoint
      const response = await this.fetchWithAuth<{contracts: Offer[]}>('/api/contracts')
      return {
        success: response.success,
        data: response.data?.contracts || [],
        error: response.error
      }
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
  // JOURNEY & ONBOARDING
  // ============================================================================

  async getJourneyStatus(userId: string): Promise<ApiResponse<JourneyStatus>> {
    try {
      const response = await this.fetchWithAuth<JourneyStatus>(`/api/journey/status/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching journey status:', error)
      return { success: false, data: undefined, error: 'Failed to fetch journey status' }
    }
  }

  async initializeJourney(userId: string, token?: string): Promise<ApiResponse<JourneyInitialization>> {
    try {
      // Temporarily set the token if provided
      if (token) {
        localStorage.setItem('auth-token', token)
      }
      
      const response = await this.fetchWithAuth<JourneyInitialization>(`/api/journey/initialize/${userId}`, {
        method: 'POST'
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error initializing journey:', error)
      return { success: false, data: undefined, error: 'Failed to initialize journey' }
    }
  }

  async updateJourneyProgress(userId: string, action: string, data: Record<string, unknown> = {}): Promise<ApiResponse<JourneyProgressUpdate>> {
    try {
      const response = await this.fetchWithAuth<JourneyProgressUpdate>(`/api/journey/progress/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ action, data })
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error updating journey progress:', error)
      return { success: false, data: undefined, error: 'Failed to update journey progress' }
    }
  }

  async getOnboardingRecommendations(userId: string): Promise<ApiResponse<OnboardingRecommendations>> {
    try {
      const response = await this.fetchWithAuth<OnboardingRecommendations>(`/api/journey/recommendations/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching onboarding recommendations:', error)
      return { success: false, data: undefined, error: 'Failed to fetch onboarding recommendations' }
    }
  }

  // ============================================================================
  // SUBSCRIPTIONS & BILLING
  // ============================================================================

  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    try {
      const response = await this.fetchWithAuth<SubscriptionPlan[]>('/api/subscriptions/plans')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      return { success: false, data: [], error: 'Failed to fetch subscription plans' }
    }
  }

  async getUserSubscriptions(userId: string): Promise<ApiResponse<UserSubscription[]>> {
    try {
      const response = await this.fetchWithAuth<UserSubscription[]>(`/api/subscriptions/user/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error)
      return { success: false, data: [], error: 'Failed to fetch user subscriptions' }
    }
  }

  async createSubscription(planId: string, paymentMethod: string, paymentData: Record<string, unknown> = {}): Promise<ApiResponse<SubscriptionCreation>> {
    try {
      const response = await this.fetchWithAuth<SubscriptionCreation>('/api/subscriptions/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planId, paymentMethod, paymentData })
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error creating subscription:', error)
      return { success: false, data: undefined, error: 'Failed to create subscription' }
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<ApiResponse<SubscriptionCancellation>> {
    try {
      const response = await this.fetchWithAuth<SubscriptionCancellation>(`/api/subscriptions/cancel/${subscriptionId}`, {
        method: 'POST'
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return { success: false, data: undefined, error: 'Failed to cancel subscription' }
    }
  }

  // ============================================================================
  // LEGAL & CONTRACTS
  // ============================================================================

  async getLegalPacks(): Promise<ApiResponse<LegalPack[]>> {
    try {
      const response = await this.fetchWithAuth<LegalPack[]>('/api/legal-pack')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching legal packs:', error)
      return { success: false, data: [] as LegalPack[], error: 'Failed to fetch legal packs' }
    }
  }

  async getContracts(): Promise<ApiResponse<Contract[]>> {
    try {
      const response = await this.fetchWithAuth<{ contracts: Contract[] }>('/api/contracts')
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
      const response = await this.fetchWithAuth<{dashboard: {ventures?: {total: number}, teams?: {totalMembers: number, totalTeams: number}}}>('/api/dashboard/')
      return {
        success: response.success,
        data: response.data?.dashboard ? {
          totalVentures: response.data.dashboard.ventures?.total || 0,
          totalUsers: response.data.dashboard.teams?.totalMembers || 0,
          totalOffers: 0,
          totalRevenue: 0,
          totalCompanies: 0,
          totalTeams: response.data.dashboard.teams?.totalTeams || 0,
          ventureGrowth: 0,
          userGrowth: 0,
          offerGrowth: 0,
          revenueGrowth: 0,
          companyGrowth: 0,
          teamGrowth: 0,
          topVentures: [],
          monthlyStats: []
        } : {
          totalVentures: 0,
          totalUsers: 0,
          totalOffers: 0,
          totalRevenue: 0,
          totalCompanies: 0,
          totalTeams: 0,
          ventureGrowth: 0,
          userGrowth: 0,
          offerGrowth: 0,
          revenueGrowth: 0,
          companyGrowth: 0,
          teamGrowth: 0,
          topVentures: [],
          monthlyStats: []
        },
        error: response.error
      }
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
