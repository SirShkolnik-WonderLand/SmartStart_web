'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com'

type Step = 'account' | 'agreements' | 'finish'

type TemplateRef = { id: string; code: string; title?: string }

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('account')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreeTos, setAgreeTos] = useState(false)
  const [agreeContributor, setAgreeContributor] = useState(false)
  const [tosUnlocked, setTosUnlocked] = useState(false)
  const [contribUnlocked, setContribUnlocked] = useState(false)
  const [optOperationalEmails, setOptOperationalEmails] = useState<'opt_in' | 'opt_out'>('opt_in')
  const [optPublicListing, setOptPublicListing] = useState<'opt_in' | 'opt_out'>('opt_out')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tos, setTos] = useState<string>('Loading Terms of Service...')
  const [contrib, setContrib] = useState<string>('Loading Contributor Agreement...')
  const [tosTpl, setTosTpl] = useState<TemplateRef | null>(null)
  const [contribTpl, setContribTpl] = useState<TemplateRef | null>(null)
  const [tosDocId, setTosDocId] = useState<string | null>(null)
  const [contribDocId, setContribDocId] = useState<string | null>(null)
  const tosRef = useRef<HTMLDivElement>(null)
  const contribRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [csrf, setCsrf] = useState('')

  useEffect(() => {
    // fetch CSRF token to set cookie + hold token for double submit
    fetch(`${API_BASE}/api/auth/csrf`).then(r=>r.json()).then(d=>setCsrf(d?.csrf || '')).catch(()=>{})
  }, [])

  useEffect(() => {
    if (step === 'agreements') {
      const load = async () => {
        try {
          // Try to get TOS template by code
          const t = await fetch(`${API_BASE}/api/documents/templates?code=USER_TOS`)
          if (t.ok) {
            const data = await t.json().catch(()=>null)
            const item = Array.isArray(data) ? data[0] : (data?.template || data)
            if (item?.content) setTos(item.content)
            setTosTpl({ id: item?.id || 'USER_TOS', code: 'USER_TOS', title: item?.title })
          } else {
            setTos('SmartStart Terms of Service (summary)\n- Respect privacy & security\n- No abuse or fraud\n- Lawful use only\n- Data processed per policy')
          }
        } catch {}
        try {
          const c = await fetch(`${API_BASE}/api/documents/templates?code=CONTRIB_AGREEMENT`)
          if (c.ok) {
            const data = await c.json().catch(()=>null)
            const item = Array.isArray(data) ? data[0] : (data?.template || data)
            if (item?.content) setContrib(item.content)
            setContribTpl({ id: item?.id || 'CONTRIB_AGREEMENT', code: 'CONTRIB_AGREEMENT', title: item?.title })
          } else {
            setContrib('Contributor Agreement (summary)\n- IP assignment optional\n- Proper licenses & attributions\n- Confidentiality & compliance')
          }
        } catch {}
      }
      load()
    }
  }, [step])

  const onScrollUnlock = (el: HTMLDivElement | null, setter: (v:boolean)=>void) => {
    if (!el) return
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10
    if (nearBottom) setter(true)
  }

  const nextFromAccount = () => {
    setError('')
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return setError('Username 3-24: letters, numbers, _.-')
    setStep('agreements')
  }

  async function generateAndSign(code: 'USER_TOS' | 'CONTRIB_AGREEMENT', contentFallback: string) {
    // 1) generate document from template (or create ad-hoc if missing)
    const payload = { templateCode: code, data: { username, email, timestamp: new Date().toISOString() } }
    let genRes = await fetch(`${API_BASE}/api/documents/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!genRes.ok) {
      // If generation not supported, create a one-off document from provided content
      genRes = await fetch(`${API_BASE}/api/documents/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, content: contentFallback, data: payload.data }) })
    }
    const gen = await genRes.json().catch(()=>null)
    const documentId = gen?.documentId || gen?.id

    // 2) compute signature hash (content + user + timestamp)
    const content = gen?.content || contentFallback
    const signedAt = new Date().toISOString()
    const signatureHash = await sha256Hex([content, email, username, signedAt].join('|'))

    // 3) store signature server-side (server records IP)
    await fetch(`${API_BASE}/api/documents/sign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId, userIdentifier: email, signatureHash, signedAt, code, csrf }) })

    return { documentId, signatureHash, signedAt }
  }

  const submit = async () => {
    setError('')
    if (!agreeTos || !agreeContributor) return setError('You must agree to all terms to continue')
    setIsLoading(true)
    try {
      // Create and sign TOS + Contributor docs
      const tosRes = await generateAndSign('USER_TOS', tos)
      const contribRes = await generateAndSign('CONTRIB_AGREEMENT', contrib)
      setTosDocId(tosRes.documentId)
      setContribDocId(contribRes.documentId)

      // Finally create the account
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csrf,
          username,
          email,
          password,
          preferences: {
            operationalEmails: optOperationalEmails==='opt_in',
            publicListing: optPublicListing==='opt_in'
          },
          agreements: [
            { code: 'USER_TOS', ...tosRes },
            { code: 'CONTRIB_AGREEMENT', ...contribRes }
          ]
        })
      })
      const data = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(data?.error || data?.message || 'Registration failed')
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
              <a href="/" className="cli-btn px-4 py-2 rounded">← Back</a>
              <button onClick={nextFromAccount} className="cli-btn px-4 py-2 rounded">Next →</button>
            </div>
          </div>
        )}

        {step==='agreements' && (
          <div className="bg-gray-900 neon-border rounded-lg p-6 space-y-5">
            <div>
              <h3 className="font-bold text-green-400 mb-2">📜 Terms of Service</h3>
              <div ref={tosRef} onScroll={(e)=>onScrollUnlock(e.currentTarget as HTMLDivElement, setTosUnlocked)} className="bg-black rounded p-3 neon-border h-40 sm:h-52 overflow-auto text-green-300 whitespace-pre-wrap text-sm">{tos}\n\nPlatform rules:\n- Respect collaborators; no harassment\n- No illegal content or activity\n- Keep credentials and tokens secret\n- Report security issues responsibly\n- Follow contribution process & CLA\n- Data is processed per privacy policy</div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" disabled={!tosUnlocked} checked={agreeTos} onChange={e=>setAgreeTos(e.target.checked)} />
                I have read to the end and agree to the Terms of Service
              </label>
              {!tosUnlocked && <div className="text-xs help-hint mt-1">Scroll to the bottom to enable consent.</div>}
            </div>
            <div>
              <h3 className="font-bold text-green-400 mb-2">🧾 Contributor Agreement</h3>
              <div ref={contribRef} onScroll={(e)=>onScrollUnlock(e.currentTarget as HTMLDivElement, setContribUnlocked)} className="bg-black rounded p-3 neon-border h-40 sm:h-52 overflow-auto text-green-300 whitespace-pre-wrap text-sm">{contrib}\n\nHighlights:\n- You can opt in to assign created IP to ventures/projects\n- You retain moral rights where applicable\n- You confirm originality or proper licenses\n- You agree to confidentiality for private repos</div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" disabled={!contribUnlocked} checked={agreeContributor} onChange={e=>setAgreeContributor(e.target.checked)} />
                I have read to the end and agree to the Contributor Agreement
              </label>
              {!contribUnlocked && <div className="text-xs help-hint mt-1">Scroll to the bottom to enable consent.</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-black rounded neon-border">
                <div className="font-bold mb-2">✉️ Operational Emails</div>
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="emails" checked={optOperationalEmails==='opt_in'} onChange={()=>setOptOperationalEmails('opt_in')} /> Opt-in to receive verification, security, and critical service emails</label>
                <label className="flex items-center gap-2 text-sm mt-1"><input type="radio" name="emails" checked={optOperationalEmails==='opt_out'} onChange={()=>setOptOperationalEmails('opt_out')} /> Opt-out (may limit account recovery)</label>
              </div>
              <div className="p-3 bg-black rounded neon-border">
                <div className="font-bold mb-2">🪪 Public Profile Listing</div>
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="listing" checked={optPublicListing==='opt_in'} onChange={()=>setOptPublicListing('opt_in')} /> Opt-in to appear in public contributor listings</label>
                <label className="flex items-center gap-2 text-sm mt-1"><input type="radio" name="listing" checked={optPublicListing==='opt_out'} onChange={()=>setOptPublicListing('opt_out')} /> Opt-out (default)</label>
              </div>
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
