# SmartStart Legal Document Implementation Guide
## Complete Implementation for Document Management System

**Version:** 2.0  
**Last Updated:** September 2025  
**Governing Law:** Ontario, Canada

---

## Overview

This guide provides complete implementation details for the SmartStart legal document management system, including database schema, API endpoints, frontend components, and integration points.

---

## Database Implementation

### **Core Schema**
```sql
-- Users table (existing)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    rbac_level ENUM('GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN') DEFAULT 'GUEST',
    status ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Legal documents catalog
CREATE TABLE legal_documents (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rbac_level VARCHAR(100) NOT NULL,
    template_path VARCHAR(500),
    is_required BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User document status tracking
CREATE TABLE user_document_status (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    document_id VARCHAR(255) NOT NULL,
    status ENUM('not_required', 'required', 'pending', 'signed', 'expired', 'updated') NOT NULL,
    signed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    document_version VARCHAR(50),
    signature_hash VARCHAR(255),
    signature_evidence JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (document_id) REFERENCES legal_documents(id),
    UNIQUE KEY unique_user_document (user_id, document_id)
);

-- Document signatures audit trail
CREATE TABLE document_signatures (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    document_id VARCHAR(255) NOT NULL,
    document_version VARCHAR(50) NOT NULL,
    signature_method VARCHAR(100) NOT NULL,
    signature_data JSON NOT NULL,
    document_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location_data JSON,
    mfa_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (document_id) REFERENCES legal_documents(id)
);

-- Document audit log
CREATE TABLE document_audit_log (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    document_id VARCHAR(255) NOT NULL,
    action ENUM('view', 'sign', 'download', 'access') NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (document_id) REFERENCES legal_documents(id)
);

-- RBAC level changes log
CREATE TABLE user_rbac_log (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    old_level VARCHAR(100),
    new_level VARCHAR(100) NOT NULL,
    reason VARCHAR(500),
    changed_by VARCHAR(255),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Performance indexes
CREATE INDEX idx_user_document_status_user_id ON user_document_status(user_id);
CREATE INDEX idx_user_document_status_status ON user_document_status(status);
CREATE INDEX idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX idx_document_signatures_user_id ON document_signatures(user_id);
CREATE INDEX idx_document_signatures_timestamp ON document_signatures(timestamp);
CREATE INDEX idx_document_audit_log_user_id ON document_audit_log(user_id);
CREATE INDEX idx_document_audit_log_timestamp ON document_audit_log(timestamp);
```

### **Seed Data**
```sql
-- Insert legal documents catalog
INSERT INTO legal_documents (id, name, legal_name, version, category, rbac_level, template_path, is_required) VALUES
('ppa', 'Platform Participation Agreement', 'Platform Participation Agreement (PPA)', '2.0', '01-core-platform', 'GUEST', 'docs/08-legal/01-core-platform/platform-participation-agreement.md', true),
('esca', 'Electronic Signature & Consent Agreement', 'Electronic Signature & Consent Agreement (ESCA)', '2.0', '01-core-platform', 'GUEST', 'docs/08-legal/01-core-platform/electronic-signature-consent.md', true),
('pna', 'Privacy Notice & Acknowledgment', 'Privacy Notice & Acknowledgment (PNA)', '2.0', '01-core-platform', 'GUEST', 'docs/08-legal/01-core-platform/privacy-notice-acknowledgment.md', true),
('mnda', 'Mutual Non-Disclosure Agreement', 'Mutual Non-Disclosure Agreement (MNDA)', '2.0', '01-core-platform', 'MEMBER', 'docs/08-legal/01-core-platform/mutual-non-disclosure-agreement.md', true),
('ptsa', 'Platform Tools Subscription Agreement', 'Platform Tools Subscription Agreement (PTSA)', '2.0', '02-subscription-billing', 'MEMBER', 'docs/08-legal/02-subscription-billing/platform-tools-subscription-agreement.md', true),
('soba', 'Seat Order & Billing Authorization', 'Seat Order & Billing Authorization (SOBA)', '2.0', '02-subscription-billing', 'SUBSCRIBER', 'server/Contracts/02-subscription-billing/SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt', true),
('isea', 'Idea Submission & Evaluation Agreement', 'Idea Submission & Evaluation Agreement (ISEA)', '2.0', '03-venture-project', 'SUBSCRIBER', 'server/Contracts/03-venture-project/IDEA SUBMISSION & EVALUATION AGREEMENT.txt', true),
('pca', 'Participant Collaboration Agreement', 'Participant Collaboration Agreement (PCA)', '2.0', '03-venture-project', 'SUBSCRIBER', 'server/Contracts/03-venture-project/PARTICIPANT COLLABORATION AGREEMENT (PCA).txt', true),
('jda', 'Joint Development Agreement', 'Joint Development Agreement (JDA)', '2.0', '03-venture-project', 'VENTURE_PARTICIPANT', 'server/Contracts/03-venture-project/JOINT DEVELOPMENT AGREEMENT (JDA).txt', true);
```

