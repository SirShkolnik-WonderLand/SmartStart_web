# RBAC Legal Document Access Control System
## SmartStart Platform — Legal Documentation Framework

**Version:** 2.0  
**Last Updated:** September 2025  
**Governing Law:** Ontario, Canada

---

## Overview

This document defines the Role-Based Access Control (RBAC) system for legal documents in the SmartStart Platform. It ensures that users only have access to the legal documents appropriate for their role and journey stage, maintaining compliance while providing a streamlined user experience.

---

## RBAC Hierarchy and Document Access

### 🔓 **GUEST Level** (Public Access)
**Access:** Public legal documents only
**Documents:**
- Terms of Use (Public)
- Privacy Policy (Public)
- Cookie Notice
- Accessibility Statement (AODA/WCAG)

**Purpose:** Basic platform information for unregistered users

---

### 🔐 **MEMBER Level** (Basic Platform Access)
**Prerequisites:** Must sign all GUEST documents + core platform agreements
**New Documents Required:**
- Platform Participation Agreement (PPA)
- Electronic Signature & Consent Agreement (ESCA)
- Privacy Notice & Acknowledgment (PNA)
- Mutual Non-Disclosure Agreement (MNDA)
- Security & Tooling Acknowledgment (STA)

**Access:** All GUEST documents + MEMBER documents
**Purpose:** Full platform access for registered users

---

### 💼 **SUBSCRIBER Level** (Paid Features Access)
**Prerequisites:** Must sign all MEMBER documents + subscription agreements
**New Documents Required:**
- Platform Tools Subscription Agreement (PTSA)
- Seat Order & Billing Authorization (SOBA)

**Access:** All previous documents + SUBSCRIBER documents
**Purpose:** Access to paid platform features and tools

---

### 👥 **SEAT_HOLDER Level** (Team Collaboration)
**Prerequisites:** Must sign all SUBSCRIBER documents + team agreements
**New Documents Required:**
- Updated SOBA (for team expansion)
- Per-User Security Acknowledgment
- Team Collaboration Agreement

**Access:** All previous documents + SEAT_HOLDER documents
**Purpose:** Team management and collaboration features

---

### 🚀 **VENTURE_OWNER Level** (Venture Management)
**Prerequisites:** Must sign all SEAT_HOLDER documents + venture agreements
**New Documents Required:**
- Idea Submission & Evaluation Agreement (ISEA)
- Venture Owner Agreement (VOA)
- Per-Project NDA Addendum (PPNA)

**Access:** All previous documents + VENTURE_OWNER documents
**Purpose:** Create and manage ventures/projects

---

### 🤝 **VENTURE_PARTICIPANT Level** (Team Participation)
**Prerequisites:** Must sign all SEAT_HOLDER documents + participation agreements
**New Documents Required:**
- Participant Collaboration Agreement (PCA)
- Per-Project NDA Addendum (PPNA)
- IP Assignment Agreement (IAA)

**Access:** All previous documents + VENTURE_PARTICIPANT documents
**Purpose:** Participate in ventures and projects

---

### 🔒 **CONFIDENTIAL_ACCESS Level** (Tier 1 Security)
**Prerequisites:** Must sign all VENTURE_PARTICIPANT documents + security agreements
**New Documents Required:**
- Security Tier 1 Acknowledgment (ST1A)
- Enhanced Per-Project NDA Addendum (Tier 1)

**Access:** All previous documents + CONFIDENTIAL_ACCESS documents
**Purpose:** Access to confidential project data

---

### 🔐 **RESTRICTED_ACCESS Level** (Tier 2 Security)
**Prerequisites:** Must sign all CONFIDENTIAL_ACCESS documents + enhanced security
**New Documents Required:**
- Security Tier 2 Acknowledgment (ST2A)
- Enhanced Security Agreement (ESA)
- Enhanced Per-Project NDA Addendum (Tier 2)

**Access:** All previous documents + RESTRICTED_ACCESS documents
**Purpose:** Access to restricted/sensitive project data

---

### 🛡️ **HIGHLY_RESTRICTED_ACCESS Level** (Tier 3 Security)
**Prerequisites:** Must sign all RESTRICTED_ACCESS documents + maximum security
**New Documents Required:**
- Security Tier 3 Acknowledgment (ST3A)
- Crown Jewel IP Agreement (CJIA)
- Enhanced Security Agreement (ESA)
- Enhanced Per-Project NDA Addendum (Tier 3)
- Security Clearance Verification (SCV)

**Access:** All previous documents + HIGHLY_RESTRICTED_ACCESS documents
**Purpose:** Access to highly sensitive/critical project data

---

### 💰 **BILLING_ADMIN Level** (Financial Management)
**Prerequisites:** Must sign all SUBSCRIBER documents + billing administration
**New Documents Required:**
- Billing Administration Agreement (BAA)
- Enhanced Confidentiality Agreement (ECA)
- Audit Trail Acknowledgment (ATA)

**Access:** All previous documents + BILLING_ADMIN documents
**Purpose:** Manage billing and financial operations

---

