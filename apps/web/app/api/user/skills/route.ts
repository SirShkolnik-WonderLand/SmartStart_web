import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call the backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user-1';
    
    // Call the backend API to get user skills
    const response = await fetch(`${API_BASE}/api/users/${userId}/skills`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    
    // Return mock data for development
    const mockSkills = [
      {
        id: 'skill-1',
        userId: userId,
        skillId: 'skill-1',
        level: 5,
        skill: {
          id: 'skill-1',
          name: 'React Development',
          category: 'tech',
          description: 'Frontend development with React'
        }
      },
      {
        id: 'skill-2',
        userId: userId,
        skillId: 'skill-2',
        level: 4,
        skill: {
          id: 'skill-2',
          name: 'Node.js Backend',
          category: 'tech',
          description: 'Backend development with Node.js'
        }
      },
      {
        id: 'skill-3',
        userId: userId,
        skillId: 'skill-3',
        level: 4,
        skill: {
          id: 'skill-3',
          name: 'Project Management',
          category: 'ops',
          description: 'Managing project timelines and resources'
        }
      },
      {
        id: 'skill-4',
        userId: userId,
        skillId: 'skill-4',
        level: 3,
        skill: {
          id: 'skill-4',
          name: 'User Acquisition',
          category: 'growth',
          description: 'Marketing and user growth strategies'
        }
      },
      {
        id: 'skill-5',
        userId: userId,
        skillId: 'skill-5',
        level: 4,
        skill: {
          id: 'skill-5',
          name: 'Security Compliance',
          category: 'compliance',
          description: 'Security and compliance implementation'
        }
      }
    ];
    
    return NextResponse.json(mockSkills);
  }
}
