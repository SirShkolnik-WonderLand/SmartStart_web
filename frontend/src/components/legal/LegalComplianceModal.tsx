'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, AlertCircle, Loader2, X, Download, Eye } from 'lucide-react'

interface LegalComplianceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface LegalDocument {
  id: string
  name: string
  description: string
  required: boolean
  order: number
  version: string
  lastUpdated: string
}

interface SignatureInfo {
  signerName: string
  signerEmail: string
  signerTitle: string
}

export default function LegalComplianceModal({
  isOpen,
  onClose,
  onSuccess
}: LegalComplianceModalProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [currentStep, setCurrentStep] = useState<'loading' | 'review' | 'signing' | 'complete'>('loading')
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo>({
    signerName: '',
    signerEmail: '',
    signerTitle: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [signedDocuments, setSignedDocuments] = useState<string[]>([])
  const [viewingDocument, setViewingDocument] = useState<string | null>(null)
  const [documentContent, setDocumentContent] = useState<string>('')

  // Load legal documents
  useEffect(() => {
    if (isOpen) {
      loadDocuments()
    }
  }, [isOpen])

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'
        : 'http://localhost:3001'
      
      const response = await fetch(`${API_BASE}/api/legal-signing/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.data)
        setCurrentStep('review')
      } else {
        setErrors(['Failed to load legal documents'])
        setCurrentStep('review')
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setErrors(['Failed to load legal documents'])
      setCurrentStep('review')
    }
  }

  const startSigningSession = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`${API_BASE}/api/legal-signing/session/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentIds: documents.map(doc => doc.id)
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.data.sessionId
      } else {
        throw new Error('Failed to start signing session')
      }
    } catch (error) {
      console.error('Error starting signing session:', error)
      setErrors(['Failed to start signing session'])
      return null
    }
  }

  const signDocument = async (documentId: string, sessionId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`${API_BASE}/api/legal-signing/session/${sessionId}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          signatureData: {
            signerName: signatureInfo.signerName,
            signerEmail: signatureInfo.signerEmail,
            signerTitle: signatureInfo.signerTitle,
            signedAt: new Date().toISOString()
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.data
      } else {
        throw new Error('Failed to sign document')
      }
    } catch (error) {
      console.error('Error signing document:', error)
      throw error
    }
  }

  const handleSignAll = async () => {
    setCurrentStep('signing')
    setErrors([])
    setSignedDocuments([])
    
    const sessionId = await startSigningSession()
    if (!sessionId) return
    
    const newSignedDocuments: string[] = []
    const newErrors: string[] = []
    
    for (const doc of documents) {
      try {
        const result = await signDocument(doc.id, sessionId)
        if (result.success) {
          newSignedDocuments.push(doc.id)
        } else {
          newErrors.push(`Failed to sign ${doc.name}`)
        }
      } catch (error) {
        newErrors.push(`Error signing ${doc.name}: ${error}`)
      }
    }
    
    setSignedDocuments(newSignedDocuments)
    setErrors(newErrors)
    setCurrentStep('complete')
    
    if (newErrors.length === 0) {
      onSuccess?.()
    }
  }

  const viewDocument = async (documentId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`${API_BASE}/api/legal-signing/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDocumentContent(data.data.content)
        setViewingDocument(documentId)
      }
    } catch (error) {
      console.error('Error loading document:', error)
    }
  }

  const downloadDocument = (doc: LegalDocument) => {
    const blob = new Blob([documentContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.name}_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Legal Compliance
              </h2>
              <p className="text-foreground-body">
                Review and sign required legal documents
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-foreground-muted/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {currentStep === 'loading' && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-foreground-body">Loading legal documents...</p>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Required Legal Documents
                  </h3>
                  <p className="text-foreground-body">
                    Please review and sign the following documents to complete your onboarding.
                  </p>
                </div>

                {/* Signature Information */}
                <div className="glass rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Signature Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-body mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={signatureInfo.signerName}
                        onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerName: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-body mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={signatureInfo.signerEmail}
                        onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-body mb-1">
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={signatureInfo.signerTitle}
                        onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerTitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        placeholder="Your title"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-border rounded-lg p-4 hover:bg-foreground-muted/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium text-foreground">
                              {doc.name}
                            </h4>
                            <p className="text-sm text-foreground-body">
                              {doc.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-foreground-muted">
                                Version {doc.version}
                              </span>
                              <span className="text-xs text-foreground-muted">
                                Updated {new Date(doc.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewDocument(doc.id)}
                            className="p-2 hover:bg-foreground-muted/10 rounded-lg transition-colors"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="p-2 hover:bg-foreground-muted/10 rounded-lg transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'signing' && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Signing Documents
                </h3>
                <p className="text-foreground-body">
                  Please wait while we process your signatures...
                </p>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-12">
                {errors.length === 0 ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Legal Compliance Complete!
                    </h3>
                    <p className="text-foreground-body mb-4">
                      You have successfully signed all required legal documents.
                    </p>
                    <div className="text-sm text-foreground-muted">
                      Signed documents: {signedDocuments.length} of {documents.length}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Signing Completed with Errors
                    </h3>
                    <p className="text-foreground-body mb-4">
                      Some documents could not be signed successfully.
                    </p>
                    <div className="text-sm text-red-600">
                      {errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="text-sm text-foreground-muted">
              {currentStep === 'review' && documents.length > 0 && (
                <span>
                  {documents.length} document(s) ready to sign
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {currentStep === 'complete' ? 'Close' : 'Cancel'}
              </button>
              {currentStep === 'review' && (
                <button
                  onClick={handleSignAll}
                  disabled={!signatureInfo.signerName || !signatureInfo.signerEmail}
                  className="wonder-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign All Documents
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Document Preview
              </h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="p-2 hover:bg-foreground-muted/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-foreground-body font-mono">
                {documentContent}
              </pre>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
