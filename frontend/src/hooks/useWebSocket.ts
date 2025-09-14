/**
 * React hook for WebSocket integration
 * Provides real-time communication capabilities to React components
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { websocketService, User, Notification, ChatMessage, CollaborativeEdit } from '../services/websocketService';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  user?: User | null;
  token?: string | null;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  user: User | null;
  currentRoom: string | null;
}

export interface WebSocketActions {
  connect: (user: User, token: string) => Promise<void>;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendChatMessage: (roomId: string, content: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  sendCollaborativeEdit: (documentId: string, operation: string, content: string, position: number) => void;
  sendVentureUpdate: (ventureId: string, updateType: string, data: any) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

export interface WebSocketEvents {
  onConnectionEstablished?: (data: any) => void;
  onDisconnected?: (event: any) => void;
  onError?: (error: any) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onCollaborativeEdit?: (edit: CollaborativeEdit) => void;
  onVentureUpdate?: (update: any) => void;
  onSystemNotification?: (notification: Notification) => void;
  onRealtimeUpdate?: (update: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onUserTyping?: (data: any) => void;
  onUserStoppedTyping?: (data: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): [WebSocketState, WebSocketActions] {
  const { autoConnect = false, user, token } = options;
  
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    user: null,
    currentRoom: null
  });

  const eventHandlers = useRef<WebSocketEvents>({});
  const isConnecting = useRef(false);

  // Update event handlers
  const updateEventHandlers = useCallback((handlers: WebSocketEvents) => {
    eventHandlers.current = { ...eventHandlers.current, ...handlers };
  }, []);

  // Connect to WebSocket
  const connect = useCallback(async (user: User, token: string) => {
    if (isConnecting.current || websocketService.connected) {
      return;
    }

    isConnecting.current = true;
    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      await websocketService.connect(user, token);
      setState(prev => ({ 
        ...prev, 
        connected: true, 
        connecting: false, 
        user: user,
        currentRoom: websocketService.room
      }));
    } catch (error) {
      console.error('❌ Failed to connect to WebSocket:', error);
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false, 
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    } finally {
      isConnecting.current = false;
    }
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setState(prev => ({ 
      ...prev, 
      connected: false, 
      connecting: false, 
      user: null,
      currentRoom: null
    }));
  }, []);

  // Room management
  const joinRoom = useCallback((roomId: string) => {
    websocketService.joinRoom(roomId);
    setState(prev => ({ ...prev, currentRoom: roomId }));
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    websocketService.leaveRoom(roomId);
    setState(prev => ({ ...prev, currentRoom: null }));
  }, []);

  // Chat functionality
  const sendChatMessage = useCallback((roomId: string, content: string) => {
    websocketService.sendChatMessage(roomId, content);
  }, []);

  const startTyping = useCallback((roomId: string) => {
    websocketService.startTyping(roomId);
  }, []);

  const stopTyping = useCallback((roomId: string) => {
    websocketService.stopTyping(roomId);
  }, []);

  // Collaborative editing
  const sendCollaborativeEdit = useCallback((documentId: string, operation: string, content: string, position: number) => {
    websocketService.sendCollaborativeEdit(documentId, operation, content, position);
  }, []);

  // Venture updates
  const sendVentureUpdate = useCallback((ventureId: string, updateType: string, data: any) => {
    websocketService.sendVentureUpdate(ventureId, updateType, data);
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback((notificationId: string) => {
    websocketService.markNotificationAsRead(notificationId);
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleConnectionEstablished = (data: any) => {
      eventHandlers.current.onConnectionEstablished?.(data);
    };

    const handleDisconnected = (event: any) => {
      setState(prev => ({ ...prev, connected: false, user: null, currentRoom: null }));
      eventHandlers.current.onDisconnected?.(event);
    };

    const handleError = (error: any) => {
      setState(prev => ({ ...prev, error: error.message || 'WebSocket error' }));
      eventHandlers.current.onError?.(error);
    };

    const handleChatMessage = (message: ChatMessage) => {
      eventHandlers.current.onChatMessage?.(message);
    };

    const handleCollaborativeEdit = (edit: CollaborativeEdit) => {
      eventHandlers.current.onCollaborativeEdit?.(edit);
    };

    const handleVentureUpdate = (update: any) => {
      eventHandlers.current.onVentureUpdate?.(update);
    };

    const handleSystemNotification = (notification: Notification) => {
      eventHandlers.current.onSystemNotification?.(notification);
    };

    const handleRealtimeUpdate = (update: any) => {
      eventHandlers.current.onRealtimeUpdate?.(update);
    };

    const handleUserJoined = (data: any) => {
      eventHandlers.current.onUserJoined?.(data);
    };

    const handleUserLeft = (data: any) => {
      eventHandlers.current.onUserLeft?.(data);
    };

    const handleUserTyping = (data: any) => {
      eventHandlers.current.onUserTyping?.(data);
    };

    const handleUserStoppedTyping = (data: any) => {
      eventHandlers.current.onUserStoppedTyping?.(data);
    };

    // Register event listeners
    websocketService.on('connectionEstablished', handleConnectionEstablished);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('error', handleError);
    websocketService.on('chatMessage', handleChatMessage);
    websocketService.on('collaborativeEdit', handleCollaborativeEdit);
    websocketService.on('ventureUpdate', handleVentureUpdate);
    websocketService.on('systemNotification', handleSystemNotification);
    websocketService.on('realtimeUpdate', handleRealtimeUpdate);
    websocketService.on('userJoined', handleUserJoined);
    websocketService.on('userLeft', handleUserLeft);
    websocketService.on('userTyping', handleUserTyping);
    websocketService.on('userStoppedTyping', handleUserStoppedTyping);

    // Auto-connect if enabled
    if (autoConnect && user && token) {
      connect(user, token);
    }

    // Cleanup on unmount
    return () => {
      websocketService.off('connectionEstablished', handleConnectionEstablished);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('error', handleError);
      websocketService.off('chatMessage', handleChatMessage);
      websocketService.off('collaborativeEdit', handleCollaborativeEdit);
      websocketService.off('ventureUpdate', handleVentureUpdate);
      websocketService.off('systemNotification', handleSystemNotification);
      websocketService.off('realtimeUpdate', handleRealtimeUpdate);
      websocketService.off('userJoined', handleUserJoined);
      websocketService.off('userLeft', handleUserLeft);
      websocketService.off('userTyping', handleUserTyping);
      websocketService.off('userStoppedTyping', handleUserStoppedTyping);
    };
  }, [autoConnect, user, token, connect]);

  // Update state when WebSocket service state changes
  useEffect(() => {
    const updateState = () => {
      setState(prev => ({
        ...prev,
        connected: websocketService.connected,
        user: websocketService.user,
        currentRoom: websocketService.room
      }));
    };

    // Update state immediately
    updateState();

    // Listen for connection changes
    const handleConnected = () => updateState();
    const handleDisconnected = () => updateState();

    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);

    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
    };
  }, []);

  const actions: WebSocketActions = {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    startTyping,
    stopTyping,
    sendCollaborativeEdit,
    sendVentureUpdate,
    markNotificationAsRead
  };

  return [state, actions];
}

// Hook for event handling
export function useWebSocketEvents(handlers: WebSocketEvents) {
  const handlersRef = useRef(handlers);
  
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const eventNames = Object.keys(handlers) as (keyof WebSocketEvents)[];
    
    eventNames.forEach(eventName => {
      const handler = handlers[eventName];
      if (handler) {
        websocketService.on(eventName, handler);
      }
    });

    return () => {
      eventNames.forEach(eventName => {
        const handler = handlers[eventName];
        if (handler) {
          websocketService.off(eventName, handler);
        }
      });
    };
  }, []);
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleSystemNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    websocketService.on('systemNotification', handleSystemNotification);

    return () => {
      websocketService.off('systemNotification', handleSystemNotification);
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    websocketService.markNotificationAsRead(notificationId);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    markAsRead,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length
  };
}

// Hook for chat functionality
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleChatMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleUserTyping = (data: any) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => new Set([...prev, data.userName]));
      }
    };

    const handleUserStoppedTyping = (data: any) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userName);
          return newSet;
        });
      }
    };

    websocketService.on('chatMessage', handleChatMessage);
    websocketService.on('userTyping', handleUserTyping);
    websocketService.on('userStoppedTyping', handleUserStoppedTyping);

    return () => {
      websocketService.off('chatMessage', handleChatMessage);
      websocketService.off('userTyping', handleUserTyping);
      websocketService.off('userStoppedTyping', handleUserStoppedTyping);
    };
  }, [roomId]);

  const sendMessage = useCallback((content: string) => {
    websocketService.sendChatMessage(roomId, content);
  }, [roomId]);

  const startTyping = useCallback(() => {
    websocketService.startTyping(roomId);
  }, [roomId]);

  const stopTyping = useCallback(() => {
    websocketService.stopTyping(roomId);
  }, [roomId]);

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    startTyping,
    stopTyping
  };
}
