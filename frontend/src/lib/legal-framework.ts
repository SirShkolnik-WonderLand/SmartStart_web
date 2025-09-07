/**
 * Legal Framework Frontend Service
 * Integrates with the backend legal framework for document management and compliance
 */

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://smartstart-api.onrender.com' 
  : 'http://localhost:3001'

export interface LegalDocument {
  documentId: string
  documentType: string
  status: 'DRAFTED' | 'SIGNED' | 'FULLY_EXECUTED' | 'EXPIRED'
  hash: string
  createdAt: string
  signedAt?: string
  variables: Record<string, unknown>
  filePath?: string
}

export interface DocumentCompliance {
  compliant: boolean
  missingDocuments: string[]
  compliantDocuments: string[]
  requiredDocuments: string[]
  userDocuments: number
}

export interface ActionPermission {
  allowed: boolean
  missingDocuments: string[]
  requiredDocuments: string[]
  compliance: DocumentCompliance
}

export interface SecurityTier {
  tier: string
  name: string
  description: string
  documents: string[]
  securityControls: string[]
}

export interface SignatureInfo {
  signerName: string
  signerTitle?: string
  signerEmail: string
  ip?: string
  userAgent?: string
  otpCode?: string
}

class LegalFrameworkService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE}/api/legal${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Check user's document compliance for RBAC level
   */
  async checkCompliance(userId: string, rbacLevel: string): Promise<DocumentCompliance> {
    const response = await this.makeRequest<{ success: boolean; data: DocumentCompliance }>(
      `/compliance/${userId}/${rbacLevel}`
    )
    return response.data
  }

  /**
   * Check if user can perform specific action
   */
  async canPerformAction(action: string, context: Record<string, unknown> = {}): Promise<ActionPermission> {
    const response = await this.makeRequest<{ success: boolean; data: ActionPermission }>(
      '/can-perform-action',
      {
        method: 'POST',
        body: JSON.stringify({ action, context }),
      }
    )
    return response.data
  }

  /**
   * Get required documents for action
   */
  async getRequiredDocuments(action: string, context: Record<string, unknown> = {}): Promise<{
    action: string
    requiredDocuments: string[]
    rbacLevel: string
  }> {
    const contextParam = context ? `?context=${encodeURIComponent(JSON.stringify(context))}` : ''
    const response = await this.makeRequest<{ success: boolean; data: {
      action: string
      requiredDocuments: string[]
      rbacLevel: string
    } }>(
      `/required-documents/${action}${contextParam}`
    )
    return response.data
  }

  /**
   * Generate document from template
   */
  async generateDocument(templateType: string, variables: Record<string, unknown> = {}): Promise<{
    templateType: string
    document: string
    variables: Record<string, unknown>
    compliance: {
      pipeda: boolean
      phipa: boolean
      casl: boolean
      valid: boolean
    }
  }> {
    const response = await this.makeRequest<{ success: boolean; data: {
      templateType: string
      document: string
      variables: Record<string, unknown>
      compliance: {
        pipeda: boolean
        phipa: boolean
        casl: boolean
        valid: boolean
      }
    } }>(
      '/generate-document',
      {
        method: 'POST',
        body: JSON.stringify({ templateType, variables }),
      }
    )
    return response.data
  }

  /**
   * Store document and get signing info
   */
  async storeDocument(templateType: string, document: string, variables: Record<string, unknown> = {}): Promise<{
    documentId: string
    hash: string
    status: string
    filePath: string
  }> {
    const response = await this.makeRequest<{ success: boolean; data: {
      documentId: string
      hash: string
      status: string
      filePath: string
    } }>(
      '/store-document',
      {
        method: 'POST',
        body: JSON.stringify({ templateType, document, variables }),
      }
    )
    return response.data
  }

  /**
   * Sign document electronically
   */
  async signDocument(documentId: string, signerInfo: SignatureInfo): Promise<{
    success: boolean
    documentId: string
    status: string
    signatureEvidence: {
      documentId: string
      signerName: string
      signerTitle?: string
      signerEmail: string
      ip?: string
      userAgent?: string
      timestamp: string
      otpCodeLast4?: string
      docHash: string
    }
  }> {
    const response = await this.makeRequest<{ success: boolean; data: {
      success: boolean
      documentId: string
      status: string
      signatureEvidence: {
        documentId: string
        signerName: string
        signerTitle?: string
        signerEmail: string
        ip?: string
        userAgent?: string
        timestamp: string
        otpCodeLast4?: string
        docHash: string
      }
    } }>(
      '/sign-document',
      {
        method: 'POST',
        body: JSON.stringify({ documentId, signerInfo }),
      }
    )
    return response.data
  }

  /**
   * Get document status
   */
  async getDocumentStatus(documentId: string): Promise<{
    documentId: string
    status: string
    message: string
  }> {
    const response = await this.makeRequest<{ success: boolean; data: {
      documentId: string
      status: string
      message: string
    } }>(
      `/document-status/${documentId}`
    )
    return response.data
  }

  /**
   * Get security tier requirements
   */
  async getSecurityTierRequirements(tier: string): Promise<SecurityTier> {
    const response = await this.makeRequest<{ success: boolean; data: SecurityTier }>(
      `/security-tier/${tier}`
    )
    return response.data
  }

  /**
   * Get all security tiers
   */
  async getAllSecurityTiers(): Promise<SecurityTier[]> {
    const response = await this.makeRequest<{ success: boolean; data: SecurityTier[] }>(
      '/security-tiers'
    )
    return response.data
  }

  /**
   * Generate multiple documents for user action
   */
  async generateActionDocuments(action: string, context: Record<string, unknown> = {}): Promise<{
    action: string
    requiredDocuments: string[]
    documents: Array<{
      documentType: string
      document: string
      status: string
      error?: string
    }>
    rbacLevel: string
  }> {
    const response = await this.makeRequest<{ success: boolean; data: {
      action: string
      requiredDocuments: string[]
      documents: Array<{
        documentType: string
        document: string
        status: string
        error?: string
      }>
      rbacLevel: string
    } }>(
      '/generate-action-documents',
      {
        method: 'POST',
        body: JSON.stringify({ action, context }),
      }
    )
    return response.data
  }

  /**
   * Get user's document status summary
   */
  async getUserDocuments(userId: string): Promise<{
    userId: string
    documents: LegalDocument[]
    message: string
  }> {
    const response = await this.makeRequest<{ success: boolean; data: {
      userId: string
      documents: LegalDocument[]
      message: string
    } }>(
      `/user-documents/${userId}`
    )
    return response.data
  }

  /**
   * Check if user needs to sign documents for action
   */
  async checkActionRequirements(action: string, context: Record<string, unknown> = {}): Promise<{
    needsSigning: boolean
    requiredDocuments: string[]
    missingDocuments: string[]
    canProceed: boolean
  }> {
    try {
      const permission = await this.canPerformAction(action, context)
      
      return {
        needsSigning: !permission.allowed,
        requiredDocuments: permission.requiredDocuments,
        missingDocuments: permission.missingDocuments,
        canProceed: permission.allowed
      }
    } catch (error) {
      console.error('Error checking action requirements:', error)
      return {
        needsSigning: true,
        requiredDocuments: [],
        missingDocuments: [],
        canProceed: false
      }
    }
  }

  /**
   * Complete document signing workflow
   */
  async completeSigningWorkflow(action: string, context: Record<string, unknown> = {}): Promise<{
    success: boolean
    signedDocuments: string[]
    errors: string[]
  }> {
    try {
      // Generate documents for action
      const actionDocs = await this.generateActionDocuments(action, context)
      
      const signedDocuments: string[] = []
      const errors: string[] = []

      // Sign each document
      for (const doc of actionDocs.documents) {
        if (doc.status === 'GENERATED') {
          try {
            // Store document
            const stored = await this.storeDocument(doc.documentType, doc.document, context)
            
            // Sign document
            const signed = await this.signDocument(stored.documentId, {
              signerName: (context.userName as string) || 'User',
              signerEmail: (context.userEmail as string) || '',
              signerTitle: (context.userTitle as string) || 'User'
            })
            
            if (signed.success) {
              signedDocuments.push(doc.documentType)
            } else {
              errors.push(`Failed to sign ${doc.documentType}`)
            }
          } catch (error) {
            errors.push(`Error signing ${doc.documentType}: ${error}`)
          }
        } else {
          errors.push(`Failed to generate ${doc.documentType}: ${doc.error}`)
        }
      }

      return {
        success: errors.length === 0,
        signedDocuments,
        errors
      }
    } catch (error) {
      console.error('Error in signing workflow:', error)
      return {
        success: false,
        signedDocuments: [],
        errors: [`Workflow error: ${error}`]
      }
    }
  }

