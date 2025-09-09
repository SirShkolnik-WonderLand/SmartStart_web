# SmartStart Comprehensive Document Matrix
## Complete Mapping of Documents, Roles, Steps, APIs, Database, and Signatures

**Version:** 2.0  
**Last Updated:** September 2025  
**Governing Law:** Ontario, Canada

---

## Overview

This matrix provides a complete mapping of all legal documents, their requirements, associated roles, database tables, API endpoints, and signature workflows in the SmartStart platform.

---

## Document Categories & Structure

### 📁 **01-core-platform/** - Core Platform Agreements
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **PPA** | Platform Participation Agreement | `GUEST` → `MEMBER` | Core platform terms | `user_agreements` | `POST /api/legal/ppa/sign` |
| **ESCA** | Electronic Signature & Consent Agreement | `GUEST` → `MEMBER` | E-signature consent | `user_agreements` | `POST /api/legal/esca/sign` |
| **PNA** | Privacy Notice & Acknowledgment | `GUEST` → `MEMBER` | Privacy compliance | `user_agreements` | `POST /api/legal/pna/sign` |
| **MNDA** | Mutual Non-Disclosure Agreement | `MEMBER` → `PARTICIPANT` | Confidentiality | `user_agreements` | `POST /api/legal/mnda/sign` |

### 📁 **02-subscription-billing/** - Subscription & Billing
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **PTSA** | Platform Tools Subscription Agreement | `MEMBER` → `SUBSCRIBER` | Subscription terms | `subscription_agreements` | `POST /api/legal/ptsa/sign` |
| **SOBA** | Seat Order & Billing Authorization | `SUBSCRIBER` → `SEAT_HOLDER` | Seat provisioning | `billing_authorizations` | `POST /api/legal/soba/sign` |
| **PUOHA** | Project Upgrade Order & Hosting Addendum | `SEAT_HOLDER` → `PAID_VENTURE` | Project upgrades | `project_upgrades` | `POST /api/legal/puoha/sign` |

### 📁 **03-venture-project/** - Venture & Project Agreements
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **ISEA** | Idea Submission & Evaluation Agreement | `SUBSCRIBER` → `VENTURE_OWNER` | IP protection | `venture_agreements` | `POST /api/legal/isea/sign` |
| **PCA** | Participant Collaboration Agreement | `SUBSCRIBER` → `VENTURE_PARTICIPANT` | Team collaboration | `collaboration_agreements` | `POST /api/legal/pca/sign` |
| **JDA** | Joint Development Agreement | `VENTURE_PARTICIPANT` → `EXTERNAL_PARTNER` | External collaboration | `joint_development_agreements` | `POST /api/legal/jda/sign` |
| **CLA** | Contributor License Agreement | `VENTURE_PARTICIPANT` | Code contribution | `contributor_agreements` | `POST /api/legal/cla/sign` |

### 📁 **04-security-tiers/** - Security Tier Agreements
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **ST1A** | Security Tier 1 Acknowledgment | `PARTICIPANT` → `CONFIDENTIAL_ACCESS` | Basic security | `security_acknowledgments` | `POST /api/legal/st1a/sign` |
| **ST2A** | Security Tier 2 Acknowledgment | `CONFIDENTIAL_ACCESS` → `RESTRICTED_ACCESS` | Enhanced security | `security_acknowledgments` | `POST /api/legal/st2a/sign` |
| **ST3A** | Security Tier 3 Acknowledgment | `RESTRICTED_ACCESS` → `HIGHLY_RESTRICTED_ACCESS` | Maximum security | `security_acknowledgments` | `POST /api/legal/st3a/sign` |
| **CJIA** | Crown Jewel IP Agreement | `HIGHLY_RESTRICTED_ACCESS` | Special IP protection | `ip_agreements` | `POST /api/legal/cjia/sign` |

