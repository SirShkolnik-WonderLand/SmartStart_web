const API_BASE = (process as any).env.NODE_ENV === 'production' 
  ? 'https://smartstart-api.onrender.com' 
  : 'http://localhost:3001'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
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
  createdAt: string
  updatedAt: string
}

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
}

export interface LegalPack {
  id: string
  name: string
  description: string
  documents: LegalDocument[]
  required: boolean
  status: 'pending' | 'signed' | 'expired'
  signedAt?: string
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

export interface JourneyState {
  currentStage: number
  completedStages: number[]
  totalStages: number
  progress: number
  nextAction?: string
  stages: {
    id: string
    name: string
    status: 'pending' | 'in_progress' | 'completed'
    description: string
  }[]
}

class ApiService {
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
        // Clear stored user data on auth failure
        localStorage.removeItem('user-id')
        localStorage.removeItem('user-data')
        localStorage.removeItem('auth-token')
        throw new Error('Authentication failed')
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  async register(userData: Record<string, unknown>): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      
      if (data.success && data.user && data.user.id && data.token) {
        localStorage.setItem('user-id', data.user.id)
        localStorage.setItem('auth-token', data.token)
      }
      
      return data
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
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

  async logout(): Promise<ApiResponse> {
    try {
      // Try to call logout endpoint, but don't fail if it doesn't exist
      try {
        await this.fetchWithAuth('/api/auth/logout', {
          method: 'POST',
        })
      } catch (error) {
        // If logout endpoint doesn't exist (404), that's okay - just clear local storage
        console.log('Logout endpoint not available, clearing local storage only')
      }
      
      // Always clear local storage regardless of API response
      localStorage.removeItem('user-id')
      localStorage.removeItem('user-data')
      localStorage.removeItem('auth-token')
      
      return { success: true, message: 'Logged out successfully' }
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, clear local storage
      localStorage.removeItem('user-id')
      localStorage.removeItem('user-data')
      localStorage.removeItem('auth-token')
      return { success: true, message: 'Logged out successfully' }
    }
  }

