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
      const response = await apiService.register({ username, email, password })
      if (response.success) {
        localStorage.setItem('auth-token', response.token)
        document.cookie = `web_session=${response.token}; path=/; HttpOnly; Secure; SameSite=Lax`
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SmartStart</h1>
          <p className="text-gray-400 text-base">AliceSolutions Ventures</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
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
          className="card p-6"
        >
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">Account Details</h2>
                <p className="text-gray-400 text-sm">Create your account credentials</p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10 pr-12"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input pl-10 pr-12"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                disabled={isLoading || !username || !email || !password || !confirmPassword}
                className="btn btn-primary w-full py-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a
                href="/"
                className="text-green-400 hover:text-green-300 font-medium underline"
              >
                Sign In
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}