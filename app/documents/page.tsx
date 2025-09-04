'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { apiService, DocumentTemplate } from '../services/api'

// DocumentTemplate interface is now imported from api service

interface DocumentCategory {
  name: string
  description: string
  icon: string
}

const DocumentsPage = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [categories, setCategories] = useState<Record<string, DocumentCategory>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadDocuments()
    loadStats()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await apiService.getDocumentTemplates()
      if (response && response.data) {
        setTemplates(response.data.templates || [])
        setCategories(response.data.categories || {})
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiService.getDocumentStats()
      if (response && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <h1>Loading Document Templates...</h1>
            <p>Preparing your legal document library</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="mb-6">
        <div className="p-4 rounded border border-gray-700 flex gap-3">
          <Link className="px-3 py-2 rounded bg-gray-800" href="/documents/soba/new">Issue SOBA</Link>
          <Link className="px-3 py-2 rounded bg-gray-800" href="/documents/puoha/new">Issue PUOHA</Link>
        </div>
      </div>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>Legal Document Templates</h1>
        <p className="text-secondary">
          Comprehensive legal framework for AliceSolutions Ventures platform
        </p>
        {isClient && stats && (
          <div className="mt-4">
            <span className="status status-info">
              {stats.totalDocuments} documents • {stats.totalWords.toLocaleString()} words
            </span>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      {isClient && stats && (
        <div className="card mb-8 animate-slide-in">
          <div className="card-header">
            <h3>📊 Document Library Statistics</h3>
            <p className="text-muted">
              Overview of our comprehensive legal document collection
            </p>
          </div>
          <div className="grid grid-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">
                {stats.totalDocuments}
              </div>
              <div className="text-sm text-secondary">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">
                {formatFileSize(stats.totalSize)}
              </div>
              <div className="text-sm text-secondary">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">
                {stats.totalWords.toLocaleString()}
              </div>
              <div className="text-sm text-secondary">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">
                {Object.keys(stats.categories).length}
              </div>
              <div className="text-sm text-secondary">Categories</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-8 animate-fade-in">
        <div className="card-header">
          <h3>🔍 Filter Documents</h3>
          <p className="text-muted">
            Find the legal documents you need
          </p>
        </div>
        
        <div className="grid grid-2 gap-6">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search documents by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-2 gap-6 mb-8">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="card cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
            style={{ transition: 'all 0.3s ease' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="card-title">{template.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="status status-info">
                    {template.categoryInfo.icon} {template.categoryInfo.name}
                  </span>
                </div>
              </div>
              <div className="text-2xl">{template.categoryInfo.icon}</div>
            </div>

            <p className="text-secondary mb-4 text-sm">
              {template.categoryInfo.description}
            </p>

            <div className="mb-4">
              <div className="grid grid-2 gap-4 text-sm">
                <div>
                  <div className="text-muted">Size:</div>
                  <div className="font-medium">{formatFileSize(template.size)}</div>
                </div>
                <div>
                  <div className="text-muted">Words:</div>
                  <div className="font-medium">{template.wordCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted">Lines:</div>
                  <div className="font-medium">{template.lineCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted">Modified:</div>
                  <div className="font-medium">{formatDate(template.lastModified)}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted">
                {template.filename}
              </div>
              <button className="btn btn-primary">
                View Document
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedTemplate.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="status status-info">
                    {selectedTemplate.categoryInfo.icon} {selectedTemplate.categoryInfo.name}
                  </span>
                  <span className="text-sm text-muted">
                    {formatFileSize(selectedTemplate.size)} • {selectedTemplate.wordCount.toLocaleString()} words
                  </span>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTemplate(null)}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">Document Information</h4>
              <div className="grid grid-2 gap-4 text-sm">
                <div>
                  <div className="text-muted">Filename:</div>
                  <div className="font-medium">{selectedTemplate.filename}</div>
                </div>
                <div>
                  <div className="text-muted">Category:</div>
                  <div className="font-medium">{selectedTemplate.categoryInfo.name}</div>
                </div>
                <div>
                  <div className="text-muted">Size:</div>
                  <div className="font-medium">{formatFileSize(selectedTemplate.size)}</div>
                </div>
                <div>
                  <div className="text-muted">Last Modified:</div>
                  <div className="font-medium">{formatDate(selectedTemplate.lastModified)}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">Document Content</h4>
              <div 
                className="p-6 rounded-lg overflow-y-auto"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  maxHeight: '400px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line'
                }}
              >
                {selectedTemplate.content}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const blob = new Blob([selectedTemplate.content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = selectedTemplate.filename
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Download Document
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTemplate(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Notice */}
      <div className="card mt-8 animate-fade-in">
        <div className="text-center">
          <h3>⚖️ Legal Notice</h3>
          <p className="text-muted mb-4">
            These documents are templates and should be reviewed by qualified legal counsel before use.
          </p>
          <div className="grid grid-3 gap-4 text-sm">
            <div>
              <div className="text-accent-primary mb-1">📋</div>
              <div>Legal Templates</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">🔒</div>
              <div>Confidential</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">⚖️</div>
              <div>Legal Review Required</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentsPage
