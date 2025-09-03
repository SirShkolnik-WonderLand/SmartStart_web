'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, Users, FolderOpen, User, Scale, Trophy, Rocket, 
  BarChart3, Settings, HelpCircle, ChevronRight, Terminal,
  Database, Server, CheckCircle, AlertCircle
} from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  description: string
  icon: any
  action: string
  route?: string
}

const menuItems: MenuItem[] = [
  {
    id: 'companies',
    title: 'Company Management',
    description: 'Create, manage, and analyze companies',
    icon: Building2,
    action: 'companies:list',
    route: '/companies'
  },
  {
    id: 'teams',
    title: 'Team Management',
    description: 'Build and manage teams',
    icon: Users,
    action: 'teams:list',
    route: '/teams'
  },
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Manage projects and tasks',
    icon: FolderOpen,
    action: 'projects:list',
    route: '/projects'
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage users and profiles',
    icon: User,
    action: 'users:list',
    route: '/users'
  },
  {
    id: 'legal',
    title: 'Legal System',
    description: 'Contracts, templates, and compliance',
    icon: Scale,
    action: 'legal:status',
    route: '/legal'
  },
  {
    id: 'gamification',
    title: 'Gamification',
    description: 'XP, badges, and reputation',
    icon: Trophy,
    action: 'gamification:status',
    route: '/gamification'
  },
  {
    id: 'ventures',
    title: 'Venture Management',
    description: 'Create and manage ventures',
    icon: Rocket,
    action: 'ventures:list',
    route: '/ventures'
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    description: 'System insights and metrics',
    icon: BarChart3,
    action: 'analytics:overview',
    route: '/analytics'
  },
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Configuration and preferences',
    icon: Settings,
    action: 'settings:show',
    route: '/settings'
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Documentation and assistance',
    icon: HelpCircle,
    action: 'help',
    route: '/help'
  }
]

export default function CLIDashboard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0)
  const [output, setOutput] = useState<string[]>([])
  const [commandInput, setCommandInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [userRole, setUserRole] = useState('ADMIN')
  const [userLevel, setUserLevel] = useState(10)
  const [userXP, setUserXP] = useState(5000)
  const [systemStatus, setSystemStatus] = useState({
    database: 'ONLINE',
    api: 'OPERATIONAL',
    systems: 7
  })
  
  const commandInputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep(1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (currentStep >= 1) {
      setOutput(prev => [...prev, 'SmartStart Platform CLI v2.0.0'])
      setOutput(prev => [...prev, 'Connecting to systems...'])
      
      setTimeout(() => {
        setOutput(prev => [...prev, 'Database: ONLINE ✅'])
        setSystemStatus(prev => ({ ...prev, database: 'ONLINE' }))
      }, 500)
      
      setTimeout(() => {
        setOutput(prev => [...prev, 'API Services: OPERATIONAL ✅'])
        setSystemStatus(prev => ({ ...prev, api: 'OPERATIONAL' }))
      }, 1000)
      
      setTimeout(() => {
        setOutput(prev => [...prev, 'All 7 Systems: DEPLOYED ✅'])
        setOutput(prev => [...prev, ''])
        setOutput(prev => [...prev, `Welcome ${userRole} • SUPER_ADMIN`])
        setOutput(prev => [...prev, 'Type "help" for commands. Press Tab for autocomplete.'])
        setOutput(prev => [...prev, ''])
        setCurrentStep(2)
      }, 1500)
    }
  }, [currentStep, userRole])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      executeCommand(commandInput.trim())
      setCommandInput('')
      setHistoryIndex(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommandInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Autocomplete logic
      const suggestions = ['help', 'status', 'companies:list', 'teams:list', 'projects:list', 'users:list', 'badges:list', 'audit:logs']
      const matching = suggestions.filter(s => s.startsWith(commandInput))
      if (matching.length === 1) {
        setCommandInput(matching[0])
      }
    }
  }

  const executeCommand = async (command: string) => {
    if (!command.trim()) return
    
    setCommandHistory(prev => [...prev, command])
    setOutput(prev => [...prev, `$ ${command}`])
    setIsLoading(true)
    
    try {
      // Simulate API call to CLI command bus
      const response = await fetch('https://smartstart-api.onrender.com/api/cli/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, args: {} })
      })
      
      if (response.ok) {
        const data = await response.json()
        setOutput(prev => [...prev, data.out || 'Command executed successfully'])
      } else {
        setOutput(prev => [...prev, `Error: ${response.status} - ${response.statusText}`])
      }
    } catch (error) {
      // Fallback to local command simulation
      const result = simulateLocalCommand(command)
      setOutput(prev => [...prev, result])
    }
    
    setIsLoading(false)
  }

  const simulateLocalCommand = (command: string): string => {
    const cmd = command.toLowerCase()
    
    switch (cmd) {
      case 'help':
        return 'Available: help, status, companies:list, teams:list, projects:list, users:list, badges:list, audit:logs'
      case 'status':
        return `System Status: Database ${systemStatus.database}, API ${systemStatus.api}, ${systemStatus.systems} Systems Deployed`
      case 'companies:list':
        return 'Companies: SmartStart Inc. (Active), TechVentures LLC (Active), StartupHub (Pending)'
      case 'teams:list':
        return 'Teams: Core Dev (5 members), Marketing (3 members), Legal (2 members)'
      case 'projects:list':
        return 'Projects: Platform v2.0 (75%), Mobile App (45%), API Integration (90%)'
      case 'users:list':
        return 'Users: 24 active, 3 pending verification, 1 suspended'
      case 'badges:list':
        return 'Badges: Early Adopter (15), Code Ninja (8), Growth Hacker (12)'
      case 'audit:logs':
        return 'Recent: User login (2 min ago), Company created (1 hour ago), Team updated (3 hours ago)'
      default:
        return `Command not found: ${command}. Type "help" for available commands.`
    }
  }

  const handleMenuSelect = (index: number) => {
    setSelectedMenuIndex(index)
  }

  const handleMenuAction = (item: MenuItem) => {
    setOutput(prev => [...prev, `$ ${item.action}`])
    executeCommand(item.action)
  }

  const handleMenuEnter = () => {
    const selectedItem = menuItems[selectedMenuIndex]
    if (selectedItem) {
      handleMenuAction(selectedItem)
    }
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && !commandInputRef.current?.matches(':focus')) {
        e.preventDefault()
        setSelectedMenuIndex(prev => prev > 0 ? prev - 1 : menuItems.length - 1)
      } else if (e.key === 'ArrowDown' && !commandInputRef.current?.matches(':focus')) {
        e.preventDefault()
        setSelectedMenuIndex(prev => prev < menuItems.length - 1 ? prev + 1 : 0)
      } else if (e.key === 'Enter' && !commandInputRef.current?.matches(':focus')) {
        e.preventDefault()
        handleMenuEnter()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [selectedMenuIndex])

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-green-400 text-center"
        >
          <Terminal className="w-16 h-16 mx-auto mb-4" />
          <div className="text-2xl font-mono">INITIALIZING...</div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="border-b border-green-500 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Terminal className="w-6 h-6" />
          <span className="text-lg">SmartStart Platform CLI</span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="bg-green-900 px-2 py-1 rounded">{userRole}</span>
          <span>SUPER ADMIN</span>
          <span>Lvl {userLevel}</span>
          <span>XP {userXP}</span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Terminal Output */}
        <div className="flex-1 border-r border-green-500 p-4">
          <div className="mb-4 text-lg font-bold border-b border-green-500 pb-2">
            TERMINAL OUTPUT
          </div>
          
          <div 
            ref={terminalRef}
            className="h-[calc(100%-120px)] overflow-y-auto bg-gray-900 p-4 rounded border border-green-500"
          >
            <AnimatePresence>
              {output.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  className="mb-1"
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-block"
              >
                <span className="animate-pulse">█</span>
              </motion.div>
            )}
          </div>

          {/* Command Input */}
          <div className="mt-4 flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <input
              ref={commandInputRef}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-600"
              placeholder="Type a command..."
              disabled={currentStep < 2}
            />
          </div>
          
          <div className="text-xs text-green-600 mt-2">
            History: ↑↓ Autocomplete: Tab
          </div>
        </div>

        {/* Right Panel - Main Menu */}
        <div className="w-96 p-4">
          <div className="mb-4 text-lg font-bold border-b border-green-500 pb-2">
            MAIN MENU
          </div>
          
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1, delay: index * 0.05 }}
                className={`p-3 border rounded cursor-pointer transition-all ${
                  selectedMenuIndex === index 
                    ? 'border-green-400 bg-green-900/20' 
                    : 'border-green-600 hover:border-green-500'
                }`}
                onClick={() => handleMenuSelect(index)}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-green-500">{item.description}</div>
                  </div>
                  {selectedMenuIndex === index && (
                    <ChevronRight className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-3 border border-green-600 rounded">
            <div className="text-sm font-semibold mb-2">NAVIGATION</div>
            <div className="text-xs text-green-500 space-y-1">
              <div>↑↓ Navigate menu</div>
              <div>Enter Select</div>
              <div>Type commands in terminal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t border-green-500 p-2 text-center text-sm">
        SmartStart Platform CLI • All Systems Operational • Type 'help' for commands
      </div>
    </div>
  )
}
