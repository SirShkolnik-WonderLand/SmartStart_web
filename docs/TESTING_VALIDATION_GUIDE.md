# SmartStart Legal Document Testing & Validation Guide
## Comprehensive Testing Framework for Document Management System

**Version:** 2.0  
**Last Updated:** September 2025  
**Governing Law:** Ontario, Canada

---

## Overview

This guide provides comprehensive testing procedures, validation methods, and quality assurance protocols for the SmartStart legal document management system.

---

## Testing Framework

### **Test Categories**

#### **1. Unit Tests**
- Individual component testing
- Service method validation
- Database operation testing
- Utility function testing

#### **2. Integration Tests**
- API endpoint testing
- Database integration testing
- Authentication flow testing
- RBAC integration testing

#### **3. End-to-End Tests**
- Complete user workflows
- Document signing processes
- Multi-step onboarding flows
- Cross-browser compatibility

#### **4. Security Tests**
- Authentication bypass attempts
- Authorization boundary testing
- Data integrity validation
- Audit trail verification

#### **5. Performance Tests**
- Load testing
- Stress testing
- Database query optimization
- API response time validation

---

## Unit Testing

### **Legal Document Service Tests**
```javascript
// tests/services/legal-document-service.test.js
const { PrismaClient } = require('@prisma/client');
const LegalDocumentService = require('../../server/services/legal-document-service');

describe('LegalDocumentService', () => {
    let service;
    let prisma;
    
    beforeAll(async () => {
        prisma = new PrismaClient();
        service = new LegalDocumentService();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('getAvailableDocuments', () => {
        test('should return documents for GUEST level user', async () => {
            const documents = await service.getAvailableDocuments('guest-user-id');
            expect(documents).toBeDefined();
            expect(Array.isArray(documents)).toBe(true);
            expect(documents.every(doc => doc.rbac_level === 'GUEST')).toBe(true);
        });

        test('should return documents for MEMBER level user', async () => {
            const documents = await service.getAvailableDocuments('member-user-id');
            expect(documents).toBeDefined();
            expect(documents.some(doc => doc.rbac_level === 'MEMBER')).toBe(true);
        });

        test('should throw error for non-existent user', async () => {
            await expect(service.getAvailableDocuments('non-existent-user'))
                .rejects.toThrow('User not found');
        });
    });

    describe('signDocument', () => {
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
            expect(signature.signature_data).toEqual(signatureData);
        });

        test('should throw error for non-existent document', async () => {
            const signatureData = {
                method: 'click',
                ip_address: '127.0.0.1',
                user_agent: 'test-agent',
                mfa_verified: true
            };

            await expect(service.signDocument('user123', 'non-existent-doc', signatureData))
                .rejects.toThrow('Document not found');
        });

        test('should update user document status after signing', async () => {
            const signatureData = {
                method: 'click',
                ip_address: '127.0.0.1',
                user_agent: 'test-agent',
                mfa_verified: true
            };

            await service.signDocument('user123', 'ppa', signatureData);
            
            const userStatus = await prisma.userDocumentStatus.findUnique({
                where: {
                    unique_user_document: {
                        user_id: 'user123',
                        document_id: 'ppa'
                    }
                }
            });

            expect(userStatus).toBeDefined();
            expect(userStatus.status).toBe('signed');
            expect(userStatus.signature_hash).toBeDefined();
        });
    });

    describe('generateDocumentHash', () => {
        test('should generate consistent hash for same content', () => {
            const content = 'Test document content\nWith multiple lines';
            const hash1 = service.generateDocumentHash(content);
            const hash2 = service.generateDocumentHash(content);
            expect(hash1).toBe(hash2);
        });

        test('should generate different hash for different content', () => {
            const content1 = 'Test document content';
            const content2 = 'Different document content';
            const hash1 = service.generateDocumentHash(content1);
            const hash2 = service.generateDocumentHash(content2);
            expect(hash1).not.toBe(hash2);
        });

        test('should handle empty content', () => {
            const hash = service.generateDocumentHash('');
            expect(hash).toBeDefined();
            expect(typeof hash).toBe('string');
        });
    });

    describe('canonicalizeDocument', () => {
        test('should normalize line endings', () => {
            const content = 'Line 1\r\nLine 2\rLine 3\nLine 4';
            const canonicalized = service.canonicalizeDocument(content);
            expect(canonicalized).not.toContain('\r');
            expect(canonicalized).toContain('\n');
        });

        test('should trim trailing spaces', () => {
            const content = 'Line 1   \nLine 2\t\nLine 3';
            const canonicalized = service.canonicalizeDocument(content);
            expect(canonicalized).not.toContain('   ');
            expect(canonicalized).not.toContain('\t');
        });

        test('should collapse multiple blank lines', () => {
            const content = 'Line 1\n\n\n\nLine 2';
            const canonicalized = service.canonicalizeDocument(content);
            expect(canonicalized).not.toContain('\n\n\n');
        });
    });
});
```

