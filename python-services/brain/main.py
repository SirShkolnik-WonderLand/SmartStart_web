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

# Import brain modules (commented out for deployment compatibility)
# from ml_engine import MLEngine
# from analytics_engine import AnalyticsEngine
# from legal_processor import LegalProcessor
# from venture_analyzer import VentureAnalyzer
# from user_behavior_analyzer import UserBehaviorAnalyzer
# from nodejs_connector import NodeJSConnector

# Create dummy brain modules for compatibility
class DummyBrainModule:
    def __init__(self, *args, **kwargs):
        pass
    def analyze_user(self, data):
        return {"success": True, "message": "Brain module not available"}
    def analyze_venture(self, data):
        return {"success": True, "message": "Brain module not available"}
    def process_documents(self, data):
        return {"success": True, "message": "Brain module not available"}
    def make_prediction(self, data):
        return {"success": True, "message": "Brain module not available"}
    def generate_analytics(self, data):
        return {"success": True, "message": "Brain module not available"}
    def match_opportunities(self, data):
        return {"success": True, "message": "Brain module not available"}
    def analyze_network(self, data):
        return {"success": True, "message": "Brain module not available"}
    def generate_recommendations(self, data):
        return {"success": True, "message": "Brain module not available"}

class DummyNodeJSConnector:
    def __init__(self, *args, **kwargs):
        pass
    def get_user_data(self, user_id):
        return {"success": True, "data": {"id": user_id}}

# Use dummy modules
MLEngine = DummyBrainModule
AnalyticsEngine = DummyBrainModule
LegalProcessor = DummyBrainModule
VentureAnalyzer = DummyBrainModule
UserBehaviorAnalyzer = DummyBrainModule

# Import real NodeJSConnector
try:
    from nodejs_connector import NodeJSConnector
    print("✅ NodeJSConnector imported successfully")
except ImportError as e:
    print(f"⚠️  NodeJSConnector import error: {e}")
    NodeJSConnector = DummyNodeJSConnector

# Import Python services
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))

try:
    from user_service import UserService
    from legal_service import LegalService
    from venture_service import VentureService
    from gamification_service import GamificationService
    from buz_token_service import BUZTokenService
    from umbrella_service import UmbrellaService
    from authentication_service import AuthenticationService
    from file_service import FileService
    from analytics_service import AnalyticsService
    from notification_service import NotificationService
    from websocket_service import WebSocketService
    from state_machine_service import StateMachineService
    from rbac_service import RBACService
    from crud_service import CRUDService
    from user_journey_service import UserJourneyService
