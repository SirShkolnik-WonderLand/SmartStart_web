'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Eye, 
  EyeOff,
  Smartphone,
  Key,
  QrCode
} from 'lucide-react'
import { apiService } from '@/lib/api'

interface TwoFactorSetupProps {
  onComplete?: () => void
  onCancel?: () => void
  className?: string
}

export default function TwoFactorSetup({ 
  onComplete, 
  onCancel, 
  className = '' 
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  useEffect(() => {
    if (step === 'setup') {
      generateSecret()
    }
  }, [step])

  const generateSecret = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call to generate 2FA secret
      // In real implementation, this would call the backend
      const mockSecret = 'JBSWY3DPEHPK3PXP'
      const mockQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
      const mockBackupCodes = [
        '12345678',
        '87654321',
        '11223344',
        '44332211',
        '55667788',
        '88776655',
        '99887766',
        '66778899'
      ]

      setSecret(mockSecret)
      setQrCode(mockQrCode)
      setBackupCodes(mockBackupCodes)
    } catch (error) {
      console.error('Error generating 2FA secret:', error)
      setError('Failed to generate 2FA setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate API call to verify 2FA code
      // In real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock verification - in real app, check if code is valid
      if (verificationCode === '123456') {
        setStep('complete')
        onComplete?.()
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error)
      setError('Failed to verify code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'smartstart-2fa-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (step === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white/95 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto shadow-lg border border-green-200 ${className}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">2FA Enabled Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your account is now protected with two-factor authentication.
          </p>
          <div className="space-y-3">
            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/95 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto shadow-lg border border-purple-200 ${className}`}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'setup' ? 'Set Up Two-Factor Authentication' : 'Verify Your Authenticator App'}
        </h2>
        <p className="text-gray-600">
          {step === 'setup' 
            ? 'Add an extra layer of security to your account'
            : 'Enter the 6-digit code from your authenticator app'
          }
        </p>
      </div>

      {step === 'setup' && (
        <div className="space-y-6">
          {/* Step 1: Download App */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Step 1: Download an Authenticator App
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              We recommend Google Authenticator, Authy, or Microsoft Authenticator.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Google Authenticator
              </a>
              <a
                href="https://authy.com/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Authy
              </a>
              <a
                href="https://www.microsoft.com/en-us/account/authenticator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Microsoft Authenticator
              </a>
            </div>
          </div>

          {/* Step 2: Scan QR Code */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Step 2: Scan QR Code
            </h3>
            <p className="text-green-700 text-sm mb-4">
              Open your authenticator app and scan this QR code:
            </p>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <img 
                  src={qrCode} 
                  alt="2FA QR Code" 
                  className="w-32 h-32"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Manual Entry */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Step 3: Manual Entry (Alternative)
            </h3>
            <p className="text-yellow-700 text-sm mb-3">
              If you can't scan the QR code, enter this secret key manually:
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-white border border-yellow-300 rounded px-3 py-2 text-sm font-mono">
                {showSecret ? secret : '••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2 text-yellow-600 hover:text-yellow-700"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(secret)}
                className="p-2 text-yellow-600 hover:text-yellow-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Backup Codes */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Backup Codes</h3>
            <p className="text-red-700 text-sm mb-3">
              Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
            </p>
            <div className="bg-white border border-red-300 rounded p-3 mb-3">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {showBackupCodes ? (
                  backupCodes.map((code, index) => (
                    <div key={index} className="p-1">{code}</div>
                  ))
                ) : (
                  Array(8).fill(0).map((_, index) => (
                    <div key={index} className="p-1">••••••••</div>
                  ))
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                {showBackupCodes ? 'Hide' : 'Show'} Codes
              </button>
              <button
                onClick={downloadBackupCodes}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep('verify')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
            >
              Continue to Verification
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enter Verification Code
            </h3>
            <p className="text-gray-600">
              Open your authenticator app and enter the 6-digit code for SmartStart
            </p>
          </div>

          <div className="max-w-xs mx-auto">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="flex items-center justify-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
            </button>
            <button
              onClick={() => setStep('setup')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
