// import { comprehensiveApiService } from './api-comprehensive';

export interface LegalDocument {
    id: string;
    name: string;
    legal_name: string;
    version: string;
    category: string;
    rbac_level: string;
    template_path: string;
    is_required: boolean;
    is_template: boolean;
    content?: string;
    created_at: string;
    updated_at?: string;
    generated_from?: string;
    generated_at?: string;
}

export interface DocumentSignature {
    id: string;
    document_id: string;
    user_id: string;
    signature_hash: string;
    signature_method: string;
    signed_at: string;
    ip_address: string;
    user_agent: string;
    location?: string;
    mfa_verified: boolean;
    document_version: string;
    created_at: string;
}

export interface DocumentStatus {
    total_documents: number;
    required_documents: number;
    signed_documents: number;
    pending_documents: number;
    completion_percentage: number;
    next_level_requirements: string[];
    compliance_status: 'compliant' | 'non_compliant' | 'pending';
    last_updated: string;
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
    private baseUrl = '/api/legal-documents';

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
            return { success: false, data: null as LegalDocument };
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
            return { success: false, data: null as LegalDocument };
        }
    }

    // Get user document status
    async getUserDocumentStatus(): Promise<{ success: boolean; data: DocumentStatus }> {
        try {
            const response = await fetch(`${this.baseUrl}/status`, {
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
            return { success: false, data: null as LegalDocument };
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
            return { success: false, data: null as LegalDocument };
        }
    }

    // Get document audit log
    async getDocumentAuditLog(
        documentId?: string,
        startDate?: string,
        endDate?: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ success: boolean; data: DocumentAuditLog[]; pagination: any }> {
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
            return { success: false, data: null as LegalDocument };
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
            return { success: false, data: null as LegalDocument };
        }
    }

    // Download document
    async downloadDocument(documentId: string): Promise<Blob | null> {
        try {
            const response = await fetch(`${this.baseUrl}/documents/${documentId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
