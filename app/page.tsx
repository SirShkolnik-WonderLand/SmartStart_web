'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CLILogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginStep, setLoginStep] = useState(0)
  const [asciiArt, setAsciiArt] = useState('')
  const router = useRouter()

  // ASCII Art Animation
  useEffect(() => {
    const artFrames = [
      `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗████████╗  ║
║   ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝╚══╗██╔══╝  ║
║   ███████╗██╔████╔██║███████║██████╔╝   ██║      ║██║     ║
║   ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║      ║██║     ║
║   ███████║██║ ╚═╝ ██║██║  ██║██║  ██╗   ██║      ██║     ║
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
║   ███████║██║ ╚═╝ ██║██║  ██║██║  ██╗   ██║      ██║     ║
║   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝     ║
║                                                              ║
║                    SMARTSTART PLATFORM                       ║
║                   🚀 VENTURE OPERATING SYSTEM 🚀            ║
║                                                              ║
║              [7 SYSTEMS DEPLOYED • 145 ENDPOINTS]            ║
║                                                              ║
║                    🔐 AUTHENTICATION REQUIRED 🔐             ║
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
║   ███████║██║ ╚═╝ ██║██║  ██║██║  ██╗   ██║      ██║     ║
║   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝     ║
║                                                              ║
║                    SMARTSTART PLATFORM                       ║
║                   🚀 VENTURE OPERATING SYSTEM 🚀            ║
║                                                              ║
║              [7 SYSTEMS DEPLOYED • 145 ENDPOINTS]            ║
║                                                              ║
║                    🔐 AUTHENTICATION REQUIRED 🔐             ║
║                                                              ║
║                    ⚡ INITIALIZING SYSTEMS ⚡                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `
    ]

    let frameIndex = 0
    const interval = setInterval(() => {
      setAsciiArt(artFrames[frameIndex])
      frameIndex = (frameIndex + 1) % artFrames.length
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Simulate login process
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // For demo, redirect to CLI dashboard
      router.push('/cli-dashboard')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* ASCII Art Header */}
      <div className="text-center mb-8">
        <pre className="text-xs leading-tight overflow-hidden">
          {asciiArt}
        </pre>
      </div>

      {/* Login Form */}
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-green-400 mb-2">
              🔐 SYSTEM ACCESS REQUIRED
            </h2>
            <p className="text-green-300 text-sm">
              Enter your credentials to access SmartStart Platform
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-green-400 text-sm font-bold mb-2">
                USERNAME:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-300"
                placeholder="Enter username..."
                required
              />
            </div>

            <div>
              <label className="block text-green-400 text-sm font-bold mb-2">
                PASSWORD:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded focus:outline-none focus:border-green-300"
                placeholder="Enter password..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {isLoading ? '🔐 AUTHENTICATING...' : '🚀 LOGIN TO SYSTEM'}
            </button>
          </form>

          {/* System Status */}
          <div className="mt-6 p-4 bg-black rounded border border-green-500">
            <h3 className="text-green-400 font-bold mb-2">📊 SYSTEM STATUS:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-400">✅ ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>API Services:</span>
                <span className="text-green-400">✅ OPERATIONAL</span>
              </div>
              <div className="flex justify-between">
                <span>Endpoints:</span>
                <span className="text-green-400">145 ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>Systems:</span>
                <span className="text-green-400">7 DEPLOYED</span>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mt-4 text-center">
            <p className="text-green-300 text-sm">
              💡 Demo Access: admin / password123
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-green-300 text-sm">
        <p>SmartStart Platform v2.0.0 • All Systems Operational</p>
        <p className="mt-1">🚀 Ready for Production Use</p>
      </div>
    </div>
  )
}
