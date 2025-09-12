# SmartStart Legal Documents Master Index
## Comprehensive Legal Framework with RBAC Access Controls

**Version:** 2.0  
**Last Updated:** September 2025  
**Governing Law:** Ontario, Canada  
**Compliance:** PIPEDA, PHIPA, CASL, AODA, GDPR (where applicable)

---

## 📋 **DOCUMENT CATEGORIES & RBAC ACCESS**

### 🔐 **CORE PLATFORM AGREEMENTS** (All Users)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **PPA** | Platform Participation Agreement | `GUEST` → `MEMBER` | Core platform terms and conditions |
| **ESCA** | Electronic Signature & Consent Agreement | `GUEST` → `MEMBER` | Legal recognition of e-signatures |
| **PNA** | Privacy Notice & Acknowledgment | `GUEST` → `MEMBER` | Canadian privacy compliance (PIPEDA/CASL) |
| **MNDA** | Mutual Non-Disclosure Agreement | `MEMBER` → `PARTICIPANT` | Confidentiality and non-exfiltration |

### 💼 **SUBSCRIPTION & BILLING** (Paid Users)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **PTSA** | Platform Tools Subscription Agreement | `MEMBER` → `SUBSCRIBER` | Subscription terms and billing |
| **SOBA** | Seat Order & Billing Authorization | `SUBSCRIBER` → `SEAT_HOLDER` | Seat provisioning and payment authorization |
| **PUOHA** | Project Upgrade Order & Hosting Addendum | `SEAT_HOLDER` → `PAID_VENTURE` | Project upgrade terms |

### 🚀 **VENTURE & PROJECT AGREEMENTS** (Project Participants)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **ISEA** | Idea Submission & Evaluation Agreement | `SUBSCRIBER` → `VENTURE_OWNER` | IP protection for submitted ideas |
| **PCA** | Participant Collaboration Agreement | `SUBSCRIBER` → `VENTURE_PARTICIPANT` | Team collaboration terms |
| **JDA** | Joint Development Agreement | `VENTURE_PARTICIPANT` → `EXTERNAL_PARTNER` | External collaboration terms |
| **CLA** | Contributor License Agreement | `VENTURE_PARTICIPANT` | Code contribution licensing |

### 🪙 **BUZ TOKEN SYSTEM** (Token Users)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **BTS** | BUZ Token Terms of Service | `MEMBER` → `BUZ_USER` | BUZ token use and platform participation |
| **BPP** | BUZ Token Privacy Policy | `MEMBER` → `BUZ_USER` | BUZ token data collection and processing |

### 🔒 **SECURITY TIER AGREEMENTS** (Security-Cleared Users)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **ST1A** | Security Tier 1 Acknowledgment | `PARTICIPANT` → `CONFIDENTIAL_ACCESS` | Basic security requirements |
| **ST2A** | Security Tier 2 Acknowledgment | `CONFIDENTIAL_ACCESS` → `RESTRICTED_ACCESS` | Enhanced security controls |
| **ST3A** | Security Tier 3 Acknowledgment | `RESTRICTED_ACCESS` → `HIGHLY_RESTRICTED_ACCESS` | Maximum security requirements |
| **CJIA** | Crown Jewel IP Agreement | `HIGHLY_RESTRICTED_ACCESS` | Special IP protection |

### 🏢 **ADMINISTRATIVE AGREEMENTS** (Administrators)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **BAA** | Billing Administration Agreement | `SUBSCRIBER` → `BILLING_ADMIN` | Financial management access |
| **SAA** | Security Administration Agreement | `RESTRICTED_ACCESS` → `SECURITY_ADMIN` | Security management access |
| **LAA** | Legal Administration Agreement | `RESTRICTED_ACCESS` → `LEGAL_ADMIN` | Legal oversight access |

### 📊 **SPECIALIZED ACCESS AGREEMENTS** (Specialized Users)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **DAA** | Data Analytics Agreement | `PARTICIPANT` → `ANALYTICS_ACCESS` | Analytics tool usage |
| **APIUA** | API Usage Agreement | `PARTICIPANT` → `API_ACCESS` | API access and integration |
| **DMA** | Document Management Agreement | `PARTICIPANT` → `DOCUMENT_ADMIN` | Document handling access |

### 🛡️ **COMPLIANCE & INCIDENT RESPONSE** (Incident Responders)
| Document | Legal Name | RBAC Access | Purpose |
|----------|------------|-------------|---------|
| **IRA** | Incident Response Agreement | `SECURITY_ADMIN` → `INCIDENT_RESPONDER` | Security incident procedures |
| **ACA** | Audit Cooperation Agreement | `LEGAL_ADMIN` → `AUDIT_PARTICIPANT` | Compliance audit participation |

