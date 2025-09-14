"""
Enhanced Python Brain v2.2.0
SmartStart Platform - Comprehensive Legal & Venture Management System
"""

import logging
from flask import Flask, jsonify, request
import sys
import os
from datetime import datetime

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.legal_service import LegalService
from services.venture_legal_service import VentureLegalService
from services.unified_service import UnifiedService
from services.nodejs_connector import NodeJSConnector
from routes.venture_legal_api import venture_legal_bp
from routes.unified_api import unified_bp

# Initialize Flask app
app = Flask(__name__)

# Initialize services
connector = NodeJSConnector()
legal_service = LegalService(connector)
venture_legal_service = VentureLegalService(connector)
unified_service = UnifiedService(connector)

# Register blueprints
app.register_blueprint(venture_legal_bp)
app.register_blueprint(unified_bp)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        test_query = "SELECT 1 as test"
        result = connector.query(test_query)
        
        if result:
            return jsonify({
                "success": True,
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "service": "enhanced-python-brain-v2.2.0",
                "features": [
                    "Legal Document Management",
                    "Venture Legal System",
                    "Team Charter Management",
                    "30-Day Project Plans",
                    "RACI Matrix",
                    "SMART Goals",
                    "Liability Management",
                    "Digital Signatures"
                ]
            }), 200
        else:
            return jsonify({
                "success": False,
                "status": "unhealthy",
                "error": "Database connection failed"
            }), 500
            
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/api/legal/documents/<user_id>', methods=['GET'])
def get_legal_documents(user_id):
    """Get legal documents for user"""
    try:
        result = legal_service.get_legal_documents_for_user(user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error getting legal documents: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/legal/sign/<user_id>/<document_id>', methods=['POST'])
def sign_legal_document(user_id, document_id):
    """Sign legal document"""
    try:
        data = request.get_json()
        
        result = legal_service.sign_legal_document(
            user_id=user_id,
            document_id=document_id,
            signature_data=data
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error signing legal document: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/legal/compliance/<user_id>', methods=['GET'])
def check_legal_compliance(user_id):
    """Check user legal compliance"""
    try:
        result = legal_service.check_user_legal_compliance(user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error checking legal compliance: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/legal/templates', methods=['GET'])
def get_legal_templates():
    """Get all legal templates"""
    try:
        result = legal_service.get_all_legal_templates()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error getting legal templates: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/legal/templates/<template_id>', methods=['GET'])
def get_legal_template(template_id):
    """Get legal template by ID"""
    try:
        result = legal_service.get_legal_document_template(template_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting legal template: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/legal/templates', methods=['POST'])
def create_legal_template():
    """Create legal template (admin only)"""
    try:
        data = request.get_json()
        
        result = legal_service.create_legal_document(data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating legal template: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Enhanced Python Brain v2.2.0")
    logger.info("⚖️ Legal Document Management System: Active")
    logger.info("🏢 Venture Legal System: Active")
    logger.info("📋 Team Charter Management: Active")
    logger.info("📅 30-Day Project Plans: Active")
    logger.info("👥 RACI Matrix: Active")
    logger.info("🎯 SMART Goals: Active")
    logger.info("⚠️ Liability Management: Active")
    logger.info("✍️ Digital Signatures: Active")
    
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)