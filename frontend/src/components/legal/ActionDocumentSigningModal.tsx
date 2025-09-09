'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { legalFrameworkService } from '@/lib/legal-framework';

interface ActionDocumentSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  context: Record<string, unknown>;
  onSuccess: (signedDocuments: string[]) => void;
  onError: (errors: string[]) => void;
}

interface DocumentToSign {
  documentType: string;
  document: string;
  status: 'GENERATED' | 'SIGNING' | 'SIGNED' | 'ERROR';
  error?: string;
  documentId?: string;
}

interface SignatureInfo {
  signerName: string;
  signerEmail: string;
  signerTitle: string;
}

export default function ActionDocumentSigningModal({
  isOpen,
  onClose,
  action,
  context,
  onSuccess,
  onError
}: ActionDocumentSigningModalProps) {
  const [documents, setDocuments] = useState<DocumentToSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'loading' | 'review' | 'signing' | 'complete'>('loading');
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo>({
    signerName: '',
    signerEmail: '',
    signerTitle: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [signedDocuments, setSignedDocuments] = useState<string[]>([]);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setCurrentStep('loading');
    setErrors([]);
    
    try {
      const result = await legalFrameworkService.generateActionDocuments(action, context);
      
      const docs: DocumentToSign[] = result.documents.map((doc) => ({
        documentType: doc.documentType,
        document: doc.document,
        status: doc.status === 'GENERATED' ? 'GENERATED' : 'ERROR',
        error: doc.error
      }));
      
      setDocuments(docs);
      setCurrentStep('review');
    } catch (error) {
      console.error('Error loading documents:', error);
      setErrors([`Failed to load documents: ${error}`]);
      setCurrentStep('review');
    } finally {
      setIsLoading(false);
    }
  }, [action, context]);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, loadDocuments]);

  const handleSignAll = async () => {
    setCurrentStep('signing');
    setErrors([]);
    setSignedDocuments([]);
    
    const newSignedDocuments: string[] = [];
    const newErrors: string[] = [];
    
    for (const doc of documents) {
      if (doc.status === 'GENERATED') {
        try {
          // Update document status to signing
          setDocuments(prev => prev.map(d => 
            d.documentType === doc.documentType 
              ? { ...d, status: 'SIGNING' as const }
              : d
          ));
          
          // Store document
          const stored = await legalFrameworkService.storeDocument(
            doc.documentType,
            doc.document,
            context
          );
          
          // Sign document
          const signed = await legalFrameworkService.signDocument(
            stored.documentId,
            signatureInfo
          );
          
          if (signed.success) {
            newSignedDocuments.push(doc.documentType);
            setDocuments(prev => prev.map(d => 
              d.documentType === doc.documentType 
                ? { ...d, status: 'SIGNED' as const, documentId: stored.documentId }
                : d
            ));
          } else {
            newErrors.push(`Failed to sign ${legalFrameworkService.getDocumentDisplayName(doc.documentType)}`);
            setDocuments(prev => prev.map(d => 
              d.documentType === doc.documentType 
                ? { ...d, status: 'ERROR' as const, error: 'Signing failed' }
                : d
            ));
          }
        } catch (error) {
          newErrors.push(`Error signing ${legalFrameworkService.getDocumentDisplayName(doc.documentType)}: ${error}`);
          setDocuments(prev => prev.map(d => 
            d.documentType === doc.documentType 
              ? { ...d, status: 'ERROR' as const, error: String(error) }
              : d
          ));
        }
      }
    }
    
    setSignedDocuments(newSignedDocuments);
    setErrors(newErrors);
    setCurrentStep('complete');
    
    if (newErrors.length === 0) {
      onSuccess(newSignedDocuments);
    } else {
      onError(newErrors);
    }
  };

  const downloadDocument = (doc: DocumentToSign) => {
    const blob = new Blob([doc.document], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.documentType}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sign Action Documents
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {action} - {Object.keys(context).length} context items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {currentStep === 'loading' && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Generating documents...</span>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Review Documents to Sign
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  The following documents need to be signed to complete this action:
                </p>
              </div>

              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {legalFrameworkService.getDocumentDisplayName(doc.documentType)}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {doc.status === 'GENERATED' && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Ready
                          </span>
                        )}
                        {doc.status === 'ERROR' && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Error
                          </span>
                        )}
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {doc.error && (
                      <p className="text-sm text-red-600 dark:text-red-400">{doc.error}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Signature Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={signatureInfo.signerName}
                      onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={signatureInfo.signerEmail}
                      onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title/Position
                    </label>
                    <input
                      type="text"
                      value={signatureInfo.signerTitle}
                      onChange={(e) => setSignatureInfo(prev => ({ ...prev, signerTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your title"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignAll}
                  disabled={!signatureInfo.signerName || !signatureInfo.signerEmail || documents.some(d => d.status === 'ERROR')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
                >
                  Sign All Documents
                </button>
              </div>
            </div>
          )}

          {currentStep === 'signing' && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Signing Documents...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we process your signatures.
              </p>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-12">
              {errors.length === 0 ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    All Documents Signed Successfully!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {signedDocuments.length} document(s) have been signed and stored.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Some Documents Failed to Sign
                  </h3>
                  <div className="text-sm text-red-600 dark:text-red-400 mb-6">
                    {errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
