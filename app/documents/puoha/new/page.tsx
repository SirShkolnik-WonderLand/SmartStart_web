'use client'

import { useState } from 'react'
import { apiService } from '@/app/services/api'

export default function NewPUOHA() {
  const [form, setForm] = useState<any>({ baseline: { m365_on:'Y', entra_mfa_on:'Y', intune_defender_on:'Y', github_org_on:'Y', cicd_secrets_on:'Y', backups_logs_on:'Y', dlp_on:'Y' }, residency:'CA' })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const updateBaseline = (k: string, v: any) => setForm((f: any) => ({ ...f, baseline: { ...(f.baseline||{}), [k]: v } }))

  const submit = async () => {
    try {
      setError('')
      const res = await apiService.post('/documents/issue/puoha', form)
      setResult(res)
    } catch (e: any) {
      setError(e?.message || 'Failed to issue PUOHA')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Issue PUOHA</h1>
      <div className="space-y-3">
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Project owner legal name" onChange={e=>update('project_owner_legal_name', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Project ID" onChange={e=>update('project_id', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Effective date (YYYY-MM-DD)" onChange={e=>update('effective_date', e.target.value)} />

        <div className="grid grid-cols-2 gap-2">
          {['m365_on','entra_mfa_on','intune_defender_on','github_org_on','cicd_secrets_on','backups_logs_on','dlp_on'].map(k => (
            <select key={k} className="p-2 rounded bg-gray-800" onChange={e=>updateBaseline(k, e.target.value)}>
              <option value="Y">{k}: Y</option>
              <option value="N">{k}: N</option>
            </select>
          ))}
        </div>

        <input className="w-full p-2 rounded bg-gray-800" placeholder="Residency (default CA or list)" onChange={e=>update('residency', e.target.value)} />

        <div className="grid grid-cols-2 gap-2">
          <input className="p-2 rounded bg-gray-800" placeholder="Render monthly est CAD (e.g., 50.00)" onChange={e=>update('render_monthly_est_cad', e.target.value)} />
          <input className="p-2 rounded bg-gray-800" placeholder="GH AdvSec monthly est CAD" onChange={e=>update('gh_monthly_est_cad', e.target.value)} />
          <input className="p-2 rounded bg-gray-800" placeholder="Security/Testing monthly or one-off CAD" onChange={e=>update('sec_monthly_or_oneoff_cad', e.target.value)} />
          <input className="p-2 rounded bg-gray-800" placeholder="Monitoring monthly est CAD" onChange={e=>update('mon_monthly_est_cad', e.target.value)} />
          <input className="p-2 rounded bg-gray-800" placeholder="Other monthly est CAD" onChange={e=>update('other_monthly_est_cad', e.target.value)} />
        </div>

        <input className="w-full p-2 rounded bg-gray-800" placeholder="Payer entity" onChange={e=>update('payer_entity', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Billing email" onChange={e=>update('billing_email', e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Payment token ref" onChange={e=>update('payment_token_ref', e.target.value)} />
        <select className="w-full p-2 rounded bg-gray-800" onChange={e=>update('agree_recurring', e.target.value)}>
          <option value="Y">Agree recurring: Y</option>
          <option value="N">Agree recurring: N</option>
        </select>

        <button className="px-4 py-2 rounded bg-blue-600" onClick={submit}>Issue PUOHA</button>
        {error && <div className="text-red-400">{error}</div>}
        {result && (
          <div className="mt-4 p-3 rounded border border-gray-700">
            <div>Doc ID: {result.doc_id}</div>
            <div>DOC HASH: {result.doc_hash_sha256}</div>
            <div>Needs Security Approval: {String(result.needs_sec_approval)}</div>
            <div>Needs Legal Approval: {String(result.needs_legal_approval)}</div>
          </div>
        )}
      </div>
    </div>
  )
}


