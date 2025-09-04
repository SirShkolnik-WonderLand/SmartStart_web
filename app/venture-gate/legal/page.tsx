'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const legalDocuments: LegalDocument[] = [
    {
      id: 'platform-participation',
      title: 'Platform Participation Agreement',
      description: 'Core terms for using the SmartStart platform',
      required: true,
      icon: '📋',
      content: `
        PLATFORM PARTICIPATION AGREEMENT
        
        This Platform Participation Agreement ("Agreement") governs your use of the SmartStart platform operated by AliceSolutions Ventures.
        
        KEY TERMS:
        
        1. PLATFORM ACCESS
        - You may access and use the platform in accordance with your subscription tier
        - Access is granted on a non-exclusive, non-transferable basis
        - You are responsible for maintaining the security of your account
        
        2. ACCEPTABLE USE
        - Use the platform only for lawful purposes
        - Respect intellectual property rights of others
        - Do not attempt to circumvent security measures
        - Report any security vulnerabilities responsibly
        
        3. CONTENT AND DATA
        - You retain ownership of content you create
        - You grant us necessary licenses to operate the platform
        - We may use anonymized data to improve our services
        
        4. TERMINATION
        - Either party may terminate this agreement at any time
        - Upon termination, your access to the platform will cease
        - Certain obligations may survive termination
        
        5. LIMITATION OF LIABILITY
        - Our liability is limited to the amount you paid in the last 12 months
        - We are not liable for indirect or consequential damages
        
        By signing this agreement, you acknowledge that you have read, understood, and agree to be bound by these terms.
      `
    },
    {
      id: 'platform-nda',
      title: 'Platform Non-Disclosure Agreement',
      description: 'Confidentiality obligations for platform access',
      required: true,
      icon: '🔒',
      content: `
        PLATFORM NON-DISCLOSURE AGREEMENT
        
        This Non-Disclosure Agreement ("NDA") establishes confidentiality obligations for your use of the SmartStart platform.
        
        CONFIDENTIAL INFORMATION:
        
        1. DEFINITION
        Confidential Information includes all non-public information disclosed through the platform, including:
        - Technical specifications and documentation
        - Business strategies and plans
        - User data and analytics
        - Proprietary algorithms and processes
        - Any information marked as confidential
        
        2. OBLIGATIONS
        You agree to:
        - Maintain strict confidentiality of all Confidential Information
        - Use Confidential Information solely for platform-related activities
        - Not disclose Confidential Information to third parties
        - Implement reasonable security measures to protect Confidential Information
        
        3. EXCEPTIONS
        Confidential Information does not include information that:
        - Is publicly available through no breach of this agreement
        - Was known to you prior to disclosure
        - Is independently developed without use of Confidential Information
        - Is required to be disclosed by law
        
        4. DURATION
        - This NDA remains in effect for 5 years after your last access to the platform
        - Obligations survive termination of your account
        - Return or destroy all Confidential Information upon request
        
        5. REMEDIES
        - Breach of this NDA may result in immediate account termination
        - We may seek injunctive relief and damages
        - You agree that monetary damages may be insufficient
        
        By signing this NDA, you acknowledge the sensitive nature of the information and agree to maintain its confidentiality.
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
      id: 'non-circumvention',
      title: 'Non-Circumvention & Non-Solicitation',
      description: 'Protection against competitive activities',
      required: true,
      icon: '🚫',
      content: `
        NON-CIRCUMVENTION & NON-SOLICITATION AGREEMENT
        
        This agreement protects against competitive activities that could harm the platform ecosystem.
        
        RESTRICTIONS:
        
        1. NON-CIRCUMVENTION
        You agree not to:
        - Circumvent the platform to conduct business with other users
        - Use platform information to contact users outside the platform
        - Bypass platform fees or processes
        - Create competing platforms using platform data
        
        2. NON-SOLICITATION
        During your use of the platform and for 12 months after:
        - Do not solicit platform users for competing services
        - Do not recruit platform users for competing ventures
        - Do not use platform connections for non-platform business
        
        3. EXCEPTIONS
        These restrictions do not apply to:
        - Pre-existing relationships documented before platform use
        - Publicly available information
        - Relationships formed through other channels
        - General business networking not targeting platform users
        
        4. ENFORCEMENT
        - Violations may result in immediate account termination
        - We may seek injunctive relief and damages
        - You agree that these restrictions are reasonable and necessary
        
        5. SCOPE
        - Restrictions apply to you and any entities you control
        - Restrictions are limited to the geographic areas where we operate
        - Restrictions are limited to the business activities we engage in
        
        6. SURVIVAL
        - These restrictions survive termination of your account
        - Obligations continue for the specified time periods
        - Severability clause applies if any restriction is invalid
        
        By signing this agreement, you acknowledge the importance of protecting the platform ecosystem.
      `
    }
  ]

  const handleSignature = async (docId: string) => {
    if (!userSignature.trim()) {
      alert('Please provide your signature')
      return
    }

    setIsSigning(true)
    
    // Simulate signature process
    setTimeout(() => {
      setSignedDocs(prev => new Set([...prev, docId]))
      setIsSigning(false)
      setUserSignature('')
      
      // Move to next document if not all are signed
      if (currentDoc < legalDocuments.length - 1) {
        setCurrentDoc(currentDoc + 1)
      } else {
        // All documents signed, proceed to next stage
        router.push('/venture-gate/profile')
      }
    }, 2000)
  }

  const isAllSigned = signedDocs.size === legalDocuments.length

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>Platform Legal Pack</h1>
        <p className="text-secondary">
          Review and sign the required legal documents to access the platform
        </p>
        <div className="mt-4">
          <span className="status status-warning">
            {signedDocs.size} of {legalDocuments.length} documents signed
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="card mb-8 animate-slide-in">
        <div className="card-header">
          <h3>Document Progress</h3>
          <p className="text-muted">
            Complete all required documents to proceed
          </p>
        </div>
        <div className="progress mb-4">
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

      {/* Document List */}
      <div className="grid grid-2 gap-4 mb-8">
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
            <div className="flex items-start gap-4">
              <div className="text-3xl">{doc.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="card-title">{doc.title}</h4>
                  {signedDocs.has(doc.id) ? (
                    <span className="status status-success">✓ Signed</span>
                  ) : (
                    <span className="status status-danger">⏳ Pending</span>
                  )}
                </div>
                <p className="text-secondary text-sm">{doc.description}</p>
                {doc.required && (
                  <div className="mt-2">
                    <span className="status status-warning">Required</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Document */}
      <div className="card animate-fade-in">
        <div className="card-header">
          <h3>{legalDocuments[currentDoc].icon} {legalDocuments[currentDoc].title}</h3>
          <p className="text-muted">{legalDocuments[currentDoc].description}</p>
        </div>

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
                  onClick={() => router.push('/venture-gate/profile')}
                >
                  Continue to Profile Setup
                </button>
              )}
            </div>
          </div>
        )}
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
