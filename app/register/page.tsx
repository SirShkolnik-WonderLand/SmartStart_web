'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'

type Step = 'account' | 'agreements' | 'finish'

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('account')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreeTos, setAgreeTos] = useState(false)
  const [agreeContributor, setAgreeContributor] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tos, setTos] = useState<string>('Loading Terms of Service...')
  const [contrib, setContrib] = useState<string>('Loading Contributor Agreement...')
  const router = useRouter()

  useEffect(() => {
    if (step === 'agreements') {
      // Try to load templates if available; otherwise show placeholders
      fetch(`${API_BASE}/api/documents/templates?code=USER_TOS`).then(r=>r.ok?r.text():Promise.resolve('SmartStart Terms of Service (summary):\n- Respect, Privacy, Security\n- No abuse or fraud\n- Data usage per policy')).then(setTos).catch(()=>{})
      fetch(`${API_BASE}/api/documents/templates?code=CONTRIB_AGREEMENT`).then(r=>r.ok?r.text():Promise.resolve('Contributor Agreement (summary):\n- You own your IP until assigned\n- Licenses and attributions\n- Compliance and confidentiality')).then(setContrib).catch(()=>{})
    }
  }, [step])

  const nextFromAccount = () => {
    setError('')
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return setError('Username 3-24: letters, numbers, _.-')
    setStep('agreements')
  }

  const submit = async () => {
    setError('')
    if (!agreeTos || !agreeContributor) return setError('You must agree to all terms to continue')
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      if (!res.ok) throw new Error('Registration failed')
      router.push('/')
    } catch (e:any) {
      setError(e.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 crt">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold glow">🧾 Create Your SmartStart Account</h1>
          <p className="text-green-300 text-sm help-hint">Terminal-style secure onboarding</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">
          <div className={`p-3 rounded neon-border ${step==='account'?'neon-border-strong':''}`}>1) Account</div>
          <div className={`p-3 rounded neon-border ${step==='agreements'?'neon-border-strong':''}`}>2) Agreements</div>
          <div className={`p-3 rounded neon-border ${step==='finish'?'neon-border-strong':''}`}>3) Finish</div>
        </div>

        {step==='account' && (
          <div className="bg-gray-900 neon-border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">USERNAME</label>
                <input className="w-full cli-input px-3 py-2 rounded" value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. admin" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">EMAIL</label>
                <input type="email" className="w-full cli-input px-3 py-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">PASSWORD</label>
                <input type="password" className="w-full cli-input px-3 py-2 rounded" value={password} onChange={e=>setPassword(e.target.value)} placeholder="min 8 chars" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">CONFIRM PASSWORD</label>
                <input type="password" className="w-full cli-input px-3 py-2 rounded" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="repeat password" />
              </div>
            </div>
            {error && <div className="mt-4 p-3 rounded border border-red-400 text-red-300">❌ {error}</div>}
            <div className="mt-6 flex justify-between">
              <button onClick={()=>router.push('/')} className="cli-btn px-4 py-2 rounded">← Back</button>
              <button onClick={nextFromAccount} className="cli-btn px-4 py-2 rounded">Next →</button>
            </div>
          </div>
        )}

        {step==='agreements' && (
          <div className="bg-gray-900 neon-border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-bold text-green-400 mb-2">📜 Terms of Service</h3>
              <div className="bg-black rounded p-3 neon-border h-40 overflow-auto text-green-300 whitespace-pre-wrap text-sm">{tos}</div>
              <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={agreeTos} onChange={e=>setAgreeTos(e.target.checked)} /> I agree to the Terms of Service</label>
            </div>
            <div>
              <h3 className="font-bold text-green-400 mb-2">🧾 Contributor Agreement</h3>
              <div className="bg-black rounded p-3 neon-border h-40 overflow-auto text-green-300 whitespace-pre-wrap text-sm">{contrib}</div>
              <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={agreeContributor} onChange={e=>setAgreeContributor(e.target.checked)} /> I agree to the Contributor Agreement</label>
            </div>
            {error && <div className="p-3 rounded border border-red-400 text-red-300">❌ {error}</div>}
            <div className="flex justify-between">
              <button onClick={()=>setStep('account')} className="cli-btn px-4 py-2 rounded">← Back</button>
              <button onClick={()=>setStep('finish')} disabled={!agreeTos || !agreeContributor} className="cli-btn px-4 py-2 rounded">Continue →</button>
            </div>
          </div>
        )}

        {step==='finish' && (
          <div className="bg-gray-900 neon-border rounded-lg p-6">
            <h3 className="font-bold text-green-400 mb-3">🔐 Finalize Registration</h3>
            <p className="text-green-300 text-sm help-hint mb-4">Optional 2FA can be enabled later in settings. You can proceed to create your account now.</p>
            {error && <div className="p-3 rounded border border-red-400 text-red-300 mb-3">❌ {error}</div>}
            <div className="flex justify-between">
              <button onClick={()=>setStep('agreements')} className="cli-btn px-4 py-2 rounded">← Back</button>
              <button onClick={submit} disabled={isLoading} className="cli-btn px-4 py-2 rounded">{isLoading?'Creating...':'Create Account'} →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
