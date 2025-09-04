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

class ApiService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
    return this.fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.fetchWithAuth('/api/auth/me')
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
  async getUserGamification(userId: string) {
    try {
      return await this.fetchWithAuth(`/api/user-gamification/dashboard/${userId}`)
    } catch (error) {
      console.error('Error fetching gamification data:', error)
      return null
    }
  }

  // Portfolio
  async getUserPortfolio(userId: string) {
    try {
      return await this.fetchWithAuth(`/api/user-portfolio/analytics`)
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
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
  async getSystemStatus() {
    try {
      return await this.fetchWithAuth('/api/system-instructions/status')
    } catch (error) {
      console.error('Error fetching system status:', error)
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
}

export const apiService = new ApiService()
export default apiService
