'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react'
import { apiService } from '../services/api'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const steps = [
    { id: 1, title: 'Account', icon: User },
    { id: 2, title: 'Verify', icon: Mail },
    { id: 3, title: 'Complete', icon: CheckCircle }
  ]

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const response = await apiService.register({ 
        username, 
        email, 
        firstName, 
        lastName, 
        password 
      })
      if (response.success) {
        // Store user ID for API calls
        if (response.user && response.user.id) {
          localStorage.setItem('user-id', response.user.id)
        }
        // For now, we'll use a simple token since the backend doesn't return one
        const simpleToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('auth-token', simpleToken)
        document.cookie = `web_session=${simpleToken}; path=/; HttpOnly; Secure; SameSite=Lax`
        router.push('/venture-gate')
      } else {
        setError(response.message || 'Registration failed. Please try again.')
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during registration.')
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

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-4">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon
            const isActive = step === stepItem.id
            const isCompleted = step > stepItem.id
            return (
              <div key={stepItem.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-green-400 text-white' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepItem.id ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="text-center mb-3">
                <h2 style={{ fontSize: '16px' }} className="font-semibold text-white mb-1">Account Details</h2>
                <p style={{ fontSize: '12px' }} className="text-gray-400">Create your account credentials</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '14px', height: '14px' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', padding: '8px 8px 8px 28px', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                    placeholder="First name"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 32px 8px 28px', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                    placeholder="Create a password"
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

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '14px', height: '14px' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 32px 8px 28px', background: '#1a1a1a', border: '1px solid #333333', borderRadius: '4px', color: '#ffffff', fontSize: '13px' }}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
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
                onClick={handleRegister}
                disabled={isLoading || !username || !email || !firstName || !lastName || !password || !confirmPassword}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Login Link */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>
              Already have an account?{' '}
              <a
                href="/"
                style={{ color: '#00ff88', textDecoration: 'underline' }}
              >
                Sign In
              </a>
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  )
}