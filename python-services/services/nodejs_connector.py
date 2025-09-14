"""
NodeJS Database Connector
HTTP-based database access through Node.js API
"""

import logging
import requests
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class NodeJSConnector:
    def __init__(self):
        self.nodejs_url = "https://smartstart-api.onrender.com"
        self.timeout = 30
        logger.info("🔗 NodeJS Connector initialized with HTTP requests")
    
    def query(self, sql: str, params: Optional[List] = None) -> List[Dict[str, Any]]:
        """Execute SELECT query via HTTP"""
        try:
            response = requests.post(f"{self.nodejs_url}/api/db/query", 
                                  json={"sql": sql, "params": params or []}, 
                                  timeout=self.timeout)
            if response.status_code == 200:
                return response.json().get('data', [])
            else:
                logger.error(f"Database query failed: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return []
    
    def execute(self, sql: str, params: Optional[List] = None) -> bool:
        """Execute INSERT/UPDATE/DELETE query via HTTP"""
        try:
            response = requests.post(f"{self.nodejs_url}/api/db/execute", 
                                  json={"sql": sql, "params": params or []}, 
                                  timeout=self.timeout)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Database execute error: {e}")
            return False
    
    def get_user_data(self, user_id: str) -> Dict[str, Any]:
        """Get user data by ID"""
        try:
            query = """
            SELECT u.*, r.name as role_name, r.level as role_level
            FROM "User" u
            LEFT JOIN "Role" r ON u.role = r.name
            WHERE u.id = %s
            """
            
            result = self.query(query, [user_id])
            return result[0] if result else {}
        except Exception as e:
            logger.error(f"Error getting user data: {e}")
            return {}
    
    def get_user_by_email(self, email: str) -> Dict[str, Any]:
        """Get user data by email"""
        try:
            query = """
            SELECT u.*, r.name as role_name, r.level as role_level
            FROM "User" u
            LEFT JOIN "Role" r ON u.role = r.name
            WHERE u.email = %s
            """
            
            result = self.query(query, [email])
            if result:
                return {
                    "success": True,
                    "data": dict(result[0])
                }
            else:
                return {
                    "success": False,
                    "message": "User not found"
                }
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return {
                "success": False,
                "message": f"Database error: {str(e)}"
            }
    
    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            with psycopg2.connect(**self.connection_params) as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False