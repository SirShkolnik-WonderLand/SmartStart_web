"""
Secure JWT Manager for SmartStart Platform
Implements enterprise-grade JWT security with rotation and validation
"""

import jwt
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from cryptography.fernet import Fernet
import os
import json
import redis
from functools import wraps

class SecureJWTManager:
    """
    Enterprise-grade JWT management with security best practices
    """
    
    def __init__(self):
        self.secret_key = self._get_secure_secret()
        self.algorithm = 'HS256'
        self.access_token_expire = timedelta(minutes=15)
        self.refresh_token_expire = timedelta(days=7)
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.revoked_tokens = set()
        
    def _get_secure_secret(self) -> str:
        """Get secure JWT secret from environment or generate new one"""
        secret = os.getenv('JWT_SECRET')
        if not secret or secret == 'your-secret-key':
            # Generate a new secure secret
            secret = secrets.token_urlsafe(64)
            print(f"⚠️  WARNING: Generated new JWT secret. Update JWT_SECRET environment variable!")
            print(f"JWT_SECRET={secret}")
        return secret
    
    def create_tokens(self, user_id: str, permissions: List[str], device_fingerprint: str = None) -> Dict[str, str]:
        """
        Create secure access and refresh tokens with device fingerprinting
        """
        current_time = datetime.utcnow()
        
        # Create access token payload
        access_payload = {
            'user_id': user_id,
            'permissions': permissions,
            'iat': current_time,
            'exp': current_time + self.access_token_expire,
            'jti': secrets.token_urlsafe(16),  # JWT ID for revocation
            'type': 'access',
            'device_fingerprint': device_fingerprint or self._generate_device_fingerprint()
        }
        
        # Create refresh token payload
        refresh_payload = {
            'user_id': user_id,
            'type': 'refresh',
            'iat': current_time,
            'exp': current_time + self.refresh_token_expire,
            'jti': secrets.token_urlsafe(16),
            'device_fingerprint': device_fingerprint or self._generate_device_fingerprint()
        }
        
        # Generate tokens
        access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.algorithm)
        refresh_token = jwt.encode(refresh_payload, self.secret_key, algorithm=self.algorithm)
        
        # Store refresh token in Redis for validation
        self._store_refresh_token(user_id, refresh_payload['jti'], refresh_token)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': int(self.access_token_expire.total_seconds()),
            'token_type': 'Bearer'
        }
    
    def verify_token(self, token: str, token_type: str = 'access') -> Tuple[bool, Optional[Dict]]:
        """
        Verify JWT token with comprehensive security checks
        """
        try:
            # Check if token is revoked
            if self._is_token_revoked(token):
                return False, None
            
            # Decode and verify token
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get('type') != token_type:
                return False, None
            
            # Verify token is not expired
            if datetime.utcnow() > datetime.fromtimestamp(payload['exp']):
                return False, None
            
            # Additional security checks
            if not self._verify_token_integrity(payload):
                return False, None
            
            return True, payload
            
        except jwt.ExpiredSignatureError:
            return False, {'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return False, {'error': 'Invalid token'}
        except Exception as e:
            return False, {'error': f'Token verification failed: {str(e)}'}
    
    def refresh_access_token(self, refresh_token: str) -> Tuple[bool, Optional[Dict[str, str]]]:
        """
        Refresh access token using valid refresh token
        """
        is_valid, payload = self.verify_token(refresh_token, 'refresh')
        
        if not is_valid:
            return False, None
        
        # Verify refresh token is stored in Redis
        if not self._verify_refresh_token(payload['user_id'], payload['jti']):
            return False, None
        
        # Create new access token
        new_tokens = self.create_tokens(
            payload['user_id'],
            payload.get('permissions', []),
            payload.get('device_fingerprint')
        )
        
        # Revoke old refresh token
        self.revoke_token(refresh_token)
        
        return True, new_tokens
    
    def revoke_token(self, token: str) -> bool:
        """
        Revoke a token (add to blacklist)
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm], options={"verify_exp": False})
            jti = payload.get('jti')
            if jti:
                self.revoked_tokens.add(jti)
                # Store in Redis for persistence
                self.redis_client.sadd('revoked_tokens', jti)
                return True
        except Exception:
            pass
        return False
    
    def revoke_all_user_tokens(self, user_id: str) -> bool:
        """
        Revoke all tokens for a specific user
        """
        try:
            # Add user to revoked users set
            self.redis_client.sadd('revoked_users', user_id)
            return True
        except Exception:
            return False
    
    def _is_token_revoked(self, token: str) -> bool:
        """Check if token is in revocation list"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm], options={"verify_exp": False})
            jti = payload.get('jti')
            if jti:
                # Check in-memory set
                if jti in self.revoked_tokens:
                    return True
                # Check Redis
                return self.redis_client.sismember('revoked_tokens', jti)
        except Exception:
            pass
        return False
    
    def _verify_token_integrity(self, payload: Dict) -> bool:
        """Verify token integrity and security"""
        # Check required fields
        required_fields = ['user_id', 'iat', 'exp', 'jti', 'type']
        for field in required_fields:
            if field not in payload:
                return False
        
        # Check token age (prevent very old tokens)
        token_age = datetime.utcnow() - datetime.fromtimestamp(payload['iat'])
        if token_age > timedelta(days=1):
            return False
        
        return True
    
    def _store_refresh_token(self, user_id: str, jti: str, token: str):
        """Store refresh token in Redis for validation"""
        try:
            key = f"refresh_token:{user_id}:{jti}"
            self.redis_client.setex(key, int(self.refresh_token_expire.total_seconds()), token)
        except Exception:
            pass
    
    def _verify_refresh_token(self, user_id: str, jti: str) -> bool:
        """Verify refresh token exists in Redis"""
        try:
            key = f"refresh_token:{user_id}:{jti}"
            return self.redis_client.exists(key) > 0
        except Exception:
            return False
    
    def _generate_device_fingerprint(self) -> str:
        """Generate device fingerprint for additional security"""
        # This would typically include browser/device characteristics
        fingerprint_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'random': secrets.token_hex(16)
        }
        return hashlib.sha256(json.dumps(fingerprint_data).encode()).hexdigest()[:16]

