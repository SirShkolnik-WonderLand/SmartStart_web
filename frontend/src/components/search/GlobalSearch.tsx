'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  X, 
  Building2, 
  Users, 
  Target, 
  FileText, 
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface SearchResult {
  id: string
  type: 'venture' | 'company' | 'team' | 'user' | 'document' | 'opportunity'
  title: string
  description: string
  url: string
  category: string
  timestamp?: string
  metadata?: Record<string, unknown>
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filter, setFilter] = useState<'all' | 'ventures' | 'companies' | 'teams' | 'users' | 'documents' | 'opportunities'>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate search delay
    const timeoutId = setTimeout(() => {
      // Mock search results - replace with real API calls
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'venture',
          title: 'Quantum AI Labs',
          description: 'Revolutionary AI-powered quantum computing solutions for enterprise',
          url: '/ventures/quantum-ai-labs',
          category: 'Technology',
          timestamp: '2 days ago',
          metadata: { stage: 'Growth', teamSize: 12 }
        },
        {
          id: '2',
          type: 'company',
          title: 'TechStart Solutions',
          description: 'Leading provider of innovative software development services',
          url: '/companies/techstart-solutions',
          category: 'Software',
          timestamp: '1 week ago',
          metadata: { size: '51-200 employees', founded: '2020' }
        },
        {
          id: '3',
          type: 'team',
          title: 'Frontend Development Team',
          description: 'Expert team specializing in React, Next.js, and modern web technologies',
          url: '/teams/frontend-dev',
          category: 'Development',
          timestamp: '3 days ago',
          metadata: { members: 8, active: true }
        },
        {
          id: '4',
          type: 'user',
          title: 'Sarah Johnson',
          description: 'Senior Frontend Developer with 5+ years experience in React ecosystem',
          url: '/users/sarah-johnson',
          category: 'Developer',
          timestamp: 'Online now',
          metadata: { skills: ['React', 'TypeScript', 'Node.js'], level: 5 }
        },
        {
          id: '5',
          type: 'document',
          title: 'NDA Template - Standard',
          description: 'Standard Non-Disclosure Agreement template for venture collaborations',
          url: '/documents/nda-standard',
          category: 'Legal',
          timestamp: '1 month ago',
          metadata: { type: 'Template', status: 'Active' }
        },
        {
          id: '6',
          type: 'opportunity',
          title: 'Frontend Developer - Quantum AI Labs',
          description: 'Join our team to build cutting-edge quantum computing interfaces',
          url: '/opportunities/frontend-dev-quantum',
          category: 'Development',
          timestamp: '5 days ago',
          metadata: { type: 'Full-time', compensation: 'Equity + Salary' }
        }
      ]

      const filteredResults = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                           result.description.toLowerCase().includes(query.toLowerCase()) ||
                           result.category.toLowerCase().includes(query.toLowerCase())
        
        const matchesFilter = filter === 'all' || result.type === filter.slice(0, -1) as SearchResult['type']
        
        return matchesQuery && matchesFilter
      })

      setResults(filteredResults)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, filter])

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'venture':
        return <Building2 className="w-4 h-4 text-primary" />
      case 'company':
        return <Building2 className="w-4 h-4 text-accent" />
      case 'team':
        return <Users className="w-4 h-4 text-highlight" />
      case 'user':
        return <Users className="w-4 h-4 text-success" />
      case 'document':
        return <FileText className="w-4 h-4 text-warning" />
      case 'opportunity':
        return <Target className="w-4 h-4 text-primary" />
      default:
        return <Search className="w-4 h-4 text-foreground-muted" />
    }
  }

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'venture':
        return 'Venture'
      case 'company':
        return 'Company'
      case 'team':
        return 'Team'
      case 'user':
        return 'User'
      case 'document':
        return 'Document'
      case 'opportunity':
        return 'Opportunity'
      default:
        return 'Result'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      window.location.href = results[selectedIndex].url
    }
  }

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.url
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Panel */}
      <div className="relative w-full max-w-2xl glass rounded-xl border border-border shadow-2xl">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="w-5 h-5 text-foreground-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-10 py-3 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-lg"
              placeholder="Search ventures, companies, teams, users..."
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-glass-surface rounded transition-colors"
              >
                <X className="w-4 h-4 text-foreground-muted" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('ventures')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'ventures' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              Ventures
            </button>
            <button
              onClick={() => setFilter('companies')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'companies' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setFilter('teams')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'teams' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setFilter('users')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'users' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setFilter('opportunities')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'opportunities' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-glass-surface text-foreground-muted hover:text-foreground'
              }`}
            >
              Opportunities
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">Start typing to search</h3>
              <p className="text-sm text-foreground-muted">
                Search across ventures, companies, teams, users, and more
              </p>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-foreground-muted">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No results found</h3>
              <p className="text-sm text-foreground-muted">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-primary/10 border-l-4 border-primary' 
                      : 'hover:bg-glass-surface'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-glass-surface rounded-lg">
                      {getResultIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground">
                          {result.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-glass-surface text-xs text-foreground-muted rounded">
                            {getResultTypeLabel(result.type)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-foreground-muted" />
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                        {result.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-foreground-muted">
                          {result.category}
                        </span>
                        {result.timestamp && (
                          <div className="flex items-center gap-1 text-xs text-foreground-muted">
                            <Clock className="w-3 h-3" />
                            {result.timestamp}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between text-sm text-foreground-muted">
              <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
