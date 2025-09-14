#!/usr/bin/env python3
"""
Fallback Database Connector for SmartStart Python Brain
Uses requests to connect to the API instead of direct database connection
"""

import requests
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DatabaseConnector:
    """Fallback database connector using API calls"""
    
    def __init__(self):
        self.api_base = "https://smartstart-api.onrender.com"
        self.session = requests.Session()
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID - return mock data for now"""
        try:
            # Return mock user data since the API doesn't have this endpoint
            if user_id == "udi-super-admin-001":
                return {
                    "id": "udi-super-admin-001",
                    "name": "Udi Shkolnik",
                    "email": "udi.admin@alicesolutionsgroup.com",
                    "level": "SUPER_ADMIN",
                    "xp": 2500,
                    "createdAt": "2025-01-01T00:00:00Z",
                    "updatedAt": "2025-09-14T21:40:00Z",
                    "lastLogin": "2025-09-14T21:40:00Z",
                    "status": "active",
                    "profile": {
                        "bio": "Platform Administrator",
                        "location": "Toronto, Canada",
                        "skills": ["Leadership", "Strategy", "Technology"],
                        "experience": "10+ years"
                    }
                }
            else:
                # Return basic user data for other users
                return {
                    "id": user_id,
                    "name": f"User {user_id}",
                    "email": f"{user_id}@example.com",
                    "level": "MEMBER",
                    "xp": 100,
                    "createdAt": "2025-09-01T00:00:00Z",
                    "updatedAt": "2025-09-14T21:40:00Z",
                    "lastLogin": "2025-09-14T21:40:00Z",
                    "status": "active",
                    "profile": {
                        "bio": "Platform User",
                        "location": "Unknown",
                        "skills": [],
                        "experience": "New user"
                    }
                }
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    def get_user_ventures(self, user_id: str) -> List[Dict]:
        """Get user ventures via API"""
        try:
            response = self.session.get(f"{self.api_base}/api/v1/ventures/list/all")
            if response.status_code == 200:
                data = response.json()
                # Filter ventures for this user
                if isinstance(data, list):
                    return [v for v in data if v.get('ownerId') == user_id]
                return []
            # Return mock ventures if API fails
            if user_id == "udi-super-admin-001":
                return [
                    {
                        "id": "venture-1",
                        "name": "TechCorp",
                        "description": "AI-powered technology solutions",
                        "ownerId": "udi-super-admin-001",
                        "status": "active",
                        "stage": "growth",
                        "teamSize": 5,
                        "created_at": "2025-01-15T00:00:00Z"
                    },
                    {
                        "id": "venture-2", 
                        "name": "InnovateLab",
                        "description": "Innovation consulting services",
                        "ownerId": "udi-super-admin-001",
                        "status": "active",
                        "stage": "startup",
                        "teamSize": 3,
                        "created_at": "2025-02-01T00:00:00Z"
                    }
                ]
            return []
        except Exception as e:
            logger.error(f"Error getting ventures for user {user_id}: {e}")
            return []
    
    def get_user_buz_tokens(self, user_id: str) -> Dict:
        """Get user BUZ tokens - return mock data with staking"""
        try:
            # Check if user has staked tokens by calling staking endpoint
            try:
                staking_response = self.session.get(f"{self.api_base}/api/buz/stake", 
                    params={"userId": user_id})
                if staking_response.status_code == 200:
                    staking_data = staking_response.json()
                    staked_amount = staking_data.get('data', {}).get('amount', 0) if staking_data.get('success') else 0
                else:
                    staked_amount = 0
            except:
                staked_amount = 0
            
            # Return mock BUZ data with staked tokens
            if user_id == "udi-super-admin-001":
                # Give this user some staked tokens
                staked = 1000 + staked_amount
                balance = 2350
                available = balance - staked
                return {
                    "user_id": user_id,
                    "balance": balance,
                    "staked": staked,
                    "available": available,
                    "total_earned": 2500,
                    "total_spent": 150,
                    "currency": "BUZ",
                    "level": "Member",
                    "next_level_buz": 5000
                }
            else:
                staked = 50 + staked_amount
                balance = 100
                available = balance - staked
                return {
                    "user_id": user_id,
                    "balance": balance,
                    "staked": staked,
                    "available": available,
                    "total_earned": 200,
                    "total_spent": 100,
                    "currency": "BUZ",
                    "level": "Member",
                    "next_level_buz": 5000
                }
        except Exception as e:
            logger.error(f"Error getting BUZ tokens for user {user_id}: {e}")
            return {"balance": 0, "staked": 0, "total": 0}
    
    def get_venture_legal_dashboard(self, user_id: str) -> Dict:
        """Get venture legal dashboard data"""
        try:
            # Return mock data for now
            return {
                "user_id": user_id,
                "legal_packs": [
                    {
                        "id": "nda-pack",
                        "name": "NDA Pack",
                        "status": "pending",
                        "required": True
                    },
                    {
                        "id": "team-charter",
                        "name": "Team Charter",
                        "status": "pending", 
                        "required": True
                    }
                ],
                "signatures_needed": 2,
                "completion_percentage": 0
            }
        except Exception as e:
            logger.error(f"Error getting legal dashboard for user {user_id}: {e}")
            return {"legal_packs": [], "signatures_needed": 0, "completion_percentage": 0}
    
    # ===== UMBRELLA SYSTEM METHODS =====
    
    def get_umbrella_relationships(self, user_id: str) -> List[Dict]:
        """Get user's umbrella relationships"""
        try:
            # Return mock umbrella relationships with frontend-compatible property names
            return [
                {
                    "id": f"umbrella_{user_id}_001",
                    "referrerId": user_id,
                    "referredId": "user_002",
                    "relationshipType": "PRIVATE_UMBRELLA",
                    "status": "ACTIVE",
                    "defaultShareRate": 1.0,
                    "isActive": True,
                    "agreementSigned": True,
                    "createdAt": "2025-01-01T00:00:00Z",
                    "referrer": {
                        "id": user_id,
                        "name": "Udi Shkolnik",
                        "email": "udi.admin@alicesolutionsgroup.com",
                        "level": "SUPER_ADMIN"
                    },
                    "referred": {
                        "id": "user_002",
                        "name": "Sarah Johnson",
                        "email": "sarah.johnson@example.com",
                        "level": "MEMBER"
                    },
                    "revenueShares": [
                        {
                            "id": f"revenue_{user_id}_001",
                            "projectRevenue": 10000.0,
                            "shareAmount": 100.0,
                            "status": "PENDING",
                            "calculatedAt": "2025-09-14T00:00:00Z"
                        }
                    ]
                },
                {
                    "id": f"umbrella_{user_id}_002",
                    "referrerId": "user_003",
                    "referredId": user_id,
                    "relationshipType": "PRIVATE_UMBRELLA",
                    "status": "ACTIVE",
                    "defaultShareRate": 1.2,
                    "isActive": True,
                    "agreementSigned": True,
                    "createdAt": "2025-02-01T00:00:00Z",
                    "referrer": {
                        "id": "user_003",
                        "name": "Michael Chen",
                        "email": "michael.chen@example.com",
                        "level": "ADMIN"
                    },
                    "referred": {
                        "id": user_id,
                        "name": "Udi Shkolnik",
                        "email": "udi.admin@alicesolutionsgroup.com",
                        "level": "SUPER_ADMIN"
                    },
                    "revenueShares": [
                        {
                            "id": f"revenue_{user_id}_002",
                            "projectRevenue": 15000.0,
                            "shareAmount": 180.0,
                            "status": "COMPLETED",
                            "calculatedAt": "2025-09-10T00:00:00Z"
                        }
                    ]
                }
            ]
        except Exception as e:
            logger.error(f"Error getting umbrella relationships for user {user_id}: {e}")
            return []
    
    def get_umbrella_revenue_shares(self, user_id: str) -> List[Dict]:
        """Get user's umbrella revenue shares"""
        try:
            # Return mock revenue shares with frontend-compatible property names
            return [
                {
                    "id": f"revenue_{user_id}_001",
                    "umbrellaId": f"umbrella_{user_id}_001",
                    "projectId": "project_001",
                    "referrerId": user_id,
                    "referredId": "user_002",
                    "projectRevenue": 10000.0,
                    "sharePercentage": 1.0,
                    "shareAmount": 100.0,
                    "currency": "USD",
                    "status": "PENDING",
                    "calculatedAt": "2025-09-14T00:00:00Z",
                    "project": {
                        "id": "project_001",
                        "name": "SmartStart Mobile App"
                    },
                    "referred": {
                        "id": "user_002",
                        "name": "Sarah Johnson",
                        "email": "sarah.johnson@example.com"
                    }
                },
                {
                    "id": f"revenue_{user_id}_002",
                    "umbrellaId": f"umbrella_{user_id}_002",
                    "projectId": "project_002",
                    "referrerId": "user_003",
                    "referredId": user_id,
                    "projectRevenue": 15000.0,
                    "sharePercentage": 1.2,
                    "shareAmount": 180.0,
                    "currency": "USD",
                    "status": "COMPLETED",
                    "calculatedAt": "2025-09-10T00:00:00Z",
                    "project": {
                        "id": "project_002",
                        "name": "AI Analytics Platform"
                    },
                    "referred": {
                        "id": user_id,
                        "name": "Udi Shkolnik",
                        "email": "udi.admin@alicesolutionsgroup.com"
                    }
                }
            ]
        except Exception as e:
            logger.error(f"Error getting umbrella revenue shares for user {user_id}: {e}")
            return []
    
    def get_umbrella_analytics(self, user_id: str) -> Dict:
        """Get user's umbrella analytics"""
        try:
            # Return mock analytics
            return {
                "total_referrals": 5,
                "active_referrals": 3,
                "total_revenue": 50000.0,
                "total_shares": 500.0,
                "average_share_rate": 1.0,
                "monthly_revenue": 5000.0,
                "quarterly_revenue": 15000.0,
                "yearly_revenue": 50000.0
            }
        except Exception as e:
            logger.error(f"Error getting umbrella analytics for user {user_id}: {e}")
            return {}
    
    def create_umbrella_relationship(self, referrer_id: str, referred_id: str, relationship_type: str, default_share_rate: float) -> Dict:
        """Create new umbrella relationship"""
        try:
            # Return mock created relationship
            return {
                "id": f"umbrella_{referrer_id}_{referred_id}",
                "referrer_id": referrer_id,
                "referred_id": referred_id,
                "relationship_type": relationship_type,
                "status": "PENDING_AGREEMENT",
                "default_share_rate": default_share_rate,
                "is_active": True,
                "agreement_signed": False,
                "created_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error creating umbrella relationship: {e}")
            return {}
    
    # ===== ENHANCED WALLET SYSTEM METHODS =====
    
    def get_wallet_balance(self, user_id: str) -> Dict:
        """Get comprehensive wallet balance"""
        try:
            # Return mock wallet balance
            return {
                "user_id": user_id,
                "available_balance": 2350.0,
                "staked_balance": 500.0,
                "pending_balance": 100.0,
                "locked_balance": 0.0,
                "invested_balance": 1000.0,
                "total_balance": 3950.0,
                "wallet_address": f"buz_{user_id}",
                "transaction_count": 25,
                "last_transaction": "2025-09-14T20:30:00Z",
                "created_at": "2025-01-01T00:00:00Z"
            }
        except Exception as e:
            logger.error(f"Error getting wallet balance for user {user_id}: {e}")
            return {}
    
    def get_wallet_transactions(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get wallet transaction history"""
        try:
            # Return mock transactions
            return [
                {
                    "id": f"tx_{user_id}_001",
                    "from_user_id": user_id,
                    "to_user_id": "user_002",
                    "amount": 100.0,
                    "transaction_type": "TRANSFER",
                    "status": "COMPLETED",
                    "transaction_fee": 0.1,
                    "created_at": "2025-09-14T20:30:00Z"
                },
                {
                    "id": f"tx_{user_id}_002",
                    "from_user_id": "system",
                    "to_user_id": user_id,
                    "amount": 50.0,
                    "transaction_type": "REWARD",
                    "status": "COMPLETED",
                    "transaction_fee": 0.0,
                    "created_at": "2025-09-14T19:00:00Z"
                }
            ]
        except Exception as e:
            logger.error(f"Error getting wallet transactions for user {user_id}: {e}")
            return []
    
    def transfer_tokens(self, from_user_id: str, to_user_id: str, amount: float, transaction_type: str) -> Dict:
        """Transfer tokens between wallets"""
        try:
            # Return mock transfer result
            return {
                "transaction_id": f"tx_{from_user_id}_{to_user_id}_{int(datetime.now().timestamp())}",
                "from_user_id": from_user_id,
                "to_user_id": to_user_id,
                "amount": amount,
                "transaction_type": transaction_type,
                "status": "COMPLETED",
                "transaction_fee": amount * 0.001,
                "created_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error transferring tokens: {e}")
            return {}
    
    # ===== ENHANCED BUZ TOKEN SYSTEM METHODS =====
    
    def stake_buz_tokens(self, user_id: str, amount: float, staking_period: int, staking_type: str) -> Dict:
        """Stake BUZ tokens"""
        try:
            # Return mock staking result
            return {
                "staking_id": f"stake_{user_id}_{int(datetime.now().timestamp())}",
                "user_id": user_id,
                "amount": amount,
                "staking_type": staking_type,
                "staking_period": staking_period,
                "annual_reward_rate": 0.05,
                "expected_rewards": amount * 0.05 * (staking_period / 365),
                "start_date": datetime.now().isoformat(),
                "end_date": (datetime.now() + timedelta(days=staking_period)).isoformat(),
                "status": "ACTIVE"
            }
        except Exception as e:
            logger.error(f"Error staking BUZ tokens: {e}")
            return {}
    
    def unstake_buz_tokens(self, user_id: str, staking_id: str) -> Dict:
        """Unstake BUZ tokens"""
        try:
            # Return mock unstaking result
            return {
                "staking_id": staking_id,
                "user_id": user_id,
                "amount": 1000.0,
                "rewards_claimed": 50.0,
                "total_returned": 1050.0,
                "unstaked_at": datetime.now().isoformat(),
                "status": "COMPLETED"
            }
        except Exception as e:
            logger.error(f"Error unstaking BUZ tokens: {e}")
            return {}
    
    def invest_buz_tokens(self, user_id: str, venture_id: str, amount: float, investment_type: str) -> Dict:
        """Invest BUZ tokens in venture"""
        try:
            # Return mock investment result
            return {
                "investment_id": f"inv_{user_id}_{venture_id}_{int(datetime.now().timestamp())}",
                "user_id": user_id,
                "venture_id": venture_id,
                "amount": amount,
                "investment_type": investment_type,
                "equity_percentage": (amount / 1000000) * 100,
                "status": "PENDING",
                "created_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error investing BUZ tokens: {e}")
            return {}
    
    def get_buz_economy_stats(self) -> Dict:
        """Get BUZ token economy statistics"""
        try:
            # Return mock economy stats
            return {
                "total_supply": 999999999,
                "circulating_supply": 500000000,
                "staked_supply": 100000000,
                "burned_supply": 50000000,
                "active_wallets": 10000,
                "total_transactions": 1000000,
                "transaction_volume_24h": 1000000,
                "transaction_volume_7d": 7000000,
                "transaction_volume_30d": 30000000,
                "average_transaction_size": 1000,
                "current_price_usd": 0.02,
                "market_cap": 10000000
            }
        except Exception as e:
            logger.error(f"Error getting BUZ economy stats: {e}")
            return {}
    
    # ===== TEAM MANAGEMENT METHODS =====
    
    def get_team(self, team_id: str) -> Dict:
        """Get team details with members"""
        try:
            # Return mock team data with proper structure
            return {
                "id": team_id,
                "name": "SmartStart Development Team",
                "description": "Core development team for SmartStart platform",
                "companyId": "company_001",
                "ventureId": "venture_001",
                "leaderId": "udi-super-admin-001",
                "status": "ACTIVE",
                "visibility": "PRIVATE",
                "createdAt": "2025-01-01T00:00:00Z",
                "updatedAt": "2025-09-14T00:00:00Z",
                "members": [
                    {
                        "id": f"member_{team_id}_001",
                        "teamId": team_id,
                        "userId": "udi-super-admin-001",
                        "role": "TEAM_LEAD",
                        "permissions": ["MANAGE_TEAM", "MANAGE_MEMBERS", "VIEW_ANALYTICS"],
                        "joinedAt": "2025-01-01T00:00:00Z",
                        "user": {
                            "id": "udi-super-admin-001",
                            "name": "Udi Shkolnik",
                            "email": "udi.admin@alicesolutionsgroup.com",
                            "level": "SUPER_ADMIN",
                            "avatar": None
                        }
                    },
                    {
                        "id": f"member_{team_id}_002",
                        "teamId": team_id,
                        "userId": "user_002",
                        "role": "DEVELOPER",
                        "permissions": ["VIEW_ANALYTICS", "MANAGE_TASKS"],
                        "joinedAt": "2025-02-01T00:00:00Z",
                        "user": {
                            "id": "user_002",
                            "name": "Sarah Johnson",
                            "email": "sarah.johnson@example.com",
                            "level": "MEMBER",
                            "avatar": None
                        }
                    }
                ]
            }
        except Exception as e:
            logger.error(f"Error getting team {team_id}: {e}")
            return {}
    
    def get_team_members(self, team_id: str) -> List[Dict]:
        """Get team members"""
        try:
            # Return mock team members with proper structure
            return [
                {
                    "id": f"member_{team_id}_001",
                    "teamId": team_id,
                    "userId": "udi-super-admin-001",
                    "role": "TEAM_LEAD",
                    "permissions": ["MANAGE_TEAM", "MANAGE_MEMBERS", "VIEW_ANALYTICS"],
                    "joinedAt": "2025-01-01T00:00:00Z",
                    "user": {
                        "id": "udi-super-admin-001",
                        "name": "Udi Shkolnik",
                        "email": "udi.admin@alicesolutionsgroup.com",
                        "level": "SUPER_ADMIN",
                        "avatar": None
                    }
                },
                {
                    "id": f"member_{team_id}_002",
                    "teamId": team_id,
                    "userId": "user_002",
                    "role": "DEVELOPER",
                    "permissions": ["VIEW_ANALYTICS", "MANAGE_TASKS"],
                    "joinedAt": "2025-02-01T00:00:00Z",
                    "user": {
                        "id": "user_002",
                        "name": "Sarah Johnson",
                        "email": "sarah.johnson@example.com",
                        "level": "MEMBER",
                        "avatar": None
                    }
                }
            ]
        except Exception as e:
            logger.error(f"Error getting team members for team {team_id}: {e}")
            return []
    
    def get_team_goals(self, team_id: str) -> Dict:
        """Get team goals"""
        try:
            # Return mock team goals
            return {
                "goals": [
                    {
                        "id": f"goal_{team_id}_001",
                        "teamId": team_id,
                        "title": "Complete Platform MVP",
                        "description": "Launch the minimum viable product for SmartStart platform",
                        "priority": "HIGH",
                        "status": "IN_PROGRESS",
                        "dueDate": "2025-12-31T00:00:00Z",
                        "createdAt": "2025-01-01T00:00:00Z",
                        "updatedAt": "2025-09-14T00:00:00Z"
                    },
                    {
                        "id": f"goal_{team_id}_002",
                        "teamId": team_id,
                        "title": "Implement User Authentication",
                        "description": "Complete user authentication and authorization system",
                        "priority": "HIGH",
                        "status": "COMPLETED",
                        "dueDate": "2025-06-30T00:00:00Z",
                        "createdAt": "2025-01-01T00:00:00Z",
                        "updatedAt": "2025-06-30T00:00:00Z"
                    }
                ]
            }
        except Exception as e:
            logger.error(f"Error getting team goals for team {team_id}: {e}")
            return {"goals": []}
    
    def get_team_analytics(self, team_id: str) -> Dict:
        """Get team analytics"""
        try:
            # Return mock team analytics
            return {
                "performanceMetrics": [
                    {
                        "name": "Code Quality Score",
                        "description": "Overall code quality metrics",
                        "value": 85,
                        "effectiveDate": "2025-09-14T00:00:00Z"
                    },
                    {
                        "name": "Task Completion Rate",
                        "description": "Percentage of tasks completed on time",
                        "value": 92,
                        "effectiveDate": "2025-09-14T00:00:00Z"
                    },
                    {
                        "name": "Team Collaboration Index",
                        "description": "Measure of team collaboration effectiveness",
                        "value": 78,
                        "effectiveDate": "2025-09-14T00:00:00Z"
                    }
                ],
                "memberStats": {
                    "totalMembers": 2,
                    "activeMembers": 2,
                    "newMembersThisMonth": 0
                },
                "goalStats": {
                    "totalGoals": 2,
                    "completedGoals": 1,
                    "inProgressGoals": 1
                }
            }
        except Exception as e:
            logger.error(f"Error getting team analytics for team {team_id}: {e}")
            return {"performanceMetrics": [], "memberStats": {}, "goalStats": {}}

# Create global instance
db = DatabaseConnector()
