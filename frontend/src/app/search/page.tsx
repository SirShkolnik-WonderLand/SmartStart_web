'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SortAsc, Grid, List, Clock, TrendingUp } from 'lucide-react'
import GlobalSearch from '@/components/search/GlobalSearch'

export default function SearchPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  })

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setSearchResults([])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Everything</h1>
            <p className="text-lg text-gray-600">
              Find ventures, users, documents, and more across the entire platform
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search ventures, users, documents, teams..."
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Search Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSearchQuery('active ventures')
                handleSearch('active ventures')
              }}
              className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Active Ventures</h3>
              </div>
              <p className="text-sm text-gray-600">Find currently active startup ventures</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSearchQuery('developers')
                handleSearch('developers')
              }}
              className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Find Developers</h3>
              </div>
              <p className="text-sm text-gray-600">Search for skilled developers and contributors</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSearchQuery('legal documents')
                handleSearch('legal documents')
              }}
              className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Legal Documents</h3>
              </div>
              <p className="text-sm text-gray-600">Browse legal templates and agreements</p>
            </motion.button>
          </div>

          {/* Search Results */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-gray-900">{result.title}</h3>
                    <p className="text-gray-600 mt-1">{result.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full">{result.type}</span>
                      <span>{result.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Search</h3>
                <p className="text-gray-600 mb-4">
                  Enter a search term above to find ventures, users, documents, and more across the platform.
                </p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                >
                  Open Advanced Search
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  )
}
