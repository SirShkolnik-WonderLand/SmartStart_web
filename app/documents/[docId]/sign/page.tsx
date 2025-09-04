'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { apiService } from '@/app/services/api'

export default function SignDocument() {
  const params = useParams()
  const docId = params?.docId as string
  const [form, setForm] = useState<any>({})
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = async () => {
    try {
      setError('')
      const res = await apiService.post(`/documents/${docId}/sign`, form)
      setResult(res)
    } catch (e: any) {
      setError(e?.message || 'Failed to sign document')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sign Document</h1>
      <div className="space-y-3">
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Signer name" onChange={e=>update('signer_name', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Signer title" onChange={e=>update('signer_title', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Signer email" onChange={e=>update('signer_email', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Expected DOC HASH" onChange={e=>update('expected_doc_hash', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="IP address (optional)" onChange={e=>update('ip', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="User agent (optional)" onChange={e=>update('user_agent', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="OTP/MFA last 4 (optional)" onChange={e=>update('otp_or_mfa_code_last4', e.target.value)} />
        <button className="px-4 py-2 rounded bg-blue-600" onClick={submit}>Sign</button>
        {error && <div className="text-red-400">{error}</div>}
        {result && (
          <div className="mt-4 p-3 rounded border border-gray-700">
            <div>Signed OK</div>
          </div>
        )}
      </div>
    </div>
  )
}


