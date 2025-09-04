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
    const uid = typeof window !== 'undefined' ? localStorage.getItem('user-id') : null
    setUserId(uid)
    setIsLoading(false)
  }, [])

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
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
      const setup = await apiService.setupMfa(userId, 'AUTHENTICATOR')
      setMfaSetup(setup?.mfa || setup)
    } catch (err: any) {
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
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="text-center mb-8">
        <h1>Verify & Secure</h1>
        <p className="text-secondary">Complete KYC and enable MFA to continue</p>
      </div>

      {error && (
        <div className="card mb-6" style={{ borderColor: 'var(--accent-danger)' }}>
          <div className="text-danger">{error}</div>
        </div>
      )}

      <div className="grid grid-2 gap-6">
        {/* KYC Section */}
        <div className="card">
          <div className="card-header">
            <h3>Identity Verification (KYC)</h3>
            <p className="text-muted">Provide your details and upload documents</p>
          </div>
          <form onSubmit={handleSubmitKyc} className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={kycForm.fullName} onChange={e => setKycForm({ ...kycForm, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" value={kycForm.dateOfBirth} onChange={e => setKycForm({ ...kycForm, dateOfBirth: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input className="form-input" value={kycForm.country} onChange={e => setKycForm({ ...kycForm, country: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={kycForm.phoneNumber} onChange={e => setKycForm({ ...kycForm, phoneNumber: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Government ID (PDF/PNG/JPG)</label>
              <input type="file" accept=".pdf,image/*" onChange={e => setGovIdFile(e.target.files?.[0] || null)} />
            </div>
            <div className="form-group">
              <label className="form-label">Proof of Address (PDF/PNG/JPG)</label>
              <input type="file" accept=".pdf,image/*" onChange={e => setPoaFile(e.target.files?.[0] || null)} />
            </div>

            <div className="col-span-2">
              <button className="btn btn-primary" type="submit" disabled={kycSubmitting || !userId}>
                {kycSubmitting ? 'Submitting…' : 'Submit KYC'}
              </button>
            </div>
          </form>

          {kycStatus && (
            <div className="mt-4 text-sm text-muted">
              <div>Overall Status: {kycStatus?.kyc?.overallStatus || 'PENDING'}</div>
            </div>
          )}
        </div>

        {/* MFA Section */}
        <div className="card">
          <div className="card-header">
            <h3>Multi-Factor Authentication (MFA)</h3>
            <p className="text-muted">Protect your account with an authenticator app</p>
          </div>

          {!mfaSetup && (
            <button className="btn btn-secondary" onClick={handleSetupMfa} disabled={!userId}>
              Setup Authenticator App
            </button>
          )}

          {mfaSetup && (
            <div className="mt-4">
              {mfaSetup.qrCodeUrl && (
                <div className="mb-4">
                  <div className="text-sm mb-2">Scan this QR in Google Authenticator / 1Password:</div>
                  <img src={mfaSetup.qrCodeUrl} alt="MFA QR" style={{ width: 180, height: 180 }} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Enter 6-digit code</label>
                <input className="form-input" value={mfaCode} onChange={e => setMfaCode(e.target.value)} placeholder="123456" />
              </div>
              <button className="btn btn-primary" onClick={handleActivateMfa} disabled={!mfaCode}>
                Activate MFA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyAndSecurePage
