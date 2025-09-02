'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  role: string
  company: string
  team: string
  level: number
  xp: number
  reputation: number
}

export default function CLIDashboard() {
  const [user, setUser] = useState<User>({
    id: 'user-123',
    username: 'admin',
    role: 'SUPER_ADMIN',
    company: 'SmartStart Platform',
    team: 'Core Development',
    level: 10,
    xp: 5000,
    reputation: 95
  })
  
  const [currentMenu, setCurrentMenu] = useState('main')
  const [selectedOption, setSelectedOption] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const router = useRouter()

  // Simulate typing effect
  const typeText = (text: string, speed: number = 50) => {
    return new Promise<void>((resolve) => {
      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setOutput(prev => [...prev, text[index]])
          index++
        } else {
          clearInterval(interval)
          resolve()
        }
      }, speed)
    })
  }

  // Welcome sequence
  useEffect(() => {
    const welcomeSequence = async () => {
      setOutput([])
      await typeText('🚀 SmartStart Platform CLI v2.0.0')
      await typeText('📡 Connecting to systems...')
      await typeText('✅ Database: ONLINE')
      await typeText('✅ API Services: OPERATIONAL')
      await typeText('✅ All 7 Systems: DEPLOYED')
      await typeText('')
      await typeText(`👤 Welcome back, ${user.username.toUpperCase()}!`)
      await typeText(`🏢 Company: ${user.company}`)
      await typeText(`👥 Team: ${user.team}`)
      await typeText(`⭐ Level: ${user.level} | XP: ${user.xp} | Rep: ${user.reputation}`)
      await typeText('')
      await typeText('Type "help" for available commands or use the menu below.')
    }
    
    welcomeSequence()
  }, [user])

  const handleMenuSelect = (menu: string) => {
    setCurrentMenu(menu)
    setSelectedOption(0)
    setOutput([])
  }

  const handleCommand = async (command: string) => {
    setIsLoading(true)
    setOutput(prev => [...prev, `$ ${command}`])
    
    // Simulate command execution
    setTimeout(() => {
      switch (command.toLowerCase()) {
        case 'help':
          setOutput(prev => [...prev, 'Available commands:', 'help - Show this help', 'status - System status', 'users - User management', 'companies - Company management', 'teams - Team management', 'projects - Project management', 'logout - Exit system'])
          break
        case 'status':
          setOutput(prev => [...prev, '📊 SYSTEM STATUS:', 'Database: ✅ ONLINE', 'API Services: ✅ OPERATIONAL', 'Endpoints: 145 ACTIVE', 'Systems: 7 DEPLOYED', 'Uptime: 99.9%', 'Response Time: <500ms'])
          break
        case 'logout':
          router.push('/')
          break
        default:
          setOutput(prev => [...prev, `Command not found: ${command}`])
      }
      setIsLoading(false)
    }, 1000)
  }

  const renderMainMenu = () => (
    <div className="space-y-2">
      <div className="text-green-400 font-bold text-lg mb-4">📋 MAIN MENU</div>
      {[
        { key: 'companies', label: '🏢 Company Management', desc: 'Create, manage, and analyze companies' },
        { key: 'teams', label: '👥 Team Management', desc: 'Build and manage teams' },
        { key: 'projects', label: '📋 Project Management', desc: 'Manage projects and tasks' },
        { key: 'users', label: '👤 User Management', desc: 'Manage users and profiles' },
        { key: 'legal', label: '⚖️ Legal System', desc: 'Contracts, templates, and compliance' },
        { key: 'gamification', label: '🎮 Gamification', desc: 'XP, badges, and reputation' },
        { key: 'ventures', label: '🚀 Venture Management', desc: 'Create and manage ventures' },
        { key: 'analytics', label: '📊 Analytics & Reports', desc: 'System insights and metrics' },
        { key: 'settings', label: '⚙️ System Settings', desc: 'Configuration and preferences' },
        { key: 'help', label: '❓ Help & Support', desc: 'Documentation and assistance' }
      ].map((item, index) => (
        <div
          key={item.key}
          className={`p-3 border rounded cursor-pointer transition-colors ${
            selectedOption === index 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-green-600 hover:border-green-400'
          }`}
          onClick={() => setSelectedOption(index)}
        >
          <div className="font-bold text-green-400">{item.label}</div>
          <div className="text-green-300 text-sm">{item.desc}</div>
        </div>
      ))}
    </div>
  )

  const renderCompanyMenu = () => (
    <div className="space-y-2">
      <div className="text-green-400 font-bold text-lg mb-4">🏢 COMPANY MANAGEMENT</div>
      {[
        { key: 'create', label: '➕ Create Company', desc: 'Register a new company' },
        { key: 'list', label: '📋 List Companies', desc: 'View all companies' },
        { key: 'search', label: '🔍 Search Companies', desc: 'Find specific companies' },
        { key: 'analytics', label: '📊 Company Analytics', desc: 'Performance metrics' },
        { key: 'back', label: '⬅️ Back to Main Menu', desc: 'Return to main menu' }
      ].map((item, index) => (
        <div
          key={item.key}
          className={`p-3 border rounded cursor-pointer transition-colors ${
            selectedOption === index 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-green-600 hover:border-green-400'
          }`}
          onClick={() => {
            if (item.key === 'back') {
              handleMenuSelect('main')
            } else {
              setOutput(prev => [...prev, `🏢 Executing: ${item.label}`])
            }
          }}
        >
          <div className="font-bold text-green-400">{item.label}</div>
          <div className="text-green-300 text-sm">{item.desc}</div>
        </div>
      ))}
    </div>
  )

  const renderTeamMenu = () => (
    <div className="space-y-2">
      <div className="text-green-400 font-bold text-lg mb-4">👥 TEAM MANAGEMENT</div>
      {[
        { key: 'create', label: '➕ Create Team', desc: 'Build a new team' },
        { key: 'list', label: '📋 List Teams', desc: 'View all teams' },
        { key: 'members', label: '👤 Manage Members', desc: 'Add/remove team members' },
        { key: 'goals', label: '🎯 Team Goals', desc: 'Set and track objectives' },
        { key: 'back', label: '⬅️ Back to Main Menu', desc: 'Return to main menu' }
      ].map((item, index) => (
        <div
          key={item.key}
          className={`p-3 border rounded cursor-pointer transition-colors ${
            selectedOption === index 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-green-600 hover:border-green-400'
          }`}
          onClick={() => {
            if (item.key === 'back') {
              handleMenuSelect('main')
            } else {
              setOutput(prev => [...prev, `👥 Executing: ${item.label}`])
            }
          }}
        >
          <div className="font-bold text-green-400">{item.label}</div>
          <div className="text-green-300 text-sm">{item.desc}</div>
        </div>
      ))}
    </div>
  )

  const renderProjectMenu = () => (
    <div className="space-y-2">
      <div className="text-green-400 font-bold text-lg mb-4">📋 PROJECT MANAGEMENT</div>
      {[
        { key: 'create', label: '➕ Create Project', desc: 'Start a new project' },
        { key: 'list', label: '📋 List Projects', desc: 'View all projects' },
        { key: 'tasks', label: '✅ Manage Tasks', desc: 'Create and assign tasks' },
        { key: 'progress', label: '📈 Project Progress', desc: 'Track project status' },
        { key: 'back', label: '⬅️ Back to Main Menu', desc: 'Return to main menu' }
      ].map((item, index) => (
        <div
          key={item.key}
          className={`p-3 border rounded cursor-pointer transition-colors ${
            selectedOption === index 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-green-600 hover:border-green-400'
          }`}
          onClick={() => {
            if (item.key === 'back') {
              handleMenuSelect('main')
            } else {
              setOutput(prev => [...prev, `📋 Executing: ${item.label}`])
            }
          }}
        >
          <div className="font-bold text-green-400">{item.label}</div>
          <div className="text-green-300 text-sm">{item.desc}</div>
        </div>
      ))}
    </div>
  )

  const renderMenu = () => {
    switch (currentMenu) {
      case 'companies':
        return renderCompanyMenu()
      case 'teams':
        return renderTeamMenu()
      case 'projects':
        return renderProjectMenu()
      default:
        return renderMainMenu()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const menuItems = currentMenu === 'main' ? 10 : 5
      if (selectedOption < menuItems - 1) {
        setSelectedOption(selectedOption + 1)
      } else {
        setSelectedOption(0)
      }
    } else if (e.key === 'ArrowUp') {
      const menuItems = currentMenu === 'main' ? 10 : 5
      setSelectedOption(selectedOption > 0 ? selectedOption - 1 : menuItems - 1)
    } else if (e.key === 'ArrowDown') {
      const menuItems = currentMenu === 'main' ? 10 : 5
      setSelectedOption(selectedOption < menuItems - 1 ? selectedOption + 1 : 0)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="border-b border-green-500 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-400">🚀 SmartStart Platform CLI</h1>
            <p className="text-green-300 text-sm">Venture Operating System v2.0.0</p>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-bold">{user.username.toUpperCase()}</div>
            <div className="text-green-300 text-sm">{user.role.replace('_', ' ')}</div>
            <div className="text-green-300 text-sm">Level {user.level} • XP {user.xp}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal Output */}
        <div className="bg-gray-900 border border-green-500 rounded-lg p-4 h-96 overflow-y-auto">
          <div className="text-green-400 font-bold mb-2">💻 TERMINAL OUTPUT</div>
          <div className="space-y-1 text-sm">
            {output.map((line, index) => (
              <div key={index} className="text-green-300">{line}</div>
            ))}
            {isLoading && (
              <div className="text-green-400 animate-pulse">⏳ Processing...</div>
            )}
          </div>
          
          {/* Command Input */}
          <div className="mt-4 flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <input
              type="text"
              placeholder="Type a command (help, status, logout)..."
              className="flex-1 bg-black border border-green-500 text-green-400 px-2 py-1 rounded text-sm focus:outline-none focus:border-green-300"
              onKeyPress={(e) => e.key === 'Enter' && handleCommand(e.currentTarget.value)}
            />
          </div>
        </div>

        {/* Menu System */}
        <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
          <div className="text-green-400 font-bold text-lg mb-4">
            {currentMenu === 'main' ? '📋 MAIN MENU' : 
             currentMenu === 'companies' ? '🏢 COMPANY MANAGEMENT' :
             currentMenu === 'teams' ? '👥 TEAM MANAGEMENT' :
             currentMenu === 'projects' ? '📋 PROJECT MANAGEMENT' : 'MENU'}
          </div>
          
          <div onKeyDown={handleKeyPress} tabIndex={0}>
            {renderMenu()}
          </div>

          {/* Navigation Help */}
          <div className="mt-6 p-3 bg-black rounded border border-green-600">
            <div className="text-green-400 font-bold text-sm mb-2">🎮 NAVIGATION:</div>
            <div className="text-green-300 text-xs space-y-1">
              <div>↑↓ Arrow Keys: Navigate menu</div>
              <div>Enter: Select option</div>
              <div>Type commands in terminal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-green-300 text-sm">
        <p>SmartStart Platform CLI • All Systems Operational • Type "help" for commands</p>
      </div>
    </div>
  )
}