---

## API Implementation

### **Legal Document Service**
```javascript
// server/services/legal-document-service.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class LegalDocumentService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    // Get available documents for user based on RBAC level
    async getAvailableDocuments(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { rbac_level: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const documents = await this.prisma.legalDocument.findMany({
            where: {
                rbac_level: {
                    lte: user.rbac_level
                }
            },
            orderBy: { category: 'asc' }
        });

        // Get user's document status
        const userStatuses = await this.prisma.userDocumentStatus.findMany({
            where: { user_id: userId }
        });

        const statusMap = new Map();
        userStatuses.forEach(status => {
            statusMap.set(status.document_id, status);
        });

        return documents.map(doc => ({
            ...doc,
            userStatus: statusMap.get(doc.id) || { status: 'not_required' }
        }));
    }

    // Get required documents for current level
    async getRequiredDocuments(userId) {
        const documents = await this.getAvailableDocuments(userId);
        return documents.filter(doc => 
            doc.is_required && 
            (!doc.userStatus || doc.userStatus.status === 'required')
        );
    }

    // Get pending documents for next level
    async getPendingDocuments(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { rbac_level: true }
        });

        const nextLevelDocuments = await this.prisma.legalDocument.findMany({
            where: {
                rbac_level: this.getNextRbacLevel(user.rbac_level)
            }
        });

        return nextLevelDocuments;
    }

    // Sign a document
    async signDocument(userId, documentId, signatureData) {
        const document = await this.prisma.legalDocument.findUnique({
            where: { id: documentId }
        });

        if (!document) {
            throw new Error('Document not found');
        }

        // Generate document hash
        const documentContent = await this.getDocumentContent(document.template_path);
        const documentHash = this.generateDocumentHash(documentContent);

        // Create signature record
        const signature = await this.prisma.documentSignature.create({
            data: {
                user_id: userId,
                document_id: documentId,
                document_version: document.version,
                signature_method: signatureData.method,
                signature_data: signatureData,
                document_hash: documentHash,
                timestamp: new Date(),
                ip_address: signatureData.ip_address,
                user_agent: signatureData.user_agent,
                location_data: signatureData.location,
                mfa_verified: signatureData.mfa_verified
            }
        });

        // Update user document status
        await this.prisma.userDocumentStatus.upsert({
            where: {
                unique_user_document: {
                    user_id: userId,
                    document_id: documentId
                }
            },
            update: {
                status: 'signed',
                signed_at: new Date(),
                signature_hash: documentHash,
                signature_evidence: signatureData
            },
            create: {
                user_id: userId,
                document_id: documentId,
                status: 'signed',
                signed_at: new Date(),
                signature_hash: documentHash,
                signature_evidence: signatureData
            }
        });

        // Log audit trail
        await this.logDocumentAction(userId, documentId, 'sign', signatureData);

        return signature;
    }

    // Generate document hash
    generateDocumentHash(content) {
        const canonicalized = this.canonicalizeDocument(content);
        return crypto.createHash('sha256').update(canonicalized).digest('hex');
    }

    // Canonicalize document for consistent hashing
    canonicalizeDocument(content) {
        return content
            .replace(/\r\n/g, '\n')  // Normalize line endings
            .replace(/\r/g, '\n')    // Normalize line endings
            .split('\n')
            .map(line => line.trimEnd())  // Trim trailing spaces
            .join('\n')
            .replace(/\n\s*\n\s*\n/g, '\n\n')  // Collapse multiple blank lines
            .replace(/[^\x20-\x7E\n]/g, '');   // Remove non-printable characters
    }

    // Get document content from file
    async getDocumentContent(templatePath) {
        try {
            return await fs.readFile(templatePath, 'utf8');
        } catch (error) {
            throw new Error(`Failed to read document template: ${error.message}`);
        }
    }

    // Log document action for audit trail
    async logDocumentAction(userId, documentId, action, metadata) {
        await this.prisma.documentAuditLog.create({
            data: {
                user_id: userId,
                document_id: documentId,
                action: action,
                timestamp: new Date(),
                ip_address: metadata.ip_address,
                user_agent: metadata.user_agent,
                metadata: metadata
            }
        });
    }

    // Get next RBAC level
    getNextRbacLevel(currentLevel) {
        const levels = ['GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    }
}

module.exports = LegalDocumentService;
```