### 📁 **05-administrative/** - Administrative Agreements
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **BAA** | Billing Administration Agreement | `SUBSCRIBER` → `BILLING_ADMIN` | Financial management | `admin_agreements` | `POST /api/legal/baa/sign` |
| **SAA** | Security Administration Agreement | `RESTRICTED_ACCESS` → `SECURITY_ADMIN` | Security management | `admin_agreements` | `POST /api/legal/saa/sign` |
| **LAA** | Legal Administration Agreement | `RESTRICTED_ACCESS` → `LEGAL_ADMIN` | Legal oversight | `admin_agreements` | `POST /api/legal/laa/sign` |

### 📁 **06-specialized-access/** - Specialized Access Agreements
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **DAA** | Data Analytics Agreement | `PARTICIPANT` → `ANALYTICS_ACCESS` | Analytics tools | `specialized_agreements` | `POST /api/legal/daa/sign` |
| **APIUA** | API Usage Agreement | `PARTICIPANT` → `API_ACCESS` | API access | `specialized_agreements` | `POST /api/legal/apiua/sign` |
| **DMA** | Document Management Agreement | `PARTICIPANT` → `DOCUMENT_ADMIN` | Document handling | `specialized_agreements` | `POST /api/legal/dma/sign` |

### 📁 **07-compliance-incident/** - Compliance & Incident Response
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **IRA** | Incident Response Agreement | `SECURITY_ADMIN` → `INCIDENT_RESPONDER` | Security incidents | `incident_agreements` | `POST /api/legal/ira/sign` |
| **ACA** | Audit Cooperation Agreement | `LEGAL_ADMIN` → `AUDIT_PARTICIPANT` | Compliance audits | `audit_agreements` | `POST /api/legal/aca/sign` |

### 📁 **08-team-documents/** - Team-Specific Documents
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **TCA** | Team Collaboration Agreement | `TEAM_MEMBER` | Basic team collaboration | `team_agreements` | `POST /api/legal/tca/sign` |
| **TCOA** | Team Confidentiality Agreement | `TEAM_MEMBER` | Team confidentiality | `team_agreements` | `POST /api/legal/tcoa/sign` |
| **TLA** | Team Leadership Agreement | `TEAM_LEADER` | Team leadership | `team_leadership_agreements` | `POST /api/legal/tla/sign` |
| **TIAA** | Team IP Assignment Agreement | `TEAM_LEADER` | Team IP rights | `team_ip_agreements` | `POST /api/legal/tiaa/sign` |
| **TAA** | Team Administration Agreement | `TEAM_ADMIN` | Team administration | `team_admin_agreements` | `POST /api/legal/taa/sign` |
| **TSA** | Team Security Acknowledgment | `TEAM_ADMIN` | Team security | `team_security_agreements` | `POST /api/legal/tsa/sign` |

### 📁 **09-owner-documents/** - AliceSolutions Owner Documents
| Document | Legal Name | RBAC Access | Purpose | Database Table | API Endpoint |
|----------|------------|-------------|---------|----------------|--------------|
| **ASOA** | AliceSolutions Owner Agreement | `ALICE_SOLUTIONS_OWNER` | Master ownership | `owner_agreements` | `POST /api/legal/asoa/sign` |
| **AMSA** | AliceSolutions Master Service Agreement | `ALICE_SOLUTIONS_OWNER` | Service provision | `owner_agreements` | `POST /api/legal/amsa/sign` |
| **AIPA** | AliceSolutions IP Agreement | `ALICE_SOLUTIONS_OWNER` | IP ownership | `owner_ip_agreements` | `POST /api/legal/aipa/sign` |
| **ADPA** | AliceSolutions Data Processing Agreement | `ALICE_SOLUTIONS_OWNER` | Data processing | `owner_data_agreements` | `POST /api/legal/adpa/sign` |
| **ATOS** | AliceSolutions Terms of Service | `ALICE_SOLUTIONS_OWNER` | Platform terms | `owner_tos_agreements` | `POST /api/legal/atos/sign` |

