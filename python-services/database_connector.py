#!/usr/bin/env python3
"""
Database Connector for SmartStart Python Brain
Connects to PostgreSQL database and provides data access methods
"""

import os
import psycopg2
import psycopg2.extras
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class DatabaseConnector:
    """Database connector for SmartStart platform"""
    
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        """Connect to the PostgreSQL database"""
        try:
            self.connection = psycopg2.connect(
                host=os.getenv('DATABASE_HOST', 'dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com'),
                port=os.getenv('DATABASE_PORT', '5432'),
                database=os.getenv('DATABASE_NAME', 'smartstart_db_4ahd'),
                user=os.getenv('DATABASE_USER', 'smartstart_db_4ahd_user'),
                password=os.getenv('DATABASE_PASSWORD', 'LYcgYXd9w9pBB4HPuNretjMOOlKxWP48'),
                cursor_factory=psycopg2.extras.RealDictCursor
            )
            logger.info("Database connected successfully")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            self.connection = None
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        if not self.connection:
            self.connect()
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            return []
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        query = """
        SELECT id, email, username, name, level, xp, reputation, status, 
               "totalPortfolioValue", "activeProjectsCount", "createdAt", "updatedAt"
        FROM "User" 
        WHERE id = %s
        """
        results = self.execute_query(query, (user_id,))
        return results[0] if results else None
    
    def get_user_ventures(self, user_id: str) -> List[Dict[str, Any]]:
        """Get ventures owned by a user"""
        query = """
        SELECT v.id, v.name, v.purpose as description, v.region, v.status,
               v."createdAt", v."updatedAt", v."ownerUserId"
        FROM "Venture" v
        WHERE v."ownerUserId" = %s
        ORDER BY v."createdAt" DESC
        """
        return self.execute_query(query, (user_id,))
    
    def get_all_ventures(self) -> List[Dict[str, Any]]:
        """Get all ventures"""
        query = """
        SELECT v.id, v.name, v.purpose as description, v.region, v.status,
               v."createdAt", v."updatedAt", v."ownerUserId",
               u.name as owner_name, u.email as owner_email
        FROM "Venture" v
        LEFT JOIN "User" u ON v."ownerUserId" = u.id
        ORDER BY v."createdAt" DESC
        """
        return self.execute_query(query)
    
    def get_user_buz_tokens(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's BUZ token balance"""
        query = """
        SELECT balance, "stakedBalance", "totalEarned", "totalSpent", "totalBurned",
               "isActive", "lastActivity", "createdAt", "updatedAt"
        FROM "BUZToken"
        WHERE "userId" = %s AND "isActive" = true
        ORDER BY "createdAt" DESC
        LIMIT 1
        """
        results = self.execute_query(query, (user_id,))
        return results[0] if results else None
    
    def get_legal_documents(self, user_id: str = None) -> List[Dict[str, Any]]:
        """Get legal documents"""
        if user_id:
            query = """
            SELECT id, title, type, status, "createdAt", "updatedAt"
            FROM "LegalDocument"
            WHERE "userId" = %s OR "userId" IS NULL
            ORDER BY "createdAt" DESC
            """
            return self.execute_query(query, (user_id,))
        else:
            query = """
            SELECT id, title, type, status, "createdAt", "updatedAt"
            FROM "LegalDocument"
            ORDER BY "createdAt" DESC
            """
            return self.execute_query(query)
    
    def get_opportunities(self) -> List[Dict[str, Any]]:
        """Get opportunities"""
        query = """
        SELECT o.id, o.title, o.description, o.status, o."createdAt", o."updatedAt",
               v.name as venture_name, v.id as venture_id
        FROM "Opportunity" o
        LEFT JOIN "Venture" v ON o."ventureId" = v.id
        WHERE o.status = 'OPEN'
        ORDER BY o."createdAt" DESC
        """
        return self.execute_query(query)
    
    def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get user analytics data"""
        # Get venture count
        ventures = self.get_user_ventures(user_id)
        venture_count = len(ventures)
        
        # Get BUZ token data
        buz_data = self.get_user_buz_tokens(user_id)
        buz_balance = buz_data.get('balance', 0) if buz_data else 0
        buz_staked = buz_data.get('stakedBalance', 0) if buz_data else 0
        
        # Get user data
        user_data = self.get_user_by_id(user_id)
        xp = user_data.get('xp', 0) if user_data else 0
        reputation = user_data.get('reputation', 0) if user_data else 0
        
        return {
            'venture_count': venture_count,
            'buz_balance': float(buz_balance),
            'buz_staked': float(buz_staked),
            'xp': xp,
            'reputation': reputation,
            'level': user_data.get('level', 'OWLET') if user_data else 'OWLET'
        }
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")

# Global database connector instance
db = DatabaseConnector()