  /**
   * Get RBAC level for action
   */
  getRbacLevelForAction(action: string): string {
    const actionRbacMap: Record<string, string> = {
      'REGISTER': 'MEMBER',
      'SUBSCRIBE': 'SUBSCRIBER',
      'CREATE_VENTURE': 'VENTURE_OWNER',
      'JOIN_VENTURE': 'VENTURE_PARTICIPANT',
      'ACCESS_TIER_1': 'CONFIDENTIAL_ACCESS',
      'ACCESS_TIER_2': 'RESTRICTED_ACCESS',
      'ACCESS_TIER_3': 'HIGHLY_RESTRICTED_ACCESS',
      'BILLING_ADMIN': 'BILLING_ADMIN',
      'SECURITY_ADMIN': 'SECURITY_ADMIN',
      'LEGAL_ADMIN': 'LEGAL_ADMIN'
    }

    return actionRbacMap[action] || 'GUEST'
  }

  /**
   * Get document type display name
   */
  getDocumentDisplayName(documentType: string): string {
    const displayNames: Record<string, string> = {
      'PPA': 'Platform Participation Agreement',
      'E_SIGNATURE_CONSENT': 'E-Signature Consent',
      'PRIVACY_NOTICE': 'Privacy Notice & CASL Consent',
      'PAYMENT_TERMS': 'Payment Terms',
      'MUTUAL_NDA': 'Mutual Confidentiality Agreement',
      'SECURITY_ACKNOWLEDGMENT': 'Security & Tooling Acknowledgment',
      'PTSA': 'Platform Tools Subscription Agreement',
      'SOBA': 'Seat Order & Billing Authorization',
      'IDEA_SUBMISSION': 'Idea Submission Agreement',
      'VENTURE_OWNER': 'Venture Owner Agreement',
      'PCA': 'Participant Collaboration Agreement',
      'JDA': 'Joint Development Agreement',
      'IP_ASSIGNMENT': 'IP Assignment Agreement',
      'SECURITY_TIER_1': 'Security Tier 1 Acknowledgment',
      'SECURITY_TIER_2': 'Security Tier 2 Acknowledgment',
      'SECURITY_TIER_3': 'Security Tier 3 Acknowledgment',
      'CROWN_JEWEL_IP': 'Crown Jewel IP Agreement',
      'BILLING_ADMIN': 'Billing Administration Agreement',
      'SECURITY_ADMIN': 'Security Administration Agreement',
      'LEGAL_ADMIN': 'Legal Administration Agreement',
      'PER_PROJECT_NDA': 'Per-Project NDA Addendum',
      'PUOHA': 'Project Upgrade Order & Hosting Addendum'
    }

    return displayNames[documentType] || documentType
  }

  /**
   * Get action display name
   */
  getActionDisplayName(action: string): string {
    const displayNames: Record<string, string> = {
      'REGISTER': 'Register for Platform',
      'SUBSCRIBE': 'Subscribe to Paid Plan',
      'CREATE_VENTURE': 'Create New Venture',
      'JOIN_VENTURE': 'Join Venture Team',
      'ACCESS_TIER_1': 'Access Confidential Data',
      'ACCESS_TIER_2': 'Access Restricted Data',
      'ACCESS_TIER_3': 'Access Highly Restricted Data',
      'BILLING_ADMIN': 'Billing Administration',
      'SECURITY_ADMIN': 'Security Administration',
      'LEGAL_ADMIN': 'Legal Administration'
    }

    return displayNames[action] || action
  }
}

// Export singleton instance
export const legalFrameworkService = new LegalFrameworkService()
export default legalFrameworkService