### 📁 **10-templates/** - Document Templates
| Template | Purpose | Usage | Database Table | API Endpoint |
|----------|---------|-------|----------------|--------------|
| **Per-Project NDA Addendum** | Project-specific confidentiality | Generated per project | `project_nda_addenda` | `POST /api/legal/project-nda/sign` |
| **Equity Vesting Agreement** | Equity distribution | Generated per equity grant | `equity_agreements` | `POST /api/legal/equity/sign` |
| **Shareholders Agreement** | Corporate governance | Generated per incorporation | `shareholder_agreements` | `POST /api/legal/shareholders/sign` |

---

## User Journey & Document Flow Matrix

### **Registration Pipeline** (New User)
| Step | Document | RBAC Level | Required | Database Action | API Call |
|------|----------|------------|----------|-----------------|----------|
| 1 | PPA | `GUEST` → `MEMBER` | ✅ Required | `INSERT user_agreements` | `POST /api/legal/ppa/sign` |
| 2 | ESCA | `GUEST` → `MEMBER` | ✅ Required | `INSERT user_agreements` | `POST /api/legal/esca/sign` |
| 3 | PNA | `GUEST` → `MEMBER` | ✅ Required | `INSERT user_agreements` | `POST /api/legal/pna/sign` |
| 4 | MNDA | `MEMBER` → `PARTICIPANT` | ✅ Required | `INSERT user_agreements` | `POST /api/legal/mnda/sign` |
| 5 | STA | `MEMBER` → `PARTICIPANT` | ✅ Required | `INSERT security_acknowledgments` | `POST /api/legal/sta/sign` |

### **Subscription Pipeline** (Paid Features)
| Step | Document | RBAC Level | Required | Database Action | API Call |
|------|----------|------------|----------|-----------------|----------|
| 1 | PTSA | `MEMBER` → `SUBSCRIBER` | ✅ Required | `INSERT subscription_agreements` | `POST /api/legal/ptsa/sign` |
| 2 | SOBA | `SUBSCRIBER` → `SEAT_HOLDER` | ✅ Required | `INSERT billing_authorizations` | `POST /api/legal/soba/sign` |

### **Venture Creation Pipeline** (Project Owner)
| Step | Document | RBAC Level | Required | Database Action | API Call |
|------|----------|------------|----------|-----------------|----------|
| 1 | ISEA | `SUBSCRIBER` → `VENTURE_OWNER` | ✅ Required | `INSERT venture_agreements` | `POST /api/legal/isea/sign` |
| 2 | VOA | `SUBSCRIBER` → `VENTURE_OWNER` | ✅ Required | `INSERT venture_agreements` | `POST /api/legal/voa/sign` |
| 3 | PPNA | `VENTURE_OWNER` | ✅ Required | `INSERT project_nda_addenda` | `POST /api/legal/project-nda/sign` |

### **Team Participation Pipeline** (Team Member)
| Step | Document | RBAC Level | Required | Database Action | API Call |
|------|----------|------------|----------|-----------------|----------|
| 1 | PCA | `SUBSCRIBER` → `VENTURE_PARTICIPANT` | ✅ Required | `INSERT collaboration_agreements` | `POST /api/legal/pca/sign` |
| 2 | PPNA | `VENTURE_PARTICIPANT` | ✅ Required | `INSERT project_nda_addenda` | `POST /api/legal/project-nda/sign` |
| 3 | IAA | `VENTURE_PARTICIPANT` | ✅ Required | `INSERT ip_agreements` | `POST /api/legal/iaa/sign` |

