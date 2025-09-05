'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../../services/api'

interface LegalDocument {
  id: string
  title: string
  description: string
  required: boolean
  content: string
  icon: string
}

const PlatformLegal = () => {
  const router = useRouter()
  const [currentDoc, setCurrentDoc] = useState(0)
  const [signedDocs, setSignedDocs] = useState<Set<string>>(new Set())
  const [isSigning, setIsSigning] = useState(false)
  const [userSignature, setUserSignature] = useState('')
  const [legalPackStatus, setLegalPackStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const legalDocuments: LegalDocument[] = [
    {
      id: 'platform-participation',
      title: 'Platform Participation Agreement (PPA)',
      description: 'Core terms for using the AliceSolutions Ventures platform',
      required: true,
      icon: '📋',
      content: `
        AliceSolutions Ventures — Platform Participation Agreement (PPA)
        (Terms of Membership & Contribution for the "Hub")
        
        Effective Date: When the Member accepts electronically in the Hub.
        Parties: AliceSolutions Ventures Inc. ("AliceSolutions", "we/us")
        The business user or individual acting for a business who accepts these terms ("Member", "you").
        
        1) Purpose & Scope
        The Hub provides a secure platform for discovering ventures/projects, subscribing, proposing contributions, 
        collaborating under project-specific NDAs/addenda, and tracking rewards. This PPA governs membership, 
        payments, acceptable use, contribution/IP, security, liability, and enforcement across the platform.
        
        2) Account, Identity, and Security
        - Accurate info: You'll keep account, billing, and contact details current
        - MFA required: Multi-factor authentication is mandatory for access to any non-public content
        - Access control: Accounts are individual; sharing credentials is prohibited
        - Device & posture: For sensitive projects, we may require device encryption, current patches, and other posture checks before access
        - Audit: Actions in the Hub may be logged for security, compliance, and dispute resolution
        
        3) Subscriptions, Billing & Taxes
        - Plans: You select a plan (e.g., Member / Pro / Founder). Plan features and limits are shown in the Hub
        - Fees & renewal: Fees are billed in advance and auto-renew each term unless cancelled per Hub instructions
        - Non-payment: If a charge fails, we may suspend or downgrade capabilities after a grace period
        - Taxes: Prices exclude applicable taxes; you're responsible for them
        
        4) Acceptable Use & Community Standards
        You agree not to:
        - breach the Legal Pack, attempt unauthorized access, defeat security, or misuse credentials
        - upload malicious code, attempt data scraping/exfiltration, or use automation to harvest content
        - disclose or export non-public materials outside Designated Systems
        - harass, defame, or discriminate; or violate IP, privacy, or other laws
        - use third-party AI/LLM tools with Confidential Information unless they are explicitly approved
        
        5) Contributions, IP & Licensing
        - Your Background IP: Pre-existing IP you bring remains yours
        - Foreground IP: All new work product created for the project is assigned to the project owner upon acceptance
        - No conflict: You represent you can grant the above rights and your contributions won't knowingly infringe third-party IP
        
        By signing this agreement, you acknowledge that you have read, understood, and agree to be bound by these terms.
      `
    },
    {
      id: 'platform-nda',
      title: 'Mutual Confidentiality & Non-Exfiltration Agreement',
      description: 'Confidentiality obligations for platform access',
      required: true,
      icon: '🔒',
      content: `
        Mutual Confidentiality & Non-Exfiltration Agreement
        (Internal—AliceSolutions Ventures & Participants)
        
        Effective Date: The date the first Participant signs this Agreement electronically or physically.
        Parties: AliceSolutions Ventures Inc. ("AliceSolutions"); and
        Each individual or entity that executes this Agreement (each a "Participant").
        
        1. Purpose
        The Parties wish to explore, evaluate, build, or contribute to ventures and projects within the 
        AliceSolutions ecosystem. In doing so, the Parties may disclose or access Confidential Information. 
        This Agreement sets the rules for using, protecting, and returning that information and prohibits 
        exfiltration or misuse.
        
        2. Key Definitions
        2.1 "Confidential Information" means any non-public information disclosed or made accessible, 
        directly or indirectly, by one Party ("Discloser") to another Party ("Recipient"), in any form 
        (oral, written, visual, electronic, tangible), including without limitation:
        - technical data, source code, repositories, designs, product plans, roadmaps, business strategies, 
          pricing, P&L and financials, customer lists, marketing plans, operating procedures, security 
          architecture, access credentials, logs, and any materials labelled or reasonably understood as confidential
        - information made available through Designated Systems, even if not expressly marked
        - personal information (as defined under applicable privacy laws) contained in or accompanying the above
        
        2.2 "Designated Systems" means the systems, tools, and storage locations explicitly approved by 
        AliceSolutions or the Project Lead for hosting, accessing, or processing Confidential Information.
        
        3. Non-Disclosure, Non-Use & Need-to-Know
        3.1 Non-Disclosure: Recipient must not disclose any Confidential Information to anyone except its 
        own personnel and subcontractors who have a strict need-to-know for the Purpose and are bound by 
        written obligations at least as protective as this Agreement.
        
        3.2 Non-Use: Recipient must use Confidential Information solely for the Purpose and not for any 
        other purpose (including personal use, competition, or development outside the AliceSolutions ecosystem).
        
        4. Non-Exfiltration (Security & Handling Rules)
        4.1 Approved Environments Only: Recipient will access, process, store, transmit, and collaborate 
        on Confidential Information only through Designated Systems.
        
        4.2 Technical Controls: Recipient will maintain MFA on all accounts accessing Designated Systems, 
        keep operating systems and security patches current, use device encryption on endpoints that cache 
        or access Confidential Information, and comply with DLP, watermarking, and access-logging controls.
        
        4.3 AI/LLM & Automation: No uploading of Confidential Information to external AI/LLM or automation 
        services unless the service is expressly approved as a Designated System and bound by terms that 
        prohibit training on the data and ensure confidentiality and deletion on demand.
        
        5. Term; Survival
        5.1 Term: This Agreement begins on the Effective Date for each Participant and continues until 
        terminated as to that Participant on 10 days' written notice to AliceSolutions.
        
        5.2 Survival Period: Recipient's duties survive for five (5) years from the Recipient's last access 
        to the relevant Confidential Information; trade secrets survive as long as they remain trade secrets.
        
        By signing this agreement, you acknowledge the sensitive nature of the information and agree to maintain its confidentiality.
      `
    },
    {
      id: 'inventions-ip',
      title: 'Inventions & Intellectual Property',
      description: 'IP ownership and assignment terms',
      required: true,
      icon: '💡',
      content: `
        INVENTIONS & INTELLECTUAL PROPERTY AGREEMENT
        
        This agreement governs the ownership and assignment of intellectual property created through platform use.
        
        INTELLECTUAL PROPERTY RIGHTS:
        
        1. BACKGROUND IP
        - You retain ownership of intellectual property you owned before using the platform
        - You may use your Background IP in connection with platform activities
        - You represent that you have the right to use your Background IP
        
        2. FOREGROUND IP
        - Intellectual property created through platform use is governed by project-specific agreements
        - Default ownership depends on the nature of the contribution
        - Specific terms are outlined in individual project NDAs
        
        3. PLATFORM IP
        - We retain all rights to the platform, including software, algorithms, and processes
        - You may not reverse engineer or attempt to extract platform IP
        - Any improvements to the platform become our property
        
        4. OPEN SOURCE COMPLIANCE
        - You must comply with all applicable open source licenses
        - You must disclose any open source components in your contributions
        - You may not incorporate GPL-licensed code without proper disclosure
        
        5. ASSIGNMENT
        - For work-for-hire projects, IP is assigned to the project owner
        - For collaborative projects, IP is shared according to contribution agreements
        - You grant necessary licenses for platform operation
        
        6. MORAL RIGHTS
        - You waive moral rights to the extent permitted by law
        - You consent to modifications of your contributions
        - You agree not to assert moral rights against us or other users
        
        By signing this agreement, you understand the IP framework and agree to its terms.
      `
    },
    {
      id: 'per-project-nda',
      title: 'Per-Project NDA Addendum (Security-Tiered)',
      description: 'Project-specific confidentiality and security controls',
      required: true,
      icon: '📄',
      content: `
        Per-Project NDA Addendum (Security-Tiered)
        AliceSolutions Ventures Inc. — Project-Level Addendum to Mutual NDA
        
        Project Name / ID: [To be specified per project]
        Effective Date: [To be specified per project]
        Parties Covered: AliceSolutions; all Participants bound by the Platform NDA and PPA who are approved for this Project.
        
        1) Purpose & Scope
        This Addendum sets project-specific confidentiality, security, and handling rules based on the Project's Security Tier. 
        It defines Designated Systems, Permitted Tools, Access Grants, Data Classes, and Exit duties. No access to 
        non-public project materials is permitted until this Addendum is signed.
        
        2) Data Classification & Security Tiers
        Choose the highest tier that applies to any data a Participant will access:
        
        Tier 0 — Public: Non-confidential, intentionally public content (marketing, open docs)
        Tier 1 — Confidential (Internal): Non-public business information (plans, drafts, non-sensitive code, non-identifiable logs)
        Tier 2 — Restricted (Sensitive Commercial): Trade secrets, customer lists, financials, security architecture, credentials, production code, or personal information where present
        Tier 3 — Highly Restricted (Critical/Regulated): Crown-jewel IP, unlaunched product code/keys, acquisitions, large-scale personal information, or personal health information (PHI)
        
        3) Designated Systems & Permitted Tools
        3.1 Designated Systems (authoritative list):
        - Repos: [To be specified per project]
        - Docs/Vault: [To be specified per project]
        - Tickets: [To be specified per project]
        - CI/CD: [To be specified per project]
        - Secrets Manager: [To be specified per project]
        - Data Stores: [To be specified per project]
        
        3.2 Permitted Tools/Integrations: Must be explicitly named and approved
        
        4) Access Provisioning & RBAC
        4.1 Least-Privilege Grants: Access is role-based and limited to minimum necessary repositories, environments, and datasets
        4.2 Expiry & Review:
        - Tier 1: expiry ≤ 90 days; review every 90 days
        - Tier 2: expiry ≤ 60 days; review every 60 days
        - Tier 3: expiry ≤ 30 days; review every 30 days
        
        5) Endpoint, Identity & Network Controls
        5.1 Identity: MFA required on all accounts; hardware security keys (FIDO2) required for Tier 3
        5.2 Devices: Requirements vary by tier from basic encryption to managed devices only
        5.3 Network: VPN requirements and geo-restrictions based on tier
        5.4 Session Hygiene: Auto-logout after inactivity (≤ 15 min Tier 2, ≤ 10 min Tier 3)
        
        6) Data Handling, Storage & DLP
        6.1 Storage Locations: Confidential/Restricted data must reside only in Designated Systems
        6.2 Local Copies: Restrictions vary by tier from allowed if encrypted to forbidden
        6.3 Printing/Export: From discouraged to forbidden based on tier
        6.4 DLP & Watermarking: Do not remove/alter watermarks, disable copy/paste guards, or bypass download restrictions
        
        7) AI/LLM & Automation Policy
        Default: No uploading or deriving prompts from Confidential/Restricted data to external AI/LLM tools.
        If Approved: Provider must contractually prohibit training on our data, ensure confidentiality, disable cross-tenant reuse, support deletion and data export, and provide audit logs.
        
        8) Incident Response & Breach Notice
        Report within 24 hours: suspected loss, unauthorized access, malware, misdirected email/share, or credentials compromise.
        Include scope, timeline, impacted systems/data, mitigations taken, and support needed.
        
        9) Return, Deletion & Exit Attestation
        On request or exit, stop use; return or securely delete all Confidential Information (including derivatives) not held in Designated Systems.
        Provide Attestation of Return/Deletion within 7 days.
        Duties of confidentiality/non-exfiltration survive for the period stated in the Platform NDA (typically 5 years from last access).
        
        By signing this Addendum, the Participant agrees to comply with project-specific security and confidentiality requirements.
      `
    }
  ]

  // Load legal pack status on component mount
  useEffect(() => {
    const loadLegalPackStatus = async () => {
      try {
        const response = await apiService.getLegalPackStatus()
        if (response.success) {
          setLegalPackStatus(response.data)
          
          // Check which documents are already signed
          const signed = new Set<string>()
          if (response.data.legalPack?.status === 'SIGNED') {
            signed.add('platform-participation')
          }
          if (response.data.nda?.status === 'SIGNED') {
            signed.add('platform-nda')
          }
          if (response.data.consents?.length > 0) {
            signed.add('inventions-ip')
            signed.add('per-project-nda')
          }
          setSignedDocs(signed)
        }
      } catch (error) {
        console.error('Failed to load legal pack status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLegalPackStatus()
  }, [])

  const handleSignature = async (docId: string) => {
    if (!userSignature.trim()) {
      alert('Please provide your signature')
      return
    }

    setIsSigning(true)
    
    try {
      let response
      
      // Call appropriate API based on document type
      switch (docId) {
        case 'platform-participation':
          response = await apiService.signLegalPack()
          break
        case 'platform-nda':
          response = await apiService.signNDA()
          break
        case 'inventions-ip':
        case 'per-project-nda':
          response = await apiService.grantConsent('PLATFORM_TERMS')
          break
        default:
          throw new Error('Unknown document type')
      }

      if (response.success) {
        setSignedDocs(prev => new Set([...prev, docId]))
        setUserSignature('')
        
        // Move to next document if not all are signed
        if (currentDoc < legalDocuments.length - 1) {
          setCurrentDoc(currentDoc + 1)
        } else {
          // All documents signed, complete the stage and proceed to subscription
          await apiService.updateJourneyState('stage_3', 'COMPLETED')
          router.push('/venture-gate/plans')
        }
      } else {
        alert(`Failed to sign document: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error signing document:', error)
      alert(`Failed to sign document: ${error.message}`)
    } finally {
      setIsSigning(false)
    }
  }

  // Check if all documents are signed
  const allDocumentsSigned = signedDocs.size === legalDocuments.length

  // If all documents are signed, show completion message
  if (allDocumentsSigned && !isLoading) {
    return (
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Legal Pack Complete!</h1>
          <p className="text-secondary mb-6">
            All required legal documents have been signed and recorded.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/venture-gate/plans')}
          >
            Continue to Subscription Selection
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="text-3xl mb-4">⏳</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Loading Legal Pack...</h1>
          <p className="text-secondary">Checking your legal document status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
      {/* Compact Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-3xl">📋</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Platform Legal Pack</h1>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Review and sign the required legal documents</p>
          </div>
        </div>
        <div className="mt-2">
          <span className="status status-warning text-xs">
            {signedDocs.size} of {legalDocuments.length} documents signed
          </span>
        </div>
      </div>

      {/* Compact Progress */}
      <div className="card mb-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-3">Document Progress</h3>
          <div className="progress mb-3" style={{ height: '6px' }}>
            <div 
              className="progress-bar" 
              style={{ width: `${(signedDocs.size / legalDocuments.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>{signedDocs.size} of {legalDocuments.length} completed</span>
            <span>{Math.round((signedDocs.size / legalDocuments.length) * 100)}% Complete</span>
          </div>
        </div>
      </div>

      {/* Compact Document List */}
      <div className="grid grid-2 gap-3 mb-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {legalDocuments.map((doc, index) => (
          <div
            key={doc.id}
            className={`card ${index === currentDoc ? 'border-accent' : ''} ${
              signedDocs.has(doc.id) ? 'opacity-60' : ''
            }`}
            style={{
              borderColor: index === currentDoc ? 'var(--accent-primary)' : undefined,
              cursor: 'pointer'
            }}
            onClick={() => setCurrentDoc(index)}
          >
            <div className="p-3">
              <div className="flex items-start gap-3">
                <div className="text-xl">{doc.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold">{doc.title}</h4>
                    {signedDocs.has(doc.id) ? (
                      <span className="status status-success text-xs">✓ Signed</span>
                    ) : (
                      <span className="status status-danger text-xs">⏳ Pending</span>
                    )}
                  </div>
                  <p className="text-secondary text-xs mb-1">{doc.description}</p>
                  {doc.required && (
                    <span className="status status-warning text-xs">Required</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Document - Compact */}
      <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">{legalDocuments[currentDoc].icon} {legalDocuments[currentDoc].title}</h3>
          <p className="text-muted text-sm mb-4">{legalDocuments[currentDoc].description}</p>

        {!signedDocs.has(legalDocuments[currentDoc].id) ? (
          <div>
            {/* Document Content */}
            <div 
              className="mb-6 p-6"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                maxHeight: '400px',
                overflowY: 'auto',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}
            >
              {legalDocuments[currentDoc].content}
            </div>

            {/* Signature Section */}
            <div className="mb-6">
              <h4 className="mb-3">Digital Signature</h4>
              <div className="form-group">
                <label className="form-label">Full Name (as signature)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name to sign this document"
                  value={userSignature}
                  onChange={(e) => setUserSignature(e.target.value)}
                />
              </div>
            </div>

            {/* Sign Button */}
            <div className="flex gap-4">
              <button
                className="btn btn-primary"
                onClick={() => handleSignature(legalDocuments[currentDoc].id)}
                disabled={isSigning || !userSignature.trim()}
              >
                {isSigning ? 'Signing...' : 'Sign Document'}
              </button>
              {currentDoc > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentDoc(currentDoc - 1)}
                >
                  Previous Document
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3>Document Signed</h3>
            <p className="text-secondary mb-6">
              This document has been successfully signed and recorded.
            </p>
            <div className="flex gap-4 justify-center">
              {currentDoc < legalDocuments.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentDoc(currentDoc + 1)}
                >
                  Next Document
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => router.push('/venture-gate/plans')}
                >
                  Continue to Subscription Selection
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Legal Notice */}
      <div className="card mt-8 animate-fade-in">
        <div className="text-center">
          <h3>⚖️ Legal Notice</h3>
          <p className="text-muted mb-4">
            These documents are legally binding. Please review them carefully before signing.
          </p>
          <div className="grid grid-3 gap-4 text-sm">
            <div>
              <div className="text-accent-primary mb-1">📋</div>
              <div>Legally Binding</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">🔒</div>
              <div>Secure Storage</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">📊</div>
              <div>Audit Trail</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformLegal
