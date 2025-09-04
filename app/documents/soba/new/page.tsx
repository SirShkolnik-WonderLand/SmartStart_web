'use client'

import { useState } from 'react'
import { apiService } from '@/app/services/api'

export default function NewSOBA() {
  const [form, setForm] = useState<any>({ seats: [], proration_choice: 'Y' })
  const [seatsCount, setSeatsCount] = useState<number>(1)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const updateSeat = (i: number, k: string, v: any) => setForm((f: any) => {
    const arr = [...(f.seats || [])]
    arr[i] = { ...(arr[i] || {}), [k]: v }
    return { ...f, seats: arr }
  })

  const ensureSeats = (n: number) => {
    setSeatsCount(n)
    setForm((f: any) => {
      const arr = [...(f.seats || [])]
      while (arr.length < n) arr.push({})
      if (arr.length > n) arr.length = n
      return { ...f, seats: arr, seats_count: n }
    })
  }

  const submit = async () => {
    try {
      setError('')
      const res = await apiService.post('/documents/issue/soba', form)
      setResult(res)
    } catch (e: any) {
      setError(e?.message || 'Failed to issue SOBA')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Issue SOBA</h1>
      <div className="space-y-3">
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Subscriber legal name" onChange={e=>update('subscriber_legal_name', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Effective date (YYYY-MM-DD)" onChange={e=>update('effective_date', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Project domain (examplehub.ca)" onChange={e=>update('project_domain', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" type="number" min={1} max={500} placeholder="Seats count" onChange={e=>ensureSeats(parseInt(e.target.value || '1',10))} />

        {Array.from({ length: seatsCount }).map((_, i) => (
          <div key={i} className="p-3 rounded border border-gray-700">
            <div className="font-medium mb-2">Seat #{i+1}</div>
            <input className="w-full p-2 rounded bg-gray-800 mb-2" placeholder="Full name" onChange={e=>updateSeat(i,'full_name', e.target.value)} />
            <input className="w-full p-2 rounded bg-gray-800 mb-2" placeholder="Email local-part" onChange={e=>updateSeat(i,'local_part', e.target.value)} />
            <input className="w-full p-2 rounded bg-gray-800 mb-2" placeholder="Role" onChange={e=>updateSeat(i,'role', e.target.value)} />
            <select className="w-full p-2 rounded bg-gray-800 mb-2" onChange={e=>updateSeat(i,'intune_ready', e.target.value)}>
              <option value="Y">Intune ready: Y</option>
              <option value="N">Intune ready: N</option>
            </select>
            <input className="w-full p-2 rounded bg-gray-800" placeholder="Start date (YYYY-MM-DD)" onChange={e=>updateSeat(i,'start_date', e.target.value)} />
          </div>
        ))}

        <input className="w-full p-2 rounded bg-gray-800" placeholder="Billing email" onChange={e=>update('billing_email', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Billing address" onChange={e=>update('billing_address', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Payment token ref" onChange={e=>update('payment_token_ref', e.target.value)} />
        <select className="w-full p-2 rounded bg-gray-800" onChange={e=>update('proration_choice', e.target.value)}>
          <option value="Y">Prorate first month: Y</option>
          <option value="N">Prorate first month: N</option>
        </select>

        <div className="grid grid-cols-3 gap-2">
          <select className="p-2 rounded bg-gray-800" onChange={e=>update('accept_non_refundable', e.target.value)}>
            <option value="Y">Accept non-refundable: Y</option>
            <option value="N">Accept non-refundable: N</option>
          </select>
          <select className="p-2 rounded bg-gray-800" onChange={e=>update('accept_security_baseline', e.target.value)}>
            <option value="Y">Accept security baseline: Y</option>
            <option value="N">Accept security baseline: N</option>
          </select>
          <select className="p-2 rounded bg-gray-800" onChange={e=>update('accept_ptsa_binding', e.target.value)}>
            <option value="Y">Accept PTSA/PPA/NDA/DPA: Y</option>
            <option value="N">Accept PTSA/PPA/NDA/DPA: N</option>
          </select>
        </div>

        <button className="px-4 py-2 rounded bg-blue-600" onClick={submit}>Issue SOBA</button>
        {error && <div className="text-red-400">{error}</div>}
        {result && (
          <div className="mt-4 p-3 rounded border border-gray-700">
            <div>Doc ID: {result.doc_id}</div>
            <div>DOC HASH: {result.doc_hash_sha256}</div>
          </div>
        )}
      </div>
    </div>
  )
}


