#!/usr/bin/env python3
"""
SmartStart WebSocket Service
Handles real-time communication, notifications, and live collaboration
"""

import asyncio
import json
import logging
from typing import Dict, Set, Any, Optional
from datetime import datetime
import uuid

# WebSocket imports
try:
    import websockets
    from websockets.server import WebSocketServerProtocol
    from websockets.exceptions import ConnectionClosed
except ImportError:
    print("⚠️  WebSocket support not available. Install with: pip install websockets")
    websockets = None
    WebSocketServerProtocol = None
    ConnectionClosed = Exception

class WebSocketService:
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        self.connections: Dict[str, WebSocketServerProtocol] = {}
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> set of connection_ids
        self.venture_subscriptions: Dict[str, Set[str]] = {}  # venture_id -> set of connection_ids
        self.team_subscriptions: Dict[str, Set[str]] = {}  # team_id -> set of connection_ids
        self.logger = logging.getLogger(__name__)
        
        # WebSocket server
        self.server = None
        self.port = 8765
        
    async def start_server(self):
        """Start the WebSocket server"""
        if not websockets:
            self.logger.error("WebSocket support not available")
            return False
            
        try:
            self.server = await websockets.serve(
                self.handle_connection,
                "0.0.0.0",
                self.port,
                ping_interval=20,
                ping_timeout=10
            )
            self.logger.info(f"🔌 WebSocket server started on port {self.port}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to start WebSocket server: {e}")
            return False
    
    async def handle_connection(self, websocket: WebSocketServerProtocol, path: str):
        """Handle new WebSocket connection"""
        connection_id = str(uuid.uuid4())
        user_id = None
        
        try:
            # Extract user_id from path or query parameters
            if path.startswith('/ws/'):
                user_id = path.split('/')[2]
            
            if not user_id:
                await websocket.close(code=1008, reason="Authentication required")
                return
            
            # Store connection
            self.connections[connection_id] = websocket
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(connection_id)
            
            self.logger.info(f"🔌 WebSocket connected: {connection_id} for user {user_id}")
            
            # Send connection confirmation
            await self.send_to_connection(connection_id, {
                "type": "CONNECTION_ESTABLISHED",
                "connectionId": connection_id,
                "userId": user_id,
                "timestamp": datetime.now().isoformat()
            })
            
            # Handle messages
            async for message in websocket:
                await self.handle_message(connection_id, user_id, message)
                
        except ConnectionClosed:
            self.logger.info(f"🔌 WebSocket connection closed: {connection_id}")
        except Exception as e:
            self.logger.error(f"WebSocket error for {connection_id}: {e}")
        finally:
            await self.cleanup_connection(connection_id, user_id)
    
    async def handle_message(self, connection_id: str, user_id: str, message: str):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            payload = data.get("payload", {})
            
            if message_type == "PING":
                await self.send_to_connection(connection_id, {
                    "type": "PONG",
                    "timestamp": datetime.now().isoformat()
                })
                
            elif message_type == "SUBSCRIBE_TO_VENTURE":
                venture_id = payload.get("ventureId")
                if venture_id:
                    await self.subscribe_to_venture(connection_id, venture_id)
                    
            elif message_type == "SUBSCRIBE_TO_TEAM":
                team_id = payload.get("teamId")
                if team_id:
                    await self.subscribe_to_team(connection_id, team_id)
                    
            elif message_type == "UNSUBSCRIBE_FROM_VENTURE":
                venture_id = payload.get("ventureId")
                if venture_id:
                    await self.unsubscribe_from_venture(connection_id, venture_id)
                    
            elif message_type == "UNSUBSCRIBE_FROM_TEAM":
                team_id = payload.get("teamId")
                if team_id:
                    await self.unsubscribe_from_team(connection_id, team_id)
                    
            else:
                self.logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            await self.send_to_connection(connection_id, {
                "type": "ERROR",
                "message": "Invalid JSON format"
            })
        except Exception as e:
            self.logger.error(f"Error handling message: {e}")
            await self.send_to_connection(connection_id, {
                "type": "ERROR",
                "message": "Internal server error"
            })
    
    async def subscribe_to_venture(self, connection_id: str, venture_id: str):
        """Subscribe connection to venture updates"""
        if venture_id not in self.venture_subscriptions:
            self.venture_subscriptions[venture_id] = set()
        self.venture_subscriptions[venture_id].add(connection_id)
        self.logger.info(f"Connection {connection_id} subscribed to venture {venture_id}")
    
    async def subscribe_to_team(self, connection_id: str, team_id: str):
        """Subscribe connection to team updates"""
        if team_id not in self.team_subscriptions:
            self.team_subscriptions[team_id] = set()
        self.team_subscriptions[team_id].add(connection_id)
        self.logger.info(f"Connection {connection_id} subscribed to team {team_id}")
    
    async def unsubscribe_from_venture(self, connection_id: str, venture_id: str):
        """Unsubscribe connection from venture updates"""
        if venture_id in self.venture_subscriptions:
            self.venture_subscriptions[venture_id].discard(connection_id)
        self.logger.info(f"Connection {connection_id} unsubscribed from venture {venture_id}")
    
    async def unsubscribe_from_team(self, connection_id: str, team_id: str):
        """Unsubscribe connection from team updates"""
        if team_id in self.team_subscriptions:
            self.team_subscriptions[team_id].discard(connection_id)
        self.logger.info(f"Connection {connection_id} unsubscribed from team {team_id}")
    
    async def send_to_connection(self, connection_id: str, message: Dict[str, Any]):
        """Send message to specific connection"""
        if connection_id in self.connections:
            try:
                await self.connections[connection_id].send(json.dumps(message))
            except ConnectionClosed:
                await self.cleanup_connection(connection_id, None)
            except Exception as e:
                self.logger.error(f"Error sending to connection {connection_id}: {e}")
    
    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Send message to all connections for a user"""
        if user_id in self.user_connections:
            for connection_id in list(self.user_connections[user_id]):
                await self.send_to_connection(connection_id, message)
    
    async def send_to_venture(self, venture_id: str, message: Dict[str, Any]):
        """Send message to all connections subscribed to a venture"""
        if venture_id in self.venture_subscriptions:
            for connection_id in list(self.venture_subscriptions[venture_id]):
                await self.send_to_connection(connection_id, message)
    
    async def send_to_team(self, team_id: str, message: Dict[str, Any]):
        """Send message to all connections subscribed to a team"""
        if team_id in self.team_subscriptions:
            for connection_id in list(self.team_subscriptions[team_id]):
                await self.send_to_connection(connection_id, message)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast message to all connected users"""
        for connection_id in list(self.connections.keys()):
            await self.send_to_connection(connection_id, message)
    
    async def send_notification(self, recipient_id: str, notification: Dict[str, Any]):
        """Send real-time notification to user"""
        message = {
            "type": "NOTIFICATION",
            "data": notification,
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_user(recipient_id, message)
    
    async def send_venture_update(self, venture_id: str, update_type: str, data: Dict[str, Any]):
        """Send venture update to all subscribers"""
        message = {
            "type": "VENTURE_UPDATE",
            "ventureId": venture_id,
            "updateType": update_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_venture(venture_id, message)
    
    async def send_team_update(self, team_id: str, update_type: str, data: Dict[str, Any]):
        """Send team update to all subscribers"""
        message = {
            "type": "TEAM_UPDATE",
            "teamId": team_id,
            "updateType": update_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_team(team_id, message)
    
    async def send_collaboration_update(self, venture_id: str, user_id: str, action: str, data: Dict[str, Any]):
        """Send collaboration update (user is working on something)"""
        message = {
            "type": "COLLABORATION_UPDATE",
            "ventureId": venture_id,
            "userId": user_id,
            "action": action,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_venture(venture_id, message)
    
    async def send_legal_update(self, venture_id: str, legal_type: str, data: Dict[str, Any]):
        """Send legal document update to venture subscribers"""
        message = {
            "type": "LEGAL_UPDATE",
            "ventureId": venture_id,
            "legalType": legal_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_venture(venture_id, message)
    
    async def send_token_update(self, user_id: str, token_data: Dict[str, Any]):
        """Send BUZ token balance/transaction update to user"""
        message = {
            "type": "TOKEN_UPDATE",
            "data": token_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_user(user_id, message)
    
    async def send_system_announcement(self, announcement: Dict[str, Any]):
        """Send system-wide announcement to all users"""
        message = {
            "type": "SYSTEM_ANNOUNCEMENT",
            "data": announcement,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast_to_all(message)
    
    async def cleanup_connection(self, connection_id: str, user_id: Optional[str]):
        """Clean up connection and remove from all subscriptions"""
        if connection_id in self.connections:
            del self.connections[connection_id]
        
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(connection_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        # Remove from all subscriptions
        for venture_id in self.venture_subscriptions:
            self.venture_subscriptions[venture_id].discard(connection_id)
        
        for team_id in self.team_subscriptions:
            self.team_subscriptions[team_id].discard(connection_id)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get WebSocket connection statistics"""
        return {
            "total_connections": len(self.connections),
            "total_users": len(self.user_connections),
            "venture_subscriptions": len(self.venture_subscriptions),
            "team_subscriptions": len(self.team_subscriptions),
            "connections_per_user": {
                user_id: len(connections) 
                for user_id, connections in self.user_connections.items()
            }
        }
    
    async def stop_server(self):
        """Stop the WebSocket server"""
        if self.server:
            self.server.close()
            await self.server.wait_closed()
            self.logger.info("🔌 WebSocket server stopped")
