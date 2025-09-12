'use client';

import React from 'react';
import { BUZDashboard } from '@/components/buz/BUZDashboard';

export default function BUZPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <BUZDashboard />
      </div>
    </div>
  );
}
