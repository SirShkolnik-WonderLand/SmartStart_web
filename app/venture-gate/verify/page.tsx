'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const VerifySecure = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [kycCompleted, setKycCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    {
      id: 1,
      title: 'Email Verification',
      description: 'Verify your email address to secure your account',
      icon: '📧'
    },
    {
      id: 2,
      title: 'Multi-Factor Authentication',
      description: 'Enable MFA for enhanced security',
      icon: '🔐'
    },
    {
      id: 3,
      title: 'Identity Verification',
      description: 'Complete KYC for full platform access',
      icon: '🆔'
    }
  ]

  const handleEmailVerification = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setEmailVerified(true)
      setIsLoading(false)
      setStep(2)
    }, 2000)
  }

  const handleMfaSetup = async () => {
    setIsLoading(true)
    // Simulate MFA setup
    setTimeout(() => {
      setMfaEnabled(true)
      setIsLoading(false)
      setStep(3)
    }, 2000)
  }

  const handleKycCompletion = async () => {
    setIsLoading(true)
    // Simulate KYC process
    setTimeout(() => {
      setKycCompleted(true)
      setIsLoading(false)
      // Navigate to next stage
      router.push('/venture-gate/plans')
    }, 2000)
  }

  const getStepStatus = (stepId: number) => {
    if (stepId < step) return 'completed'
    if (stepId === step) return 'current'
    return 'pending'
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>Verify & Secure</h1>
        <p className="text-secondary">
          Complete your security setup to unlock platform features
        </p>
      </div>

      {/* Progress Steps */}
      <div className="card mb-8 animate-slide-in">
        <div className="card-header">
          <h3>Security Setup Progress</h3>
          <p className="text-muted">
            Complete all steps to proceed to the next stage
          </p>
        </div>
        
        <div className="grid grid-3 gap-6">
          {steps.map((stepItem) => {
            const status = getStepStatus(stepItem.id)
            return (
              <div
                key={stepItem.id}
                className={`card ${status === 'current' ? 'border-accent' : ''}`}
                style={{
                  opacity: status === 'pending' ? 0.6 : 1,
                  borderColor: status === 'current' ? 'var(--accent-primary)' : undefined
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{stepItem.icon}</div>
                  <h4 className="card-title">{stepItem.title}</h4>
                  <p className="text-secondary mb-4">{stepItem.description}</p>
                  
                  <div className="mb-4">
                    <span className={`status ${
                      status === 'completed' ? 'status-success' :
                      status === 'current' ? 'status-info' :
                      'status-danger'
                    }`}>
                      {status === 'completed' ? '✓ Completed' :
                       status === 'current' ? '→ Current' :
                       '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="card animate-fade-in">
        {step === 1 && (
          <div>
            <div className="card-header">
              <h3>📧 Email Verification</h3>
              <p className="text-muted">
                We've sent a verification link to your email address
              </p>
            </div>
            
            <div className="mb-6">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value="udi.shkolnik@smartstart.com"
                  readOnly
                />
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">What happens next?</h4>
              <ul className="text-secondary">
                <li className="mb-2">• Check your email inbox (and spam folder)</li>
                <li className="mb-2">• Click the verification link in the email</li>
                <li className="mb-2">• Return here to continue setup</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                className="btn btn-primary"
                onClick={handleEmailVerification}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'I\'ve Verified My Email'}
              </button>
              <button className="btn btn-secondary">
                Resend Verification Email
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="card-header">
              <h3>🔐 Multi-Factor Authentication</h3>
              <p className="text-muted">
                Enable MFA to protect your account with an additional security layer
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="mb-3">Choose your MFA method:</h4>
              <div className="grid grid-2 gap-4">
                <div className="card">
                  <div className="text-center">
                    <div className="text-3xl mb-3">📱</div>
                    <h4>Authenticator App</h4>
                    <p className="text-secondary text-sm mb-4">
                      Use Google Authenticator, Authy, or similar
                    </p>
                    <button className="btn btn-primary w-full">
                      Setup Authenticator
                    </button>
                  </div>
                </div>
                
                <div className="card">
                  <div className="text-center">
                    <div className="text-3xl mb-3">📧</div>
                    <h4>Email Codes</h4>
                    <p className="text-secondary text-sm mb-4">
                      Receive verification codes via email
                    </p>
                    <button className="btn btn-secondary w-full">
                      Setup Email MFA
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">Security Benefits:</h4>
              <ul className="text-secondary">
                <li className="mb-2">• Protection against password breaches</li>
                <li className="mb-2">• Required for accessing sensitive project data</li>
                <li className="mb-2">• Compliance with platform security policies</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                className="btn btn-primary"
                onClick={handleMfaSetup}
                disabled={isLoading}
              >
                {isLoading ? 'Setting up MFA...' : 'Continue with MFA Setup'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="card-header">
              <h3>🆔 Identity Verification (KYC)</h3>
              <p className="text-muted">
                Complete identity verification for full platform access and potential payouts
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="mb-3">Required Information:</h4>
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Country of Residence</label>
                  <select className="form-input">
                    <option>Select Country</option>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" placeholder="+1 (555) 123-4567" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3">Document Upload:</h4>
              <div className="grid grid-2 gap-4">
                <div className="card">
                  <div className="text-center">
                    <div className="text-3xl mb-3">🆔</div>
                    <h4>Government ID</h4>
                    <p className="text-secondary text-sm mb-4">
                      Driver's license, passport, or national ID
                    </p>
                    <button className="btn btn-secondary w-full">
                      Upload ID
                    </button>
                  </div>
                </div>
                
                <div className="card">
                  <div className="text-center">
                    <div className="text-3xl mb-3">🏠</div>
                    <h4>Proof of Address</h4>
                    <p className="text-secondary text-sm mb-4">
                      Utility bill, bank statement, or lease
                    </p>
                    <button className="btn btn-secondary w-full">
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="card" style={{ background: 'rgba(0, 170, 255, 0.1)', border: '1px solid var(--accent-info)' }}>
                <h4 className="mb-3" style={{ color: 'var(--accent-info)' }}>Privacy & Security</h4>
                <ul className="text-secondary text-sm">
                  <li className="mb-2">• All documents are encrypted and stored securely</li>
                  <li className="mb-2">• Information is only used for identity verification</li>
                  <li className="mb-2">• Documents are deleted after verification is complete</li>
                  <li className="mb-2">• We comply with GDPR and other privacy regulations</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                className="btn btn-primary"
                onClick={handleKycCompletion}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Complete Verification'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setStep(2)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="card mt-8 animate-fade-in">
        <div className="text-center">
          <h3>🛡️ Security First</h3>
          <p className="text-muted mb-4">
            Your security is our priority. All verification steps are designed to protect both you and the platform.
          </p>
          <div className="grid grid-3 gap-4 text-sm">
            <div>
              <div className="text-accent-primary mb-1">🔒</div>
              <div>End-to-End Encryption</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">🔐</div>
              <div>Zero-Knowledge Architecture</div>
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

export default VerifySecure
