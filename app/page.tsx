'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CLILogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [asciiArt, setAsciiArt] = useState('')
  const router = useRouter()

  useEffect(() => {
    const frames = [
      `\n┌──────────────────────────────────────────────────────────────┐\n│                        SMARTSTART PLATFORM                   │\n│                   🚀 VENTURE OPERATING SYSTEM 🚀            │\n│                                                              │\n│              [7 SYSTEMS DEPLOYED • 145 ENDPOINTS]            │\n│                                                              │\n│                 🔐 AUTHENTICATION REQUIRED 🔐                │\n└──────────────────────────────────────────────────────────────┘\n      `,
      `\n┌──────────────────────────────────────────────────────────────┐\n│                        SMARTSTART PLATFORM                   │\n│                   🚀 VENTURE OPERATING SYSTEM 🚀            │\n│                                                              │\n│              [7 SYSTEMS DEPLOYED • 145 ENDPOINTS]            │\n│                                                              │\n│                    ⚡ INITIALIZING SYSTEMS ⚡                │\n└──────────────────────────────────────────────────────────────┘\n      `,
    ]
    let i = 0
    const id = setInterval(() => {
      setAsciiArt(frames[i])
      i = (i + 1) % frames.length
    }, 1200)
    return () => clearInterval(id)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push('/cli-dashboard')
    }, 900)
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 crt">
      <div className="text-center mb-6">
        <pre className="text-xs leading-tight overflow-hidden glow">{asciiArt}</pre>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 neon-border rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-green-400 mb-2 glow">🔐 SYSTEM ACCESS REQUIRED</h2>
            <p className="text-green-300 text-sm help-hint">Enter your credentials to access SmartStart Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-green-400 text-sm font-bold mb-2">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full cli-input px-3 py-2 rounded"
                placeholder="Enter username..."
                required
              />
            </div>

            <div>
              <label className="block text-green-400 text-sm font-bold mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full cli-input px-3 py-2 rounded"
                placeholder="Enter password..."
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full cli-btn font-bold py-2 px-4 rounded">
              {isLoading ? '🔐 AUTHENTICATING...' : '🚀 LOGIN TO SYSTEM'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-black rounded neon-border">
            <h3 className="text-green-400 font-bold mb-2">📊 SYSTEM STATUS</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Database</span><span className="text-green-400">✅ ONLINE</span></div>
              <div className="flex justify-between"><span>API Services</span><span className="text-green-400">✅ OPERATIONAL</span></div>
              <div className="flex justify-between"><span>Endpoints</span><span className="text-green-400">145 ACTIVE</span></div>
              <div className="flex justify-between"><span>Systems</span><span className="text-green-400">7 DEPLOYED</span></div>
            </div>
          </div>

          <div className="mt-4 text-center text-green-300 text-sm help-hint">💡 Demo: admin / password123</div>
        </div>
      </div>

      <div className="text-center mt-6 text-green-300 text-xs help-hint">
        SmartStart Platform v2.0.0 • All Systems Operational • Ready for Production
      </div>
    </div>
  )
}
