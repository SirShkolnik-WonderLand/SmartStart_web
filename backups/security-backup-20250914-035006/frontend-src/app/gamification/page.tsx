'use client'

import React from 'react'
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard'

export default function GamificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gamification Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your XP, badges, achievements, and leaderboard position
          </p>
        </div>
        <GamificationDashboard userId="current-user" />
      </div>
    </div>
  )
}
