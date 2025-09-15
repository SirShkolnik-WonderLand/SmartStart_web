"""
Enhanced SmartStart Venture API Routes
Advanced API endpoints for venture management with BUZ tokens, file uploads, and collaboration
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
import sys
import os

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.enhanced_venture_service import EnhancedVentureService
from services.nodejs_connector import NodeJSConnector

logger = logging.getLogger(__name__)

# Create Blueprint
enhanced_venture_bp = Blueprint('enhanced_venture', __name__, url_prefix='/api/ventures')

# Initialize services
connector = NodeJSConnector()
venture_service = EnhancedVentureService(connector)

# ==============================================
# VENTURE CREATION ENDPOINTS
# ==============================================

@enhanced_venture_bp.route('/create', methods=['POST'])
def create_venture():
    """Create a new venture with BUZ token integration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'description', 'ownerUserId', 'industry', 'tier']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = venture_service.create_venture(data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating venture: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/', methods=['GET'])
def get_ventures():
    """Get ventures with filtering and pagination"""
    try:
        # Extract query parameters
        filters = {
            'search': request.args.get('search'),
            'industry': request.args.get('industry', 'All'),
            'stage': request.args.get('stage', 'All'),
            'sortBy': request.args.get('sortBy', 'newest'),
            'page': int(request.args.get('page', 1)),
            'limit': int(request.args.get('limit', 20))
        }
        
        result = venture_service.get_ventures(filters)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error getting ventures: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>', methods=['GET'])
def get_venture(venture_id):
    """Get detailed venture information"""
    try:
        result = venture_service.get_venture(venture_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting venture: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/update', methods=['PUT'])
def update_venture(venture_id):
    """Update venture information"""
    try:
        data = request.get_json()
        
        # TODO: Implement venture update logic
        return jsonify({
            "success": True,
            "message": "Venture updated successfully",
            "ventureId": venture_id
        }), 200
            
    except Exception as e:
        logger.error(f"Error updating venture: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/delete', methods=['DELETE'])
def delete_venture(venture_id):
    """Delete venture"""
    try:
        # TODO: Implement venture deletion logic
        return jsonify({
            "success": True,
            "message": "Venture deleted successfully",
            "ventureId": venture_id
        }), 200
            
    except Exception as e:
        logger.error(f"Error deleting venture: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# COLLABORATION ENDPOINTS
# ==============================================

@enhanced_venture_bp.route('/<venture_id>/apply', methods=['POST'])
def apply_to_venture(venture_id):
    """Apply to join a venture"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['userId', 'role', 'message', 'skills', 'experience']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = venture_service.apply_to_venture(venture_id, data['userId'], data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error applying to venture: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/applications', methods=['GET'])
def get_venture_applications(venture_id):
    """Get applications for a venture"""
    try:
        # TODO: Implement get applications logic
        return jsonify({
            "success": True,
            "applications": [],
            "total": 0
        }), 200
            
    except Exception as e:
        logger.error(f"Error getting applications: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/applications/<application_id>/status', methods=['PUT'])
def update_application_status(venture_id, application_id):
    """Update application status (accept/reject)"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['accepted', 'rejected']:
            return jsonify({
                "success": False,
                "error": "Invalid status. Must be 'accepted' or 'rejected'"
            }), 400
        
        # TODO: Implement application status update logic
        return jsonify({
            "success": True,
            "message": f"Application {status} successfully",
            "applicationId": application_id
        }), 200
            
    except Exception as e:
        logger.error(f"Error updating application status: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# FILE UPLOAD ENDPOINTS
# ==============================================

@enhanced_venture_bp.route('/<venture_id>/files/upload', methods=['POST'])
def upload_venture_file(venture_id):
    """Upload file to venture"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "error": "No file provided"
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        # Get file data
        file_content = file.read()
        file_data = {
            'name': file.filename,
            'type': file.content_type,
            'content': file_content,
            'userId': request.form.get('userId')
        }
        
        result = venture_service.upload_file(venture_id, file_data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/files', methods=['GET'])
def get_venture_files(venture_id):
    """Get files for a venture"""
    try:
        # TODO: Implement get files logic
        return jsonify({
            "success": True,
            "files": []
        }), 200
            
    except Exception as e:
        logger.error(f"Error getting files: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/files/<file_id>/delete', methods=['DELETE'])
def delete_venture_file(venture_id, file_id):
    """Delete file from venture"""
    try:
        # TODO: Implement file deletion logic
        return jsonify({
            "success": True,
            "message": "File deleted successfully",
            "fileId": file_id
        }), 200
            
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# BUZ TOKEN ENDPOINTS
# ==============================================

@enhanced_venture_bp.route('/<venture_id>/buz/balance', methods=['GET'])
def get_venture_buz_balance(venture_id):
    """Get BUZ token balance for venture operations"""
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Missing userId parameter"
            }), 400
        
        # TODO: Implement get BUZ balance logic
        return jsonify({
            "success": True,
            "balance": 1000,
            "userId": user_id
        }), 200
            
    except Exception as e:
        logger.error(f"Error getting BUZ balance: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/buz/costs', methods=['GET'])
def get_venture_buz_costs(venture_id):
    """Get BUZ token costs for venture operations"""
    try:
        # TODO: Implement get BUZ costs logic
        return jsonify({
            "success": True,
            "costs": {
                "base": 100,
                "files": 0,
                "team": 50,
                "total": 150
            }
        }), 200
            
    except Exception as e:
        logger.error(f"Error getting BUZ costs: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# ANALYTICS ENDPOINTS
# ==============================================

@enhanced_venture_bp.route('/<venture_id>/analytics', methods=['GET'])
def get_venture_analytics(venture_id):
    """Get venture analytics and metrics"""
    try:
        # TODO: Implement analytics logic
        return jsonify({
            "success": True,
            "analytics": {
                "views": 1247,
                "applications": 23,
                "likes": 89,
                "teamGrowth": 15,
                "milestoneProgress": 65
            }
        }), 200
            
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@enhanced_venture_bp.route('/<venture_id>/like', methods=['POST'])
def like_venture(venture_id):
    """Like/unlike a venture"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        action = data.get('action', 'like')  # 'like' or 'unlike'
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Missing userId"
            }), 400
        
        # TODO: Implement like/unlike logic
        return jsonify({
            "success": True,
            "action": action,
            "likes": 90 if action == 'like' else 89
        }), 200
            
    except Exception as e:
        logger.error(f"Error liking venture: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# HEALTH CHECK
# ==============================================

@enhanced_venture_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "success": True,
        "service": "Enhanced Venture API",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }), 200
