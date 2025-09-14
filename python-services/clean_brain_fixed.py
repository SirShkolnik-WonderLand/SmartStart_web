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
            "data": {
                "total": 999999999,
                "circulating": 500000000,
                "price_usd": 0.02,
                "currentPrice": 0.02,
                "market_cap": 10000000,
                "currency": "USD"
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

@app.route('/api/legal-documents/status', methods=['GET'])
def get_legal_documents_status():
    """Get legal documents status"""
    try:
        # Mock legal documents status
        status = {
            "signed": 2,
            "total": 5,
            "documents": [
                {"name": "Terms of Service", "signed": True},
                {"name": "Privacy Policy", "signed": True},
                {"name": "NDA Template", "signed": False},
                {"name": "Contract Template", "signed": False},
                {"name": "Data Agreement", "signed": False}
            ]
        }
        
        return jsonify({
            "success": True,
            "data": status
        }), 200
    except Exception as e:
        logger.error(f"Error getting legal documents status: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/gamification/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get gamification leaderboard"""
    try:
        # Mock leaderboard data
        leaderboard = [
            {"name": "Udi Shkolnik", "xp": 2500, "level": "SUPER_ADMIN", "rank": 1},
            {"name": "Alice Johnson", "xp": 1800, "level": "ADMIN", "rank": 2},
            {"name": "Bob Smith", "xp": 1200, "level": "MEMBER", "rank": 3},
            {"name": "Carol Davis", "xp": 900, "level": "MEMBER", "rank": 4},
            {"name": "David Wilson", "xp": 600, "level": "MEMBER", "rank": 5}
        ]
        
        return jsonify({
            "success": True,
            "data": leaderboard
        }), 200
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/contracts', methods=['GET'])
def get_contracts():
    """Get contracts/offers"""
    try:
        # Mock contracts data
        contracts = [
            {
                "id": "contract-001",
                "title": "Frontend Developer",
                "venture": "Tech Startup Alpha",
                "status": "active",
                "value": 5000,
                "currency": "BUZ"
            },
            {
                "id": "contract-002", 
                "title": "Backend Engineer",
                "venture": "Data Solutions Inc",
                "status": "pending",
                "value": 7500,
                "currency": "BUZ"
            }
        ]
        
        return jsonify({
            "success": True,
            "data": contracts
        }), 200
    except Exception as e:
        logger.error(f"Error getting contracts: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/v1/buz/balance/<user_id>', methods=['GET'])
def get_buz_balance(user_id):
    """Get user BUZ balance"""
    try:
        buz_data = db.get_user_buz_tokens(user_id)
        # Extract the actual data from the nested structure
        if buz_data and 'data' in buz_data:
            actual_data = buz_data['data']
        else:
            actual_data = buz_data
            
        return jsonify({
            "success": True,
            "data": actual_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting BUZ balance for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/journey/status/<user_id>', methods=['GET'])
def get_journey_status(user_id):
    """Get user journey status"""
    try:
        # Mock journey status
        journey_data = {
            "current_stage": "VENTURE_CREATION",
            "progress": 75,
            "completed_steps": [
                "Account Setup",
                "Profile Creation",
                "Initial Onboarding"
            ],
            "next_steps": [
                "Create First Venture",
                "Complete Legal Pack",
                "Set Up Subscription"
            ]
        }
        
        return jsonify({
            "success": True,
            "data": journey_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting journey status for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/legal-signing/status/<user_id>', methods=['GET'])
def get_legal_signing_status(user_id):
    """Get legal signing status"""
    try:
        # Mock legal signing status
        legal_data = {
            "signed_documents": 2,
            "total_documents": 5,
            "completion_percentage": 40,
            "documents": [
                {"name": "Terms of Service", "signed": True, "signed_at": "2025-01-01T00:00:00Z"},
                {"name": "Privacy Policy", "signed": True, "signed_at": "2025-01-01T00:00:00Z"},
                {"name": "NDA Template", "signed": False, "signed_at": None},
                {"name": "Contract Template", "signed": False, "signed_at": None},
                {"name": "Data Agreement", "signed": False, "signed_at": None}
            ]
        }
        
        return jsonify({
            "success": True,
            "data": legal_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting legal signing status for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/subscriptions/user/<user_id>', methods=['GET'])
def get_subscription_status(user_id):
    """Get user subscription status"""
    try:
        # Mock subscription status
        subscription_data = {
            "active": False,
            "plan": None,
            "status": "pending",
            "trial_available": True,
            "trial_days_remaining": 30,
            "features": [
                "Basic venture creation",
                "Limited team collaboration",
                "Standard support"
            ]
        }
        
        return jsonify({
            "success": True,
            "data": subscription_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting subscription status for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== UMBRELLA SYSTEM ENDPOINTS =====

@app.route('/api/umbrella/relationships/<user_id>', methods=['GET'])
def get_umbrella_relationships(user_id):
    """Get user's umbrella relationships"""
    try:
        # Get umbrella relationships from database
        relationships = db.get_umbrella_relationships(user_id)
        return jsonify({
            "success": True,
            "data": relationships
        }), 200
    except Exception as e:
        logger.error(f"Error getting umbrella relationships for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/umbrella/revenue-shares/<user_id>', methods=['GET'])
def get_umbrella_revenue_shares(user_id):
    """Get user's umbrella revenue shares"""
    try:
        # Get revenue shares from database
        revenue_shares = db.get_umbrella_revenue_shares(user_id)
        return jsonify({
            "success": True,
            "data": revenue_shares
        }), 200
    except Exception as e:
        logger.error(f"Error getting umbrella revenue shares for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/umbrella/analytics/<user_id>', methods=['GET'])
def get_umbrella_analytics(user_id):
    """Get user's umbrella analytics"""
    try:
        # Get umbrella analytics from database
        analytics = db.get_umbrella_analytics(user_id)
        return jsonify({
            "success": True,
            "data": analytics
        }), 200
    except Exception as e:
        logger.error(f"Error getting umbrella analytics for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/umbrella/create-relationship', methods=['POST'])
def create_umbrella_relationship():
    """Create new umbrella relationship"""
    try:
        data = request.get_json()
        referrer_id = data.get('referrer_id')
        referred_id = data.get('referred_id')
        relationship_type = data.get('relationship_type', 'PRIVATE_UMBRELLA')
        default_share_rate = data.get('default_share_rate', 1.0)
        
        # Create umbrella relationship in database
        relationship = db.create_umbrella_relationship(
            referrer_id, referred_id, relationship_type, default_share_rate
        )
        
        return jsonify({
            "success": True,
            "data": relationship
        }), 201
    except Exception as e:
        logger.error(f"Error creating umbrella relationship: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== ENHANCED WALLET SYSTEM ENDPOINTS =====

@app.route('/api/wallet/balance/<user_id>', methods=['GET'])
def get_wallet_balance(user_id):
    """Get comprehensive wallet balance"""
    try:
        # Get wallet data from database
        wallet_data = db.get_wallet_balance(user_id)
        return jsonify({
            "success": True,
            "data": wallet_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting wallet balance for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/wallet/transactions/<user_id>', methods=['GET'])
def get_wallet_transactions(user_id):
    """Get wallet transaction history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Get transactions from database
        transactions = db.get_wallet_transactions(user_id, limit, offset)
        return jsonify({
            "success": True,
            "data": transactions
        }), 200
    except Exception as e:
        logger.error(f"Error getting wallet transactions for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/wallet/transfer', methods=['POST'])
def transfer_tokens():
    """Transfer tokens between wallets"""
    try:
        data = request.get_json()
        from_user_id = data.get('from_user_id')
        to_user_id = data.get('to_user_id')
        amount = data.get('amount')
        transaction_type = data.get('transaction_type', 'TRANSFER')
        
        # Process transfer in database
        result = db.transfer_tokens(from_user_id, to_user_id, amount, transaction_type)
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        logger.error(f"Error transferring tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== ENHANCED BUZ TOKEN SYSTEM ENDPOINTS =====

@app.route('/api/buz/stake', methods=['POST'])
def stake_buz_tokens():
    """Stake BUZ tokens"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        staking_period = data.get('staking_period', 30)
        staking_type = data.get('staking_type', 'STANDARD')
        
        # Process staking in database
        result = db.stake_buz_tokens(user_id, amount, staking_period, staking_type)
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        logger.error(f"Error staking BUZ tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/buz/unstake', methods=['POST'])
def unstake_buz_tokens():
    """Unstake BUZ tokens"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        staking_id = data.get('staking_id')
        
        # Process unstaking in database
        result = db.unstake_buz_tokens(user_id, staking_id)
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        logger.error(f"Error unstaking BUZ tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/buz/invest', methods=['POST'])
def invest_buz_tokens():
    """Invest BUZ tokens in venture"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        venture_id = data.get('venture_id')
        amount = data.get('amount')
        investment_type = data.get('investment_type', 'EQUITY')
        
        # Process investment in database
        result = db.invest_buz_tokens(user_id, venture_id, amount, investment_type)
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        logger.error(f"Error investing BUZ tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/buz/economy-stats', methods=['GET'])
def get_buz_economy_stats():
    """Get BUZ token economy statistics"""
    try:
        # Get economy stats from database
        stats = db.get_buz_economy_stats()
        return jsonify({
            "success": True,
            "data": stats
        }), 200
    except Exception as e:
        logger.error(f"Error getting BUZ economy stats: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== TEAM MANAGEMENT ENDPOINTS =====

@app.route('/api/teams/<team_id>', methods=['GET'])
def get_team(team_id):
    """Get team details with members"""
    try:
        # Get team data from database
        team_data = db.get_team(team_id)
        return jsonify({
            "success": True,
            "data": team_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting team {team_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/teams/<team_id>/members', methods=['GET'])
def get_team_members(team_id):
    """Get team members"""
    try:
        # Get team members from database
        members = db.get_team_members(team_id)
        return jsonify({
            "success": True,
            "data": members
        }), 200
    except Exception as e:
        logger.error(f"Error getting team members for team {team_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/teams/<team_id>/goals', methods=['GET'])
def get_team_goals(team_id):
    """Get team goals"""
    try:
        # Get team goals from database
        goals = db.get_team_goals(team_id)
        return jsonify({
            "success": True,
            "data": goals
        }), 200
    except Exception as e:
        logger.error(f"Error getting team goals for team {team_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/teams/<team_id>/analytics', methods=['GET'])
def get_team_analytics(team_id):
    """Get team analytics"""
    try:
        # Get team analytics from database
        analytics = db.get_team_analytics(team_id)
        return jsonify({
            "success": True,
            "data": analytics
        }), 200
    except Exception as e:
        logger.error(f"Error getting team analytics for team {team_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===== BUZ STAKING AND WALLET ENDPOINTS =====

@app.route('/api/buz/stake', methods=['POST'])
def stake_buz_tokens():
    """Stake BUZ tokens"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        amount = data.get('amount', 0)
        
        if not user_id or amount <= 0:
            return jsonify({
                "success": False,
                "error": "Invalid user ID or amount"
            }), 400
        
        # Stake tokens via database
        result = db.stake_buz_tokens(user_id, amount)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        logger.error(f"Error staking BUZ tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/buz/unstake', methods=['POST'])
def unstake_buz_tokens():
    """Unstake BUZ tokens"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        amount = data.get('amount', 0)
        
        if not user_id or amount <= 0:
            return jsonify({
                "success": False,
                "error": "Invalid user ID or amount"
            }), 400
        
        # Unstake tokens via database
        result = db.unstake_buz_tokens(user_id, amount)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        logger.error(f"Error unstaking BUZ tokens: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/wallet/balance/<user_id>', methods=['GET'])
def get_wallet_balance(user_id):
    """Get comprehensive wallet balance"""
    try:
        # Get wallet balance from database
        balance = db.get_wallet_balance(user_id)
        return jsonify({
            "success": True,
            "data": balance
        }), 200
    except Exception as e:
        logger.error(f"Error getting wallet balance for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/wallet/transactions/<user_id>', methods=['GET'])
def get_wallet_transactions(user_id):
    """Get wallet transaction history"""
    try:
        # Get wallet transactions from database
        transactions = db.get_wallet_transactions(user_id)
        return jsonify({
            "success": True,
            "data": transactions
        }), 200
    except Exception as e:
        logger.error(f"Error getting wallet transactions for user {user_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
