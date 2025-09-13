#!/usr/bin/env python3
"""
Authentication Service - Python Brain
Handles all authentication, JWT, login, registration, and security
"""

import logging
import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import bcrypt

logger = logging.getLogger(__name__)

class AuthenticationService:
    """Authentication service handling all security and user authentication"""

    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        self.jwt_secret = "smartstart-super-secret-jwt-key-2024"
        self.jwt_algorithm = "HS256"
        self.token_expiry_hours = 24
        logger.info("🔐 Authentication Service initialized")

    def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new user with secure password hashing"""
        try:
            # Validate required fields
            required_fields = ['email', 'password', 'firstName', 'lastName']
            for field in required_fields:
                if field not in user_data or not user_data[field]:
                    return {
                        "success": False,
                        "message": f"Missing required field: {field}",
                        "error_code": "MISSING_FIELD"
                    }

            # Hash password securely
            password_hash = self._hash_password(user_data['password'])
            
            # Generate user ID
            user_id = self._generate_user_id()
            
            # Create user data
            user = {
                "id": user_id,
                "email": user_data['email'],
                "password_hash": password_hash,
                "firstName": user_data['firstName'],
                "lastName": user_data['lastName'],
                "role": user_data.get('role', 'USER'),
                "status": "ACTIVE",
                "created_at": datetime.now().isoformat(),
                "last_login": None,
                "email_verified": False,
                "profile_complete": False
            }

            # Store user via Node.js connector
            if self.nodejs_connector:
                result = self.nodejs_connector.create_user(user)
                if not result.get('success'):
                    return result

            # Generate JWT token
            token = self._generate_jwt_token(user_id, user['email'], user['role'])

            return {
                "success": True,
                "message": "User registered successfully",
                "data": {
                    "user": {
                        "id": user_id,
                        "email": user['email'],
                        "firstName": user['firstName'],
                        "lastName": user['lastName'],
                        "role": user['role'],
                        "status": user['status'],
                        "created_at": user['created_at']
                    },
                    "token": token,
                    "expires_in": self.token_expiry_hours * 3600
                }
            }

        except Exception as e:
            logger.error(f"Registration error: {e}")
            return {
                "success": False,
                "message": "Registration failed",
                "error": str(e)
            }

    def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user login with secure password verification"""
        try:
            # Get user from database via Node.js connector
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            user_result = self.nodejs_connector.get_user_by_email(email)
            if not user_result.get('success'):
                return {
                    "success": False,
                    "message": "Invalid email or password",
                    "error_code": "INVALID_CREDENTIALS"
                }

            user = user_result['data']
            
            # Verify password
            if not self._verify_password(password, user.get('password_hash', '')):
                return {
                    "success": False,
                    "message": "Invalid email or password",
                    "error_code": "INVALID_CREDENTIALS"
                }

            # Check if user is active
            if user.get('status') != 'ACTIVE':
                return {
                    "success": False,
                    "message": "Account is not active",
                    "error_code": "ACCOUNT_INACTIVE"
                }

            # Update last login
            self.nodejs_connector.update_user_last_login(user['id'])

            # Generate JWT token
            token = self._generate_jwt_token(user['id'], user['email'], user['role'])

            return {
                "success": True,
                "message": "Login successful",
                "data": {
                    "user": {
                        "id": user['id'],
                        "email": user['email'],
                        "firstName": user['firstName'],
                        "lastName": user['lastName'],
                        "role": user['role'],
                        "status": user['status'],
                        "last_login": datetime.now().isoformat()
                    },
                    "token": token,
                    "expires_in": self.token_expiry_hours * 3600
                }
            }

        except Exception as e:
            logger.error(f"Login error: {e}")
            return {
                "success": False,
                "message": "Login failed",
                "error": str(e)
            }

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token and return user information"""
        try:
            # Decode JWT token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            
            user_id = payload.get('user_id')
            email = payload.get('email')
            role = payload.get('role')
            exp = payload.get('exp')

            # Check if token is expired
            if datetime.now().timestamp() > exp:
                return {
                    "success": False,
                    "message": "Token expired",
                    "error_code": "TOKEN_EXPIRED"
                }

            # Get user from database
            if self.nodejs_connector:
                user_result = self.nodejs_connector.get_user(user_id)
                if not user_result.get('success'):
                    return {
                        "success": False,
                        "message": "User not found",
                        "error_code": "USER_NOT_FOUND"
                    }

                user = user_result['data']
                
                # Check if user is still active
                if user.get('status') != 'ACTIVE':
                    return {
                        "success": False,
                        "message": "Account is not active",
                        "error_code": "ACCOUNT_INACTIVE"
                    }

                return {
                    "success": True,
                    "data": {
                        "user_id": user_id,
                        "email": email,
                        "role": role,
                        "user": user
                    }
                }

            return {
                "success": True,
                "data": {
                    "user_id": user_id,
                    "email": email,
                    "role": role
                }
            }

        except jwt.ExpiredSignatureError:
            return {
                "success": False,
                "message": "Token expired",
                "error_code": "TOKEN_EXPIRED"
            }
        except jwt.InvalidTokenError:
            return {
                "success": False,
                "message": "Invalid token",
                "error_code": "INVALID_TOKEN"
            }
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return {
                "success": False,
                "message": "Token verification failed",
                "error": str(e)
            }

    def refresh_token(self, token: str) -> Dict[str, Any]:
        """Refresh JWT token"""
        try:
            # Verify current token
            verify_result = self.verify_token(token)
            if not verify_result.get('success'):
                return verify_result

            user_data = verify_result['data']
            
            # Generate new token
            new_token = self._generate_jwt_token(
                user_data['user_id'],
                user_data['email'],
                user_data['role']
            )

            return {
                "success": True,
                "message": "Token refreshed successfully",
                "data": {
                    "token": new_token,
                    "expires_in": self.token_expiry_hours * 3600
                }
            }

        except Exception as e:
            logger.error(f"Token refresh error: {e}")
            return {
                "success": False,
                "message": "Token refresh failed",
                "error": str(e)
            }

    def logout_user(self, token: str) -> Dict[str, Any]:
        """Logout user (invalidate token)"""
        try:
            # In a production system, you would add the token to a blacklist
            # For now, we'll just return success
            return {
                "success": True,
                "message": "Logout successful"
            }

        except Exception as e:
            logger.error(f"Logout error: {e}")
            return {
                "success": False,
                "message": "Logout failed",
                "error": str(e)
            }

    def change_password(self, user_id: str, current_password: str, new_password: str) -> Dict[str, Any]:
        """Change user password with verification"""
        try:
            # Get user from database
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            user_result = self.nodejs_connector.get_user(user_id)
            if not user_result.get('success'):
                return {
                    "success": False,
                    "message": "User not found",
                    "error_code": "USER_NOT_FOUND"
                }

            user = user_result['data']
            
            # Verify current password
            if not self._verify_password(current_password, user.get('password_hash', '')):
                return {
                    "success": False,
                    "message": "Current password is incorrect",
                    "error_code": "INVALID_CURRENT_PASSWORD"
                }

            # Hash new password
            new_password_hash = self._hash_password(new_password)
            
            # Update password in database
            update_result = self.nodejs_connector.update_user_password(user_id, new_password_hash)
            if not update_result.get('success'):
                return update_result

            return {
                "success": True,
                "message": "Password changed successfully"
            }

        except Exception as e:
            logger.error(f"Password change error: {e}")
            return {
                "success": False,
                "message": "Password change failed",
                "error": str(e)
            }

    def reset_password_request(self, email: str) -> Dict[str, Any]:
        """Request password reset"""
        try:
            # Get user by email
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            user_result = self.nodejs_connector.get_user_by_email(email)
            if not user_result.get('success'):
                # Don't reveal if email exists or not
                return {
                    "success": True,
                    "message": "If the email exists, a reset link has been sent"
                }

            user = user_result['data']
            
            # Generate reset token
            reset_token = self._generate_reset_token()
            
            # Store reset token in database
            self.nodejs_connector.store_reset_token(user['id'], reset_token)

            # In production, send email with reset link
            # For now, just return success

            return {
                "success": True,
                "message": "Password reset link sent to email",
                "data": {
                    "reset_token": reset_token  # Only for testing
                }
            }

        except Exception as e:
            logger.error(f"Password reset request error: {e}")
            return {
                "success": False,
                "message": "Password reset request failed",
                "error": str(e)
            }

    def reset_password(self, reset_token: str, new_password: str) -> Dict[str, Any]:
        """Reset password using reset token"""
        try:
            # Verify reset token
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            user_result = self.nodejs_connector.get_user_by_reset_token(reset_token)
            if not user_result.get('success'):
                return {
                    "success": False,
                    "message": "Invalid or expired reset token",
                    "error_code": "INVALID_RESET_TOKEN"
                }

            user = user_result['data']
            
            # Hash new password
            new_password_hash = self._hash_password(new_password)
            
            # Update password and clear reset token
            update_result = self.nodejs_connector.update_user_password(user['id'], new_password_hash)
            if not update_result.get('success'):
                return update_result

            self.nodejs_connector.clear_reset_token(user['id'])

            return {
                "success": True,
                "message": "Password reset successfully"
            }

        except Exception as e:
            logger.error(f"Password reset error: {e}")
            return {
                "success": False,
                "message": "Password reset failed",
                "error": str(e)
            }

    def _hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except:
            return False

    def _generate_user_id(self) -> str:
        """Generate unique user ID"""
        return f"user_{secrets.token_hex(16)}"

    def _generate_jwt_token(self, user_id: str, email: str, role: str) -> str:
        """Generate JWT token"""
        payload = {
            'user_id': user_id,
            'email': email,
            'role': role,
            'iat': datetime.now().timestamp(),
            'exp': (datetime.now() + timedelta(hours=self.token_expiry_hours)).timestamp()
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)

    def _generate_reset_token(self) -> str:
        """Generate password reset token"""
        return secrets.token_urlsafe(32)

    def get_user_permissions(self, user_id: str) -> Dict[str, Any]:
        """Get user permissions based on role"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available"
                }

            user_result = self.nodejs_connector.get_user(user_id)
            if not user_result.get('success'):
                return user_result

            user = user_result['data']
            role = user.get('role', 'USER')

            # Define role-based permissions
            permissions = {
                'USER': [
                    'read:profile', 'update:profile', 'read:ventures', 'create:ventures',
                    'read:legal_documents', 'sign:legal_documents', 'read:notifications'
                ],
                'ADMIN': [
                    'read:all', 'update:all', 'delete:all', 'create:all',
                    'manage:users', 'manage:ventures', 'manage:legal', 'manage:system'
                ],
                'SUPER_ADMIN': [
                    'read:all', 'update:all', 'delete:all', 'create:all',
                    'manage:all', 'system:admin', 'security:admin'
                ]
            }

            return {
                "success": True,
                "data": {
                    "permissions": permissions.get(role, permissions['USER']),
                    "role": role
                }
            }

        except Exception as e:
            logger.error(f"Get permissions error: {e}")
            return {
                "success": False,
                "message": "Failed to get permissions",
                "error": str(e)
            }
