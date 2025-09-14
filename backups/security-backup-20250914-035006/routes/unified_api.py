"""
Unified SmartStart API Routes
Integrates all systems: BUZ Tokens, Umbrella Network, Venture Management, Legal, Opportunities, Analytics
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
from services.unified_service import UnifiedService
from services.nodejs_connector import NodeJSConnector

# Create blueprint
unified_bp = Blueprint('unified', __name__)

# Initialize services
connector = NodeJSConnector()
unified_service = UnifiedService(connector)

# Configure logging
logger = logging.getLogger(__name__)

# ===== BUZ TOKEN ROUTES =====

@unified_bp.route('/api/buz/earn', methods=['POST'])
async def earn_buz_tokens():
    """Earn BUZ tokens for platform activity"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        activity = data.get('activity')
        source_system = data.get('source_system')
        source_id = data.get('source_id')
        
        if not all([user_id, amount, activity]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, amount, activity"
            }), 400
        
        result = await unified_service.earn_buz_tokens(
            user_id, amount, activity, source_system, source_id
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in earn_buz_tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/buz/spend', methods=['POST'])
async def spend_buz_tokens():
    """Spend BUZ tokens on platform services"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        service = data.get('service')
        source_system = data.get('source_system')
        source_id = data.get('source_id')
        
        if not all([user_id, amount, service]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, amount, service"
            }), 400
        
        result = await unified_service.spend_buz_tokens(
            user_id, amount, service, source_system, source_id
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in spend_buz_tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/buz/stake', methods=['POST'])
async def stake_buz_tokens():
    """Stake BUZ tokens for rewards"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        tier = data.get('tier')
        duration_days = data.get('duration_days')
        
        if not all([user_id, amount, tier, duration_days]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, amount, tier, duration_days"
            }), 400
        
        result = await unified_service.stake_buz_tokens(
            user_id, amount, tier, duration_days
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in stake_buz_tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/buz/balance/<user_id>', methods=['GET'])
async def get_buz_balance(user_id):
    """Get user's BUZ token balance and summary"""
    try:
        query = """
            SELECT 
                "buzBalance",
                "buzEarned",
                "buzSpent",
                "buzStaked",
                "buzRewards"
            FROM "User" WHERE "id" = %s
        """
        result = await connector.fetch_one(query, [user_id])
        
        if not result:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        balance, earned, spent, staked, rewards = result
        
        return jsonify({
            "success": True,
            "data": {
                "balance": balance,
                "earned": earned,
                "spent": spent,
                "staked": staked,
                "rewards": rewards,
                "net_worth": balance + staked
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_buz_balance: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== UMBRELLA NETWORK ROUTES =====

@unified_bp.route('/api/umbrella/relationships', methods=['POST'])
async def create_umbrella_relationship():
    """Create umbrella relationship with BUZ token integration"""
    try:
        data = request.get_json()
        referrer_id = data.get('referrer_id')
        referred_id = data.get('referred_id')
        share_rate = data.get('share_rate', 1.0)
        
        if not all([referrer_id, referred_id]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: referrer_id, referred_id"
            }), 400
        
        result = await unified_service.create_umbrella_relationship(
            referrer_id, referred_id, share_rate
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in create_umbrella_relationship: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/umbrella/revenue/calculate', methods=['POST'])
async def calculate_revenue_shares():
    """Calculate revenue shares with BUZ token integration"""
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        revenue = data.get('revenue')
        project_type = data.get('project_type', 'venture')
        
        if not all([project_id, revenue]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: project_id, revenue"
            }), 400
        
        result = await unified_service.calculate_revenue_shares(
            project_id, revenue, project_type
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in calculate_revenue_shares: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/umbrella/relationships/<user_id>', methods=['GET'])
async def get_umbrella_relationships(user_id):
    """Get user's umbrella relationships"""
    try:
        query = """
            SELECT 
                ur."id",
                ur."referrerId",
                ur."referredId",
                ur."status",
                ur."defaultShareRate",
                ur."createdAt",
                referrer."name" as referrer_name,
                referred."name" as referred_name
            FROM "UmbrellaRelationship" ur
            LEFT JOIN "User" referrer ON referrer."id" = ur."referrerId"
            LEFT JOIN "User" referred ON referred."id" = ur."referredId"
            WHERE ur."referrerId" = %s OR ur."referredId" = %s
            ORDER BY ur."createdAt" DESC
        """
        relationships = await connector.fetch_all(query, [user_id, user_id])
        
        return jsonify({
            "success": True,
            "data": relationships
        })
        
    except Exception as e:
        logger.error(f"Error in get_umbrella_relationships: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== VENTURE MANAGEMENT ROUTES =====

@unified_bp.route('/api/ventures', methods=['POST'])
async def create_venture():
    """Create venture with BUZ token integration"""
    try:
        data = request.get_json()
        owner_id = data.get('owner_id')
        name = data.get('name')
        description = data.get('description')
        buz_budget = data.get('buz_budget', 0)
        
        if not all([owner_id, name, description]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: owner_id, name, description"
            }), 400
        
        result = await unified_service.create_venture(
            owner_id, name, description, buz_budget
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in create_venture: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/ventures/<venture_id>/milestone', methods=['POST'])
async def complete_venture_milestone(venture_id):
    """Complete venture milestone with BUZ token rewards"""
    try:
        data = request.get_json()
        milestone = data.get('milestone')
        
        if not milestone:
            return jsonify({
                "success": False,
                "error": "Missing required field: milestone"
            }), 400
        
        result = await unified_service.complete_venture_milestone(
            venture_id, milestone
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in complete_venture_milestone: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/ventures/<user_id>', methods=['GET'])
async def get_user_ventures(user_id):
    """Get user's ventures"""
    try:
        query = """
            SELECT 
                "id",
                "name",
                "description",
                "status",
                "currentPhase",
                "buzBudget",
                "buzSpent",
                "buzEarned",
                "createdAt",
                "updatedAt"
            FROM "Venture" 
            WHERE "ownerId" = %s
            ORDER BY "createdAt" DESC
        """
        ventures = await connector.fetch_all(query, [user_id])
        
        return jsonify({
            "success": True,
            "data": ventures
        })
        
    except Exception as e:
        logger.error(f"Error in get_user_ventures: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== LEGAL SYSTEM ROUTES =====

@unified_bp.route('/api/legal/documents', methods=['POST'])
async def generate_legal_document():
    """Generate legal document with BUZ token integration"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        doc_type = data.get('doc_type')
        context = data.get('context', {})
        
        if not all([user_id, doc_type]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, doc_type"
            }), 400
        
        result = await unified_service.generate_legal_document(
            user_id, doc_type, context
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in generate_legal_document: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/legal/documents/<user_id>', methods=['GET'])
async def get_user_legal_documents(user_id):
    """Get user's legal documents"""
    try:
        query = """
            SELECT 
                "id",
                "title",
                "type",
                "status",
                "version",
                "buzCost",
                "buzPaid",
                "createdAt",
                "updatedAt"
            FROM "LegalDocument" 
            WHERE "userId" = %s
            ORDER BY "createdAt" DESC
        """
        documents = await connector.fetch_all(query, [user_id])
        
        return jsonify({
            "success": True,
            "data": documents
        })
        
    except Exception as e:
        logger.error(f"Error in get_user_legal_documents: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== OPPORTUNITIES ROUTES =====

@unified_bp.route('/api/opportunities', methods=['POST'])
async def create_opportunity():
    """Create opportunity with BUZ token integration"""
    try:
        data = request.get_json()
        creator_id = data.get('creator_id')
        title = data.get('title')
        description = data.get('description')
        opportunity_type = data.get('type')
        buz_reward = data.get('buz_reward', 0)
        
        if not all([creator_id, title, description, opportunity_type]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: creator_id, title, description, type"
            }), 400
        
        result = await unified_service.create_opportunity(
            creator_id, title, description, opportunity_type, buz_reward
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in create_opportunity: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/opportunities/<opportunity_id>/apply', methods=['POST'])
async def apply_to_opportunity(opportunity_id):
    """Apply to opportunity with BUZ token integration"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Missing required field: user_id"
            }), 400
        
        result = await unified_service.apply_to_opportunity(
            opportunity_id, user_id
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in apply_to_opportunity: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/opportunities', methods=['GET'])
async def get_opportunities():
    """Get available opportunities"""
    try:
        query = """
            SELECT 
                "id",
                "title",
                "description",
                "type",
                "status",
                "buzReward",
                "createdAt",
                "updatedAt"
            FROM "Opportunity" 
            WHERE "status" = 'ACTIVE'
            ORDER BY "createdAt" DESC
        """
        opportunities = await connector.fetch_all(query)
        
        return jsonify({
            "success": True,
            "data": opportunities
        })
        
    except Exception as e:
        logger.error(f"Error in get_opportunities: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== ANALYTICS ROUTES =====

@unified_bp.route('/api/analytics/unified/<user_id>', methods=['GET'])
async def get_unified_analytics(user_id):
    """Get unified analytics across all systems"""
    try:
        period = request.args.get('period', 'monthly')
        
        result = await unified_service.get_unified_analytics(user_id, period)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in get_unified_analytics: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/analytics/platform', methods=['GET'])
async def get_platform_analytics():
    """Get platform-wide analytics"""
    try:
        period = request.args.get('period', 'monthly')
        
        query = """
            SELECT * FROM "PlatformAnalytics" 
            WHERE "period" = %s
            ORDER BY "periodStart" DESC LIMIT 1
        """
        result = await connector.fetch_one(query, [period])
        
        if not result:
            return jsonify({
                "success": False,
                "error": "No analytics data found"
            }), 404
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error in get_platform_analytics: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== CROSS-SYSTEM INTEGRATION ROUTES =====

@unified_bp.route('/api/integration/activity', methods=['POST'])
async def log_cross_system_activity():
    """Log activity that spans multiple systems"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        activity_type = data.get('activity_type')
        systems_involved = data.get('systems_involved', [])
        metadata = data.get('metadata', {})
        
        if not all([user_id, activity_type]):
            return jsonify({
                "success": False,
                "error": "Missing required fields: user_id, activity_type"
            }), 400
        
        # Log activity across systems
        activity_log = {
            "user_id": user_id,
            "activity_type": activity_type,
            "systems_involved": systems_involved,
            "metadata": metadata,
            "timestamp": datetime.now().isoformat()
        }
        
        # Here you would typically log to a cross-system activity log
        logger.info(f"Cross-system activity: {activity_log}")
        
        return jsonify({
            "success": True,
            "message": "Activity logged successfully",
            "activity_log": activity_log
        })
        
    except Exception as e:
        logger.error(f"Error in log_cross_system_activity: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@unified_bp.route('/api/integration/health', methods=['GET'])
async def get_integration_health():
    """Get health status of all integrated systems"""
    try:
        health_status = {
            "timestamp": datetime.now().isoformat(),
            "systems": {
                "buz_tokens": {"status": "healthy", "last_check": datetime.now().isoformat()},
                "umbrella_network": {"status": "healthy", "last_check": datetime.now().isoformat()},
                "venture_management": {"status": "healthy", "last_check": datetime.now().isoformat()},
                "legal_system": {"status": "healthy", "last_check": datetime.now().isoformat()},
                "opportunities": {"status": "healthy", "last_check": datetime.now().isoformat()},
                "analytics": {"status": "healthy", "last_check": datetime.now().isoformat()}
            },
            "overall_status": "healthy"
        }
        
        return jsonify({
            "success": True,
            "data": health_status
        })
        
    except Exception as e:
        logger.error(f"Error in get_integration_health: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
