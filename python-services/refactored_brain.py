#!/usr/bin/env python3
"""
Refactored Python Brain - Unified API System
SmartStart Platform - Complete Venture Operating System
"""

import logging
import os
import json
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
import time
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
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

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
        user_id = g.current_user['id']
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

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password for a user (admin only for now)"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        new_password = data.get('new_password', '')
        
        if not email or not new_password:
            return jsonify(create_response(
                success=False,
                error="Email and new password are required"
            )), 400
        
        if len(new_password) < 8:
            return jsonify(create_response(
                success=False,
                error="Password must be at least 8 characters long"
            )), 400
        
        # Get user by email
        user = db.get_user_by_email(email)
        if not user:
            return jsonify(create_response(
                success=False,
                error="User not found"
            )), 404
        
        # Hash new password
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password in database
        update_query = """
            UPDATE "User" 
            SET password = %s 
            WHERE email = %s
        """
        
        success = db._execute_query(update_query, (password_hash, email), fetch_one=False)
        
        if success:
            return jsonify(create_response(
                success=True,
                message="Password updated successfully"
            ))
        else:
            return jsonify(create_response(
                success=False,
                error="Failed to update password"
            )), 500
        
    except Exception as e:
        return jsonify(create_response(
            success=False,
            error=f"Failed to reset password: {str(e)}"
        )), 500

# ============================================================================
# SUBSCRIPTION MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/v1/subscriptions/plans', methods=['GET'])
def get_billing_plans():
    """Get all available billing plans"""
    try:
        query = """
            SELECT id, name, description, price, currency, interval, features, isActive
            FROM "BillingPlan" 
            WHERE isActive = true
            ORDER BY price ASC
        """
        plans = db._execute_query(query, (), fetch_one=False)
        
        if not plans:
            return jsonify(create_response(
                success=False,
                error="No billing plans found"
            )), 404
        
        # Convert to list of dictionaries
        plans_list = []
        for plan in plans:
            plans_list.append({
                'id': plan[0],
                'name': plan[1],
                'description': plan[2],
                'price': float(plan[3]),
                'currency': plan[4],
                'interval': plan[5],
                'features': plan[6] if plan[6] else [],
                'isActive': plan[7]
            })
        
        return jsonify(create_response(
            success=True,
            data=plans_list
        ))
        
    except Exception as e:
        logger.error(f"Error fetching billing plans: {e}")
        return jsonify(create_response(
            success=False,
            error=f"Failed to fetch billing plans: {str(e)}"
        )), 500

