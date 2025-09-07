# SmartStart Legal Documents Mapping by User Action & RBAC

## Overview

This document maps every user action and RBAC level to the required legal documents that must be signed before access is granted. The framework ensures compliance with Canadian law and protects intellectual property across all platform interactions.

---

## 🔐 **REGISTRATION & ONBOARDING PIPELINE**

### **New User Registration**
**Required Documents (in order):**
1. **Platform Participation Agreement (PPA)** - Core terms and conditions
2. **E-Signature Consent** - Legal recognition of electronic signatures
3. **Privacy Notice + CASL Consent** - Canadian privacy compliance
4. **Payment Terms** - Billing and subscription terms
5. **Mutual Confidentiality & Non-Exfiltration Agreement** - Confidentiality obligations
6. **Security & Tooling Acknowledgment** - Security requirements

**RBAC Level:** `GUEST` → `MEMBER`
**Gating:** All 6 documents must be signed before account activation

---

## 🏢 **SUBSCRIPTION & BILLING PIPELINE**

### **Free Tier → Paid Subscription**
**Required Documents:**
1. **Platform Tools Subscription Agreement (PTSA)** - Subscription terms
2. **Seat Order & Billing Authorization (SOBA)** - Seat provisioning and billing

**RBAC Level:** `MEMBER` → `SUBSCRIBER`
**Gating:** Both documents required for paid features

### **Seat Management (Add/Remove Users)**
**Required Documents:**
1. **Updated SOBA** - New seat count and billing authorization
2. **Per-User Security Acknowledgment** - Each new user must sign security requirements

**RBAC Level:** `SUBSCRIBER` → `SEAT_HOLDER`
**Gating:** Updated SOBA + individual security acknowledgment

---

## 🚀 **VENTURE CREATION & MANAGEMENT PIPELINE**

### **Create New Venture**
**Required Documents:**
1. **Idea Submission & Evaluation Agreement** - IP protection for submitted ideas
2. **Venture Owner Agreement** - Ownership and responsibility terms
3. **Per-Project NDA Addendum (Security-Tiered)** - Project-specific confidentiality

**RBAC Level:** `SUBSCRIBER` → `VENTURE_OWNER`
**Gating:** All 3 documents required before venture creation

