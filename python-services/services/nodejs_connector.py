"""
NodeJS Database Connector
Direct PostgreSQL connection for Python services
"""

import logging
import os
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

class NodeJSConnector:
    def __init__(self):
        self.connection_params = {
            'host': 'dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com',
            'port': 5432,
            'database': 'smartstart_db_4ahd',
            'user': 'smartstart_db_4ahd_user',
            'password': 'LYcgYXd9w9pBB4HPuNretjMOOlKxWP48'
        }
        logger.info("🔗 NodeJS Connector initialized with direct PostgreSQL connection")
    
    def query(self, sql: str, params: Optional[List] = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        try:
            with psycopg2.connect(**self.connection_params) as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(sql, params or [])
                    return cursor.fetchall()
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return []
    
    def execute(self, sql: str, params: Optional[List] = None) -> bool:
        """Execute INSERT/UPDATE/DELETE query"""
        try:
            with psycopg2.connect(**self.connection_params) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql, params or [])
                    conn.commit()
                    return True
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