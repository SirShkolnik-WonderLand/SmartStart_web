'use client'

import React from 'react'
import { RevenueSharingDashboard } from '@/components/revenue/RevenueSharingDashboard'

export default function RevenueSharingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Revenue Sharing Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage revenue calculations, distributions, and analytics
          </p>
        </div>
        <RevenueSharingDashboard />
      </div>
    </div>
  )
}