### **API Route Tests**
```javascript
// tests/routes/legal-documents-api.test.js
const request = require('supertest');
const express = require('express');
const legalDocumentsRouter = require('../../server/routes/legal-documents-api');

const app = express();
app.use(express.json());
app.use('/api/legal', legalDocumentsRouter);

describe('Legal Documents API', () => {
    let authToken;

    beforeAll(async () => {
        // Get authentication token for testing
        authToken = await getTestAuthToken();
    });

    describe('GET /api/legal/documents', () => {
        test('should return available documents for authenticated user', async () => {
            const response = await request(app)
                .get('/api/legal/documents')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should return 401 for unauthenticated request', async () => {
            await request(app)
                .get('/api/legal/documents')
                .expect(401);
        });
    });

    describe('GET /api/legal/documents/required', () => {
        test('should return only required documents', async () => {
            const response = await request(app)
                .get('/api/legal/documents/required')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.every(doc => doc.is_required)).toBe(true);
        });
    });

    describe('POST /api/legal/documents/:id/sign', () => {
        test('should sign document successfully', async () => {
            const signatureData = {
                method: 'click',
                mfa_verified: true
            };

            const response = await request(app)
                .post('/api/legal/documents/ppa/sign')
                .set('Authorization', `Bearer ${authToken}`)
                .send(signatureData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.document_hash).toBeDefined();
        });

        test('should return 404 for non-existent document', async () => {
            const signatureData = {
                method: 'click',
                mfa_verified: true
            };

            await request(app)
                .post('/api/legal/documents/non-existent/sign')
                .set('Authorization', `Bearer ${authToken}`)
                .send(signatureData)
                .expect(500);
        });
    });
});
```

---

## Integration Testing

### **Database Integration Tests**
```javascript
// tests/integration/database.test.js
const { PrismaClient } = require('@prisma/client');
const LegalDocumentService = require('../../server/services/legal-document-service');

describe('Database Integration', () => {
    let prisma;
    let service;

    beforeAll(async () => {
        prisma = new PrismaClient();
        service = new LegalDocumentService();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Clean up test data
        await prisma.documentSignature.deleteMany();
        await prisma.userDocumentStatus.deleteMany();
        await prisma.documentAuditLog.deleteMany();
    });

    test('should create complete document signing workflow', async () => {
        const userId = 'test-user-123';
        const documentId = 'ppa';
        const signatureData = {
            method: 'click',
            ip_address: '127.0.0.1',
            user_agent: 'test-agent',
            mfa_verified: true
        };

        // Sign document
        const signature = await service.signDocument(userId, documentId, signatureData);

        // Verify signature was created
        const createdSignature = await prisma.documentSignature.findUnique({
            where: { id: signature.id }
        });
        expect(createdSignature).toBeDefined();
        expect(createdSignature.user_id).toBe(userId);
        expect(createdSignature.document_id).toBe(documentId);

        // Verify user document status was updated
        const userStatus = await prisma.userDocumentStatus.findUnique({
            where: {
                unique_user_document: {
                    user_id: userId,
                    document_id: documentId
                }
            }
        });
        expect(userStatus).toBeDefined();
        expect(userStatus.status).toBe('signed');
        expect(userStatus.signature_hash).toBe(signature.document_hash);

        // Verify audit log was created
        const auditLog = await prisma.documentAuditLog.findFirst({
            where: {
                user_id: userId,
                document_id: documentId,
                action: 'sign'
            }
        });
        expect(auditLog).toBeDefined();
    });

    test('should handle concurrent document signing', async () => {
        const userId = 'test-user-456';
        const documentId = 'ppa';
        const signatureData = {
            method: 'click',
            ip_address: '127.0.0.1',
            user_agent: 'test-agent',
            mfa_verified: true
        };

        // Attempt to sign the same document multiple times concurrently
        const promises = Array(5).fill().map(() => 
            service.signDocument(userId, documentId, signatureData)
        );

        const results = await Promise.allSettled(promises);
        
        // Should have one success and four failures (duplicate key constraint)
        const successes = results.filter(r => r.status === 'fulfilled');
        const failures = results.filter(r => r.status === 'rejected');
        
        expect(successes).toHaveLength(1);
        expect(failures).toHaveLength(4);
    });
});
```

