/**
 * Unified API Service - SmartStart Platform
 * Single source of truth for all API communications
 */

// Prefer the Python service in production; override with NEXT_PUBLIC_API_URL if needed
const API_BASE = process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-python-brain.onrender.com')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')

// ============================================================================
// INTERFACES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
  requestId: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  role?: string
  level?: string
  status?: string
  xp?: number
  reputation?: number
  totalPortfolioValue?: number
  activeProjectsCount?: number
  totalContributions?: number
  permissions?: string[]
  avatar?: string
  createdAt: string
  updatedAt: string
}

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
    name: string
    avatar: string
  }
  createdAt: string
  status: 'active' | 'paused' | 'completed'
  tags: string[]
  tier: 'T1' | 'T2' | 'T3'
  residency: string
}

export interface BUZBalance {
  user_id: string
  balance: number
  staked: number
  available: number
  total_earned: number
  total_spent: number
  monthly_allocation: number
  currency: string
  level: string
  next_level_buz: number
}

export interface StakeBUZData {
  userId: string
  amount: number
  staking_period?: number
  staking_type?: string
}

export interface StakeResult {
  transaction_id: string
  amount: number
  staking_period: number
  staking_type: string
  rewards_rate: number
  maturity_date: string
}

export interface UnstakeBUZData {
  userId: string
  amount: number
}

export interface UnstakeResult {
  transaction_id: string
  amount: number
  rewards_earned: number
  unstaked_at: string
}

export interface TransferBUZData {
  fromUserId: string
  toUserId: string
  amount: number
}

export interface TransferResult {
  transaction_id: string
  from_user: string
  to_user: string
  amount: number
  transferred_at: string
}

export interface LegalDocument {
  id: string
  title: string
  type: string
  content: string
  required: boolean
  status: 'pending' | 'signed' | 'expired'
  signedAt?: string
}

export interface SignDocumentData {
  userId: string
  documentId: string
  signature: any
}

export interface SignResult {
  document_id: string
  signed_at: string
  signature_hash: string
  legal_validity: boolean
}

export interface LegalStatus {
  user_id: string
  documents_signed: number
  total_documents: number
  compliance_level: string
  last_signed: string
  required_documents: LegalDocument[]
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  currency: string
  interval: string
  features: string[]
  is_limited_time?: boolean
  limited_time_end?: string
  buz_tokens_monthly: number
  email_included: boolean
  microsoft_365_included: boolean
  is_active: boolean
}

export interface SubscribeData {
  userId: string
  planId: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  start_date: string
  end_date: string
  auto_renew: boolean
}

export interface SubscriptionStatus {
  user_id: string
  current_plan: SubscriptionPlan
  subscription: Subscription
  next_billing_date: string
  payment_method: string
}

export interface JourneyStatus {
  user_id: string
  current_stage: string
  progress_percentage: number
  completed_stages: string[]
  next_stage: string
  requirements: string[]
}

export interface CompleteStageData {
  userId: string
  stage: string
}

export interface JourneyResult {
  stage: string
  completed_at: string
  next_stage: string
  rewards: any[]
}

export interface Team {
  id: string
  name: string
  description: string
  owner_id: string
  members: TeamMember[]
  goals: TeamGoal[]
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: string
  permissions: string[]
  joined_at: string
  user: User
}

export interface TeamGoal {
  id: string
  team_id: string
  title: string
  description: string
  status: string
  due_date: string
  created_at: string
}

export interface CreateTeamData {
  name: string
  description: string
  venture_id?: string
}

export interface UmbrellaRelationship {
  id: string
  referrer_id: string
  referred_id: string
  status: string
  default_share_rate: number
  created_at: string
  referrer: { id: string; name: string; email: string; level: string }
  referred: { id: string; name: string; email: string; level: string }
  revenue_shares: RevenueShare[]
}

export interface RevenueShare {
  id: string
  project_id: string
  referrer_id: string
  referred_id: string
  project_revenue: number
  share_amount: number
  status: string
  calculated_at: string
  project: { id: string; name: string; email: string }
  referred: { id: string; name: string; email: string }
}

export interface CreateRelationshipData {
  referrer_id: string
  referred_id: string
  default_share_rate: number
}

export interface UserAnalytics {
  user_id: string
  total_ventures: number
  active_ventures: number
  buz_balance: number
  xp_points: number
  level: string
  total_contributions: number
  portfolio_value: number
}

