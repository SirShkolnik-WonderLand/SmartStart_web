#!/usr/bin/env python3
"""
SmartStart Python Brain - Main Intelligence Engine
The brain that powers all ML, AI, analytics, and heavy processing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import os
import json
from typing import Dict, List, Any

# Import brain modules
from ml_engine import MLEngine
from analytics_engine import AnalyticsEngine
from legal_processor import LegalProcessor
from venture_analyzer import VentureAnalyzer
from user_behavior_analyzer import UserBehaviorAnalyzer
from nodejs_connector import NodeJSConnector

# Import Python services
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))
from user_service import UserService
from legal_service import LegalService
from venture_service import VentureService
from gamification_service import GamificationService
from buz_token_service import BUZTokenService
from umbrella_service import UmbrellaService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class SmartStartBrain:
    """Main intelligence engine for SmartStart platform"""
    
    def __init__(self):
        # Initialize brain modules
        self.ml_engine = MLEngine()
        self.analytics_engine = AnalyticsEngine()
        self.legal_processor = LegalProcessor()
        self.venture_analyzer = VentureAnalyzer()
        self.user_behavior_analyzer = UserBehaviorAnalyzer()
        self.nodejs_connector = NodeJSConnector()
        
        # Initialize Python services
        self.user_service = UserService(self.nodejs_connector)
        self.legal_service = LegalService(self.nodejs_connector)
        self.venture_service = VentureService(self.nodejs_connector)
        self.gamification_service = GamificationService(self.nodejs_connector)
        self.buz_token_service = BUZTokenService(self.nodejs_connector)
        self.umbrella_service = UmbrellaService(self.nodejs_connector)
        
        logger.info("🧠 SmartStart Brain initialized successfully with all Python services")
    
    def process_request(self, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Main request processor - routes to appropriate brain module"""
        try:
            logger.info(f"🧠 Processing {request_type} request")
            
            if request_type == "user_analysis":
                return self.user_behavior_analyzer.analyze_user(data)
            
            elif request_type == "venture_analysis":
                return self.venture_analyzer.analyze_venture(data)
            
            elif request_type == "legal_processing":
                return self.legal_processor.process_documents(data)
            
            elif request_type == "ml_prediction":
                return self.ml_engine.make_prediction(data)
            
            elif request_type == "analytics":
                return self.analytics_engine.generate_analytics(data)
            
            elif request_type == "opportunity_matching":
                return self.ml_engine.match_opportunities(data)
            
            elif request_type == "network_analysis":
                return self.analytics_engine.analyze_network(data)
            
            else:
                return {"error": f"Unknown request type: {request_type}"}
                
        except Exception as e:
            logger.error(f"🧠 Error processing {request_type}: {e}")
            return {"error": str(e)}

# Initialize the brain
brain = SmartStartBrain()

# API Endpoints
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'smartstart-brain',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'modules': {
            'ml_engine': 'active',
            'analytics_engine': 'active',
            'legal_processor': 'active',
            'venture_analyzer': 'active',
            'user_behavior_analyzer': 'active'
        },
        'python_services': {
            'user_service': 'active',
            'legal_service': 'active',
            'venture_service': 'active',
            'gamification_service': 'active',
            'buz_token_service': 'active',
            'umbrella_service': 'active'
        },
        'api_endpoints': {
            'total_endpoints': 25,
            'brain_endpoints': 8,
            'service_endpoints': 17,
            'categories': [
                'User Management',
                'Legal Processing',
                'Venture Management',
                'Gamification',
                'BUZ Token Economy',
                'Umbrella Relationships',
                'ML & Analytics',
                'AI Insights'
            ]
        }
    })

@app.route('/process', methods=['POST'])
def process_request():
    """Main processing endpoint"""
    try:
        data = request.json
        request_type = data.get('type')
        
        if not request_type:
            return jsonify({"error": "Request type is required"}), 400
        
        result = brain.process_request(request_type, data)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in process_request: {e}")
        return jsonify({"error": str(e)}), 500

# Specific endpoint shortcuts
@app.route('/analyze/user', methods=['POST'])
def analyze_user():
    """Analyze user behavior and patterns"""
    data = request.json
    result = brain.user_behavior_analyzer.analyze_user(data)
    return jsonify(result)

@app.route('/analyze/venture', methods=['POST'])
def analyze_venture():
    """Analyze venture performance and potential"""
    data = request.json
    result = brain.venture_analyzer.analyze_venture(data)
    return jsonify(result)

