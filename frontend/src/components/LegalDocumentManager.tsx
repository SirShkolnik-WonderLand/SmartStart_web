'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    FileText, 
    Download, 
    Search, 
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Plus,
    File,
    Eye,
    Trash2,
    Share,
    Shield,
    Lock,
    Unlock,
    Users,
    BarChart3,
    Info,
    PenTool,
    FileSignature,
    ClipboardList,
    TrendingUp,
    RefreshCw
} from 'lucide-react';
import { legalDocumentsApiService, LegalDocument, DocumentStatus } from '@/lib/legal-documents-api';

interface LegalDocumentManagerProps {
    className?: string;
}

type DocumentFilter = 'all' | 'required' | 'signed' | 'pending' | 'templates';
type ViewMode = 'grid' | 'list' | 'compliance';

export default function LegalDocumentManager({ className = '' }: LegalDocumentManagerProps) {
    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<DocumentFilter>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [showComplianceReport, setShowComplianceReport] = useState(false);
    const [expandedDocument, setExpandedDocument] = useState<string | null>(null);
    const [signingDocument, setSigningDocument] = useState<string | null>(null);

    // Load documents and status
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [documentsResponse, statusResponse] = await Promise.all([
                legalDocumentsApiService.getAvailableDocuments(),
                legalDocumentsApiService.getUserDocumentStatus()
            ]);

            if (documentsResponse.success) {
                setDocuments(documentsResponse.data);
            }

            if (statusResponse.success) {
                setDocumentStatus(statusResponse.data);
            }
        } catch (error) {
            console.error('Error loading document data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter documents based on current filter and search term
    const filteredDocuments = documents.filter(doc => {
        const matchesFilter = (() => {
            switch (filter) {
                case 'required':
                    return doc.is_required;
                case 'signed':
                    return documentStatus?.signed_documents && documentStatus.signed_documents > 0; // This would need to be more specific
                case 'pending':
                    return !doc.is_required || (documentStatus?.pending_documents && documentStatus.pending_documents > 0);
                case 'templates':
                    return doc.is_template;
                default:
                    return true;
            }
        })();

        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.category.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Handle document signing
    const handleSignDocument = async (documentId: string) => {
        setSigningDocument(documentId);
        try {
            const signatureData = {
                method: 'click',
                location: 'web_interface',
                mfa_verified: false,
                timestamp: new Date().toISOString()
            };

            const response = await legalDocumentsApiService.signDocument(documentId, signatureData);
            
            if (response.success) {
                // Refresh data after signing
                await loadData();
                // Show success message
                alert('Document signed successfully!');
            } else {
                alert('Failed to sign document. Please try again.');
            }
        } catch (error) {
            console.error('Error signing document:', error);
            alert('Error signing document. Please try again.');
        } finally {
            setSigningDocument(null);
        }
    };

    // Handle document download
    const handleDownloadDocument = async (documentId: string, documentName: string) => {
        try {
            const blob = await legalDocumentsApiService.downloadDocument(documentId);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${documentName}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document. Please try again.');
        }
    };

    // Handle document selection
    const handleDocumentSelect = (documentId: string) => {
        setSelectedDocuments(prev => 
            prev.includes(documentId) 
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };


    // Get document status icon
    const getDocumentStatusIcon = (document: LegalDocument) => {
        if (document.is_template) {
            return <File className="w-5 h-5 text-blue-500" />;
        }
        
        // This would need to be more sophisticated in a real implementation
        if (document.is_required) {
            return <AlertCircle className="w-5 h-5 text-orange-500" />;
        }
        
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    };

    // Get document status text
    const getDocumentStatusText = (document: LegalDocument) => {
        if (document.is_template) {
            return 'Template';
        }
        
        if (document.is_required) {
            return 'Required';
        }
        
        return 'Optional';
    };

    // Get document status color
    const getDocumentStatusColor = (document: LegalDocument) => {
        if (document.is_template) {
            return 'text-blue-600 bg-blue-100';
        }
        
        if (document.is_required) {
            return 'text-orange-600 bg-orange-100';
        }
        
        return 'text-green-600 bg-green-100';
    };

    // Get RBAC level icon
    const getRBACLevelIcon = (level: string) => {
        switch (level) {
            case 'ADMIN':
                return <Shield className="w-4 h-4 text-red-500" />;
            case 'MANAGER':
                return <Lock className="w-4 h-4 text-orange-500" />;
            case 'MEMBER':
                return <Unlock className="w-4 h-4 text-green-500" />;
            default:
                return <Users className="w-4 h-4 text-gray-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className={`glass-surface p-8 ${className}`}>
                <div className="flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-lg">Loading documents...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`glass-surface p-6 ${className}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Legal Document Manager</h1>
                    <p className="text-gray-300">
                        Manage, sign, and track all your legal documents with full RBAC compliance
                    </p>
                </div>
                
                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    <button
                        onClick={() => setShowComplianceReport(!showComplianceReport)}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Compliance Report
                    </button>
                    
                    <button
                        onClick={loadData}
                        className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Status Overview */}
            {documentStatus && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-surface p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Documents</p>
                                <p className="text-2xl font-bold text-white">{documentStatus.total_documents}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="glass-surface p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Required</p>
                                <p className="text-2xl font-bold text-white">{documentStatus.required_documents}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                    
                    <div className="glass-surface p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Signed</p>
                                <p className="text-2xl font-bold text-white">{documentStatus.signed_documents}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="glass-surface p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Completion</p>
                                <p className="text-2xl font-bold text-white">{documentStatus.completion_percentage}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                <div className="flex flex-wrap items-center space-x-2">
                    {(['all', 'required', 'signed', 'pending', 'templates'] as DocumentFilter[]).map((filterOption) => (
                        <button
                            key={filterOption}
                            onClick={() => setFilter(filterOption)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === filterOption
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <File className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedDocuments.length > 0 && (
                <div className="glass-surface p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-white">
                            {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </button>
                            <button className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                <Share className="w-4 h-4 mr-1" />
                                Share
                            </button>
                            <button className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Documents Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map((document) => (
                        <div key={document.id} className="glass-surface p-6 rounded-lg hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getDocumentStatusIcon(document)}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{document.name}</h3>
                                        <p className="text-sm text-gray-400">{document.legal_name}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    {getRBACLevelIcon(document.rbac_level)}
                                    <span className={`px-2 py-1 text-xs rounded-full ${getDocumentStatusColor(document)}`}>
                                        {getDocumentStatusText(document)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-400">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Version {document.version}
                                </div>
                                <div className="flex items-center text-sm text-gray-400">
                                    <File className="w-4 h-4 mr-2" />
                                    {document.category}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleDownloadDocument(document.id, document.name)}
                                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setExpandedDocument(expandedDocument === document.id ? null : document.id)}
                                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {document.is_required && !document.is_template && (
                                    <button
                                        onClick={() => handleSignDocument(document.id)}
                                        disabled={signingDocument === document.id}
                                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        {signingDocument === document.id ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <PenTool className="w-4 h-4 mr-2" />
                                        )}
                                        Sign
                                    </button>
                                )}
                            </div>
                            
                            {expandedDocument === document.id && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-400">
                                            <Info className="w-4 h-4 mr-2" />
                                            Created: {new Date(document.created_at).toLocaleDateString()}
                                        </div>
                                        {document.updated_at && (
                                            <div className="flex items-center text-sm text-gray-400">
                                                <Clock className="w-4 h-4 mr-2" />
                                                Updated: {new Date(document.updated_at).toLocaleDateString()}
                                            </div>
                                        )}
                                        {document.generated_from && (
                                            <div className="flex items-center text-sm text-gray-400">
                                                <FileSignature className="w-4 h-4 mr-2" />
                                                Generated from template
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDocuments.map((document) => (
                        <div key={document.id} className="glass-surface p-4 rounded-lg hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocuments.includes(document.id)}
                                        onChange={() => handleDocumentSelect(document.id)}
                                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    
                                    {getDocumentStatusIcon(document)}
                                    
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{document.name}</h3>
                                        <p className="text-sm text-gray-400">{document.legal_name}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {getRBACLevelIcon(document.rbac_level)}
                                        <span className={`px-2 py-1 text-xs rounded-full ${getDocumentStatusColor(document)}`}>
                                            {getDocumentStatusText(document)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDownloadDocument(document.id, document.name)}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setExpandedDocument(expandedDocument === document.id ? null : document.id)}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {document.is_required && !document.is_template && (
                                            <button
                                                onClick={() => handleSignDocument(document.id)}
                                                disabled={signingDocument === document.id}
                                                className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                                            >
                                                {signingDocument === document.id ? (
                                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                                ) : (
                                                    <PenTool className="w-4 h-4 mr-1" />
                                                )}
                                                Sign
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {expandedDocument === document.id && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-400">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Version {document.version}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-400">
                                                <File className="w-4 h-4 mr-2" />
                                                {document.category}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-400">
                                                <Info className="w-4 h-4 mr-2" />
                                                Created: {new Date(document.created_at).toLocaleDateString()}
                                            </div>
                                            {document.updated_at && (
                                                <div className="flex items-center text-sm text-gray-400">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Updated: {new Date(document.updated_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {document.generated_from && (
                                                <div className="flex items-center text-sm text-gray-400">
                                                    <FileSignature className="w-4 h-4 mr-2" />
                                                    Generated from template
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-gray-400">
                                                <Shield className="w-4 h-4 mr-2" />
                                                {document.rbac_level} Access
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
                    <p className="text-gray-400 mb-6">
                        {searchTerm ? 'Try adjusting your search terms' : 'No documents match the current filter'}
                    </p>
                    <button className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        Upload Document
                    </button>
                </div>
            )}
        </div>
    );
}
