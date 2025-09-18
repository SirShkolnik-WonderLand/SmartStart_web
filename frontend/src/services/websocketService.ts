/**
 * SmartStart WebSocket Service
 * Real-time communication and event handling for the frontend
 */

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  content: string;
  timestamp: string;
}

export interface CollaborativeEdit {
  id: string;
  userId: string;
  userName: string;
  documentId: string;
  operation: 'INSERT' | 'DELETE' | 'REPLACE';
  content: string;
  position: number;
  timestamp: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private eventListeners = new Map<string, Set<Function>>();
  private currentUser: User | null = null;
  private currentRoom: string | null = null;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  // Connection management
  connect(user: User, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.currentUser = user;
      
      try {
        this.ws = new WebSocket(this.config.url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', event);
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.warn('⚠️ WebSocket connection failed (proxy does not support WebSockets):', error);
          this.emit('error', error);
          // Don't reject, just resolve with a warning since WebSocket is optional
          resolve();
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.emit('disconnected');
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.currentUser) {
        // Get token from localStorage or auth service
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(this.currentUser, token).catch(console.error);
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({
          type: 'PING',
          timestamp: Date.now()
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Message handling
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', message.type);
      
      this.emit(message.type, message.data);
      
      // Handle specific message types
      switch (message.type) {
        case 'CONNECTION_ESTABLISHED':
          this.handleConnectionEstablished(message.data);
          break;
        case 'CHAT_MESSAGE':
          this.handleChatMessage(message.data);
          break;
        case 'COLLABORATIVE_EDIT':
          this.handleCollaborativeEdit(message.data);
          break;
        case 'VENTURE_UPDATE':
          this.handleVentureUpdate(message.data);
          break;
        case 'SYSTEM_NOTIFICATION':
          this.handleSystemNotification(message.data);
          break;
        case 'REALTIME_UPDATE':
          this.handleRealtimeUpdate(message.data);
          break;
        case 'USER_JOINED':
          this.handleUserJoined(message.data);
          break;
        case 'USER_LEFT':
          this.handleUserLeft(message.data);
          break;
        case 'USER_TYPING':
          this.handleUserTyping(message.data);
          break;
        case 'USER_STOPPED_TYPING':
          this.handleUserStoppedTyping(message.data);
          break;
        case 'PONG':
          // Heartbeat response, no action needed
          break;
        case 'ERROR':
          console.error('❌ WebSocket server error:', message.data);
          break;
        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  private handleConnectionEstablished(data: any): void {
    console.log('✅ WebSocket connection established:', data);
    this.emit('connectionEstablished', data);
  }

  private handleChatMessage(data: ChatMessage): void {
    this.emit('chatMessage', data);
  }

  private handleCollaborativeEdit(data: CollaborativeEdit): void {
    this.emit('collaborativeEdit', data);
  }

  private handleVentureUpdate(data: any): void {
    this.emit('ventureUpdate', data);
  }

  private handleSystemNotification(data: Notification): void {
    this.emit('systemNotification', data);
  }

  private handleRealtimeUpdate(data: any): void {
    this.emit('realtimeUpdate', data);
  }

  private handleUserJoined(data: any): void {
    this.emit('userJoined', data);
  }

  private handleUserLeft(data: any): void {
    this.emit('userLeft', data);
  }

  private handleUserTyping(data: any): void {
    this.emit('userTyping', data);
  }

  private handleUserStoppedTyping(data: any): void {
    this.emit('userStoppedTyping', data);
  }

  // Sending messages
  send(message: WebSocketMessage): void {
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error);
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  // Room management
  joinRoom(roomId: string): void {
    this.currentRoom = roomId;
    this.send({
      type: 'JOIN_ROOM',
      roomId: roomId
    });
  }

  leaveRoom(roomId: string): void {
    this.send({
      type: 'LEAVE_ROOM',
      roomId: roomId
    });
    
    if (this.currentRoom === roomId) {
      this.currentRoom = null;
    }
  }

  // Chat functionality
  sendChatMessage(roomId: string, content: string): void {
    this.send({
      type: 'SEND_MESSAGE',
      roomId: roomId,
      content: content
    });
  }

  startTyping(roomId: string): void {
    this.send({
      type: 'TYPING_START',
      roomId: roomId
    });
  }

  stopTyping(roomId: string): void {
    this.send({
      type: 'TYPING_STOP',
      roomId: roomId
    });
  }

  // Collaborative editing
  sendCollaborativeEdit(documentId: string, operation: string, content: string, position: number): void {
    this.send({
      type: 'COLLABORATIVE_EDIT',
      documentId: documentId,
      operation: operation,
      content: content,
      position: position
    });
  }

  // Venture updates
  sendVentureUpdate(ventureId: string, updateType: string, data: any): void {
    this.send({
      type: 'VENTURE_UPDATE',
      ventureId: ventureId,
      updateType: updateType,
      data: data
    });
  }

  // Notifications
  markNotificationAsRead(notificationId: string): void {
    this.send({
      type: 'NOTIFICATION_READ',
      notificationId: notificationId
    });
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get user(): User | null {
    return this.currentUser;
  }

  get room(): string | null {
    return this.currentRoom;
  }
}

// Default configuration
export const defaultWebSocketConfig: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
};

// Singleton instance
export const websocketService = new WebSocketService(defaultWebSocketConfig);
