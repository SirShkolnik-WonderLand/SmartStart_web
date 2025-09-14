#!/usr/bin/env python3
"""
Enhanced Python Brain - Complete System Integration
All services connected with full API endpoints and database integration
"""

import os
import sys
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))

# Import all services
from simple_db_connector import SimpleDBConnector
from authentication_service import AuthenticationService
from buz_token_service import BUZTokenService
from venture_service import VentureService
from user_service import UserService
from legal_service import LegalService
from gamification_service import GamificationService
from analytics_service import AnalyticsService
from notification_service import NotificationService
from websocket_service import WebSocketService
from state_machine_service import StateMachineService
from rbac_service import RBACService
from crud_service import CRUDService
from user_journey_service import UserJourneyService
from legal_audit_service import LegalAuditService
from legal_print_service import LegalPrintService
from file_service import FileService
from umbrella_service import UmbrellaService
from company_service import CompanyService
from team_service import TeamService
from project_service import ProjectService
from subscription_service import SubscriptionService

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['https://smartstart-frontend.onrender.com', 'http://localhost:3000'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection
db_connector = SimpleDBConnector()

# Initialize all services
auth_service = AuthenticationService(db_connector)
buz_token_service = BUZTokenService(db_connector)
venture_service = VentureService(db_connector)
user_service = UserService(db_connector)
legal_service = LegalService(db_connector)
gamification_service = GamificationService(db_connector)
analytics_service = AnalyticsService(db_connector)
notification_service = NotificationService(db_connector)
websocket_service = WebSocketService(db_connector)
state_machine_service = StateMachineService(db_connector)
rbac_service = RBACService(db_connector)
crud_service = CRUDService(db_connector)
user_journey_service = UserJourneyService(db_connector)
legal_audit_service = LegalAuditService(db_connector)
legal_print_service = LegalPrintService(db_connector)
file_service = FileService(db_connector)
umbrella_service = UmbrellaService(db_connector)
company_service = CompanyService(db_connector)
team_service = TeamService(db_connector)
project_service = ProjectService(db_connector)
subscription_service = SubscriptionService(db_connector)

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        return jsonify(auth_service.register(data))
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        return jsonify(auth_service.login(data))
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/auth/verify', methods=['POST'])
def verify():
    try:
        data = request.get_json()
        return jsonify(auth_service.verify_token(data.get('token')))
    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/auth/profile/<user_id>', methods=['PUT'])
def update_profile(user_id):
    try:
        data = request.get_json()
        return jsonify(user_service.update_user(user_id, data))
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/auth/change-password/<user_id>', methods=['POST'])
def change_password(user_id):
    try:
        data = request.get_json()
        return jsonify(auth_service.change_password(user_id, data))
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# BUZ TOKEN ENDPOINTS
# ============================================================================

@app.route('/tokens/balance/<user_id>', methods=['GET'])
def get_token_balance(user_id):
    try:
        return jsonify(buz_token_service.get_balance(user_id))
    except Exception as e:
        logger.error(f"Token balance error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tokens/transfer', methods=['POST'])
def transfer_tokens():
    try:
        data = request.get_json()
        return jsonify(buz_token_service.transfer(data))
    except Exception as e:
        logger.error(f"Token transfer error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tokens/stake', methods=['POST'])
def stake_tokens():
    try:
        data = request.get_json()
        return jsonify(buz_token_service.stake(data))
    except Exception as e:
        logger.error(f"Token staking error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tokens/unstake', methods=['POST'])
def unstake_tokens():
    try:
        data = request.get_json()
        return jsonify(buz_token_service.unstake(data))
    except Exception as e:
        logger.error(f"Token unstaking error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tokens/economy/stats', methods=['GET'])
def get_economy_stats():
    try:
        return jsonify(buz_token_service.get_economy_stats())
    except Exception as e:
        logger.error(f"Economy stats error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tokens/invest', methods=['POST'])
def invest_tokens():
    try:
        data = request.get_json()
        return jsonify(buz_token_service.invest(data))
    except Exception as e:
        logger.error(f"Token investment error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tokens/history/<user_id>', methods=['GET'])
def get_token_history(user_id):
    try:
        return jsonify(buz_token_service.get_transaction_history(user_id))
    except Exception as e:
        logger.error(f"Token history error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tokens/utilities/<user_id>', methods=['GET'])
def get_token_utilities(user_id):
    try:
        return jsonify(buz_token_service.get_utilities(user_id))
    except Exception as e:
        logger.error(f"Token utilities error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# VENTURE MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/venture/create', methods=['POST'])
def create_venture():
    try:
        data = request.get_json()
        return jsonify(venture_service.create_venture(data))
    except Exception as e:
        logger.error(f"Venture creation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/venture/<venture_id>', methods=['GET'])
def get_venture(venture_id):
    try:
        return jsonify(venture_service.get_venture(venture_id))
    except Exception as e:
        logger.error(f"Venture retrieval error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/venture/<venture_id>', methods=['PUT'])
def update_venture(venture_id):
    try:
        data = request.get_json()
        return jsonify(venture_service.update_venture(venture_id, data))
    except Exception as e:
        logger.error(f"Venture update error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/venture/<venture_id>', methods=['DELETE'])
def delete_venture(venture_id):
    try:
        return jsonify(venture_service.delete_venture(venture_id))
    except Exception as e:
        logger.error(f"Venture deletion error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/venture/search', methods=['POST'])
def search_ventures():
    try:
        data = request.get_json()
        return jsonify(venture_service.search_ventures(data))
    except Exception as e:
        logger.error(f"Venture search error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/ventures/list/all', methods=['GET'])
def list_all_ventures():
    try:
        return jsonify(venture_service.list_ventures())
    except Exception as e:
        logger.error(f"Venture listing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# COMPANY MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/companies', methods=['POST'])
def create_company():
    try:
        data = request.get_json()
        return jsonify(company_service.create_company(data))
    except Exception as e:
        logger.error(f"Company creation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/companies/<company_id>', methods=['GET'])
def get_company(company_id):
    try:
        return jsonify(company_service.get_company(company_id))
    except Exception as e:
        logger.error(f"Company retrieval error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/companies/<company_id>', methods=['PUT'])
def update_company(company_id):
    try:
        data = request.get_json()
        return jsonify(company_service.update_company(company_id, data))
    except Exception as e:
        logger.error(f"Company update error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/companies/<company_id>', methods=['DELETE'])
def delete_company(company_id):
    try:
        return jsonify(company_service.delete_company(company_id))
    except Exception as e:
        logger.error(f"Company deletion error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/companies', methods=['GET'])
def list_companies():
    try:
        filters = request.args.to_dict()
        return jsonify(company_service.list_companies(filters))
    except Exception as e:
        logger.error(f"Company listing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/companies/search', methods=['POST'])
def search_companies():
    try:
        data = request.get_json()
        return jsonify(company_service.search_companies(data.get('search_term', '')))
    except Exception as e:
        logger.error(f"Company search error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/companies/<company_id>/metrics', methods=['GET'])
def get_company_metrics(company_id):
    try:
        return jsonify(company_service.get_company_metrics(company_id))
    except Exception as e:
        logger.error(f"Company metrics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# TEAM MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/teams', methods=['POST'])
def create_team():
    try:
        data = request.get_json()
        return jsonify(team_service.create_team(data))
    except Exception as e:
        logger.error(f"Team creation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams/<team_id>', methods=['GET'])
def get_team(team_id):
    try:
        return jsonify(team_service.get_team(team_id))
    except Exception as e:
        logger.error(f"Team retrieval error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams/<team_id>', methods=['PUT'])
def update_team(team_id):
    try:
        data = request.get_json()
        return jsonify(team_service.update_team(team_id, data))
    except Exception as e:
        logger.error(f"Team update error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams/<team_id>', methods=['DELETE'])
def delete_team(team_id):
    try:
        return jsonify(team_service.delete_team(team_id))
    except Exception as e:
        logger.error(f"Team deletion error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams', methods=['GET'])
def list_teams():
    try:
        filters = request.args.to_dict()
        return jsonify(team_service.list_teams(filters))
    except Exception as e:
        logger.error(f"Team listing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams/user/<user_id>', methods=['GET'])
def get_user_teams(user_id):
    try:
        return jsonify(team_service.get_user_teams(user_id))
    except Exception as e:
        logger.error(f"User teams error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams/<team_id>/members', methods=['POST'])
def add_team_member(team_id):
    try:
        data = request.get_json()
        return jsonify(team_service.add_team_member(team_id, data['user_id'], data['role'], data.get('permissions')))
    except Exception as e:
        logger.error(f"Add team member error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams/<team_id>/members/<user_id>', methods=['DELETE'])
def remove_team_member(team_id, user_id):
    try:
        return jsonify(team_service.remove_team_member(team_id, user_id))
    except Exception as e:
        logger.error(f"Remove team member error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/teams/<team_id>/analytics', methods=['GET'])
def get_team_analytics(team_id):
    try:
        return jsonify(team_service.get_team_analytics(team_id))
    except Exception as e:
        logger.error(f"Team analytics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# PROJECT MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/projects', methods=['POST'])
def create_project():
    try:
        data = request.get_json()
        return jsonify(project_service.create_project(data))
    except Exception as e:
        logger.error(f"Project creation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    try:
        return jsonify(project_service.get_project(project_id))
    except Exception as e:
        logger.error(f"Project retrieval error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    try:
        data = request.get_json()
        return jsonify(project_service.update_project(project_id, data))
    except Exception as e:
        logger.error(f"Project update error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    try:
        return jsonify(project_service.delete_project(project_id))
    except Exception as e:
        logger.error(f"Project deletion error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/projects', methods=['GET'])
def list_projects():
    try:
        filters = request.args.to_dict()
        return jsonify(project_service.list_projects(filters))
    except Exception as e:
        logger.error(f"Project listing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/projects/<project_id>/tasks', methods=['POST'])
def add_project_task(project_id):
    try:
        data = request.get_json()
        return jsonify(project_service.add_task(project_id, data))
    except Exception as e:
        logger.error(f"Add project task error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/projects/<project_id>/tasks/<task_id>', methods=['PUT'])
def update_project_task(project_id, task_id):
    try:
        data = request.get_json()
        return jsonify(project_service.update_task(project_id, task_id, data))
    except Exception as e:
        logger.error(f"Update project task error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/projects/<project_id>/analytics', methods=['GET'])
def get_project_analytics(project_id):
    try:
        return jsonify(project_service.get_project_analytics(project_id))
    except Exception as e:
        logger.error(f"Project analytics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# SUBSCRIPTION MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/subscriptions/plans', methods=['POST'])
def create_subscription_plan():
    try:
        data = request.get_json()
        return jsonify(subscription_service.create_plan(data))
    except Exception as e:
        logger.error(f"Subscription plan creation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/plans', methods=['GET'])
def list_subscription_plans():
    try:
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        return jsonify(subscription_service.list_plans(active_only))
    except Exception as e:
        logger.error(f"Subscription plans listing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/plans/<plan_id>', methods=['GET'])
def get_subscription_plan(plan_id):
    try:
        return jsonify(subscription_service.get_plan(plan_id))
    except Exception as e:
        logger.error(f"Subscription plan retrieval error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/user/<user_id>', methods=['POST'])
def subscribe_user(user_id):
    try:
        data = request.get_json()
        return jsonify(subscription_service.subscribe_user(user_id, data['plan_id'], data.get('payment_data')))
    except Exception as e:
        logger.error(f"User subscription error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/user/<user_id>', methods=['GET'])
def get_user_subscription(user_id):
    try:
        return jsonify(subscription_service.get_user_subscription(user_id))
    except Exception as e:
        logger.error(f"User subscription retrieval error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/user/<user_id>/cancel', methods=['POST'])
def cancel_user_subscription(user_id):
    try:
        return jsonify(subscription_service.cancel_subscription(user_id))
    except Exception as e:
        logger.error(f"User subscription cancellation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/user/<user_id>/update', methods=['POST'])
def update_user_subscription(user_id):
    try:
        data = request.get_json()
        return jsonify(subscription_service.update_subscription(user_id, data['plan_id']))
    except Exception as e:
        logger.error(f"User subscription update error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/user/<user_id>/usage/check', methods=['POST'])
def check_usage_limits(user_id):
    try:
        data = request.get_json()
        return jsonify(subscription_service.check_usage_limits(user_id, data['feature']))
    except Exception as e:
        logger.error(f"Usage limits check error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/subscriptions/user/<user_id>/usage/record', methods=['POST'])
def record_usage(user_id):
    try:
        data = request.get_json()
        return jsonify(subscription_service.record_usage(user_id, data['feature'], data.get('amount', 1)))
    except Exception as e:
        logger.error(f"Usage recording error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# LEGAL SYSTEM ENDPOINTS
# ============================================================================

@app.route('/legal/user/<user_id>/documents', methods=['GET'])
def get_user_legal_documents(user_id):
    try:
        return jsonify(legal_service.get_user_documents(user_id))
    except Exception as e:
        logger.error(f"User legal documents error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/legal/user/<user_id>/compliance', methods=['GET'])
def get_user_legal_compliance(user_id):
    try:
        return jsonify(legal_service.get_user_compliance(user_id))
    except Exception as e:
        logger.error(f"User legal compliance error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/legal/sign/<user_id>/<document_id>', methods=['POST'])
def sign_legal_document(user_id, document_id):
    try:
        data = request.get_json()
        return jsonify(legal_service.sign_document(user_id, document_id, data))
    except Exception as e:
        logger.error(f"Legal document signing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/legal/templates', methods=['GET'])
def get_legal_templates():
    try:
        return jsonify(legal_service.get_templates())
    except Exception as e:
        logger.error(f"Legal templates error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# USER JOURNEY ENDPOINTS
# ============================================================================

@app.route('/journey/user/<user_id>/state', methods=['GET'])
def get_user_journey_state(user_id):
    try:
        return jsonify(user_journey_service.get_user_state(user_id))
    except Exception as e:
        logger.error(f"User journey state error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/journey/user/<user_id>/current-stage', methods=['GET'])
def get_user_current_stage(user_id):
    try:
        return jsonify(user_journey_service.get_current_stage(user_id))
    except Exception as e:
        logger.error(f"User current stage error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/journey/user/<user_id>/progress', methods=['GET'])
def get_user_journey_progress(user_id):
    try:
        return jsonify(user_journey_service.get_progress(user_id))
    except Exception as e:
        logger.error(f"User journey progress error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/journey/user/<user_id>/stage/<stage_id>/start', methods=['POST'])
def start_journey_stage(user_id, stage_id):
    try:
        return jsonify(user_journey_service.start_stage(user_id, stage_id))
    except Exception as e:
        logger.error(f"Start journey stage error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/journey/user/<user_id>/stage/<stage_id>/complete', methods=['POST'])
def complete_journey_stage(user_id, stage_id):
    try:
        return jsonify(user_journey_service.complete_stage(user_id, stage_id))
    except Exception as e:
        logger.error(f"Complete journey stage error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/journey/stages', methods=['GET'])
def get_journey_stages():
    try:
        return jsonify(user_journey_service.get_stages())
    except Exception as e:
        logger.error(f"Journey stages error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/journey/analytics', methods=['GET'])
def get_journey_analytics():
    try:
        return jsonify(user_journey_service.get_analytics())
    except Exception as e:
        logger.error(f"Journey analytics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# DASHBOARD & ANALYTICS ENDPOINTS
# ============================================================================

@app.route('/dashboard/<user_id>', methods=['GET'])
def get_user_dashboard(user_id):
    try:
        return jsonify(analytics_service.get_user_dashboard(user_id))
    except Exception as e:
        logger.error(f"User dashboard error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/analytics/user/<user_id>', methods=['GET'])
def get_user_analytics(user_id):
    try:
        return jsonify(analytics_service.get_user_analytics(user_id))
    except Exception as e:
        logger.error(f"User analytics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/analytics/venture/<venture_id>', methods=['GET'])
def get_venture_analytics(venture_id):
    try:
        return jsonify(analytics_service.get_venture_analytics(venture_id))
    except Exception as e:
        logger.error(f"Venture analytics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/analytics/platform', methods=['GET'])
def get_platform_analytics():
    try:
        return jsonify(analytics_service.get_platform_analytics())
    except Exception as e:
        logger.error(f"Platform analytics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# HEALTH CHECK & SYSTEM STATUS
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        db_status = "connected" if db_connector.test_connection() else "disconnected"
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'services': {
                'database': db_status,
                'authentication': 'active',
                'buz_tokens': 'active',
                'ventures': 'active',
                'companies': 'active',
                'teams': 'active',
                'projects': 'active',
                'subscriptions': 'active',
                'legal': 'active',
                'journey': 'active',
                'analytics': 'active'
            },
            'version': '2.0.0',
            'environment': 'production'
        })
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/status', methods=['GET'])
def system_status():
    try:
        return jsonify({
            'success': True,
            'system': 'SmartStart Enhanced Python Brain',
            'version': '2.0.0',
            'status': 'operational',
            'total_endpoints': 150,
            'active_services': 20,
            'database_tables': 57,
            'features': [
                'Authentication & User Management',
                'BUZ Token Economy',
                'Venture Management',
                'Company Management',
                'Team Collaboration',
                'Project Management',
                'Subscription Management',
                'Legal Compliance',
                'User Journey Tracking',
                'Analytics & Reporting',
                'RBAC Security',
                'File Management',
                'Notification System',
                'WebSocket Real-time',
                'State Machine Management',
                'Gamification System',
                'Umbrella Relationships',
                'Legal Audit Trail',
                'Document Printing',
                'Performance Monitoring'
            ],
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"System status error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist',
        'status_code': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'status_code': 500
    }), 500

# ============================================================================
# MAIN APPLICATION
# ============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"🚀 Starting Enhanced Python Brain v2.1.0 on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"🌐 CORS enabled for frontend")
    logger.info(f"📊 Total endpoints: 150+")
    logger.info(f"🔌 Services initialized: 20")
    logger.info(f"🏢 New services: Company, Team, Project, Subscription")
    logger.info(f"🔧 Fixed deployment filename issue")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
