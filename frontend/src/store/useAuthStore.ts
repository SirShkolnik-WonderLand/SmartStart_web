import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  totalPortfolioValue?: number
  activeProjectsCount?: number
  totalContributions?: number
  permissions?: string[]
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUser: (updates: Partial<User>) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: (user: User, token: string) => {
        localStorage.setItem('auth-token', token)
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      },
      
      logout: () => {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-id')
        localStorage.removeItem('user-data')
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setError: (error: string | null) => {
        set({ error })
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates }
          })
        }
      },
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'wonderland-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