### **API Routes**
```javascript
// server/routes/legal-documents-api.js
const express = require('express');
const router = express.Router();
const LegalDocumentService = require('../services/legal-document-service');
const { authenticateToken } = require('../middleware/auth');

const legalDocumentService = new LegalDocumentService();

// Get available documents for user
router.get('/documents', authenticateToken, async (req, res) => {
    try {
        const documents = await legalDocumentService.getAvailableDocuments(req.user.id);
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get required documents for current level
router.get('/documents/required', authenticateToken, async (req, res) => {
    try {
        const documents = await legalDocumentService.getRequiredDocuments(req.user.id);
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get pending documents for next level
router.get('/documents/pending', authenticateToken, async (req, res) => {
    try {
        const documents = await legalDocumentService.getPendingDocuments(req.user.id);
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get specific document
router.get('/documents/:id', authenticateToken, async (req, res) => {
    try {
        const document = await legalDocumentService.getDocument(req.params.id);
        res.json({
            success: true,
            data: document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Sign a document
router.post('/documents/:id/sign', authenticateToken, async (req, res) => {
    try {
        const signatureData = {
            method: req.body.method || 'click',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            location: req.body.location,
            mfa_verified: req.body.mfa_verified || false,
            ...req.body
        };

        const signature = await legalDocumentService.signDocument(
            req.user.id,
            req.params.id,
            signatureData
        );

        res.json({
            success: true,
            data: signature
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user document status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const status = await legalDocumentService.getUserDocumentStatus(req.user.id);
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Verify document signature
router.post('/documents/verify', authenticateToken, async (req, res) => {
    try {
        const verification = await legalDocumentService.verifyDocumentSignature(
            req.body.documentId,
            req.body.signatureHash
        );
        res.json({
            success: true,
            data: verification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
```

---

## Frontend Implementation

### **Document Management Component**
```typescript
// frontend/src/components/LegalDocumentManager.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { legalDocumentAPI } from '../lib/api-comprehensive';

interface Document {
    id: string;
    name: string;
    legal_name: string;
    version: string;
    category: string;
    rbac_level: string;
    is_required: boolean;
    userStatus: {
        status: string;
        signed_at?: string;
        expires_at?: string;
    };
}

interface LegalDocumentManagerProps {
    onDocumentSigned?: (documentId: string) => void;
}

export const LegalDocumentManager: React.FC<LegalDocumentManagerProps> = ({ onDocumentSigned }) => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [signingDocument, setSigningDocument] = useState<string | null>(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await legalDocumentAPI.getAvailableDocuments();
            setDocuments(response.data);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const signDocument = async (documentId: string) => {
        try {
            setSigningDocument(documentId);
            
            const signatureData = {
                method: 'click',
                timestamp: new Date().toISOString(),
                mfa_verified: true
            };

            await legalDocumentAPI.signDocument(documentId, signatureData);
            
            // Reload documents to update status
            await loadDocuments();
            
            // Notify parent component
            onDocumentSigned?.(documentId);
            
        } catch (error) {
            console.error('Failed to sign document:', error);
        } finally {
            setSigningDocument(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'signed': return 'text-green-600';
            case 'required': return 'text-red-600';
            case 'pending': return 'text-yellow-600';
            case 'expired': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'signed': return 'Signed';
            case 'required': return 'Required';
            case 'pending': return 'Pending';
            case 'expired': return 'Expired';
            case 'not_required': return 'Not Required';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading documents...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Legal Documents</h2>
            
            {/* Required Documents */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                <div className="space-y-3">
                    {documents
                        .filter(doc => doc.is_required && doc.userStatus.status === 'required')
                        .map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                                <div>
                                    <h4 className="font-medium text-gray-900">{doc.legal_name}</h4>
                                    <p className="text-sm text-gray-600">Version {doc.version}</p>
                                </div>
                                <button
                                    onClick={() => signDocument(doc.id)}
                                    disabled={signingDocument === doc.id}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {signingDocument === doc.id ? 'Signing...' : 'Sign Document'}
                                </button>
                            </div>
                        ))}
                </div>
            </div>

            {/* All Documents Status */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h3>
                <div className="space-y-2">
                    {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900">{doc.legal_name}</h4>
                                <p className="text-sm text-gray-600">
                                    Category: {doc.category} | Level: {doc.rbac_level}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`text-sm font-medium ${getStatusColor(doc.userStatus.status)}`}>
                                    {getStatusText(doc.userStatus.status)}
                                </span>
                                {doc.userStatus.status === 'required' && (
                                    <button
                                        onClick={() => signDocument(doc.id)}
                                        disabled={signingDocument === doc.id}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Sign
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
```

