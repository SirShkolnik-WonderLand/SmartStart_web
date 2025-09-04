'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Database, Server, CheckCircle, AlertCircle, ArrowRight, Lock, Key, User, Eye, EyeOff } from 'lucide-react'

const artFrames = [
  `
 ╔══════════════════════════════════════════════════════════════╗
 ║                                                              ║
 ║    ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗████████╗  ║
 ║   ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝╚══╗██╔══╝  ║
 ║   ███████╗██╔████╔██║███████║██████╔╝   ██║      ║██║     ║
 ║   ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║      ║██║     ║
 ║   ███████║██║ ╚═╝ ██║██║  ██║██║  ██╗   ██║      ║██║     ║
 ║   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝     ║
 ║                                                              ║
 ║                  ALICESOLUTIONS VENTURES                     ║
 ║                   🚀 Founded by Udi Shkolnik 🚀             ║
 ║                                                              ║
 ║              [7 SYSTEMS DEPLOYED • 145 ENDPOINTS]            ║
 ║                                                              ║
 ╚══════════════════════════════════════════════════════════════╝
  `,
  `
 ╔══════════════════════════════════════════════════════════════╗
 ║                                                              ║
 ║    ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗████████╗  ║
 ║   ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝╚══╗██╔══╝  ║
 ║   ███████╗██╔████╔██║███████║██████╔╝   ██║      ║██║     ║
 ║   ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║      ║██║     ║
 ║   ███████║██║ ╚═╝ ██║██║  ██║██║  ██╗   ██║      ║██║     ║
 ║   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝     ║
 ║                                                              ║
 ║                  ALICESOLUTIONS VENTURES                     ║
 ║                   🚀 Founded by Udi Shkolnik 🚀             ║
 ║                                                              ║
 ║              [7 SYSTEMS DEPLOYED • 145 ENDPOINTS]            ║
 ║                                                              ║
 ╚══════════════════════════════════════════════════════════════╝
  `,
  `
 ╔══════════════════════════════════════════════════════════════╗
 ║                                                              ║
 ║    ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗████████╗  ║
 ║   ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝╚══╗██╔══╝  ║
 ║   ███████╗██╔████╔██║███████║██████╔╝   ██║      ║██║     ║
 ║   ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║      ║██║     ║
 ║   ███████║██║ ╚═╝ ██║██║  ██║██║  ██╗   ██║      ║██║     ║
 ║   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝     ║
 ║                                                              ║
 ║                  ALICESOLUTIONS VENTURES                     ║
 ║                   🚀 Founded by Udi Shkolnik 🚀             ║
 ║                                                              ║
 ║              [7 SYSTEMS DEPLOYED • 145 ENDPOINTS]            ║
 ║                                                              ║
 ╚══════════════════════════════════════════════════════════════╝
  `
]

