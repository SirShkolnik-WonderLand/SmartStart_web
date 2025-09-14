"""
SmartStart Authentication Service
Complete user authentication with database integration
"""

import logging
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
import sys
import os

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from nodejs_connector import NodeJSConnector
except ImportError:
    # Fallback for when NodeJSConnector is not available
    class NodeJSConnector:
        def __init__(self):
            pass
        def query(self, sql, params=None):
            return []

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, nodejs_connector=None):
        self.connector = nodejs_connector or NodeJSConnector()
        self.jwt_secret = os.getenv('JWT_SECRET', 'your-secret-key')
        self.jwt_expiry = int(os.getenv('JWT_EXPIRY_HOURS', '24'))
        logger.info("🔐 Authentication Service initialized")
    
    def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new user"""
        try:
            email = user_data.get('email')
            password = user_data.get('password')
            name = user_data.get('name')
            
            if not email or not password:
                return {"success": False, "error": "Email and password required"}
            
            # Check if user already exists
            existing_user = self.connector.query(
                'SELECT id FROM "User" WHERE email = %s',
                [email]
            )
            
            if existing_user:
                return {"success": False, "error": "User already exists"}
            
            # Hash password
            password_hash = self._hash_password(password)
            
            # Create user
            user_id = self._generate_id()
            insert_query = """
            INSERT INTO "User" (
                id, email, password, name, role, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, email, name, role, "createdAt"
            """
            
            result = self.connector.query(insert_query, [
                user_id,
                email,
                password_hash,
                name,
                'MEMBER',  # Default role
                datetime.now(),
                datetime.now()
            ])
            
            if result:
                user = result[0]
                
                # Create user profile
                self._create_user_profile(user_id)
                
                # Start user journey
                self._start_user_journey(user_id)
                
                return {
                    "success": True,
                    "message": "User registered successfully",
                    "user": {
                        "id": user['id'],
                        "email": user['email'],
                        "name": user['name'],
                        "role": user['role']
                    }
                }
            else:
                return {"success": False, "error": "Failed to create user"}
                
        except Exception as e:
            logger.error(f"Error registering user: {e}")
            return {"success": False, "error": str(e)}
    
    def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Login user with email and password"""
        try:
            if not email or not password:
                return {"success": False, "error": "Email and password required"}
            
            # Get user from database
            user_query = """
            SELECT id, email, password, name, role, status, "lastActive"
            FROM "User"
            WHERE email = %s
            """
            
            result = self.connector.query(user_query, [email])
            
            if not result:
                return {"success": False, "error": "Invalid credentials"}
            
            user = result[0]
            
            # Check password
            if not self._verify_password(password, user['password']):
                return {"success": False, "error": "Invalid credentials"}
            
            # Check if user is active
            if user['status'] != 'ACTIVE':
                return {"success": False, "error": "Account is deactivated"}
            
            # Update last active
            self.connector.query(
                'UPDATE "User" SET "lastActive" = %s WHERE id = %s',
                [datetime.now(), user['id']]
            )
            
            # Generate JWT token
            token = self._generate_jwt_token(user['id'], user['email'], user['role'])
            
            return {
                "success": True,
                "message": "Login successful",
                "token": token,
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "name": user['name'],
                    "role": user['role']
                }
            }
            
        except Exception as e:
            logger.error(f"Error logging in user: {e}")
            return {"success": False, "error": str(e)}
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token"""
        try:
            if not token:
                return {"success": False, "error": "Token required"}
            
            # Decode token
            decoded = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            
            # Get user from database
            user_query = """
            SELECT id, email, name, role, status, "lastActive"
            FROM "User"
            WHERE id = %s
            """
            
            result = self.connector.query(user_query, [decoded['user_id']])
            
            if not result:
                return {"success": False, "error": "User not found"}
            
            user = result[0]
            
            # Check if user is still active
            if user['status'] != 'ACTIVE':
                return {"success": False, "error": "Account is deactivated"}
            
            # Check if session is still valid (last active within 7 days)
            seven_days_ago = datetime.now() - timedelta(days=7)
            if user['lastActive'] and user['lastActive'] < seven_days_ago:
                return {"success": False, "error": "Session expired"}
            
            return {
                "success": True,
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "name": user['name'],
                    "role": user['role']
                }
            }
            
        except jwt.ExpiredSignatureError:
            return {"success": False, "error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"success": False, "error": "Invalid token"}
        except Exception as e:
            logger.error(f"Error verifying token: {e}")
            return {"success": False, "error": str(e)}
    
    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        try:
            # Update user basic info
            update_fields = []
            params = []
            
            if 'name' in profile_data:
                update_fields.append('name = %s')
                params.append(profile_data['name'])
            
            if 'email' in profile_data:
                update_fields.append('email = %s')
                params.append(profile_data['email'])
            
            if update_fields:
                params.append(datetime.now())  # updatedAt
                params.append(user_id)
                
                update_query = f"""
                UPDATE "User" 
                SET {', '.join(update_fields)}, "updatedAt" = %s
                WHERE id = %s
                RETURNING id, email, name, role
                """
                
                result = self.connector.query(update_query, params)
                
                if result:
                    return {
                        "success": True,
                        "message": "Profile updated successfully",
                        "user": result[0]
                    }
                else:
                    return {"success": False, "error": "Failed to update profile"}
            else:
                return {"success": False, "error": "No fields to update"}
                
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return {"success": False, "error": str(e)}
    
    def change_password(self, user_id: str, old_password: str, new_password: str) -> Dict[str, Any]:
        """Change user password"""
        try:
            if not old_password or not new_password:
                return {"success": False, "error": "Old and new password required"}
            
            # Get current password hash
            user_query = 'SELECT password FROM "User" WHERE id = %s'
            result = self.connector.query(user_query, [user_id])
            
            if not result:
                return {"success": False, "error": "User not found"}
            
            # Verify old password
            if not self._verify_password(old_password, result[0]['password']):
                return {"success": False, "error": "Invalid old password"}
            
            # Hash new password
            new_password_hash = self._hash_password(new_password)
            
            # Update password
            update_query = """
            UPDATE "User" 
            SET password = %s, "updatedAt" = %s
            WHERE id = %s
            """
            
            self.connector.query(update_query, [new_password_hash, datetime.now(), user_id])
            
            return {"success": True, "message": "Password changed successfully"}
            
        except Exception as e:
            logger.error(f"Error changing password: {e}")
            return {"success": False, "error": str(e)}
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}:{password_hash}"
    
    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt, password_hash = stored_hash.split(':')
            computed_hash = hashlib.sha256((password + salt).encode()).hexdigest()
            return computed_hash == password_hash
        except:
            return False
    
    def _generate_jwt_token(self, user_id: str, email: str, role: str) -> str:
        """Generate JWT token"""
        payload = {
            'user_id': user_id,
            'email': email,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=self.jwt_expiry),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    def _create_user_profile(self, user_id: str):
        """Create user profile"""
        try:
            profile_query = """
            INSERT INTO "UserProfile" (
                id, "userId", nickname, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s)
            """
            
            profile_id = self._generate_id()
            self.connector.query(profile_query, [
                profile_id,
                user_id,
                f"User_{user_id[:8]}",
                datetime.now(),
                datetime.now()
            ])
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
    
    def _start_user_journey(self, user_id: str):
        """Start user journey"""
        try:
            # Get first journey stage
            stage_query = """
            SELECT id FROM "JourneyStage" 
            WHERE "isActive" = true 
            ORDER BY "order" 
            LIMIT 1
            """
            
            result = self.connector.query(stage_query)
            if result:
                stage_id = result[0]['id']
                
                # Create journey state
                journey_query = """
                INSERT INTO "UserJourneyState" (
                    id, "userId", "stageId", status, "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s)
                """
                
                journey_id = self._generate_id()
                self.connector.query(journey_query, [
                    journey_id,
                    user_id,
                    stage_id,
                    'NOT_STARTED',
                    datetime.now(),
                    datetime.now()
                ])
        except Exception as e:
            logger.error(f"Error starting user journey: {e}")
    
    def _generate_id(self) -> str:
        """Generate a unique ID (cuid-like)"""
        import time
        import random
        import string
        
        timestamp = str(int(time.time() * 1000))
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"cm{timestamp[-8:]}{random_part}"
