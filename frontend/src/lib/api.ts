const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://smartstart-api.onrender.com' 
  : 'http://localhost:3001'

export interface ApiResponse<T = any> {
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
  private async fetchWithAuth<T = any>(
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

  async register(userData: any): Promise<ApiResponse<{ user: User; token: string }>> {
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
      
      if (response.success && response.user) {
        localStorage.setItem('user-id', response.user.id)
        localStorage.setItem('user-data', JSON.stringify(response.user))
        return { success: true, data: response.user }
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

  // Ventures
  async getVentures(): Promise<ApiResponse<Venture[]>> {
    try {
      const response = await this.fetchWithAuth<Venture[]>('/api/ventures/list/all')
      return { success: true, data: response.ventures || [] }
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
      const response = await this.fetchWithAuth<Offer[]>('/api/offers')
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
}

export const apiService = new ApiService()
export default apiService