### **Security Tier Upgrade Pipeline**
| Step | Document | RBAC Level | Required | Database Action | API Call |
|------|----------|------------|----------|-----------------|----------|
| 1 | ST1A | `PARTICIPANT` → `CONFIDENTIAL_ACCESS` | ✅ Required | `INSERT security_acknowledgments` | `POST /api/legal/st1a/sign` |
| 2 | ST2A | `CONFIDENTIAL_ACCESS` → `RESTRICTED_ACCESS` | ✅ Required | `INSERT security_acknowledgments` | `POST /api/legal/st2a/sign` |
| 3 | ST3A | `RESTRICTED_ACCESS` → `HIGHLY_RESTRICTED_ACCESS` | ✅ Required | `INSERT security_acknowledgments` | `POST /api/legal/st3a/sign` |
| 4 | CJIA | `HIGHLY_RESTRICTED_ACCESS` | ✅ Required | `INSERT ip_agreements` | `POST /api/legal/cjia/sign` |

---

## Database Schema Mapping

### **Core Tables**
```sql
-- User agreements and legal documents
CREATE TABLE user_agreements (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_version VARCHAR(50) NOT NULL,
    status ENUM('pending', 'signed', 'expired') NOT NULL,
    signed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    document_hash VARCHAR(255) NOT NULL,
    signature_evidence JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Subscription and billing agreements
CREATE TABLE subscription_agreements (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    agreement_type VARCHAR(100) NOT NULL,
    subscription_plan VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL,
    amount_cents INT NOT NULL,
    status ENUM('active', 'suspended', 'cancelled') NOT NULL,
    signed_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NULL,
    document_hash VARCHAR(255) NOT NULL,
    signature_evidence JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Venture and project agreements
CREATE TABLE venture_agreements (
    id VARCHAR(255) PRIMARY KEY,
    venture_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    agreement_type VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    status ENUM('pending', 'signed', 'expired') NOT NULL,
    signed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    document_hash VARCHAR(255) NOT NULL,
    signature_evidence JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venture_id) REFERENCES ventures(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Security acknowledgments
CREATE TABLE security_acknowledgments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    security_tier ENUM('TIER_1', 'TIER_2', 'TIER_3') NOT NULL,
    acknowledgment_type VARCHAR(100) NOT NULL,
    status ENUM('pending', 'signed', 'expired') NOT NULL,
    signed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    document_hash VARCHAR(255) NOT NULL,
    signature_evidence JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Document signatures audit trail
CREATE TABLE document_signatures (
    id VARCHAR(255) PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    signature_method VARCHAR(100) NOT NULL,
    signature_data JSON NOT NULL,
    document_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location_data JSON,
    mfa_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Matrix

### **Legal Document Management APIs**
| Endpoint | Method | Purpose | RBAC Required | Database Tables |
|----------|--------|---------|---------------|-----------------|
| `/api/legal/documents` | GET | List available documents | `MEMBER` | `user_agreements` |
| `/api/legal/documents/:id` | GET | Get specific document | `MEMBER` | `user_agreements` |
| `/api/legal/documents/:id/sign` | POST | Sign a document | `MEMBER` | `user_agreements`, `document_signatures` |
| `/api/legal/documents/status` | GET | Get user document status | `MEMBER` | `user_agreements` |
| `/api/legal/documents/required` | GET | Get required documents for level | `MEMBER` | `user_agreements` |
| `/api/legal/documents/pending` | GET | Get pending documents for next level | `MEMBER` | `user_agreements` |
| `/api/legal/documents/verify` | POST | Verify document signature | `MEMBER` | `document_signatures` |
| `/api/legal/documents/audit` | GET | Get document audit trail | `LEGAL_ADMIN` | `document_signatures` |

### **Document-Specific Signing APIs**
| Document | Endpoint | Method | RBAC Required | Database Action |
|----------|----------|--------|---------------|-----------------|
| PPA | `/api/legal/ppa/sign` | POST | `GUEST` | `INSERT user_agreements` |
| ESCA | `/api/legal/esca/sign` | POST | `GUEST` | `INSERT user_agreements` |
| PNA | `/api/legal/pna/sign` | POST | `GUEST` | `INSERT user_agreements` |
| MNDA | `/api/legal/mnda/sign` | POST | `MEMBER` | `INSERT user_agreements` |
| PTSA | `/api/legal/ptsa/sign` | POST | `MEMBER` | `INSERT subscription_agreements` |
| SOBA | `/api/legal/soba/sign` | POST | `SUBSCRIBER` | `INSERT billing_authorizations` |
| ISEA | `/api/legal/isea/sign` | POST | `SUBSCRIBER` | `INSERT venture_agreements` |
| PCA | `/api/legal/pca/sign` | POST | `SUBSCRIBER` | `INSERT collaboration_agreements` |
| ST1A | `/api/legal/st1a/sign` | POST | `PARTICIPANT` | `INSERT security_acknowledgments` |
| ST2A | `/api/legal/st2a/sign` | POST | `CONFIDENTIAL_ACCESS` | `INSERT security_acknowledgments` |
| ST3A | `/api/legal/st3a/sign` | POST | `RESTRICTED_ACCESS` | `INSERT security_acknowledgments` |

---

## Signature Workflow Matrix

### **Digital Signature Process**
| Step | Action | Database Table | API Endpoint | Validation |
|------|--------|----------------|--------------|------------|
| 1 | Document Generation | N/A | `POST /api/legal/documents/generate` | Template validation |
| 2 | Canonicalization | N/A | Internal process | Text normalization |
| 3 | Hash Generation | N/A | Internal process | SHA-256 computation |
| 4 | E-Signature Collection | `document_signatures` | `POST /api/legal/documents/:id/sign` | MFA verification |
| 5 | Storage with Evidence | `user_agreements` | Internal process | Signature validation |
| 6 | Event Emission | N/A | Event system | Audit trail creation |

### **Signature Evidence Requirements**
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `document_hash` | VARCHAR(255) | ✅ | SHA-256 of canonicalized document |
| `signature_method` | VARCHAR(100) | ✅ | Click, typed, drawn, cryptographic |
| `timestamp` | TIMESTAMP | ✅ | ISO 8601 timestamp |
| `user_identity` | VARCHAR(255) | ✅ | User ID and authentication method |
| `ip_address` | VARCHAR(45) | ✅ | IP address of signing device |
| `user_agent` | TEXT | ✅ | Browser/client information |
| `location` | JSON | ❌ | Approximate geographic location |
| `mfa_verified` | BOOLEAN | ✅ | Multi-factor authentication status |

---

## RBAC Access Control Matrix

### **Document Access by Role**
| RBAC Level | Required Documents | Access Level | Document Count |
|------------|-------------------|--------------|----------------|
| `GUEST` | None | Public content only | 0 |
| `MEMBER` | PPA + ESCA + PNA + MNDA + STA | Basic platform access | 5 |
| `SUBSCRIBER` | + PTSA + SOBA | Paid features access | 7 |
| `SEAT_HOLDER` | + Updated SOBA + Security Acknowledgment | Team collaboration | 9 |
| `VENTURE_OWNER` | + ISEA + VOA + PPNA | Venture management | 12 |
| `VENTURE_PARTICIPANT` | + PCA + PPNA + IAA | Team participation | 15 |
| `CONFIDENTIAL_ACCESS` | + ST1A + PPNA | Tier 1 data access | 17 |
| `RESTRICTED_ACCESS` | + ST2A + ESA + PPNA | Tier 2 data access | 20 |
| `HIGHLY_RESTRICTED_ACCESS` | + ST3A + CJIA + ESA + PPNA + SCV | Tier 3 data access | 25 |
| `BILLING_ADMIN` | + BAA + ECA + ATA | Financial management | 28 |
| `SECURITY_ADMIN` | + SAA + IRA + ECA + LCA | Security management | 32 |
| `LEGAL_ADMIN` | + LAA + ACPA + ECA + RCA | Legal oversight | 36 |

---

## Document Status Tracking Matrix

### **Status Types**
| Status | Description | Database Field | API Response |
|--------|-------------|----------------|--------------|
| `NOT_REQUIRED` | Document not applicable to user level | `status = 'not_required'` | Hidden from user |
| `REQUIRED` | Document must be signed for current level | `status = 'required'` | Shown as required |
| `PENDING` | Document required for next level advancement | `status = 'pending'` | Shown as pending |
| `SIGNED` | Document completed and stored | `status = 'signed'` | Shown as completed |
| `EXPIRED` | Document requires renewal | `status = 'expired'` | Shown as expired |
| `UPDATED` | New version available, re-signing required | `status = 'updated'` | Shown as needs update |

### **Status Transitions**
| From Status | To Status | Trigger | Database Action | API Call |
|-------------|-----------|---------|-----------------|----------|
| `NOT_REQUIRED` | `REQUIRED` | User level change | `UPDATE status` | `GET /api/legal/documents/required` |
| `REQUIRED` | `SIGNED` | Document signed | `UPDATE status, signed_at` | `POST /api/legal/documents/:id/sign` |
| `SIGNED` | `EXPIRED` | Expiration date reached | `UPDATE status` | Background job |
| `EXPIRED` | `REQUIRED` | User attempts access | `UPDATE status` | `GET /api/legal/documents/status` |
| `SIGNED` | `UPDATED` | New document version | `UPDATE status, document_version` | `GET /api/legal/documents/status` |

---

## Compliance & Audit Matrix

### **Audit Trail Requirements**
| Event | Database Table | Fields Logged | Retention Period |
|-------|----------------|---------------|------------------|
| Document View | `document_audit_log` | user_id, document_id, timestamp, ip | 7 years |
| Document Sign | `document_signatures` | All signature evidence | 7 years |
| Document Access | `document_audit_log` | user_id, document_id, timestamp, ip | 7 years |
| Status Change | `document_status_log` | user_id, document_id, old_status, new_status | 7 years |
| RBAC Change | `user_rbac_log` | user_id, old_level, new_level, timestamp | 7 years |

### **Compliance Reporting**
| Report Type | Data Source | Frequency | Recipients |
|-------------|-------------|-----------|------------|
| Document Completion | `user_agreements` | Monthly | Legal Admin |
| Compliance Status | `user_agreements` | Real-time | Security Admin |
| Audit Trail | `document_signatures` | On-demand | Legal Admin |
| RBAC Distribution | `users` | Monthly | HR Admin |

---

## Implementation Notes

### **Document Storage Structure**
```
docs/08-legal/
├── 01-core-platform/          # Core platform agreements
├── 02-subscription-billing/   # Subscription and billing
├── 03-venture-project/        # Venture and project agreements
├── 04-security-tiers/         # Security tier agreements
├── 05-administrative/         # Administrative agreements
├── 06-specialized-access/     # Specialized access agreements
├── 07-compliance-incident/    # Compliance and incident response
├── 08-templates/              # Document templates
└── 09-compliance-frameworks/  # Regulatory compliance kits
```

### **Database Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_user_agreements_user_id ON user_agreements(user_id);
CREATE INDEX idx_user_agreements_status ON user_agreements(status);
CREATE INDEX idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX idx_document_signatures_user_id ON document_signatures(user_id);
CREATE INDEX idx_document_signatures_timestamp ON document_signatures(timestamp);
```

### **API Rate Limiting**
| Endpoint Category | Rate Limit | Burst Limit |
|-------------------|------------|-------------|
| Document Signing | 10/minute | 20/minute |
| Document Viewing | 100/minute | 200/minute |
| Status Checking | 50/minute | 100/minute |
| Audit Queries | 5/minute | 10/minute |

---

**This comprehensive matrix ensures complete traceability and compliance for all legal documents in the SmartStart platform.**

*Last updated: September 2025*  
*Compliant with Canadian law and international best practices*