  // Password Reset
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Forgot password error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send reset email' 
      }
    }
  }

  async validateResetToken(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/validate-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Token validation error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to validate token' 
      }
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Reset password error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password' 
      }
    }
  }

  // Ventures
  async getVentures(): Promise<ApiResponse<Venture[]>> {
    try {
      const response = await this.fetchWithAuth<Venture[]>('/api/v1/ventures/list/all')
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching ventures:', error)
      return { success: false, data: [], error: 'Failed to fetch ventures' }
    }
  }

  async getVenture(id: string): Promise<ApiResponse<Venture>> {
    try {
      const response = await this.fetchWithAuth<Venture>(`/api/ventures/${id}`)
      return response
    } catch (error) {
      console.error('Error fetching venture:', error)
      return { success: false, error: 'Failed to fetch venture' }
    }
  }

  async createVenture(ventureData: Partial<Venture>): Promise<ApiResponse<Venture>> {
    try {
      const response = await this.fetchWithAuth<Venture>('/api/ventures', {
        method: 'POST',
        body: JSON.stringify(ventureData),
      })
      return response
    } catch (error) {
      console.error('Error creating venture:', error)
      return { success: false, error: 'Failed to create venture' }
    }
  }

  // Roles
  async getRoles(ventureId?: string): Promise<ApiResponse<Role[]>> {
    try {
      const endpoint = ventureId ? `/api/roles/venture/${ventureId}` : '/api/roles'
      const response = await this.fetchWithAuth<Role[]>(endpoint)
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching roles:', error)
      return { success: false, data: [], error: 'Failed to fetch roles' }
    }
  }

  async createRole(roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    try {
      const response = await this.fetchWithAuth<Role>('/api/roles', {
        method: 'POST',
        body: JSON.stringify(roleData),
      })
      return response
    } catch (error) {
      console.error('Error creating role:', error)
      return { success: false, error: 'Failed to create role' }
    }
  }

  // Offers
  async getOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await this.fetchWithAuth<Offer[]>('/api/contracts')
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching offers:', error)
      return { success: false, data: [], error: 'Failed to fetch offers' }
    }
  }

  async createOffer(offerData: Partial<Offer>): Promise<ApiResponse<Offer>> {
    try {
      const response = await this.fetchWithAuth<Offer>('/api/offers', {
        method: 'POST',
        body: JSON.stringify(offerData),
      })
      return response
    } catch (error) {
      console.error('Error creating offer:', error)
      return { success: false, error: 'Failed to create offer' }
    }
  }

  async updateOfferStatus(offerId: string, status: Offer['status']): Promise<ApiResponse<Offer>> {
    try {
      const response = await this.fetchWithAuth<Offer>(`/api/offers/${offerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      return response
    } catch (error) {
      console.error('Error updating offer status:', error)
      return { success: false, error: 'Failed to update offer status' }
    }
  }

  // Legal
  async getLegalPacks(): Promise<ApiResponse<LegalPack[]>> {
    try {
      const response = await this.fetchWithAuth<LegalPack[]>('/api/legal-pack/packs')
      return { success: true, data: response.data || [] }
    } catch (error) {
      console.error('Error fetching legal packs:', error)
      return { success: false, data: [], error: 'Failed to fetch legal packs' }
    }
  }

  async signLegalPack(packId: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithAuth('/api/legal-pack/sign', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: localStorage.getItem('user-id'),
          packId,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        }),
      })
      return response
    } catch (error) {
      console.error('Error signing legal pack:', error)
      return { success: false, error: 'Failed to sign legal pack' }
    }
  }

  // Journey State
  async getJourneyState(userId: string): Promise<ApiResponse<JourneyState>> {
    try {
      const response = await this.fetchWithAuth<JourneyState>(`/api/journey-state/progress/${userId}`)
      return response
    } catch (error) {
      console.error('Error fetching journey state:', error)
      return { success: false, error: 'Failed to fetch journey state' }
    }
  }

  async updateJourneyState(userId: string, stage: number): Promise<ApiResponse> {
    try {
      const stageMapping = [
        'Account Creation',
        'Profile Setup',
        'Platform Legal Pack',
        'Subscription Selection',
        'Platform Orientation',
        'Welcome & Dashboard'
      ]
      
      const stageName = stageMapping[stage]
      if (!stageName) {
        throw new Error(`Invalid stage number: ${stage}`)
      }
      
      const response = await this.fetchWithAuth(`/api/journey-state/complete`, {
        method: 'POST',
        body: JSON.stringify({ userId, stageId: stageName }),
      })
      return response
    } catch (error) {
      console.error('Error updating journey state:', error)
      return { success: false, error: 'Failed to update journey state' }
    }
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await this.fetchWithAuth('/api/simple-auth/health')
      return response
    } catch (error) {
      console.error('Health check failed:', error)
      return { success: false, error: 'Health check failed' }
    }
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth('/api/dashboard/')
      return response
    } catch (error) {
      console.error('Analytics error:', error)
      return { success: false, error: 'Failed to load analytics' }
    }
  }

  // BUZ Token methods
  async getBUZSupply(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth('/api/v1/buz/supply')
      return response
    } catch (error) {
      console.error('BUZ supply error:', error)
      return { success: false, error: 'Failed to load BUZ supply' }
    }
  }

  async getBUZBalance(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth(`/api/v1/buz/balance/${userId}`)
      return response
    } catch (error) {
      console.error('BUZ balance error:', error)
      return { success: false, error: 'Failed to load BUZ balance' }
    }
  }

  // Journey status method
  async getJourneyStatus(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth(`/api/journey/status/${userId}`)
      return response
    } catch (error) {
      console.error('Journey status error:', error)
      return { success: false, error: 'Failed to load journey status' }
    }
  }

  // Legal pack status method
  async getLegalPackStatus(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth(`/api/legal-signing/status/${userId}`)
      return response
    } catch (error) {
      console.error('Legal pack status error:', error)
      return { success: false, error: 'Failed to load legal pack status' }
    }
  }

  // Subscription status method
  async getSubscriptionStatus(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth(`/api/subscriptions/user/${userId}`)
      return response
    } catch (error) {
      console.error('Subscription status error:', error)
      return { success: false, error: 'Failed to load subscription status' }
    }
  }

  // Legal Document Management methods
  async getUserDocumentStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth('/api/legal-documents/status')
      return response
    } catch (error) {
      console.error('User document status error:', error)
      return { success: false, error: 'Failed to load user document status' }
    }
  }

  async getAvailableDocuments(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth('/api/legal-documents/documents')
      return response
    } catch (error) {
      console.error('Available documents error:', error)
      return { success: false, error: 'Failed to load available documents' }
    }
  }

  async getPendingDocuments(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth('/api/legal-documents/documents/pending')
      return response
    } catch (error) {
      console.error('Pending documents error:', error)
      return { success: false, error: 'Failed to load pending documents' }
    }
  }

  async getRequiredDocuments(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth('/api/legal-documents/documents/required')
      return response
    } catch (error) {
      console.error('Required documents error:', error)
      return { success: false, error: 'Failed to load required documents' }
    }
  }

  // Gamification methods
  async getLeaderboard(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth('/api/gamification/leaderboard')
      return response
    } catch (error) {
      console.error('Leaderboard error:', error)
      return { success: false, error: 'Failed to load leaderboard' }
    }
  }

  async getUserBadges(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetchWithAuth(`/api/gamification/badges/${userId}`)
      return response
    } catch (error) {
      console.error('User badges error:', error)
      return { success: false, error: 'Failed to load user badges' }
    }
  }
}

export const apiService = new ApiService()
export default apiService

