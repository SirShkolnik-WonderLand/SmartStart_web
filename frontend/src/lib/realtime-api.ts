/**
 * Real-time API Service
 * Handles WebSocket connections and real-time features
 */

export interface RealtimeNotification {
  id: string
  type: 'TEAM_INVITATION' | 'DOCUMENT_SIGNED' | 'GOAL_COMPLETED' | 'REVENUE_DISTRIBUTED' | 'ACHIEVEMENT_EARNED' | 'GENERAL' | 'VENTURE_UPDATE' | 'TEAM_UPDATE' | 'PROJECT_UPDATE'
  title: string
  message: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'UNREAD' | 'READ'
  data?: any
  createdAt: string
  readAt?: string
}

export interface WebSocketMessage {
  type: string
  data?: any
  payload?: any
  timestamp?: string
}

export interface RealtimeSubscription {
  type: 'VENTURE' | 'TEAM' | 'PROJECT' | 'USER'
  id: string
  callback: (data: any) => void
}

class RealtimeAPIService {
  private ws: WebSocket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private subscriptions = new Map<string, RealtimeSubscription>()
  private messageHandlers = new Map<string, (data: any) => void>()

  constructor(private userId: string) {}

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.NODE_ENV === 'production' 
          ? `wss://smartstart-api.onrender.com/notifications?userId=${this.userId}`
          : `ws://localhost:3001/notifications?userId=${this.userId}`
        
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
        
        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected')
          this.isConnected = false
          this.scheduleReconnect()
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnected = false
          reject(error)
        }
        
      } catch (error) {
        console.error('Error connecting WebSocket:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
    this.subscriptions.clear()
    this.messageHandlers.clear()
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(type: 'VENTURE' | 'TEAM' | 'PROJECT' | 'USER', id: string, callback: (data: any) => void): string {
    const subscriptionId = `${type}_${id}`
    this.subscriptions.set(subscriptionId, { type, id, callback })
    
    // Send subscription message to server
    this.send({
      type: `SUBSCRIBE_TO_${type}`,
      payload: { [`${type.toLowerCase()}Id`]: id }
    })
    
    return subscriptionId
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      this.subscriptions.delete(subscriptionId)
      
      // Send unsubscription message to server
      this.send({
        type: `UNSUBSCRIBE_FROM_${subscription.type}`,
        payload: { [`${subscription.type.toLowerCase()}Id`]: subscription.id }
      })
    }
  }

  /**
   * Register message handler
   */
  onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler)
  }

  /**
   * Remove message handler
   */
  offMessage(type: string): void {
    this.messageHandlers.delete(type)
  }

  /**
   * Send ping to keep connection alive
   */
  ping(): void {
    this.send({ type: 'PING' })
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message

    // Handle connection established
    if (type === 'CONNECTION_ESTABLISHED') {
      console.log('✅ WebSocket connection established')
      return
    }

    // Handle pong response
    if (type === 'PONG') {
      console.log('🏓 Pong received')
      return
    }

    // Handle notifications
    if (type === 'NOTIFICATION') {
      this.handleNotification(data)
      return
    }

    // Handle venture updates
    if (type === 'VENTURE_UPDATE') {
      this.handleVentureUpdate(data)
      return
    }

    // Handle team updates
    if (type === 'TEAM_UPDATE') {
      this.handleTeamUpdate(data)
      return
    }

    // Handle project updates
    if (type === 'PROJECT_UPDATE') {
      this.handleProjectUpdate(data)
      return
    }

    // Handle user updates
    if (type === 'USER_UPDATE') {
      this.handleUserUpdate(data)
      return
    }

    // Call registered message handlers
    const handler = this.messageHandlers.get(type)
    if (handler) {
      handler(data)
    }
  }

  /**
   * Handle notification messages
   */
  private handleNotification(notification: RealtimeNotification): void {
    console.log('🔔 Real-time notification received:', notification)
    
    // Trigger notification handlers
    const handlers = Array.from(this.messageHandlers.entries())
      .filter(([type]) => type === 'NOTIFICATION' || type === notification.type)
      .map(([, handler]) => handler)
    
    handlers.forEach(handler => handler(notification))
  }

  /**
   * Handle venture updates
   */
  private handleVentureUpdate(data: any): void {
    console.log('🚀 Venture update received:', data)
    
    // Find relevant subscriptions
    const ventureSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.type === 'VENTURE' && sub.id === data.ventureId)
    
    ventureSubscriptions.forEach(sub => sub.callback(data))
  }

  /**
   * Handle team updates
   */
  private handleTeamUpdate(data: any): void {
    console.log('👥 Team update received:', data)
    
    // Find relevant subscriptions
    const teamSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.type === 'TEAM' && sub.id === data.teamId)
    
    teamSubscriptions.forEach(sub => sub.callback(data))
  }

  /**
   * Handle project updates
   */
  private handleProjectUpdate(data: any): void {
    console.log('📋 Project update received:', data)
    
    // Find relevant subscriptions
    const projectSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.type === 'PROJECT' && sub.id === data.projectId)
    
    projectSubscriptions.forEach(sub => sub.callback(data))
  }

  /**
   * Handle user updates
   */
  private handleUserUpdate(data: any): void {
    console.log('👤 User update received:', data)
    
    // Find relevant subscriptions
    const userSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.type === 'USER' && sub.id === data.userId)
    
    userSubscriptions.forEach(sub => sub.callback(data))
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }
}

// Export singleton instance
let realtimeService: RealtimeAPIService | null = null

export const getRealtimeService = (userId: string): RealtimeAPIService => {
  if (!realtimeService || realtimeService['userId'] !== userId) {
    realtimeService = new RealtimeAPIService(userId)
  }
  return realtimeService
}

export const destroyRealtimeService = (): void => {
  if (realtimeService) {
    realtimeService.disconnect()
    realtimeService = null
  }
}

export default RealtimeAPIService
