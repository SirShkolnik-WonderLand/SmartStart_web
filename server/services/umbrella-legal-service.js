/**
 * SmartStart Umbrella Legal Service
 * Handles umbrella-specific legal document generation and management
 * Integrates with existing legal framework for compliance
 */

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

class UmbrellaLegalService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Generate umbrella agreement document
   */
  async generateUmbrellaAgreement(relationshipId, variables = {}) {
    try {
      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId },
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          referred: { select: { id: true, name: true, email: true } }
        }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      const agreementContent = this.createUmbrellaAgreementTemplate({
        referrerName: relationship.referrer.name,
        referrerEmail: relationship.referrer.email,
        referredName: relationship.referred.name,
        referredEmail: relationship.referred.email,
        shareRate: relationship.defaultShareRate,
        relationshipType: relationship.relationshipType,
        agreementVersion: relationship.agreementVersion,
        ...variables
      });

      // Create umbrella document
      const document = await this.prisma.umbrellaDocument.create({
        data: {
          umbrellaId: relationshipId,
          documentType: 'UMBRELLA_AGREEMENT',
          title: `Umbrella Agreement - ${relationship.referrer.name} & ${relationship.referred.name}`,
          content: agreementContent,
          version: relationship.agreementVersion,
          status: 'DRAFT',
          requiresSignature: true
        }
      });

      return document;
    } catch (error) {
      console.error('Error generating umbrella agreement:', error);
      throw error;
    }
  }

  /**
   * Create umbrella agreement template
   */
  createUmbrellaAgreementTemplate(variables) {
    const {
      referrerName,
      referrerEmail,
      referredName,
      referredEmail,
      shareRate,
      relationshipType,
      agreementVersion,
      effectiveDate = new Date().toISOString().split('T')[0]
    } = variables;

    return `# SmartStart Private Umbrella Agreement

**Agreement Version:** ${agreementVersion}  
**Effective Date:** ${effectiveDate}  
**Governing Law:** Ontario, Canada

---

## PARTIES

**Referrer:** ${referrerName} (${referrerEmail})  
**Referred:** ${referredName} (${referredEmail})  
**Platform:** Alice Solutions Inc. (SmartStart)

---

## TERMS AND CONDITIONS

### 1. UMBRELLA RELATIONSHIP

The Referrer has brought the Referred to the SmartStart platform, and both parties agree to participate in the Private Umbrella System as defined in this agreement.

### 2. REVENUE SHARING

- **Share Rate:** ${shareRate}% of project revenue
- **Scope:** Applies to all projects created by the Referred on the SmartStart platform
- **Duration:** Active while this umbrella relationship remains active
- **Payment Schedule:** Monthly or quarterly (as configured)
- **Currency:** USD (or as specified)

### 3. OBLIGATIONS

#### Referrer Obligations:
- Provide guidance and support to the Referred
- Maintain active participation in the platform
- Comply with all platform terms and conditions

#### Referred Obligations:
- Maintain active participation in the platform
- Create and manage projects in good faith
- Comply with all platform terms and conditions

#### Platform Obligations:
- Facilitate revenue sharing calculations
- Provide tools and support for umbrella management
- Maintain accurate records and audit trails

### 4. TERMINATION

- Either party may terminate this agreement with 30 days written notice
- Revenue sharing stops upon termination
- Existing obligations remain until completion
- Platform may terminate for violations of terms

### 5. LEGAL COMPLIANCE

- This agreement is governed by Ontario, Canada law
- Subject to SmartStart platform terms of service
- Includes privacy and data protection clauses
- Compliant with applicable financial regulations

### 6. DISPUTE RESOLUTION

- Disputes will be resolved through platform mediation
- Escalation to binding arbitration if needed
- Legal jurisdiction: Ontario, Canada

---

## SIGNATURES

**Referrer:** ${referrerName}  
**Date:** _______________  
**Digital Signature:** _______________

**Referred:** ${referredName}  
**Date:** _______________  
**Digital Signature:** _______________

**Platform Representative:** Alice Solutions Inc.  
**Date:** _______________  
**Digital Signature:** _______________

---

*This agreement is digitally signed and legally binding under Canadian law.*
`;
  }

  /**
   * Generate revenue sharing terms document
   */
  async generateRevenueSharingTerms(relationshipId, variables = {}) {
    try {
      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId },
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          referred: { select: { id: true, name: true, email: true } }
        }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      const termsContent = this.createRevenueSharingTermsTemplate({
        referrerName: relationship.referrer.name,
        referredName: relationship.referred.name,
        shareRate: relationship.defaultShareRate,
        ...variables
      });

      const document = await this.prisma.umbrellaDocument.create({
        data: {
          umbrellaId: relationshipId,
          documentType: 'REVENUE_SHARING_TERMS',
          title: `Revenue Sharing Terms - ${relationship.referrer.name} & ${relationship.referred.name}`,
          content: termsContent,
          version: 'v1.0',
          status: 'DRAFT',
          requiresSignature: true
        }
      });

      return document;
    } catch (error) {
      console.error('Error generating revenue sharing terms:', error);
      throw error;
    }
  }

  /**
   * Create revenue sharing terms template
   */
  createRevenueSharingTermsTemplate(variables) {
    const {
      referrerName,
      referredName,
      shareRate,
      effectiveDate = new Date().toISOString().split('T')[0]
    } = variables;

    return `# Revenue Sharing Terms - Private Umbrella System

**Effective Date:** ${effectiveDate}  
**Governing Law:** Ontario, Canada

---

## REVENUE SHARING DETAILS

### Parties
- **Referrer:** ${referrerName}
- **Referred:** ${referredName}

### Share Rate
- **Percentage:** ${shareRate}% of project revenue
- **Calculation:** Based on total project revenue generated by the Referred
- **Minimum Threshold:** No minimum threshold applies

### Payment Terms
- **Frequency:** Monthly or quarterly (as configured)
- **Currency:** USD (or as specified)
- **Processing:** Automated through SmartStart platform
- **Timing:** Within 30 days of revenue recognition

### Revenue Recognition
- Revenue is recognized when projects are completed or milestones are achieved
- Only revenue from projects created after this agreement is effective
- Excludes platform fees and third-party costs

### Compliance
- All payments are subject to applicable tax regulations
- Platform maintains complete audit trail
- Both parties responsible for their own tax obligations

---

*These terms are part of the broader Umbrella Agreement and are legally binding.*
`;
  }

  /**
   * Sign umbrella document
   */
  async signUmbrellaDocument(documentId, signerId, signatureData) {
    try {
      const document = await this.prisma.umbrellaDocument.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Generate signature hash
      const signatureHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(signatureData))
        .digest('hex');

      // Create signature record
      const signature = await this.prisma.umbrellaDocumentSignature.create({
        data: {
          documentId,
          signerId,
          signatureHash,
          signedAt: new Date(),
          ipAddress: signatureData.ipAddress,
          userAgent: signatureData.userAgent
        }
      });

      // Update document status if all required signatures are complete
      const allSignatures = await this.prisma.umbrellaDocumentSignature.findMany({
        where: { documentId }
      });

      if (allSignatures.length >= 2) { // Referrer + Referred
        await this.prisma.umbrellaDocument.update({
          where: { id: documentId },
          data: {
            status: 'EFFECTIVE',
            signedAt: new Date()
          }
        });

        // Update umbrella relationship status
        await this.prisma.umbrellaRelationship.update({
          where: { id: document.umbrellaId },
          data: {
            agreementSigned: true,
            status: 'ACTIVE',
            signedAt: new Date()
          }
        });
      }

      return signature;
    } catch (error) {
      console.error('Error signing umbrella document:', error);
      throw error;
    }
  }

  /**
   * Get umbrella documents for relationship
   */
  async getUmbrellaDocuments(relationshipId) {
    try {
      const documents = await this.prisma.umbrellaDocument.findMany({
        where: { umbrellaId: relationshipId },
        include: {
          signatures: {
            include: {
              signer: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return documents;
    } catch (error) {
      console.error('Error getting umbrella documents:', error);
      throw error;
    }
  }

  /**
   * Generate termination notice
   */
  async generateTerminationNotice(relationshipId, reason, terminatedBy) {
    try {
      const relationship = await this.prisma.umbrellaRelationship.findUnique({
        where: { id: relationshipId },
        include: {
          referrer: { select: { id: true, name: true, email: true } },
          referred: { select: { id: true, name: true, email: true } }
        }
      });

      if (!relationship) {
        throw new Error('Umbrella relationship not found');
      }

      const noticeContent = this.createTerminationNoticeTemplate({
        referrerName: relationship.referrer.name,
        referredName: relationship.referred.name,
        reason,
        terminatedBy,
        terminationDate: new Date().toISOString().split('T')[0]
      });

      const document = await this.prisma.umbrellaDocument.create({
        data: {
          umbrellaId: relationshipId,
          documentType: 'TERMINATION_NOTICE',
          title: `Termination Notice - ${relationship.referrer.name} & ${relationship.referred.name}`,
          content: noticeContent,
          version: 'v1.0',
          status: 'EFFECTIVE',
          requiresSignature: false
        }
      });

      return document;
    } catch (error) {
      console.error('Error generating termination notice:', error);
      throw error;
    }
  }

  /**
   * Create termination notice template
   */
  createTerminationNoticeTemplate(variables) {
    const {
      referrerName,
      referredName,
      reason,
      terminatedBy,
      terminationDate
    } = variables;

    return `# Umbrella Relationship Termination Notice

**Termination Date:** ${terminationDate}  
**Governing Law:** Ontario, Canada

---

## TERMINATION DETAILS

### Parties
- **Referrer:** ${referrerName}
- **Referred:** ${referredName}

### Termination Information
- **Terminated By:** ${terminatedBy}
- **Reason:** ${reason}
- **Effective Date:** ${terminationDate}

### Consequences
- Revenue sharing stops immediately
- Existing obligations remain until completion
- All umbrella documents are archived
- Platform access remains unchanged

### Final Settlement
- Any pending revenue shares will be processed
- Final payment within 30 days
- Complete audit trail maintained

---

*This termination notice is legally binding and effective immediately upon generation.*
`;
  }
}

module.exports = new UmbrellaLegalService();
