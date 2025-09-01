import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call the backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  // Always return mock data for now - no API calls
    const mockBadges = [
      {
        id: 'badge-1',
        userId: userId,
        badgeId: 'badge-1',
        earnedAt: new Date(Date.now() - 86400000).toISOString(),
        badge: {
          id: 'badge-1',
          name: 'MVP Launcher',
          description: 'Successfully launched an MVP',
          icon: '🚀',
          category: 'achievement'
        }
      },
      {
        id: 'badge-2',
        userId: userId,
        badgeId: 'badge-2',
        earnedAt: new Date(Date.now() - 172800000).toISOString(),
        badge: {
          id: 'badge-2',
          name: 'Security Knight',
          description: 'Implemented security features',
          icon: '🛡️',
          category: 'security'
        }
      },
      {
        id: 'badge-3',
        userId: userId,
        badgeId: 'badge-3',
        earnedAt: new Date(Date.now() - 259200000).toISOString(),
        badge: {
          id: 'badge-3',
          name: 'Code Master',
          description: 'Wrote 1000+ lines of code',
          icon: '💻',
          category: 'tech'
        }
      },
      {
        id: 'badge-4',
        userId: userId,
        badgeId: 'badge-4',
        earnedAt: new Date(Date.now() - 345600000).toISOString(),
        badge: {
          id: 'badge-4',
          name: 'Team Player',
          description: 'Collaborated on 5+ projects',
          icon: '👥',
          category: 'community'
        }
      }
    ];
    
    return NextResponse.json(mockBadges);
  }
}
