'use client'

import React from 'react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Manage your notifications and stay updated with platform activity
          </p>
        </div>
        <NotificationCenter isOpen={true} onClose={() => {}} />
      </div>
    </div>
  )
}
