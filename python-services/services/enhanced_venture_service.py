#!/usr/bin/env python3
"""
Enhanced SmartStart Venture Service - Advanced venture management with BUZ tokens, file uploads, and collaboration
The most advanced venture management system in the market
"""

import logging
import os
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import hashlib
import secrets
import json
import base64

logger = logging.getLogger(__name__)

class EnhancedVentureService:
    """Enhanced venture service with BUZ token integration, file uploads, and collaboration features"""
    
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        
        # BUZ token costs for different venture tiers
        self.tier_costs = {
            'T1': 500,  # Premium tier
            'T2': 250,  # Standard tier
            'T3': 100   # Basic tier
        }
        
        # File upload costs
        self.file_upload_cost = 10  # BUZ per file
        self.team_slot_cost = 5     # BUZ per team member slot
        
    def create_venture(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new venture with BUZ token integration and enhanced features"""
        try:
            # Validate required fields
            required_fields = ['name', 'description', 'ownerUserId', 'industry', 'tier']
            for field in required_fields:
                if not venture_data.get(field):
                    return {
                        'success': False,
                        'error': f'Missing required field: {field}',
                        'error_code': 'MISSING_FIELD'
                    }
            
            # Calculate BUZ costs
            buz_costs = self._calculate_buz_costs(venture_data)
            total_cost = buz_costs['total']
            
            # Check if user has enough BUZ tokens
            user_balance = self._get_user_buz_balance(venture_data['ownerUserId'])
            if user_balance < total_cost:
                return {
                    'success': False,
                    'error': f'Insufficient BUZ balance. Required: {total_cost}, Available: {user_balance}',
                    'error_code': 'INSUFFICIENT_BUZ'
                }
            
            # Generate venture ID
            venture_id = self._generate_venture_id()
            
            # Create venture object with enhanced data
            new_venture = {
                'id': venture_id,
                'name': venture_data['name'],
                'description': venture_data['description'],
                'industry': venture_data['industry'],
                'stage': venture_data.get('stage', 'idea'),
                'tier': venture_data['tier'],
                'ownerUserId': venture_data['ownerUserId'],
                'status': 'DRAFT',
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat(),
                
                # Enhanced team management
                'teamSize': venture_data.get('teamSize', 1),
                'maxTeamSize': venture_data.get('maxTeamSize', 10),
                'lookingFor': venture_data.get('lookingFor', []),
                'requiredSkills': venture_data.get('requiredSkills', []),
                
                # Enhanced compensation
                'rewardType': venture_data.get('rewardType', 'equity'),
                'equityPercentage': venture_data.get('equityPercentage', 0),
                'cashAmount': venture_data.get('cashAmount', 0),
                'paymentSchedule': venture_data.get('paymentSchedule', 'monthly'),
                'equityVestingMonths': venture_data.get('equityVestingMonths', 48),
                'cliffMonths': venture_data.get('cliffMonths', 12),
                
                # Collaboration features
                'isPublic': venture_data.get('isPublic', True),
                'allowApplications': venture_data.get('allowApplications', True),
                'tags': venture_data.get('tags', []),
                
                # File uploads
                'files': venture_data.get('files', []),
                'logoUrl': venture_data.get('logoUrl'),
                'bannerUrl': venture_data.get('bannerUrl'),
                
                # Website and social media
                'website': venture_data.get('website', ''),
                'socialMedia': venture_data.get('socialMedia', {}),
                
                # Timeline and budget
                'timeline': venture_data.get('timeline', {}),
                'budget': venture_data.get('budget', 0),
                'additionalNotes': venture_data.get('additionalNotes', ''),
                
                # BUZ token integration
                'buzCost': total_cost,
                'buzSpent': 0,
                'buzEarned': 0,
                
                # Analytics
                'views': 0,
                'applications': 0,
                'likes': 0,
                'isLiked': False,
                
                # Legal integration
                'legalCompliant': False,
                'legalDocuments': [],
                
                # AI analysis
                'aiAnalysis': self._analyze_venture_potential(venture_data)
            }
            
            # Deduct BUZ tokens
            self._deduct_buz_tokens(venture_data['ownerUserId'], total_cost, f"Venture creation: {venture_data['name']}")
            
            # Award BUZ tokens for venture creation
            creation_reward = 100
            self._award_buz_tokens(venture_data['ownerUserId'], creation_reward, f"Venture creation reward: {venture_data['name']}")
            
            # Create legal entity and equity framework
            legal_entity = self._create_legal_entity(venture_id, venture_data)
            equity_framework = self._create_equity_framework(venture_id, venture_data)
            
            return {
                'success': True,
                'venture': new_venture,
                'legalEntity': legal_entity,
                'equityFramework': equity_framework,
                'buzTokens': {
                    'awarded': creation_reward,
                    'spent': total_cost,
                    'reason': 'Venture creation and setup'
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating venture: {e}")
            return {
                'success': False,
                'error': str(e),
                'error_code': 'CREATION_ERROR'
            }
    
    def get_ventures(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get ventures with filtering and pagination"""
        try:
            # Mock data for demonstration
            mock_ventures = [
                {
                    'id': 'venture_1',
                    'name': 'AI-Powered Healthcare Platform',
                    'description': 'Revolutionary AI platform for personalized healthcare diagnostics.',
                    'industry': 'Healthcare',
                    'stage': 'mvp',
                    'tier': 'T1',
                    'ownerUserId': 'user1',
                    'teamSize': 3,
                    'maxTeamSize': 8,
                    'isPublic': True,
                    'allowApplications': True,
                    'rewardType': 'hybrid',
                    'equityPercentage': 15,
                    'cashAmount': 80000,
                    'tags': ['AI', 'Healthcare', 'Machine Learning'],
                    'views': 1247,
                    'applications': 23,
                    'likes': 89,
                    'createdAt': '2024-01-15T10:00:00Z',
                    'updatedAt': '2024-01-20T14:30:00Z'
                },
                {
                    'id': 'venture_2',
                    'name': 'Sustainable Energy Solutions',
                    'description': 'Clean energy solutions for residential and commercial buildings.',
                    'industry': 'Energy',
                    'stage': 'idea',
                    'tier': 'T2',
                    'ownerUserId': 'user2',
                    'teamSize': 2,
                    'maxTeamSize': 6,
                    'isPublic': True,
                    'allowApplications': True,
                    'rewardType': 'equity',
                    'equityPercentage': 20,
                    'tags': ['Clean Energy', 'Sustainability', 'Smart Grid'],
                    'views': 892,
                    'applications': 15,
                    'likes': 67,
                    'createdAt': '2024-01-18T09:15:00Z',
                    'updatedAt': '2024-01-22T11:45:00Z'
                }
            ]
            
            # Apply filters
            filtered_ventures = mock_ventures
            if filters:
                if filters.get('industry') and filters['industry'] != 'All':
                    filtered_ventures = [v for v in filtered_ventures if v['industry'] == filters['industry']]
                
                if filters.get('stage') and filters['stage'] != 'All':
                    stage_map = {'Idea Stage': 'idea', 'MVP Stage': 'mvp', 'Growth Stage': 'growth', 'Scale Stage': 'scale'}
                    stage_value = stage_map.get(filters['stage'])
                    if stage_value:
                        filtered_ventures = [v for v in filtered_ventures if v['stage'] == stage_value]
                
                if filters.get('search'):
                    search_query = filters['search'].lower()
                    filtered_ventures = [v for v in filtered_ventures if 
                                       search_query in v['name'].lower() or 
                                       search_query in v['description'].lower() or
                                       any(search_query in tag.lower() for tag in v['tags'])]
            
            # Sort ventures
            sort_by = filters.get('sortBy', 'newest') if filters else 'newest'
            if sort_by == 'newest':
                filtered_ventures.sort(key=lambda x: x['createdAt'], reverse=True)
            elif sort_by == 'oldest':
                filtered_ventures.sort(key=lambda x: x['createdAt'])
            elif sort_by == 'popular':
                filtered_ventures.sort(key=lambda x: x['views'], reverse=True)
            elif sort_by == 'applications':
                filtered_ventures.sort(key=lambda x: x['applications'], reverse=True)
            
            return {
                'success': True,
                'ventures': filtered_ventures,
                'total': len(filtered_ventures),
                'filters': filters or {}
            }
            
        except Exception as e:
            logger.error(f"Error getting ventures: {e}")
            return {
                'success': False,
                'error': str(e),
                'error_code': 'FETCH_ERROR'
            }
    
    def get_venture(self, venture_id: str) -> Dict[str, Any]:
        """Get detailed venture information"""
        try:
            # Mock detailed venture data
            venture = {
                'id': venture_id,
                'name': 'AI-Powered Healthcare Platform',
                'description': 'Revolutionary AI platform for personalized healthcare diagnostics and treatment recommendations. We are building the future of healthcare with cutting-edge machine learning algorithms.',
                'industry': 'Healthcare',
                'stage': 'mvp',
                'tier': 'T1',
                'ownerUserId': 'user1',
                'owner': {
                    'id': 'user1',
                    'name': 'Dr. Sarah Chen',
                    'bio': 'Healthcare AI researcher with 10+ years experience in machine learning and medical diagnostics.',
                    'skills': ['AI/ML', 'Healthcare', 'Python', 'TensorFlow', 'Medical Research']
                },
                'teamSize': 3,
                'maxTeamSize': 8,
                'isPublic': True,
                'allowApplications': True,
                'rewardType': 'hybrid',
                'equityPercentage': 15,
                'cashAmount': 80000,
                'paymentSchedule': 'monthly',
                'tags': ['AI', 'Healthcare', 'Machine Learning', 'Diagnostics', 'Medical Tech'],
                'website': 'https://healthai.com',
                'socialMedia': {
                    'linkedin': 'https://linkedin.com/company/healthai',
                    'twitter': '@healthai_platform'
                },
                'files': [
                    {'id': '1', 'name': 'pitch-deck.pdf', 'type': 'pdf', 'url': '/files/pitch-deck.pdf', 'size': 2048000},
                    {'id': '2', 'name': 'product-demo.mp4', 'type': 'video', 'url': '/files/demo.mp4', 'size': 15728640}
                ],
                'teamMembers': [
                    {'id': 'user1', 'name': 'Dr. Sarah Chen', 'role': 'CEO & Founder', 'joinedAt': '2024-01-15T10:00:00Z'},
                    {'id': 'user2', 'name': 'Alex Kumar', 'role': 'CTO', 'joinedAt': '2024-01-16T09:00:00Z'},
                    {'id': 'user3', 'name': 'Maria Rodriguez', 'role': 'Lead Developer', 'joinedAt': '2024-01-18T14:30:00Z'}
                ],
                'milestones': [
                    {
                        'id': '1',
                        'title': 'MVP Development',
                        'description': 'Complete the minimum viable product with core diagnostic features',
                        'status': 'in_progress',
                        'dueDate': '2024-03-15T00:00:00Z'
                    },
                    {
                        'id': '2',
                        'title': 'Beta Testing',
                        'description': 'Launch beta version with select healthcare providers',
                        'status': 'pending',
                        'dueDate': '2024-04-30T00:00:00Z'
                    }
                ],
                'views': 1247,
                'applications': 23,
                'likes': 89,
                'isLiked': False,
                'createdAt': '2024-01-15T10:00:00Z',
                'updatedAt': '2024-01-20T14:30:00Z'
            }
            
            return {
                'success': True,
                'venture': venture
            }
            
        except Exception as e:
            logger.error(f"Error getting venture: {e}")
            return {
                'success': False,
                'error': str(e),
                'error_code': 'FETCH_ERROR'
            }
    
    def apply_to_venture(self, venture_id: str, user_id: str, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply to join a venture"""
        try:
            # Validate application data
            required_fields = ['role', 'message', 'skills', 'experience']
            for field in required_fields:
                if not application_data.get(field):
                    return {
                        'success': False,
                        'error': f'Missing required field: {field}',
                        'error_code': 'MISSING_FIELD'
                    }
            
            # Create application
            application = {
                'id': f"app_{uuid.uuid4().hex[:8]}",
                'ventureId': venture_id,
                'userId': user_id,
                'role': application_data['role'],
                'message': application_data['message'],
                'skills': application_data['skills'],
                'experience': application_data['experience'],
                'status': 'pending',
                'appliedAt': datetime.now().isoformat()
            }
            
            # Award BUZ tokens for applying
            application_reward = 25
            self._award_buz_tokens(user_id, application_reward, f"Application to venture: {venture_id}")
            
            return {
                'success': True,
                'application': application,
                'buzTokens': {
                    'awarded': application_reward,
                    'reason': 'Venture application submitted'
                }
            }
            
        except Exception as e:
            logger.error(f"Error applying to venture: {e}")
            return {
                'success': False,
                'error': str(e),
                'error_code': 'APPLICATION_ERROR'
            }
    
    def upload_file(self, venture_id: str, file_data: Dict[str, Any]) -> Dict[str, Any]:
        """Upload file to venture"""
        try:
            # Validate file data
            if not file_data.get('name') or not file_data.get('content'):
                return {
                    'success': False,
                    'error': 'Missing file name or content',
                    'error_code': 'MISSING_FILE_DATA'
                }
            
            # Check file size (10MB limit)
            file_size = len(file_data['content'])
            if file_size > 10 * 1024 * 1024:
                return {
                    'success': False,
                    'error': 'File size exceeds 10MB limit',
                    'error_code': 'FILE_TOO_LARGE'
                }
            
            # Create file record
            file_record = {
                'id': f"file_{uuid.uuid4().hex[:8]}",
                'ventureId': venture_id,
                'name': file_data['name'],
                'type': file_data.get('type', 'unknown'),
                'size': file_size,
                'url': f"/files/{venture_id}/{file_data['name']}",
                'uploadedAt': datetime.now().isoformat()
            }
            
            # Deduct BUZ tokens for file upload
            self._deduct_buz_tokens(file_data.get('userId'), self.file_upload_cost, f"File upload: {file_data['name']}")
            
            return {
                'success': True,
                'file': file_record,
                'buzTokens': {
                    'spent': self.file_upload_cost,
                    'reason': 'File upload'
                }
            }
            
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            return {
                'success': False,
                'error': str(e),
                'error_code': 'UPLOAD_ERROR'
            }
    
    def _calculate_buz_costs(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate BUZ token costs for venture creation"""
        tier = venture_data.get('tier', 'T3')
        base_cost = self.tier_costs.get(tier, 100)
        
        # File upload costs
        files = venture_data.get('files', [])
        file_cost = len(files) * self.file_upload_cost
        
        # Team size costs
        max_team_size = venture_data.get('maxTeamSize', 10)
        team_cost = max_team_size * self.team_slot_cost
        
        total_cost = base_cost + file_cost + team_cost
        
        return {
            'base': base_cost,
            'files': file_cost,
            'team': team_cost,
            'total': total_cost
        }
    
    def _get_user_buz_balance(self, user_id: str) -> int:
        """Get user's BUZ token balance"""
        # Mock implementation - in real app, query database
        return 1000
    
    def _deduct_buz_tokens(self, user_id: str, amount: int, reason: str) -> bool:
        """Deduct BUZ tokens from user account"""
        # Mock implementation - in real app, update database
        logger.info(f"Deducting {amount} BUZ tokens from user {user_id}: {reason}")
        return True
    
    def _award_buz_tokens(self, user_id: str, amount: int, reason: str) -> bool:
        """Award BUZ tokens to user account"""
        # Mock implementation - in real app, update database
        logger.info(f"Awarding {amount} BUZ tokens to user {user_id}: {reason}")
        return True
    
    def _generate_venture_id(self) -> str:
        """Generate unique venture ID"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        random_suffix = secrets.token_hex(4)
        return f"venture_{timestamp}_{random_suffix}"
    
    def _create_legal_entity(self, venture_id: str, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create legal entity for venture"""
        return {
            'id': f"legal_entity_{venture_id}",
            'ventureId': venture_id,
            'name': venture_data['name'],
            'type': 'LLC',
            'jurisdiction': venture_data.get('residency', 'US'),
            'createdAt': datetime.now().isoformat()
        }
    
    def _create_equity_framework(self, venture_id: str, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create equity framework for venture"""
        return {
            'id': f"equity_framework_{venture_id}",
            'ventureId': venture_id,
            'ownerPercent': 100 - venture_data.get('equityPercentage', 0),
            'alicePercent': 5,  # Platform fee
            'cepPercent': venture_data.get('equityPercentage', 0),
            'vestingMonths': venture_data.get('equityVestingMonths', 48),
            'cliffMonths': venture_data.get('cliffMonths', 12),
            'createdAt': datetime.now().isoformat()
        }
    
    def _analyze_venture_potential(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered analysis of venture potential"""
        # Mock AI analysis
        return {
            'marketPotential': 'High',
            'competitionLevel': 'Medium',
            'technologyReadiness': 'Good',
            'teamStrength': 'Strong',
            'fundingReadiness': 'Ready',
            'riskLevel': 'Low',
            'recommendations': [
                'Focus on MVP development',
                'Build strong team',
                'Prepare for Series A funding'
            ],
            'score': 85
        }
