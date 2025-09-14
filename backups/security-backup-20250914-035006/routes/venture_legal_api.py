"""
SmartStart Venture Legal API Routes
Comprehensive API endpoints for venture legal documentation, team management,
30-day plans, RACI matrix, SMART goals, and digital signatures
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
import sys
import os

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.venture_legal_service import VentureLegalService
from services.nodejs_connector import NodeJSConnector

logger = logging.getLogger(__name__)

# Create Blueprint
venture_legal_bp = Blueprint('venture_legal', __name__, url_prefix='/api/venture-legal')

# Initialize services
connector = NodeJSConnector()
legal_service = VentureLegalService(connector)

# ==============================================
# PROJECT CHARTER ENDPOINTS
# ==============================================

@venture_legal_bp.route('/charters', methods=['POST'])
def create_project_charter():
    """Create a project charter for a team member"""
    try:
        data = request.get_json()
        
        required_fields = ['project_id', 'user_id', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = legal_service.create_project_charter(
            project_id=data['project_id'],
            user_id=data['user_id'],
            role=data['role'],
            template_id=data.get('template_id'),
            custom_content=data.get('custom_content')
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating project charter: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/charters/<charter_id>/sign', methods=['POST'])
def sign_project_charter(charter_id):
    """Sign a project charter with digital signature"""
    try:
        data = request.get_json()
        
        if 'user_id' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: user_id"
            }), 400
        
        # Add request metadata to signature data
        signature_data = {
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent'),
            'timestamp': datetime.now().isoformat(),
            **data.get('signature_data', {})
        }
        
        result = legal_service.sign_project_charter(
            charter_id=charter_id,
            user_id=data['user_id'],
            signature_data=signature_data
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error signing project charter: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/charters/project/<project_id>', methods=['GET'])
def get_project_charters(project_id):
    """Get all charters for a project"""
    try:
        query = """
        SELECT 
            pc.*,
            u.name as user_name,
            u.email as user_email,
            trd.display_name as role_name
        FROM "ProjectCharter" pc
        JOIN "User" u ON pc.user_id = u.id
        LEFT JOIN "TeamRoleDefinition" trd ON pc.role = trd.name
        WHERE pc.project_id = %s
        ORDER BY pc.created_at DESC
        """
        
        charters = connector.query(query, [project_id])
        
        return jsonify({
            "success": True,
            "data": {
                "charters": charters,
                "total_charters": len(charters)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting project charters: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# 30-DAY PROJECT PLAN ENDPOINTS
# ==============================================

@venture_legal_bp.route('/plans', methods=['POST'])
def create_30_day_plan():
    """Create a 30-day project plan"""
    try:
        data = request.get_json()
        
        required_fields = ['project_id', 'user_id', 'title']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = legal_service.create_30_day_plan(
            project_id=data['project_id'],
            user_id=data['user_id'],
            plan_data=data
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating 30-day plan: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/plans/project/<project_id>', methods=['GET'])
def get_project_plan(project_id):
    """Get the current project plan"""
    try:
        result = legal_service.get_project_plan(project_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting project plan: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/plans/<plan_id>/phases', methods=['PUT'])
def update_phase_status(plan_id):
    """Update phase status"""
    try:
        data = request.get_json()
        
        if 'phase_id' not in data or 'status' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required fields: phase_id, status"
            }), 400
        
        query = """
        UPDATE "ProjectPlanPhase"
        SET status = %s, updated_at = %s
        WHERE id = %s AND plan_id = %s
        """
        
        connector.query(query, [data['status'], datetime.now(), data['phase_id'], plan_id])
        
        return jsonify({
            "success": True,
            "message": "Phase status updated successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating phase status: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# RACI MATRIX ENDPOINTS
# ==============================================

@venture_legal_bp.route('/raci-matrix', methods=['POST'])
def create_raci_matrix():
    """Create RACI matrix for project activities"""
    try:
        data = request.get_json()
        
        required_fields = ['project_id', 'user_id', 'activities']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = legal_service.create_raci_matrix(
            project_id=data['project_id'],
            user_id=data['user_id'],
            raci_data=data['activities']
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating RACI matrix: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/raci-matrix/project/<project_id>', methods=['GET'])
def get_project_raci_matrix(project_id):
    """Get RACI matrix for project"""
    try:
        result = legal_service.get_project_raci_matrix(project_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting RACI matrix: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/raci-matrix/<raci_id>/status', methods=['PUT'])
def update_raci_status(raci_id):
    """Update RACI activity status"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: status"
            }), 400
        
        query = """
        UPDATE "ProjectRACIMatrix"
        SET status = %s, updated_at = %s
        WHERE id = %s
        """
        
        connector.query(query, [data['status'], datetime.now(), raci_id])
        
        return jsonify({
            "success": True,
            "message": "RACI activity status updated successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating RACI status: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# SMART GOALS ENDPOINTS
# ==============================================

@venture_legal_bp.route('/smart-goals', methods=['POST'])
def create_smart_goal():
    """Create SMART goal for project"""
    try:
        data = request.get_json()
        
        required_fields = ['project_id', 'user_id', 'title', 'specific', 
                          'measurable', 'achievable', 'relevant', 'time_bound']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = legal_service.create_smart_goal(
            project_id=data['project_id'],
            user_id=data['user_id'],
            goal_data=data
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating SMART goal: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/smart-goals/project/<project_id>', methods=['GET'])
def get_project_smart_goals(project_id):
    """Get SMART goals for project"""
    try:
        query = """
        SELECT 
            psg.*,
            u.name as user_name
        FROM "ProjectSMARTGoal" psg
        JOIN "User" u ON psg.user_id = u.id
        WHERE psg.project_id = %s
        ORDER BY psg.priority DESC, psg.created_at DESC
        """
        
        goals = connector.query(query, [project_id])
        
        return jsonify({
            "success": True,
            "data": {
                "goals": goals,
                "total_goals": len(goals),
                "completed_goals": len([g for g in goals if g['status'] == 'COMPLETED'])
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting SMART goals: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/smart-goals/<goal_id>/progress', methods=['PUT'])
def update_smart_goal_progress(goal_id):
    """Update SMART goal progress"""
    try:
        data = request.get_json()
        
        if 'user_id' not in data or 'current_value' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, current_value"
            }), 400
        
        result = legal_service.update_smart_goal_progress(
            goal_id=goal_id,
            user_id=data['user_id'],
            current_value=data['current_value'],
            notes=data.get('notes')
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error updating SMART goal progress: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# LIABILITY MANAGEMENT ENDPOINTS
# ==============================================

@venture_legal_bp.route('/liabilities', methods=['POST'])
def create_liability_assessment():
    """Create liability assessment for project"""
    try:
        data = request.get_json()
        
        required_fields = ['project_id', 'user_id', 'liability_type', 'description',
                          'potential_impact', 'probability']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = legal_service.create_liability_assessment(
            project_id=data['project_id'],
            user_id=data['user_id'],
            liability_data=data
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error creating liability assessment: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/liabilities/project/<project_id>', methods=['GET'])
def get_project_liabilities(project_id):
    """Get all liabilities for project"""
    try:
        result = legal_service.get_project_liabilities(project_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting project liabilities: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# TEAM ROLE MANAGEMENT ENDPOINTS
# ==============================================

@venture_legal_bp.route('/team-roles', methods=['GET'])
def get_team_role_definitions():
    """Get all team role definitions"""
    try:
        query = """
        SELECT * FROM "TeamRoleDefinition"
        WHERE is_active = true
        ORDER BY rbac_level, display_name
        """
        
        roles = connector.query(query)
        
        return jsonify({
            "success": True,
            "data": {
                "roles": roles,
                "total_roles": len(roles)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting team role definitions: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/team-roles/assign', methods=['POST'])
def assign_team_role():
    """Assign team role to user for project"""
    try:
        data = request.get_json()
        
        required_fields = ['project_id', 'user_id', 'role_id', 'equity_percentage']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        result = legal_service.assign_team_role(
            project_id=data['project_id'],
            user_id=data['user_id'],
            role_id=data['role_id'],
            equity_percentage=data['equity_percentage'],
            vesting_schedule=data.get('vesting_schedule', {})
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Error assigning team role: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/team/project/<project_id>', methods=['GET'])
def get_project_team(project_id):
    """Get project team members with roles"""
    try:
        result = legal_service.get_project_team(project_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting project team: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# LEGAL COMPLIANCE ENDPOINTS
# ==============================================

@venture_legal_bp.route('/compliance/project/<project_id>', methods=['GET'])
def get_project_legal_status(project_id):
    """Get comprehensive legal status for project"""
    try:
        result = legal_service.get_project_legal_status(project_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error getting project legal status: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/compliance/audit/project/<project_id>', methods=['GET'])
def get_project_legal_audit(project_id):
    """Get legal audit trail for project"""
    try:
        query = """
        SELECT 
            pla.*,
            u.name as user_name
        FROM "ProjectLegalAudit" pla
        JOIN "User" u ON pla.user_id = u.id
        WHERE pla.project_id = %s
        ORDER BY pla.created_at DESC
        LIMIT 100
        """
        
        audit_logs = connector.query(query, [project_id])
        
        return jsonify({
            "success": True,
            "data": {
                "audit_logs": audit_logs,
                "total_logs": len(audit_logs)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting project legal audit: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# DIGITAL SIGNATURE ENDPOINTS
# ==============================================

@venture_legal_bp.route('/signatures/verify/<signature_id>', methods=['GET'])
def verify_digital_signature(signature_id):
    """Verify digital signature"""
    try:
        query = """
        SELECT 
            ds.*,
            u.name as signer_name,
            pc.title as document_title
        FROM "DigitalSignature" ds
        JOIN "User" u ON ds.signer_id = u.id
        LEFT JOIN "ProjectCharter" pc ON ds.document_id = pc.id
        WHERE ds.id = %s
        """
        
        signature = connector.query(query, [signature_id])
        
        if signature:
            return jsonify({
                "success": True,
                "data": signature[0]
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Signature not found"
            }), 404
            
    except Exception as e:
        logger.error(f"Error verifying digital signature: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@venture_legal_bp.route('/signatures/user/<user_id>', methods=['GET'])
def get_user_signatures(user_id):
    """Get all signatures by user"""
    try:
        query = """
        SELECT 
            ds.*,
            pc.title as document_title,
            pc.role as document_role
        FROM "DigitalSignature" ds
        LEFT JOIN "ProjectCharter" pc ON ds.document_id = pc.id
        WHERE ds.signer_id = %s
        ORDER BY ds.signed_at DESC
        """
        
        signatures = connector.query(query, [user_id])
        
        return jsonify({
            "success": True,
            "data": {
                "signatures": signatures,
                "total_signatures": len(signatures)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user signatures: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==============================================
# HEALTH CHECK ENDPOINT
# ==============================================

@venture_legal_bp.route('/health', methods=['GET'])
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
                "service": "venture-legal-api"
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