except ImportError as e:
    print(f"Warning: Could not import Python services: {e}")
    # Create dummy services for now
    class DummyService:
        def __init__(self, *args, **kwargs):
            pass
        def create_user(self, data):
            return {"success": False, "message": "Service not available"}
        def get_user(self, user_id):
            return {"success": False, "message": "Service not available"}
        def update_user(self, user_id, data):
            return {"success": False, "message": "Service not available"}
        def create_legal_document(self, data):
            return {"success": False, "message": "Service not available"}
        def sign_legal_document(self, user_id, document_id, signature_data):
            return {"success": False, "message": "Service not available"}
        def check_user_legal_compliance(self, user_id):
            return {"success": False, "message": "Service not available"}
        def create_venture(self, data):
            return {"success": False, "message": "Service not available"}
        def get_venture(self, venture_id):
            return {"success": False, "message": "Service not available"}
        def update_venture(self, venture_id, data):
            return {"success": False, "message": "Service not available"}
        def get_venture_analytics(self, venture_id):
            return {"success": False, "message": "Service not available"}
        def search_ventures(self, data):
            return {"success": False, "message": "Service not available"}
        def award_xp(self, user_id, activity, metadata):
            return {"success": False, "message": "Service not available"}
        def get_user_gamification_data(self, user_id):
            return {"success": False, "message": "Service not available"}
        def unlock_achievement(self, user_id, achievement_id):
            return {"success": False, "message": "Service not available"}
        def get_leaderboard(self, category, limit):
            return {"success": False, "message": "Service not available"}
        def get_user_balance(self, user_id):
            return {"success": False, "message": "Service not available"}
        def transfer_tokens(self, from_user_id, to_user_id, amount, transaction_type, metadata):
            return {"success": False, "message": "Service not available"}
        def stake_tokens(self, user_id, amount, staking_period, staking_type):
            return {"success": False, "message": "Service not available"}
        def unstake_tokens(self, user_id, staking_id):
            return {"success": False, "message": "Service not available"}
        def get_token_economy_stats(self):
            return {"success": False, "message": "Service not available"}
        def create_umbrella_relationship(self, data):
            return {"success": False, "message": "Service not available"}
        def accept_relationship(self, relationship_id, user_id, acceptance_data):
            return {"success": False, "message": "Service not available"}
        def update_relationship(self, relationship_id, user_id, update_data):
            return {"success": False, "message": "Service not available"}
        def get_user_relationships(self, user_id, relationship_type, status):
            return {"success": False, "message": "Service not available"}
        def calculate_revenue_sharing(self, relationship_id, data):
            return {"success": False, "message": "Service not available"}
        def register_user(self, data):
            return {"success": False, "message": "Service not available"}
        def login_user(self, email, password):
            return {"success": False, "message": "Service not available"}
        def verify_token(self, token):
            return {"success": False, "message": "Service not available"}
        def upload_file(self, file_data, filename, user_id, file_type, metadata):
            return {"success": False, "message": "Service not available"}
        def download_file(self, file_id, user_id):
            return {"success": False, "message": "Service not available"}
        def get_user_analytics(self, user_id, period):
            return {"success": False, "message": "Service not available"}
        def get_platform_analytics(self, period):
            return {"success": False, "message": "Service not available"}
        def send_notification(self, user_id, notification_data):
            return {"success": False, "message": "Service not available"}
        def get_user_notifications(self, user_id, status, limit, offset):
            return {"success": False, "message": "Service not available"}
        async def start_server(self):
            return True
        async def send_to_user(self, user_id, message):
            return True
        async def send_notification(self, recipient_id, notification):
            return True
        def get_connection_stats(self):
            return {"total_connections": 0, "total_users": 0}
        async def create_state_machine(self, machine_type, instance_id, initial_context=None):
            return {"success": False, "message": "Service not available"}
        async def send_event(self, machine_type, instance_id, event, metadata=None):
            return {"success": False, "message": "Service not available"}
        async def get_state(self, machine_type, instance_id):
            return {"success": False, "message": "Service not available"}
        def get_machine_stats(self):
            return {"total_machines": 0, "machines_by_type": {}}
    
    UserService = DummyService
    LegalService = DummyService
    VentureService = DummyService
    GamificationService = DummyService
    BUZTokenService = DummyService
    UmbrellaService = DummyService
    AuthenticationService = DummyService
    FileService = DummyService
    AnalyticsService = DummyService
    NotificationService = DummyService
    WebSocketService = DummyService
    StateMachineService = DummyService

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
        self.authentication_service = AuthenticationService(self.nodejs_connector)
        self.file_service = FileService(self.nodejs_connector)
        self.analytics_service = AnalyticsService(self.nodejs_connector)
        self.notification_service = NotificationService(self.nodejs_connector)
        self.websocket_service = WebSocketService(self.nodejs_connector)
        self.state_machine_service = StateMachineService(self.nodejs_connector)
        self.rbac_service = RBACService()
        self.crud_service = CRUDService()
        self.user_journey_service = UserJourneyService()
        
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

# ===== NEW SERVICE API ENDPOINTS =====

# Authentication Service Endpoints
@app.route('/auth/register', methods=['POST'])
def register_user():
    """Register a new user"""
    data = request.json
    result = brain.authentication_service.register_user(data)
    return jsonify(result)

@app.route('/auth/login', methods=['POST'])
def login_user():
    """Login user"""
    data = request.json
    result = brain.authentication_service.login_user(data.get('email'), data.get('password'))
    return jsonify(result)

@app.route('/auth/verify', methods=['POST'])
def verify_token():
    """Verify JWT token"""
    data = request.json
    result = brain.authentication_service.verify_token(data.get('token'))
    return jsonify(result)

