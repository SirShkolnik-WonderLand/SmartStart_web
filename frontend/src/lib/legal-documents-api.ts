// import { comprehensiveApiService } from './api-comprehensive';

export interface LegalDocument {
    id: string;
    title: string;
    type: string;
    content: string;
    version: string;
    status: string;
    effectiveDate?: string;
    expiryDate?: string;
    requiresSignature: boolean;
    signatureDeadline?: string;
    complianceRequired: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    entityId?: string;
    projectId?: string;
    ventureId?: string;
    // Properties added by service layer
    isSigned?: boolean;
    signedAt?: string;
    signatureHash?: string;
    generatedFrom?: string;
}

export interface DocumentSignature {
    id: string;
    documentId: string;
    signerId: string;
    signatureHash: string;
    signedAt: string;
    ipAddress?: string;
    userAgent?: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    identityVerified: boolean;
}

export interface DocumentStatus {
    user_id: string;
    role: string;
    summary: {
        total_documents: number;
        required_documents: number;
        signed_documents: number;
        pending_documents: number;
        expired_documents: number;
    };
    documents: Array<{
        document_id: string;
        title: string;
        type: string;
        status: string;
        signed_at?: string;
        requires_signature: boolean;
        document_version: string;
        signature_hash?: string;
    }>;
}

export interface DocumentAuditLog {
    id: string;
    document_id: string;
    user_id: string;
    action: string;
    details: Record<string, unknown>;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export interface ComplianceReport {
    period: {
        start_date: string;
        end_date: string;
    };
    total_documents: number;
    signed_documents: number;
    compliance_percentage: number;
    missing_signatures: string[];
    audit_trail: DocumentAuditLog[];
    generated_at: string;
}

export interface SignatureVerification {
    is_valid: boolean;
    document_id: string;
    signature_hash: string;
    signed_at: string;
    signer: string;
    verification_details: Record<string, unknown>;
}

class LegalDocumentsApiService {
    private baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://smartstart-api.onrender.com/api/legal-signing'
        : '/api/legal-signing';

    // Get available documents for user
    async getAvailableDocuments(): Promise<{ success: boolean; data: LegalDocument[] }> {
        try {
            const response = await fetch(`${this.baseUrl}/documents`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting available documents:', error);
            return { success: false, data: [] };
        }
    }

    // Get required documents for current level
    async getRequiredDocuments(): Promise<{ success: boolean; data: LegalDocument[] }> {
        try {
            const response = await fetch(`${this.baseUrl}/documents/required`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting required documents:', error);
            return { success: false, data: [] };
        }
    }

    // Get pending documents for next level
    async getPendingDocuments(): Promise<{ success: boolean; data: LegalDocument[] }> {
        try {
            const response = await fetch(`${this.baseUrl}/documents/pending`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting pending documents:', error);
            return { success: false, data: [] };
        }
    }

    // Get specific document
    async getDocument(documentId: string): Promise<{ success: boolean; data: LegalDocument }> {
        try {
            const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting document:', error);
            return { success: false, data: null as unknown as LegalDocument };
        }
    }

    // Sign a document
    async signDocument(
        documentId: string, 
        signatureData: {
            method?: string;
            location?: string;
            mfa_verified?: boolean;
            [key: string]: unknown;
        }
    ): Promise<{ success: boolean; data: DocumentSignature }> {
        try {
            const response = await fetch(`${this.baseUrl}/documents/${documentId}/sign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signatureData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error signing document:', error);
            return { success: false, data: null as unknown as DocumentSignature };
        }
    }

    // Get user document status
    async getUserDocumentStatus(): Promise<{ success: boolean; data: DocumentStatus }> {
        try {
            // Get user ID from localStorage or JWT token
            const userId = localStorage.getItem('user-id');
            if (!userId) {
                throw new Error('User ID not found');
            }

            const response = await fetch(`${this.baseUrl}/status/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user document status:', error);
            return { success: false, data: null as unknown as DocumentStatus };
        }
    }

    // Verify document signature
    async verifyDocumentSignature(
        documentId: string, 
        signatureHash: string
    ): Promise<{ success: boolean; data: SignatureVerification }> {
        try {
            const response = await fetch(`${this.baseUrl}/documents/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ documentId, signatureHash })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error verifying document signature:', error);
            return { success: false, data: null as unknown as SignatureVerification };
        }
    }

    // Get document audit log
    async getDocumentAuditLog(
        documentId?: string,
        startDate?: string,
        endDate?: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ success: boolean; data: DocumentAuditLog[]; pagination: Record<string, unknown> }> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (documentId) params.append('documentId', documentId);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${this.baseUrl}/audit?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting document audit log:', error);
            return { success: false, data: [], pagination: {} };
        }
    }

    // Generate compliance report
    async generateComplianceReport(
        startDate: string,
        endDate: string
    ): Promise<{ success: boolean; data: ComplianceReport }> {
        try {
            const params = new URLSearchParams({
                startDate,
                endDate
            });

            const response = await fetch(`${this.baseUrl}/compliance/report?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating compliance report:', error);
            return { success: false, data: null as unknown as ComplianceReport };
        }
    }

    // Get document templates
    async getDocumentTemplates(): Promise<{ success: boolean; data: LegalDocument[] }> {
        try {
            const response = await fetch(`${this.baseUrl}/templates`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting document templates:', error);
            return { success: false, data: [] };
        }
    }

    // Generate document from template
    async generateDocumentFromTemplate(
        templateId: string,
        templateData: {
            projectName: string;
            projectDescription: string;
            confidentialityLevel: string;
            parties: string[];
        }
    ): Promise<{ success: boolean; data: LegalDocument }> {
        try {
            const response = await fetch(`${this.baseUrl}/templates/${templateId}/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating document from template:', error);
            return { success: false, data: null as unknown as LegalDocument };
        }
    }

    // Download document
    async downloadDocument(documentId: string): Promise<Blob | null> {
        try {
            const response = await fetch(`${this.baseUrl}/documents/${documentId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('Error downloading document:', error);
            return null;
        }
    }

    // Health check
    async healthCheck(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking health:', error);
            return { success: false, message: 'Health check failed' };
        }
    }
}

export const legalDocumentsApiService = new LegalDocumentsApiService();
