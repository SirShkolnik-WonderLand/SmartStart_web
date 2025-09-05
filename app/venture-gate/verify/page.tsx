'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../../services/api'

interface KycForm {
  fullName: string
  dateOfBirth: string
  country: string
  phoneNumber: string
}

const VerifyAndSecurePage = () => {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [kycForm, setKycForm] = useState<KycForm>({ fullName: '', dateOfBirth: '', country: '', phoneNumber: '' })
  const [govIdFile, setGovIdFile] = useState<File | null>(null)
  const [poaFile, setPoaFile] = useState<File | null>(null)
  const [kycSubmitting, setKycSubmitting] = useState(false)
  const [kycStatus, setKycStatus] = useState<any>(null)
  const [mfaSetup, setMfaSetup] = useState<any>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      const uid = typeof window !== 'undefined' ? localStorage.getItem('user-id') : null
      setUserId(uid)
      
      if (uid) {
        try {
          // Check if MFA is already set up
          const existingMfa = await apiService.getMfaStatus(uid)
          if (existingMfa?.success && existingMfa?.mfa) {
            setMfaSetup(existingMfa.mfa)
          }
        } catch (err) {
          console.log('No existing MFA setup found')
        }
      }
      
      setIsLoading(false)
    }
    
    loadUserData()
  }, [])

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    
    // Validate form data
    if (!kycForm.fullName || kycForm.fullName.length < 2) {
      setError('Please enter a valid full name (at least 2 characters)')
      return
    }
    if (!kycForm.dateOfBirth) {
      setError('Please enter your date of birth')
      return
    }
    if (!kycForm.country || kycForm.country.length < 2) {
      setError('Please enter a valid country name')
      return
    }
    if (!kycForm.phoneNumber || kycForm.phoneNumber.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)')
      return
    }
    
    // Check for placeholder/invalid data
    if (kycForm.fullName === '123' || kycForm.country === '123' || kycForm.phoneNumber === '123') {
      setError('Please enter real information, not placeholder data')
      return
    }
    
    try {
      setError(null)
      setKycSubmitting(true)
      await apiService.submitKycInfo({ userId, ...kycForm })
      // Upload documents if present
      if (govIdFile) {
        await apiService.uploadKycDocument(govIdFile, 'GOVERNMENT_ID', userId)
      }
      if (poaFile) {
        await apiService.uploadKycDocument(poaFile, 'PROOF_OF_ADDRESS', userId)
      }
      const status = await apiService.getKycStatus(userId)
      setKycStatus(status)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit KYC')
    } finally {
      setKycSubmitting(false)
    }
  }

  const handleSetupMfa = async () => {
    if (!userId) return
    try {
      setError(null)
      
      // First check if MFA is already set up
      const existingMfa = await apiService.getMfaStatus(userId)
      if (existingMfa?.success && existingMfa?.mfa) {
        setMfaSetup(existingMfa.mfa)
        return
      }
      
      // If not set up, create new MFA
      const setup = await apiService.setupMfa(userId, 'AUTHENTICATOR')
      setMfaSetup(setup?.mfa || setup)
    } catch (err: any) {
      // If MFA already exists, try to get the existing setup
      if (err?.message?.includes('already setup')) {
        try {
          const existingMfa = await apiService.getMfaStatus(userId)
          if (existingMfa?.success && existingMfa?.mfa) {
            setMfaSetup(existingMfa.mfa)
            return
          }
        } catch (statusErr) {
          console.error('Error fetching existing MFA:', statusErr)
        }
      }
      setError(err?.message || 'Failed to setup MFA')
    }
  }

  const handleActivateMfa = async () => {
    if (!userId || !mfaCode) return
    try {
      setError(null)
      const verified = await apiService.activateMfa(userId, mfaCode)
      if (verified?.success) {
        // Proceed to next step (plans)
        router.push('/venture-gate/plans')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to activate MFA')
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <h1>Loading Verify & Secure...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
      {/* Compact Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-3xl">🔐</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Verify & Secure</h1>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Complete KYC and enable MFA to continue</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-4" style={{ borderColor: 'var(--accent-danger)', maxWidth: '600px', margin: '0 auto' }}>
          <div className="text-danger text-sm p-3">{error}</div>
        </div>
      )}

      <div className="grid grid-2 gap-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* KYC Section - Compact */}
        <div className="card">
          <div className="card-header p-3">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Identity Verification</h3>
            <p className="text-muted text-sm">Provide your details and upload documents</p>
          </div>
          <div className="p-3">
            <form onSubmit={handleSubmitKyc} className="grid grid-2 gap-3">
              <div className="form-group">
                <label className="form-label text-sm">Full Name</label>
                <input className="form-input" value={kycForm.fullName} onChange={e => setKycForm({ ...kycForm, fullName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Date of Birth</label>
                <input type="date" className="form-input" value={kycForm.dateOfBirth} onChange={e => setKycForm({ ...kycForm, dateOfBirth: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Country</label>
                <input className="form-input" value={kycForm.country} onChange={e => setKycForm({ ...kycForm, country: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Phone Number</label>
                <input className="form-input" value={kycForm.phoneNumber} onChange={e => setKycForm({ ...kycForm, phoneNumber: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label text-sm">Government ID</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setGovIdFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Proof of Address</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setPoaFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>

              <div className="col-span-2">
                <button className="btn btn-primary w-full" type="submit" disabled={kycSubmitting || !userId}>
                  {kycSubmitting ? 'Submitting…' : 'Submit KYC'}
                </button>
              </div>
            </form>

            {kycStatus && (
              <div className="mt-3 p-2 rounded text-sm" style={{ background: 'var(--bg-secondary)' }}>
                <div className="text-muted">Status: <span className="font-medium">{kycStatus?.kyc?.overallStatus || 'PENDING'}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* MFA Section - Compact */}
        <div className="card">
          <div className="card-header p-3">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Multi-Factor Authentication</h3>
            <p className="text-muted text-sm">Protect your account with an authenticator app</p>
          </div>
          <div className="p-3">
            {!mfaSetup && (
              <button className="btn btn-secondary w-full" onClick={handleSetupMfa} disabled={!userId}>
                Setup Authenticator App
              </button>
            )}

            {mfaSetup && (
              <div>
                {mfaSetup.isActive ? (
                  <div className="text-center">
                    <div className="text-green-400 text-lg mb-2">✅ MFA Active</div>
                    <div className="text-sm text-muted mb-4">Your account is protected</div>
                    <button className="btn btn-primary w-full" onClick={() => router.push('/venture-gate/plans')}>
                      Continue to Next Step
                    </button>
                  </div>
                ) : (
                  <div>
                    {mfaSetup.qrCodeUrl && (
                      <div className="mb-4 text-center">
                        <div className="text-sm mb-2">Scan with your authenticator app:</div>
                        <img src={mfaSetup.qrCodeUrl} alt="MFA QR" style={{ width: 150, height: 150, margin: '0 auto' }} />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label text-sm">Enter 6-digit code</label>
                      <input className="form-input" value={mfaCode} onChange={e => setMfaCode(e.target.value)} placeholder="123456" />
                    </div>
                    <button className="btn btn-primary w-full" onClick={handleActivateMfa} disabled={!mfaCode}>
                      Activate MFA
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyAndSecurePage
