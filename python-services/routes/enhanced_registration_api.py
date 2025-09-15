"""
Enhanced Registration API Routes
Handles user registration, onboarding steps, legal agreements, and subscriptions
"""

import logging
from flask import Blueprint, request, jsonify
from datetime import datetime
from typing import Dict, Any

from ..services.enhanced_registration_service import (
    EnhancedRegistrationService, 
    RegistrationStep, 
    StepStatus
)

logger = logging.getLogger(__name__)

# Create blueprint
enhanced_registration_bp = Blueprint('enhanced_registration', __name__)

# Initialize service
registration_service = EnhancedRegistrationService()

@enhanced_registration_bp.route('/api/enhanced-registration/create-state', methods=['POST'])
def create_registration_state():
    """Create initial registration state for a new user"""
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'email' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, email"
            }), 400
        
        user_id = data['user_id']
        email = data['email']
        
        # Create registration state
        state = registration_service.create_user_registration_state(user_id, email)
        
        return jsonify({
            "success": True,
            "message": "Registration state created successfully",
            "data": {
                "user_id": state.user_id,
                "email": state.email,
                "current_step": state.current_step.value,
                "is_complete": state.is_complete,
                "created_at": state.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error creating registration state: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to create registration state"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/update-step', methods=['POST'])
def update_step_progress():
    """Update progress for a specific registration step"""
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'step', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        user_id = data['user_id']
        step = RegistrationStep(data['step'])
        status = StepStatus(data['status'])
        step_data = data.get('data')
        error_message = data.get('error_message')
        
        # Update step progress
        result = registration_service.update_step_progress(
            user_id, step, status, step_data, error_message
        )
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": f"Invalid step or status: {str(e)}"
        }), 400
    except Exception as e:
        logger.error(f"❌ Error updating step progress: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to update step progress"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/progress/<user_id>', methods=['GET'])
def get_registration_progress(user_id: str):
    """Get current registration progress for a user"""
    try:
        result = registration_service.get_registration_progress(user_id)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"❌ Error getting registration progress: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to get registration progress"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/legal-agreement', methods=['POST'])
def sign_legal_agreement():
    """Handle legal agreement signing with digital signature verification"""
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'agreement_type', 'signature_data']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        user_id = data['user_id']
        agreement_type = data['agreement_type']
        signature_data = data['signature_data']
        
        # Add request metadata
        signature_data['ip_address'] = request.remote_addr
        signature_data['user_agent'] = request.headers.get('User-Agent', 'unknown')
        
        # Handle legal agreement signing
        result = registration_service.handle_legal_agreement_signing(
            user_id, agreement_type, signature_data
        )
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error signing legal agreement: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to sign legal agreement"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/subscription', methods=['POST'])
def select_subscription():
    """Handle subscription plan selection and payment processing"""
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'plan_id', 'payment_data']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        user_id = data['user_id']
        plan_id = data['plan_id']
        payment_data = data['payment_data']
        
        # Handle subscription selection
        result = registration_service.handle_subscription_selection(
            user_id, plan_id, payment_data
        )
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error selecting subscription: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to select subscription"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/complete', methods=['POST'])
def complete_onboarding():
    """Complete the onboarding process"""
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: user_id"
            }), 400
        
        user_id = data['user_id']
        
        # Complete onboarding
        result = registration_service.complete_onboarding(user_id)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error completing onboarding: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to complete onboarding"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/health', methods=['GET'])
def health_check():
    """Health check for enhanced registration service"""
    try:
        return jsonify({
            "success": True,
            "service": "enhanced-registration-service",
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }), 200
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return jsonify({
            "success": False,
            "error": "Health check failed"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/steps', methods=['GET'])
def get_available_steps():
    """Get list of available registration steps"""
    try:
        steps = [
            {
                "step": step.value,
                "name": step.name.replace('_', ' ').title(),
                "description": _get_step_description(step)
            }
            for step in RegistrationStep
        ]
        
        return jsonify({
            "success": True,
            "steps": steps
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting available steps: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to get available steps"
        }), 500

def _get_step_description(step: RegistrationStep) -> str:
    """Get human-readable description for a registration step"""
    descriptions = {
        RegistrationStep.ACCOUNT_CREATION: "Create your SmartStart account",
        RegistrationStep.PASSWORD_SETUP: "Set up a secure password",
        RegistrationStep.PROFILE_COMPLETION: "Complete your profile information",
        RegistrationStep.LEGAL_AGREEMENTS: "Review and sign legal agreements",
        RegistrationStep.SUBSCRIPTION_SELECTION: "Choose your subscription plan",
        RegistrationStep.PLATFORM_ORIENTATION: "Learn about platform features",
        RegistrationStep.BUZ_TOKEN_SETUP: "Set up BUZ token wallet",
        RegistrationStep.ONBOARDING_COMPLETE: "Complete onboarding process"
    }
    return descriptions.get(step, "Unknown step")

@enhanced_registration_bp.route('/api/enhanced-registration/retry-step', methods=['POST'])
def retry_failed_step():
    """Retry a failed registration step"""
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'step' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, step"
            }), 400
        
        user_id = data['user_id']
        step = RegistrationStep(data['step'])
        
        # Reset step to in progress
        result = registration_service.update_step_progress(
            user_id, step, StepStatus.IN_PROGRESS
        )
        
        if result["success"]:
            return jsonify({
                "success": True,
                "message": f"Step {step.value} reset for retry",
                "step": step.value,
                "status": "IN_PROGRESS"
            }), 200
        else:
            return jsonify(result), 400
            
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": f"Invalid step: {str(e)}"
        }), 400
    except Exception as e:
        logger.error(f"❌ Error retrying step: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retry step"
        }), 500

@enhanced_registration_bp.route('/api/enhanced-registration/audit-logs/<user_id>', methods=['GET'])
def get_audit_logs(user_id: str):
    """Get audit logs for a user's registration process"""
    try:
        # This would typically query the database for audit logs
        # For now, return a mock response
        return jsonify({
            "success": True,
            "user_id": user_id,
            "audit_logs": [
                {
                    "action": "REGISTRATION_STARTED",
                    "timestamp": datetime.now().isoformat(),
                    "data": {"step": "account_creation"}
                }
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting audit logs: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to get audit logs"
        }), 500
