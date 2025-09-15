"""
Security Configuration for HIPAA Compliance
SmartStart Platform - Security Hardening
"""

import os
import logging
from datetime import timedelta

# Security headers for HIPAA compliance
SECURITY_HEADERS = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://smartstart-python-brain.onrender.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
}

# JWT Configuration for HIPAA compliance
JWT_CONFIG = {
    'algorithm': 'HS256',
    'expiration': timedelta(hours=1),  # Short-lived tokens
    'refresh_expiration': timedelta(days=7),
    'issuer': 'smartstart-platform',
    'audience': 'smartstart-users'
}

# Password requirements for HIPAA compliance
PASSWORD_REQUIREMENTS = {
    'min_length': 12,
    'require_uppercase': True,
    'require_lowercase': True,
    'require_numbers': True,
    'require_special': True,
    'max_age_days': 90,
    'history_count': 5
}

# Session security
SESSION_CONFIG = {
    'secure': True,
    'httponly': True,
    'samesite': 'Strict',
    'max_age': 3600  # 1 hour
}

# Audit logging for HIPAA compliance
AUDIT_EVENTS = [
    'user_login',
    'user_logout',
    'password_change',
    'document_access',
    'document_sign',
    'data_export',
    'admin_action',
    'security_violation'
]

def get_security_config():
    """Get security configuration based on environment"""
    return {
        'headers': SECURITY_HEADERS,
        'jwt': JWT_CONFIG,
        'password': PASSWORD_REQUIREMENTS,
        'session': SESSION_CONFIG,
        'audit_events': AUDIT_EVENTS,
        'environment': os.getenv('NODE_ENV', 'development')
    }

def is_hipaa_compliant():
    """Check if current configuration meets HIPAA requirements"""
    return (
        os.getenv('NODE_ENV') == 'production' and
        os.getenv('HIPAA_COMPLIANCE') == 'true' and
        os.getenv('ENCRYPTION_ENABLED') == 'true'
    )