@app.route('/process/legal', methods=['POST'])
def process_legal():
    """Process legal documents and compliance"""
    data = request.json
    result = brain.legal_processor.process_documents(data)
    return jsonify(result)

@app.route('/predict', methods=['POST'])
def make_prediction():
    """Make ML predictions"""
    data = request.json
    result = brain.ml_engine.make_prediction(data)
    return jsonify(result)

@app.route('/analytics', methods=['POST'])
def generate_analytics():
    """Generate analytics and insights"""
    data = request.json
    result = brain.analytics_engine.generate_analytics(data)
    return jsonify(result)

@app.route('/match/opportunities', methods=['POST'])
def match_opportunities():
    """Match users with opportunities using ML"""
    data = request.json
    result = brain.ml_engine.match_opportunities(data)
    return jsonify(result)

@app.route('/analyze/network', methods=['POST'])
def analyze_network():
    """Analyze network effects and relationships"""
    data = request.json
    result = brain.analytics_engine.analyze_network(data)
    return jsonify(result)

# ===== PYTHON SERVICES API ENDPOINTS =====

# User Service Endpoints
@app.route('/users/create', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    result = brain.user_service.create_user(data)
    return jsonify(result)

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    result = brain.user_service.get_user(user_id)
    return jsonify(result)

@app.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user"""
    data = request.json
    result = brain.user_service.update_user(user_id, data)
    return jsonify(result)

# Legal Service Endpoints
@app.route('/legal/documents/create', methods=['POST'])
def create_legal_document():
    """Create a legal document"""
    data = request.json
    result = brain.legal_service.create_legal_document(data)
    return jsonify(result)

@app.route('/legal/documents/<document_id>/sign', methods=['POST'])
def sign_legal_document(document_id):
    """Sign a legal document"""
    data = request.json
    user_id = data.get('user_id')
    signature_data = data.get('signature_data', {})
    result = brain.legal_service.sign_legal_document(user_id, document_id, signature_data)
    return jsonify(result)

@app.route('/legal/compliance/<user_id>', methods=['GET'])
def check_legal_compliance(user_id):
    """Check user legal compliance"""
    result = brain.legal_service.check_user_legal_compliance(user_id)
    return jsonify(result)

# Venture Service Endpoints
@app.route('/ventures/create', methods=['POST'])
def create_venture():
    """Create a new venture"""
    data = request.json
    result = brain.venture_service.create_venture(data)
    return jsonify(result)

@app.route('/ventures/<venture_id>', methods=['GET'])
def get_venture(venture_id):
    """Get venture by ID"""
    result = brain.venture_service.get_venture(venture_id)
    return jsonify(result)

@app.route('/ventures/<venture_id>', methods=['PUT'])
def update_venture(venture_id):
    """Update venture"""
    data = request.json
    result = brain.venture_service.update_venture(venture_id, data)
    return jsonify(result)

@app.route('/ventures/<venture_id>/analytics', methods=['GET'])
def get_venture_analytics(venture_id):
    """Get venture analytics"""
    result = brain.venture_service.get_venture_analytics(venture_id)
    return jsonify(result)

@app.route('/ventures/search', methods=['POST'])
def search_ventures():
    """Search ventures"""
    data = request.json
    result = brain.venture_service.search_ventures(data)
    return jsonify(result)

# Gamification Service Endpoints
@app.route('/gamification/xp/award', methods=['POST'])
def award_xp():
    """Award XP to user"""
    data = request.json
    user_id = data.get('user_id')
    activity = data.get('activity')
    metadata = data.get('metadata', {})
    result = brain.gamification_service.award_xp(user_id, activity, metadata)
    return jsonify(result)

@app.route('/gamification/<user_id>', methods=['GET'])
def get_gamification_data(user_id):
    """Get user gamification data"""
    result = brain.gamification_service.get_user_gamification_data(user_id)
    return jsonify(result)

@app.route('/gamification/achievements/<user_id>/unlock', methods=['POST'])
def unlock_achievement(user_id):
    """Unlock achievement for user"""
    data = request.json
    achievement_id = data.get('achievement_id')
    result = brain.gamification_service.unlock_achievement(user_id, achievement_id)
    return jsonify(result)

@app.route('/gamification/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get leaderboard"""
    category = request.args.get('category', 'xp')
    limit = int(request.args.get('limit', 100))
    result = brain.gamification_service.get_leaderboard(category, limit)
    return jsonify(result)

# BUZ Token Service Endpoints
@app.route('/tokens/balance/<user_id>', methods=['GET'])
def get_token_balance(user_id):
    """Get user token balance"""
    result = brain.buz_token_service.get_user_balance(user_id)
    return jsonify(result)

@app.route('/tokens/transfer', methods=['POST'])
def transfer_tokens():
    """Transfer tokens between users"""
    data = request.json
    from_user_id = data.get('from_user_id')
    to_user_id = data.get('to_user_id')
    amount = data.get('amount')
    transaction_type = data.get('transaction_type', 'TRANSFER')
    metadata = data.get('metadata', {})
    result = brain.buz_token_service.transfer_tokens(from_user_id, to_user_id, amount, transaction_type, metadata)
    return jsonify(result)

@app.route('/tokens/stake', methods=['POST'])
def stake_tokens():
    """Stake tokens"""
    data = request.json
    user_id = data.get('user_id')
    amount = data.get('amount')
    staking_period = data.get('staking_period')
    staking_type = data.get('staking_type', 'STANDARD')
    result = brain.buz_token_service.stake_tokens(user_id, amount, staking_period, staking_type)
    return jsonify(result)

@app.route('/tokens/unstake', methods=['POST'])
def unstake_tokens():
    """Unstake tokens"""
    data = request.json
    user_id = data.get('user_id')
    staking_id = data.get('staking_id')
    result = brain.buz_token_service.unstake_tokens(user_id, staking_id)
    return jsonify(result)

@app.route('/tokens/economy/stats', methods=['GET'])
def get_token_economy_stats():
    """Get token economy statistics"""
    result = brain.buz_token_service.get_token_economy_stats()
    return jsonify(result)

# Umbrella Service Endpoints
@app.route('/umbrella/relationships/create', methods=['POST'])
def create_umbrella_relationship():
    """Create umbrella relationship"""
    data = request.json
    result = brain.umbrella_service.create_umbrella_relationship(data)
    return jsonify(result)

@app.route('/umbrella/relationships/<relationship_id>/accept', methods=['POST'])
def accept_relationship(relationship_id):
    """Accept relationship"""
    data = request.json
    user_id = data.get('user_id')
    acceptance_data = data.get('acceptance_data', {})
    result = brain.umbrella_service.accept_relationship(relationship_id, user_id, acceptance_data)
    return jsonify(result)

@app.route('/umbrella/relationships/<relationship_id>', methods=['PUT'])
def update_relationship(relationship_id):
    """Update relationship"""
    data = request.json
    user_id = data.get('user_id')
    update_data = data.get('update_data', {})
    result = brain.umbrella_service.update_relationship(relationship_id, user_id, update_data)
    return jsonify(result)

@app.route('/umbrella/relationships/<user_id>', methods=['GET'])
def get_user_relationships(user_id):
    """Get user relationships"""
    relationship_type = request.args.get('type')
    status = request.args.get('status')
    result = brain.umbrella_service.get_user_relationships(user_id, relationship_type, status)
    return jsonify(result)

@app.route('/umbrella/revenue-sharing/<relationship_id>', methods=['POST'])
def calculate_revenue_sharing(relationship_id):
    """Calculate revenue sharing"""
    data = request.json
    result = brain.umbrella_service.calculate_revenue_sharing(relationship_id, data)
    return jsonify(result)

@app.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """Get personalized recommendations for user"""
    try:
        # Get user data from Node.js
        user_data = brain.nodejs_connector.get_user_data(user_id)
        
        # Generate recommendations
        recommendations = brain.user_behavior_analyzer.generate_recommendations(user_data)
        
        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/dashboard/<user_id>', methods=['GET'])
def get_dashboard_data(user_id):
    """Get comprehensive dashboard data"""
    try:
        # Get user data from Node.js
        user_data = brain.nodejs_connector.get_user_data(user_id)
        
        # Generate comprehensive dashboard data
        dashboard_data = {
            'user_analysis': brain.user_behavior_analyzer.analyze_user(user_data),
            'recommendations': brain.user_behavior_analyzer.generate_recommendations(user_data),
            'analytics': brain.analytics_engine.generate_user_analytics(user_data),
            'network_analysis': brain.analytics_engine.analyze_network(user_data),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
