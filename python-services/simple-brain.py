#!/usr/bin/env python3
"""
Simple Python Brain - Basic Flask API for testing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'smartstart-python-brain',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'message': 'Python Brain is running!',
        'python_services': {
            'user_service': 'ready',
            'legal_service': 'ready',
            'venture_service': 'ready',
            'gamification_service': 'ready',
            'buz_token_service': 'ready',
            'umbrella_service': 'ready'
        },
        'api_endpoints': {
            'total_endpoints': 25,
            'status': 'operational'
        }
    })

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        'message': 'Python Brain is working!',
        'timestamp': datetime.now().isoformat(),
        'status': 'success'
    })

@app.route('/users/create', methods=['POST'])
def create_user():
    """Create user endpoint"""
    data = request.json
    return jsonify({
        'success': True,
        'message': 'User creation endpoint working',
        'data': data,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/ventures/create', methods=['POST'])
def create_venture():
    """Create venture endpoint"""
    data = request.json
    return jsonify({
        'success': True,
        'message': 'Venture creation endpoint working',
        'data': data,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/tokens/balance/<user_id>', methods=['GET'])
def get_token_balance(user_id):
    """Get token balance endpoint"""
    return jsonify({
        'success': True,
        'message': 'Token balance endpoint working',
        'user_id': user_id,
        'balance': 10000,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('NODE_ENV', 'production') != 'production'
    
    print(f"🚀 Starting Simple Python Brain on port {port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌍 Environment: {os.getenv('NODE_ENV', 'development')}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
