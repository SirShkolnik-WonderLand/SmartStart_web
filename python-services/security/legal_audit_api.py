"""
Legal Audit API for BUZ Token System
Provides comprehensive legal compliance and audit reporting endpoints
"""

from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
from legal_buz_integration import LegalBUZManager, UserRole, LegalComplianceLevel
from secure_buz_manager import SecureBUZTokenManager

app = Flask(__name__)

# Initialize managers
legal_manager = LegalBUZManager()
buz_manager = SecureBUZTokenManager()

@app.route('/api/v1/legal/audit/trail', methods=['GET'])
def get_legal_audit_trail():
    """Get legal audit trail with filtering"""
    try:
        # Get query parameters
        user_id = request.args.get('user_id')
        jurisdiction = request.args.get('jurisdiction')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        limit = int(request.args.get('limit', 100))
        
        # Parse dates
        start_date = None
        end_date = None
        
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        
        # Get audit trail
        audit_entries = legal_manager.get_legal_audit_trail(
            user_id=user_id,
            jurisdiction=jurisdiction,
            start_date=start_date,
            end_date=end_date
        )
        
        # Limit results
        audit_entries = audit_entries[:limit]
        
        return jsonify({
            'success': True,
            'data': {
                'audit_entries': audit_entries,
                'total_count': len(audit_entries),
                'filters': {
                    'user_id': user_id,
                    'jurisdiction': jurisdiction,
                    'start_date': start_date_str,
                    'end_date': end_date_str
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get audit trail: {str(e)}'
        }), 500

@app.route('/api/v1/legal/compliance/check', methods=['POST'])
def check_legal_compliance():
    """Check legal compliance for a transaction"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'amount', 'operation_type', 'jurisdiction']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check compliance
        is_compliant, issues = legal_manager.validate_legal_compliance(
            data, data['jurisdiction']
        )
        
        return jsonify({
            'success': True,
            'data': {
                'is_compliant': is_compliant,
                'compliance_issues': issues,
                'jurisdiction': data['jurisdiction'],
                'checked_at': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Compliance check failed: {str(e)}'
        }), 500

@app.route('/api/v1/legal/rbac/check', methods=['POST'])
def check_rbac_permission():
    """Check RBAC permission for a user operation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'operation', 'user_role']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check permission
        user_role = UserRole(data['user_role'])
        has_permission, message = legal_manager.check_rbac_permission(
            data['user_id'],
            data['operation'],
            user_role
        )
        
        return jsonify({
            'success': True,
            'data': {
                'has_permission': has_permission,
                'message': message,
                'user_role': user_role.value,
                'operation': data['operation'],
                'checked_at': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'RBAC check failed: {str(e)}'
        }), 500

@app.route('/api/v1/legal/report/generate', methods=['POST'])
def generate_legal_report():
    """Generate comprehensive legal compliance report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['jurisdiction', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Parse dates
        start_date = datetime.fromisoformat(data['start_date'])
        end_date = datetime.fromisoformat(data['end_date'])
        
        # Generate report
        report = legal_manager.generate_legal_report(
            jurisdiction=data['jurisdiction'],
            start_date=start_date,
            end_date=end_date
        )
        
        return jsonify({
            'success': True,
            'data': report
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Report generation failed: {str(e)}'
        }), 500

@app.route('/api/v1/legal/transactions/<transaction_id>', methods=['GET'])
def get_legal_transaction():
    """Get detailed legal transaction record"""
    try:
        transaction_id = request.view_args['transaction_id']
        
        # Get transaction from Redis
        encrypted_data = legal_manager.redis_client.get(f"legal_transaction:{transaction_id}")
        
        if not encrypted_data:
            return jsonify({
                'success': False,
                'error': 'Transaction not found'
            }), 404
        
        # Decrypt data
        decrypted_data = legal_manager.cipher.decrypt(encrypted_data)
        transaction_data = json.loads(decrypted_data.decode())
        
        return jsonify({
            'success': True,
            'data': transaction_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get transaction: {str(e)}'
        }), 500

@app.route('/api/v1/legal/jurisdictions', methods=['GET'])
def get_jurisdictions():
    """Get available jurisdictions and their requirements"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'jurisdictions': legal_manager.jurisdictions,
                'compliance_rules': legal_manager.legal_rules
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get jurisdictions: {str(e)}'
        }), 500

@app.route('/api/v1/legal/rbac/permissions', methods=['GET'])
def get_rbac_permissions():
    """Get RBAC permissions for all roles"""
    try:
        return jsonify({
            'success': True,
            'data': {
                'permissions': {
                    role.value: permissions 
                    for role, permissions in legal_manager.rbac_permissions.items()
                },
                'roles': [role.value for role in UserRole]
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get RBAC permissions: {str(e)}'
        }), 500

@app.route('/api/v1/legal/audit/stats', methods=['GET'])
def get_audit_stats():
    """Get audit statistics"""
    try:
        # Get basic stats
        total_transactions = legal_manager.redis_client.llen('legal_audit_log')
        
        # Get jurisdiction breakdown
        audit_entries = legal_manager.get_legal_audit_trail()
        jurisdiction_stats = {}
        compliance_stats = {}
        
        for entry in audit_entries:
            # Jurisdiction stats
            jurisdiction = entry.get('jurisdiction', 'unknown')
            jurisdiction_stats[jurisdiction] = jurisdiction_stats.get(jurisdiction, 0) + 1
            
            # Compliance stats
            compliance_level = entry.get('compliance_level', 'basic')
            compliance_stats[compliance_level] = compliance_stats.get(compliance_level, 0) + 1
        
        return jsonify({
            'success': True,
            'data': {
                'total_transactions': total_transactions,
                'jurisdiction_breakdown': jurisdiction_stats,
                'compliance_breakdown': compliance_stats,
                'last_updated': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get audit stats: {str(e)}'
        }), 500

@app.route('/api/v1/legal/health', methods=['GET'])
def legal_health_check():
    """Health check for legal system"""
    try:
        # Test Redis connection
        legal_manager.redis_client.ping()
        
        return jsonify({
            'success': True,
            'data': {
                'status': 'healthy',
                'legal_manager': 'operational',
                'redis_connection': 'connected',
                'timestamp': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Legal system unhealthy: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🔒 Starting Legal Audit API Server...")
    print("Legal compliance features enabled:")
    print("  ✅ RBAC Permission System")
    print("  ✅ Legal Compliance Validation")
    print("  ✅ Comprehensive Audit Logging")
    print("  ✅ Jurisdiction-based Rules")
    print("  ✅ Digital Signatures")
    print("  ✅ Data Retention Compliance")
    print("  ✅ Regulatory Reporting")
    
    app.run(host='0.0.0.0', port=5001, debug=False)
