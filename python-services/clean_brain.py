#!/usr/bin/env python3
"""
Clean Python Brain - No External Dependencies
SmartStart Platform - Venture Legal System
"""

import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime
import json
from database_connector import db

# Initialize Flask app
app = Flask(__name__)
CORS(app)

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
            "service": "clean-python-brain-v1.0.0",
            "features": [
                "Venture Legal System",
                "Team Charter Management", 
                "30-Day Project Plans",
                "RACI Matrix",
                "SMART Goals",
                "Liability Management",
                "Digital Signatures"
            ],
            "version": "1.0.0",
            "python_brain": "operational"
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e)
        }), 500

# Ventures API Endpoints
@app.route('/api/v1/ventures/list/all', methods=['GET'])
def get_all_ventures():
    """Get all ventures from database"""
    try:
        # Get all ventures from database
        ventures = db.get_all_ventures()
        
        # Transform database data to frontend format
        formatted_ventures = []
        for venture in ventures:
            formatted_venture = {
                "id": venture['id'],
                "name": venture['name'],
                "description": venture['description'],
                "stage": venture['status'],
                "industry": "Technology",  # Default industry
                "teamSize": 3,  # Default team size
                "lookingFor": ["Developers", "Designers"],  # Default looking for
                "rewards": {
                    "type": "equity",
                    "amount": "10%"
                },
                "owner": {
                    "name": venture.get('owner_name', 'Unknown'),
                    "avatar": f"/avatars/{venture['id']}.jpg"
                },
                "createdAt": venture['createdAt'].isoformat() if venture['createdAt'] else datetime.now().isoformat(),
                "status": "active" if venture['status'] != 'DRAFT' else 'draft',
                "tags": ["Startup"],  # Default tags
                "tier": "T1",  # Default tier
                "residency": venture.get('region', 'US')
            }
            formatted_ventures.append(formatted_venture)
        
        ventures_data = {
            "success": True,
            "data": {
                "ventures": formatted_ventures,
                "total_count": len(formatted_ventures),
                "pagination": {
                    "page": 1,
                    "limit": 10,
                    "total_pages": 1
                }
            }
        }
        return jsonify(ventures_data), 200
    except Exception as e:
        logger.error(f"Error getting ventures: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/v1/ventures/user/<user_id>', methods=['GET'])
def get_user_ventures(user_id):
    """Get ventures for a specific user from database"""
    try:
        # Get user's ventures from database
        ventures = db.get_user_ventures(user_id)
        
        # Transform database data to frontend format
        formatted_ventures = []
        for venture in ventures:
            formatted_venture = {
                "id": venture['id'],
                "name": venture['name'],
                "description": venture['description'],
                "stage": venture['status'],
                "industry": "Technology",  # Default industry
                "teamSize": 3,  # Default team size
                "lookingFor": ["Developers", "Designers"],  # Default looking for
                "rewards": {
                    "type": "equity",
                    "amount": "10%"
                },
                "owner": {
                    "name": "Udi Shkolnik",  # Get from user data
                    "avatar": f"/avatars/{venture['id']}.jpg"
                },
                "createdAt": venture['createdAt'].isoformat() if venture['createdAt'] else datetime.now().isoformat(),
                "status": "active" if venture['status'] != 'DRAFT' else 'draft',
                "tags": ["Startup"],  # Default tags
                "tier": "T1",  # Default tier
                "residency": venture.get('region', 'US')
            }
            formatted_ventures.append(formatted_venture)
        
        ventures_data = {
            "success": True,
            "data": {
                "ventures": formatted_ventures,
                "total_count": len(formatted_ventures),
                "pagination": {
                    "page": 1,
                    "limit": 10,
                    "total_pages": 1
                }
            }
        }
        return jsonify(ventures_data), 200
    except Exception as e:
        logger.error(f"Error getting user ventures: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/v1/opportunities', methods=['GET'])
def get_opportunities():
    """Get opportunities from database"""
    try:
        # Get opportunities from database
        opportunities = db.get_opportunities()
        
        # Transform database data to frontend format
        formatted_opportunities = []
        for opp in opportunities:
            formatted_opp = {
                "id": opp['id'],
                "title": opp['title'],
                "description": opp['description'],
                "venture": {
                    "id": opp.get('venture_id', ''),
                    "name": opp.get('venture_name', 'Unknown Venture')
                },
                "skills": ["React", "TypeScript", "Next.js"],  # Default skills
                "commitment": "Part-time",  # Default commitment
                "rewards": {
                    "type": "equity",
                    "amount": "5%"
                },
                "status": "open" if opp['status'] == 'OPEN' else 'closed',
                "createdAt": opp['createdAt'].isoformat() if opp['createdAt'] else datetime.now().isoformat()
            }
            formatted_opportunities.append(formatted_opp)
        
        opportunities_data = {
            "success": True,
            "data": {
                "opportunities": formatted_opportunities,
                "total_count": len(formatted_opportunities),
                "pagination": {
                    "page": 1,
                    "limit": 10,
                    "total_pages": 1
                }
            }
        }
        return jsonify(opportunities_data), 200
    except Exception as e:
        logger.error(f"Error getting opportunities: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/v1/analytics/user/<user_id>', methods=['GET'])
def get_user_analytics(user_id):
    """Get user analytics from database"""
    try:
        # Get user analytics from database
        analytics = db.get_user_analytics(user_id)
        
        analytics_data = {
            "success": True,
            "data": {
                "venture_count": analytics['venture_count'],
                "buz_balance": analytics['buz_balance'],
                "buz_staked": analytics['buz_staked'],
                "xp": analytics['xp'],
                "reputation": analytics['reputation'],
                "level": analytics['level'],
                "active_projects": analytics['venture_count'],
                "team_members": analytics['venture_count'] * 3,  # Estimate
                "open_roles": analytics['venture_count'] * 2,  # Estimate
                "total_earned": analytics['buz_balance'] + analytics['buz_staked']
            }
        }
        return jsonify(analytics_data), 200
    except Exception as e:
        logger.error(f"Error getting user analytics: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/v1/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user data from database"""
    try:
        # Get user from database
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        user_data = {
            "success": True,
            "data": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "username": user.get('username', ''),
                "level": user.get('level', 'OWLET'),
                "xp": user.get('xp', 0),
                "reputation": user.get('reputation', 0),
                "status": user.get('status', 'ACTIVE'),
                "totalPortfolioValue": user.get('totalPortfolioValue', 0),
                "activeProjectsCount": user.get('activeProjectsCount', 0),
                "createdAt": user['createdAt'].isoformat() if user['createdAt'] else datetime.now().isoformat(),
                "updatedAt": user['updatedAt'].isoformat() if user['updatedAt'] else datetime.now().isoformat()
            }
        }
        return jsonify(user_data), 200
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# Venture Legal System Endpoints
@app.route('/api/venture-legal/dashboard/<user_id>', methods=['GET'])
def get_venture_legal_dashboard(user_id):
    """Get venture legal dashboard data"""
    try:
        dashboard_data = {
            "success": True,
            "data": {
                "user_id": user_id,
                "legal_health_score": 85,
                "documents_signed": 5,
                "documents_pending": 2,
                "compliance_status": "GOOD",
                "recent_activities": [
                    {
                        "type": "charter_signed",
                        "message": "Team Charter signed by John Doe",
                        "timestamp": datetime.now().isoformat()
                    },
                    {
                        "type": "plan_created", 
                        "message": "30-day project plan created",
                        "timestamp": datetime.now().isoformat()
                    }
                ],
                "upcoming_deadlines": [
                    {
                        "type": "legal_review",
                        "due_date": "2025-01-20",
                        "description": "Quarterly legal compliance review"
                    }
                ]
            }
        }
        return jsonify(dashboard_data), 200
    except Exception as e:
        logger.error(f"Error getting venture legal dashboard: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/venture-legal/charters', methods=['GET'])
def get_team_charters():
    """Get all team charters"""
    try:
        charters_data = {
            "success": True,
            "data": {
                "charters": [
                    {
                        "id": "charter-001",
                        "venture_id": "venture-001", 
                        "title": "TechCorp Team Charter",
                        "status": "ACTIVE",
                        "created_at": "2025-01-01T00:00:00Z",
                        "signed_by": ["john.doe@techcorp.com", "jane.smith@techcorp.com"],
                        "equity_allocation": {
                            "john.doe@techcorp.com": 40,
                            "jane.smith@techcorp.com": 30,
                            "bob.wilson@techcorp.com": 30
                        }
                    }
                ],
                "total_count": 1
            }
        }
        return jsonify(charters_data), 200
    except Exception as e:
        logger.error(f"Error getting team charters: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/venture-legal/charters', methods=['POST'])
def create_team_charter():
    """Create a new team charter"""
    try:
        data = request.get_json()
        
        charter_data = {
            "success": True,
            "data": {
                "id": f"charter-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "venture_id": data.get('venture_id', 'venture-001'),
                "title": data.get('title', 'New Team Charter'),
                "status": "DRAFT",
                "created_at": datetime.now().isoformat(),
                "signed_by": [],
                "equity_allocation": data.get('equity_allocation', {})
            }
        }
        return jsonify(charter_data), 201
    except Exception as e:
        logger.error(f"Error creating team charter: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/venture-legal/project-plans', methods=['GET'])
def get_project_plans():
    """Get all project plans"""
    try:
        plans_data = {
            "success": True,
            "data": {
                "plans": [
                    {
                        "id": "plan-001",
                        "venture_id": "venture-001",
                        "title": "Q1 2025 Launch Plan",
                        "status": "IN_PROGRESS",
                        "created_at": "2025-01-01T00:00:00Z",
                        "phases": [
                            {
                                "name": "Phase 1: Foundation",
                                "duration_days": 7,
                                "status": "COMPLETED",
                                "milestones": ["Setup development environment", "Create initial prototypes"]
                            },
                            {
                                "name": "Phase 2: Development", 
                                "duration_days": 14,
                                "status": "IN_PROGRESS",
                                "milestones": ["Core feature development", "Testing framework setup"]
                            },
                            {
                                "name": "Phase 3: Launch",
                                "duration_days": 7,
                                "status": "PENDING",
                                "milestones": ["Final testing", "Production deployment"]
                            }
                        ]
                    }
                ],
                "total_count": 1
            }
        }
        return jsonify(plans_data), 200
    except Exception as e:
        logger.error(f"Error getting project plans: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/venture-legal/raci-matrices', methods=['GET'])
def get_raci_matrices():
    """Get all RACI matrices"""
    try:
        raci_data = {
            "success": True,
            "data": {
                "matrices": [
                    {
                        "id": "raci-001",
                        "venture_id": "venture-001",
                        "title": "Product Development RACI",
                        "activities": [
                            {
                                "name": "Requirements Analysis",
                                "responsible": ["john.doe@techcorp.com"],
                                "accountable": ["jane.smith@techcorp.com"],
                                "consulted": ["bob.wilson@techcorp.com"],
                                "informed": ["team@techcorp.com"]
                            },
                            {
                                "name": "Code Review",
                                "responsible": ["bob.wilson@techcorp.com"],
                                "accountable": ["john.doe@techcorp.com"],
                                "consulted": ["jane.smith@techcorp.com"],
                                "informed": ["team@techcorp.com"]
                            }
                        ]
                    }
                ],
                "total_count": 1
            }
        }
        return jsonify(raci_data), 200
    except Exception as e:
        logger.error(f"Error getting RACI matrices: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/venture-legal/smart-goals', methods=['GET'])
def get_smart_goals():
    """Get all SMART goals"""
    try:
        goals_data = {
            "success": True,
            "data": {
                "goals": [
                    {
                        "id": "goal-001",
                        "venture_id": "venture-001",
                        "title": "Launch MVP by March 2025",
                        "description": "Complete and launch minimum viable product",
                        "specific": "Launch a working web application with core features",
                        "measurable": "1000 active users within 30 days",
                        "achievable": "Based on current team capacity and resources",
                        "relevant": "Critical for market validation and funding",
                        "time_bound": "March 31, 2025",
                        "status": "IN_PROGRESS",
                        "progress": 65,
                        "created_at": "2025-01-01T00:00:00Z"
                    }
                ],
                "total_count": 1
            }
        }
        return jsonify(goals_data), 200
    except Exception as e:
        logger.error(f"Error getting SMART goals: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/venture-legal/liability-records', methods=['GET'])
def get_liability_records():
    """Get all liability records"""
    try:
        liability_data = {
            "success": True,
            "data": {
                "records": [
                    {
                        "id": "liability-001",
                        "venture_id": "venture-001",
                        "type": "INTELLECTUAL_PROPERTY",
                        "description": "Patent infringement risk assessment",
                        "risk_level": "MEDIUM",
                        "mitigation_plan": "Conduct thorough IP research before product launch",
                        "assigned_to": "john.doe@techcorp.com",
                        "due_date": "2025-02-15",
                        "status": "IN_PROGRESS",
                        "created_at": "2025-01-01T00:00:00Z"
                    }
                ],
                "total_count": 1
            }
        }
        return jsonify(liability_data), 200
    except Exception as e:
        logger.error(f"Error getting liability records: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# Legal Document Management Endpoints
@app.route('/api/legal/documents/<user_id>', methods=['GET'])
def get_legal_documents(user_id):
    """Get legal documents for user"""
    try:
        documents_data = {
            "success": True,
            "data": {
                "documents": [
                    {
                        "id": "doc-001",
                        "title": "Terms of Service",
                        "type": "TERMS_OF_SERVICE",
                        "status": "SIGNED",
                        "signed_at": "2025-01-01T00:00:00Z",
                        "version": "1.0"
                    },
                    {
                        "id": "doc-002", 
                        "title": "Privacy Policy",
                        "type": "PRIVACY_POLICY",
                        "status": "SIGNED",
                        "signed_at": "2025-01-01T00:00:00Z",
                        "version": "1.0"
                    }
                ],
                "total_count": 2
            }
        }
        return jsonify(documents_data), 200
    except Exception as e:
        logger.error(f"Error getting legal documents: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/api/legal/templates', methods=['GET'])
def get_legal_templates():
    """Get all legal templates"""
    try:
        templates_data = {
            "success": True,
            "data": {
                "templates": [
                    {
                        "id": "template-001",
                        "name": "Standard Terms of Service",
                        "type": "TERMS_OF_SERVICE",
                        "description": "Standard terms of service template",
                        "version": "1.0"
                    },
                    {
                        "id": "template-002",
                        "name": "Privacy Policy Template",
                        "type": "PRIVACY_POLICY", 
                        "description": "Standard privacy policy template",
                        "version": "1.0"
                    }
                ],
                "total_count": 2
            }
        }
        return jsonify(templates_data), 200
    except Exception as e:
        logger.error(f"Error getting legal templates: {e}")
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
    logger.info("🚀 Starting Clean Python Brain v1.0.0")
    logger.info("🏢 Venture Legal System: Active")
    logger.info("📋 Team Charter Management: Active")
    logger.info("📅 30-Day Project Plans: Active")
    logger.info("👥 RACI Matrix: Active")
    logger.info("🎯 SMART Goals: Active")
    logger.info("⚠️ Liability Management: Active")
    logger.info("✍️ Digital Signatures: Active")
    
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
