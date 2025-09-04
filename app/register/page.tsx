'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, FileText, Shield, Rocket } from 'lucide-react'
import { apiService } from '../services/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'

type Step = 'account' | 'agreements' | 'finish'

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('account')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreeTos, setAgreeTos] = useState(false)
  const [agreeContributor, setAgreeContributor] = useState(false)
  const [tosUnlocked, setTosUnlocked] = useState(false)
  const [contribUnlocked, setContribUnlocked] = useState(false)
  const [optOperationalEmails, setOptOperationalEmails] = useState<'opt_in' | 'opt_out'>('opt_in')
  const [optPublicListing, setOptPublicListing] = useState<'opt_in' | 'opt_out'>('opt_out')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tos, setTos] = useState<string>('Loading Terms of Service...')
  const [contrib, setContrib] = useState<string>('Loading Contributor Agreement...')
  const tosRef = useRef<HTMLDivElement>(null)
  const contribRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (step === 'agreements') {
      fetch(`${API_BASE}/api/documents/templates?code=USER_TOS`)
        .then(r => r.ok ? r.text() : Promise.resolve('SmartStart Terms of Service (summary)\n- Respect privacy & security\n- No abuse or fraud\n- Lawful use only\n- Data processed per policy'))
        .then(setTos).catch(()=>{})
      fetch(`${API_BASE}/api/documents/templates?code=CONTRIB_AGREEMENT`)
        .then(r => r.ok ? r.text() : Promise.resolve('Contributor Agreement (summary)\n- You own your IP until assigned\n- License grants for collaboration\n- Proper attributions\n- Confidentiality & compliance'))
        .then(setContrib).catch(()=>{})
    }
  }, [step])

  const onScrollUnlock = (el: HTMLDivElement | null, setter: (v:boolean)=>void) => {
    if (!el) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10
    if (nearBottom) setter(true)
  }

  const nextFromAccount = () => {
    setError('')
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return setError('Username 3-24: letters, numbers, _.-')
    setStep('agreements')
  }

  const submit = async () => {
    setError('')
    if (!agreeTos || !agreeContributor) return setError('You must agree to all terms to continue')
    setIsLoading(true)
    try {
      const response = await apiService.register({ 
        username, 
        email, 
        password, 
        preferences: { 
          operationalEmails: optOperationalEmails==='opt_in', 
          publicListing: optPublicListing==='opt_in' 
        } 
      })
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed')
      }
      router.push('/')
    } catch (e:any) {
      setError(e.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff88' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join SmartStart</h1>
            <p className="text-gray-400">Create your account to get started</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step === 'account' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'account' ? 'bg-green-400 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <User className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Account</span>
              </div>
              <div className={`w-8 h-px ${step === 'agreements' || step === 'finish' ? 'bg-green-400' : 'bg-gray-700'}`}></div>
              <div className={`flex items-center ${step === 'agreements' ? 'text-green-400' : step === 'finish' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'agreements' || step === 'finish' ? 'bg-green-400 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Agreements</span>
              </div>
              <div className={`w-8 h-px ${step === 'finish' ? 'bg-green-400' : 'bg-gray-700'}`}></div>
              <div className={`flex items-center ${step === 'finish' ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'finish' ? 'bg-green-400 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Complete</span>
              </div>
            </div>
          </motion.div>

          {/* Account Step */}
          {step === 'account' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Create Your Account</h2>
                <p className="text-gray-400 text-sm">Enter your basic information to get started</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </motion.div>
              )}

              <div className="mt-6 flex justify-between">
                <a
                  href="/"
                  className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </a>
                <button
                  onClick={nextFromAccount}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Agreements Step */}
          {step === 'agreements' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Legal Agreements</h2>
                <p className="text-gray-400 text-sm">Please review and accept our terms</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-400" />
                    Terms of Service
                  </h3>
                  <div 
                    ref={tosRef} 
                    onScroll={(e) => onScrollUnlock(e.currentTarget as HTMLDivElement, setTosUnlocked)} 
                    className="bg-black/20 rounded-lg p-4 h-40 overflow-auto text-gray-300 whitespace-pre-wrap text-sm border border-white/10"
                  >
                    {tos}

                    Platform rules:
                    - Respect collaborators; no harassment
                    - No illegal content or activity
                    - Keep credentials and tokens secret
                    - Report security issues responsibly
                    - Follow contribution process & CLA
                    - Data is processed per privacy policy
                  </div>
                  <label className="mt-3 flex items-center gap-3 text-sm">
                    <input 
                      type="checkbox" 
                      disabled={!tosUnlocked} 
                      checked={agreeTos} 
                      onChange={e => setAgreeTos(e.target.checked)}
                      className="w-4 h-4 text-green-400 bg-white/5 border-white/20 rounded focus:ring-green-400"
                    />
                    <span className="text-gray-300">I have read and agree to the Terms of Service</span>
                  </label>
                  {!tosUnlocked && <div className="text-xs text-gray-500 mt-1">Scroll to the bottom to enable consent</div>}
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Contributor Agreement
                  </h3>
                  <div 
                    ref={contribRef} 
                    onScroll={(e) => onScrollUnlock(e.currentTarget as HTMLDivElement, setContribUnlocked)} 
                    className="bg-black/20 rounded-lg p-4 h-40 overflow-auto text-gray-300 whitespace-pre-wrap text-sm border border-white/10"
                  >
                    {contrib}

                    Highlights:
                    - You can opt in to assign created IP to ventures/projects
                    - You retain moral rights where applicable
                    - You confirm originality or proper licenses
                    - You agree to confidentiality for private repos
                  </div>
                  <label className="mt-3 flex items-center gap-3 text-sm">
                    <input 
                      type="checkbox" 
                      disabled={!contribUnlocked} 
                      checked={agreeContributor} 
                      onChange={e => setAgreeContributor(e.target.checked)}
                      className="w-4 h-4 text-green-400 bg-white/5 border-white/20 rounded focus:ring-green-400"
                    />
                    <span className="text-gray-300">I have read and agree to the Contributor Agreement</span>
                  </label>
                  {!contribUnlocked && <div className="text-xs text-gray-500 mt-1">Scroll to the bottom to enable consent</div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="font-semibold text-white mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-green-400" />
                      Operational Emails
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input 
                          type="radio" 
                          name="emails" 
                          checked={optOperationalEmails === 'opt_in'} 
                          onChange={() => setOptOperationalEmails('opt_in')}
                          className="w-4 h-4 text-green-400"
                        />
                        <span className="text-gray-300">Opt-in to receive verification and security emails</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input 
                          type="radio" 
                          name="emails" 
                          checked={optOperationalEmails === 'opt_out'} 
                          onChange={() => setOptOperationalEmails('opt_out')}
                          className="w-4 h-4 text-green-400"
                        />
                        <span className="text-gray-300">Opt-out (may limit account recovery)</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="font-semibold text-white mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-green-400" />
                      Public Profile
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input 
                          type="radio" 
                          name="listing" 
                          checked={optPublicListing === 'opt_in'} 
                          onChange={() => setOptPublicListing('opt_in')}
                          className="w-4 h-4 text-green-400"
                        />
                        <span className="text-gray-300">Opt-in to appear in public listings</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input 
                          type="radio" 
                          name="listing" 
                          checked={optPublicListing === 'opt_out'} 
                          onChange={() => setOptPublicListing('opt_out')}
                          className="w-4 h-4 text-green-400"
                        />
                        <span className="text-gray-300">Opt-out (default)</span>
                      </label>
                    </div>
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

                <div className="flex justify-between">
                  <button 
                    onClick={() => setStep('account')} 
                    className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                  <button 
                    onClick={() => setStep('finish')} 
                    disabled={!agreeTos || !agreeContributor}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Finish Step */}
          {step === 'finish' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Ready to Create Account</h2>
                <p className="text-gray-400 text-sm">Review your information and create your account</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-white mb-3">Account Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span className="text-white">{username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Operational Emails:</span>
                    <span className="text-white">{optOperationalEmails === 'opt_in' ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Public Profile:</span>
                    <span className="text-white">{optPublicListing === 'opt_in' ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </motion.div>
              )}

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep('agreements')} 
                  className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button 
                  onClick={submit} 
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
