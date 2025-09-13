'use client'

import React from 'react'
import { EnhancedLegalProtectionsDashboard } from '@/components/legal/EnhancedLegalProtectionsDashboard'

export default function LegalCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Legal Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor legal compliance, IP protection, and enforcement actions
          </p>
        </div>
        <EnhancedLegalProtectionsDashboard />
      </div>
    </div>
  )
}