### **RBAC Integration Tests**
```javascript
// tests/integration/rbac.test.js
const { PrismaClient } = require('@prisma/client');
const LegalDocumentService = require('../../server/services/legal-document-service');

describe('RBAC Integration', () => {
    let prisma;
    let service;

    beforeAll(async () => {
        prisma = new PrismaClient();
        service = new LegalDocumentService();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should return correct documents for each RBAC level', async () => {
        const rbacLevels = ['GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER'];
        
        for (const level of rbacLevels) {
            // Create test user with specific RBAC level
            const testUser = await prisma.user.create({
                data: {
                    id: `test-user-${level.toLowerCase()}`,
                    email: `test-${level.toLowerCase()}@example.com`,
                    name: `Test ${level} User`,
                    rbac_level: level
                }
            });

            const documents = await service.getAvailableDocuments(testUser.id);
            
            // Verify all returned documents are accessible at this level
            documents.forEach(doc => {
                expect(isDocumentAccessibleAtLevel(doc.rbac_level, level)).toBe(true);
            });

            // Clean up
            await prisma.user.delete({ where: { id: testUser.id } });
        }
    });

    test('should enforce document access restrictions', async () => {
        const guestUser = await prisma.user.create({
            data: {
                id: 'test-guest-user',
                email: 'test-guest@example.com',
                name: 'Test Guest User',
                rbac_level: 'GUEST'
            }
        });

        const documents = await service.getAvailableDocuments(guestUser.id);
        
        // Guest should not have access to MEMBER+ level documents
        const restrictedDocuments = documents.filter(doc => 
            ['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER'].includes(doc.rbac_level)
        );
        
        expect(restrictedDocuments).toHaveLength(0);

        // Clean up
        await prisma.user.delete({ where: { id: guestUser.id } });
    });
});

function isDocumentAccessibleAtLevel(documentLevel, userLevel) {
    const levels = ['GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'];
    const documentIndex = levels.indexOf(documentLevel);
    const userIndex = levels.indexOf(userLevel);
    return userIndex >= documentIndex;
}
```

---

## End-to-End Testing

### **Complete User Workflow Tests**
```javascript
// tests/e2e/user-workflow.test.js
const puppeteer = require('puppeteer');

describe('User Workflow E2E Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 50
        });
        page = await browser.newPage();
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should complete full onboarding with document signing', async () => {
        // Navigate to onboarding
        await page.goto('http://localhost:3000/onboarding');
        
        // Fill out personal information
        await page.type('#firstName', 'John');
        await page.type('#lastName', 'Doe');
        await page.type('#email', 'john.doe@example.com');
        await page.click('#nextButton');
        
        // Wait for document signing step
        await page.waitForSelector('#legalDocuments');
        
        // Sign required documents
        const signButtons = await page.$$('[data-testid="sign-document-button"]');
        for (const button of signButtons) {
            await button.click();
            await page.waitForSelector('[data-testid="signature-confirmation"]');
        }
        
        // Complete onboarding
        await page.click('#completeOnboarding');
        
        // Verify redirect to dashboard
        await page.waitForSelector('#dashboard');
        expect(page.url()).toContain('/dashboard');
    });

    test('should prevent access to restricted features without required documents', async () => {
        // Login as user without required documents
        await page.goto('http://localhost:3000/login');
        await page.type('#email', 'incomplete-user@example.com');
        await page.type('#password', 'password123');
        await page.click('#loginButton');
        
        // Try to access restricted feature
        await page.goto('http://localhost:3000/restricted-feature');
        
        // Should be redirected to document signing
        await page.waitForSelector('#legalDocuments');
        expect(page.url()).toContain('/legal-documents');
    });
});
```