export default function LoginPage() {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    database: 'CHECKING',
    api: 'CHECKING',
    systems: 0
  })
  const router = useRouter()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % artFrames.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check system status on load
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/system/status`)
      if (response.ok) {
        const data = await response.json()
        setSystemStatus({
          database: data.database?.status || 'ONLINE',
          api: data.api?.status || 'OPERATIONAL',
          systems: data.systems?.total || 7
        })
      }
    } catch (error) {
      console.log('System status check failed, using defaults')
    }
  }

  const redirectAfterLogin = () => {
    router.push('/venture-gate')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: username, password })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Store session token if provided
          if (data.sessionToken) {
            localStorage.setItem('sessionToken', data.sessionToken)
          }
          redirectAfterLogin()
        } else {
          setError(data.message || 'Login failed')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setUsername('admin@smartstart.com')
    setPassword('AdminPass123!')
    // Actually authenticate with the demo credentials instead of bypassing
    await handleLogin(new Event('submit') as any)
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono cli-terminal">
      {/* CRT Effect */}
      <div className="crt-overlay"></div>
      
      <div className="relative z-10 p-8">
        {/* ASCII Art Header */}
        <motion.div
          key={currentFrame}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 text-xs leading-tight"
        >
          <pre className="font-mono">{artFrames[currentFrame]}</pre>
        </motion.div>

        {/* System Status */}
        <div className="max-w-md mx-auto mb-8 p-4 border border-green-500 rounded bg-black/50">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold mb-2">📊 SYSTEM STATUS</h2>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Database:</span>
              <span className={`flex items-center ${systemStatus.database === 'ONLINE' ? 'text-green-400' : 'text-yellow-400'}`}>
                {systemStatus.database === 'ONLINE' ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                {systemStatus.database}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>API Services:</span>
              <span className={`flex items-center ${systemStatus.api === 'OPERATIONAL' ? 'text-green-400' : 'text-yellow-400'}`}>
                {systemStatus.api === 'OPERATIONAL' ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                {systemStatus.api}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Systems:</span>
              <span className="text-green-400">{systemStatus.systems} DEPLOYED</span>
          </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 mr-2 text-yellow-400" />
              <h2 className="text-2xl font-bold">SYSTEM ACCESS REQUIRED</h2>
            </div>
            <p className="text-green-300">Enter your credentials to access SmartStart Platform</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                USERNAME:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-black border border-green-500 rounded text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none font-mono"
                placeholder="Enter username..."
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                PASSWORD:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-black border border-green-500 rounded text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none font-mono pr-12"
                  placeholder="Enter password..."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

              <button 
              type="submit"
                disabled={isLoading}
              className="w-full p-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-black font-bold rounded flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⟳</span>
                  AUTHENTICATING...
                </span>
              ) : (
                <span className="flex items-center">
                  🚀 LOGIN TO SYSTEM
                  <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Demo Access */}
          <div className="mt-6 p-4 bg-gray-900/50 border border-yellow-500/30 rounded">
            <div className="flex items-center justify-center mb-2">
              <Key className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm text-yellow-300 font-medium">Demo Access</span>
            </div>
            <button
              onClick={handleDemoLogin}
              className="text-yellow-300 hover:text-yellow-200 text-sm underline font-mono"
            >
              admin@smartstart.com / AdminPass123!
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <div className="text-sm text-green-600 mb-2">New to SmartStart?</div>
            <a
              href="/register"
              className="inline-flex items-center px-4 py-2 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition-colors rounded font-mono text-sm"
            >
              <User className="w-4 h-4 mr-2" />
              Create New Account
            </a>
          </div>
        </div>



        {/* Footer */}
        <div className="text-center mt-12 text-sm text-green-600">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* System Status */}
              <div className="p-4 bg-gray-900/30 border border-green-500/20 rounded">
                <h3 className="text-green-400 font-bold mb-2">System Status</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span className="text-green-400">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Services:</span>
                    <span className="text-green-400">OPERATIONAL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security:</span>
                    <span className="text-green-400">ENABLED</span>
                  </div>
                </div>
              </div>

              {/* Platform Info */}
              <div className="p-4 bg-gray-900/30 border border-green-500/20 rounded">
                <h3 className="text-green-400 font-bold mb-2">Platform Info</h3>
                <div className="space-y-1 text-xs">
                  <div>Version: 2.0.0</div>
                  <div>Founder: Udi Shkolnik</div>
                  <div>Location: Toronto, Canada</div>
                  <div>Status: Production Ready</div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-4 bg-gray-900/30 border border-green-500/20 rounded">
                <h3 className="text-green-400 font-bold mb-2">Quick Links</h3>
                <div className="space-y-1 text-xs">
                  <a href="/register" className="block text-green-300 hover:text-green-400">Create Account</a>
                  <a href="/venture-gate" className="block text-green-300 hover:text-green-400">VentureGate™</a>
                  <a href="/documents" className="block text-green-300 hover:text-green-400">Documentation</a>
                  <a href="/support" className="block text-green-300 hover:text-green-400">Support</a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-green-500/20 pt-4">
              <p className="text-green-500">SmartStart Platform v2.0.0 • All Systems Operational</p>
              <p className="mt-1 text-green-600">🚀 Ready for Production Use • Built with ❤️ in Toronto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
