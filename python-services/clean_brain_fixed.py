#!/usr/bin/env python3
"""
Clean Python Brain - Fixed Version
SmartStart Platform - Venture Legal System
"""

import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime
import json

# Try to import database connector, fallback to API-based version
try:
    from database_connector import db
    logger = logging.getLogger(__name__)
    logger.info("Using direct database connection")
except ImportError as e:
    logger = logging.getLogger(__name__)
    logger.warning(f"Direct database connection failed: {e}")
    logger.info("Falling back to API-based database connector")
    from database_connector_fallback import db

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["https://smartstart-frontend.onrender.com", "https://smartstart-api.onrender.com"], 
     allow_headers=["Content-Type", "Authorization"], 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            "success": True,
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "clean-python-brain-v1.0.1",
            "features": [
                "Venture Legal System",
                "Team Charter Management", 
                "30-Day Project Plans",
                "RACI Matrix",
                "SMART Goals",
                "Liability Management",
                "Digital Signatures"
            ],
            "version": "1.0.1",
            "python_brain": "operational"
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/api/v1/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user data"""
    try:
        user = db.get_user_by_id(user_id)
        if user:
            return jsonify({
                "success": True,
                "data": user
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/ventures/list/all', methods=['GET'])
def get_all_ventures():
    """Get all ventures"""
    try:
        ventures = db.get_user_ventures("all")  # Get all ventures
        return jsonify({
            "success": True,
            "data": ventures
        }), 200
    except Exception as e:
        logger.error(f"Error getting ventures: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/buz/supply', methods=['GET'])
def get_buz_supply():
    """Get BUZ token supply information"""
    try:
        return jsonify({
            "success": True,
            "supply": {
                "total": 999999999,
                "circulating": 500000000,
                "price_usd": 0.02,
                "market_cap": 10000000
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting BUZ supply: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/buz/wallet/<user_id>', methods=['GET'])
def get_user_buz_wallet(user_id):
    """Get user BUZ wallet"""
    try:
        buz_data = db.get_user_buz_tokens(user_id)
        return jsonify({
            "success": True,
            "data": buz_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting BUZ wallet for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/venture-legal/dashboard/<user_id>', methods=['GET'])
def get_venture_legal_dashboard(user_id):
    """Get venture legal dashboard"""
    try:
        dashboard_data = db.get_venture_legal_dashboard(user_id)
        return jsonify({
            "success": True,
            "data": dashboard_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting legal dashboard for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/analytics/user/<user_id>', methods=['GET'])
def get_user_analytics(user_id):
    """Get user analytics"""
    try:
        user = db.get_user_by_id(user_id)
        ventures = db.get_user_ventures(user_id)
        buz_data = db.get_user_buz_tokens(user_id)
        
        analytics = {
            "user_id": user_id,
            "total_ventures": len(ventures),
            "active_ventures": len([v for v in ventures if v.get('status') == 'active']),
            "buz_balance": buz_data.get('balance', 0),
            "xp_points": user.get('xp', 0) if user else 0,
            "level": user.get('level', 'Unknown') if user else 'Unknown'
        }
        
        return jsonify({
            "success": True,
            "data": analytics
        }), 200
    except Exception as e:
        logger.error(f"Error getting analytics for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
