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
import { legalDocumentsApiService, LegalDocument, DocumentAuditLog, ComplianceReport } from '@/lib/legal-documents-api'
import DocumentSigningModal from './legal/DocumentSigningModal'

type EvidenceDetails = {
  signer?: string
  signedAt?: string
  signatureHash?: string
  ip?: string
  userAgent?: string
  mfa?: boolean
  verified?: boolean
}

interface LegalDocumentManagerProps {
  className?: string
}

export default function LegalDocumentManager({ className = '' }: LegalDocumentManagerProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [signingModal, setSigningModal] = useState<{
    isOpen: boolean;
    document: LegalDocument | null;
  }>({ isOpen: false, document: null })
  const [filter, setFilter] = useState<'all' | 'required' | 'signed' | 'pending' | 'templates'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showComplianceReport, setShowComplianceReport] = useState(false)
  const [sortField, setSortField] = useState<'title' | 'type' | 'status' | 'updatedAt'>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isActing] = useState(false)
  const [evidenceDoc, setEvidenceDoc] = useState<LegalDocument | null>(null)
  const [evidence, setEvidence] = useState<EvidenceDetails | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [auditLogs, setAuditLogs] = useState<DocumentAuditLog[] | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [complianceData, setComplianceData] = useState<ComplianceReport | null>(null)
  const [complianceLoading, setComplianceLoading] = useState(false)
  const [requiredDocuments, setRequiredDocuments] = useState<LegalDocument[]>([])
  const [pendingDocuments, setPendingDocuments] = useState<LegalDocument[]>([])
  const [requiredLoading, setRequiredLoading] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(false)

  // Load documents and status
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [documentsResponse, statusResponse] = await Promise.all([
          legalDocumentsApiService.getAvailableDocuments(),
          legalDocumentsApiService.getUserDocumentStatus()
        ])

        // Load required and pending documents for better guidance
        loadRequiredAndPending()

        // Use available documents as primary source, enhance with status if available
        if (documentsResponse.success && documentsResponse.data) {
          const available = documentsResponse.data
          const statusDocs = statusResponse.success && statusResponse.data ? statusResponse.data.documents || [] : []

          // Create a map of status data for quick lookup
          const statusMap: Record<string, { status?: string; signed_at?: string; signature_hash?: string }> = {}
          for (const sdoc of statusDocs) {
            statusMap[sdoc.document_id] = sdoc
          }

          // Enhance available documents with status information
          const enhancedDocuments = available.map(doc => {
            const statusData = statusMap[doc.id]
            if (statusData) {
              return {
                ...doc,
                isSigned: statusData.status === 'signed' || doc.isSigned,
                status: statusData.status || doc.status,
                signedAt: statusData.signed_at || doc.signedAt,
                signatureHash: statusData.signature_hash || doc.signatureHash,
              }
            }
            return doc
          })

          setDocuments(enhancedDocuments)
        } else {
          console.warn('Failed to load documents:', documentsResponse)
        }

        // Document status is handled within the enhanced documents
      } catch (err) {
        console.error('Error loading documents:', err)
        setError('Failed to load documents. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Open signing modal for a document
  const signDocument = (doc: LegalDocument) => {
    setSigningModal({ isOpen: true, document: doc })
  }

  // Handle successful signing
  const handleSignSuccess = async () => {
    try {
      // Refresh documents
      const documentsResponse = await legalDocumentsApiService.getAvailableDocuments()
      if (documentsResponse.success) setDocuments(documentsResponse.data)
    } catch (err) {
      console.error('Failed to refresh documents:', err)
    }
  }

  const downloadDoc = async (doc: LegalDocument) => {
    try {
      if (!doc.id) {
        alert('Download not available for this document.')
        return
      }
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

  const openEvidence = async (doc: LegalDocument) => {
    setEvidenceDoc(doc)
    // Prefill with known fields from document data
    const ev: EvidenceDetails = {
      signer: doc.signerName || 'Unknown',
      signedAt: doc.signedAt,
      signatureHash: doc.signatureHash,
      ip: doc.ipAddress,
      userAgent: doc.userAgent,
      verified: true // Assume verified if we have signature data
    }
    setEvidence(ev)

    // Attempt to fetch audit logs (optional)
    try {
      setAuditLoading(true)
      setAuditLogs(null)
      const res = await legalDocumentsApiService.getDocumentAuditLog(doc.id, undefined, undefined, 1, 10)
      if (res.success) {
        setAuditLogs(res.data)
      } else {
        setAuditLogs([])
      }
    } catch {
      setAuditLogs([])
    } finally {
      setAuditLoading(false)
    }
  }

  const verifySignature = async () => {
    if (!evidenceDoc || !evidence?.signatureHash) return
    try {
      setIsVerifying(true)
      const res = await legalDocumentsApiService.verifyDocumentSignature(evidenceDoc.id, evidence.signatureHash)
      if (res.success && res.data) {
        setEvidence(prev => ({ ...(prev || {}), verified: res.data.is_valid }))
      }
    } catch {
      setEvidence(prev => ({ ...(prev || {}), verified: false }))
    } finally {
      setIsVerifying(false)
    }
  }

  const loadAuditPage = async (page: number) => {
    if (!evidenceDoc) return
    try {
      setAuditLoading(true)
      setAuditPage(page)
      const res = await legalDocumentsApiService.getDocumentAuditLog(evidenceDoc.id, undefined, undefined, page, 10)
      if (res.success) setAuditLogs(res.data)
    } finally {
      setAuditLoading(false)
    }
  }

  const openComplianceReport = async () => {
    setShowComplianceReport(true)
    try {
      setComplianceLoading(true)
      // Default to last 30 days
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 30)
      const res = await legalDocumentsApiService.generateComplianceReport(start.toISOString(), end.toISOString())
      if (res.success) setComplianceData(res.data)
    } finally {
      setComplianceLoading(false)
    }
  }

  const loadRequiredAndPending = async () => {
    try {
      setRequiredLoading(true)
      setPendingLoading(true)
      
      const [requiredRes, pendingRes] = await Promise.all([
        legalDocumentsApiService.getRequiredDocuments(),
        legalDocumentsApiService.getPendingDocuments()
      ])
      
      if (requiredRes.success) setRequiredDocuments(requiredRes.data)
      if (pendingRes.success) setPendingDocuments(pendingRes.data)
    } catch (err) {
      console.error('Error loading required/pending documents:', err)
    } finally {
      setRequiredLoading(false)
      setPendingLoading(false)
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

  const goToPipeline = (doc: LegalDocument) => {
    type Meta = { pipeline?: string; relatedPipelines?: string[] }
    const meta = (doc as unknown as { metadata?: Meta }).metadata ?? {}
    const p: string | undefined = meta.pipeline || (meta.relatedPipelines?.[0])
    const title = (doc.title || '').toLowerCase()
    const inferred = p || (title.includes('billing') || title.includes('subscription') ? 'Billing' : title.includes('venture') || title.includes('project') ? 'Venture Start' : 'Onboarding')
    if (inferred === 'Billing') window.location.href = '/analytics' // placeholder billing view
    else if (inferred === 'Venture Start') window.location.href = '/ventures/create'
    else window.location.href = '/onboarding'
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
              onClick={openComplianceReport}
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

        {/* Required Documents Section */}
        {requiredDocuments.length > 0 && (
          <div className="wonderland-card glass-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                  <p className="text-sm text-gray-600">These documents must be signed to proceed</p>
                </div>
              </div>
              {requiredLoading && (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requiredDocuments.map((doc) => (
                <div key={doc.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getDocumentStatusIcon(doc)}
                      <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                    </div>
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {(doc.type || '').replace(/_/g, ' ')} • Version {doc.version}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => signDocument(doc)}
                      disabled={isActing}
                      className="bg-amber-600 text-white px-3 py-1 rounded text-xs hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {isActing ? 'Signing...' : 'Sign Now'}
                    </button>
                    <button
                      onClick={() => downloadDoc(doc)}
                      className="text-amber-600 hover:text-amber-700 text-xs"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Documents Section */}
        {pendingDocuments.length > 0 && (
          <div className="wonderland-card glass-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Next Level Access</h3>
                  <p className="text-sm text-gray-600">These documents will be required for advanced features</p>
                </div>
              </div>
              {pendingLoading && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingDocuments.map((doc) => (
                <div key={doc.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getDocumentStatusIcon(doc)}
                      <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                    </div>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {(doc.type || '').replace(/_/g, ' ')} • Version {doc.version}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => signDocument(doc)}
                      disabled={isActing}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isActing ? 'Signing...' : 'Sign Early'}
                    </button>
                    <button
                      onClick={() => downloadDoc(doc)}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(document.lastUpdated || document.updatedAt || 0).toLocaleDateString()}</span>
                          </div>
                          {/* Pipeline badges (from metadata or type) */}
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const pipelines: string[] = []
                              type Meta = { pipeline?: string; relatedPipelines?: string[] }
                              const meta = (document as unknown as { metadata?: Meta }).metadata ?? {}
                              if (meta.pipeline) pipelines.push(meta.pipeline)
                              if (meta.relatedPipelines && Array.isArray(meta.relatedPipelines)) pipelines.push(...meta.relatedPipelines)
                              // Fallback heuristics
                              if (document.type?.includes('LEGAL') || document.title?.toLowerCase().includes('nda')) pipelines.push('Onboarding')
                              if (document.title?.toLowerCase().includes('subscription') || document.title?.toLowerCase().includes('billing')) pipelines.push('Billing')
                              if (document.title?.toLowerCase().includes('project') || document.title?.toLowerCase().includes('venture')) pipelines.push('Venture Start')
                              return Array.from(new Set(pipelines)).slice(0, 3).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => goToPipeline(document)}
                                  className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
                                >
                                  {p}
                                </button>
                              ))
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEvidence(document)}
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
                          <button onClick={() => goToPipeline(document)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200">
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
                  {complianceLoading && (
                    <div className="text-sm text-gray-600">Loading report…</div>
                  )}
                  {!complianceLoading && complianceData && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Documents:</span>
                        <span className="ml-2 font-semibold text-gray-900">{complianceData.total_documents}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Signed:</span>
                        <span className="ml-2 font-semibold text-green-600">{complianceData.signed_documents}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Compliance %:</span>
                        <span className="ml-2 font-semibold text-gray-900">{complianceData.compliance_percentage}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Missing Signatures:</span>
                        <span className="ml-2 font-semibold text-amber-600">{complianceData.missing_signatures?.length || 0}</span>
                      </div>
                    </div>
                  )}
                  {!complianceLoading && !complianceData && (
                    <div className="text-sm text-gray-600">Report unavailable.</div>
                  )}
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

        {/* Signature Evidence Modal */}
        {evidenceDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-xl w-full mx-4 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Signature Evidence</h2>
                <button
                  onClick={() => { setEvidenceDoc(null); setEvidence(null); }}
                  className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                  <div className="font-medium text-gray-900 mb-1">{evidenceDoc.title}</div>
                  <div className="text-gray-600">Type: {(evidenceDoc.type || '').replace(/_/g, ' ')}</div>
                  <div className="text-gray-600">Version: {evidenceDoc.version}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-gray-600">Signer</div>
                    <div className="font-mono text-gray-900 break-all">{evidence?.signer || '—'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-gray-600">Signed At</div>
                    <div className="font-mono text-gray-900">{evidence?.signedAt ? new Date(evidence.signedAt).toLocaleString() : '—'}</div>
                  </div>
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-gray-600">Signature Hash (sha256)</div>
                    <div className="font-mono text-xs text-gray-900 break-all">{evidence?.signatureHash || '—'}</div>
                  </div>
                </div>
                {evidenceDoc?.content?.includes('DOC HASH') && (
                  <div className="text-xs text-gray-500">Note: Full document hash and evidence are stored server-side per policy.</div>
                )}
                <div className="mt-4">
                  <div className="text-gray-900 font-medium mb-2">Audit Trail</div>
                  {auditLoading && <div className="text-xs text-gray-600">Loading audit…</div>}
                  {!auditLoading && auditLogs && auditLogs.length === 0 && (
                    <div className="text-xs text-gray-600">No audit entries.</div>
                  )}
                  {!auditLoading && auditLogs && auditLogs.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {auditLogs.map((entry, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-100 rounded">
                          <span className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleString()}</span>
                          <span className="text-xs text-gray-800">{entry.action}</span>
                          <span className="text-[10px] text-gray-500 truncate">{entry.ip_address} · {entry.user_agent?.slice(0, 24)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => loadAuditPage(Math.max(1, auditPage - 1))} className="px-2 py-1 text-xs bg-white border border-gray-300 rounded disabled:opacity-50" disabled={auditPage <= 1 || auditLoading}>Prev</button>
                    <button onClick={() => loadAuditPage(auditPage + 1)} className="px-2 py-1 text-xs bg-white border border-gray-300 rounded disabled:opacity-50" disabled={auditLoading}>Next</button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">
                    {evidence?.verified === true && <span className="text-green-600">Hash verified ✓</span>}
                    {evidence?.verified === false && <span className="text-red-600">Hash mismatch</span>}
                  </div>
                  <button
                    onClick={verifySignature}
                    className="bg-white border border-purple-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 mr-2 disabled:opacity-50"
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying…' : 'Verify hash'}
                  </button>
                  <button
                    onClick={() => { setEvidenceDoc(null); setEvidence(null); }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Signing Modal */}
        <DocumentSigningModal
          isOpen={signingModal.isOpen}
          onClose={() => setSigningModal({ isOpen: false, document: null })}
          document={signingModal.document}
          onSignSuccess={handleSignSuccess}
        />
      </div>
    </div>
  )
}