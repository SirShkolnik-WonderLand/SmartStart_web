'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileCheck,
  Search,
  Grid3X3,
  List,
  Plus,
  RefreshCw,
  BarChart3,
  Shield,
  Users,
  Award,
  Calendar
} from 'lucide-react'
import { legalDocumentsApiService, LegalDocument, DocumentStatus } from '@/lib/legal-documents-api'

interface LegalDocumentManagerProps {
  className?: string
}

export default function LegalDocumentManager({ className = '' }: LegalDocumentManagerProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'required' | 'signed' | 'pending' | 'templates'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showComplianceReport, setShowComplianceReport] = useState(false)

  // Load documents and status
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [documentsResponse, statusResponse] = await Promise.all([
          legalDocumentsApiService.getAvailableDocuments(),
          legalDocumentsApiService.getUserDocumentStatus()
        ])

        if (documentsResponse.success) {
          setDocuments(documentsResponse.data)
        }
        if (statusResponse.success) {
          setDocumentStatus(statusResponse.data)
        }
      } catch (err) {
        console.error('Error loading documents:', err)
        setError('Failed to load documents. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter documents based on search and filter
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'required') return matchesSearch && doc.status === 'required'
    if (filter === 'signed') return matchesSearch && doc.isSigned
    if (filter === 'pending') return matchesSearch && doc.status === 'pending'
    if (filter === 'templates') return matchesSearch && doc.status === 'template'
    
    return matchesSearch
  })

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const getDocumentStatusIcon = (doc: LegalDocument) => {
    if (doc.isSigned) {
      return <CheckCircle className="w-5 h-5 text-success" />
    }
    if (doc.status === 'required') {
      return <AlertCircle className="w-5 h-5 text-warning" />
    }
    if (doc.status === 'pending') {
      return <Clock className="w-5 h-5 text-accent" />
    }
    if (doc.status === 'template') {
      return <FileCheck className="w-5 h-5 text-muted" />
    }
    return <FileText className="w-5 h-5 text-muted" />
  }

  const getDocumentStatusColor = (doc: LegalDocument) => {
    if (doc.isSigned) return 'text-success'
    if (doc.status === 'required') return 'text-warning'
    if (doc.status === 'pending') return 'text-accent'
    if (doc.status === 'template') return 'text-muted'
    return 'text-muted'
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PARTNERSHIP_AGREEMENT':
        return <Users className="w-4 h-4" />
      case 'EQUITY_AGREEMENT':
        return <Award className="w-4 h-4" />
      case 'CONFIDENTIALITY_AGREEMENT':
        return <Shield className="w-4 h-4" />
      case 'TERMS_OF_SERVICE':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'PARTNERSHIP_AGREEMENT':
        return 'text-primary'
      case 'EQUITY_AGREEMENT':
        return 'text-success'
      case 'CONFIDENTIALITY_AGREEMENT':
        return 'text-warning'
      case 'TERMS_OF_SERVICE':
        return 'text-accent'
      default:
        return 'text-muted'
    }
  }

  if (isLoading) {
    return (
      <div className={`glass rounded-xl p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          <span className="ml-2 text-lg text-foreground">Loading documents...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`glass rounded-xl p-8 ${className}`}>
        <div className="flex items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-warning mb-4" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Documents</h3>
            <p className="text-muted mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Legal Document Manager</h1>
            <p className="text-muted">Manage, sign, and track all your legal documents with full RBAC compliance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowComplianceReport(!showComplianceReport)}
              className="flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compliance Report
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors border border-accent/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Document Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-surface rounded-lg p-4 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">{documentStatus?.summary.total_documents || 0}</span>
            </div>
            <div className="text-sm text-muted">All Documents</div>
          </div>

          <div className="glass-surface rounded-lg p-4 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <span className="text-2xl font-bold text-foreground">{documentStatus?.summary.required_documents || 0}</span>
            </div>
            <div className="text-sm text-muted">Required</div>
          </div>

          <div className="glass-surface rounded-lg p-4 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <span className="text-2xl font-bold text-foreground">{documentStatus?.summary.signed_documents || 0}</span>
            </div>
            <div className="text-sm text-muted">Signed</div>
          </div>

          <div className="glass-surface rounded-lg p-4 hover:glass-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="text-2xl font-bold text-foreground">{documentStatus?.summary.pending_documents || 0}</span>
            </div>
            <div className="text-sm text-muted">Pending</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'required', 'signed', 'pending', 'templates'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as 'all' | 'required' | 'signed' | 'pending' | 'templates')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === filterOption
                    ? 'bg-primary text-white'
                    : 'bg-glass-surface text-foreground hover:bg-glass-lg'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-glass-surface border border-glass-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-glass-surface text-foreground hover:bg-glass-lg'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-glass-surface text-foreground hover:bg-glass-lg'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Documents Actions */}
      {selectedDocuments.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground">
              {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
              <button className="flex items-center px-3 py-1 bg-success text-white rounded-lg hover:bg-success/80 transition-colors">
                <Users className="w-4 h-4 mr-1" />
                Share
              </button>
              <button className="flex items-center px-3 py-1 bg-warning text-white rounded-lg hover:bg-warning/80 transition-colors">
                <AlertCircle className="w-4 h-4 mr-1" />
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      {filteredDocuments.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className={`glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group ${
                viewMode === 'list' ? 'flex items-center space-x-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => handleDocumentSelect(document.id)}
                        className="w-4 h-4 text-primary bg-glass-surface border-glass-border rounded focus:ring-primary"
                      />
                      {getDocumentStatusIcon(document)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-glass-surface rounded-lg hover:bg-glass-lg transition-colors">
                        <Download className="w-4 h-4 text-muted" />
                      </button>
                      <button className="p-2 bg-glass-surface rounded-lg hover:bg-glass-lg transition-colors">
                        <Eye className="w-4 h-4 text-muted" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {document.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getDocumentTypeColor(document.type).replace('text-', 'bg-').replace('text-', 'bg-')}/10`}>
                        {getDocumentTypeIcon(document.type)}
                      </div>
                      <span className={`text-sm ${getDocumentTypeColor(document.type)}`}>
                        {document.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted">
                      <span>Version {document.version}</span>
                      <span>•</span>
                      <span className={getDocumentStatusColor(document)}>
                        {document.isSigned ? 'Signed' : document.status === 'required' ? 'Required' : document.status === 'pending' ? 'Pending' : 'Optional'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {new Date(document.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {document.status === 'required' && !document.isSigned && (
                      <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/80 transition-colors">
                        Sign Document
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => handleDocumentSelect(document.id)}
                    className="w-4 h-4 text-primary bg-glass-surface border-glass-border rounded focus:ring-primary"
                  />
                  {getDocumentStatusIcon(document)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{document.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted">
                      <span>{document.type.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>Version {document.version}</span>
                      <span>•</span>
                      <span className={getDocumentStatusColor(document)}>
                        {document.isSigned ? 'Signed' : document.status === 'required' ? 'Required' : document.status === 'pending' ? 'Pending' : 'Optional'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-glass-surface rounded-lg hover:bg-glass-lg transition-colors">
                      <Download className="w-4 h-4 text-muted" />
                    </button>
                    <button className="p-2 bg-glass-surface rounded-lg hover:bg-glass-lg transition-colors">
                      <Eye className="w-4 h-4 text-muted" />
                    </button>
                    {document.status === 'required' && !document.isSigned && (
                      <button className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/80 transition-colors">
                        Sign
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No documents found</h3>
          <p className="text-muted mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'No documents match the current filter'}
          </p>
          <button className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors mx-auto">
            <Plus className="w-5 h-5 mr-2" />
            Upload Document
          </button>
        </div>
      )}

      {/* Compliance Report Modal */}
      {showComplianceReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Compliance Report</h2>
              <button
                onClick={() => setShowComplianceReport(false)}
                className="p-2 hover:bg-glass-surface rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="glass-surface rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Document Compliance Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted">Total Documents:</span>
                    <span className="ml-2 font-semibold text-foreground">{documentStatus?.summary.total_documents || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted">Signed:</span>
                    <span className="ml-2 font-semibold text-success">{documentStatus?.summary.signed_documents || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted">Required:</span>
                    <span className="ml-2 font-semibold text-warning">{documentStatus?.summary.required_documents || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted">Pending:</span>
                    <span className="ml-2 font-semibold text-accent">{documentStatus?.summary.pending_documents || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowComplianceReport(false)}
                  className="px-4 py-2 bg-glass-surface text-foreground rounded-lg hover:bg-glass-lg transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}