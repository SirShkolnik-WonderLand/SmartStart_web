'use client';

import { useState, useEffect, useRef } from 'react';
import './globals.css';

interface Command {
  id: string;
  command: string;
  description: string;
  category: string;
  endpoint?: string;
  method?: string;
  body?: any;
}

interface System {
  name: string;
  status: string;
  endpoints: number;
  features: string[];
}

export default function CLIDashboard() {
  const [currentView, setCurrentView] = useState<'main' | 'system' | 'api' | 'help'>('main');
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const systems: System[] = [
    {
      name: "Legal Foundation System",
      status: "✅ OPERATIONAL",
      endpoints: 35,
      features: ["Contracts", "Templates", "Signatures", "Amendments", "Compliance"]
    },
    {
      name: "Company Management System",
      status: "✅ OPERATIONAL",
      endpoints: 17,
      features: ["Company CRUD", "Industry Classification", "Hierarchy", "Metrics", "Documents", "Tagging"]
    },
    {
      name: "Team Management System",
      status: "✅ OPERATIONAL",
      endpoints: 15,
      features: ["Team Structure", "Collaboration", "Goals", "Metrics", "Communication", "Analytics"]
    },
    {
      name: "Contribution Pipeline System",
      status: "✅ OPERATIONAL",
      endpoints: 18,
      features: ["Project Management", "Task Management", "Workflow Automation", "Performance Tracking", "Contribution Analytics"]
    },
    {
      name: "Gamification System",
      status: "✅ OPERATIONAL",
      endpoints: 20,
      features: ["XP", "Levels", "Badges", "Reputation", "Portfolio", "Skills", "Leaderboards"]
    },
    {
      name: "User Management System",
      status: "✅ OPERATIONAL",
      endpoints: 25,
      features: ["User CRUD", "Profiles", "Privacy", "Connections", "Portfolio", "Skills", "Analytics"]
    },
    {
      name: "Venture Management System",
      status: "✅ OPERATIONAL",
      endpoints: 15,
      features: ["Ventures", "Legal Entities", "Equity", "IT Packs", "Growth Tracking"]
    }
  ];

  const commands: Command[] = [
    // System Commands
    { id: 'status', command: 'status', description: 'Show system status', category: 'system' },
    { id: 'systems', command: 'systems', description: 'List all systems', category: 'system' },
    { id: 'health', command: 'health', description: 'Check system health', category: 'system' },
    
    // Navigation Commands
    { id: 'cd', command: 'cd <system>', description: 'Change to system directory', category: 'navigation' },
    { id: 'ls', command: 'ls', description: 'List current directory contents', category: 'navigation' },
    { id: 'pwd', command: 'pwd', description: 'Show current directory', category: 'navigation' },
    { id: 'back', command: 'back', description: 'Go back to main menu', category: 'navigation' },
    
    // API Commands
    { id: 'api', command: 'api <endpoint>', description: 'Make API call to endpoint', category: 'api' },
    { id: 'test', command: 'test <system>', description: 'Test system endpoints', category: 'api' },
    
    // Help Commands
    { id: 'help', command: 'help', description: 'Show available commands', category: 'help' },
    { id: 'clear', command: 'clear', description: 'Clear terminal output', category: 'help' },
    { id: 'about', command: 'about', description: 'Show system information', category: 'help' },
  ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setCommandHistory(prev => [...prev, `$ ${trimmedCmd}`]);
    setCurrentCommand('');
    setLoading(true);

    try {
      let result = '';

      if (trimmedCmd === 'status') {
        result = await getSystemStatus();
      } else if (trimmedCmd === 'systems') {
        result = displaySystems();
      } else if (trimmedCmd === 'health') {
        result = await checkHealth();
      } else if (trimmedCmd.startsWith('cd ')) {
        const systemName = trimmedCmd.substring(3);
        result = changeDirectory(systemName);
      } else if (trimmedCmd === 'ls') {
        result = listDirectory();
      } else if (trimmedCmd === 'pwd') {
        result = showCurrentDirectory();
      } else if (trimmedCmd === 'back') {
        result = goBack();
      } else if (trimmedCmd === 'help') {
        result = showHelp();
      } else if (trimmedCmd === 'clear') {
        setOutput('');
        setLoading(false);
        return;
      } else if (trimmedCmd === 'about') {
        result = showAbout();
      } else if (trimmedCmd.startsWith('test ')) {
        const systemName = trimmedCmd.substring(5);
        result = await testSystem(systemName);
      } else {
        result = `Command not found: ${trimmedCmd}. Type 'help' for available commands.`;
      }

      setOutput(prev => prev + `\n${result}`);
    } catch (error) {
      setOutput(prev => prev + `\nError: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getSystemStatus = async () => {
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/system/status');
      const data = await response.json();
      
      if (data.success) {
        const status = data.systemStatus;
        return `
🚀 SmartStart Platform Status
═══════════════════════════════════════════════════════════════════════════════

Platform: ${status.platform}
Version: ${status.version}
Status: ${status.status}
Total Endpoints: ${status.totalEndpoints}
Total Features: ${status.totalFeatures}
Database Tables: ${status.databaseTables}

Deployed Systems:
${status.deployedSystems.map((sys: any) => 
  `  ${sys.status} ${sys.name} (${sys.endpoints} endpoints)`
).join('\n')}

Next Phase: ${status.nextPhase}
═══════════════════════════════════════════════════════════════════════════════`;
      } else {
        return 'Failed to get system status';
      }
    } catch (error) {
      return `Error fetching system status: ${error}`;
    }
  };

  const displaySystems = () => {
    return `
📊 SmartStart Platform Systems
═══════════════════════════════════════════════════════════════════════════════

${systems.map((sys, index) => `
${index + 1}. ${sys.name}
   Status: ${sys.status}
   Endpoints: ${sys.endpoints}
   Features: ${sys.features.join(', ')}
`).join('')}

Use 'cd <system_name>' to navigate to a system
═══════════════════════════════════════════════════════════════════════════════`;
  };

  const checkHealth = async () => {
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/health');
      const data = await response.json();
      
      return `
🏥 System Health Check
═══════════════════════════════════════════════════════════════════════════════

Status: ${data.status}
Environment: ${data.environment}
Database: ${data.database}
Timestamp: ${data.timestamp}

Services:
  Worker: ${data.services?.worker ? '✅' : '❌'}
  Storage: ${data.services?.storage ? '✅' : '❌'}
  Monitor: ${data.services?.monitor ? '✅' : '❌'}
═══════════════════════════════════════════════════════════════════════════════`;
    } catch (error) {
      return `Error checking health: ${error}`;
    }
  };

  const changeDirectory = (systemName: string) => {
    const system = systems.find(s => 
      s.name.toLowerCase().includes(systemName.toLowerCase())
    );
    
    if (system) {
      setSelectedSystem(system);
      setCurrentView('system');
      return `Changed directory to: ${system.name}`;
    } else {
      return `System not found: ${systemName}`;
    }
  };

  const listDirectory = () => {
    if (selectedSystem) {
      return `
📁 ${selectedSystem.name} Directory
═══════════════════════════════════════════════════════════════════════════════

Status: ${selectedSystem.status}
Endpoints: ${selectedSystem.endpoints}

Features:
${selectedSystem.features.map(feature => `  • ${feature}`).join('\n')}

Commands:
  • test - Test system endpoints
  • back - Return to main menu
═══════════════════════════════════════════════════════════════════════════════`;
    } else {
      return `
📁 Main Directory
═══════════════════════════════════════════════════════════════════════════════

Available Systems:
${systems.map(sys => `  • ${sys.name}`).join('\n')}

Commands:
  • cd <system> - Navigate to system
  • systems - List all systems
  • status - Show system status
═══════════════════════════════════════════════════════════════════════════════`;
    }
  };

  const showCurrentDirectory = () => {
    if (selectedSystem) {
      return `Current directory: /systems/${selectedSystem.name}`;
    } else {
      return 'Current directory: /';
    }
  };

  const goBack = () => {
    setSelectedSystem(null);
    setCurrentView('main');
    return 'Returned to main directory';
  };

  const showHelp = () => {
    return `
❓ Available Commands
═══════════════════════════════════════════════════════════════════════════════

System Commands:
  status          - Show system status
  systems         - List all systems
  health          - Check system health

Navigation Commands:
  cd <system>     - Change to system directory
  ls              - List current directory contents
  pwd             - Show current directory
  back            - Go back to main menu

API Commands:
  test <system>   - Test system endpoints

Help Commands:
  help            - Show this help
  clear           - Clear terminal output
  about           - Show system information

Examples:
  cd company      - Navigate to Company Management System
  test gamification - Test Gamification System endpoints
  ls              - List current directory
═══════════════════════════════════════════════════════════════════════════════`;
  };

  const showAbout = () => {
    return `
ℹ️  SmartStart Platform
═══════════════════════════════════════════════════════════════════════════════

SmartStart Platform is a comprehensive Venture Operating System that provides
everything a new venture needs in one controlled ecosystem.

Features:
  • Infrastructure: IT pack provisioning (M365, GitHub, hosting, backups)
  • Governance: Legal contracts, equity management, compliance
  • Community: Contributor management, skill verification, reputation system
  • Security: KYC/KYB, device posture, audit logging
  • Gamification: XP, levels, badges, reputation building
  • BUZ Economy: Token-based contribution rewards and equity conversion

Technology Stack:
  • Backend: Node.js/Express.js with Prisma ORM
  • Database: PostgreSQL with advanced indexing
  • Hosting: Render.com Standard Plan (2GB RAM, 1 CPU)
  • Deployment: Git-based automated deployment

Current Status: 7 Major Systems Deployed & Operational
Total Endpoints: 145
Total Features: 84
Database Tables: 31+

Next Phase: Financial Integration & BUZ Token System
═══════════════════════════════════════════════════════════════════════════════`;
  };

  const testSystem = async (systemName: string) => {
    const system = systems.find(s => 
      s.name.toLowerCase().includes(systemName.toLowerCase())
    );
    
    if (!system) {
      return `System not found: ${systemName}`;
    }

    try {
      let healthEndpoint = '';
      
      // Map system names to their health endpoints
      if (system.name.includes('Company')) {
        healthEndpoint = 'https://smartstart-api.onrender.com/api/companies/health';
      } else if (system.name.includes('Team')) {
        healthEndpoint = 'https://smartstart-api.onrender.com/api/teams/health';
      } else if (system.name.includes('Contribution')) {
        healthEndpoint = 'https://smartstart-api.onrender.com/api/contribution/health';
      } else if (system.name.includes('Gamification')) {
        healthEndpoint = 'https://smartstart-api.onrender.com/api/gamification/health';
      } else if (system.name.includes('User')) {
        healthEndpoint = 'https://smartstart-api.onrender.com/api/users/health';
      } else if (system.name.includes('Venture')) {
        healthEndpoint = 'https://smartstart-api.onrender.com/api/ventures/health';
      } else if (system.name.includes('Legal')) {
        healthEndpoint = 'https://smartstart-api.onrender.com/api/contracts/health';
      }

      if (healthEndpoint) {
        const response = await fetch(healthEndpoint);
        const data = await response.json();
        
        return `
🧪 Testing ${system.name}
═══════════════════════════════════════════════════════════════════════════════

Health Check: ${data.success ? '✅ PASSED' : '❌ FAILED'}
Response: ${JSON.stringify(data, null, 2)}
═══════════════════════════════════════════════════════════════════════════════`;
      } else {
        return `No health endpoint found for ${system.name}`;
      }
    } catch (error) {
      return `Error testing ${system.name}: ${error}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    }
  };

  return (
    <div className="cli-container">
      {/* Header */}
      <div className="cli-header">
        <div className="cli-title">
          <span className="cli-prompt">$</span>
          <span className="cli-text">SmartStart Platform CLI</span>
        </div>
        <div className="cli-status">
          <span className="status-dot"></span>
          <span className="status-text">7 SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="cli-output">
        <div className="welcome-message">
          🚀 Welcome to SmartStart Platform CLI
          ═══════════════════════════════════════════════════════════════════════════
          
          Type 'help' for available commands
          Type 'status' to see system status
          Type 'systems' to list all systems
          
          ═══════════════════════════════════════════════════════════════════════════
        </div>
        
        {output && (
          <pre className="command-output">{output}</pre>
        )}
        
        {isLoading && (
          <div className="loading">
            <span className="loading-dots">Processing</span>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="cli-input-container">
        <span className="cli-prompt">$</span>
        <input
          ref={inputRef}
          type="text"
          className="cli-input"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter command..."
          disabled={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => executeCommand('status')} className="quick-btn">
          📊 Status
        </button>
        <button onClick={() => executeCommand('systems')} className="quick-btn">
          🗂️ Systems
        </button>
        <button onClick={() => executeCommand('health')} className="quick-btn">
          🏥 Health
        </button>
        <button onClick={() => executeCommand('help')} className="quick-btn">
          ❓ Help
        </button>
      </div>
    </div>
  );
}
