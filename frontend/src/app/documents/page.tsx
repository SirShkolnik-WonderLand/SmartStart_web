'use client'

import LegalDocumentManager from '@/components/LegalDocumentManager'

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        <LegalDocumentManager />
      </div>
    </div>
  )
}