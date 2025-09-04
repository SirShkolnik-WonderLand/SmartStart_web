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
    const token = localStorage.getItem('auth-token')
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Store user ID for getCurrentUser to use
    if (data.success && data.user && data.user.id) {
      localStorage.setItem('user-id', data.user.id)
    }
    
    return data
  }

  async register(userData: any) {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Store user ID for getCurrentUser to use
    if (data.success && data.user && data.user.id) {
      localStorage.setItem('user-id', data.user.id)
    }
    
    return data
  }

  async getCurrentUser(): Promise<User> {
    // Get user ID from token or localStorage
    const token = localStorage.getItem('auth-token')
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    // For now, we'll need to get the user ID from the login response
    // This is a temporary solution - ideally the backend should have /api/auth/me
    const userId = localStorage.getItem('user-id')
    if (!userId) {
      throw new Error('User ID not found in localStorage')
    }
    
    return this.fetchWithAuth(`/api/users/${userId}`)
  }

  async logout() {
    return this.fetchWithAuth('/api/auth/logout', {
      method: 'POST',
    })
  }

  // Ventures
  async getVentures(): Promise<Venture[]> {
    try {
      const response = await this.fetchWithAuth('/api/venture-management/ventures')
      return response.data || []
    } catch (error) {
      console.error('Error fetching ventures:', error)
      return []
    }
  }

  async getVenture(id: string): Promise<Venture> {
    return this.fetchWithAuth(`/api/venture-management/ventures/${id}`)
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await this.fetchWithAuth('/api/company-management/companies')
      return response.data || []
    } catch (error) {
      console.error('Error fetching companies:', error)
      return []
    }
  }

  // Contracts
  async getContracts(): Promise<Contract[]> {
    try {
      const response = await this.fetchWithAuth('/api/contracts/contracts')
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

  // Gamification
  async getUserGamification(userId: string): Promise<GamificationData | null> {
    try {
      const response = await this.fetchWithAuth(`/api/user-gamification/dashboard/${userId}`)
      return response.data || null
    } catch (error) {
      console.error('Error fetching gamification data:', error)
      return null
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
      const response = await this.fetchWithAuth(`/api/user-portfolio/analytics`)
      return response.data || null
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      return null
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
      const response = await this.fetchWithAuth(`/api/journey/state/${userId}`)
      return response.data || null
    } catch (error) {
      console.error('Error fetching journey state:', error)
      return null
    }
  }

  async updateJourneyState(userId: string, stage: number) {
    try {
      return await this.fetchWithAuth(`/api/journey/state/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ stage }),
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

  async signLegalPack(packId: string, signature: string) {
    try {
      return await this.fetchWithAuth(`/api/legal-pack/sign/${packId}`, {
        method: 'POST',
        body: JSON.stringify({ signature }),
      })
    } catch (error) {
      console.error('Error signing legal pack:', error)
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
}

export const apiService = new ApiService()
export default apiService
