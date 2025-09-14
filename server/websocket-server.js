#!/usr/bin/env node

/**
 * SmartStart WebSocket Server
 * Real-time communication and event broadcasting system
 * Handles live updates, notifications, and collaborative features
 */

const WebSocket = require('ws');
const http = require('http');
const EventEmitter = require('events');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

class SmartStartWebSocketServer extends EventEmitter {
    constructor(options = {}) {
        super();

        this.port = options.port || 3002;
        this.redis = options.redis || null;
        this.clients = new Map(); // userId -> Set of WebSocket connections
        this.rooms = new Map(); // roomId -> Set of WebSocket connections
        this.heartbeatInterval = 30000; // 30 seconds
        this.maxConnections = 10000;

        this.setupServer();
        this.setupRedis();
        this.setupHeartbeat();
    }

    setupServer() {
        this.server = http.createServer();
        this.wss = new WebSocket.Server({
            server: this.server,
            maxPayload: 1024 * 1024, // 1MB max payload
            verifyClient: this.verifyClient.bind(this)
        });

        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', this.handleError.bind(this));
    }

    setupRedis() {
        if (this.redis) {
            this.redis.on('connect', () => {
                console.log('🔗 Redis connected for WebSocket scaling');
            });

            this.redis.on('error', (err) => {
                console.error('❌ Redis error:', err);
            });
        }
    }

