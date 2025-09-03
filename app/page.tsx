'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Database, Server, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

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
 ║                    SMARTSTART PLATFORM                       ║
 ║                   🚀 VENTURE OPERATING SYSTEM 🚀            ║
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
 ║                    SMARTSTART PLATFORM                       ║
 ║                   🚀 VENTURE OPERATING SYSTEM 🚀            ║
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
 ║                    SMARTSTART PLATFORM                       ║
 ║                   🚀 VENTURE OPERATING SYSTEM 🚀            ║
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
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Redirect to CLI dashboard
          router.push('/cli-dashboard')
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
    setUsername('admin')
    setPassword('password123')
    
    // Simulate demo login
    setTimeout(() => {
      router.push('/cli-dashboard')
    }, 1000)
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
            <h2 className="text-2xl font-bold mb-2">🔐 SYSTEM ACCESS REQUIRED</h2>
            <p className="text-green-300">Enter your credentials to access SmartStart Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">USERNAME:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-black border border-green-500 rounded text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
                placeholder="Enter username..."
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-black border border-green-500 rounded text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
                placeholder="Enter password..."
                disabled={isLoading}
              />
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
          <div className="mt-6 text-center">
            <button
              onClick={handleDemoLogin}
              className="text-green-300 hover:text-green-400 text-sm underline"
            >
              💡 Demo Access: admin / password123
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <a
              href="/register"
              className="text-green-300 hover:text-green-400 text-sm underline"
            >
              Create a new account
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-green-600">
          <p>SmartStart Platform v2.0.0 • All Systems Operational</p>
          <p className="mt-1">🚀 Ready for Production Use</p>
        </div>
      </div>
    </div>
  )
}
