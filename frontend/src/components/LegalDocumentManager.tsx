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
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Share2,
  SortAsc,
  SortDesc
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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showComplianceReport, setShowComplianceReport] = useState(false)
  const [sortField, setSortField] = useState<'title' | 'type' | 'status' | 'updatedAt'>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isActing, setIsActing] = useState(false)

  // Load documents and status
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [documentsResponse, statusResponse] = await Promise.all([
          legalDocumentsApiService.getAvailableDocuments(),
          legalDocumentsApiService.getUserDocumentStatus()
        ])

        // Merge available docs with per-user status so signed items appear
        if (documentsResponse.success && statusResponse.success && documentsResponse.data && statusResponse.data) {
          const available = documentsResponse.data
          const statusDocs = statusResponse.data.documents || []

          const byId: Record<string, LegalDocument> = {}
          for (const doc of available) {
            byId[doc.id] = { ...doc }
          }

          for (const sdoc of statusDocs) {
            const existing = byId[sdoc.document_id]
            if (existing) {
              byId[sdoc.document_id] = {
                ...existing,
                isSigned: sdoc.status === 'signed' || existing.isSigned,
                status: sdoc.status || existing.status,
                signedAt: sdoc.signed_at || existing.signedAt,
                signatureHash: sdoc.signature_hash || existing.signatureHash,
              }
            } else {
              // Create a minimal entry so status-only docs surface in the grid
              byId[sdoc.document_id] = {
                id: sdoc.document_id,
                title: sdoc.title || 'Document',
                type: sdoc.type || 'LEGAL_DOCUMENT',
                content: '',
                version: sdoc.document_version || '1.0',
                status: sdoc.status,
                requiresSignature: sdoc.requires_signature,
                complianceRequired: false,
                createdBy: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isSigned: sdoc.status === 'signed',
                signedAt: sdoc.signed_at,
                signatureHash: sdoc.signature_hash,
              }
            }
          }

          setDocuments(Object.values(byId))
          setDocumentStatus(statusResponse.data)
        } else {
          if (documentsResponse.success && documentsResponse.data) {
            setDocuments(documentsResponse.data)
          } else {
            console.warn('Failed to load documents:', documentsResponse)
          }
          if (statusResponse.success && statusResponse.data) {
            setDocumentStatus(statusResponse.data)
          } else {
            console.warn('Failed to load document status:', statusResponse)
          }
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

  // Sign a single document
  const signDocument = async (doc: LegalDocument) => {
    try {
      setIsActing(true)
      // Start a session and sign immediately (simple flow)
      const session = await legalDocumentsApiService.startSigningSession([doc.id])
      if (session.success && session.data?.sessionId) {
        await legalDocumentsApiService.signInSession(session.data.sessionId, doc.id, {
          method: 'CLICK_SIGN',
          location: 'documents_page',
          mfa_verified: false
        })
      }
      // Refresh documents and status
      const [documentsResponse, statusResponse] = await Promise.all([
        legalDocumentsApiService.getAvailableDocuments(),
        legalDocumentsApiService.getUserDocumentStatus()
      ])
      if (documentsResponse.success) setDocuments(documentsResponse.data)
      if (statusResponse.success) setDocumentStatus(statusResponse.data)
    } catch (err) {
      console.error('Signing failed:', err)
      alert('Signing failed. Please try again.')
    } finally {
      setIsActing(false)
    }
  }

  const downloadDoc = async (doc: LegalDocument) => {
    try {
      const blob = await legalDocumentsApiService.downloadDocument(doc.id)
      if (!blob) return
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(doc.title || 'document')}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download failed:', e)
      alert('Download failed. Please try again.')
    }
  }

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      // Add null checks to prevent undefined errors
      const title = doc.title || ''
      const type = doc.type || ''
      
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           type.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (filter === 'all') return matchesSearch
      const isRequired = doc.status === 'required' || (doc.requiresSignature === true)
      const isSigned = !!doc.isSigned || doc.status === 'signed'
      const isPending = doc.status === 'pending'
      const isTemplate = doc.status === 'template'
      if (filter === 'required') return matchesSearch && isRequired
      if (filter === 'signed') return matchesSearch && isSigned
      if (filter === 'pending') return matchesSearch && isPending
      if (filter === 'templates') return matchesSearch && isTemplate
      
      return matchesSearch
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortField) {
        case 'title':
          aValue = (a.title || '').toLowerCase()
          bValue = (b.title || '').toLowerCase()
          break
        case 'type':
          aValue = (a.type || '').toLowerCase()
          bValue = (b.type || '').toLowerCase()
          break
        case 'status':
          aValue = (a.isSigned || a.status === 'signed') ? 'signed' : (a.status || '')
          bValue = (b.isSigned || b.status === 'signed') ? 'signed' : (b.status || '')
          break
        case 'updatedAt':
          aValue = new Date(a.lastUpdated || a.updatedAt || 0).getTime()
          bValue = new Date(b.lastUpdated || b.updatedAt || 0).getTime()
          break
        default:
          return 0
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredAndSortedDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(filteredAndSortedDocuments.map(doc => doc.id))
    }
  }

  const getDocumentStatusIcon = (doc: LegalDocument) => {
    if (doc.isSigned) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (doc.status === 'required') {
      return <AlertCircle className="w-4 h-4 text-amber-500" />
    }
    if (doc.status === 'pending') {
      return <Clock className="w-4 h-4 text-blue-500" />
    }
    if (doc.status === 'template') {
      return <FileCheck className="w-4 h-4 text-gray-500" />
    }
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const getDocumentStatusText = (doc: LegalDocument) => {
    if (doc.isSigned) return 'Signed'
    if (doc.status === 'required') return 'Required'
    if (doc.status === 'pending') return 'Pending'
    if (doc.status === 'template') return 'Template'
    return 'Optional'
  }

  const getDocumentStatusColor = (doc: LegalDocument) => {
    if (doc.isSigned) return 'text-green-600 bg-green-50'
    if (doc.status === 'required') return 'text-amber-600 bg-amber-50'
    if (doc.status === 'pending') return 'text-blue-600 bg-blue-50'
    if (doc.status === 'template') return 'text-gray-600 bg-gray-50'
    return 'text-gray-600 bg-gray-50'
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
        return 'text-purple-600 bg-purple-50'
      case 'EQUITY_AGREEMENT':
        return 'text-green-600 bg-green-50'
      case 'CONFIDENTIALITY_AGREEMENT':
        return 'text-amber-600 bg-amber-50'
      case 'TERMS_OF_SERVICE':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const handleSort = (field: 'title' | 'type' | 'status' | 'updatedAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-purple-100">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-purple-100">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Documents</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen wonderland-bg ${className}`}>
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Legal Documents</h1>
            <p className="text-xl text-muted">
              Manage, sign, and track all your legal documents with full RBAC compliance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowComplianceReport(!showComplianceReport)}
              className="wonderland-button-ghost px-4 py-2 rounded-lg transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Compliance Report
            </button>
            <button
              onClick={() => window.location.reload()}
              className="wonderland-button-ghost px-4 py-2 rounded-lg transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Document Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{documents.length}</div>
            <div className="text-sm text-muted">All Documents</div>
            <div className="text-xs text-green-600 mt-1">Available to all users</div>
          </div>

          <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{documents.filter(d => d.status === 'required' || d.requiresSignature).length}</div>
            <div className="text-sm text-muted">Required</div>
            <div className="text-xs text-amber-600 mt-1">Must sign to proceed</div>
          </div>

          <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{documents.filter(d => d.isSigned || d.status === 'signed').length}</div>
            <div className="text-sm text-muted">Signed</div>
            <div className="text-xs text-green-600 mt-1">Completed</div>
          </div>

          <div className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{documents.filter(d => d.status === 'pending').length}</div>
            <div className="text-sm text-muted">Pending</div>
            <div className="text-xs text-blue-600 mt-1">Next level access</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="wonderland-card glass-surface p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'required', 'signed', 'pending', 'templates'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as 'all' | 'required' | 'signed' | 'pending' | 'templates')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    filter === filterOption
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-purple-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Documents Actions */}
        {selectedDocuments.length > 0 && (
          <div className="wonderland-card glass-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button className="bg-white border border-purple-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="bg-white border border-purple-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="bg-white border border-purple-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Archive
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Table */}
        {viewMode === 'table' && filteredAndSortedDocuments.length > 0 && (
          <div className="wonderland-card glass-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50/50 border-b border-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === filteredAndSortedDocuments.length && filteredAndSortedDocuments.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-purple-100/50 transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Document
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-purple-100/50 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-2">
                        Type
                        {sortField === 'type' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-purple-100/50 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-purple-100/50 transition-colors"
                      onClick={() => handleSort('updatedAt')}
                    >
                      <div className="flex items-center gap-2">
                        Last Updated
                        {sortField === 'updatedAt' && (
                          sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {filteredAndSortedDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(document.id)}
                          onChange={() => handleDocumentSelect(document.id)}
                          className="w-4 h-4 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {getDocumentStatusIcon(document)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500">Version {document.version}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getDocumentTypeColor(document.type)}`}>
                            {getDocumentTypeIcon(document.type)}
                          </div>
                          <span className="text-sm text-gray-900">
                            {(document.type || '').replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentStatusColor(document)}`}>
                          {getDocumentStatusText(document)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(document.lastUpdated || document.updatedAt || 0).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert('Preview coming soon')}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadDoc(document)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200">
                            <Edit className="w-4 h-4" />
                          </button>
                          {document.status === 'required' && !document.isSigned && (
                            <button
                              disabled={isActing}
                              onClick={() => signDocument(document)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                            >
                              {isActing ? 'Signing...' : 'Sign'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents Grid (fallback) */}
        {viewMode === 'grid' && filteredAndSortedDocuments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDocuments.map((document) => (
              <div
                key={document.id}
                className="wonderland-card glass-surface p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => handleDocumentSelect(document.id)}
                      className="w-4 h-4 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500"
                    />
                    {getDocumentStatusIcon(document)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {document.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getDocumentTypeColor(document.type)}`}>
                      {getDocumentTypeIcon(document.type)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {(document.type || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Version {document.version}</span>
                    <span>•</span>
                    <span className={getDocumentStatusColor(document).split(' ')[0]}>
                      {getDocumentStatusText(document)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {new Date(document.lastUpdated || document.updatedAt || 0).toLocaleDateString()}</span>
                  </div>
                  {document.status === 'required' && !document.isSigned && (
                    <button
                      disabled={isActing}
                      onClick={() => signDocument(document)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                    >
                      {isActing ? 'Signing...' : 'Sign Document'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedDocuments.length === 0 && (
          <div className="wonderland-card glass-surface p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No documents match the current filter'}
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              Upload Document
            </button>
          </div>
        )}

        {/* Compliance Report Modal */}
        {showComplianceReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full mx-4 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Compliance Report</h2>
                <button
                  onClick={() => setShowComplianceReport(false)}
                  className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Document Compliance Status</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Documents:</span>
                      <span className="ml-2 font-semibold text-gray-900">{documentStatus?.documents?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Signed:</span>
                      <span className="ml-2 font-semibold text-green-600">{documentStatus?.documents?.filter(doc => doc.status === 'signed').length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Required:</span>
                      <span className="ml-2 font-semibold text-amber-600">{documentStatus?.documents?.filter(doc => doc.status === 'required').length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pending:</span>
                      <span className="ml-2 font-semibold text-blue-600">{documentStatus?.documents?.filter(doc => doc.status === 'pending').length || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowComplianceReport(false)}
                    className="bg-white border border-purple-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
                  >
                    Close
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}