    setupHeartbeat() {
        setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    console.log('💔 Closing dead connection');
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, this.heartbeatInterval);
    }

    verifyClient(info) {
        const token = this.extractToken(info.req);
        if (!token) {
            console.log('❌ WebSocket connection rejected: No token');
            return false;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            info.req.user = decoded;
            return true;
        } catch (error) {
            console.log('❌ WebSocket connection rejected: Invalid token');
            return false;
        }
    }

    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }

    handleConnection(ws, req) {
        const user = req.user;
        const userId = user.userId || user.id;

        console.log(`🔌 WebSocket connection established for user: ${userId}`);

        // Store connection
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(ws);

        // Set user info on connection
        ws.userId = userId;
        ws.user = user;
        ws.isAlive = true;

        // Handle pong responses
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        // Handle messages
        ws.on('message', (message) => {
            this.handleMessage(ws, message);
        });

        // Handle disconnection
        ws.on('close', () => {
            this.handleDisconnection(ws);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`❌ WebSocket error for user ${userId}:`, error);
            this.handleDisconnection(ws);
        });

        // Send welcome message
        this.sendToConnection(ws, {
            type: 'CONNECTION_ESTABLISHED',
            data: {
                userId: userId,
                timestamp: new Date().toISOString(),
                serverTime: Date.now()
            }
        });

        // Emit connection event
        this.emit('connection', { ws, user, userId });
    }

    handleMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            console.log(`📨 WebSocket message from ${ws.userId}:`, data.type);

            switch (data.type) {
                case 'JOIN_ROOM':
                    this.joinRoom(ws, data.roomId);
                    break;
                case 'LEAVE_ROOM':
                    this.leaveRoom(ws, data.roomId);
                    break;
                case 'SEND_MESSAGE':
                    this.handleChatMessage(ws, data);
                    break;
                case 'TYPING_START':
                    this.handleTypingStart(ws, data);
                    break;
                case 'TYPING_STOP':
                    this.handleTypingStop(ws, data);
                    break;
                case 'COLLABORATIVE_EDIT':
                    this.handleCollaborativeEdit(ws, data);
                    break;
                case 'VENTURE_UPDATE':
                    this.handleVentureUpdate(ws, data);
                    break;
                case 'NOTIFICATION_READ':
                    this.handleNotificationRead(ws, data);
                    break;
                case 'PING':
                    this.sendToConnection(ws, { type: 'PONG', timestamp: Date.now() });
                    break;
                default:
                    console.log(`❓ Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
            this.sendToConnection(ws, {
                type: 'ERROR',
                message: 'Invalid message format'
            });
        }
    }

    handleDisconnection(ws) {
        if (!ws.userId) return;

        console.log(`🔌 WebSocket disconnection for user: ${ws.userId}`);

        // Remove from user connections
        const userConnections = this.clients.get(ws.userId);
        if (userConnections) {
            userConnections.delete(ws);
            if (userConnections.size === 0) {
                this.clients.delete(ws.userId);
            }
        }

        // Remove from all rooms
        this.rooms.forEach((roomConnections, roomId) => {
            roomConnections.delete(ws);
            if (roomConnections.size === 0) {
                this.rooms.delete(roomId);
            }
        });

        // Emit disconnection event
        this.emit('disconnection', { ws, userId: ws.userId });
    }

    handleError(error) {
        console.error('❌ WebSocket server error:', error);
    }

    // Room management
    joinRoom(ws, roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(ws);
        ws.currentRoom = roomId;

        console.log(`🏠 User ${ws.userId} joined room: ${roomId}`);

        // Notify room members
        this.broadcastToRoom(roomId, {
            type: 'USER_JOINED',
            data: {
                userId: ws.userId,
                userName: ws.user.name,
                roomId: roomId,
                timestamp: new Date().toISOString()
            }
        }, ws);
    }

    leaveRoom(ws, roomId) {
        const roomConnections = this.rooms.get(roomId);
        if (roomConnections) {
            roomConnections.delete(ws);
            if (roomConnections.size === 0) {
                this.rooms.delete(roomId);
            }
        }

        if (ws.currentRoom === roomId) {
            ws.currentRoom = null;
        }

        console.log(`🚪 User ${ws.userId} left room: ${roomId}`);

        // Notify room members
        this.broadcastToRoom(roomId, {
            type: 'USER_LEFT',
            data: {
                userId: ws.userId,
                userName: ws.user.name,
                roomId: roomId,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Chat functionality
    handleChatMessage(ws, data) {
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: ws.userId,
            userName: ws.user.name,
            roomId: data.roomId || ws.currentRoom,
            content: data.content,
            timestamp: new Date().toISOString(),
            type: 'CHAT_MESSAGE'
        };

        if (message.roomId) {
            this.broadcastToRoom(message.roomId, {
                type: 'CHAT_MESSAGE',
                data: message
            });
        }
    }

    handleTypingStart(ws, data) {
        this.broadcastToRoom(data.roomId || ws.currentRoom, {
            type: 'USER_TYPING',
            data: {
                userId: ws.userId,
                userName: ws.user.name,
                roomId: data.roomId || ws.currentRoom,
                timestamp: new Date().toISOString()
            }
        }, ws);
    }

    handleTypingStop(ws, data) {
        this.broadcastToRoom(data.roomId || ws.currentRoom, {
            type: 'USER_STOPPED_TYPING',
            data: {
                userId: ws.userId,
                userName: ws.user.name,
                roomId: data.roomId || ws.currentRoom,
                timestamp: new Date().toISOString()
            }
        }, ws);
    }

    // Collaborative editing
    handleCollaborativeEdit(ws, data) {
        const edit = {
            id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: ws.userId,
            userName: ws.user.name,
            documentId: data.documentId,
            operation: data.operation,
            content: data.content,
            position: data.position,
            timestamp: new Date().toISOString()
        };

        this.broadcastToRoom(`document_${data.documentId}`, {
            type: 'COLLABORATIVE_EDIT',
            data: edit
        }, ws);
    }

    // Venture updates
    handleVentureUpdate(ws, data) {
        const update = {
            id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: ws.userId,
            userName: ws.user.name,
            ventureId: data.ventureId,
            updateType: data.updateType,
            data: data.data,
            timestamp: new Date().toISOString()
        };

        this.broadcastToRoom(`venture_${data.ventureId}`, {
            type: 'VENTURE_UPDATE',
            data: update
        });
    }

    // Notification handling
    handleNotificationRead(ws, data) {
        this.sendToConnection(ws, {
            type: 'NOTIFICATION_READ_CONFIRMED',
            data: {
                notificationId: data.notificationId,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Broadcasting methods
    sendToUser(userId, message) {
        const userConnections = this.clients.get(userId);
        if (userConnections) {
            userConnections.forEach(ws => {
                this.sendToConnection(ws, message);
            });
        }
    }

    sendToConnection(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('❌ Error sending message to connection:', error);
            }
        }
    }

    broadcastToRoom(roomId, message, excludeWs = null) {
        const roomConnections = this.rooms.get(roomId);
        if (roomConnections) {
            roomConnections.forEach(ws => {
                if (ws !== excludeWs) {
                    this.sendToConnection(ws, message);
                }
            });
        }
    }

    broadcastToAll(message) {
        this.wss.clients.forEach(ws => {
            this.sendToConnection(ws, message);
        });
    }

    // System notifications
    sendSystemNotification(userId, notification) {
        this.sendToUser(userId, {
            type: 'SYSTEM_NOTIFICATION',
            data: {
                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: userId,
                title: notification.title,
                message: notification.message,
                type: notification.type || 'INFO',
                priority: notification.priority || 'NORMAL',
                timestamp: new Date().toISOString(),
                read: false
            }
        });
    }

    // Real-time updates
    sendRealtimeUpdate(updateType, data) {
        this.broadcastToAll({
            type: 'REALTIME_UPDATE',
            data: {
                updateType: updateType,
                data: data,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Analytics
    getStats() {
        return {
            totalConnections: this.wss.clients.size,
            totalUsers: this.clients.size,
            totalRooms: this.rooms.size,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }

    // Start server
    start() {
        this.server.listen(this.port, () => {
            console.log('🚀 SmartStart WebSocket Server started');
            console.log(`📡 Port: ${this.port}`);
            console.log(`🔌 Max connections: ${this.maxConnections}`);
            console.log(`💓 Heartbeat interval: ${this.heartbeatInterval}ms`);
            console.log(`🔗 Redis enabled: ${!!this.redis}`);
        });
    }

    // Stop server
    stop() {
        console.log('🛑 Stopping WebSocket server...');
        this.wss.close(() => {
            this.server.close(() => {
                console.log('✅ WebSocket server stopped');
            });
        });
    }
}

// Create and start server if run directly
if (require.main === module) {
    const server = new SmartStartWebSocketServer({
        port: process.env.WEBSOCKET_PORT || 3002,
        redis: process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null
    });

    server.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 SIGTERM received, shutting down WebSocket server');
        server.stop();
    });

    process.on('SIGINT', () => {
        console.log('🛑 SIGINT received, shutting down WebSocket server');
        server.stop();
    });
}

module.exports = SmartStartWebSocketServer;