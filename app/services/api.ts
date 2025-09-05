// API service for fetching real data from backend
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://smartstart-api.onrender.com' 
  : 'http://localhost:3001'

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
}

export interface Company {
  id: string
  name: string
  description: string
  industry: string
  stage: string
  teamSize: number
  status: string
  createdAt: string
}

export interface Contract {
  id: string
  title: string
  type: string
  status: string
  createdAt: string
  signedAt?: string
}

export interface GamificationData {
  level: string
  xp: number
  reputation: number
  badges: Badge[]
  achievements: Achievement[]
  leaderboardPosition?: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  progress: number
  maxProgress: number
  completed: boolean
}

export interface PortfolioData {
  totalValue: number
  activeProjects: number
  totalContributions: number
  equityOwned: number
  projects: PortfolioProject[]
}

export interface PortfolioProject {
  id: string
  name: string
  role: string
  equity: number
  status: string
  value: number
}

export interface JourneyState {
  currentStage: number
  completedStages: number[]
  totalStages: number
  progress: number
  nextAction?: string
}

export interface DocumentTemplate {
  id: string
  title: string
  filename: string
  category: string
  categoryInfo: {
    name: string
    description: string
    icon: string
  }
  content: string
  size: number
  lastModified: string
  wordCount: number
  lineCount: number
}

export interface SystemStatus {
  status: string
  version: string
  uptime: number
  endpoints: number
  users: number
  ventures: number
}