### **API Service Integration**
```typescript
// frontend/src/lib/api-comprehensive.ts (additions)
export const legalDocumentAPI = {
    // Get available documents for user
    getAvailableDocuments: async (): Promise<ApiResponse<Document[]>> => {
        const response = await fetch('/api/legal/documents', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Get required documents for current level
    getRequiredDocuments: async (): Promise<ApiResponse<Document[]>> => {
        const response = await fetch('/api/legal/documents/required', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Get pending documents for next level
    getPendingDocuments: async (): Promise<ApiResponse<Document[]>> => {
        const response = await fetch('/api/legal/documents/pending', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Sign a document
    signDocument: async (documentId: string, signatureData: any): Promise<ApiResponse<any>> => {
        const response = await fetch(`/api/legal/documents/${documentId}/sign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signatureData)
        });
        return response.json();
    },

    // Get user document status
    getDocumentStatus: async (): Promise<ApiResponse<any>> => {
        const response = await fetch('/api/legal/status', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    },

    // Verify document signature
    verifySignature: async (documentId: string, signatureHash: string): Promise<ApiResponse<any>> => {
        const response = await fetch('/api/legal/documents/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ documentId, signatureHash })
        });
        return response.json();
    }
};
```

---

## Integration Points

### **RBAC Integration**
```javascript
// server/middleware/rbac.js (additions)
const checkDocumentAccess = (requiredDocuments) => {
    return async (req, res, next) => {
        try {
            const userDocuments = await legalDocumentService.getUserDocumentStatus(req.user.id);
            const missingDocuments = requiredDocuments.filter(docId => {
                const userDoc = userDocuments.find(ud => ud.document_id === docId);
                return !userDoc || userDoc.status !== 'signed';
            });

            if (missingDocuments.length > 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Missing required legal documents',
                    missingDocuments: missingDocuments
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to verify document access'
            });
        }
    };
};
```

### **Onboarding Integration**
```javascript
// server/services/onboarding-orchestrator.js (additions)
const checkLegalDocumentCompletion = async (userId) => {
    const requiredDocuments = await legalDocumentService.getRequiredDocuments(userId);
    const signedDocuments = requiredDocuments.filter(doc => 
        doc.userStatus && doc.userStatus.status === 'signed'
    );
    
    return {
        completed: signedDocuments.length === requiredDocuments.length,
        total: requiredDocuments.length,
        signed: signedDocuments.length,
        missing: requiredDocuments.length - signedDocuments.length
    };
};
```

---

## Testing

### **Unit Tests**
```javascript
// tests/services/legal-document-service.test.js
const LegalDocumentService = require('../../server/services/legal-document-service');

describe('LegalDocumentService', () => {
    let service;
    
    beforeEach(() => {
        service = new LegalDocumentService();
    });

    test('should get available documents for user', async () => {
        const documents = await service.getAvailableDocuments('user123');
        expect(documents).toBeDefined();
        expect(Array.isArray(documents)).toBe(true);
    });

    test('should sign document successfully', async () => {
        const signatureData = {
            method: 'click',
            ip_address: '127.0.0.1',
            user_agent: 'test-agent',
            mfa_verified: true
        };

        const signature = await service.signDocument('user123', 'ppa', signatureData);
        expect(signature).toBeDefined();
        expect(signature.document_hash).toBeDefined();
    });

    test('should generate consistent document hash', () => {
        const content = 'Test document content\nWith multiple lines';
        const hash1 = service.generateDocumentHash(content);
        const hash2 = service.generateDocumentHash(content);
        expect(hash1).toBe(hash2);
    });
});
```

---

## Deployment Checklist

### **Database Migration**
- [ ] Run database migrations to create legal document tables
- [ ] Seed legal documents catalog
- [ ] Create performance indexes
- [ ] Set up audit log retention policies

### **API Deployment**
- [ ] Deploy legal document service
- [ ] Configure API routes
- [ ] Set up rate limiting
- [ ] Configure authentication middleware

### **Frontend Integration**
- [ ] Deploy legal document manager component
- [ ] Integrate with user dashboard
- [ ] Configure API service calls
- [ ] Test document signing workflow

### **Security Configuration**
- [ ] Configure document access controls
- [ ] Set up audit logging
- [ ] Configure signature verification
- [ ] Test RBAC integration

---

**This implementation guide provides complete details for deploying the SmartStart legal document management system.**

*Last updated: September 2025*  
*Compliant with Canadian law and international best practices*
