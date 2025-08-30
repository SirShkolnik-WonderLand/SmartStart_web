'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSmartStore } from '../utils/smartState'

interface AuthContextType {
  isInitialized: boolean
  isAuthenticated: boolean
  user: any
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useSmartStore()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize authentication state from cookies
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a token in cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1]

        if (token) {
          // Verify token with backend
          try {
            const response = await fetch('https://smartstart-api.onrender.com/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            if (response.ok) {
              const userData = await response.json()
              // Update store with user data
              useSmartStore.setState({
                user: userData,
                isAuthenticated: true
              })
            } else {
              // Token is invalid, clear cookies
              document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
              document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            }
          } catch (error) {
            console.error('Auth check failed:', error)
            // Clear invalid cookies
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    await storeLogin(email, password)
  }

  const logout = () => {
    storeLogout()
  }

  return (
    <AuthContext.Provider value={{
      isInitialized,
      isAuthenticated,
      user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
