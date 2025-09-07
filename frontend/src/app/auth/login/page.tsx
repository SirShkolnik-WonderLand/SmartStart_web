'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { comprehensiveApiService as apiService } from '@/lib/api-comprehensive'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Users, 
  Shield, 
  Rocket,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState('')
  const router = useRouter()

  const demoUsers = [
    {
      id: 'owner',
      name: 'Demo Owner',
      email: 'owner@demo.local',
      password: 'owner123',
      role: 'VENTURE_OWNER',
      description: 'Full platform access with venture management',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      features: ['Create Ventures', 'Manage Teams', 'Legal Documents', 'Full Access']
    },
    {
      id: 'admin',
      name: 'Admin User',
      email: 'admin@smartstart.com',
      password: 'admin123',
      role: 'ADMIN',
      description: 'System administration and oversight',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      features: ['System Admin', 'User Management', 'Platform Control', 'Analytics']
    },
    {
      id: 'contributor',
      name: 'Demo Contributor',
      email: 'contrib@demo.local',
      password: 'contrib123',
      role: 'CONTRIBUTOR',
      description: 'Team collaboration and project participation',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      features: ['Join Ventures', 'Collaborate', 'Track Progress', 'Team Access']
    }
  ]

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

  const handleDemoLogin = (demoUser: typeof demoUsers[0]) => {
    setEmail(demoUser.email)
    setPassword(demoUser.password)
    setSelectedDemo(demoUser.id)
    setError('')
  }

  const handleClearCache = () => {
    localStorage.clear()
    setError('')
    setEmail('')
    setPassword('')
    setSelectedDemo('')
    alert('Cache cleared! Please login again.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    SmartStart
                  </h1>
                  <p className="text-sm text-muted-foreground">Venture Platform</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Welcome to the
                  <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Future of Ventures
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
                  Build, collaborate, and scale your startup with our comprehensive platform. 
                  From legal documents to team management, we&apos;ve got you covered.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Legal Compliance</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Team Collaboration</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Venture Management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="glass-card p-8 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold">Sign In</h3>
                <p className="text-muted-foreground">Access your account to continue building</p>
              </div>
              
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-full bg-destructive flex-shrink-0"></div>
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 pr-12 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 px-4 rounded-lg hover:from-primary/90 hover:to-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <a href="/auth/register" className="text-primary hover:underline font-medium">
                    Create one here
                  </a>
                </p>
              </div>
            </div>

            {/* Demo Users Section */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2 flex items-center justify-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Demo Users</span>
                </h4>
                <p className="text-sm text-muted-foreground">Click to auto-fill credentials</p>
              </div>

              <div className="grid gap-3">
                {demoUsers.map((user) => {
                  const IconComponent = user.icon
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleDemoLogin(user)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                        selectedDemo === user.id
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-border hover:border-primary/50 bg-background/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${user.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium">{user.name}</h5>
                            {selectedDemo === user.id && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.features.map((feature, index) => (
                              <span
                                key={index}
                                className="text-xs bg-muted px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Clear Cache (if having issues)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}