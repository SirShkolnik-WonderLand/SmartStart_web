'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main CLI interface
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-mono mb-4">🚀</div>
        <div className="text-lg font-mono">Redirecting to CLI...</div>
        <div className="text-sm text-green-600 mt-2">SmartStart Platform</div>
      </div>
    </div>
  );
}
