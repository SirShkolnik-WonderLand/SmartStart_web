#!/usr/bin/env python3
"""
SmartStart Node.js Connector
Handles communication between Python Brain and Node.js API for database operations
"""

import requests
import logging
from typing import Dict, Any, Optional, List
import json

class NodeJSConnector:
    def __init__(self, nodejs_api_url: str = None):
        self.nodejs_api_url = nodejs_api_url or "https://smartstart-api.onrender.com"
        self.logger = logging.getLogger(__name__)
        
    async def get_user_data(self, user_id: str) -> Dict[str, Any]:
        """Get user data from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/users/{user_id}")
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting user data: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user via Node.js API"""
        try:
            response = requests.post(f"{self.nodejs_api_url}/api/users", json=user_data)
            if response.status_code in [200, 201]:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error creating user: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user via Node.js API"""
        try:
            response = requests.put(f"{self.nodejs_api_url}/api/users/{user_id}", json=user_data)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error updating user: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_venture_data(self, venture_id: str) -> Dict[str, Any]:
        """Get venture data from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/ventures/{venture_id}")
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting venture data: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_venture(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create venture via Node.js API"""
        try:
            response = requests.post(f"{self.nodejs_api_url}/api/ventures", json=venture_data)
            if response.status_code in [200, 201]:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error creating venture: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_venture(self, venture_id: str, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update venture via Node.js API"""
        try:
            response = requests.put(f"{self.nodejs_api_url}/api/ventures/{venture_id}", json=venture_data)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error updating venture: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_legal_document(self, document_id: str) -> Dict[str, Any]:
        """Get legal document from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/legal/documents/{document_id}")
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting legal document: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_legal_document(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create legal document via Node.js API"""
        try:
            response = requests.post(f"{self.nodejs_api_url}/api/legal/documents", json=document_data)
            if response.status_code in [200, 201]:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error creating legal document: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_legal_document(self, document_id: str, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update legal document via Node.js API"""
        try:
            response = requests.put(f"{self.nodejs_api_url}/api/legal/documents/{document_id}", json=document_data)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error updating legal document: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_notification(self, notification_id: str) -> Dict[str, Any]:
        """Get notification from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/notifications/{notification_id}")
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting notification: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create notification via Node.js API"""
        try:
            response = requests.post(f"{self.nodejs_api_url}/api/notifications", json=notification_data)
            if response.status_code in [200, 201]:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error creating notification: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_analytics_data(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Get analytics data from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/analytics", params=filters)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting analytics data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_gamification_data(self, user_id: str) -> Dict[str, Any]:
        """Get gamification data from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/gamification/users/{user_id}")
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting gamification data: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_gamification_data(self, user_id: str, gamification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update gamification data via Node.js API"""
        try:
            response = requests.put(f"{self.nodejs_api_url}/api/gamification/users/{user_id}", json=gamification_data)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error updating gamification data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_buz_token_data(self, user_id: str) -> Dict[str, Any]:
        """Get BUZ token data from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/buz/users/{user_id}")
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting BUZ token data: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_buz_token_data(self, user_id: str, token_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update BUZ token data via Node.js API"""
        try:
            response = requests.put(f"{self.nodejs_api_url}/api/buz/users/{user_id}", json=token_data)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error updating BUZ token data: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_umbrella_data(self, user_id: str) -> Dict[str, Any]:
        """Get umbrella data from Node.js API"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/umbrella/users/{user_id}")
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error getting umbrella data: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_umbrella_data(self, user_id: str, umbrella_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update umbrella data via Node.js API"""
        try:
            response = requests.put(f"{self.nodejs_api_url}/api/umbrella/users/{user_id}", json=umbrella_data)
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            self.logger.error(f"Error updating umbrella data: {e}")
            return {"success": False, "error": str(e)}
    
    def get_connection_status(self) -> Dict[str, Any]:
        """Get Node.js API connection status"""
        try:
            response = requests.get(f"{self.nodejs_api_url}/api/health", timeout=5)
            if response.status_code == 200:
                return {"success": True, "status": "connected", "response_time": response.elapsed.total_seconds()}
            else:
                return {"success": False, "status": "error", "error": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "status": "disconnected", "error": str(e)}