### 🔒 **SECURITY_ADMIN Level** (Security Management)
**Prerequisites:** Must sign all RESTRICTED_ACCESS documents + security administration
**New Documents Required:**
- Security Administration Agreement (SAA)
- Incident Response Agreement (IRA)
- Enhanced Confidentiality Agreement (ECA)
- Legal Compliance Acknowledgment (LCA)

**Access:** All previous documents + SECURITY_ADMIN documents
**Purpose:** Manage security operations and incident response

---

### ⚖️ **LEGAL_ADMIN Level** (Legal Oversight)
**Prerequisites:** Must sign all RESTRICTED_ACCESS documents + legal administration
**New Documents Required:**
- Legal Administration Agreement (LAA)
- Attorney-Client Privilege Agreement (ACPA)
- Enhanced Confidentiality Agreement (ECA)
- Regulatory Compliance Agreement (RCA)

**Access:** All previous documents + LEGAL_ADMIN documents
**Purpose:** Legal oversight and compliance management

---

## Document Access Control Implementation

### 1. **Progressive Disclosure**
- Users only see documents relevant to their current level
- Next-level documents become visible when prerequisites are met
- Clear indication of what's required for advancement

### 2. **Document Status Tracking**
- **Not Required:** Document not applicable to user's current level
- **Required:** Document must be signed for current level access
- **Pending:** Document required for next level advancement
- **Signed:** Document completed and stored
- **Expired:** Document requires renewal

### 3. **Access Validation**
- Real-time validation of document completion
- Automatic access control based on signed documents
- Grace periods for document renewal

### 4. **Document Versioning**
- Version control for all legal documents
- Automatic updates for non-material changes
- Re-signing required for material changes

---

## Specialized Access Levels

### 📊 **ANALYTICS_ACCESS Level**
**Prerequisites:** VENTURE_PARTICIPANT + analytics agreements
**New Documents Required:**
- Data Analytics Agreement (DAA)
- Data Anonymization Acknowledgment
- Reporting Compliance Agreement

### 🔌 **API_ACCESS Level**
**Prerequisites:** VENTURE_PARTICIPANT + API agreements
**New Documents Required:**
- API Usage Agreement (APIUA)
- Integration Security Agreement
- Data Export Agreement

### 📄 **DOCUMENT_ADMIN Level**
**Prerequisites:** VENTURE_PARTICIPANT + document management
**New Documents Required:**
- Document Management Agreement (DMA)
- Version Control Agreement
- Retention Policy Acknowledgment

### 🚨 **INCIDENT_RESPONDER Level**
**Prerequisites:** SECURITY_ADMIN + incident response
**New Documents Required:**
- Incident Response Agreement (IRA)
- Breach Notification Agreement
- Forensic Investigation Agreement

### 🔍 **AUDIT_PARTICIPANT Level**
**Prerequisites:** LEGAL_ADMIN + audit cooperation
**New Documents Required:**
- Audit Cooperation Agreement (ACA)
- Document Production Agreement
- Audit Confidentiality Agreement

---

## Document Signing Workflow

### 1. **Assessment Phase**
- System assesses user's current level
- Identifies required documents for current level
- Identifies pending documents for next level

### 2. **Presentation Phase**
- Present required documents in logical order
- Provide clear explanations of each document's purpose
- Show progress toward next level

### 3. **Signing Phase**
- Electronic signature collection
- Document versioning and hashing
- Secure storage and audit trail

### 4. **Validation Phase**
- Verify all required documents are signed
- Update user's access level
- Grant appropriate platform permissions

### 5. **Monitoring Phase**
- Track document expiration dates
- Monitor for document updates
- Provide renewal notifications

---

## Compliance and Audit

### 1. **Document Audit Trail**
- Complete history of all document interactions
- Timestamp and user identification for all actions
- Cryptographic verification of document integrity

### 2. **Access Logging**
- Log all document access attempts
- Track document viewing and signing
- Monitor for unauthorized access attempts

### 3. **Compliance Reporting**
- Regular compliance reports for administrators
- Document completion statistics
- Access level distribution analysis

### 4. **Legal Hold**
- Ability to preserve documents for legal proceedings
- Secure storage of signed documents
- Long-term retention as required by law

---

## Implementation Notes

### 1. **Database Schema (Current Implementation)**
```sql
-- Legal documents table (implemented)
CREATE TABLE "LegalDocument" (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'DRAFT',
    "requiresSignature" BOOLEAN DEFAULT FALSE,
    "complianceRequired" BOOLEAN DEFAULT FALSE,
    description TEXT,
    "createdBy" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legal document signatures table (implemented)
CREATE TABLE "LegalDocumentSignature" (
    id VARCHAR(255) PRIMARY KEY,
    "documentId" VARCHAR(255) NOT NULL,
    "signerId" VARCHAR(255) NOT NULL,
    "signatureHash" VARCHAR(255) NOT NULL,
    "signedAt" TIMESTAMP NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "termsAccepted" BOOLEAN DEFAULT FALSE,
    "privacyAccepted" BOOLEAN DEFAULT FALSE,
    "identityVerified" BOOLEAN DEFAULT FALSE,
    FOREIGN KEY ("documentId") REFERENCES "LegalDocument"(id),
    FOREIGN KEY ("signerId") REFERENCES "User"(id)
);

-- User table with RBAC level (implemented)
CREATE TABLE "User" (
    id VARCHAR(255) PRIMARY KEY,
    "rbacLevel" VARCHAR(100) DEFAULT 'GUEST',
    -- other user fields...
);
```

