'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { legalDocumentsApiService, LegalDocument } from '@/lib/legal-documents-api';

interface DocumentSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
  onSignSuccess: () => void;
}

export default function DocumentSigningModal({
  isOpen,
  onClose,
  document,
  onSignSuccess
}: DocumentSigningModalProps) {
  const [isLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signatureData, setSignatureData] = useState({
    signerName: '',
    signerEmail: '',
    signerTitle: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  useEffect(() => {
    if (isOpen && document) {
      setError(null);
      setSuccess(false);
      setSignatureData({
        signerName: '',
        signerEmail: '',
        signerTitle: '',
        termsAccepted: false,
        privacyAccepted: false
      });
    }
  }, [isOpen, document]);

  const handleSign = async () => {
    if (!document) return;

    setIsSigning(true);
    setError(null);

    try {
      // Start signing session
      const session = await legalDocumentsApiService.startSigningSession([document.id]);
      
      if (!session.success || !session.data?.sessionId) {
        throw new Error('Failed to start signing session');
      }

      // Sign the document
      const result = await legalDocumentsApiService.signInSession(
        session.data.sessionId,
        document.id,
        {
          method: 'CLICK_SIGN',
          location: 'signing_modal',
          mfa_verified: false,
          signerName: signatureData.signerName,
          signerEmail: signatureData.signerEmail,
          signerTitle: signatureData.signerTitle,
          termsAccepted: signatureData.termsAccepted,
          privacyAccepted: signatureData.privacyAccepted
        }
      );

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSignSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error('Failed to sign document');
      }
    } catch (err) {
      console.error('Signing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign document');
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const blob = await legalDocumentsApiService.downloadDocument(document.id);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${document.title || 'document'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download document');
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sign Document
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {document.title}
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

        <div className="flex flex-col lg:flex-row h-full">
          {/* Document Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document Type: {document.type}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Version {document.version}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last Updated: {new Date(document.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {document.content}
              </div>
            </div>
          </div>

          {/* Signing Panel */}
          <div className="w-full lg:w-80 border-l border-gray-200 dark:border-gray-700 p-6">
            {success ? (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Document Signed Successfully!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your signature has been recorded with timestamp and legal validity.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Digital Signature
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={signatureData.signerName}
                      onChange={(e) => setSignatureData(prev => ({ ...prev, signerName: e.target.value }))}
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
                      value={signatureData.signerEmail}
                      onChange={(e) => setSignatureData(prev => ({ ...prev, signerEmail: e.target.value }))}
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
                      value={signatureData.signerTitle}
                      onChange={(e) => setSignatureData(prev => ({ ...prev, signerTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your title or position"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={signatureData.termsAccepted}
                        onChange={(e) => setSignatureData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        I have read and agree to the terms and conditions of this document
                      </span>
                    </label>

                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={signatureData.privacyAccepted}
                        onChange={(e) => setSignatureData(prev => ({ ...prev, privacyAccepted: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        I acknowledge the privacy policy and data handling practices
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleSign}
                      disabled={isSigning || !signatureData.signerName || !signatureData.signerEmail || !signatureData.termsAccepted || !signatureData.privacyAccepted}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      {isSigning ? 'Signing...' : 'Sign Document'}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Copy</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}