### **Join Existing Venture (Team Member)**
**Required Documents:**
1. **Participant Collaboration Agreement (PCA)** - Team collaboration terms
2. **Per-Project NDA Addendum** - Project-specific confidentiality (matching venture's security tier)
3. **IP Assignment Agreement** - Work-for-hire IP assignment

**RBAC Level:** `SUBSCRIBER` → `VENTURE_PARTICIPANT`
**Gating:** All 3 documents required before team access

### **Venture Collaboration (External Partners)**
**Required Documents:**
1. **Joint Development Agreement (JDA)** - External collaboration terms
2. **Mutual Confidentiality Agreement** - Enhanced confidentiality for external parties
3. **Per-Project NDA Addendum** - Project-specific terms
4. **Data Processing Agreement (DPA)** - If handling personal data

**RBAC Level:** `EXTERNAL_PARTNER`
**Gating:** All 4 documents required for external collaboration

---

## 🔒 **SECURITY TIER ACCESS PIPELINE**

### **Tier 1 (Confidential) Access**
**Required Documents:**
1. **Security Tier 1 Acknowledgment** - Device encryption, MFA requirements
2. **Per-Project NDA Addendum** - Tier 1 specific terms

**RBAC Level:** `CONFIDENTIAL_ACCESS`
**Gating:** Security acknowledgment + NDA addendum

### **Tier 2 (Restricted) Access**
**Required Documents:**
1. **Security Tier 2 Acknowledgment** - EDR, OS patching, VPN requirements
2. **Enhanced Security Agreement** - Additional security controls
3. **Per-Project NDA Addendum** - Tier 2 specific terms

**RBAC Level:** `RESTRICTED_ACCESS`
**Gating:** All 3 documents required

### **Tier 3 (Highly Restricted) Access**
**Required Documents:**
1. **Security Tier 3 Acknowledgment** - MDM, hardware security keys, VPN mandatory
2. **Crown Jewel IP Agreement** - Special protection for sensitive IP
3. **Enhanced Security Agreement** - Maximum security controls
4. **Per-Project NDA Addendum** - Tier 3 specific terms
5. **Security Clearance Verification** - Background check acknowledgment

**RBAC Level:** `HIGHLY_RESTRICTED_ACCESS`
**Gating:** All 5 documents + security clearance

---

## 💼 **ADMINISTRATIVE PIPELINE**

### **Billing Administrator**
**Required Documents:**
1. **Billing Administration Agreement** - Financial responsibility and access
2. **Enhanced Confidentiality Agreement** - Access to financial data
3. **Audit Trail Acknowledgment** - Compliance with audit requirements

**RBAC Level:** `BILLING_ADMIN`
**Gating:** All 3 documents required

### **Security Administrator**
**Required Documents:**
1. **Security Administration Agreement** - Security management responsibilities
2. **Incident Response Agreement** - Breach response procedures
3. **Enhanced Confidentiality Agreement** - Access to security data
4. **Legal Compliance Acknowledgment** - Regulatory compliance requirements

**RBAC Level:** `SECURITY_ADMIN`
**Gating:** All 4 documents required

### **Legal Administrator**
**Required Documents:**
1. **Legal Administration Agreement** - Legal oversight responsibilities
2. **Attorney-Client Privilege Agreement** - Legal privilege protection
3. **Enhanced Confidentiality Agreement** - Access to legal data
4. **Regulatory Compliance Agreement** - Legal compliance requirements

**RBAC Level:** `LEGAL_ADMIN`
**Gating:** All 4 documents required

---

## 🎯 **SPECIALIZED ACCESS PIPELINE**

### **Analytics & Reporting Access**
**Required Documents:**
1. **Data Analytics Agreement** - Analytics tool usage terms
2. **Data Anonymization Acknowledgment** - Privacy protection requirements
3. **Reporting Compliance Agreement** - Report generation and distribution

**RBAC Level:** `ANALYTICS_ACCESS`
**Gating:** All 3 documents required

### **API & Integration Access**
**Required Documents:**
1. **API Usage Agreement** - API terms and rate limiting
2. **Integration Security Agreement** - Secure integration requirements
3. **Data Export Agreement** - Data export and usage terms

**RBAC Level:** `API_ACCESS`
**Gating:** All 3 documents required

### **Document Management Access**
**Required Documents:**
1. **Document Management Agreement** - Document handling and storage
2. **Version Control Agreement** - Document versioning and audit
3. **Retention Policy Acknowledgment** - Document retention requirements

**RBAC Level:** `DOCUMENT_ADMIN`
**Gating:** All 3 documents required

---

## 🔄 **UPGRADE & MODIFICATION PIPELINE**

### **Venture Upgrade (Free → Paid)**
**Required Documents:**
1. **Project Upgrade Order & Hosting Addendum (PUOHA)** - Upgrade terms and billing
2. **Enhanced Security Agreement** - Additional security requirements
3. **Service Level Agreement (SLA)** - Service level commitments

**RBAC Level:** `VENTURE_OWNER` → `PAID_VENTURE_OWNER`
**Gating:** All 3 documents required

### **Team Size Increase**
**Required Documents:**
1. **Updated SOBA** - New seat count and billing
2. **Team Expansion Agreement** - Team growth terms
3. **Resource Allocation Agreement** - Resource distribution

**RBAC Level:** `SEAT_HOLDER` → `EXPANDED_TEAM`
**Gating:** All 3 documents required

---

## 🚨 **INCIDENT & COMPLIANCE PIPELINE**

### **Security Incident Response**
**Required Documents:**
1. **Incident Response Agreement** - Response procedures and responsibilities
2. **Breach Notification Agreement** - Regulatory notification requirements
3. **Forensic Investigation Agreement** - Investigation cooperation

**RBAC Level:** `INCIDENT_RESPONDER`
**Gating:** All 3 documents required

### **Compliance Audit**
**Required Documents:**
1. **Audit Cooperation Agreement** - Audit participation requirements
2. **Document Production Agreement** - Document access and production
3. **Confidentiality Agreement** - Audit confidentiality

**RBAC Level:** `AUDIT_PARTICIPANT`
**Gating:** All 3 documents required

---

## 📋 **DOCUMENT SIGNING FLOW SUMMARY**

### **Registration Gate (New Users)**
```
PPA → E-Signature Consent → Privacy Notice + CASL → 
Payment Terms → Mutual NDA → Security Acknowledgment → MEMBER
```

### **Project Discovery Gate (Venture Access)**
```
Per-Project NDA Addendum → DPA (if needed) → CLA (for code) → 
Provisioning → VENTURE_PARTICIPANT
```

### **Studio/Venture Gate (Idea Owner)**
```
Idea Submission Agreement → Studio/Incubation Agreement → 
IP Assignment/License → Equity & Vesting → Shareholders' Agreement → 
NewCo Live → MSAs/SOWs as needed
```

---

## 🎯 **RBAC LEVEL MAPPING**

| RBAC Level | Required Documents | Access Level |
|------------|-------------------|--------------|
| `GUEST` | None | Public content only |
| `MEMBER` | PPA + E-Signature + Privacy + Payment + NDA + Security | Basic platform access |
| `SUBSCRIBER` | PTSA + SOBA | Paid features access |
| `SEAT_HOLDER` | Updated SOBA + Security Acknowledgment | Team collaboration |
| `VENTURE_OWNER` | Idea Submission + Venture Owner + Per-Project NDA | Venture management |
| `VENTURE_PARTICIPANT` | PCA + Per-Project NDA + IP Assignment | Team participation |
| `CONFIDENTIAL_ACCESS` | Security Tier 1 + Per-Project NDA | Tier 1 data access |
| `RESTRICTED_ACCESS` | Security Tier 2 + Enhanced Security + Per-Project NDA | Tier 2 data access |
| `HIGHLY_RESTRICTED_ACCESS` | Security Tier 3 + Crown Jewel IP + Enhanced Security + Per-Project NDA + Security Clearance | Tier 3 data access |
| `BILLING_ADMIN` | Billing Admin + Enhanced Confidentiality + Audit Trail | Financial management |
| `SECURITY_ADMIN` | Security Admin + Incident Response + Enhanced Confidentiality + Legal Compliance | Security management |
| `LEGAL_ADMIN` | Legal Admin + Attorney-Client Privilege + Enhanced Confidentiality + Regulatory Compliance | Legal oversight |

---

## 🔧 **IMPLEMENTATION NOTES**

### **Document Storage**
- **Templates:** `/server/Contracts/templates/`
- **Signed Documents:** `/server/Contracts/signed/`
- **Payloads:** `/server/Contracts/payloads/`

### **Signing Process**
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

---

**This mapping ensures comprehensive legal protection for all user actions and RBAC levels in the SmartStart platform.**

*Last updated: September 2025*
*Compliant with Canadian law and international best practices*
