'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  File,
  Eye,
  Trash2,
  Share
} from 'lucide-react'
import { comprehensiveApiService as apiService, LegalDocument } from '@/lib/api-comprehensive'

type DocumentWithPack = LegalDocument & { packName?: string }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithPack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'signed' | 'expired'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        // Try to load legal packs first
        const packsResponse = await apiService.getLegalPacks()
        if (packsResponse.success && packsResponse.data) {
          // Flatten documents from all packs
          const allDocs = packsResponse.data.flatMap(pack => 
            pack.documents.map(doc => ({ ...doc, packName: pack.name }))
          )
          setDocuments(allDocs)
        } else {
          // Fallback to contracts if legal packs fail
          const contractsResponse = await apiService.getContracts()
          if (contractsResponse.success && contractsResponse.data) {
            const contractDocs = contractsResponse.data.map(contract => ({
              id: contract.id,
              title: contract.title,
              type: contract.type,
              description: `${contract.type} - ${contract.status}`,
              required: true, // Default to required for existing contracts
              status: contract.status.toLowerCase(),
              content: contract.content || 'No content available',
              createdAt: contract.signedAt || new Date().toISOString(), // Use signedAt or current date
              updatedAt: contract.signedAt || new Date().toISOString(), // Use signedAt or current date
              packName: 'Existing Contracts'
            }))
            setDocuments(contractDocs)
          }
        }
      } catch (error) {
        console.error('Error loading documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.status === filter
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'text-success'
      case 'pending': return 'text-warning'
      case 'expired': return 'text-destructive'
      default: return 'text-foreground-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'expired': return <AlertCircle className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-foreground-muted">Manage your legal documents and contracts</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
          <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-foreground-muted" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'signed' | 'expired')}
            className="bg-glass-surface border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending</option>
            <option value="signed">Signed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{documents.length}</span>
          </div>
          <div className="text-sm text-foreground-muted">Total Documents</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {documents.filter(d => d.status === 'signed').length}
            </span>
          </div>
          <div className="text-sm text-foreground-muted">Signed</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {documents.filter(d => d.status === 'pending').length}
            </span>
          </div>
          <div className="text-sm text-foreground-muted">Pending</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              {documents.filter(d => d.status === 'expired').length}
            </span>
          </div>
          <div className="text-sm text-foreground-muted">Expired</div>
        </div>
      </div>

      {/* Documents List */}
      <div className="glass rounded-xl">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Document Library</h2>
        </div>
        <div className="divide-y divide-border/50">
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
              <p className="text-foreground-muted">There are no documents matching your current filter.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-glass-surface transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{doc.title}</h3>
                        <p className="text-sm text-foreground-muted">
                          {doc.type} • {doc.packName || 'General'}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="ml-13">
                      <p className="text-foreground-body text-sm mb-3">
                        {doc.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-foreground-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created: {new Date(doc.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        {doc.signedAt && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Signed: {new Date(doc.signedAt).toLocaleDateString()}
                          </div>
                        )}
                        {doc.required && (
                          <div className="flex items-center gap-1 text-warning">
                            <AlertCircle className="w-3 h-3" />
                            Required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors" title="View">
                      <Eye className="w-4 h-4 text-foreground-muted" />
                    </button>
                    <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors" title="Download">
                      <Download className="w-4 h-4 text-foreground-muted" />
                    </button>
                    <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors" title="Share">
                      <Share className="w-4 h-4 text-foreground-muted" />
                    </button>
                    <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors text-destructive" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