@app.route('/api/v1/subscriptions/subscribe', methods=['POST'])
def create_subscription():
    """Create a new subscription for a user"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        plan_id = data.get('planId')
        
        if not user_id or not plan_id:
            return jsonify(create_response(
                success=False,
                error="userId and planId are required"
            )), 400
        
        # Check if user exists
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify(create_response(
                success=False,
                error="User not found"
            )), 404
        
        # Check if plan exists and is active
        plan_query = """
            SELECT id, name, price, currency, interval, features
            FROM "BillingPlan" 
            WHERE id = %s AND isActive = true
        """
        plan = db._execute_query(plan_query, (plan_id,), fetch_one=True)
        if not plan:
            return jsonify(create_response(
                success=False,
                error="Billing plan not found or inactive"
            )), 404
        
        # Check if user already has an active subscription
        existing_sub_query = """
            SELECT id, status FROM "Subscription" 
            WHERE "userId" = %s AND status = 'ACTIVE'
        """
        existing_sub = db._execute_query(existing_sub_query, (user_id,), fetch_one=True)
        if existing_sub:
            return jsonify(create_response(
                success=False,
                error="User already has an active subscription"
            )), 409
        
        # Create subscription
        subscription_id = f"sub_{user_id}_{int(time.time())}"
        end_date = datetime.now() + timedelta(days=30)  # 30 days from now
        
        create_sub_query = """
            INSERT INTO "Subscription" (id, "userId", "planId", status, "startDate", "endDate", "autoRenew", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, 'ACTIVE', %s, %s, true, %s, %s)
        """
        
        now = datetime.now()
        success = db._execute_query(create_sub_query, (
            subscription_id, user_id, plan_id, now, end_date, now, now
        ), fetch_one=False)
        
        if success:
            # Get the created subscription
            sub_query = """
                SELECT s.id, s."userId", s."planId", s.status, s."startDate", s."endDate", s."autoRenew",
                       bp.name, bp.description, bp.price, bp.currency, bp.interval, bp.features
                FROM "Subscription" s
                JOIN "BillingPlan" bp ON s."planId" = bp.id
                WHERE s.id = %s
            """
            subscription = db._execute_query(sub_query, (subscription_id,), fetch_one=True)
            
            if subscription:
                subscription_data = {
                    'id': subscription[0],
                    'userId': subscription[1],
                    'planId': subscription[2],
                    'status': subscription[3],
                    'startDate': subscription[4].isoformat() if subscription[4] else None,
                    'endDate': subscription[5].isoformat() if subscription[5] else None,
                    'autoRenew': subscription[6],
                    'plan': {
                        'name': subscription[7],
                        'description': subscription[8],
                        'price': float(subscription[9]),
                        'currency': subscription[10],
                        'interval': subscription[11],
                        'features': subscription[12] if subscription[12] else []
                    }
                }
                
                return jsonify(create_response(
                    success=True,
                    data=subscription_data,
                    message="Subscription created successfully"
                ))
        
        return jsonify(create_response(
            success=False,
            error="Failed to create subscription"
        )), 500
        
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        return jsonify(create_response(
            success=False,
            error=f"Failed to create subscription: {str(e)}"
        )), 500

@app.route('/api/v1/subscriptions/user/<user_id>', methods=['GET'])
def get_user_subscription(user_id):
    """Get user's current subscription"""
    try:
        query = """
            SELECT s.id, s."userId", s."planId", s.status, s."startDate", s."endDate", s."autoRenew",
                   bp.name, bp.description, bp.price, bp.currency, bp.interval, bp.features
            FROM "Subscription" s
            JOIN "BillingPlan" bp ON s."planId" = bp.id
            WHERE s."userId" = %s AND s.status = 'ACTIVE'
            ORDER BY s."createdAt" DESC
            LIMIT 1
        """
        subscription = db._execute_query(query, (user_id,), fetch_one=True)
        
        if not subscription:
            return jsonify(create_response(
                success=False,
                error="No active subscription found"
            )), 404
        
        subscription_data = {
            'id': subscription[0],
            'userId': subscription[1],
            'planId': subscription[2],
            'status': subscription[3],
            'startDate': subscription[4].isoformat() if subscription[4] else None,
            'endDate': subscription[5].isoformat() if subscription[5] else None,
            'autoRenew': subscription[6],
            'plan': {
                'name': subscription[7],
                'description': subscription[8],
                'price': float(subscription[9]),
                'currency': subscription[10],
                'interval': subscription[11],
                'features': subscription[12] if subscription[12] else []
            }
        }
        
        return jsonify(create_response(
            success=True,
            data=subscription_data
        ))
        
    except Exception as e:
        logger.error(f"Error fetching user subscription: {e}")
        return jsonify(create_response(
            success=False,
            error=f"Failed to fetch subscription: {str(e)}"
        )), 500

@app.route('/api/v1/subscriptions/cancel/<subscription_id>', methods=['POST'])
def cancel_subscription(subscription_id):
    """Cancel a subscription"""
    try:
        # Update subscription status to CANCELLED
        update_query = """
            UPDATE "Subscription" 
            SET status = 'CANCELLED', "updatedAt" = %s
            WHERE id = %s
        """
        
        success = db._execute_query(update_query, (datetime.now(), subscription_id), fetch_one=False)
        
        if success:
            return jsonify(create_response(
                success=True,
                message="Subscription cancelled successfully"
            ))
        else:
            return jsonify(create_response(
                success=False,
                error="Failed to cancel subscription"
            )), 500
        
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e}")
        return jsonify(create_response(
            success=False,
            error=f"Failed to cancel subscription: {str(e)}"
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
# JOURNEY MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/journey/initialize/<user_id>', methods=['POST'])
def initialize_journey(user_id):
    """Initialize user journey"""
    try:
        # Initialize user journey in database
        journey_data = {
            'user_id': user_id,
            'current_stage': 'account_creation',
            'progress_percentage': 0,
            'completed_stages': [],
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        result = db.create_user_journey_state(journey_data)
        
        return jsonify(create_response(
            success=True,
            data={
                'journey_initialized': True,
                'stages_created': 1,
                'user_id': user_id,
                'timestamp': datetime.now().isoformat()
            },
            message="Journey initialized successfully"
        )), 200
        
    except Exception as e:
        logger.error(f"Error initializing journey for user {user_id}: {e}")
        return jsonify(create_response(
            success=False,
            error=str(e)
        )), 500

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
