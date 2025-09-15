#!/usr/bin/env python3
"""
Refactored Python Brain - Unified API System
SmartStart Platform - Complete Venture Operating System
"""

import logging
import os
import json
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Flask, jsonify, request, g
from flask_cors import CORS

# Import direct database connector
from database_connector_direct import db
logger = logging.getLogger(__name__)
logger.info("Using direct database connection")

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["https://smartstart-frontend.onrender.com", "https://smartstart-api.onrender.com"], 
     allow_headers=["Content-Type", "Authorization"], 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = 'HS256'

# Role Hierarchy (higher number = more permissions)
ROLE_HIERARCHY = {
    'GUEST': 0,
    'MEMBER': 1,
    'SUBSCRIBER': 2,
    'SEAT_HOLDER': 3,
    'VENTURE_OWNER': 4,
    'VENTURE_PARTICIPANT': 5,
    'CONFIDENTIAL_ACCESS': 6,
    'RESTRICTED_ACCESS': 7,
    'HIGHLY_RESTRICTED_ACCESS': 8,
    'BILLING_ADMIN': 9,
    'SECURITY_ADMIN': 10,
    'LEGAL_ADMIN': 11,
    'SUPER_ADMIN': 12
}

# Permission Matrix
PERMISSIONS = {
    'user': {
        'read': ['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'write': ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'delete': ['SUPER_ADMIN']
    },
    'venture': {
        'read': ['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'write': ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'delete': ['VENTURE_OWNER', 'SUPER_ADMIN']
    },
    'buz_tokens': {
        'read': ['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'transfer': ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'stake': ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'mint': ['SUPER_ADMIN'],
        'burn': ['SUPER_ADMIN']
    },
    'legal_documents': {
        'read': ['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'sign': ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'create': ['LEGAL_ADMIN', 'SUPER_ADMIN'],
        'delete': ['LEGAL_ADMIN', 'SUPER_ADMIN']
    },
    'subscriptions': {
        'read': ['SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'create': ['MEMBER', 'SUBSCRIBER', 'SEAT_HOLDER', 'VENTURE_OWNER', 'VENTURE_PARTICIPANT', 'CONFIDENTIAL_ACCESS', 'RESTRICTED_ACCESS', 'HIGHLY_RESTRICTED_ACCESS', 'BILLING_ADMIN', 'SECURITY_ADMIN', 'LEGAL_ADMIN', 'SUPER_ADMIN'],
        'update': ['BILLING_ADMIN', 'SUPER_ADMIN'],
        'delete': ['BILLING_ADMIN', 'SUPER_ADMIN']
    }
}

# Utility Functions
def generate_request_id():
    """Generate unique request ID"""
    return f"req_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"

def create_response(success=True, data=None, message=None, error=None):
    """Create standardized API response"""
    return {
        "success": success,
        "data": data,
        "message": message,
        "error": error,
        "timestamp": datetime.now().isoformat(),
        "requestId": generate_request_id()
    }

def extract_user_from_token():
    """Extract user information from JWT token"""
    token = request.headers.get('Authorization')
    if not token:
        return None
    
    try:
        token = token.replace('Bearer ', '')
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            'id': payload.get('userId') or payload.get('id'),
            'role': payload.get('role', 'GUEST'),
            'email': payload.get('email')
        }
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        logger.error(f"Token extraction error: {e}")
        return None

def require_permission(resource, action):
    """Decorator to require specific permission for endpoint"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = extract_user_from_token()
            if not user:
                return jsonify(create_response(
                    success=False,
                    error="Authorization token required"
                )), 401
            
            if not has_permission(user['role'], resource, action):
                return jsonify(create_response(
                    success=False,
                    error=f"Insufficient permissions for {action} on {resource}"
                )), 403
            
            # Add user context to request
            g.current_user = user
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def has_permission(user_role, resource, action):
    """Check if user role has permission for resource-action"""
    if user_role not in ROLE_HIERARCHY:
        return False
    
    if resource not in PERMISSIONS:
        return False
    
    if action not in PERMISSIONS[resource]:
        return False
    
    return user_role in PERMISSIONS[resource][action]

def require_ownership(resource_id_param='id'):
    """Decorator to require resource ownership"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            resource_id = kwargs.get(resource_id_param)
            user_id = g.current_user['id']
            user_role = g.current_user['role']
            
            # Super admin can access everything
            if user_role == 'SUPER_ADMIN':
                return f(*args, **kwargs)
            
            # Check ownership
            if not is_owner(user_id, resource_id, resource_id_param):
                return jsonify(create_response(
                    success=False,
                    error="Access denied: You don't own this resource"
                )), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def is_owner(user_id, resource_id, resource_type):
    """Check if user owns the resource"""
    if resource_type == 'user_id':
        return user_id == resource_id
    elif resource_type == 'venture_id':
        venture = db.get_venture_by_id(resource_id)
        return venture and venture.get('owner_id') == user_id
    elif resource_type == 'team_id':
        team = db.get_team_by_id(resource_id)
        return team and team.get('owner_id') == user_id
    return False

# Health Check
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify(create_response(
            success=True,
            data={
                "status": "healthy",
                "service": "refactored-python-brain-v2.0.0",
                "features": [
                    "Unified API System",
                    "Complete RBAC Implementation",
                    "CRUD Operations",
                    "Real Data Integration",
                    "Legal Document Management",
                    "BUZ Token System",
                    "Subscription Management",
                    "Venture Management",
                    "Team Collaboration",
                    "Analytics Dashboard"
                ],
                "version": "2.0.0",
                "python_brain": "operational"
            }
        )), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """Register new user with full database integration and RBAC"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify(create_response(
                    success=False,
                    error=f"Missing required field: {field}"
                )), 400
        
        # Validate email format
        email = data.get('email', '').strip().lower()
        if '@' not in email or '.' not in email.split('@')[1]:
            return jsonify(create_response(
                success=False,
                error="Invalid email format"
            )), 400
        
        # Validate password strength
        password = data.get('password', '')
        if len(password) < 8:
            return jsonify(create_response(
                success=False,
                error="Password must be at least 8 characters long"
            )), 400
        
        # Check if user already exists
        existing_user = db.get_user_by_email(email)
        if existing_user:
            return jsonify(create_response(
                success=False,
                error="User with this email already exists"
            )), 409
        
        # Hash password
        import bcrypt
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user data with correct column names
        user_data = {
            'id': f"user_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{email.split('@')[0]}",
            'email': email,
            'username': email.split('@')[0],
            'name': f"{data.get('firstName', '')} {data.get('lastName', '')}".strip(),
            'firstName': data.get('firstName', ''),
            'lastName': data.get('lastName', ''),
            'password': password_hash,
            'role': 'MEMBER',  # Default role for new users
            'level': 'OWLET',  # Default level
            'status': 'ACTIVE',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'tenantId': 'default',
            'xp': 0,
            'reputation': 0,
            'lastActive': datetime.now().isoformat(),
            'totalPortfolioValue': 0.0,
            'activeProjectsCount': 0,
            'totalContributions': 0,
            'totalEquityOwned': 0.0,
            'averageEquityPerProject': 0.0,
            'portfolioDiversity': 0
        }
        
        # Create user in database
        new_user = db.create_user(user_data)
        
        if new_user:
            # Generate JWT token
            token_payload = {
                'userId': new_user['id'],
                'email': new_user['email'],
                'role': new_user['role'],
                'level': new_user['level'],
                'exp': datetime.now(timezone.utc) + timedelta(days=7)
            }
            
            token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')
            
            # Initialize user journey
            try:
                journey_data = {
                    'user_id': new_user['id'],
                    'current_stage': 'account_creation',
                    'progress_percentage': 0,
                    'completed_stages': [],
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }
                db.create_user_journey_state(journey_data)
            except Exception as journey_error:
                logger.warning(f"Failed to initialize user journey: {journey_error}")
            
            # Create default subscription (free tier)
            try:
                subscription_data = {
                    'user_id': new_user['id'],
                    'plan_id': 'free_tier',  # Default free plan
                    'status': 'ACTIVE',
                    'start_date': datetime.now().isoformat(),
                    'end_date': (datetime.now() + timedelta(days=30)).isoformat(),
                    'auto_renew': False,
                    'created_at': datetime.now().isoformat()
                }
                db.create_subscription(subscription_data)
            except Exception as sub_error:
                logger.warning(f"Failed to create default subscription: {sub_error}")
            
            return jsonify(create_response(
                success=True,
                data={
                    "user": {
                        "id": new_user['id'],
                        "email": new_user['email'],
                        "name": new_user['name'],
                        "firstName": new_user['firstName'],
                        "lastName": new_user['lastName'],
                        "role": new_user['role'],
                        "level": new_user['level'],
                        "status": new_user['status'],
                        "createdAt": new_user['createdAt'],
                        "updatedAt": new_user['updatedAt']
                    },
                    "token": token
                },
                message="User registered successfully"
            )), 201
        else:
            return jsonify(create_response(
                success=False,
                error="Failed to create user"
            )), 500
            
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """Login user with database verification and JWT token generation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify(create_response(
                success=False,
                error="Email and password are required"
            )), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Get user by email
        user = db.get_user_by_email(email)
        if not user:
            return jsonify(create_response(
                success=False,
                error="Invalid email or password"
            )), 401
        
        # Verify password
        import bcrypt
        if not bcrypt.checkpw(password.encode('utf-8'), user.get('password', '').encode('utf-8')):
            return jsonify(create_response(
                success=False,
                error="Invalid email or password"
            )), 401
        
        # Check if user is active
        if user.get('status') != 'ACTIVE':
            return jsonify(create_response(
                success=False,
                error="Account is not active"
            )), 401
        
        # Update last active
        db.update_user(user['id'], {
            'lastActive': datetime.now().isoformat()
        })
        
        # Generate JWT token
        token_payload = {
            'userId': user['id'],
            'email': user['email'],
            'role': user['role'],
            'level': user['level'],
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }
        
        token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')
        
        return jsonify(create_response(
            success=True,
            data={
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "name": user['name'],
                    "firstName": user['firstName'],
                    "lastName": user['lastName'],
                    "role": user['role'],
                    "level": user['level'],
                    "status": user['status'],
                    "createdAt": user['createdAt'],
                    "updatedAt": user['updatedAt']
                },
                "token": token
            },
            message="Login successful"
        )), 200
        
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/auth/me', methods=['GET'])
@require_permission('user', 'read')
def get_current_user():
    """Get current user information with RBAC"""
    try:
        user_id = g.user_id
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify(create_response(
                success=False,
                error="User not found"
            )), 404
        
        # Remove password from response
        user.pop('password', None)
        
        return jsonify(create_response(
            success=True,
            data=user
        )), 200
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/auth/logout', methods=['POST'])
@require_permission('user', 'read')
def logout_user():
    """Logout user (client-side token removal)"""
    try:
        return jsonify(create_response(
            success=True,
            message="Logged out successfully"
        )), 200
        
    except Exception as e:
        logger.error(f"Error logging out user: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# USER MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/v1/user/<user_id>', methods=['GET'])
@require_permission('user', 'read')
def get_user(user_id):
    """Get user data with RBAC"""
    try:
        user = db.get_user_by_id(user_id)
        if user:
            return jsonify(create_response(
                success=True,
                data=user
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error="User not found"
            )), 404
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/user/<user_id>', methods=['PUT'])
@require_permission('user', 'write')
@require_ownership('user_id')
def update_user(user_id):
    """Update user data with RBAC and ownership check"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        # Add audit fields
        data['updated_by'] = g.current_user['id']
        data['updated_at'] = datetime.now().isoformat()
        
        user = db.update_user(user_id, data)
        if user:
            return jsonify(create_response(
                success=True,
                data=user,
                message="User updated successfully"
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error="User not found"
            )), 404
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# VENTURE MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/v1/ventures/list/all', methods=['GET'])
@require_permission('venture', 'read')
def get_all_ventures():
    """Get all ventures with RBAC"""
    try:
        ventures = db.get_user_ventures("all")
        return jsonify(create_response(
            success=True,
            data=ventures
        )), 200
    except Exception as e:
        logger.error(f"Error getting ventures: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/ventures/create', methods=['POST'])
@require_permission('venture', 'write')
def create_venture():
    """Create new venture with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        # Add audit fields
        data['owner_id'] = g.current_user['id']
        data['created_by'] = g.current_user['id']
        data['created_at'] = datetime.now().isoformat()
        
        venture = db.create_venture(data)
        if venture:
            return jsonify(create_response(
                success=True,
                data=venture,
                message="Venture created successfully"
            )), 201
        else:
            return jsonify(create_response(
                success=False,
                error="Failed to create venture"
            )), 500
    except Exception as e:
        logger.error(f"Error creating venture: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/ventures/<venture_id>', methods=['GET'])
@require_permission('venture', 'read')
def get_venture(venture_id):
    """Get venture details with RBAC"""
    try:
        venture = db.get_venture_by_id(venture_id)
        if venture:
            return jsonify(create_response(
                success=True,
                data=venture
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error="Venture not found"
            )), 404
    except Exception as e:
        logger.error(f"Error getting venture {venture_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/ventures/<venture_id>', methods=['PUT'])
@require_permission('venture', 'write')
@require_ownership('venture_id')
def update_venture(venture_id):
    """Update venture with RBAC and ownership check"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        # Add audit fields
        data['updated_by'] = g.current_user['id']
        data['updated_at'] = datetime.now().isoformat()
        
        venture = db.update_venture(venture_id, data)
        if venture:
            return jsonify(create_response(
                success=True,
                data=venture,
                message="Venture updated successfully"
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error="Venture not found"
            )), 404
    except Exception as e:
        logger.error(f"Error updating venture {venture_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# BUZ TOKEN SYSTEM ENDPOINTS
# ============================================================================

@app.route('/api/v1/buz/balance/<user_id>', methods=['GET'])
@require_permission('buz_tokens', 'read')
def get_buz_balance(user_id):
    """Get BUZ token balance with RBAC"""
    try:
        buz_data = db.get_user_buz_tokens(user_id)
        return jsonify(create_response(
            success=True,
            data=buz_data
        )), 200
    except Exception as e:
        logger.error(f"Error getting BUZ balance for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/buz/supply', methods=['GET'])
def get_buz_supply():
    """Get BUZ token supply information (public endpoint)"""
    try:
        supply_data = {
            "total": 999999999,
            "circulating": 500000000,
            "price_usd": 0.02,
            "currentPrice": 0.02,
            "market_cap": 10000000,
            "currency": "USD"
        }
        return jsonify(create_response(
            success=True,
            data=supply_data
        )), 200
    except Exception as e:
        logger.error(f"Error getting BUZ supply: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/buz/stake', methods=['POST'])
@require_permission('buz_tokens', 'stake')
def stake_buz_tokens():
    """Stake BUZ tokens with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        user_id = data.get('userId') or data.get('user_id')
        amount = data.get('amount', 0)
        staking_period = data.get('staking_period', 30)
        staking_type = data.get('staking_type', 'STANDARD')
        
        if not user_id or amount <= 0:
            return jsonify(create_response(
                success=False,
                error="Invalid user ID or amount"
            )), 400
        
        # Process staking in database
        result = db.stake_buz_tokens(user_id, amount, staking_period, staking_type)
        
        return jsonify(create_response(
            success=True,
            data=result,
            message="BUZ tokens staked successfully"
        )), 200
    except Exception as e:
        logger.error(f"Error staking BUZ tokens: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/buz/unstake', methods=['POST'])
@require_permission('buz_tokens', 'stake')
def unstake_buz_tokens():
    """Unstake BUZ tokens with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        user_id = data.get('userId') or data.get('user_id')
        amount = data.get('amount', 0)
        
        if not user_id or amount <= 0:
            return jsonify(create_response(
                success=False,
                error="Invalid user ID or amount"
            )), 400
        
        # Process unstaking in database
        result = db.unstake_buz_tokens(user_id, amount)
        
        return jsonify(create_response(
            success=True,
            data=result,
            message="BUZ tokens unstaked successfully"
        )), 200
    except Exception as e:
        logger.error(f"Error unstaking BUZ tokens: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/buz/transfer', methods=['POST'])
@require_permission('buz_tokens', 'transfer')
def transfer_buz_tokens():
    """Transfer BUZ tokens with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        from_user_id = data.get('fromUserId') or data.get('from_user_id')
        to_user_id = data.get('toUserId') or data.get('to_user_id')
        amount = data.get('amount', 0)
        
        if not from_user_id or not to_user_id or amount <= 0:
            return jsonify(create_response(
                success=False,
                error="Invalid user IDs or amount"
            )), 400
        
        # Process transfer in database
        result = db.transfer_buz_tokens(from_user_id, to_user_id, amount)
        
        return jsonify(create_response(
            success=True,
            data=result,
            message="BUZ tokens transferred successfully"
        )), 200
    except Exception as e:
        logger.error(f"Error transferring BUZ tokens: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# LEGAL DOCUMENT SYSTEM ENDPOINTS
# ============================================================================

@app.route('/api/v1/legal/documents/<user_id>', methods=['GET'])
@require_permission('legal_documents', 'read')
def get_legal_documents(user_id):
    """Get user legal documents with RBAC"""
    try:
        documents = db.get_user_legal_documents(user_id)
        return jsonify(create_response(
            success=True,
            data=documents
        )), 200
    except Exception as e:
        logger.error(f"Error getting legal documents for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/legal/documents/sign', methods=['POST'])
@require_permission('legal_documents', 'sign')
def sign_document():
    """Sign legal document with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        user_id = data.get('userId') or data.get('user_id')
        document_id = data.get('documentId') or data.get('document_id')
        signature_data = data.get('signature')
        
        if not user_id or not document_id or not signature_data:
            return jsonify(create_response(
                success=False,
                error="Missing required fields"
            )), 400
        
        # Process document signing
        result = db.sign_legal_document(user_id, document_id, signature_data)
        
        return jsonify(create_response(
            success=True,
            data=result,
            message="Document signed successfully"
        )), 200
    except Exception as e:
        logger.error(f"Error signing document: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/legal/status/<user_id>', methods=['GET'])
@require_permission('legal_documents', 'read')
def get_legal_status(user_id):
    """Get user legal status with RBAC"""
    try:
        status = db.get_user_legal_status(user_id)
        return jsonify(create_response(
            success=True,
            data=status
        )), 200
    except Exception as e:
        logger.error(f"Error getting legal status for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# SUBSCRIPTION SYSTEM ENDPOINTS
# ============================================================================

@app.route('/api/v1/subscriptions/plans', methods=['GET'])
def get_subscription_plans():
    """Get subscription plans (public endpoint)"""
    try:
        plans = db.get_subscription_plans()
        return jsonify(create_response(
            success=True,
            data=plans
        )), 200
    except Exception as e:
        logger.error(f"Error getting subscription plans: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/subscriptions/subscribe', methods=['POST'])
@require_permission('subscriptions', 'create')
def subscribe_user():
    """Subscribe user with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        user_id = data.get('userId') or data.get('user_id')
        plan_id = data.get('planId') or data.get('plan_id')
        
        if not user_id or not plan_id:
            return jsonify(create_response(
                success=False,
                error="Missing required fields"
            )), 400
        
        # Create subscription
        subscription = db.create_subscription(user_id, plan_id)
        
        return jsonify(create_response(
            success=True,
            data=subscription,
            message="Subscription created successfully"
        )), 200
    except Exception as e:
        logger.error(f"Error subscribing user: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/subscriptions/status/<user_id>', methods=['GET'])
@require_permission('subscriptions', 'read')
def get_subscription_status(user_id):
    """Get user subscription status with RBAC"""
    try:
        status = db.get_user_subscription_status(user_id)
        return jsonify(create_response(
            success=True,
            data=status
        )), 200
    except Exception as e:
        logger.error(f"Error getting subscription status for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# JOURNEY SYSTEM ENDPOINTS
# ============================================================================

@app.route('/api/v1/journey/status/<user_id>', methods=['GET'])
@require_permission('user', 'read')
def get_journey_status(user_id):
    """Get user journey status with RBAC"""
    try:
        status = db.get_user_journey_status(user_id)
        return jsonify(create_response(
            success=True,
            data=status
        )), 200
    except Exception as e:
        logger.error(f"Error getting journey status for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/journey/complete-stage', methods=['POST'])
@require_permission('user', 'write')
def complete_journey_stage():
    """Complete journey stage with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        user_id = data.get('userId') or data.get('user_id')
        stage = data.get('stage')
        
        if not user_id or not stage:
            return jsonify(create_response(
                success=False,
                error="Missing required fields"
            )), 400
        
        # Complete stage
        result = db.complete_journey_stage(user_id, stage)
        
        return jsonify(create_response(
            success=True,
            data=result,
            message="Journey stage completed successfully"
        )), 200
    except Exception as e:
        logger.error(f"Error completing journey stage: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# TEAM MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/v1/teams/<team_id>', methods=['GET'])
@require_permission('venture', 'read')
def get_team(team_id):
    """Get team details with RBAC"""
    try:
        team = db.get_team_by_id(team_id)
        if team:
            return jsonify(create_response(
                success=True,
                data=team
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error="Team not found"
            )), 404
    except Exception as e:
        logger.error(f"Error getting team {team_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/teams/create', methods=['POST'])
@require_permission('venture', 'write')
def create_team():
    """Create new team with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        # Add audit fields
        data['owner_id'] = g.current_user['id']
        data['created_by'] = g.current_user['id']
        data['created_at'] = datetime.now().isoformat()
        
        team = db.create_team(data)
        if team:
            return jsonify(create_response(
                success=True,
                data=team,
                message="Team created successfully"
            )), 201
        else:
            return jsonify(create_response(
                success=False,
                error="Failed to create team"
            )), 500
    except Exception as e:
        logger.error(f"Error creating team: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# UMBRELLA NETWORK ENDPOINTS
# ============================================================================

@app.route('/api/v1/umbrella/relationships/<user_id>', methods=['GET'])
@require_permission('user', 'read')
def get_umbrella_relationships(user_id):
    """Get umbrella relationships with RBAC"""
    try:
        relationships = db.get_umbrella_relationships(user_id)
        return jsonify(create_response(
            success=True,
            data=relationships
        )), 200
    except Exception as e:
        logger.error(f"Error getting umbrella relationships for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/umbrella/create-relationship', methods=['POST'])
@require_permission('user', 'write')
def create_umbrella_relationship():
    """Create umbrella relationship with RBAC"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        # Add audit fields
        data['created_by'] = g.current_user['id']
        data['created_at'] = datetime.now().isoformat()
        
        relationship = db.create_umbrella_relationship(data)
        
        return jsonify(create_response(
            success=True,
            data=relationship,
            message="Umbrella relationship created successfully"
        )), 200
    except Exception as e:
        logger.error(f"Error creating umbrella relationship: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@app.route('/api/v1/analytics/user/<user_id>', methods=['GET'])
@require_permission('user', 'read')
def get_user_analytics(user_id):
    """Get user analytics with RBAC"""
    try:
        analytics = db.get_user_analytics(user_id)
        return jsonify(create_response(
            success=True,
            data=analytics
        )), 200
    except Exception as e:
        logger.error(f"Error getting analytics for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

@app.route('/api/v1/analytics/venture/<venture_id>', methods=['GET'])
@require_permission('venture', 'read')
def get_venture_analytics(venture_id):
    """Get venture analytics with RBAC"""
    try:
        analytics = db.get_venture_analytics(venture_id)
        return jsonify(create_response(
            success=True,
            data=analytics
        )), 200
    except Exception as e:
        logger.error(f"Error getting analytics for venture {venture_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify(create_response(
        success=False,
        error="Endpoint not found"
    )), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify(create_response(
        success=False,
        error="Method not allowed"
    )), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify(create_response(
        success=False,
        error="Internal server error"
    )), 500

# ============================================================================
# AUTHENTICATION & REGISTRATION ENDPOINTS
# ============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """Register a new user with comprehensive validation"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify(create_response(
                    success=False,
                    error=f"Missing required field: {field}"
                )), 400
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify(create_response(
                success=False,
                error="Invalid email format"
            )), 400
        
        # Validate password strength
        if len(data['password']) < 8:
            return jsonify(create_response(
                success=False,
                error="Password must be at least 8 characters long"
            )), 400
        
        # Check if user already exists
        existing_user = db.get_user_by_email(data['email'])
        if existing_user:
            return jsonify(create_response(
                success=False,
                error="User with this email already exists"
            )), 409
        
        # Hash password
        import bcrypt
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user data
        user_data = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'email': data['email'],
            'password': password_hash,
            'name': f"{data['firstName']} {data['lastName']}",
            'role': 'TEAM_MEMBER',
            'status': 'ACTIVE',
            'created_at': datetime.now().isoformat()
        }
        
        # Create user in database
        user = db.create_user(user_data)
        
        if not user:
            return jsonify(create_response(
                success=False,
                error="Failed to create user"
            )), 500
        
        # Generate JWT token
        token_payload = {
            'id': user['id'],
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.now() + timedelta(days=7)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Initialize user journey
        try:
            journey_result = db.initialize_user_journey(user['id'])
            if not journey_result['success']:
                logger.warning(f"Failed to initialize journey for user {user['id']}: {journey_result.get('error')}")
        except Exception as journey_error:
            logger.warning(f"Journey initialization error for user {user['id']}: {journey_error}")
        
        return jsonify(create_response(
            success=True,
            data={
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'firstName': user['firstName'],
                    'lastName': user['lastName'],
                    'name': user['name'],
                    'role': user['role'],
                    'createdAt': user['created_at']
                },
                'token': token
            },
            message="User registered successfully"
        )), 201
        
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        return jsonify(create_response(
            success=False,
            error="Internal server error"
        )), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify(create_response(
                success=False,
                error="Email and password required"
            )), 400
        
        # Get user by email
        user = db.get_user_by_email(data['email'])
        if not user:
            return jsonify(create_response(
                success=False,
                error="Invalid credentials"
            )), 401
        
        # Verify password
        import bcrypt
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify(create_response(
                success=False,
                error="Invalid credentials"
            )), 401
        
        # Generate JWT token
        token_payload = {
            'id': user['id'],
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.now() + timedelta(days=7)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return jsonify(create_response(
            success=True,
            data={
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'firstName': user['firstName'],
                    'lastName': user['lastName'],
                    'name': user['name'],
                    'role': user['role'],
                    'createdAt': user['created_at']
                },
                'token': token
            },
            message="Login successful"
        )), 200
        
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        return jsonify(create_response(
            success=False,
            error="Internal server error"
        )), 500

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current authenticated user"""
    try:
        user_id = g.current_user['id']
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify(create_response(
                success=False,
                error="User not found"
            )), 404
        
        return jsonify(create_response(
            success=True,
            data={
                'id': user['id'],
                'email': user['email'],
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'name': user['name'],
                'role': user['role'],
                'status': user['status'],
                'createdAt': user['created_at']
            }
        )), 200
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return jsonify(create_response(
            success=False,
            error="Internal server error"
        )), 500

# ============================================================================
# BUZ TOKEN MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/v1/buz/supply', methods=['GET'])
def get_buz_supply():
    """Get BUZ token supply information"""
    try:
        supply_data = db.get_buz_supply()
        return jsonify(create_response(
            success=True,
            data=supply_data
        )), 200
    except Exception as e:
        logger.error(f"Error getting BUZ supply: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

@app.route('/api/v1/buz/balance/<user_id>', methods=['GET'])
@require_auth
def get_buz_balance(user_id):
    """Get user's BUZ token balance"""
    try:
        balance = db.get_user_buz_balance(user_id)
        return jsonify(create_response(
            success=True,
            data=balance
        )), 200
    except Exception as e:
        logger.error(f"Error getting BUZ balance for user {user_id}: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

@app.route('/api/v1/buz/transfer', methods=['POST'])
@require_auth
def transfer_buz_tokens():
    """Transfer BUZ tokens between users"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        required_fields = ['to_user_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify(create_response(
                    success=False,
                    error=f"Missing required field: {field}"
                )), 400
        
        from_user_id = g.current_user['id']
        to_user_id = data['to_user_id']
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify(create_response(
                success=False,
                error="Amount must be positive"
            )), 400
        
        # Check if user has sufficient balance
        sender_balance = db.get_user_buz_balance(from_user_id)
        if sender_balance['balance'] < amount:
            return jsonify(create_response(
                success=False,
                error="Insufficient BUZ token balance"
            )), 400
        
        # Perform transfer
        result = db.transfer_buz_tokens(from_user_id, to_user_id, amount)
        
        if result['success']:
            return jsonify(create_response(
                success=True,
                data={
                    'transfer_id': result['transfer_id'],
                    'from_user_id': from_user_id,
                    'to_user_id': to_user_id,
                    'amount': amount,
                    'new_balance': result['new_balance']
                },
                message="BUZ tokens transferred successfully"
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error=result.get('error', 'Transfer failed')
            )), 400
            
    except Exception as e:
        logger.error(f"Error transferring BUZ tokens: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

@app.route('/api/v1/buz/stake', methods=['POST'])
@require_auth
def stake_buz_tokens():
    """Stake BUZ tokens for rewards"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        required_fields = ['amount', 'duration']
        for field in required_fields:
            if field not in data:
                return jsonify(create_response(
                    success=False,
                    error=f"Missing required field: {field}"
                )), 400
        
        user_id = g.current_user['id']
        amount = float(data['amount'])
        duration = int(data['duration'])  # in days
        
        if amount <= 0:
            return jsonify(create_response(
                success=False,
                error="Amount must be positive"
            )), 400
        
        if duration < 1:
            return jsonify(create_response(
                success=False,
                error="Duration must be at least 1 day"
            )), 400
        
        # Check if user has sufficient balance
        user_balance = db.get_user_buz_balance(user_id)
        if user_balance['balance'] < amount:
            return jsonify(create_response(
                success=False,
                error="Insufficient BUZ token balance"
            )), 400
        
        # Create staking record
        result = db.stake_buz_tokens(user_id, amount, duration)
        
        if result['success']:
            return jsonify(create_response(
                success=True,
                data={
                    'stake_id': result['stake_id'],
                    'user_id': user_id,
                    'amount': amount,
                    'duration': duration,
                    'apy': result.get('apy', 0),
                    'expected_rewards': result.get('expected_rewards', 0),
                    'stake_date': result['stake_date'],
                    'maturity_date': result['maturity_date']
                },
                message="BUZ tokens staked successfully"
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error=result.get('error', 'Staking failed')
            )), 400
            
    except Exception as e:
        logger.error(f"Error staking BUZ tokens: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

@app.route('/api/v1/buz/earn', methods=['POST'])
@require_auth
def earn_buz_tokens():
    """Earn BUZ tokens for platform activity"""
    try:
        data = request.get_json()
        if not data:
            return jsonify(create_response(
                success=False,
                error="Request body required"
            )), 400
        
        required_fields = ['amount', 'activity']
        for field in required_fields:
            if field not in data:
                return jsonify(create_response(
                    success=False,
                    error=f"Missing required field: {field}"
                )), 400
        
        user_id = g.current_user['id']
        amount = float(data['amount'])
        activity = data['activity']
        source_system = data.get('source_system', 'platform')
        source_id = data.get('source_id')
        
        if amount <= 0:
            return jsonify(create_response(
                success=False,
                error="Amount must be positive"
            )), 400
        
        # Award BUZ tokens
        result = db.earn_buz_tokens(user_id, amount, activity, source_system, source_id)
        
        if result['success']:
            return jsonify(create_response(
                success=True,
                data={
                    'transaction_id': result['transaction_id'],
                    'user_id': user_id,
                    'amount': amount,
                    'activity': activity,
                    'new_balance': result['new_balance'],
                    'total_earned': result['total_earned']
                },
                message="BUZ tokens earned successfully"
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error=result.get('error', 'Failed to earn BUZ tokens')
            )), 400
            
    except Exception as e:
        logger.error(f"Error earning BUZ tokens: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

# ============================================================================
# JOURNEY MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/journey/status/<user_id>', methods=['GET'])
@require_auth
def get_journey_status(user_id):
    """Get user's journey status and progress"""
    try:
        # Get user's journey states
        user_states = db.get_user_journey_states(user_id)
        
        if not user_states:
            # Create initial journey states if none exist
            stages = db.get_all_journey_stages()
            for stage in stages:
                db.create_user_journey_state(user_id, stage['id'], 'NOT_STARTED')
            user_states = db.get_user_journey_states(user_id)
        
        # Calculate progress
        total_stages = len(user_states)
        completed_stages = len([s for s in user_states if s['status'] == 'COMPLETED'])
        percentage = round((completed_stages / total_stages) * 100) if total_stages > 0 else 0
        
        # Find current and next stages
        current_stage = next((s for s in user_states if s['status'] == 'IN_PROGRESS'), None)
        next_stage = next((s for s in user_states if s['status'] == 'NOT_STARTED'), None)
        
        return jsonify(create_response(
            success=True,
            data={
                'userStates': user_states,
                'progress': {
                    'completedStages': completed_stages,
                    'totalStages': total_stages,
                    'percentage': percentage
                },
                'currentStage': current_stage,
                'nextStage': next_stage
            }
        )), 200
    except Exception as e:
        logger.error(f"Error getting journey status for user {user_id}: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

@app.route('/api/journey/initialize/<user_id>', methods=['POST'])
@require_auth
def initialize_journey(user_id):
    """Initialize user journey with all stages"""
    try:
        # Check if journey already exists
        existing_states = db.get_user_journey_states(user_id)
        if existing_states:
            return jsonify(create_response(
                success=True,
                data={
                    'journey_initialized': True,
                    'stages_created': len(existing_states),
                    'user_id': user_id,
                    'timestamp': datetime.now().isoformat(),
                    'message': 'Journey already initialized'
                }
            )), 200
        
        # Get all journey stages
        stages = db.get_all_journey_stages()
        if not stages:
            return jsonify(create_response(
                success=False,
                error='No journey stages found in database'
            )), 400
        
        # Create journey states for all stages
        created_count = 0
        for stage in stages:
            try:
                db.create_user_journey_state(
                    user_id, 
                    stage['id'], 
                    'NOT_STARTED',
                    {
                        'stageName': stage['name'],
                        'stageOrder': stage['order'],
                        'initializedAt': datetime.now().isoformat()
                    }
                )
                created_count += 1
            except Exception as stage_error:
                logger.warning(f"Failed to create journey state for stage {stage['id']}: {stage_error}")
                continue
        
        return jsonify(create_response(
            success=True,
            data={
                'journey_initialized': True,
                'stages_created': created_count,
                'user_id': user_id,
                'timestamp': datetime.now().isoformat()
            },
            message=f'Journey initialized with {created_count} stages'
        )), 200
    except Exception as e:
        logger.error(f"Error initializing journey for user {user_id}: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

@app.route('/api/journey/progress/<user_id>', methods=['POST'])
@require_auth
def update_journey_progress(user_id):
    """Update user's journey progress"""
    try:
        data = request.get_json()
        action = data.get('action')
        progress_data = data.get('data', {})
        
        if not action:
            return jsonify(create_response(
                success=False,
                error='Action is required'
            )), 400
        
        # Update journey progress based on action
        result = db.update_journey_progress(user_id, action, progress_data)
        
        if result['success']:
            return jsonify(create_response(
                success=True,
                data={
                    'stage_updated': True,
                    'progress_percentage': result.get('percentage', 0),
                    'current_stage': result.get('current_stage', ''),
                    'next_stage': result.get('next_stage'),
                    'action': action
                }
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error=result.get('error', 'Failed to update journey progress')
            )), 400
    except Exception as e:
        logger.error(f"Error updating journey progress for user {user_id}: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

@app.route('/api/journey/complete/<user_id>', methods=['POST'])
@require_auth
def complete_journey_stage(user_id):
    """Complete a specific journey stage"""
    try:
        data = request.get_json()
        stage_id = data.get('stageId')
        completion_data = data.get('data', {})
        
        if not stage_id:
            return jsonify(create_response(
                success=False,
                error='Stage ID is required'
            )), 400
        
        # Complete the journey stage
        result = db.complete_journey_stage(user_id, stage_id, completion_data)
        
        if result['success']:
            return jsonify(create_response(
                success=True,
                data={
                    'stage_completed': True,
                    'stage_id': stage_id,
                    'stage_name': result.get('stage_name', ''),
                    'completion_data': completion_data,
                    'progress_percentage': result.get('percentage', 0)
                }
            )), 200
        else:
            return jsonify(create_response(
                success=False,
                error=result.get('error', 'Failed to complete journey stage')
            )), 400
    except Exception as e:
        logger.error(f"Error completing journey stage for user {user_id}: {e}")
        return jsonify(create_response(success=False, error=str(e))), 500

# ============================================================================
# APPLICATION STARTUP
# ============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5003))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Refactored Python Brain on port {port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"JWT Secret configured: {bool(JWT_SECRET)}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
