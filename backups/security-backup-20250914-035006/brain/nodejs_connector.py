#!/usr/bin/env python3
"""
Node.js Connector - Bridge between Python Brain and Node.js API
"""

import requests
import logging
from typing import Dict, List, Any, Optional
import os
import json

logger = logging.getLogger(__name__)

class NodeJSConnector:
    """Connector to communicate with Node.js API services"""
    
    def __init__(self):
        self.nodejs_url = os.getenv('NODEJS_BACKEND_URL', 'https://smartstart-api.onrender.com')
        self.api_key = os.getenv('API_KEY', 'your-api-key-here')
        self.timeout = 30
        
    def get_user_data(self, user_id: str) -> Dict[str, Any]:
        """Get user data from Node.js API"""
        try:
            response = requests.get(
                f"{self.nodejs_url}/api/users/{user_id}",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get user data: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error getting user data: {e}")
            return {}
    
    def get_venture_data(self, venture_id: str) -> Dict[str, Any]:
        """Get venture data from Node.js API"""
        try:
            response = requests.get(
                f"{self.nodejs_url}/api/ventures/{venture_id}",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get venture data: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error getting venture data: {e}")
            return {}
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users from Node.js API"""
        try:
            response = requests.get(
                f"{self.nodejs_url}/api/users",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Failed to get all users: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return []
    
    def get_legal_documents(self, entity_id: str) -> List[Dict[str, Any]]:
        """Get legal documents from Node.js API"""
        try:
            response = requests.get(
                f"{self.nodejs_url}/api/legal-documents?entityId={entity_id}",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Failed to get legal documents: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting legal documents: {e}")
            return []
    
    def update_user_analytics(self, user_id: str, analytics_data: Dict[str, Any]) -> bool:
        """Update user analytics in Node.js API"""
        try:
            response = requests.put(
                f"{self.nodejs_url}/api/users/{user_id}/analytics",
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json=analytics_data,
                timeout=self.timeout
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Error updating user analytics: {e}")
            return False
    
    def create_notification(self, notification_data: Dict[str, Any]) -> bool:
        """Create notification through Node.js API"""
        try:
            response = requests.post(
                f"{self.nodejs_url}/api/notifications",
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json=notification_data,
                timeout=self.timeout
            )
            
            return response.status_code == 201
            
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return False
    
    def get_opportunities(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get opportunities from Node.js API"""
        try:
            params = filters or {}
            response = requests.get(
                f"{self.nodejs_url}/api/opportunities",
                headers={'Authorization': f'Bearer {self.api_key}'},
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Failed to get opportunities: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting opportunities: {e}")
            return []
    
    def get_umbrella_relationships(self, user_id: str = None) -> List[Dict[str, Any]]:
        """Get umbrella relationships from Node.js API"""
        try:
            url = f"{self.nodejs_url}/api/umbrella/relationships"
            if user_id:
                url += f"?userId={user_id}"
                
            response = requests.get(
                url,
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', [])
            else:
                logger.error(f"Failed to get umbrella relationships: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting umbrella relationships: {e}")
            return []
    
    def get_gamification_data(self, user_id: str) -> Dict[str, Any]:
        """Get gamification data from Node.js API"""
        try:
            response = requests.get(
                f"{self.nodejs_url}/api/user-gamification/{user_id}",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get gamification data: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error getting gamification data: {e}")
            return {}
    
    def get_buz_token_data(self, user_id: str) -> Dict[str, Any]:
        """Get BUZ token data from Node.js API"""
        try:
            response = requests.get(
                f"{self.nodejs_url}/api/buz-token-full/balance/{user_id}",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get BUZ token data: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error getting BUZ token data: {e}")
            return {}
    
    def send_recommendations(self, user_id: str, recommendations: List[Dict[str, Any]]) -> bool:
        """Send recommendations to Node.js API"""
        try:
            response = requests.post(
                f"{self.nodejs_url}/api/users/{user_id}/recommendations",
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json={'recommendations': recommendations},
                timeout=self.timeout
            )
            
            return response.status_code == 201
            
        except Exception as e:
            logger.error(f"Error sending recommendations: {e}")
            return False
    
    def log_analytics_event(self, event_data: Dict[str, Any]) -> bool:
        """Log analytics event to Node.js API"""
        try:
            response = requests.post(
                f"{self.nodejs_url}/api/analytics/events",
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json=event_data,
                timeout=self.timeout
            )
            
            return response.status_code == 201
            
        except Exception as e:
            logger.error(f"Error logging analytics event: {e}")
            return False
    
    def health_check(self) -> bool:
        """Check if Node.js API is healthy"""
        try:
            response = requests.get(
                f"{self.nodejs_url}/api/health",
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"Node.js API health check failed: {e}")
            return False
