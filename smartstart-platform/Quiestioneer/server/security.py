"""
Security utilities for SMB Cyber Health Check
"""

import hashlib
import secrets
import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import sqlite3
import json
from functools import wraps

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Rate limiting storage (in production, use Redis)
_rate_limit_cache: Dict[str, Dict[str, Any]] = {}

class SecurityManager:
    """Centralized security management"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.bearer_scheme = HTTPBearer(auto_error=False)
    
    def generate_session_id(self) -> str:
        """Generate cryptographically secure session ID"""
        return secrets.token_urlsafe(32)
    
    def hash_ip(self, ip: str) -> str:
        """Hash IP address for privacy"""
        return hashlib.sha256(f"{ip}{self.secret_key}".encode()).hexdigest()[:16]
    
    def validate_assessment_data(self, data: Dict[str, Any]) -> bool:
        """Validate assessment submission data"""
        required_fields = ['mode', 'answers']
        
        # Check required fields
        for field in required_fields:
            if field not in data:
                return False
        
        # Validate mode
        valid_modes = ['lite', 'standard', 'pro']
        if data['mode'] not in valid_modes:
            return False
        
        # Validate answers
        answers = data.get('answers', [])
        if not isinstance(answers, list) or len(answers) != 12:
            return False
        
        for answer in answers:
            if not isinstance(answer, int) or answer < 0 or answer > 3:
                return False
        
        return True
    
    def sanitize_input(self, text: str) -> str:
        """Sanitize user input to prevent XSS"""
        if not isinstance(text, str):
            return ""
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00']
        for char in dangerous_chars:
            text = text.replace(char, '')
        
        return text.strip()[:1000]  # Limit length
    
    def check_rate_limit(self, ip_hash: str, max_requests: int = 10, window: int = 3600) -> bool:
        """Check if IP is within rate limits"""
        current_time = time.time()
        
        # Clean old entries
        self._clean_rate_limit_cache(current_time, window)
        
        # Check current count
        if ip_hash not in _rate_limit_cache:
            _rate_limit_cache[ip_hash] = {
                'count': 1,
                'window_start': current_time,
                'last_request': current_time
            }
            return True
        
        entry = _rate_limit_cache[ip_hash]
        
        # Check if we're in the same window
        if current_time - entry['window_start'] < window:
            if entry['count'] >= max_requests:
                return False
            entry['count'] += 1
            entry['last_request'] = current_time
        else:
            # New window
            entry['count'] = 1
            entry['window_start'] = current_time
            entry['last_request'] = current_time
        
        return True
    
    def _clean_rate_limit_cache(self, current_time: float, window: int):
        """Clean old rate limit entries"""
        expired_keys = []
        for ip_hash, entry in _rate_limit_cache.items():
            if current_time - entry['window_start'] > window:
                expired_keys.append(ip_hash)
        
        for key in expired_keys:
            del _rate_limit_cache[key]
    
    def log_security_event(self, event_type: str, ip_hash: str, details: Dict[str, Any]):
        """Log security events for monitoring"""
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            'timestamp': timestamp,
            'event_type': event_type,
            'ip_hash': ip_hash,
            'details': details
        }
        
        # In production, send to security monitoring service
        print(f"SECURITY_EVENT: {json.dumps(log_entry)}")
    
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

# Security middleware decorators
def require_rate_limit(max_requests: int = 10, window: int = 3600):
    """Decorator to enforce rate limiting"""
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Get IP address
            ip = request.client.host
            ip_hash = hashlib.sha256(f"{ip}{secrets.token_urlsafe(16)}".encode()).hexdigest()[:16]
            
            # Check rate limit
            if not SecurityManager("").check_rate_limit(ip_hash, max_requests, window):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later."
                )
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator

def validate_assessment_data(func):
    """Decorator to validate assessment data"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract request data (adjust based on your FastAPI setup)
        if 'request' in kwargs:
            data = await kwargs['request'].json()
            if not SecurityManager("").validate_assessment_data(data):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid assessment data"
                )
        
        return await func(*args, **kwargs)
    return wrapper

# Security headers
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY", 
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    ),
    "Permissions-Policy": (
        "geolocation=(), "
        "microphone=(), "
        "camera=(), "
        "payment=(), "
        "usb=(), "
        "magnetometer=(), "
        "gyroscope=(), "
        "accelerometer=()"
    )
}

# Database security utilities
def secure_db_query(query: str, params: tuple = ()) -> str:
    """Validate and sanitize database queries"""
    # Simple SQL injection prevention
    dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE']
    query_upper = query.upper()
    
    for keyword in dangerous_keywords:
        if keyword in query_upper and 'SELECT' not in query_upper:
            raise ValueError(f"Dangerous SQL keyword detected: {keyword}")
    
    return query

def create_secure_connection(db_path: str) -> sqlite3.Connection:
    """Create a secure SQLite connection"""
    conn = sqlite3.connect(db_path)
    
    # Enable security features
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=1000")
    conn.execute("PRAGMA temp_store=MEMORY")
    
    # Disable potentially dangerous features
    conn.execute("PRAGMA secure_delete=ON")
    
    return conn