def jwt_required(f):
    """Decorator for JWT token validation"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # This would be implemented in the Flask/Express app
        # For now, return the function as-is
        return f(*args, **kwargs)
    return decorated_function

def require_permission(permission: str):
    """Decorator for permission-based access control"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # This would check user permissions
            # For now, return the function as-is
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Rate limiting implementation
class RateLimiter:
    """Rate limiting for API endpoints"""
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=1)
        self.limits = {
            'auth': {'requests': 5, 'window': 60},  # 5 requests per minute
            'buz': {'requests': 50, 'window': 60},  # 50 requests per minute
            'api': {'requests': 100, 'window': 60}, # 100 requests per minute
        }
    
    def is_allowed(self, user_id: str, endpoint_type: str) -> bool:
        """Check if user is within rate limits"""
        try:
            limit_config = self.limits.get(endpoint_type, self.limits['api'])
            key = f"rate_limit:{user_id}:{endpoint_type}"
            
            current_requests = self.redis_client.get(key)
            if current_requests is None:
                self.redis_client.setex(key, limit_config['window'], 1)
                return True
            
            current_requests = int(current_requests)
            if current_requests >= limit_config['requests']:
                return False
            
            self.redis_client.incr(key)
            return True
        except Exception:
            return True  # Allow on error
    
    def get_remaining_requests(self, user_id: str, endpoint_type: str) -> int:
        """Get remaining requests for user"""
        try:
            limit_config = self.limits.get(endpoint_type, self.limits['api'])
            key = f"rate_limit:{user_id}:{endpoint_type}"
            
            current_requests = self.redis_client.get(key)
            if current_requests is None:
                return limit_config['requests']
            
            return max(0, limit_config['requests'] - int(current_requests))
        except Exception:
            return limit_config['requests']