### 2. **API Endpoints (Current Implementation)**
- `GET /api/legal-documents/health` - Health check for legal documents service
- `GET /api/legal-documents/documents` - Get available documents for user (RBAC filtered)
- `GET /api/legal-documents/documents/required` - Get required documents for current level
- `GET /api/legal-documents/documents/pending` - Get pending documents for next level
- `GET /api/legal-documents/status` - Get user document status and compliance
- `POST /api/legal-signing/session/start` - Start signing session for documents
- `POST /api/legal-signing/session/:sessionId/sign` - Sign document in session
- `GET /api/legal-signing/user/compliance` - Check user compliance status

### 3. **Frontend Components (Current Implementation)**
- **LegalDocumentManager**: Main document management interface with RBAC filtering
- **DocumentSigningModal**: Interactive modal for signing existing documents
- **ActionDocumentSigningModal**: Modal for signing action-generated documents
- **Document Progress Tracking**: Visual progress tracking for document completion
- **RBAC Access Level Visualization**: Clear indication of current and next levels
- **Document Status Indicators**: REQUIRED/PENDING/SIGNED status display
- **Compliance Dashboard**: Real-time compliance status and progress tracking

---

## Security Considerations

### 1. **Document Integrity**
- Cryptographic hashing of all documents
- Tamper-evident storage
- Version control and change tracking

### 2. **Access Control**
- Role-based document visibility
- Secure document delivery
- Audit logging of all access

### 3. **Data Protection**
- Encryption of stored documents
- Secure transmission protocols
- Compliance with privacy regulations

---

## Current Implementation Status

### ✅ **Implemented Features (September 2025)**

#### **RBAC Integration**
- **13 RBAC Levels**: Complete hierarchy from GUEST to LEGAL_ADMIN
- **Document Requirements**: Each level has specific document requirements mapped
- **Progressive Disclosure**: Users see only relevant documents for their level
- **Compliance Checking**: Real-time compliance status with legal framework

#### **Database Integration**
- **User RBAC Levels**: Stored in user table with proper defaults
- **Document Filtering**: Documents filtered by user's current RBAC level
- **Status Tracking**: REQUIRED/PENDING/SIGNED status for each document
- **Compliance Persistence**: All compliance data stored in PostgreSQL

#### **Frontend Implementation**
- **Interactive Signing**: Beautiful modal with document display and signing
- **RBAC Filtering**: Documents automatically filtered by user level
- **Progress Tracking**: Visual progress toward next RBAC level
- **Status Indicators**: Clear REQUIRED/PENDING/SIGNED status display

#### **API Implementation**
- **RBAC-Aware Endpoints**: All endpoints respect user's RBAC level
- **Compliance Checking**: Real-time compliance status checking
- **Document Filtering**: Automatic filtering based on user level
- **Health Monitoring**: API health checks and database connectivity

### 🔧 **Technical Implementation**

#### **RBAC Level Mapping**
```javascript
const rbacLevels = {
  'GUEST': 0,
  'MEMBER': 1,
  'SUBSCRIBER': 2,
  'SEAT_HOLDER': 3,
  'VENTURE_OWNER': 4,
  'VENTURE_PARTICIPANT': 5,
  'EXTERNAL_PARTNER': 6,
  'CONFIDENTIAL_ACCESS': 7,
  'RESTRICTED_ACCESS': 8,
  'HIGHLY_RESTRICTED_ACCESS': 9,
  'BILLING_ADMIN': 10,
  'SECURITY_ADMIN': 11,
  'LEGAL_ADMIN': 12
};
```

#### **Document Status Logic**
```javascript
const getDocumentStatus = (doc, userLevel, isSigned) => {
  const isRequired = isDocumentRequiredForLevel(doc, userLevel);
  const isPending = isDocumentRequiredForNextLevel(doc, userLevel);
  
  if (isRequired && isSigned) return 'SIGNED';
  if (isRequired && !isSigned) return 'REQUIRED';
  if (isPending && isSigned) return 'SIGNED';
  if (isPending && !isSigned) return 'PENDING';
  return 'NOT_REQUIRED';
};
```

### 🚀 **Production Ready**
- **Full RBAC Integration**: Complete integration with existing legal framework
- **Database Persistence**: All RBAC data stored in PostgreSQL
- **Real-time Compliance**: Live compliance checking and status updates
- **Interactive UI**: Beautiful, responsive interface with proper RBAC filtering
- **Error Handling**: Comprehensive error handling and user feedback

---

**This RBAC system ensures that users have appropriate access to legal documents based on their role and journey stage, maintaining compliance while providing a streamlined user experience.**

*Last updated: September 2025*  
*Compliant with Canadian law and international best practices*  
*Status: Production Ready - Fully Implemented*