export interface VentureAnalytics {
  venture_id: string
  total_members: number
  active_members: number
  total_contributions: number
  completion_percentage: number
  revenue_generated: number
  buzz_score: number
}

// Minimal interfaces used by dashboard helpers
export interface Offer {
  id: string
  roleId: string
  userId: string
  status: string
  createdAt: string
}

export interface LegalPackStatus {
  signed: boolean
  signedAt?: string
  documents?: Array<{ id: string; name: string; status: string; signedAt?: string }>
}

// Journey Management Interfaces
export interface JourneyInitialization {
  journey_initialized: boolean
  stages_created: number
  user_id: string
  timestamp: string
}

export interface JourneyStatus {
  userStates: Array<{
    id: string
    status: string
    stage: {
      id: string
      name: string
      description: string
      order: number
    }
    startedAt?: string
    completedAt?: string
  }>
  progress: {
    completedStages: number
    totalStages: number
    percentage: number
  }
  currentStage?: {
    id: string
    name: string
    order: number
  }
  nextStage?: {
    id: string
    name: string
    order: number
  }
}

export interface JourneyProgressUpdate {
  success: boolean
  stage_updated: boolean
  progress_percentage: number
  current_stage: string
  next_stage?: string
}

export interface JourneyStageCompletion {
  success: boolean
  stage_completed: boolean
  stage_id: string
  stage_name: string
  completion_data: Record<string, unknown>
  progress_percentage: number
}

// ============================================================================
// UNIFIED API SERVICE CLASS
// ============================================================================

class UnifiedAPIService {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE
    this.token = this.getToken()
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const normalizedEmail = (email || '').trim().toLowerCase()
    const result = await this.request<{ user: User; token: string }>(`/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, password: (password || '').trim() })
    })
    if (result && (result as any).token) {
      this.setToken((result as any).token as unknown as string)
    }
    return result
  }

  async register(userData: Record<string, unknown>): Promise<ApiResponse<{ user: User; token: string }>> {
    const result = await this.request<{ user: User; token: string }>(`/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    if (result && (result as any).token) {
      this.setToken((result as any).token as unknown as string)
    }
    return result
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async validateResetToken(token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/auth/validate-reset-token`, {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, password })
    })
  }

  async logout(): Promise<ApiResponse<any>> {
    try {
      const resp = await this.request<any>(`/api/auth/logout`, { method: 'POST' })
      this.clearToken()
      return resp
    } catch (e) {
      this.clearToken()
      return { success: true, message: 'Logged out' } as any
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    // If token encodes userId, callers may also use getUser(userId)
    return this.request<User>(`/api/auth/me`)
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/v1/user/${userId}`)
  }

  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/v1/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ============================================================================
  // VENTURE MANAGEMENT
  // ============================================================================

  async getVentures(): Promise<ApiResponse<Venture[]>> {
    return this.request<Venture[]>('/api/v1/ventures/list/all')
  }

