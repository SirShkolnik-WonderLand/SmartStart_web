/**
 * WEBSOCKET SERVICE
 * Real-time updates via Socket.IO
 */

import { io, type Socket } from 'socket.io-client';
import { useDashboardStore } from '@/store/dashboardStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket...');

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting from WebSocket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      useDashboardStore.getState().addNotification('success', 'Real-time updates connected');
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        useDashboardStore.getState().addNotification(
          'error',
          'Real-time updates unavailable'
        );
      }
    });

    // Disconnected
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    // Real-time updates from server
    this.socket.on('realtimeUpdate', (data) => {
      // Emit custom event for components to listen
      window.dispatchEvent(new CustomEvent('realtime-update', { detail: data }));
    });

    // Visitor events
    this.socket.on('visitor:new', (data) => {
      useDashboardStore.getState().addNotification('info', `New visitor from ${data.city || data.country}`);
      window.dispatchEvent(new CustomEvent('visitor-new', { detail: data }));
    });

    // Conversion events
    this.socket.on('conversion:new', (data) => {
      useDashboardStore.getState().addNotification(
        'success',
        `New conversion: ${data.goalName}`
      );
      window.dispatchEvent(new CustomEvent('conversion-new', { detail: data }));
    });

    // Stats updates
    this.socket.on('stats:update', (data) => {
      window.dispatchEvent(new CustomEvent('stats-update', { detail: data }));
    });
  }

  /**
   * Request real-time stats
   */
  requestRealtimeStats(): void {
    if (this.socket?.connected) {
      this.socket.emit('getRealtimeStats');
    }
  }

  /**
   * Subscribe to specific events
   */
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

// React hook for WebSocket
export function useWebSocket() {
  const realtimeEnabled = useDashboardStore((state) => state.realtimeEnabled);

  return {
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    isConnected: () => websocketService.isConnected(),
    requestStats: () => websocketService.requestRealtimeStats(),
    on: (event: string, callback: (data: any) => void) => websocketService.on(event, callback),
    off: (event: string, callback?: (data: any) => void) => websocketService.off(event, callback),
    emit: (event: string, data?: any) => websocketService.emit(event, data),
    enabled: realtimeEnabled,
  };
}
