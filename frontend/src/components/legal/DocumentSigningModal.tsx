'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle, AlertCircle, Loader2, X, Download } from 'lucide-react'
import { legalFrameworkService, SignatureInfo } from '@/lib/legal-framework'

interface DocumentSigningModalProps {
  isOpen: boolean
  onClose: () => void
  action: string
  context?: Record<string, unknown>
  onSuccess?: (signedDocuments: string[]) => void
  onError?: (errors: string[]) => void
}

interface DocumentToSign {
  documentType: string
  document: string
  status: 'GENERATED' | 'SIGNING' | 'SIGNED' | 'ERROR'
  error?: string
  documentId?: string
}

interface ActionDocumentsResponse {
  action: string
  requiredDocuments: string[]
  documents: Array<{
    documentType: string
    document: string
    status: string
    error?: string
  }>
  rbacLevel: string
}

export default function DocumentSigningModal({
  isOpen,
  onClose,
  action,
  context = {},
  onSuccess,
  onError
}: DocumentSigningModalProps) {
  const [documents, setDocuments] = useState<DocumentToSign[]>([])
  const [, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'loading' | 'review' | 'signing' | 'complete'>('loading')
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo>({
    signerName: '',
    signerEmail: '',
    signerTitle: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [signedDocuments, setSignedDocuments] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      loadDocuments()
    }
  }, [isOpen, action, context, loadDocuments])

  const loadDocuments = useCallback(async () => {
    setIsLoading(true)
    setCurrentStep('loading')
    setErrors([])
    
    try {
      const result: ActionDocumentsResponse = await legalFrameworkService.generateActionDocuments(action, context)
      
      const docs: DocumentToSign[] = result.documents.map((doc) => ({
        documentType: doc.documentType,
        document: doc.document,
        status: doc.status === 'GENERATED' ? 'GENERATED' : 'ERROR',
        error: doc.error
      }))
      
      setDocuments(docs)
      setCurrentStep('review')
    } catch (error) {
      console.error('Error loading documents:', error)
      setErrors([`Failed to load documents: ${error}`])
      setCurrentStep('review')
    } finally {
      setIsLoading(false)
    }
  }, [action, context])

  const handleSignAll = async () => {
    setCurrentStep('signing')
    setErrors([])
    setSignedDocuments([])
    
    const newSignedDocuments: string[] = []
    const newErrors: string[] = []
    
    for (const doc of documents) {
      if (doc.status === 'GENERATED') {
        try {
          // Update document status to signing
          setDocuments(prev => prev.map(d => 
            d.documentType === doc.documentType 
              ? { ...d, status: 'SIGNING' as const }
              : d
          ))
          
          // Store document
          const stored = await legalFrameworkService.storeDocument(
            doc.documentType,
            doc.document,
            context
          )
          
          // Sign document
          const signed = await legalFrameworkService.signDocument(
            stored.documentId,
            signatureInfo
          )
          
          if (signed.success) {
            newSignedDocuments.push(doc.documentType)
            setDocuments(prev => prev.map(d => 
              d.documentType === doc.documentType 
                ? { ...d, status: 'SIGNED' as const, documentId: stored.documentId }
                : d
            ))
          } else {
            newErrors.push(`Failed to sign ${legalFrameworkService.getDocumentDisplayName(doc.documentType)}`)
            setDocuments(prev => prev.map(d => 
              d.documentType === doc.documentType 
                ? { ...d, status: 'ERROR' as const, error: 'Signing failed' }
                : d
            ))
          }
        } catch (error) {
          newErrors.push(`Error signing ${legalFrameworkService.getDocumentDisplayName(doc.documentType)}: ${error}`)
          setDocuments(prev => prev.map(d => 
            d.documentType === doc.documentType 
              ? { ...d, status: 'ERROR' as const, error: String(error) }
              : d
          ))
        }
      }
    }
    
    setSignedDocuments(newSignedDocuments)
    setErrors(newErrors)
    setCurrentStep('complete')
    
    if (newErrors.length === 0) {
      onSuccess?.(newSignedDocuments)
    } else {
      onError?.(newErrors)
    }
  }

  const handleDownloadDocument = (document: string, documentType: string) => {
    const blob = new Blob([document], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${documentType}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: DocumentToSign['status']) => {
    switch (status) {
      case 'GENERATED':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'SIGNING':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
      case 'SIGNED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: DocumentToSign['status']) => {
    switch (status) {
      case 'GENERATED':
        return 'border-blue-200 bg-blue-50'
      case 'SIGNING':
        return 'border-yellow-200 bg-yellow-50'
      case 'SIGNED':
        return 'border-green-200 bg-green-50'
      case 'ERROR':
        return 'border-red-200 bg-red-50'
    }
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
                Legal Document Signing
              </h2>
              <p className="text-foreground-body">
                {legalFrameworkService.getActionDisplayName(action)}
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
                  <p className="text-foreground-body">Loading required documents...</p>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Required Documents
                  </h3>
                  <p className="text-foreground-body">
                    Please review and sign the following documents to proceed with this action.
                  </p>
                </div>

                {/* Signature Information */}
                <div className="glass rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Signature Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-body mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={signatureInfo.signerName}
                        onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerName: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-body mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={signatureInfo.signerEmail}
                        onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-body mb-1">
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={signatureInfo.signerTitle || ''}
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
                      key={doc.documentType}
                      className={`border rounded-lg p-4 ${getStatusColor(doc.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(doc.status)}
                          <div>
                            <h4 className="font-medium text-foreground">
                              {legalFrameworkService.getDocumentDisplayName(doc.documentType)}
                            </h4>
                            {doc.error && (
                              <p className="text-sm text-red-600">{doc.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadDocument(doc.document, doc.documentType)}
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
                      Documents Signed Successfully!
                    </h3>
                    <p className="text-foreground-body mb-4">
                      You have successfully signed {signedDocuments.length} document(s).
                    </p>
                    <div className="text-sm text-foreground-muted">
                      Signed documents: {signedDocuments.map(doc => 
                        legalFrameworkService.getDocumentDisplayName(doc)
                      ).join(', ')}
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
                  {documents.filter(d => d.status === 'GENERATED').length} document(s) ready to sign
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
                  disabled={!signatureInfo.signerName || !signatureInfo.signerEmail || 
                           documents.filter(d => d.status === 'GENERATED').length === 0}
                  className="wonder-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign All Documents
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
