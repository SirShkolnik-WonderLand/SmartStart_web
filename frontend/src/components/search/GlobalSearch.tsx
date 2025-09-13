'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Building2, 
  Users, 
  FileText, 
  Coins,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { apiService } from '@/lib/api'

interface SearchResult {
  id: string
  type: 'venture' | 'user' | 'document' | 'team' | 'company' | 'buz'
  title: string
  description: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  metadata?: {
    status?: string
    date?: string
    author?: string
    category?: string
  }
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function GlobalSearch({ isOpen, onClose, className = '' }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        handleResultClick(results[selectedIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate API call - replace with actual search endpoint
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'venture',
          title: 'AI-Powered Analytics Platform',
          description: 'Revolutionary analytics platform using machine learning',
          url: '/ventures/1',
          icon: Building2,
          metadata: {
            status: 'Active',
            date: '2024-01-15',
            author: 'John Doe'
          }
        },
        {
          id: '2',
          type: 'user',
          title: 'Sarah Johnson',
          description: 'Senior Developer at TechCorp',
          url: '/users/2',
          icon: Users,
          metadata: {
            status: 'Online',
            category: 'Developer'
          }
        },
        {
          id: '3',
          type: 'document',
          title: 'Partnership Agreement Template',
          description: 'Standard template for venture partnerships',
          url: '/documents/3',
          icon: FileText,
          metadata: {
            category: 'Legal',
            date: '2024-01-10'
          }
        },
        {
          id: '4',
          type: 'buz',
          title: 'BUZ Token Rewards',
          description: 'Earn BUZ tokens for platform contributions',
          url: '/buz',
          icon: Coins,
          metadata: {
            status: 'Active',
            category: 'Rewards'
          }
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

      setResults(mockResults)
      
      // Add to recent searches
      if (searchQuery && !recentSearches.includes(searchQuery)) {
        const newRecent = [searchQuery, ...recentSearches].slice(0, 5)
        setRecentSearches(newRecent)
        localStorage.setItem('recent-searches', JSON.stringify(newRecent))
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      search(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    onClose()
  }

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm)
    search(searchTerm)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-searches')
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'venture': return Building2
      case 'user': return Users
      case 'document': return FileText
      case 'team': return Users
      case 'company': return Building2
      case 'buz': return Coins
      default: return Search
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'venture': return 'text-blue-500'
      case 'user': return 'text-green-500'
      case 'document': return 'text-purple-500'
      case 'team': return 'text-orange-500'
      case 'company': return 'text-indigo-500'
      case 'buz': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`relative mx-auto mt-20 max-w-2xl ${className}`}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search ventures, users, documents, teams..."
              className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={onClose}
              className="ml-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-8 text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {!isLoading && !error && query && results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            )}

            {!isLoading && !error && !query && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((searchTerm, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(searchTerm)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center"
                    >
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {searchTerm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !error && results.length > 0 && (
              <div className="p-2">
                {results.map((result, index) => {
                  const IconComponent = getResultIcon(result.type)
                  const iconColor = getResultColor(result.type)
                  
                  return (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-start space-x-3 ${
                        selectedIndex === index
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center ${iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {result.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{result.description}</p>
                        {result.metadata && (
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {result.metadata.status && (
                              <span className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-1 ${
                                  result.metadata.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                                {result.metadata.status}
                              </span>
                            )}
                            {result.metadata.date && (
                              <span>{result.metadata.date}</span>
                            )}
                            {result.metadata.author && (
                              <span>by {result.metadata.author}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Search Tips */}
          {!query && !isLoading && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↑↓</kbd>
                  <span className="ml-1">Navigate</span>
                </div>
                <div className="flex items-center">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Enter</kbd>
                  <span className="ml-1">Select</span>
                </div>
                <div className="flex items-center">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
                  <span className="ml-1">Close</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}