  async createVenture(data: Partial<Venture>): Promise<ApiResponse<Venture>> {
    return this.request<Venture>('/api/v1/ventures/create', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getVenture(ventureId: string): Promise<ApiResponse<Venture>> {
    return this.request<Venture>(`/api/v1/ventures/${ventureId}`)
  }

  async updateVenture(ventureId: string, data: Partial<Venture>): Promise<ApiResponse<Venture>> {
    return this.request<Venture>(`/api/v1/ventures/${ventureId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ============================================================================
  // BUZ TOKEN SYSTEM
  // ============================================================================

  async getBUZBalance(userId: string): Promise<ApiResponse<BUZBalance>> {
    return this.request<BUZBalance>(`/api/v1/buz/balance/${userId}`)
  }

  async getBUZSupply(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/buz/supply')
  }

  async stakeBUZ(data: StakeBUZData): Promise<ApiResponse<StakeResult>> {
    return this.request<StakeResult>('/api/v1/buz/stake', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async unstakeBUZ(data: UnstakeBUZData): Promise<ApiResponse<UnstakeResult>> {
    return this.request<UnstakeResult>('/api/v1/buz/unstake', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async transferBUZ(data: TransferBUZData): Promise<ApiResponse<TransferResult>> {
    return this.request<TransferResult>('/api/v1/buz/transfer', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ============================================================================
  // LEGAL DOCUMENT SYSTEM
  // ============================================================================

  async getLegalDocuments(userId: string): Promise<ApiResponse<LegalDocument[]>> {
    return this.request<LegalDocument[]>(`/api/v1/legal/documents/${userId}`)
  }

  async signDocument(data: SignDocumentData): Promise<ApiResponse<SignResult>> {
    return this.request<SignResult>('/api/v1/legal/documents/sign', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getLegalStatus(userId: string): Promise<ApiResponse<LegalStatus>> {
    return this.request<LegalStatus>(`/api/v1/legal/status/${userId}`)
  }

  // ============================================================================
  // SUBSCRIPTION SYSTEM
  // ============================================================================

  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return this.request<SubscriptionPlan[]>('/api/v1/subscriptions/plans')
  }

  async subscribe(data: SubscribeData): Promise<ApiResponse<Subscription>> {
    return this.request<Subscription>('/api/v1/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getSubscriptionStatus(userId: string): Promise<ApiResponse<SubscriptionStatus>> {
    return this.request<SubscriptionStatus>(`/api/v1/subscriptions/status/${userId}`)
  }

  // ============================================================================
  // JOURNEY SYSTEM
  // ============================================================================

  async getJourneyStatus(userId: string): Promise<ApiResponse<JourneyStatus>> {
    return this.request<JourneyStatus>(`/api/v1/journey/status/${userId}`)
  }

  async completeJourneyStage(data: CompleteStageData): Promise<ApiResponse<JourneyResult>> {
    return this.request<JourneyResult>('/api/v1/journey/complete-stage', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ============================================================================
  // TEAM MANAGEMENT
  // ============================================================================

  async getTeam(teamId: string): Promise<ApiResponse<Team>> {
    return this.request<Team>(`/api/v1/teams/${teamId}`)
  }

  async createTeam(data: CreateTeamData): Promise<ApiResponse<Team>> {
    return this.request<Team>('/api/v1/teams/create', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTeam(teamId: string, data: Partial<Team>): Promise<ApiResponse<Team>> {
    return this.request<Team>(`/api/v1/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // ============================================================================
  // UMBRELLA NETWORK
  // ============================================================================

  async getUmbrellaRelationships(userId: string): Promise<ApiResponse<UmbrellaRelationship[]>> {
    return this.request<UmbrellaRelationship[]>(`/api/v1/umbrella/relationships/${userId}`)
  }

  async createUmbrellaRelationship(data: CreateRelationshipData): Promise<ApiResponse<UmbrellaRelationship>> {
    return this.request<UmbrellaRelationship>('/api/v1/umbrella/create-relationship', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getRevenueShares(userId: string): Promise<ApiResponse<RevenueShare[]>> {
    return this.request<RevenueShare[]>(`/api/v1/umbrella/revenue-shares/${userId}`)
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getUserAnalytics(userId: string): Promise<ApiResponse<UserAnalytics>> {
    return this.request<UserAnalytics>(`/api/v1/analytics/user/${userId}`)
  }

  async getVentureAnalytics(ventureId: string): Promise<ApiResponse<VentureAnalytics>> {
    return this.request<VentureAnalytics>(`/api/v1/analytics/venture/${ventureId}`)
  }

  // Convenience for dashboard: derive userId from /api/auth/me
  async getAnalytics(): Promise<ApiResponse<UserAnalytics>> {
    const me = await this.getCurrentUser()
    const userId = (me as any)?.data?.id
    if (!userId) {
      throw new Error('No user id available for analytics')
    }
    return this.getUserAnalytics(userId)
  }

  // ============================================================================
  // DASHBOARD HELPERS (compatibility with legacy ApiService)
  // ============================================================================

  async getOffers(): Promise<ApiResponse<Offer[]>> {
    // No dedicated Python route surfaced; return empty list for now
    return { success: true, data: [], message: 'Not implemented in Python service yet', timestamp: new Date().toISOString(), requestId: 'offers-placeholder' }
  }

  async getUserDocumentStatus(): Promise<ApiResponse<LegalPackStatus>> {
    const me = await this.getCurrentUser()
    const userId = (me as any)?.data?.id
    if (!userId) {
      throw new Error('No user id available for legal status')
    }
    // Map to Python legal status endpoint
    return this.request<LegalPackStatus>(`/api/v1/legal/status/${userId}`)
  }

  async getLeaderboard(): Promise<ApiResponse<any>> {
    // Placeholder until Python endpoint exists
    return { success: true, data: { entries: [] }, message: 'Not implemented in Python service yet', timestamp: new Date().toISOString(), requestId: 'leaderboard-placeholder' }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
    }
  }

  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  handleError(error: any): string {
    if (error.message) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  }

  // ============================================================================
  // JOURNEY MANAGEMENT
  // ============================================================================

  async initializeJourney(userId: string, token?: string): Promise<ApiResponse<JourneyInitialization>> {
    try {
      // Temporarily set the token if provided
      if (token) {
        localStorage.setItem('auth-token', token)
        this.token = token
      }
      
      const response = await this.request<JourneyInitialization>(`/api/journey/initialize/${userId}`, {
        method: 'POST'
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error initializing journey:', error)
      return { success: false, data: undefined, error: 'Failed to initialize journey' }
    }
  }

  async getJourneyStatus(userId: string): Promise<ApiResponse<JourneyStatus>> {
    try {
      const response = await this.request<JourneyStatus>(`/api/journey/status/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching journey status:', error)
      return { success: false, data: undefined, error: 'Failed to fetch journey status' }
    }
  }

  async updateJourneyProgress(userId: string, action: string, data: Record<string, unknown> = {}): Promise<ApiResponse<JourneyProgressUpdate>> {
    try {
      const response = await this.request<JourneyProgressUpdate>(`/api/journey/progress/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ action, data })
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error updating journey progress:', error)
      return { success: false, data: undefined, error: 'Failed to update journey progress' }
    }
  }

  async completeJourneyStage(userId: string, stageId: string, data: Record<string, unknown> = {}): Promise<ApiResponse<JourneyStageCompletion>> {
    try {
      const response = await this.request<JourneyStageCompletion>(`/api/journey/complete/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ stageId, data })
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error completing journey stage:', error)
      return { success: false, data: undefined, error: 'Failed to complete journey stage' }
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>('/health')
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const apiService = new UnifiedAPIService()
export default apiService

// ============================================================================
// LEGACY COMPATIBILITY (for gradual migration)
// ============================================================================

// Re-export commonly used types for backward compatibility
export type { ApiResponse, User, Venture, BUZBalance, LegalDocument, SubscriptionPlan, Team, UmbrellaRelationship }

// Legacy function exports for backward compatibility
export const getCurrentUser = (userId: string) => apiService.getUser(userId)
export const updateUserProfile = (userId: string, data: Partial<User>) => apiService.updateUser(userId, data)
export const getVentures = () => apiService.getVentures()
export const createVenture = (data: Partial<Venture>) => apiService.createVenture(data)
export const getBUZBalance = (userId: string) => apiService.getBUZBalance(userId)
export const stakeBUZ = (data: StakeBUZData) => apiService.stakeBUZ(data)
export const unstakeBUZ = (data: UnstakeBUZData) => apiService.unstakeBUZ(data)
export const transferBUZ = (data: TransferBUZData) => apiService.transferBUZ(data)
export const getLegalDocuments = (userId: string) => apiService.getLegalDocuments(userId)
export const signDocument = (data: SignDocumentData) => apiService.signDocument(data)
export const getLegalStatus = (userId: string) => apiService.getLegalStatus(userId)
export const getSubscriptionPlans = () => apiService.getSubscriptionPlans()
export const subscribe = (data: SubscribeData) => apiService.subscribe(data)
export const getSubscriptionStatus = (userId: string) => apiService.getSubscriptionStatus(userId)
export const getJourneyStatus = (userId: string) => apiService.getJourneyStatus(userId)
export const completeJourneyStage = (data: CompleteStageData) => apiService.completeJourneyStage(data)
export const getTeam = (teamId: string) => apiService.getTeam(teamId)
export const createTeam = (data: CreateTeamData) => apiService.createTeam(data)
export const updateTeam = (teamId: string, data: Partial<Team>) => apiService.updateTeam(teamId, data)
export const getUmbrellaRelationships = (userId: string) => apiService.getUmbrellaRelationships(userId)
export const createUmbrellaRelationship = (data: CreateRelationshipData) => apiService.createUmbrellaRelationship(data)
export const getRevenueShares = (userId: string) => apiService.getRevenueShares(userId)
export const getUserAnalytics = (userId: string) => apiService.getUserAnalytics(userId)
export const getVentureAnalytics = (ventureId: string) => apiService.getVentureAnalytics(ventureId)
