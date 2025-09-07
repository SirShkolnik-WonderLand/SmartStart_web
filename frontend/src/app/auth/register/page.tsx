'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { comprehensiveApiService as apiService } from '@/lib/api-comprehensive'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    try {
      // Create user account
      const registerResponse = await apiService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      })

              if (registerResponse.success && registerResponse.data) {
                // Initialize user journey
                const journeyResponse = await apiService.initializeJourney(registerResponse.data.id)
                
                if (journeyResponse.success) {
                  setSuccess(true)
                  
                  // Store user data and redirect to onboarding
                  localStorage.setItem('user', JSON.stringify(registerResponse.data))
                  localStorage.setItem('token', registerResponse.data.token || '')
                  
                  setTimeout(() => {
                    if (registerResponse.data) {
                      router.push(`/onboarding?userId=${registerResponse.data.id}`)
                    }
                  }, 2000)
                } else {
                  setError('Account created but failed to initialize journey. Please try logging in.')
                }
              } else {
                setError(registerResponse.error || 'Failed to create account')
              }
    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="glass-card p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Account Created!</h1>
            <p className="text-muted-foreground mb-4">
              Welcome to SmartStart! Redirecting you to complete your profile...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Setting up your journey...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg mx-auto mb-4">
            <div className="h-8 w-8 text-white">🔑</div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Join Wonderland
          </h1>
          <p className="text-muted-foreground">
            Create your account and start your journey
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
              <p className="text-muted-foreground">Fill in your details to get started</p>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="John"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Doe"
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirm your password"
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                    className="mt-1"
                    required
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a href="/legal/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/legal/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}