---

## 🔄 **SIGNING PIPELINE BY USER JOURNEY**

### **New User Registration Pipeline**
```
1. PPA (Platform Participation Agreement)
2. ESCA (Electronic Signature & Consent Agreement)  
3. PNA (Privacy Notice & Acknowledgment)
4. MNDA (Mutual Non-Disclosure Agreement)
5. STA (Security & Tooling Acknowledgment)
→ Result: GUEST → MEMBER
```

### **Subscription Upgrade Pipeline**
```
1. PTSA (Platform Tools Subscription Agreement)
2. SOBA (Seat Order & Billing Authorization)
→ Result: MEMBER → SUBSCRIBER → SEAT_HOLDER
```

### **Venture Creation Pipeline**
```
1. ISEA (Idea Submission & Evaluation Agreement)
2. VOA (Venture Owner Agreement)
3. PPNA (Per-Project NDA Addendum)
→ Result: SUBSCRIBER → VENTURE_OWNER
```

### **Team Participation Pipeline**
```
1. PCA (Participant Collaboration Agreement)
2. PPNA (Per-Project NDA Addendum)
3. IAA (IP Assignment Agreement)
→ Result: SUBSCRIBER → VENTURE_PARTICIPANT
```

### **Security Tier Upgrade Pipeline**
```
Tier 1: ST1A + PPNA → CONFIDENTIAL_ACCESS
Tier 2: ST2A + ESA + PPNA → RESTRICTED_ACCESS  
Tier 3: ST3A + CJIA + ESA + PPNA + SCV → HIGHLY_RESTRICTED_ACCESS
```

---

## 📁 **DOCUMENT STORAGE STRUCTURE**

```
docs/08-legal/
├── 01-core-platform/
│   ├── platform-participation-agreement.md
│   ├── electronic-signature-consent.md
│   ├── privacy-notice-acknowledgment.md
│   └── mutual-non-disclosure-agreement.md
├── 02-subscription-billing/
│   ├── platform-tools-subscription-agreement.md
│   ├── seat-order-billing-authorization.md
│   └── project-upgrade-hosting-addendum.md
├── 03-venture-project/
│   ├── idea-submission-evaluation-agreement.md
│   ├── participant-collaboration-agreement.md
│   ├── joint-development-agreement.md
│   └── contributor-license-agreement.md
├── 04-security-tiers/
│   ├── security-tier-1-acknowledgment.md
│   ├── security-tier-2-acknowledgment.md
│   ├── security-tier-3-acknowledgment.md
│   └── crown-jewel-ip-agreement.md
├── 05-administrative/
│   ├── billing-administration-agreement.md
│   ├── security-administration-agreement.md
│   └── legal-administration-agreement.md
├── 06-specialized-access/
│   ├── data-analytics-agreement.md
│   ├── api-usage-agreement.md
│   └── document-management-agreement.md
├── 07-compliance-incident/
│   ├── incident-response-agreement.md
│   └── audit-cooperation-agreement.md
├── 08-templates/
│   ├── per-project-nda-addendum-template.md
│   ├── equity-vesting-agreement-template.md
│   └── shareholders-agreement-template.md
└── 09-compliance-frameworks/
    ├── gdpr-compliance-kit/
    ├── pipeda-compliance-kit/
    └── phipa-compliance-kit/
```

---

## 🎯 **RBAC ACCESS MATRIX**

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

## 🔧 **IMPLEMENTATION NOTES**

### **Document Versioning**
- All documents use semantic versioning (v1.0, v1.1, etc.)
- Major changes require re-signing
- Minor updates are automatically applied

### **Digital Signature Process**
1. **Document Generation** - Template + variables = final document
2. **Canonicalization** - Normalize text for consistent hashing
3. **Hash Generation** - SHA-256 of canonicalized text
4. **E-Signature Collection** - Signer info + IP + timestamp + hash
5. **Storage** - Document + hash + signature evidence
6. **Event Emission** - Document lifecycle events

### **Validation Rules**
- All required documents must be signed before access
- Documents cannot be modified after signing
- Amendments require new document generation
- Security clearances have expiration dates
- Regular re-signing for sensitive access levels

### **Legal Compliance**
- **Canadian Law**: PIPEDA, PHIPA, CASL, AODA compliance
- **International**: GDPR, CCPA compatibility where applicable
- **E-Signatures**: Ontario Electronic Commerce Act compliance
- **Accessibility**: WCAG 2.1 AA compliance

---

**This master index ensures comprehensive legal protection for all user actions and RBAC levels in the SmartStart platform.**

*Last updated: September 2025*  
*Compliant with Canadian law and international best practices*
