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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class SmartStartBrain:
    """Main intelligence engine for SmartStart platform"""
    
    def __init__(self):
        self.ml_engine = MLEngine()
        self.analytics_engine = AnalyticsEngine()
        self.legal_processor = LegalProcessor()
        self.venture_analyzer = VentureAnalyzer()
        self.user_behavior_analyzer = UserBehaviorAnalyzer()
        self.nodejs_connector = NodeJSConnector()
        
        logger.info("🧠 SmartStart Brain initialized successfully")
    
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
        'version': '1.0.0',
        'modules': {
            'ml_engine': 'active',
            'analytics_engine': 'active',
            'legal_processor': 'active',
            'venture_analyzer': 'active',
            'user_behavior_analyzer': 'active'
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