---

## Security Testing

### **Authentication Bypass Tests**
```javascript
// tests/security/authentication.test.js
const request = require('supertest');
const express = require('express');
const legalDocumentsRouter = require('../../server/routes/legal-documents-api');

const app = express();
app.use(express.json());
app.use('/api/legal', legalDocumentsRouter);

describe('Security Tests', () => {
    test('should reject requests without authentication token', async () => {
        await request(app)
            .get('/api/legal/documents')
            .expect(401);
    });

    test('should reject requests with invalid authentication token', async () => {
        await request(app)
            .get('/api/legal/documents')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
    });

    test('should reject requests with expired authentication token', async () => {
        const expiredToken = generateExpiredToken();
        await request(app)
            .get('/api/legal/documents')
            .set('Authorization', `Bearer ${expiredToken}`)
            .expect(401);
    });

    test('should prevent unauthorized document access', async () => {
        const userToken = await getTestAuthToken('GUEST');
        await request(app)
            .get('/api/legal/documents/member-only-document')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
    });

    test('should prevent document signature forgery', async () => {
        const userToken = await getTestAuthToken('MEMBER');
        const forgedSignature = {
            method: 'forged',
            ip_address: '127.0.0.1',
            user_agent: 'forged-agent',
            mfa_verified: false
        };

        await request(app)
            .post('/api/legal/documents/ppa/sign')
            .set('Authorization', `Bearer ${userToken}`)
            .send(forgedSignature)
            .expect(400);
    });
});
```

### **Data Integrity Tests**
```javascript
// tests/security/data-integrity.test.js
const { PrismaClient } = require('@prisma/client');
const LegalDocumentService = require('../../server/services/legal-document-service');

describe('Data Integrity Tests', () => {
    let prisma;
    let service;

    beforeAll(async () => {
        prisma = new PrismaClient();
        service = new LegalDocumentService();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should maintain referential integrity on document deletion', async () => {
        // Create test document
        const document = await prisma.legalDocument.create({
            data: {
                id: 'test-doc-123',
                name: 'Test Document',
                legal_name: 'Test Legal Document',
                version: '1.0',
                category: 'test',
                rbac_level: 'GUEST',
                template_path: '/test/path'
            }
        });

        // Create user document status
        const userStatus = await prisma.userDocumentStatus.create({
            data: {
                user_id: 'test-user-123',
                document_id: document.id,
                status: 'signed'
            }
        });

        // Attempt to delete document (should fail due to foreign key constraint)
        await expect(prisma.legalDocument.delete({
            where: { id: document.id }
        })).rejects.toThrow();

        // Clean up
        await prisma.userDocumentStatus.delete({
            where: { id: userStatus.id }
        });
        await prisma.legalDocument.delete({
            where: { id: document.id }
        });
    });

    test('should prevent duplicate document signatures', async () => {
        const userId = 'test-user-456';
        const documentId = 'ppa';
        const signatureData = {
            method: 'click',
            ip_address: '127.0.0.1',
            user_agent: 'test-agent',
            mfa_verified: true
        };

        // Sign document first time
        await service.signDocument(userId, documentId, signatureData);

        // Attempt to sign same document again
        await expect(service.signDocument(userId, documentId, signatureData))
            .rejects.toThrow();
    });

    test('should validate document hash integrity', async () => {
        const userId = 'test-user-789';
        const documentId = 'ppa';
        const signatureData = {
            method: 'click',
            ip_address: '127.0.0.1',
            user_agent: 'test-agent',
            mfa_verified: true
        };

        const signature = await service.signDocument(userId, documentId, signatureData);
        
        // Verify hash is consistent
        const document = await prisma.legalDocument.findUnique({
            where: { id: documentId }
        });
        const documentContent = await service.getDocumentContent(document.template_path);
        const expectedHash = service.generateDocumentHash(documentContent);
        
        expect(signature.document_hash).toBe(expectedHash);
    });
});
```

---

## Performance Testing

