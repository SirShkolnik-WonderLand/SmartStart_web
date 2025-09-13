#!/usr/bin/env python3
"""
SmartStart User Service - All user business logic moved from Node.js
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import hashlib
import secrets

logger = logging.getLogger(__name__)

class UserService:
    """User service handling all user-related business logic"""
    
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user with comprehensive validation"""
        try:
            # Validate required fields
            required_fields = ['email', 'name', 'password']
            for field in required_fields:
                if not user_data.get(field):
                    return {
                        'success': False,
                        'message': f'Missing required field: {field}',
                        'error_code': 'MISSING_FIELD'
                    }
            
            # Validate email format
            if not self._validate_email(user_data['email']):
                return {
                    'success': False,
                    'message': 'Invalid email format',
                    'error_code': 'INVALID_EMAIL'
                }
            
            # Check if user already exists
            if self._user_exists(user_data['email']):
                return {
                    'success': False,
                    'message': 'User already exists',
                    'error_code': 'USER_EXISTS'
                }
            
            # Hash password
            hashed_password = self._hash_password(user_data['password'])
            
            # Create user object
            new_user = {
                'id': self._generate_user_id(),
                'email': user_data['email'].lower(),
                'name': user_data['name'],
                'password': hashed_password,
                'level': 'OWLET',
                'xp': 0,
                'reputation': 0,
                'status': 'ACTIVE',
                'email_verified': False,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'preferences': user_data.get('preferences', {}),
                'profile': user_data.get('profile', {}),
                'skills': user_data.get('skills', []),
                'interests': user_data.get('interests', []),
                'legal_compliant': False
            }
            
            # Save user (would typically save to database via Node.js connector)
            if self.nodejs_connector:
                result = self.nodejs_connector.create_user(new_user)
                if not result:
                    return {
                        'success': False,
                        'message': 'Failed to save user',
                        'error_code': 'SAVE_ERROR'
                    }
            
            return {
                'success': True,
                'data': {
                    'user': self._sanitize_user_data(new_user),
                    'message': 'User created successfully'
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user with email and password"""
        try:
            # Get user by email
            user = self._get_user_by_email(email)
            if not user:
                return {
                    'success': False,
                    'message': 'Invalid credentials',
                    'error_code': 'INVALID_CREDENTIALS'
                }
            
            # Verify password
            if not self._verify_password(password, user.get('password', '')):
                return {
                    'success': False,
                    'message': 'Invalid credentials',
                    'error_code': 'INVALID_CREDENTIALS'
                }
            
            # Check if user is active
            if user.get('status') != 'ACTIVE':
                return {
                    'success': False,
                    'message': 'Account is not active',
                    'error_code': 'ACCOUNT_INACTIVE'
                }
            
            # Generate JWT token (would typically use Node.js for this)
            token = self._generate_jwt_token(user)
            
            # Update last login
            self._update_last_login(user['id'])
            
            return {
                'success': True,
                'data': {
                    'user': self._sanitize_user_data(user),
                    'token': token,
                    'message': 'Authentication successful'
                }
            }
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile with validation"""
        try:
            # Get existing user
            user = self._get_user_by_id(user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error_code': 'USER_NOT_FOUND'
                }
            
            # Validate profile data
            validation_result = self._validate_profile_data(profile_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message'],
                    'error_code': 'VALIDATION_ERROR'
                }
            
            # Update user profile
            updated_user = {
                **user,
                'name': profile_data.get('name', user.get('name')),
                'profile': {**user.get('profile', {}), **profile_data.get('profile', {})},
                'skills': profile_data.get('skills', user.get('skills')),
                'interests': profile_data.get('interests', user.get('interests')),
                'preferences': {**user.get('preferences', {}), **profile_data.get('preferences', {})},
                'updated_at': datetime.now().isoformat()
            }
            
            # Save updated user
            if self.nodejs_connector:
                result = self.nodejs_connector.update_user(user_id, updated_user)
                if not result:
                    return {
                        'success': False,
                        'message': 'Failed to update user',
                        'error_code': 'UPDATE_ERROR'
                    }
            
            return {
                'success': True,
                'data': {
                    'user': self._sanitize_user_data(updated_user),
                    'message': 'Profile updated successfully'
                }
            }
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user analytics"""
        try:
            user = self._get_user_by_id(user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error_code': 'USER_NOT_FOUND'
                }
            
            # Calculate user metrics
            analytics = {
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'profile_completeness': self._calculate_profile_completeness(user),
                'engagement_score': self._calculate_engagement_score(user),
                'growth_metrics': self._calculate_growth_metrics(user),
                'collaboration_metrics': self._calculate_collaboration_metrics(user),
                'skill_analysis': self._analyze_skills(user),
                'activity_trends': self._analyze_activity_trends(user),
                'recommendations': self._generate_user_recommendations(user)
            }
            
            return {
                'success': True,
                'data': analytics
            }
            
        except Exception as e:
            logger.error(f"Error getting user analytics: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def update_user_xp(self, user_id: str, xp_change: int, reason: str) -> Dict[str, Any]:
        """Update user XP with validation and level progression"""
        try:
            user = self._get_user_by_id(user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error_code': 'USER_NOT_FOUND'
                }
            
            current_xp = user.get('xp', 0)
            current_level = user.get('level', 'OWLET')
            
            # Calculate new XP and level
            new_xp = max(0, current_xp + xp_change)
            new_level = self._calculate_level_from_xp(new_xp)
            
            # Check for level up
            level_up = new_level != current_level
            
            # Update user
            updated_user = {
                **user,
                'xp': new_xp,
                'level': new_level,
                'updated_at': datetime.now().isoformat()
            }
            
            # Save updated user
            if self.nodejs_connector:
                result = self.nodejs_connector.update_user(user_id, updated_user)
                if not result:
                    return {
                        'success': False,
                        'message': 'Failed to update user XP',
                        'error_code': 'UPDATE_ERROR'
                    }
            
            # Generate response
            response_data = {
                'user': self._sanitize_user_data(updated_user),
                'xp_change': xp_change,
                'new_xp': new_xp,
                'level_up': level_up,
                'new_level': new_level if level_up else None,
                'reason': reason
            }
            
            if level_up:
                response_data['level_up_message'] = f"Congratulations! You've reached level {new_level}!"
            
            return {
                'success': True,
                'data': response_data
            }
            
        except Exception as e:
            logger.error(f"Error updating user XP: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def get_user_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Get personalized recommendations for user"""
        try:
            user = self._get_user_by_id(user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error_code': 'USER_NOT_FOUND'
                }
            
            recommendations = {
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'profile_recommendations': self._get_profile_recommendations(user),
                'skill_recommendations': self._get_skill_recommendations(user),
                'venture_recommendations': self._get_venture_recommendations(user),
                'opportunity_recommendations': self._get_opportunity_recommendations(user),
                'collaboration_recommendations': self._get_collaboration_recommendations(user),
                'learning_recommendations': self._get_learning_recommendations(user)
            }
            
            return {
                'success': True,
                'data': recommendations
            }
            
        except Exception as e:
            logger.error(f"Error getting user recommendations: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    # Private helper methods
    def _validate_email(self, email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _user_exists(self, email: str) -> bool:
        """Check if user exists by email"""
        # This would typically query the database via Node.js connector
        return False  # Simulate user doesn't exist
    
    def _hash_password(self, password: str) -> str:
        """Hash password securely"""
        import bcrypt
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def _verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def _generate_user_id(self) -> str:
        """Generate unique user ID"""
        return f"user_{secrets.token_hex(8)}"
    
    def _generate_jwt_token(self, user: Dict[str, Any]) -> str:
        """Generate JWT token for user"""
        # This would typically be handled by Node.js
        return f"jwt_token_for_{user['id']}"
    
    def _get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        # This would typically query the database via Node.js connector
        return None
    
    def _get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        # This would typically query the database via Node.js connector
        return None
    
    def _sanitize_user_data(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive data from user object"""
        sanitized = {**user}
        sanitized.pop('password', None)
        return sanitized
    
    def _validate_profile_data(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate profile data"""
        # Implement profile validation logic
        return {'valid': True, 'message': 'Valid'}
    
    def _update_last_login(self, user_id: str):
        """Update user's last login timestamp"""
        # This would typically update the database via Node.js connector
        pass
    
    def _calculate_profile_completeness(self, user: Dict[str, Any]) -> float:
        """Calculate profile completeness percentage"""
        required_fields = ['name', 'email', 'profile', 'skills']
        completed_fields = sum(1 for field in required_fields if user.get(field))
        return (completed_fields / len(required_fields)) * 100
    
    def _calculate_engagement_score(self, user: Dict[str, Any]) -> float:
        """Calculate user engagement score"""
        xp = user.get('xp', 0)
        reputation = user.get('reputation', 0)
        ventures_count = len(user.get('ventures', []))
        teams_count = len(user.get('teams', []))
        
        # Simple scoring algorithm
        score = (xp / 10000) * 0.4 + (reputation / 1000) * 0.3 + (ventures_count + teams_count) * 0.3
        return min(score, 1.0)
    
    def _calculate_growth_metrics(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate user growth metrics"""
        return {
            'xp_growth_rate': '15%',  # Simulate growth rate
            'level_progress': '75%',  # Simulate level progress
            'skill_growth': '20%',  # Simulate skill growth
            'network_growth': '25%'  # Simulate network growth
        }
    
    def _calculate_collaboration_metrics(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate collaboration metrics"""
        return {
            'active_ventures': len(user.get('ventures', [])),
            'team_memberships': len(user.get('teams', [])),
            'collaboration_score': len(user.get('ventures', [])) + len(user.get('teams', [])),
            'leadership_roles': len([v for v in user.get('ventures', []) if v.get('role') == 'owner'])
        }
    
    def _analyze_skills(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user skills"""
        skills = user.get('skills', [])
        return {
            'total_skills': len(skills),
            'skill_categories': list(set([s.get('category', 'other') for s in skills])),
            'top_skills': sorted(skills, key=lambda x: x.get('level', 0), reverse=True)[:5],
            'skill_gaps': self._identify_skill_gaps(skills)
        }
    
    def _analyze_activity_trends(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user activity trends"""
        return {
            'activity_trend': 'increasing',
            'peak_activity_time': '14:00-16:00',
            'most_active_days': ['Monday', 'Wednesday', 'Friday'],
            'activity_consistency': 'high'
        }
    
    def _generate_user_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized user recommendations"""
        recommendations = []
        
        # Profile completeness recommendation
        completeness = self._calculate_profile_completeness(user)
        if completeness < 80:
            recommendations.append({
                'type': 'profile_completion',
                'priority': 'medium',
                'title': 'Complete Your Profile',
                'description': f'Your profile is {completeness:.0f}% complete',
                'action': 'complete_profile'
            })
        
        # Skill development recommendation
        skills = user.get('skills', [])
        if len(skills) < 5:
            recommendations.append({
                'type': 'skill_development',
                'priority': 'high',
                'title': 'Develop More Skills',
                'description': 'Add more skills to increase your opportunities',
                'action': 'add_skills'
            })
        
        return recommendations
    
    def _calculate_level_from_xp(self, xp: int) -> str:
        """Calculate user level from XP"""
        if xp >= 50000:
            return 'SKY_MASTER'
        elif xp >= 15000:
            return 'EAGLE'
        elif xp >= 5000:
            return 'HAWK'
        else:
            return 'OWLET'
    
    def _identify_skill_gaps(self, skills: List[Dict[str, Any]]) -> List[str]:
        """Identify skill gaps"""
        # Simulate skill gap identification
        return ['Machine Learning', 'Project Management', 'Data Analysis']
    
    def _get_profile_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get profile-specific recommendations"""
        return [
            {
                'type': 'profile',
                'title': 'Add Professional Photo',
                'description': 'A professional photo increases profile views by 40%'
            }
        ]
    
    def _get_skill_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get skill-specific recommendations"""
        return [
            {
                'type': 'skill',
                'title': 'Learn Python Programming',
                'description': 'High demand skill in the current market'
            }
        ]
    
    def _get_venture_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get venture-specific recommendations"""
        return [
            {
                'type': 'venture',
                'title': 'Join Tech Startup',
                'description': 'Matches your skills and interests'
            }
        ]
    
    def _get_opportunity_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get opportunity-specific recommendations"""
        return [
            {
                'type': 'opportunity',
                'title': 'Freelance Web Development',
                'description': 'Perfect match for your skills'
            }
        ]
    
    def _get_collaboration_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get collaboration-specific recommendations"""
        return [
            {
                'type': 'collaboration',
                'title': 'Join Developer Community',
                'description': 'Expand your network and learn from peers'
            }
        ]
    
    def _get_learning_recommendations(self, user: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get learning-specific recommendations"""
        return [
            {
                'type': 'learning',
                'title': 'Take Advanced JavaScript Course',
                'description': 'Build on your existing skills'
            }
        ]
