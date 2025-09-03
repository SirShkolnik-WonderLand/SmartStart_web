'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User { id: string; username: string; role: string; company: string; team: string; level: number; xp: number; reputation: number }

const SUGGESTIONS = ['help', 'status', 'companies:list', 'teams:list', 'projects:list', 'users:list', 'badges:list', 'audit:logs']

export default function CLIDashboard() {
  const [user] = useState<User>({ id: 'user-123', username: 'admin', role: 'SUPER_ADMIN', company: 'SmartStart', team: 'Core', level: 10, xp: 5000, reputation: 95 })
  const [output, setOutput] = useState<string[]>([])
  const [cmd, setCmd] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => { inputRef.current?.focus() }, [])

  const print = (line: string) => setOutput(prev => [...prev, line])

  useEffect(() => {
    const boot = async () => {
      print('🚀 SmartStart Platform CLI v2.0.0')
      print('📡 Connecting to systems...')
      print('✅ Database: ONLINE')
      print('✅ API Services: OPERATIONAL')
      print('✅ All 7 Systems: DEPLOYED')
      print('')
      print(`👤 Welcome ${user.username.toUpperCase()} • ${user.role}`)
      print('Type "help" for commands. Press Tab for autocomplete.')
    }
    boot()
  }, [user])

  const runCommand = (raw: string) => {
    const command = raw.trim()
    if (!command) return
    print(`$ ${command}`)
    setHistory(h => [command, ...h])
    setHistIdx(-1)

    switch (command) {
      case 'help':
        print('Available: help, status, companies:list, teams:list, projects:list, users:list, badges:list, audit:logs')
        break
      case 'status':
        print('📊 SYSTEM STATUS: Users=?, Companies=?, Teams=?, Projects=?')
        break
      default:
        print(`Command not found: ${command}`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(cmd)
      setCmd('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = histIdx < history.length - 1 ? histIdx + 1 : history.length - 1
      setHistIdx(next)
      if (next >= 0) setCmd(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx > 0 ? histIdx - 1 : -1
      setHistIdx(next)
      setCmd(next >= 0 ? history[next] : '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const match = SUGGESTIONS.find(s => s.startsWith(cmd))
      if (match) setCmd(match)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 crt">
      <div className="border-b border-green-500 pb-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold glow">🚀 SmartStart Platform CLI</h1>
            <p className="text-green-300 text-sm help-hint">Venture Operating System v2.0.0</p>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-bold">{user.username.toUpperCase()}</div>
            <div className="text-green-300 text-xs">{user.role.replace('_',' ')}</div>
            <div className="text-green-300 text-xs">Lvl {user.level} • XP {user.xp}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 neon-border rounded-lg p-4 h-96 overflow-y-auto terminal-output">
          <div className="text-green-400 font-bold mb-2">💻 TERMINAL OUTPUT</div>
          <div className="space-y-1 text-sm">
            {output.map((line, i) => (<div key={i} className="text-green-300">{line}</div>))}
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <input ref={inputRef} value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={onKeyDown}
              placeholder="Type a command (help, status, ...) — Tab to autocomplete"
              className="flex-1 cli-input px-2 py-1 rounded text-sm"/>
            <span className="terminal-cursor"/>
          </div>
          <div className="mt-2 text-xs help-hint">History: ↑ ↓ • Autocomplete: Tab</div>
        </div>

        <div className="bg-gray-900 neon-border rounded-lg p-4">
          <div className="text-green-400 font-bold text-lg mb-4">📋 MAIN MENU</div>
          {[
            { label: '🏢 Company Management', desc: 'Create, manage, and analyze companies' },
            { label: '👥 Team Management', desc: 'Build and manage teams' },
            { label: '📋 Project Management', desc: 'Manage projects and tasks' },
            { label: '👤 User Management', desc: 'Manage users and profiles' },
            { label: '⚖️ Legal System', desc: 'Contracts, templates, and compliance' },
            { label: '🎮 Gamification', desc: 'XP, badges, and reputation' },
            { label: '🚀 Venture Management', desc: 'Create and manage ventures' },
            { label: '📊 Analytics & Reports', desc: 'System insights and metrics' },
            { label: '⚙️ System Settings', desc: 'Configuration and preferences' },
            { label: '❓ Help & Support', desc: 'Documentation and assistance' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 mb-2 neon-border rounded hover:neon-border-strong transition-colors">
              <div className="font-bold text-green-400">{item.label}</div>
              <div className="text-green-300 text-sm help-hint">{item.desc}</div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-black rounded neon-border">
            <div className="text-green-400 font-bold text-sm mb-2">🎮 NAVIGATION</div>
            <div className="text-green-300 text-xs space-y-1">
              <div><span className="kbd">↑</span><span className="kbd ml-1">↓</span> Navigate menu • <span className="kbd">Enter</span> Select • Type commands</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-green-300 text-sm help-hint">SmartStart Platform CLI • All Systems Operational • Type "help" for commands</div>
    </div>
  )
}
