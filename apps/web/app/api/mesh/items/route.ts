import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Call the backend API instead of connecting to database directly
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartstart-api.onrender.com';

export async function GET(request: NextRequest) {
  // Always return mock data for now - no API calls
    const mockMeshItems = [
      {
        id: 'mesh-1',
        type: 'IDEA',
        title: 'AI-Powered Contract Review',
        description: 'Using machine learning to automatically review and validate legal contracts for compliance and risk assessment.',
        authorId: 'user-1',
        projectId: 'project-1',
        priority: 1,
        metadata: { category: 'innovation' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        author: {
          id: 'user-1',
          name: 'Alice Chen'
        },
        reactions: [
          { id: 'reaction-1', emoji: '🚀', userId: 'user-2' },
          { id: 'reaction-2', emoji: '💡', userId: 'user-3' },
          { id: 'reaction-3', emoji: '👍', userId: 'user-4' }
        ]
      },
      {
        id: 'mesh-2',
        type: 'CHALLENGE',
        title: '30-Day MVP Challenge',
        description: 'Launch a complete MVP from idea to production in exactly 30 days. Track progress and share learnings.',
        authorId: 'user-2',
        projectId: null,
        priority: 2,
        metadata: { category: 'challenge' },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        author: {
          id: 'user-2',
          name: 'Bob Smith'
        },
        reactions: [
          { id: 'reaction-4', emoji: '🎯', userId: 'user-1' },
          { id: 'reaction-5', emoji: '🔥', userId: 'user-3' }
        ]
      },
      {
        id: 'mesh-3',
        type: 'INSIGHT',
        title: 'Equity Distribution Best Practices',
        description: 'Analysis of successful equity distribution models and lessons learned from failed startups.',
        authorId: 'user-3',
        projectId: null,
        priority: 1,
        metadata: { category: 'analysis' },
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        author: {
          id: 'user-3',
          name: 'Carol Johnson'
        },
        reactions: [
          { id: 'reaction-6', emoji: '📊', userId: 'user-1' },
          { id: 'reaction-7', emoji: '💡', userId: 'user-2' },
          { id: 'reaction-8', emoji: '👍', userId: 'user-4' },
          { id: 'reaction-9', emoji: '🎯', userId: 'user-5' }
        ]
      },
      {
        id: 'mesh-4',
        type: 'RESOURCE',
        title: 'Legal Compliance Checklist',
        description: 'Comprehensive checklist for ensuring legal compliance in startup operations and equity management.',
        authorId: 'user-4',
        projectId: null,
        priority: 1,
        metadata: { category: 'resource' },
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        author: {
          id: 'user-4',
          name: 'David Wilson'
        },
        reactions: [
          { id: 'reaction-10', emoji: '📋', userId: 'user-1' },
          { id: 'reaction-11', emoji: '🛡️', userId: 'user-2' }
        ]
      },
      {
        id: 'mesh-5',
        type: 'SUCCESS_STORY',
        title: 'From 0 to $1M in 6 Months',
        description: 'Detailed case study of how we built and launched a SaaS product that reached $1M ARR in 6 months.',
        authorId: 'user-5',
        projectId: 'project-2',
        priority: 1,
        metadata: { category: 'case-study' },
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        author: {
          id: 'user-5',
          name: 'Eva Rodriguez'
        },
        reactions: [
          { id: 'reaction-12', emoji: '🏆', userId: 'user-1' },
          { id: 'reaction-13', emoji: '🚀', userId: 'user-2' },
          { id: 'reaction-14', emoji: '💪', userId: 'user-3' },
          { id: 'reaction-15', emoji: '🎉', userId: 'user-4' }
        ]
      },
      {
        id: 'mesh-6',
        type: 'QUESTION',
        title: 'Best Tech Stack for MVP?',
        description: 'What technology stack would you recommend for a B2B SaaS MVP that needs to scale quickly?',
        authorId: 'user-1',
        projectId: null,
        priority: 2,
        metadata: { category: 'discussion' },
        createdAt: new Date(Date.now() - 518400000).toISOString(),
        author: {
          id: 'user-1',
          name: 'Alice Chen'
        },
        reactions: [
          { id: 'reaction-16', emoji: '🤔', userId: 'user-2' },
          { id: 'reaction-17', emoji: '💻', userId: 'user-3' }
        ]
      }
    ];
    
    return NextResponse.json(mockMeshItems);
  }
}
