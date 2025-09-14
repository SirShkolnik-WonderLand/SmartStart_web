#!/usr/bin/env python3
"""
Fallback Database Connector for SmartStart Python Brain
Uses requests to connect to the API instead of direct database connection
"""

import requests
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class DatabaseConnector:
    """Fallback database connector using API calls"""
    
    def __init__(self):
        self.api_base = "https://smartstart-api.onrender.com"
        self.session = requests.Session()
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID - return mock data for now"""
        try:
            # Return mock user data since the API doesn't have this endpoint
            if user_id == "udi-super-admin-001":
                return {
                    "id": "udi-super-admin-001",
                    "name": "Udi Shkolnik",
                    "email": "udi.admin@alicesolutionsgroup.com",
                    "level": "SUPER_ADMIN",
                    "xp": 2500,
                    "created_at": "2025-01-01T00:00:00Z",
                    "last_login": "2025-09-14T21:40:00Z",
                    "status": "active",
                    "profile": {
                        "bio": "Platform Administrator",
                        "location": "Toronto, Canada",
                        "skills": ["Leadership", "Strategy", "Technology"],
                        "experience": "10+ years"
                    }
                }
            else:
                # Return basic user data for other users
                return {
                    "id": user_id,
                    "name": f"User {user_id}",
                    "email": f"{user_id}@example.com",
                    "level": "MEMBER",
                    "xp": 100,
                    "created_at": "2025-09-01T00:00:00Z",
                    "last_login": "2025-09-14T21:40:00Z",
                    "status": "active",
                    "profile": {
                        "bio": "Platform User",
                        "location": "Unknown",
                        "skills": [],
                        "experience": "New user"
                    }
                }
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    def get_user_ventures(self, user_id: str) -> List[Dict]:
        """Get user ventures via API"""
        try:
            response = self.session.get(f"{self.api_base}/api/v1/ventures/list/all")
            if response.status_code == 200:
                data = response.json()
                # Filter ventures for this user
                if isinstance(data, list):
                    return [v for v in data if v.get('ownerId') == user_id]
                return []
            # Return mock ventures if API fails
            if user_id == "udi-super-admin-001":
                return [
                    {
                        "id": "venture-1",
                        "name": "TechCorp",
                        "description": "AI-powered technology solutions",
                        "ownerId": "udi-super-admin-001",
                        "status": "active",
                        "stage": "growth",
                        "teamSize": 5,
                        "created_at": "2025-01-15T00:00:00Z"
                    },
                    {
                        "id": "venture-2", 
                        "name": "InnovateLab",
                        "description": "Innovation consulting services",
                        "ownerId": "udi-super-admin-001",
                        "status": "active",
                        "stage": "startup",
                        "teamSize": 3,
                        "created_at": "2025-02-01T00:00:00Z"
                    }
                ]
            return []
        except Exception as e:
            logger.error(f"Error getting ventures for user {user_id}: {e}")
            return []
    
    def get_user_buz_tokens(self, user_id: str) -> Dict:
        """Get user BUZ tokens via API"""
        try:
            response = self.session.get(f"{self.api_base}/api/v1/buz/wallet/{user_id}")
            if response.status_code == 200:
                return response.json()
            return {"balance": 0, "staked": 0, "total": 0}
        except Exception as e:
            logger.error(f"Error getting BUZ tokens for user {user_id}: {e}")
            return {"balance": 0, "staked": 0, "total": 0}
    
    def get_venture_legal_dashboard(self, user_id: str) -> Dict:
        """Get venture legal dashboard data"""
        try:
            # Return mock data for now
            return {
                "user_id": user_id,
                "legal_packs": [
                    {
                        "id": "nda-pack",
                        "name": "NDA Pack",
                        "status": "pending",
                        "required": True
                    },
                    {
                        "id": "team-charter",
                        "name": "Team Charter",
                        "status": "pending", 
                        "required": True
                    }
                ],
                "signatures_needed": 2,
                "completion_percentage": 0
            }
        except Exception as e:
            logger.error(f"Error getting legal dashboard for user {user_id}: {e}")
            return {"legal_packs": [], "signatures_needed": 0, "completion_percentage": 0}

# Create global instance
db = DatabaseConnector()
