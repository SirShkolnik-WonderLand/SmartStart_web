#!/usr/bin/env python3
"""
Subscription Management Service
Handles all subscription-related operations with billing and plan management
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from flask import request, jsonify
import logging

@dataclass
class SubscriptionPlan:
    id: str
    name: str
    description: str
    price: float
    currency: str = 'USD'
    billing_cycle: str = 'MONTHLY'  # MONTHLY, YEARLY, LIFETIME
    features: List[str] = None
    limits: Dict[str, Any] = None
    is_active: bool = True
    created_at: str = None
    updated_at: str = None

    def __post_init__(self):
        if self.features is None:
            self.features = []
        if self.limits is None:
            self.limits = {}
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow().isoformat()

@dataclass
class UserSubscription:
    id: str
    user_id: str
    plan_id: str
    status: str = 'ACTIVE'  # ACTIVE, CANCELLED, EXPIRED, SUSPENDED
    start_date: str = None
    end_date: str = None
    auto_renew: bool = True
    payment_method: str = None
    billing_address: Dict = None
    usage: Dict[str, Any] = None
    created_at: str = None
    updated_at: str = None

    def __post_init__(self):
        if self.billing_address is None:
            self.billing_address = {}
        if self.usage is None:
            self.usage = {}
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow().isoformat()

class SubscriptionService:
    def __init__(self, db_connector):
        self.db = db_connector
        self.logger = logging.getLogger(__name__)
        
    def create_plan(self, data: Dict) -> Dict:
        """Create a new subscription plan"""
        try:
            plan_id = str(uuid.uuid4())
            plan = SubscriptionPlan(
                id=plan_id,
                name=data['name'],
                description=data.get('description', ''),
                price=data['price'],
                currency=data.get('currency', 'USD'),
                billing_cycle=data.get('billing_cycle', 'MONTHLY'),
                features=data.get('features', []),
                limits=data.get('limits', {}),
                is_active=data.get('is_active', True)
            )
            
            # Save to database
            self.db.execute_query(
                """
                INSERT INTO subscription_plans (id, name, description, price, currency,
                                              billing_cycle, features, limits, is_active,
                                              created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (plan.id, plan.name, plan.description, plan.price, plan.currency,
                 plan.billing_cycle, json.dumps(plan.features), json.dumps(plan.limits),
                 plan.is_active, plan.created_at, plan.updated_at)
            )
            
            return {
                'success': True,
                'data': asdict(plan),
                'message': 'Subscription plan created successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error creating subscription plan: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create subscription plan'
            }
    
    def get_plan(self, plan_id: str) -> Dict:
        """Get subscription plan by ID"""
        try:
            result = self.db.execute_query(
                "SELECT * FROM subscription_plans WHERE id = %s",
                (plan_id,)
            )
            
            if not result:
                return {
                    'success': False,
                    'error': 'Plan not found',
                    'message': 'Subscription plan with this ID does not exist'
                }
            
            plan_data = result[0]
            plan_data['features'] = json.loads(plan_data.get('features', '[]'))
            plan_data['limits'] = json.loads(plan_data.get('limits', '{}'))
            
            return {
                'success': True,
                'data': plan_data,
                'message': 'Subscription plan retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting subscription plan: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get subscription plan'
            }
    
    def list_plans(self, active_only: bool = True) -> Dict:
        """List all subscription plans"""
        try:
            query = "SELECT * FROM subscription_plans"
            if active_only:
                query += " WHERE is_active = true"
            query += " ORDER BY price ASC"
            
            result = self.db.execute_query(query)
            
            # Parse JSON fields
            for plan in result:
                plan['features'] = json.loads(plan.get('features', '[]'))
                plan['limits'] = json.loads(plan.get('limits', '{}'))
            
            return {
                'success': True,
                'data': result,
                'message': f'Found {len(result)} subscription plans'
            }
            
        except Exception as e:
            self.logger.error(f"Error listing subscription plans: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to list subscription plans'
            }
    
    def subscribe_user(self, user_id: str, plan_id: str, payment_data: Dict = None) -> Dict:
        """Subscribe user to a plan"""
        try:
            # Get plan details
            plan = self.get_plan(plan_id)
            if not plan['success']:
                return plan
            
            # Check if user already has an active subscription
            existing = self.get_user_subscription(user_id)
            if existing['success'] and existing['data']['status'] == 'ACTIVE':
                return {
                    'success': False,
                    'error': 'User already subscribed',
                    'message': 'User already has an active subscription'
                }
            
            # Calculate subscription dates
            start_date = datetime.utcnow()
            plan_data = plan['data']
            
            if plan_data['billing_cycle'] == 'MONTHLY':
                end_date = start_date + timedelta(days=30)
            elif plan_data['billing_cycle'] == 'YEARLY':
                end_date = start_date + timedelta(days=365)
            else:  # LIFETIME
                end_date = start_date + timedelta(days=36500)  # 100 years
            
            subscription_id = str(uuid.uuid4())
            subscription = UserSubscription(
                id=subscription_id,
                user_id=user_id,
                plan_id=plan_id,
                status='ACTIVE',
                start_date=start_date.isoformat(),
                end_date=end_date.isoformat(),
                auto_renew=payment_data.get('auto_renew', True) if payment_data else True,
                payment_method=payment_data.get('payment_method') if payment_data else None,
                billing_address=payment_data.get('billing_address', {}) if payment_data else {}
            )
            
            # Save to database
            self.db.execute_query(
                """
                INSERT INTO user_subscriptions (id, user_id, plan_id, status, start_date,
                                              end_date, auto_renew, payment_method,
                                              billing_address, usage, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (subscription.id, subscription.user_id, subscription.plan_id,
                 subscription.status, subscription.start_date, subscription.end_date,
                 subscription.auto_renew, subscription.payment_method,
                 json.dumps(subscription.billing_address), json.dumps(subscription.usage),
                 subscription.created_at, subscription.updated_at)
            )
            
            return {
                'success': True,
                'data': asdict(subscription),
                'message': 'User subscribed successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error subscribing user: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to subscribe user'
            }
    
    def get_user_subscription(self, user_id: str) -> Dict:
        """Get user's current subscription"""
        try:
            result = self.db.execute_query(
                """
                SELECT us.*, sp.name as plan_name, sp.price, sp.currency, sp.billing_cycle,
                       sp.features, sp.limits
                FROM user_subscriptions us
                JOIN subscription_plans sp ON us.plan_id = sp.id
                WHERE us.user_id = %s AND us.status = 'ACTIVE'
                ORDER BY us.created_at DESC
                LIMIT 1
                """,
                (user_id,)
            )
            
            if not result:
                return {
                    'success': False,
                    'error': 'No active subscription',
                    'message': 'User does not have an active subscription'
                }
            
            subscription_data = result[0]
            subscription_data['billing_address'] = json.loads(subscription_data.get('billing_address', '{}'))
            subscription_data['usage'] = json.loads(subscription_data.get('usage', '{}'))
            subscription_data['features'] = json.loads(subscription_data.get('features', '[]'))
            subscription_data['limits'] = json.loads(subscription_data.get('limits', '{}'))
            
            return {
                'success': True,
                'data': subscription_data,
                'message': 'User subscription retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting user subscription: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get user subscription'
            }
    
    def cancel_subscription(self, user_id: str) -> Dict:
        """Cancel user's subscription"""
        try:
            subscription = self.get_user_subscription(user_id)
            if not subscription['success']:
                return subscription
            
            subscription_id = subscription['data']['id']
            
            # Update subscription status
            self.db.execute_query(
                "UPDATE user_subscriptions SET status = 'CANCELLED', updated_at = %s WHERE id = %s",
                (datetime.utcnow().isoformat(), subscription_id)
            )
            
            return {
                'success': True,
                'message': 'Subscription cancelled successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error cancelling subscription: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to cancel subscription'
            }
    
    def update_subscription(self, user_id: str, plan_id: str) -> Dict:
        """Update user's subscription to a different plan"""
        try:
            # Cancel current subscription
            cancel_result = self.cancel_subscription(user_id)
            if not cancel_result['success']:
                return cancel_result
            
            # Subscribe to new plan
            return self.subscribe_user(user_id, plan_id)
            
        except Exception as e:
            self.logger.error(f"Error updating subscription: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update subscription'
            }
    
    def check_usage_limits(self, user_id: str, feature: str) -> Dict:
        """Check if user has exceeded usage limits for a feature"""
        try:
            subscription = self.get_user_subscription(user_id)
            if not subscription['success']:
                return {
                    'success': False,
                    'error': 'No active subscription',
                    'message': 'User does not have an active subscription'
                }
            
            limits = subscription['data']['limits']
            usage = subscription['data']['usage']
            
            if feature not in limits:
                return {
                    'success': True,
                    'data': {'allowed': True, 'reason': 'No limits set for this feature'},
                    'message': 'No usage limits for this feature'
                }
            
            current_usage = usage.get(feature, 0)
            limit = limits[feature]
            
            if current_usage >= limit:
                return {
                    'success': True,
                    'data': {'allowed': False, 'current_usage': current_usage, 'limit': limit},
                    'message': 'Usage limit exceeded'
                }
            
            return {
                'success': True,
                'data': {'allowed': True, 'current_usage': current_usage, 'limit': limit},
                'message': 'Usage within limits'
            }
            
        except Exception as e:
            self.logger.error(f"Error checking usage limits: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to check usage limits'
            }
    
    def record_usage(self, user_id: str, feature: str, amount: int = 1) -> Dict:
        """Record usage of a feature"""
        try:
            subscription = self.get_user_subscription(user_id)
            if not subscription['success']:
                return subscription
            
            subscription_id = subscription['data']['id']
            usage = subscription['data']['usage']
            
            # Update usage
            usage[feature] = usage.get(feature, 0) + amount
            
            # Save updated usage
            self.db.execute_query(
                "UPDATE user_subscriptions SET usage = %s, updated_at = %s WHERE id = %s",
                (json.dumps(usage), datetime.utcnow().isoformat(), subscription_id)
            )
            
            return {
                'success': True,
                'data': {'usage': usage},
                'message': 'Usage recorded successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error recording usage: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to record usage'
            }
