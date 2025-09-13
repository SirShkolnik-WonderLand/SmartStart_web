#!/usr/bin/env python3
"""
SmartStart ML Engine - Machine Learning and AI Operations
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_squared_error
import logging
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class MLEngine:
    """Machine Learning engine for SmartStart platform"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.training_data = {}
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize ML models"""
        # User behavior prediction model
        self.models['user_behavior'] = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
        
        # Venture success prediction model
        self.models['venture_success'] = GradientBoostingRegressor(
            n_estimators=100,
            random_state=42
        )
        
        # Opportunity matching model
        self.models['opportunity_matching'] = RandomForestClassifier(
            n_estimators=50,
            random_state=42
        )
        
        # User clustering model
        self.models['user_clustering'] = KMeans(
            n_clusters=5,
            random_state=42
        )
        
        # Initialize scalers
        self.scalers['user_features'] = StandardScaler()
        self.scalers['venture_features'] = StandardScaler()
        
        logger.info("🤖 ML Engine initialized with models")
    
    def make_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make predictions based on request type"""
        prediction_type = data.get('type', 'general')
        
        if prediction_type == 'user_behavior':
            return self._predict_user_behavior(data)
        elif prediction_type == 'venture_success':
            return self._predict_venture_success(data)
        elif prediction_type == 'opportunity_match':
            return self._predict_opportunity_match(data)
        elif prediction_type == 'user_clustering':
            return self._cluster_users(data)
        else:
            return self._general_prediction(data)
    
    def match_opportunities(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Match users with opportunities using ML"""
        try:
            opportunity = data.get('opportunity', {})
            users = data.get('users', [])
            
            matches = []
            for user in users:
                match_score = self._calculate_opportunity_match_score(opportunity, user)
                
                if match_score > 0.6:  # Threshold for good matches
                    matches.append({
                        'user_id': user.get('id'),
                        'name': user.get('name'),
                        'email': user.get('email'),
                        'match_score': match_score,
                        'match_reasons': self._get_match_reasons(opportunity, user),
                        'recommended_role': self._recommend_role(opportunity, user),
                        'confidence': self._calculate_confidence(match_score)
                    })
            
            # Sort by match score
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            return matches[:10]  # Top 10 matches
            
        except Exception as e:
            logger.error(f"Error matching opportunities: {e}")
            return []
    
    def predict_user_engagement(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict user engagement levels"""
        try:
            features = self._extract_user_features(user_data)
            
            # Simulate ML prediction (in real implementation, use trained model)
            engagement_score = self._calculate_engagement_score(features)
            
            return {
                'user_id': user_data.get('id'),
                'engagement_score': engagement_score,
                'engagement_level': self._get_engagement_level(engagement_score),
                'predicted_activities': self._predict_activities(features),
                'churn_risk': self._assess_churn_risk(features),
                'recommendations': self._generate_engagement_recommendations(features),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting user engagement: {e}")
            return {'error': str(e)}
    
    def predict_venture_success(self, venture_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict venture success probability"""
        try:
            features = self._extract_venture_features(venture_data)
            
            # Simulate ML prediction
            success_probability = self._calculate_success_probability(features)
            
            return {
                'venture_id': venture_data.get('id'),
                'success_probability': success_probability,
                'success_level': self._get_success_level(success_probability),
                'key_factors': self._identify_success_factors(features),
                'risk_factors': self._identify_risk_factors(features),
                'recommendations': self._generate_venture_recommendations(features),
                'timeline_prediction': self._predict_success_timeline(features),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting venture success: {e}")
            return {'error': str(e)}
    
    def cluster_users(self, users_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Cluster users into segments"""
        try:
            if len(users_data) < 5:
                return {'error': 'Need at least 5 users for clustering'}
            
            # Extract features for all users
            features_matrix = []
            user_ids = []
            
            for user in users_data:
                features = self._extract_user_features(user)
                features_matrix.append(list(features.values()))
                user_ids.append(user.get('id'))
            
            # Perform clustering
            features_array = np.array(features_matrix)
            clusters = self.models['user_clustering'].fit_predict(features_array)
            
            # Organize results
            clusters_data = {}
            for i, cluster_id in enumerate(clusters):
                if cluster_id not in clusters_data:
                    clusters_data[cluster_id] = []
                clusters_data[cluster_id].append({
                    'user_id': user_ids[i],
                    'features': features_matrix[i]
                })
            
            return {
                'clusters': clusters_data,
                'cluster_characteristics': self._analyze_clusters(clusters_data),
                'total_users': len(users_data),
                'num_clusters': len(set(clusters)),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error clustering users: {e}")
            return {'error': str(e)}
    
    def _predict_user_behavior(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict user behavior patterns"""
        user_data = data.get('user', {})
        return self.predict_user_engagement(user_data)
    
    def _predict_venture_success(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict venture success"""
        venture_data = data.get('venture', {})
        return self.predict_venture_success(venture_data)
    
    def _predict_opportunity_match(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict opportunity match"""
        opportunity = data.get('opportunity', {})
        user = data.get('user', {})
        
        match_score = self._calculate_opportunity_match_score(opportunity, user)
        
        return {
            'match_score': match_score,
            'match_reasons': self._get_match_reasons(opportunity, user),
            'recommended_role': self._recommend_role(opportunity, user)
        }
    
    def _cluster_users(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cluster users"""
        users = data.get('users', [])
        return self.cluster_users(users)
    
    def _general_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """General prediction based on data"""
        return {
            'prediction': 'general_analysis',
            'confidence': 0.7,
            'message': 'General prediction completed'
        }
    
    def _extract_user_features(self, user_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract features from user data for ML"""
        return {
            'xp': float(user_data.get('xp', 0)),
            'level_score': self._get_level_score(user_data.get('level', 'OWLET')),
            'reputation': float(user_data.get('reputation', 0)),
            'activity_score': self._calculate_activity_score(user_data),
            'collaboration_score': self._calculate_collaboration_score(user_data),
            'legal_compliance': 1.0 if user_data.get('legal_compliant') else 0.0,
            'venture_count': float(len(user_data.get('ventures', []))),
            'team_count': float(len(user_data.get('teams', []))),
            'account_age_days': self._calculate_account_age(user_data)
        }
    
    def _extract_venture_features(self, venture_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract features from venture data for ML"""
        return {
            'team_size': float(len(venture_data.get('team_members', []))),
            'owner_experience': self._calculate_owner_experience(venture_data),
            'legal_compliance': 1.0 if venture_data.get('legal_compliant') else 0.0,
            'funding_amount': float(venture_data.get('funding_amount', 0)),
            'market_size': self._estimate_market_size(venture_data),
            'competition_level': self._assess_competition(venture_data),
            'technology_score': self._assess_technology(venture_data),
            'business_model_score': self._assess_business_model(venture_data)
        }
    
    def _calculate_opportunity_match_score(self, opportunity: Dict[str, Any], user: Dict[str, Any]) -> float:
        """Calculate match score between opportunity and user"""
        score = 0.0
        
        # Skill matching (40% weight)
        if opportunity.get('required_skills'):
            user_skills = user.get('skills', [])
            skill_match = len(set(opportunity['required_skills']) & set(user_skills)) / len(opportunity['required_skills'])
            score += skill_match * 0.4
        
        # Level matching (30% weight)
        if opportunity.get('required_level'):
            user_level = user.get('level', 'OWLET')
            level_match = self._calculate_level_compatibility(opportunity['required_level'], user_level)
            score += level_match * 0.3
        
        # Experience matching (20% weight)
        if opportunity.get('experience_required'):
            user_experience = user.get('experience', 0)
            exp_match = min(user_experience / opportunity['experience_required'], 1.0)
            score += exp_match * 0.2
        
        # Availability matching (10% weight)
        availability_match = self._calculate_availability_match(opportunity, user)
        score += availability_match * 0.1
        
        return min(score, 1.0)
    
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
        
        if user.get('experience', 0) >= opportunity.get('experience_required', 0):
            reasons.append("Sufficient experience")
        
        return reasons
    
    def _recommend_role(self, opportunity: Dict[str, Any], user: Dict[str, Any]) -> str:
        """Recommend role for user"""
        if user.get('level') in ['SKY_MASTER', 'EAGLE']:
            return 'Lead'
        elif user.get('level') == 'HAWK':
            return 'Senior'
        else:
            return 'Junior'
    
    def _calculate_confidence(self, match_score: float) -> str:
        """Calculate confidence level"""
        if match_score >= 0.9:
            return 'Very High'
        elif match_score >= 0.8:
            return 'High'
        elif match_score >= 0.7:
            return 'Medium'
        else:
            return 'Low'
    
    # Helper methods for calculations
    def _get_level_score(self, level: str) -> float:
        """Convert level to numerical score"""
        level_scores = {'OWLET': 1, 'HAWK': 2, 'EAGLE': 3, 'SKY_MASTER': 4}
        return float(level_scores.get(level, 1))
    
    def _calculate_activity_score(self, user_data: Dict[str, Any]) -> float:
        """Calculate user activity score"""
        # Simulate activity calculation
        base_score = 0.5
        if user_data.get('xp', 0) > 1000:
            base_score += 0.2
        if user_data.get('reputation', 0) > 500:
            base_score += 0.3
        return min(base_score, 1.0)
    
    def _calculate_collaboration_score(self, user_data: Dict[str, Any]) -> float:
        """Calculate collaboration score"""
        team_count = len(user_data.get('teams', []))
        venture_count = len(user_data.get('ventures', []))
        return min((team_count + venture_count) / 10, 1.0)
    
    def _calculate_account_age(self, user_data: Dict[str, Any]) -> float:
        """Calculate account age in days"""
        # Simulate account age calculation
        return 30.0  # Default to 30 days
    
    def _calculate_owner_experience(self, venture_data: Dict[str, Any]) -> float:
        """Calculate owner experience score"""
        # Simulate owner experience calculation
        return 0.7
    
    def _estimate_market_size(self, venture_data: Dict[str, Any]) -> float:
        """Estimate market size"""
        # Simulate market size estimation
        return 1000000.0
    
    def _assess_competition(self, venture_data: Dict[str, Any]) -> float:
        """Assess competition level"""
        # Simulate competition assessment
        return 0.6
    
    def _assess_technology(self, venture_data: Dict[str, Any]) -> float:
        """Assess technology score"""
        # Simulate technology assessment
        return 0.8
    
    def _assess_business_model(self, venture_data: Dict[str, Any]) -> float:
        """Assess business model score"""
        # Simulate business model assessment
        return 0.75
    
    def _calculate_level_compatibility(self, required_level: str, user_level: str) -> float:
        """Calculate level compatibility"""
        levels = ['OWLET', 'HAWK', 'EAGLE', 'SKY_MASTER']
        try:
            req_idx = levels.index(required_level)
            user_idx = levels.index(user_level)
            return max(0, 1 - abs(req_idx - user_idx) / len(levels))
        except ValueError:
            return 0.5
    
    def _calculate_availability_match(self, opportunity: Dict[str, Any], user: Dict[str, Any]) -> float:
        """Calculate availability match"""
        # Simulate availability matching
        return 0.8
    
    def _calculate_engagement_score(self, features: Dict[str, float]) -> float:
        """Calculate engagement score from features"""
        score = 0.0
        score += features.get('xp', 0) / 10000 * 0.3
        score += features.get('level_score', 0) / 4 * 0.3
        score += features.get('activity_score', 0) * 0.2
        score += features.get('collaboration_score', 0) * 0.2
        return min(score, 1.0)
    
    def _get_engagement_level(self, score: float) -> str:
        """Get engagement level from score"""
        if score >= 0.8:
            return 'Very High'
        elif score >= 0.6:
            return 'High'
        elif score >= 0.4:
            return 'Medium'
        else:
            return 'Low'
    
    def _predict_activities(self, features: Dict[str, float]) -> List[str]:
        """Predict likely activities"""
        activities = []
        if features.get('collaboration_score', 0) > 0.7:
            activities.append('Team collaboration')
        if features.get('level_score', 0) > 2:
            activities.append('Leadership roles')
        if features.get('legal_compliance', 0) > 0:
            activities.append('Legal document signing')
        return activities
    
    def _assess_churn_risk(self, features: Dict[str, float]) -> str:
        """Assess churn risk"""
        if features.get('activity_score', 0) < 0.3:
            return 'High'
        elif features.get('activity_score', 0) < 0.5:
            return 'Medium'
        else:
            return 'Low'
    
    def _generate_engagement_recommendations(self, features: Dict[str, float]) -> List[str]:
        """Generate engagement recommendations"""
        recommendations = []
        if features.get('activity_score', 0) < 0.5:
            recommendations.append('Increase platform engagement')
        if features.get('collaboration_score', 0) < 0.5:
            recommendations.append('Join more teams and ventures')
        if features.get('legal_compliance', 0) == 0:
            recommendations.append('Complete legal document signing')
        return recommendations
    
    def _calculate_success_probability(self, features: Dict[str, float]) -> float:
        """Calculate venture success probability"""
        score = 0.0
        score += features.get('team_size', 0) / 10 * 0.2
        score += features.get('owner_experience', 0) * 0.3
        score += features.get('legal_compliance', 0) * 0.2
        score += features.get('business_model_score', 0) * 0.3
        return min(score, 1.0)
    
    def _get_success_level(self, probability: float) -> str:
        """Get success level from probability"""
        if probability >= 0.8:
            return 'Very High'
        elif probability >= 0.6:
            return 'High'
        elif probability >= 0.4:
            return 'Medium'
        else:
            return 'Low'
    
    def _identify_success_factors(self, features: Dict[str, float]) -> List[str]:
        """Identify key success factors"""
        factors = []
        if features.get('owner_experience', 0) > 0.7:
            factors.append('Experienced founder')
        if features.get('team_size', 0) > 5:
            factors.append('Strong team size')
        if features.get('legal_compliance', 0) > 0:
            factors.append('Legal compliance')
        return factors
    
    def _identify_risk_factors(self, features: Dict[str, float]) -> List[str]:
        """Identify risk factors"""
        risks = []
        if features.get('team_size', 0) < 3:
            risks.append('Small team size')
        if features.get('competition_level', 0) > 0.8:
            risks.append('High competition')
        if features.get('legal_compliance', 0) == 0:
            risks.append('Legal compliance risk')
        return risks
    
    def _generate_venture_recommendations(self, features: Dict[str, float]) -> List[str]:
        """Generate venture recommendations"""
        recommendations = []
        if features.get('team_size', 0) < 5:
            recommendations.append('Expand team')
        if features.get('legal_compliance', 0) == 0:
            recommendations.append('Complete legal compliance')
        if features.get('technology_score', 0) < 0.7:
            recommendations.append('Improve technology stack')
        return recommendations
    
    def _predict_success_timeline(self, features: Dict[str, float]) -> str:
        """Predict success timeline"""
        if features.get('success_probability', 0) > 0.8:
            return '6-12 months'
        elif features.get('success_probability', 0) > 0.6:
            return '12-18 months'
        else:
            return '18-24 months'
    
    def _analyze_clusters(self, clusters_data: Dict[str, List]) -> Dict[str, Any]:
        """Analyze cluster characteristics"""
        analysis = {}
        for cluster_id, users in clusters_data.items():
            analysis[f'cluster_{cluster_id}'] = {
                'size': len(users),
                'characteristics': f'Cluster {cluster_id} characteristics',
                'avg_features': 'Average feature values'
            }
        return analysis