class ApiService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // Get JWT token from localStorage
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
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication
  async login(email: string, password: string) {
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
        // Store user ID, data, and JWT token for frontend use
        localStorage.setItem('user-id', data.user.id)
        localStorage.setItem('user-data', JSON.stringify(data.user))
        localStorage.setItem('auth-token', data.token)
      }
      
      return data
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  async register(userData: any) {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Store user ID and token for getCurrentUser to use
    if (data.success && data.user && data.user.id && data.token) {
      localStorage.setItem('user-id', data.user.id)
      localStorage.setItem('auth-token', data.token)
    }
    
    return data
  }

  async getCurrentUser(): Promise<User> {
    // Always validate the token by calling the server, even if we have cached data
    try {
      const response = await this.fetchWithAuth('/api/auth/me')
      
      if (response.success && response.user) {
        // Store user data in localStorage for frontend use
        localStorage.setItem('user-id', response.user.id)
        localStorage.setItem('user-data', JSON.stringify(response.user))
        return response.user
      } else {
        throw new Error('Invalid response from /api/auth/me')
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      // Clear any stale data on authentication failure
      localStorage.removeItem('user-id')
      localStorage.removeItem('user-data')
      localStorage.removeItem('auth-token')
      throw error
    }
  }

  async logout() {
    return this.fetchWithAuth('/api/auth/logout', {
      method: 'POST',
    })
  }

  // Ventures
  async getVentures(): Promise<Venture[]> {
    try {
      const response = await this.fetchWithAuth('/api/ventures/list/all')
      return response.ventures || []
    } catch (error) {
      console.error('Error fetching ventures:', error)
      return []
    }
  }

  async getVenture(id: string): Promise<Venture> {
    return this.fetchWithAuth(`/api/ventures/${id}`)
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await this.fetchWithAuth('/api/companies')
      return response.data || []
    } catch (error) {
      console.error('Error fetching companies:', error)
      return []
    }
  }

  // Contracts
  async getContracts(): Promise<Contract[]> {
    try {
      const response = await this.fetchWithAuth('/api/contracts')
      return response.data || []
    } catch (error) {
      console.error('Error fetching contracts:', error)
      return []
    }
  }

  // User Profile
  async getUserProfile(userId: string) {
    try {
      return await this.fetchWithAuth(`/api/user-profile/profile/${userId}`)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async saveProfile(profileData: any) {
    try {
      return await this.fetchWithAuth('/api/user-profile/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      throw error
    }
  }

  // Gamification
  async getUserGamification(userId: string): Promise<GamificationData | null> {
    try {
      const [xpResponse, badgesResponse, reputationResponse] = await Promise.all([
        this.fetchWithAuth(`/api/gamification/xp/${userId}`),
        this.fetchWithAuth(`/api/gamification/badges/${userId}`),
        this.fetchWithAuth(`/api/gamification/reputation/${userId}`)
      ])
      
      return {
        xp: xpResponse.xp || 0,
        badges: badgesResponse.badges || [],
        reputation: reputationResponse.reputation || 0,
        level: Math.floor((xpResponse.xp || 0) / 1000) + 1
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error)
      return { xp: 0, badges: [], reputation: 0, level: 1 }
    }
  }

  async getGamificationLeaderboard() {
    try {
      return await this.fetchWithAuth('/api/gamification/leaderboard')
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return null
    }
  }

  async addXP(userId: string, amount: number, reason: string) {
    try {
      return await this.fetchWithAuth('/api/gamification/xp/add', {
        method: 'POST',
        body: JSON.stringify({ userId, amount, reason }),
      })
    } catch (error) {
      console.error('Error adding XP:', error)
      return null
    }
  }

  // Portfolio
  async getUserPortfolio(userId: string): Promise<PortfolioData | null> {
    try {
      const response = await this.fetchWithAuth(`/api/gamification/portfolio/${userId}`)
      return {
        totalValue: response.portfolio?.reduce((sum: number, item: any) => sum + (item.value || 0), 0) || 0,
        activeProjects: response.portfolio?.filter((item: any) => item.status === 'active').length || 0,
        totalContributions: response.portfolio?.length || 0
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      return { totalValue: 0, activeProjects: 0, totalContributions: 0 }
    }
  }

  async getPortfolioProjects(userId: string) {
    try {
      return await this.fetchWithAuth(`/api/user-portfolio/projects/${userId}`)
    } catch (error) {
      console.error('Error fetching portfolio projects:', error)
      return null
    }
  }

  // Tasks
  async getTasks() {
    try {
      return await this.fetchWithAuth('/api/tasks/tasks')
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return { data: [] }
    }
  }

  async getTodayTasks() {
    try {
      return await this.fetchWithAuth('/api/tasks/today')
    } catch (error) {
      console.error('Error fetching today tasks:', error)
      return { data: [] }
    }
  }

  // Role Dashboard
  async getRoleDashboard() {
    try {
      return await this.fetchWithAuth('/api/role-dashboard/dashboard')
    } catch (error) {
      console.error('Error fetching role dashboard:', error)
      return null
    }
  }

  // System Status
  async getSystemStatus(): Promise<SystemStatus | null> {
    try {
      const response = await this.fetchWithAuth('/api/system-instructions/status')
      return response.data || null
    } catch (error) {
      console.error('Error fetching system status:', error)
      return null
    }
  }

  // User Journey
  async getJourneyState(userId: string): Promise<JourneyState | null> {
    try {
      const response = await this.fetchWithAuth(`/api/journey-state/progress/${userId}`)
      if (response.success && response.data) {
        // Transform the response to match the expected JourneyState interface
        const data = response.data
        
        // Find the current stage index (0-based)
        let currentStageIndex = 0
        if (data.currentStage) {
          currentStageIndex = data.stages.findIndex((s: any) => s.id === data.currentStage.id)
        } else if (data.nextStage) {
          // If no current stage but there's a next stage, user is at the stage before it
          currentStageIndex = data.stages.findIndex((s: any) => s.id === data.nextStage.id) - 1
        }
        
        // Ensure currentStageIndex is not negative
        currentStageIndex = Math.max(0, currentStageIndex)
        
        return {
          currentStage: currentStageIndex,
          completedStages: data.stages.filter((s: any) => s.status === 'COMPLETED').map((s: any, index: number) => index),
          totalStages: data.progress.totalStages,
          progress: data.progress.percentage,
          nextAction: data.nextStage ? data.nextStage.name : undefined
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching journey state:', error)
      return null
    }
  }

  async startJourneyStage(userId: string, stageId: string) {
    try {
      return await this.fetchWithAuth(`/api/journey-state/start`, {
        method: 'POST',
        body: JSON.stringify({ userId, stageId }),
      })
    } catch (error) {
      console.error('Error starting journey stage:', error)
      return null
    }
  }

  async updateJourneyState(userId: string, stage: number) {
    try {
      // Convert stage number to stage ID (stage_1, stage_2, etc.)
      // stage 2 = stage_2, stage 3 = stage_3, etc.
      const stageId = `stage_${stage}`
      return await this.fetchWithAuth(`/api/journey-state/complete`, {
        method: 'POST',
        body: JSON.stringify({ userId, stageId }),
      })
    } catch (error) {
      console.error('Error updating journey state:', error)
      return null
    }
  }

  // Legal & Contracts
  async getLegalPacks() {
    try {
      return await this.fetchWithAuth('/api/legal-pack/packs')
    } catch (error) {
      console.error('Error fetching legal packs:', error)
      return null
    }
  }

  async signLegalPack(packId?: string, signature?: string) {
    try {
      return await this.fetchWithAuth('/api/legal-pack/sign', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: this.getCurrentUserId(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        }),
      })
    } catch (error) {
      console.error('Error signing legal pack:', error)
      return null
    }
  }

  async signNDA() {
    try {
      return await this.fetchWithAuth('/api/legal-pack/nda/sign', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: this.getCurrentUserId(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        }),
      })
    } catch (error) {
      console.error('Error signing NDA:', error)
      return null
    }
  }

  async grantConsent(consentType: string) {
    try {
      return await this.fetchWithAuth('/api/legal-pack/consent', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: this.getCurrentUserId(),
          consentType,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        }),
      })
    } catch (error) {
      console.error('Error granting consent:', error)
      return null
    }
  }

  async getLegalPackStatus() {
    try {
      const userId = this.getCurrentUserId()
      return await this.fetchWithAuth(`/api/legal-pack/status/${userId}`)
    } catch (error) {
      console.error('Error fetching legal pack status:', error)
      return null
    }
  }

  // Subscriptions
  async getSubscriptions() {
    try {
      return await this.fetchWithAuth('/api/subscriptions/user')
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      return null
    }
  }

  async createSubscription(planId: string) {
    try {
      return await this.fetchWithAuth('/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      })
    } catch (error) {
      console.error('Error creating subscription:', error)
      return null
    }
  }

  // CLI Commands
  async getCLICommands() {
    try {
      return await this.fetchWithAuth('/api/cli/commands')
    } catch (error) {
      console.error('Error fetching CLI commands:', error)
      return null
    }
  }

  async executeCLICommand(command: string, args: string[] = []) {
    try {
      return await this.fetchWithAuth('/api/cli/exec', {
        method: 'POST',
        body: JSON.stringify({ command, args }),
      })
    } catch (error) {
      console.error('Error executing CLI command:', error)
      return null
    }
  }

  // Health Check
  async healthCheck() {
    try {
      return await this.fetchWithAuth('/api/simple-auth/health')
    } catch (error) {
      console.error('Health check failed:', error)
      return null
    }
  }

  // Documents API
  async getDocumentTemplates() {
    try {
      return await this.fetchWithAuth('/api/documents/templates')
    } catch (error) {
      console.error('Error fetching document templates:', error)
      return null
    }
  }

  async getDocumentTemplate(id: string) {
    try {
      return await this.fetchWithAuth(`/api/documents/templates/${id}`)
    } catch (error) {
      console.error('Error fetching document template:', error)
      return null
    }
  }

  async searchDocuments(query: string, category?: string) {
    try {
      const params = new URLSearchParams({ q: query })
      if (category) params.append('category', category)
      return await this.fetchWithAuth(`/api/documents/search?${params}`)
    } catch (error) {
      console.error('Error searching documents:', error)
      return null
    }
  }

  async getDocumentStats() {
    try {
      return await this.fetchWithAuth('/api/documents/stats')
    } catch (error) {
      console.error('Error fetching document stats:', error)
      return null
    }
  }

  // ===== KYC/IDENTITY VERIFICATION API METHODS =====

  async submitKycInfo(kycData: any) {
    try {
      const response = await this.fetchWithAuth('/api/kyc/submit', {
        method: 'POST',
        body: JSON.stringify(kycData)
      })
      return response
    } catch (error) {
      console.error('Error submitting KYC info:', error)
      throw error
    }
  }

  async uploadKycDocument(file: File, documentType: string, userId: string) {
    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('documentType', documentType)
      formData.append('userId', userId)
      
      const response = await this.fetchWithAuth('/api/kyc/upload-document', {
        method: 'POST',
        body: formData
      })
      return response
    } catch (error) {
      console.error('Error uploading KYC document:', error)
      throw error
    }
  }

  async getKycStatus(userId: string) {
    try {
      const response = await this.fetchWithAuth(`/api/kyc/status/${userId}`)
      return response
    } catch (error) {
      console.error('Error fetching KYC status:', error)
      throw error
    }
  }

  async getKycDocuments(userId: string) {
    try {
      const response = await this.fetchWithAuth(`/api/kyc/documents/${userId}`)
      return response
    } catch (error) {
      console.error('Error fetching KYC documents:', error)
      throw error
    }
  }

  // ===== MULTI-FACTOR AUTHENTICATION API METHODS =====

  async setupMfa(userId: string, method: string) {
    try {
      const response = await this.fetchWithAuth('/api/mfa/setup', {
        method: 'POST',
        body: JSON.stringify({ userId, method })
      })
      return response
    } catch (error) {
      console.error('Error setting up MFA:', error)
      throw error
    }
  }

  async verifyMfaCode(userId: string, code: string, isBackupCode: boolean = false) {
    try {
      const response = await this.fetchWithAuth('/api/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ userId, code, isBackupCode })
      })
      return response
    } catch (error) {
      console.error('Error verifying MFA code:', error)
      throw error
    }
  }

  async activateMfa(userId: string, code: string) {
    try {
      const response = await this.fetchWithAuth('/api/mfa/activate', {
        method: 'POST',
        body: JSON.stringify({ userId, code })
      })
      return response
    } catch (error) {
      console.error('Error activating MFA:', error)
      throw error
    }
  }

  async getMfaStatus(userId: string) {
    try {
      const response = await this.fetchWithAuth(`/api/mfa/status/${userId}`)
      return response
    } catch (error) {
      console.error('Error fetching MFA status:', error)
      throw error
    }
  }

  async disableMfa(userId: string, code: string) {
    try {
      const response = await this.fetchWithAuth('/api/mfa/disable', {
        method: 'POST',
        body: JSON.stringify({ userId, code })
      })
      return response
    } catch (error) {
      console.error('Error disabling MFA:', error)
      throw error
    }
  }

  async sendMfaCode(userId: string, method: string) {
    try {
      const response = await this.fetchWithAuth('/api/mfa/send-code', {
        method: 'POST',
        body: JSON.stringify({ userId, method })
      })
      return response
    } catch (error) {
      console.error('Error sending MFA code:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
export default apiService