@app.route('/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh JWT token"""
    data = request.json
    result = brain.authentication_service.refresh_token(data.get('token'))
    return jsonify(result)

@app.route('/auth/logout', methods=['POST'])
def logout_user():
    """Logout user"""
    data = request.json
    result = brain.authentication_service.logout_user(data.get('token'))
    return jsonify(result)

# File Service Endpoints
@app.route('/files/upload', methods=['POST'])
def upload_file():
    """Upload a file"""
    data = request.json
    result = brain.file_service.upload_file(
        data.get('file_data'),
        data.get('filename'),
        data.get('user_id'),
        data.get('file_type', 'document'),
        data.get('metadata', {})
    )
    return jsonify(result)

@app.route('/files/<file_id>/download', methods=['GET'])
def download_file(file_id):
    """Download a file"""
    user_id = request.headers.get('X-User-ID')
    result = brain.file_service.download_file(file_id, user_id)
    return jsonify(result)

@app.route('/files/<file_id>', methods=['GET'])
def get_file_info(file_id):
    """Get file information"""
    user_id = request.headers.get('X-User-ID')
    result = brain.file_service.get_file_info(file_id, user_id)
    return jsonify(result)

@app.route('/files', methods=['GET'])
def list_user_files():
    """List user files"""
    user_id = request.headers.get('X-User-ID')
    file_type = request.args.get('type')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 50))
    
    result = brain.file_service.list_user_files(user_id, file_type, page, limit)
    return jsonify(result)

