'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { comprehensiveApiService as apiService } from '@/lib/api-comprehensive'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Clear any old localStorage data before login
      localStorage.removeItem('user-id')
      localStorage.removeItem('user-data')
      localStorage.removeItem('auth-token')
      
      const response = await apiService.login(email, password)
      
      if (response.success) {
        // Redirect to dashboard on successful login
        router.push('/dashboard')
      } else {
        setError(response.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg mx-auto mb-4">
            <div className="h-8 w-8 text-white">🔑</div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Enter Wonderland and continue your journey
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Sign In</h2>
              <p className="text-muted-foreground">Access your account to continue building</p>
            </div>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <a href="/auth/register" className="text-primary hover:underline font-medium">
                  Create one here
                </a>
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Test credentials:
              </p>
              <div className="text-xs space-y-1">
                <p><strong>Test User:</strong> test@example.com / password123</p>
                <p className="text-muted-foreground">Real user with real ventures in database</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}