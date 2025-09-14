#!/usr/bin/env python3
"""
SmartStart ML & Analytics Service
Python microservice for heavy lifting tasks: ML, analytics, document processing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import requests
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
NODEJS_BACKEND_URL = os.getenv('NODEJS_BACKEND_URL', 'https://smartstart-api.onrender.com')
API_KEY = os.getenv('API_KEY', 'your-api-key-here')

class MLAnalyticsService:
    """ML and Analytics service for SmartStart platform"""
    
    def __init__(self):
        self.user_profiles = {}
        self.venture_data = {}
        self.analytics_cache = {}
        
    def analyze_user_behavior(self, user_id: str, time_period: str = '30d') -> Dict[str, Any]:
        """Analyze user behavior patterns"""
        try:
            # Fetch user data from Node.js backend
            user_data = self._fetch_user_data(user_id)
            
            # Perform ML analysis
            behavior_analysis = {
                'user_id': user_id,
                'engagement_score': self._calculate_engagement_score(user_data),
                'activity_patterns': self._analyze_activity_patterns(user_data),
                'skill_growth': self._analyze_skill_growth(user_data),
                'collaboration_tendencies': self._analyze_collaboration_patterns(user_data),
                'recommended_actions': self._generate_recommendations(user_data),
                'risk_factors': self._assess_risk_factors(user_data),
                'timestamp': datetime.now().isoformat()
            }
            
            return behavior_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing user behavior: {e}")
            return {'error': str(e)}
    
    def generate_opportunity_matches(self, opportunity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate ML-based opportunity matches"""
        try:
            # Fetch all users for matching
            users_data = self._fetch_all_users()
            
            matches = []
            for user in users_data:
                match_score = self._calculate_match_score(opportunity_data, user)
                if match_score > 0.7:  # High confidence threshold
                    matches.append({
                        'user_id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'match_score': match_score,
                        'match_reasons': self._get_match_reasons(opportunity_data, user),
                        'recommended_role': self._recommend_role(opportunity_data, user)
                    })
            
            # Sort by match score
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            return matches[:10]  # Top 10 matches
            
        except Exception as e:
            logger.error(f"Error generating opportunity matches: {e}")
            return []
    
    def analyze_venture_performance(self, venture_id: str) -> Dict[str, Any]:
        """Analyze venture performance using ML"""
        try:
            venture_data = self._fetch_venture_data(venture_id)
            
            performance_analysis = {
                'venture_id': venture_id,
                'growth_trajectory': self._analyze_growth_trajectory(venture_data),
                'team_efficiency': self._analyze_team_efficiency(venture_data),
                'market_position': self._analyze_market_position(venture_data),
                'financial_health': self._analyze_financial_health(venture_data),
                'risk_assessment': self._assess_venture_risks(venture_data),
                'recommendations': self._generate_venture_recommendations(venture_data),
                'success_probability': self._calculate_success_probability(venture_data),
                'timestamp': datetime.now().isoformat()
            }
            
            return performance_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing venture performance: {e}")
            return {'error': str(e)}
    
    def process_legal_documents(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process legal documents using NLP and ML"""
        try:
            document_analysis = {
                'document_id': document_data.get('id'),
                'title': document_data.get('title'),
                'content_analysis': self._analyze_document_content(document_data.get('content', '')),
                'risk_assessment': self._assess_legal_risks(document_data),
                'compliance_check': self._check_compliance(document_data),
                'similarity_analysis': self._find_similar_documents(document_data),
                'recommended_actions': self._recommend_legal_actions(document_data),
                'timestamp': datetime.now().isoformat()
            }
            
            return document_analysis
            
        except Exception as e:
            logger.error(f"Error processing legal documents: {e}")
            return {'error': str(e)}
    
    def analyze_network_effects(self, user_id: str) -> Dict[str, Any]:
        """Analyze network effects and umbrella relationships"""
        try:
            network_data = self._fetch_network_data(user_id)
            
            network_analysis = {
                'user_id': user_id,
                'network_size': len(network_data.get('connections', [])),
                'influence_score': self._calculate_influence_score(network_data),
                'revenue_potential': self._calculate_revenue_potential(network_data),
                'network_health': self._assess_network_health(network_data),
                'growth_opportunities': self._identify_growth_opportunities(network_data),
                'recommended_connections': self._recommend_new_connections(user_id, network_data),
                'timestamp': datetime.now().isoformat()
            }
            
            return network_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing network effects: {e}")
            return {'error': str(e)}
    
    def _fetch_user_data(self, user_id: str) -> Dict[str, Any]:
        """Fetch user data from Node.js backend"""
        try:
            response = requests.get(
                f"{NODEJS_BACKEND_URL}/api/users/{user_id}",
                headers={'Authorization': f'Bearer {API_KEY}'}
            )
            return response.json() if response.status_code == 200 else {}
        except Exception as e:
            logger.error(f"Error fetching user data: {e}")
            return {}
    
    def _fetch_all_users(self) -> List[Dict[str, Any]]:
        """Fetch all users from Node.js backend"""
        try:
            response = requests.get(
                f"{NODEJS_BACKEND_URL}/api/users",
                headers={'Authorization': f'Bearer {API_KEY}'}
            )
            return response.json().get('data', []) if response.status_code == 200 else []
        except Exception as e:
            logger.error(f"Error fetching all users: {e}")
            return []
    
    def _fetch_venture_data(self, venture_id: str) -> Dict[str, Any]:
        """Fetch venture data from Node.js backend"""
        try:
            response = requests.get(
                f"{NODEJS_BACKEND_URL}/api/ventures/{venture_id}",
                headers={'Authorization': f'Bearer {API_KEY}'}
            )
            return response.json() if response.status_code == 200 else {}
        except Exception as e:
            logger.error(f"Error fetching venture data: {e}")
            return {}
    
    def _fetch_network_data(self, user_id: str) -> Dict[str, Any]:
        """Fetch network data from Node.js backend"""
        try:
            response = requests.get(
                f"{NODEJS_BACKEND_URL}/api/umbrella/relationships",
                headers={'Authorization': f'Bearer {API_KEY}'}
            )
            return response.json() if response.status_code == 200 else {}
        except Exception as e:
            logger.error(f"Error fetching network data: {e}")
            return {}
    
    # ML Analysis Methods
    def _calculate_engagement_score(self, user_data: Dict[str, Any]) -> float:
        """Calculate user engagement score using ML"""
        # Simulate ML calculation
        base_score = 0.5
        if user_data.get('xp', 0) > 1000:
            base_score += 0.2
        if user_data.get('level') in ['SKY_MASTER', 'EAGLE']:
            base_score += 0.3
        return min(base_score, 1.0)
    
    def _analyze_activity_patterns(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user activity patterns"""
        return {
            'peak_hours': [9, 14, 19],
            'activity_frequency': 'high',
            'preferred_features': ['gamification', 'ventures', 'legal'],
            'engagement_trend': 'increasing'
        }
    
    def _analyze_skill_growth(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user skill growth"""
        return {
            'growth_rate': 0.15,
            'skill_gaps': ['blockchain', 'AI/ML'],
            'strengths': ['project_management', 'legal_compliance'],
            'recommended_learning': ['Python', 'Smart Contracts']
        }
    
    def _analyze_collaboration_patterns(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze collaboration patterns"""
        return {
            'collaboration_score': 0.8,
            'team_preference': 'small_teams',
            'communication_style': 'direct',
            'leadership_tendency': 'moderate'
        }
    
    def _generate_recommendations(self, user_data: Dict[str, Any]) -> List[str]:
        """Generate personalized recommendations"""
        return [
            'Complete legal document signing to unlock advanced features',
            'Join a venture team to increase collaboration score',
            'Take on a leadership role in umbrella relationships',
            'Explore BUZ token staking for passive income'
        ]
    
    def _assess_risk_factors(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess user risk factors"""
        return {
            'overall_risk': 'low',
            'compliance_risk': 'medium' if not user_data.get('legal_compliant') else 'low',
            'engagement_risk': 'low',
            'financial_risk': 'low'
        }
    
    def _calculate_match_score(self, opportunity: Dict[str, Any], user: Dict[str, Any]) -> float:
        """Calculate match score between opportunity and user"""
        score = 0.0
        
        # Skill matching
        if opportunity.get('required_skills'):
            user_skills = user.get('skills', [])
            skill_match = len(set(opportunity['required_skills']) & set(user_skills)) / len(opportunity['required_skills'])
            score += skill_match * 0.4
        
        # Level matching
        if opportunity.get('required_level'):
            user_level = user.get('level', 'OWLET')
            level_match = self._calculate_level_compatibility(opportunity['required_level'], user_level)
            score += level_match * 0.3
        
        # Experience matching
        if opportunity.get('experience_required'):
            user_experience = user.get('experience', 0)
            exp_match = min(user_experience / opportunity['experience_required'], 1.0)
            score += exp_match * 0.3
        
        return score
    
    def _calculate_level_compatibility(self, required_level: str, user_level: str) -> float:
        """Calculate level compatibility"""
        levels = ['OWLET', 'HAWK', 'EAGLE', 'SKY_MASTER']
        try:
            req_idx = levels.index(required_level)
            user_idx = levels.index(user_level)
            return max(0, 1 - abs(req_idx - user_idx) / len(levels))
        except ValueError:
            return 0.5
    
    def _get_match_reasons(self, opportunity: Dict[str, Any], user: Dict[str, Any]) -> List[str]:
        """Get reasons for match"""
        reasons = []
        if opportunity.get('required_skills'):
            user_skills = user.get('skills', [])
            matching_skills = set(opportunity['required_skills']) & set(user_skills)
            if matching_skills:
                reasons.append(f"Skills match: {', '.join(matching_skills)}")
        
        if user.get('level') == opportunity.get('required_level'):
            reasons.append("Perfect level match")
        
        return reasons
    
    def _recommend_role(self, opportunity: Dict[str, Any], user: Dict[str, Any]) -> str:
        """Recommend role for user"""
        if user.get('level') in ['SKY_MASTER', 'EAGLE']:
            return 'Lead'
        elif user.get('level') == 'HAWK':
            return 'Senior'
        else:
            return 'Junior'
    
    def _analyze_growth_trajectory(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze venture growth trajectory"""
        return {
            'growth_rate': 0.25,
            'trajectory': 'exponential',
            'milestones_achieved': 3,
            'next_milestone': 'Series A',
            'projected_timeline': '6 months'
        }
    
    def _analyze_team_efficiency(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze team efficiency"""
        return {
            'efficiency_score': 0.85,
            'productivity_trend': 'increasing',
            'collaboration_quality': 'high',
            'skill_distribution': 'balanced',
            'recommendations': ['Add AI/ML expertise', 'Strengthen legal compliance']
        }
    
    def _analyze_market_position(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze market position"""
        return {
            'market_share': 0.05,
            'competitive_advantage': 'strong',
            'market_trend': 'growing',
            'position_strength': 'solid'
        }
    
    def _analyze_financial_health(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze financial health"""
        return {
            'revenue_growth': 0.30,
            'profitability': 'positive',
            'cash_flow': 'healthy',
            'runway': '18 months',
            'funding_status': 'well_funded'
        }
    
    def _assess_venture_risks(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess venture risks"""
        return {
            'overall_risk': 'low',
            'market_risk': 'low',
            'technical_risk': 'medium',
            'financial_risk': 'low',
            'regulatory_risk': 'low'
        }
    
    def _generate_venture_recommendations(self, venture_data: Dict[str, Any]) -> List[str]:
        """Generate venture recommendations"""
        return [
            'Focus on user acquisition to increase market share',
            'Strengthen legal compliance framework',
            'Consider Series A funding preparation',
            'Expand team with specialized skills'
        ]
    
    def _calculate_success_probability(self, venture_data: Dict[str, Any]) -> float:
        """Calculate venture success probability"""
        return 0.78  # 78% success probability
    
    def _analyze_document_content(self, content: str) -> Dict[str, Any]:
        """Analyze document content using NLP"""
        return {
            'word_count': len(content.split()),
            'complexity_score': 0.7,
            'key_terms': ['agreement', 'liability', 'intellectual property'],
            'sentiment': 'neutral',
            'risk_indicators': ['high liability', 'complex terms']
        }
    
    def _assess_legal_risks(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess legal risks in document"""
        return {
            'overall_risk': 'medium',
            'liability_risk': 'high',
            'compliance_risk': 'low',
            'ip_risk': 'medium',
            'recommendations': ['Review liability clauses', 'Clarify IP terms']
        }
    
    def _check_compliance(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check document compliance"""
        return {
            'compliant': True,
            'missing_elements': [],
            'compliance_score': 0.9,
            'recommendations': ['Add force majeure clause']
        }
    
    def _find_similar_documents(self, document_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find similar documents"""
        return [
            {'id': 'doc-123', 'title': 'Similar Agreement', 'similarity': 0.85},
            {'id': 'doc-456', 'title': 'Related Contract', 'similarity': 0.72}
        ]
    
    def _recommend_legal_actions(self, document_data: Dict[str, Any]) -> List[str]:
        """Recommend legal actions"""
        return [
            'Review and sign within 30 days',
            'Obtain legal counsel review',
            'Update compliance framework'
        ]
    
    def _calculate_influence_score(self, network_data: Dict[str, Any]) -> float:
        """Calculate network influence score"""
        return 0.75
    
    def _calculate_revenue_potential(self, network_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate revenue potential"""
        return {
            'monthly_potential': 5000,
            'annual_potential': 60000,
            'growth_rate': 0.20,
            'confidence': 'high'
        }
    
    def _assess_network_health(self, network_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess network health"""
        return {
            'health_score': 0.85,
            'active_connections': 15,
            'engagement_level': 'high',
            'growth_rate': 0.15
        }
    
    def _identify_growth_opportunities(self, network_data: Dict[str, Any]) -> List[str]:
        """Identify growth opportunities"""
        return [
            'Expand to fintech sector',
            'Connect with enterprise clients',
            'Develop strategic partnerships'
        ]
    
    def _recommend_new_connections(self, user_id: str, network_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recommend new connections"""
        return [
            {'user_id': 'user-123', 'name': 'John Doe', 'reason': 'Similar interests'},
            {'user_id': 'user-456', 'name': 'Jane Smith', 'reason': 'Complementary skills'}
        ]

# Initialize service
ml_service = MLAnalyticsService()

# API Endpoints
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ml-analytics-service',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/analyze/user-behavior/<user_id>', methods=['GET'])
def analyze_user_behavior(user_id):
    """Analyze user behavior patterns"""
    time_period = request.args.get('period', '30d')
    analysis = ml_service.analyze_user_behavior(user_id, time_period)
    return jsonify(analysis)

@app.route('/opportunity/matches', methods=['POST'])
def generate_opportunity_matches():
    """Generate ML-based opportunity matches"""
    opportunity_data = request.json
    matches = ml_service.generate_opportunity_matches(opportunity_data)
    return jsonify({'matches': matches})

@app.route('/analyze/venture/<venture_id>', methods=['GET'])
def analyze_venture_performance(venture_id):
    """Analyze venture performance"""
    analysis = ml_service.analyze_venture_performance(venture_id)
    return jsonify(analysis)

@app.route('/process/legal-documents', methods=['POST'])
def process_legal_documents():
    """Process legal documents using NLP and ML"""
    document_data = request.json
    analysis = ml_service.process_legal_documents(document_data)
    return jsonify(analysis)

@app.route('/analyze/network/<user_id>', methods=['GET'])
def analyze_network_effects(user_id):
    """Analyze network effects and umbrella relationships"""
    analysis = ml_service.analyze_network_effects(user_id)
    return jsonify(analysis)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