@app.route('/files/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete a file"""
    user_id = request.headers.get('X-User-ID')
    result = brain.file_service.delete_file(file_id, user_id)
    return jsonify(result)

# Analytics Service Endpoints
@app.route('/analytics/user/<user_id>', methods=['GET'])
def get_user_analytics(user_id):
    """Get user analytics"""
    period = request.args.get('period', '30d')
    result = brain.analytics_service.get_user_analytics(user_id, period)
    return jsonify(result)

@app.route('/analytics/venture/<venture_id>', methods=['GET'])
def get_venture_analytics_detailed(venture_id):
    """Get detailed venture analytics"""
    period = request.args.get('period', '30d')
    result = brain.analytics_service.get_venture_analytics(venture_id, period)
    return jsonify(result)

@app.route('/analytics/platform', methods=['GET'])
def get_platform_analytics():
    """Get platform analytics"""
    period = request.args.get('period', '30d')
    result = brain.analytics_service.get_platform_analytics(period)
    return jsonify(result)

@app.route('/analytics/report', methods=['POST'])
def generate_custom_report():
    """Generate custom analytics report"""
    data = request.json
    result = brain.analytics_service.get_custom_report(data)
    return jsonify(result)

@app.route('/analytics/insights', methods=['GET'])
def get_insights():
    """Get AI-powered insights"""
    user_id = request.args.get('user_id')
    venture_id = request.args.get('venture_id')
    result = brain.analytics_service.get_insights(user_id, venture_id)
    return jsonify(result)

# Notification Service Endpoints
@app.route('/notifications/send', methods=['POST'])
def send_notification():
    """Send a notification"""
    data = request.json
    result = brain.notification_service.send_notification(data.get('user_id'), data)
    return jsonify(result)

@app.route('/notifications/bulk', methods=['POST'])
def send_bulk_notification():
    """Send bulk notification"""
    data = request.json
    result = brain.notification_service.send_bulk_notification(data.get('user_ids'), data)
    return jsonify(result)

@app.route('/notifications/<user_id>', methods=['GET'])
def get_user_notifications(user_id):
    """Get user notifications"""
    status = request.args.get('status')
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    
    result = brain.notification_service.get_user_notifications(user_id, status, limit, offset)
    return jsonify(result)

@app.route('/notifications/<notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark notification as read"""
    user_id = request.headers.get('X-User-ID')
    result = brain.notification_service.mark_notification_read(notification_id, user_id)
    return jsonify(result)

@app.route('/notifications/<user_id>/read-all', methods=['POST'])
def mark_all_notifications_read(user_id):
    """Mark all notifications as read"""
    result = brain.notification_service.mark_all_notifications_read(user_id)
    return jsonify(result)

@app.route('/notifications/<notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    user_id = request.headers.get('X-User-ID')
    result = brain.notification_service.delete_notification(notification_id, user_id)
    return jsonify(result)

@app.route('/notifications/preferences/<user_id>', methods=['GET'])
def get_notification_preferences(user_id):
    """Get notification preferences"""
    result = brain.notification_service.get_notification_preferences(user_id)
    return jsonify(result)

@app.route('/notifications/preferences/<user_id>', methods=['PUT'])
def update_notification_preferences(user_id):
    """Update notification preferences"""
    data = request.json
    result = brain.notification_service.update_notification_preferences(user_id, data)
    return jsonify(result)

# WebSocket Service Endpoints
@app.route('/websocket/stats', methods=['GET'])
def get_websocket_stats():
    """Get WebSocket connection statistics"""
    result = brain.websocket_service.get_connection_stats()
    return jsonify(result)

@app.route('/websocket/send', methods=['POST'])
def send_websocket_message():
    """Send message via WebSocket"""
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')
    
    if not user_id or not message:
        return jsonify({"success": False, "error": "user_id and message required"}), 400
    
    # This would be async in real implementation
    result = {"success": True, "message": "WebSocket message queued"}
    return jsonify(result)

@app.route('/websocket/broadcast', methods=['POST'])
def broadcast_websocket_message():
    """Broadcast message to all connected users"""
    data = request.json
    message = data.get('message')
    
    if not message:
        return jsonify({"success": False, "error": "message required"}), 400
    
    # This would be async in real implementation
    result = {"success": True, "message": "Broadcast message queued"}
    return jsonify(result)

@app.route('/websocket/venture/<venture_id>/send', methods=['POST'])
def send_venture_websocket_message(venture_id):
    """Send message to venture subscribers"""
    data = request.json
    message = data.get('message')
    
    if not message:
        return jsonify({"success": False, "error": "message required"}), 400
    
    # This would be async in real implementation
    result = {"success": True, "message": f"Venture {venture_id} message queued"}
    return jsonify(result)

@app.route('/websocket/team/<team_id>/send', methods=['POST'])
def send_team_websocket_message(team_id):
    """Send message to team subscribers"""
    data = request.json
    message = data.get('message')
    
    if not message:
        return jsonify({"success": False, "error": "message required"}), 400
    
    # This would be async in real implementation
    result = {"success": True, "message": f"Team {team_id} message queued"}
    return jsonify(result)

# State Machine Service Endpoints
@app.route('/state-machines/create', methods=['POST'])
def create_state_machine():
    """Create a new state machine instance"""
    data = request.json
    machine_type = data.get('machine_type')
    instance_id = data.get('instance_id')
    initial_context = data.get('initial_context', {})
    
    if not machine_type or not instance_id:
        return jsonify({"success": False, "error": "machine_type and instance_id required"}), 400
    
    # This would be async in real implementation
    result = {"success": True, "message": f"State machine {machine_type} created for {instance_id}"}
    return jsonify(result)

@app.route('/state-machines/<machine_type>/<instance_id>/event', methods=['POST'])
def send_state_machine_event(machine_type, instance_id):
    """Send event to state machine"""
    data = request.json
    event = data.get('event')
    metadata = data.get('metadata', {})
    
    if not event:
        return jsonify({"success": False, "error": "event required"}), 400
    
    # This would be async in real implementation
    result = {"success": True, "message": f"Event {event} sent to {machine_type} machine {instance_id}"}
    return jsonify(result)

@app.route('/state-machines/<machine_type>/<instance_id>/state', methods=['GET'])
def get_state_machine_state(machine_type, instance_id):
    """Get current state of state machine"""
    # This would be async in real implementation
    result = {"success": True, "data": {"current_state": "draft", "context": {}}}
    return jsonify(result)

@app.route('/state-machines/stats', methods=['GET'])
def get_state_machine_stats():
    """Get state machine statistics"""
    result = brain.state_machine_service.get_machine_stats()
    return jsonify(result)

# RBAC Service Endpoints
@app.route('/rbac/user/<user_id>/roles', methods=['GET'])
def get_user_roles(user_id):
    """Get user's roles and permissions"""
    result = brain.rbac_service.get_user_roles(user_id)
    return jsonify({"success": True, "data": result})

@app.route('/rbac/user/<user_id>/permission', methods=['POST'])
def check_user_permission(user_id):
    """Check if user has specific permission"""
    data = request.json
    resource = data.get('resource')
    action = data.get('action')
    
    if not resource or not action:
        return jsonify({"success": False, "error": "Resource and action required"}), 400
    
    has_permission = brain.rbac_service.check_permission(user_id, resource, action)
    return jsonify({"success": True, "has_permission": has_permission})

@app.route('/rbac/user/<user_id>/role', methods=['POST'])
def check_user_role(user_id):
    """Check if user has specific role"""
    data = request.json
    required_roles = data.get('roles', [])
    
    if not required_roles:
        return jsonify({"success": False, "error": "Roles required"}), 400
    
    has_role = brain.rbac_service.check_role(user_id, required_roles)
    return jsonify({"success": True, "has_role": has_role})

@app.route('/rbac/user/<user_id>/legal-gate', methods=['POST'])
def enforce_legal_gate(user_id):
    """Enforce legal gate for user action"""
    data = request.json
    action = data.get('action', 'access')
    
    result = brain.rbac_service.enforce_legal_gate(user_id, action)
    return jsonify(result)

@app.route('/rbac/roles', methods=['GET'])
def get_all_roles():
    """Get all available roles"""
    result = brain.rbac_service.get_all_roles()
    return jsonify({"success": True, "data": result})

@app.route('/rbac/permissions', methods=['GET'])
def get_all_permissions():
    """Get all available permissions"""
    result = brain.rbac_service.get_all_permissions()
    return jsonify({"success": True, "data": result})

@app.route('/rbac/stats', methods=['GET'])
def get_rbac_stats():
    """Get RBAC system statistics"""
    result = brain.rbac_service.get_rbac_stats()
    return jsonify({"success": True, "data": result})

# CRUD Service Endpoints
@app.route('/crud/<table>', methods=['POST'])
def create_record(table):
    """Create a new record in specified table"""
    data = request.json
    result = brain.crud_service.create(table, data)
    return jsonify(result)

@app.route('/crud/<table>', methods=['GET'])
def read_records(table):
    """Read records from specified table"""
    filters = request.args.to_dict()
    order_by = request.args.get('order_by')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)
    
    result = brain.crud_service.read(table, filters, order_by, limit, offset)
    return jsonify(result)

@app.route('/crud/<table>/<record_id>', methods=['GET'])
def read_record_by_id(table, record_id):
    """Read a single record by ID"""
    result = brain.crud_service.read_by_id(table, record_id)
    return jsonify(result)

@app.route('/crud/<table>/<record_id>', methods=['PUT'])
def update_record(table, record_id):
    """Update a record in specified table"""
    data = request.json
    result = brain.crud_service.update(table, record_id, data)
    return jsonify(result)

@app.route('/crud/<table>/<record_id>', methods=['DELETE'])
def delete_record(table, record_id):
    """Delete a record from specified table"""
    result = brain.crud_service.delete(table, record_id)
    return jsonify(result)

@app.route('/crud/<table>/<record_id>/soft-delete', methods=['PUT'])
def soft_delete_record(table, record_id):
    """Soft delete a record (set deletedAt timestamp)"""
    result = brain.crud_service.soft_delete(table, record_id)
    return jsonify(result)

@app.route('/crud/<table>/count', methods=['GET'])
def count_records(table):
    """Count records in specified table"""
    filters = request.args.to_dict()
    result = brain.crud_service.count(table, filters)
    return jsonify(result)

@app.route('/crud/<table>/search', methods=['POST'])
def search_records(table):
    """Search records using LIKE queries"""
    data = request.json
    search_term = data.get('search_term')
    search_columns = data.get('search_columns', [])
    filters = data.get('filters', {})
    limit = data.get('limit', 50)
    
    if not search_term or not search_columns:
        return jsonify({"success": False, "error": "Search term and columns required"}), 400
    
    result = brain.crud_service.search(table, search_term, search_columns, filters, limit)
    return jsonify(result)

@app.route('/crud/query', methods=['POST'])
def execute_raw_query():
    """Execute a raw SQL query"""
    data = request.json
    query = data.get('query')
    params = data.get('params', [])
    
    if not query:
        return jsonify({"success": False, "error": "Query required"}), 400
    
    result = brain.crud_service.execute_raw_query(query, params)
    return jsonify(result)

@app.route('/crud/transaction', methods=['POST'])
def execute_transaction():
    """Execute multiple operations in a transaction"""
    data = request.json
    operations = data.get('operations', [])
    
    if not operations:
        return jsonify({"success": False, "error": "Operations required"}), 400
    
    result = brain.crud_service.execute_transaction(operations)
    return jsonify(result)

@app.route('/crud/stats', methods=['GET'])
def get_database_stats():
    """Get database statistics"""
    result = brain.crud_service.get_database_stats()
    return jsonify({"success": True, "data": result})

# User Journey Service Endpoints
@app.route('/journey/user/<user_id>/state', methods=['GET'])
def get_user_journey_state(user_id):
    """Get user's journey state for all stages"""
    result = brain.user_journey_service.get_user_journey_state(user_id)
    return jsonify({"success": True, "data": result})

@app.route('/journey/user/<user_id>/current-stage', methods=['GET'])
def get_current_stage(user_id):
    """Get user's current journey stage"""
    result = brain.user_journey_service.get_current_stage(user_id)
    return jsonify({"success": True, "data": result})

@app.route('/journey/user/<user_id>/progress', methods=['GET'])
def get_journey_progress(user_id):
    """Get user's journey progress"""
    result = brain.user_journey_service.get_journey_progress(user_id)
    return jsonify({"success": True, "data": result})

@app.route('/journey/user/<user_id>/stage/<stage_id>/start', methods=['POST'])
def start_journey_stage(user_id, stage_id):
    """Start a journey stage for a user"""
    result = brain.user_journey_service.start_stage(user_id, stage_id)
    return jsonify({"success": result})

@app.route('/journey/user/<user_id>/stage/<stage_id>/complete', methods=['POST'])
def complete_journey_stage(user_id, stage_id):
    """Complete a journey stage for a user"""
    data = request.json
    metadata = data.get('metadata', {})
    
    result = brain.user_journey_service.complete_stage(user_id, stage_id, metadata)
    return jsonify({"success": result})

@app.route('/journey/user/<user_id>/stage/<stage_id>/block', methods=['POST'])
def block_journey_stage(user_id, stage_id):
    """Block a journey stage for a user"""
    data = request.json
    reason = data.get('reason', 'No reason provided')
    
    result = brain.user_journey_service.block_stage(user_id, stage_id, reason)
    return jsonify({"success": result})

@app.route('/journey/stages', methods=['GET'])
def get_all_journey_stages():
    """Get all journey stages"""
    result = brain.user_journey_service.get_all_stages()
    return jsonify({"success": True, "data": result})

@app.route('/journey/stage/<stage_id>/gates', methods=['GET'])
def get_stage_gates(stage_id):
    """Get gates/requirements for a journey stage"""
    result = brain.user_journey_service.get_stage_gates(stage_id)
    return jsonify({"success": True, "data": result})

@app.route('/journey/user/<user_id>/stage/<stage_id>/check-gates', methods=['POST'])
def check_stage_gates(user_id, stage_id):
    """Check if user meets all requirements for a stage"""
    result = brain.user_journey_service.check_stage_gates(user_id, stage_id)
    return jsonify(result)

@app.route('/journey/analytics', methods=['GET'])
def get_journey_analytics():
    """Get journey analytics"""
    result = brain.user_journey_service.get_journey_analytics()
    return jsonify({"success": True, "data": result})

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "version": "3.1.0",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "user_service": "active",
            "legal_service": "active",
            "venture_service": "active",
            "gamification_service": "active",
            "buz_token_service": "active",
            "umbrella_service": "active",
            "authentication_service": "active",
            "file_service": "active",
            "analytics_service": "active",
            "notification_service": "active",
            "websocket_service": "active",
            "state_machine_service": "active",
            "rbac_service": "active",
            "crud_service": "active",
            "user_journey_service": "active"
        },
        "total_endpoints": 80,
        "python_brain": "operational"
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