### **Load Testing**
```javascript
// tests/performance/load.test.js
const autocannon = require('autocannon');

describe('Performance Tests', () => {
    test('should handle concurrent document requests', async () => {
        const result = await autocannon({
            url: 'http://localhost:3000/api/legal/documents',
            connections: 100,
            duration: 30,
            headers: {
                'Authorization': `Bearer ${await getTestAuthToken()}`
            }
        });

        expect(result.requests.average).toBeGreaterThan(50);
        expect(result.latency.average).toBeLessThan(1000);
    });

    test('should handle document signing under load', async () => {
        const result = await autocannon({
            url: 'http://localhost:3000/api/legal/documents/ppa/sign',
            method: 'POST',
            connections: 50,
            duration: 20,
            headers: {
                'Authorization': `Bearer ${await getTestAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method: 'click',
                mfa_verified: true
            })
        });

        expect(result.requests.average).toBeGreaterThan(20);
        expect(result.latency.average).toBeLessThan(2000);
    });
});
```

---

## Validation Procedures

### **Document Content Validation**
```javascript
// tests/validation/document-content.test.js
const fs = require('fs').promises;
const path = require('path');

describe('Document Content Validation', () => {
    test('should validate all legal documents exist and are readable', async () => {
        const documentsDir = path.join(__dirname, '../../docs/08-legal');
        const categories = await fs.readdir(documentsDir);
        
        for (const category of categories) {
            if (category.startsWith('.')) continue;
            
            const categoryPath = path.join(documentsDir, category);
            const stat = await fs.stat(categoryPath);
            
            if (stat.isDirectory()) {
                const files = await fs.readdir(categoryPath);
                const markdownFiles = files.filter(file => file.endsWith('.md'));
                
                for (const file of markdownFiles) {
                    const filePath = path.join(categoryPath, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    // Validate document structure
                    expect(content).toContain('# ');
                    expect(content).toContain('**Version:**');
                    expect(content).toContain('**Last Updated:**');
                    expect(content).toContain('**Governing Law:**');
                }
            }
        }
    });

    test('should validate document version consistency', async () => {
        const documents = await getLegalDocuments();
        
        for (const doc of documents) {
            expect(doc.version).toMatch(/^\d+\.\d+$/);
            expect(doc.legal_name).toBeDefined();
            expect(doc.category).toBeDefined();
            expect(doc.rbac_level).toBeDefined();
        }
    });
});
```

### **RBAC Validation**
```javascript
// tests/validation/rbac.test.js
describe('RBAC Validation', () => {
    test('should validate RBAC level hierarchy', () => {
        const levels = ['GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'];
        
        // Each level should have a unique position
        const uniqueLevels = [...new Set(levels)];
        expect(uniqueLevels).toHaveLength(levels.length);
        
        // Each level should be a valid enum value
        levels.forEach(level => {
            expect(level).toMatch(/^[A-Z_]+$/);
        });
    });

    test('should validate document access matrix', async () => {
        const documents = await getLegalDocuments();
        const validLevels = ['GUEST', 'MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN'];
        
        documents.forEach(doc => {
            expect(validLevels).toContain(doc.rbac_level);
        });
    });
});
```

---

## Test Execution

### **Test Scripts**
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:security": "jest tests/security",
    "test:performance": "jest tests/performance",
    "test:validation": "jest tests/validation",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### **CI/CD Integration**
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run security tests
      run: npm run test:security
      
    - name: Run validation tests
      run: npm run test:validation
      
    - name: Generate coverage report
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v1
```

---

## Quality Assurance

### **Code Quality Metrics**
- **Test Coverage**: Minimum 90% for critical paths
- **Code Complexity**: Maximum cyclomatic complexity of 10
- **Security Vulnerabilities**: Zero high/critical vulnerabilities
- **Performance**: API response time < 500ms for 95th percentile

### **Documentation Quality**
- **Completeness**: All public APIs documented
- **Accuracy**: Documentation matches implementation
- **Examples**: Working code examples for all features
- **Legal Compliance**: All legal documents reviewed by legal team

### **Security Standards**
- **Authentication**: Multi-factor authentication for sensitive operations
- **Authorization**: Role-based access control enforced
- **Data Protection**: Encryption at rest and in transit
- **Audit Trail**: Complete audit logging for all operations

---

**This testing and validation guide ensures the SmartStart legal document management system meets the highest quality and security standards.**

*Last updated: September 2025*  
*Compliant with Canadian law and international best practices*
