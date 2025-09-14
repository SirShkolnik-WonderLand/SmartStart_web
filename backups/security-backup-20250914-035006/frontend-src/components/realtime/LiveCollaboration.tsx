'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Edit3, 
  Eye, 
  EyeOff, 
  Save, 
  Share2, 
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { getRealtimeService } from '@/lib/realtime-api'

interface LiveCollaborationProps {
  ventureId?: string
  teamId?: string
  projectId?: string
  userId: string
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: string
  currentActivity?: string
}

interface LiveComment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
  type: 'comment' | 'suggestion' | 'question'
  resolved?: boolean
}

interface LiveEdit {
  id: string
  userId: string
  userName: string
  field: string
  oldValue: string
  newValue: string
  timestamp: string
  accepted?: boolean
}

export default function LiveCollaboration({ 
  ventureId, 
  teamId, 
  projectId, 
  userId 
}: LiveCollaborationProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [liveComments, setLiveComments] = useState<LiveComment[]>([])
  const [liveEdits, setLiveEdits] = useState<LiveEdit[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  
  const realtimeService = useRef(getRealtimeService(userId))
  const editTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const service = realtimeService.current
    
    // Connect to WebSocket
    service.connect()
      .then(() => {
        setIsConnected(true)
        console.log('✅ Live collaboration connected')
      })
      .catch(error => {
        console.error('❌ Failed to connect to live collaboration:', error)
        setIsConnected(false)
      })

    // Subscribe to relevant updates
    if (ventureId) {
      service.subscribe('VENTURE', ventureId, handleVentureUpdate)
    }
    if (teamId) {
      service.subscribe('TEAM', teamId, handleTeamUpdate)
    }
    if (projectId) {
      service.subscribe('PROJECT', projectId, handleProjectUpdate)
    }

    // Set up message handlers
    service.onMessage('LIVE_EDIT', handleLiveEdit)
    service.onMessage('LIVE_COMMENT', handleLiveComment)
    service.onMessage('COLLABORATOR_JOIN', handleCollaboratorJoin)
    service.onMessage('COLLABORATOR_LEAVE', handleCollaboratorLeave)
    service.onMessage('COLLABORATOR_ACTIVITY', handleCollaboratorActivity)

    // Load initial data
    loadCollaborators()
    loadComments()
    loadEdits()

    // Cleanup on unmount
    return () => {
      service.disconnect()
    }
  }, [ventureId, teamId, projectId, userId])

  const loadCollaborators = async () => {
    // Mock data - replace with actual API call
    const mockCollaborators: Collaborator[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        currentActivity: 'Editing project description'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        currentActivity: 'Viewing team members'
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        isOnline: false,
        lastSeen: new Date(Date.now() - 300000).toISOString()
      }
    ]
    setCollaborators(mockCollaborators)
  }

  const loadComments = async () => {
    // Mock data - replace with actual API call
    const mockComments: LiveComment[] = [
      {
        id: '1',
        userId: '1',
        userName: 'John Doe',
        content: 'This looks great! Should we add more details about the technical requirements?',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'suggestion'
      },
      {
        id: '2',
        userId: '2',
        userName: 'Jane Smith',
        content: 'I agree, we need to be more specific about the timeline.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'comment'
      }
    ]
    setLiveComments(mockComments)
  }

  const loadEdits = async () => {
    // Mock data - replace with actual API call
    const mockEdits: LiveEdit[] = [
      {
        id: '1',
        userId: '1',
        userName: 'John Doe',
        field: 'description',
        oldValue: 'A simple project',
        newValue: 'A comprehensive project with detailed requirements',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        accepted: true
      }
    ]
    setLiveEdits(mockEdits)
  }

  const handleVentureUpdate = (data: any) => {
    console.log('Venture update received:', data)
    // Handle venture-specific updates
  }

  const handleTeamUpdate = (data: any) => {
    console.log('Team update received:', data)
    // Handle team-specific updates
  }

  const handleProjectUpdate = (data: any) => {
    console.log('Project update received:', data)
    // Handle project-specific updates
  }

  const handleLiveEdit = (edit: LiveEdit) => {
    setLiveEdits(prev => [edit, ...prev.slice(0, 49)]) // Keep last 50
  }

  const handleLiveComment = (comment: LiveComment) => {
    setLiveComments(prev => [comment, ...prev.slice(0, 49)]) // Keep last 50
  }

  const handleCollaboratorJoin = (collaborator: Collaborator) => {
    setCollaborators(prev => {
      const exists = prev.find(c => c.id === collaborator.id)
      if (exists) {
        return prev.map(c => c.id === collaborator.id ? { ...c, isOnline: true } : c)
      }
      return [...prev, collaborator]
    })
  }

  const handleCollaboratorLeave = (data: { userId: string }) => {
    setCollaborators(prev => 
      prev.map(c => 
        c.id === data.userId 
          ? { ...c, isOnline: false, lastSeen: new Date().toISOString() }
          : c
      )
    )
  }

  const handleCollaboratorActivity = (data: { userId: string, activity: string }) => {
    setCollaborators(prev => 
      prev.map(c => 
        c.id === data.userId 
          ? { ...c, currentActivity: data.activity, lastSeen: new Date().toISOString() }
          : c
      )
    )
  }

  const startEditing = () => {
    setIsEditing(true)
    setEditContent('Start typing your changes...')
  }

  const stopEditing = () => {
    setIsEditing(false)
    setEditContent('')
  }

  const handleContentChange = (value: string) => {
    setEditContent(value)
    
    // Debounce live edit updates
    if (editTimeoutRef.current) {
      clearTimeout(editTimeoutRef.current)
    }
    
    editTimeoutRef.current = setTimeout(() => {
      // Send live edit update
      const service = realtimeService.current
      service.send({
        type: 'LIVE_EDIT',
        data: {
          ventureId,
          teamId,
          projectId,
          userId,
          field: 'content',
          newValue: value,
          timestamp: new Date().toISOString()
        }
      })
    }, 1000)
  }

  const addComment = () => {
    if (!newComment.trim()) return

    const comment: LiveComment = {
      id: `comment_${Date.now()}`,
      userId,
      userName: 'You', // Replace with actual user name
      content: newComment,
      timestamp: new Date().toISOString(),
      type: 'comment'
    }

    setLiveComments(prev => [comment, ...prev])
    setNewComment('')

    // Send live comment
    const service = realtimeService.current
    service.send({
      type: 'LIVE_COMMENT',
      data: {
        ventureId,
        teamId,
        projectId,
        userId,
        comment
      }
    })
  }

  const acceptEdit = (editId: string) => {
    setLiveEdits(prev => 
      prev.map(edit => 
        edit.id === editId 
          ? { ...edit, accepted: true }
          : edit
      )
    )
  }

  const rejectEdit = (editId: string) => {
    setLiveEdits(prev => 
      prev.map(edit => 
        edit.id === editId 
          ? { ...edit, accepted: false }
          : edit
      )
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6" />
          <div>
            <h2 className="text-2xl font-bold">Live Collaboration</h2>
            <p className="text-muted-foreground">
              Real-time editing and collaboration
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </Badge>
          <Button onClick={startEditing} variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Start Editing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>Content Editor</span>
                {isEditing && (
                  <Badge variant="secondary">Editing</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Start typing your changes..."
                    className="min-h-[200px]"
                  />
                  <div className="flex items-center space-x-2">
                    <Button onClick={stopEditing} variant="outline" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={stopEditing} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">
                    Click "Start Editing" to begin making changes in real-time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Edits */}
          {liveEdits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5" />
                  <span>Live Edits</span>
                  <Badge variant="secondary">{liveEdits.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {liveEdits.map((edit) => (
                    <div key={edit.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-sm">{edit.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(edit.timestamp)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {edit.field}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Old:</p>
                              <p className="text-sm bg-red-50 p-2 rounded">{edit.oldValue}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">New:</p>
                              <p className="text-sm bg-green-50 p-2 rounded">{edit.newValue}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acceptEdit(edit.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectEdit(edit.id)}
                            className="text-red-600"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Collaborators</span>
                <Badge variant="secondary">{collaborators.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {collaborator.name.charAt(0)}
                        </span>
                      </div>
                      {collaborator.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.isOnline 
                          ? (collaborator.currentActivity || 'Online')
                          : `Last seen ${formatTimeAgo(collaborator.lastSeen)}`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Live Comments</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  {showComments ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            {showComments && (
              <CardContent>
                <div className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex space-x-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <Button onClick={addComment} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {liveComments.map((comment) => (
                      <div key={comment.id} className="p-3 border rounded-lg">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {comment.userName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{comment.userName}</span>
                              <Badge variant="outline" className="text-xs">
                                {comment.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
