/**
 * Collaborative Editor Component
 * Real-time collaborative editing with team features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface Collaborator {
  userId: string;
  sessionId: string;
  lastActivity: string;
  cursorPosition?: {
    position: number;
    timestamp: string;
  };
}

interface DocumentOperation {
  id: string;
  type: 'insert' | 'delete' | 'format';
  position: number;
  content?: string;
  length?: number;
  format?: any;
  timestamp: string;
  userId: string;
}

interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  position: { line: number; column: number };
  timestamp: string;
  status: 'active' | 'resolved';
  replies: any[];
}

interface CollaborativeEditorProps {
  documentId: string;
  documentType?: string;
  initialContent?: string;
  readOnly?: boolean;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  documentType = 'document',
  initialContent = '',
  readOnly = false
}) => {
  const { lastMessage, sendMessage } = useWebSocket();
  const [content, setContent] = useState(initialContent);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentPosition, setCommentPosition] = useState<{ line: number; column: number } | null>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const operationQueue = useRef<DocumentOperation[]>([]);
  const lastOperationTime = useRef<number>(0);

  useEffect(() => {
    startCollaborationSession();
    loadDocumentState();
    loadComments();
    
    return () => {
      if (sessionId) {
        endCollaborationSession();
      }
    };
  }, [documentId]);

  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  const startCollaborationSession = async () => {
    try {
      const response = await fetch('/api/collaboration/session/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ documentId, documentType })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error starting collaboration session:', error);
    }
  };

  const endCollaborationSession = async () => {
    if (!sessionId) return;
    
    try {
      await fetch('/api/collaboration/session/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      console.error('Error ending collaboration session:', error);
    }
  };

  const loadDocumentState = async () => {
    try {
      const response = await fetch(`/api/collaboration/document/${documentId}/state`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.document.content);
        setCollaborators(data.collaborators);
      }
    } catch (error) {
      console.error('Error loading document state:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/collaboration/document/${documentId}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'COLLABORATION_UPDATE':
        if (message.documentId === documentId) {
          handleCollaborationUpdate(message.message);
        }
        break;
      case 'DOCUMENT_STATE':
        if (message.documentId === documentId) {
          setContent(message.content);
          setCollaborators(message.collaborators);
        }
        break;
    }
  };

  const handleCollaborationUpdate = (update: any) => {
    switch (update.type) {
      case 'USER_JOINED':
        setCollaborators(prev => [...prev, {
          userId: update.userId,
          sessionId: update.sessionId,
          lastActivity: update.timestamp
        }]);
        break;
      case 'USER_LEFT':
        setCollaborators(prev => prev.filter(c => c.sessionId !== update.sessionId));
        break;
      case 'OPERATION':
        applyOperation(update.operation);
        break;
      case 'CURSOR_MOVE':
        updateCollaboratorCursor(update.sessionId, update.position);
        break;
      case 'COMMENT_ADDED':
        setComments(prev => [...prev, update.comment]);
        break;
      case 'COMMENT_RESOLVED':
        setComments(prev => prev.map(c => 
          c.id === update.commentId ? { ...c, status: 'resolved' } : c
        ));
        break;
    }
  };

  const applyOperation = (operation: DocumentOperation) => {
    setContent(prev => {
      let newContent = prev;
      
      switch (operation.type) {
        case 'insert':
          newContent = prev.slice(0, operation.position) + operation.content + prev.slice(operation.position);
          break;
        case 'delete':
          newContent = prev.slice(0, operation.position) + prev.slice(operation.position + (operation.length || 0));
          break;
        case 'format':
          // Handle formatting operations
          break;
      }
      
      return newContent;
    });
  };

  const updateCollaboratorCursor = (sessionId: string, position: number) => {
    setCollaborators(prev => prev.map(c => 
      c.sessionId === sessionId 
        ? { ...c, cursorPosition: { position, timestamp: new Date().toISOString() } }
        : c
    ));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    
    const newContent = e.target.value;
    const newPosition = e.target.selectionStart;
    
    setContent(newContent);
    setCursorPosition(newPosition);
    
    // Send cursor position update
    if (sessionId) {
      sendMessage({
        type: 'collaboration.cursor.move',
        sessionId,
        documentId,
        position: newPosition,
        userId: 'current-user' // Replace with actual user ID
      });
    }
    
    // Debounce operation sending
    const now = Date.now();
    if (now - lastOperationTime.current > 100) {
      sendOperation(newContent);
      lastOperationTime.current = now;
    }
  };

  const sendOperation = (newContent: string) => {
    if (!sessionId) return;
    
    const operation: DocumentOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'insert',
      position: cursorPosition,
      content: newContent,
      timestamp: new Date().toISOString(),
      userId: 'current-user' // Replace with actual user ID
    };
    
    sendMessage({
      type: 'collaboration.operation',
      sessionId,
      documentId,
      operation
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentPosition) return;
    
    try {
      const response = await fetch(`/api/collaboration/document/${documentId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          comment: {
            content: newComment,
            position: commentPosition
          }
        })
      });
      
      if (response.ok) {
        setNewComment('');
        setCommentPosition(null);
        loadComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/collaboration/document/${documentId}/comment/${commentId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        loadComments();
      }
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const handleTextSelection = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const lines = content.slice(0, start).split('\n');
      setCommentPosition({
        line: lines.length,
        column: lines[lines.length - 1].length
      });
    }
  };

  const getCollaboratorColor = (userId: string) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="collaborative-editor bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Collaborative Editor</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showComments 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Comments ({comments.filter(c => c.status === 'active').length})
          </button>
          
          <div className="flex items-center space-x-1">
            {collaborators.map((collaborator, index) => (
              <div
                key={collaborator.sessionId}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: getCollaboratorColor(collaborator.userId) }}
                title={`User ${collaborator.userId} - ${formatTimestamp(collaborator.lastActivity)}`}
              >
                {collaborator.userId.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex">
        <div className="flex-1">
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleContentChange}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            readOnly={readOnly}
            className="w-full h-96 p-4 border-0 resize-none focus:outline-none font-mono text-sm"
            placeholder="Start typing to collaborate in real-time..."
          />
        </div>
        
        {/* Comments Panel */}
        {showComments && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Comments</h3>
            
            <div className="space-y-4 mb-4">
              {comments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg ${
                    comment.status === 'active' ? 'bg-white border border-gray-200' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      Line {comment.position.line}, Column {comment.position.column}
                    </span>
                    {comment.status === 'active' && (
                      <button
                        onClick={() => handleResolveComment(comment.id)}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatTimestamp(comment.timestamp)}
                  </p>
                </div>
              ))}
            </div>
            
            {commentPosition && (
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500">
                    Comment at Line {commentPosition.line}, Column {commentPosition.column}
                  </span>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setCommentPosition(null)}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeEditor;
