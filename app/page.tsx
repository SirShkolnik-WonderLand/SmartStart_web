'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { apiService } from './services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const redirectAfterLogin = () => {
    router.push('/venture-gate')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const response = await apiService.login(email, password)
      if (response.success) {
        // Token is now stored in HTTP-only cookie by the backend
        redirectAfterLogin()
      } else {
        setError(response.message || 'Login failed. Please check your credentials.')
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during login.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center p-4">
      <div style={{ width: '320px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-3">
            <div style={{ width: '40px', height: '40px' }} className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <div style={{ width: '20px', height: '20px' }} className="bg-white rounded-sm"></div>
            </div>
          </div>
          <h1 style={{ fontSize: '20px' }} className="font-bold text-white mb-1">SmartStart</h1>
          <p style={{ fontSize: '12px' }} className="text-gray-400">AliceSolutions Ventures</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          <div className="text-center mb-4">
            <h2 style={{ fontSize: '16px' }} className="font-semibold text-white mb-1">Welcome Back</h2>
            <p style={{ fontSize: '12px' }} className="text-gray-400">Sign in to access your account</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '14px', height: '14px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 8px 8px 28px', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '14px', height: '14px' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 32px 8px 28px', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: '10px 16px', 
                background: '#00ff88', 
                color: '#000000', 
                border: 'none', 
                borderRadius: '4px', 
                fontSize: '13px', 
                fontWeight: '600', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{ width: '14px', height: '14px', border: '2px solid #000000', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>
              Don't have an account?{' '}
              <a
                href="/register"
                style={{ color: '#00ff88', textDecoration: 'underline' }}
              >
                Create Account
              </a>
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  )
}