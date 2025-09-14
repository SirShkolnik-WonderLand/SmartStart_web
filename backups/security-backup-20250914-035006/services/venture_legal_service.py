"""
SmartStart Venture Legal Service
Comprehensive legal documentation system for venture projects with role-based charters,
30-day plans, RACI matrix, SMART goals, and digital signatures
"""

import logging
import hashlib
import json
import uuid
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import sys
import os

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from nodejs_connector import NodeJSConnector
except ImportError:
    # Fallback for when NodeJSConnector is not available
    class NodeJSConnector:
        def __init__(self):
            pass
        def query(self, sql, params=None):
            return []

logger = logging.getLogger(__name__)

class VentureLegalService:
    def __init__(self, nodejs_connector=None):
        self.connector = nodejs_connector or NodeJSConnector()
        logger.info("⚖️ Venture Legal Service initialized")
    
    # ==============================================
    # PROJECT CHARTER MANAGEMENT
    # ==============================================
    
    def create_project_charter(self, project_id: str, user_id: str, role: str, 
                             template_id: str = None, custom_content: str = None) -> Dict[str, Any]:
        """Create a project charter for a team member"""
        try:
            # Get user and project information
            user_info = self._get_user_info(user_id)
            project_info = self._get_project_info(project_id)
            
            if not user_info or not project_info:
                return {"success": False, "error": "User or project not found"}
            
            # Get or create charter template
            if template_id:
                template = self._get_charter_template(template_id)
            else:
                template = self._get_charter_template_by_role(role)
            
            if not template:
                return {"success": False, "error": f"No charter template found for role: {role}"}
            
            # Generate charter content
            if custom_content:
                content = custom_content
            else:
                content = self._generate_charter_content(template, user_info, project_info, role)
            
            # Create charter record
            charter_id = self._generate_id()
            insert_query = """
            INSERT INTO "ProjectCharter" (
                id, project_id, template_id, user_id, role, title, content, status,
                created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            title = f"{role.replace('_', ' ').title()} Charter - {project_info['name']}"
            
            self.connector.query(insert_query, [
                charter_id, project_id, template['id'], user_id, role, title, content,
                'DRAFT', datetime.now(), datetime.now()
            ])
            
            # Log audit trail
            self._log_audit_action(project_id, user_id, 'CHARTER_CREATED', 
                                 f"Created charter for role: {role}")
            
            return {
                "success": True,
                "data": {
                    "charter_id": charter_id,
                    "title": title,
                    "content": content,
                    "status": "DRAFT"
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating project charter: {e}")
            return {"success": False, "error": str(e)}
    
    def sign_project_charter(self, charter_id: str, user_id: str, 
                           signature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sign a project charter with digital signature"""
        try:
            # Get charter information
            charter_query = """
            SELECT pc.*, p.name as project_name, u.name as user_name
            FROM "ProjectCharter" pc
            JOIN "Project" p ON pc.project_id = p.id
            JOIN "User" u ON pc.user_id = u.id
            WHERE pc.id = %s
            """
            
            charter_result = self.connector.query(charter_query, [charter_id])
            if not charter_result:
                return {"success": False, "error": "Charter not found"}
            
            charter = charter_result[0]
            
            # Verify user can sign this charter
            if charter['user_id'] != user_id:
                return {"success": False, "error": "User not authorized to sign this charter"}
            
            # Generate digital signature
            signature_hash = self._generate_digital_signature(charter, signature_data)
            
            # Create digital signature record
            signature_id = self._generate_id()
            signature_insert = """
            INSERT INTO "DigitalSignature" (
                id, document_id, document_type, signer_id, signature_hash,
                signature_data, ip_address, user_agent, signed_at, verification_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            self.connector.query(signature_insert, [
                signature_id, charter_id, 'CHARTER', user_id, signature_hash,
                json.dumps(signature_data), signature_data.get('ip_address'),
                signature_data.get('user_agent'), datetime.now(), 'VERIFIED'
            ])
            
            # Update charter status
            update_query = """
            UPDATE "ProjectCharter"
            SET status = %s, signed_at = %s, expires_at = %s, updated_at = %s
            WHERE id = %s
            """
            
            expires_at = datetime.now() + timedelta(days=365)  # 1 year validity
            
            self.connector.query(update_query, [
                'SIGNED', datetime.now(), expires_at, datetime.now(), charter_id
            ])
            
            # Update team member charter status
            team_update = """
            UPDATE "ProjectTeamMember"
            SET charter_signed = true, charter_signed_at = %s, updated_at = %s
            WHERE project_id = %s AND user_id = %s
            """
            
            self.connector.query(team_update, [
                datetime.now(), datetime.now(), charter['project_id'], user_id
            ])
            
            # Log audit trail
            self._log_audit_action(charter['project_id'], user_id, 'CHARTER_SIGNED',
                                 f"Signed charter for role: {charter['role']}")
            
            return {
                "success": True,
                "data": {
                    "charter_id": charter_id,
                    "signature_id": signature_id,
                    "signature_hash": signature_hash,
                    "signed_at": datetime.now().isoformat(),
                    "expires_at": expires_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error signing project charter: {e}")
            return {"success": False, "error": str(e)}
    
    # ==============================================
    # 30-DAY PROJECT PLANS
    # ==============================================
    
    def create_30_day_plan(self, project_id: str, user_id: str, 
                          plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a 30-day project plan"""
        try:
            # Validate user can create plans for this project
            if not self._can_manage_project(project_id, user_id):
                return {"success": False, "error": "Insufficient permissions"}
            
            # Create project plan
            plan_id = self._generate_id()
            start_date = datetime.now().date()
            end_date = start_date + timedelta(days=30)
            
            plan_insert = """
            INSERT INTO "ProjectPlan" (
                id, project_id, title, description, start_date, end_date,
                status, phases, milestones, created_by, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            phases = plan_data.get('phases', [])
            milestones = plan_data.get('milestones', [])
            
            self.connector.query(plan_insert, [
                plan_id, project_id, plan_data['title'], plan_data.get('description', ''),
                start_date, end_date, 'DRAFT', json.dumps(phases), json.dumps(milestones),
                user_id, datetime.now(), datetime.now()
            ])
            
            # Create phase records
            for phase in phases:
                phase_id = self._generate_id()
                phase_insert = """
                INSERT INTO "ProjectPlanPhase" (
                    id, plan_id, name, description, start_day, end_day,
                    status, deliverables, dependencies
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                self.connector.query(phase_insert, [
                    phase_id, plan_id, phase['name'], phase.get('description', ''),
                    phase['start_day'], phase['end_day'], 'PENDING',
                    json.dumps(phase.get('deliverables', [])),
                    json.dumps(phase.get('dependencies', []))
                ])
            
            # Create milestone records
            for milestone in milestones:
                milestone_id = self._generate_id()
                milestone_insert = """
                INSERT INTO "ProjectPlanMilestone" (
                    id, plan_id, name, description, target_day, status
                ) VALUES (%s, %s, %s, %s, %s, %s)
                """
                
                self.connector.query(milestone_insert, [
                    milestone_id, plan_id, milestone['name'], milestone.get('description', ''),
                    milestone['target_day'], 'PENDING'
                ])
            
            # Log audit trail
            self._log_audit_action(project_id, user_id, 'PLAN_CREATED',
                                 f"Created 30-day plan: {plan_data['title']}")
            
            return {
                "success": True,
                "data": {
                    "plan_id": plan_id,
                    "title": plan_data['title'],
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "phases": phases,
                    "milestones": milestones
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating 30-day plan: {e}")
            return {"success": False, "error": str(e)}
    
    def get_project_plan(self, project_id: str) -> Dict[str, Any]:
        """Get the current project plan"""
        try:
            # Get plan details
            plan_query = """
            SELECT pp.*, u.name as created_by_name
            FROM "ProjectPlan" pp
            JOIN "User" u ON pp.created_by = u.id
            WHERE pp.project_id = %s AND pp.status != 'CANCELLED'
            ORDER BY pp.created_at DESC
            LIMIT 1
            """
            
            plan_result = self.connector.query(plan_query, [project_id])
            if not plan_result:
                return {"success": False, "error": "No project plan found"}
            
            plan = plan_result[0]
            
            # Get phases
            phases_query = """
            SELECT * FROM "ProjectPlanPhase"
            WHERE plan_id = %s
            ORDER BY start_day
            """
            
            phases = self.connector.query(phases_query, [plan['id']])
            
            # Get milestones
            milestones_query = """
            SELECT * FROM "ProjectPlanMilestone"
            WHERE plan_id = %s
            ORDER BY target_day
            """
            
            milestones = self.connector.query(milestones_query, [plan['id']])
            
            return {
                "success": True,
                "data": {
                    "plan": plan,
                    "phases": phases,
                    "milestones": milestones
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting project plan: {e}")
            return {"success": False, "error": str(e)}
    
    # ==============================================
    # RACI MATRIX MANAGEMENT
    # ==============================================
    
    def create_raci_matrix(self, project_id: str, user_id: str, 
                          raci_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create RACI matrix for project activities"""
        try:
            if not self._can_manage_project(project_id, user_id):
                return {"success": False, "error": "Insufficient permissions"}
            
            created_activities = []
            
            for activity in raci_data:
                raci_id = self._generate_id()
                insert_query = """
                INSERT INTO "ProjectRACIMatrix" (
                    id, project_id, activity, description, responsible, accountable,
                    consulted, informed, priority, due_date, status, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                due_date = None
                if activity.get('due_date'):
                    due_date = datetime.strptime(activity['due_date'], '%Y-%m-%d').date()
                
                self.connector.query(insert_query, [
                    raci_id, project_id, activity['activity'], activity.get('description', ''),
                    activity.get('responsible'), activity.get('accountable'),
                    json.dumps(activity.get('consulted', [])),
                    json.dumps(activity.get('informed', [])),
                    activity.get('priority', 'MEDIUM'), due_date, 'PENDING',
                    datetime.now(), datetime.now()
                ])
                
                created_activities.append({
                    "id": raci_id,
                    "activity": activity['activity'],
                    "responsible": activity.get('responsible'),
                    "accountable": activity.get('accountable')
                })
            
            # Log audit trail
            self._log_audit_action(project_id, user_id, 'RACI_CREATED',
                                 f"Created RACI matrix with {len(created_activities)} activities")
            
            return {
                "success": True,
                "data": {
                    "activities": created_activities,
                    "total_activities": len(created_activities)
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating RACI matrix: {e}")
            return {"success": False, "error": str(e)}
    
    def get_project_raci_matrix(self, project_id: str) -> Dict[str, Any]:
        """Get RACI matrix for project"""
        try:
            query = """
            SELECT 
                prm.*,
                r.name as responsible_name,
                a.name as accountable_name
            FROM "ProjectRACIMatrix" prm
            LEFT JOIN "User" r ON prm.responsible = r.id
            LEFT JOIN "User" a ON prm.accountable = a.id
            WHERE prm.project_id = %s
            ORDER BY prm.priority DESC, prm.activity
            """
            
            activities = self.connector.query(query, [project_id])
            
            return {
                "success": True,
                "data": {
                    "activities": activities,
                    "total_activities": len(activities)
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting RACI matrix: {e}")
            return {"success": False, "error": str(e)}
    
    # ==============================================
    # SMART GOALS MANAGEMENT
    # ==============================================
    
    def create_smart_goal(self, project_id: str, user_id: str, 
                         goal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create SMART goal for project"""
        try:
            # Validate SMART goal components
            required_fields = ['title', 'specific', 'measurable', 'achievable', 'relevant', 'time_bound']
            for field in required_fields:
                if field not in goal_data:
                    return {"success": False, "error": f"Missing required field: {field}"}
            
            goal_id = self._generate_id()
            due_date = None
            if goal_data.get('due_date'):
                due_date = datetime.strptime(goal_data['due_date'], '%Y-%m-%d').date()
            
            insert_query = """
            INSERT INTO "ProjectSMARTGoal" (
                id, project_id, user_id, title, description, specific, measurable,
                achievable, relevant, time_bound, target_value, current_value, unit,
                priority, status, due_date, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            self.connector.query(insert_query, [
                goal_id, project_id, user_id, goal_data['title'],
                goal_data.get('description', ''), goal_data['specific'],
                goal_data['measurable'], goal_data['achievable'],
                goal_data['relevant'], goal_data['time_bound'],
                goal_data.get('target_value', 0), goal_data.get('current_value', 0),
                goal_data.get('unit', 'COUNT'), goal_data.get('priority', 'MEDIUM'),
                'DRAFT', due_date, datetime.now(), datetime.now()
            ])
            
            # Log audit trail
            self._log_audit_action(project_id, user_id, 'SMART_GOAL_CREATED',
                                 f"Created SMART goal: {goal_data['title']}")
            
            return {
                "success": True,
                "data": {
                    "goal_id": goal_id,
                    "title": goal_data['title'],
                    "status": 'DRAFT'
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating SMART goal: {e}")
            return {"success": False, "error": str(e)}
    
    def update_smart_goal_progress(self, goal_id: str, user_id: str, 
                                  current_value: float, notes: str = None) -> Dict[str, Any]:
        """Update SMART goal progress"""
        try:
            # Verify user owns this goal
            goal_query = """
            SELECT * FROM "ProjectSMARTGoal"
            WHERE id = %s AND user_id = %s
            """
            
            goal_result = self.connector.query(goal_query, [goal_id, user_id])
            if not goal_result:
                return {"success": False, "error": "Goal not found or access denied"}
            
            goal = goal_result[0]
            
            # Update progress
            update_query = """
            UPDATE "ProjectSMARTGoal"
            SET current_value = %s, updated_at = %s
            WHERE id = %s
            """
            
            self.connector.query(update_query, [current_value, datetime.now(), goal_id])
            
            # Check if goal is completed
            target_value = goal['target_value']
            if current_value >= target_value and goal['status'] != 'COMPLETED':
                # Mark as completed
                complete_query = """
                UPDATE "ProjectSMARTGoal"
                SET status = %s, completed_at = %s, updated_at = %s
                WHERE id = %s
                """
                
                self.connector.query(complete_query, [
                    'COMPLETED', datetime.now(), datetime.now(), goal_id
                ])
                
                # Log audit trail
                self._log_audit_action(goal['project_id'], user_id, 'SMART_GOAL_COMPLETED',
                                     f"Completed SMART goal: {goal['title']}")
            
            return {
                "success": True,
                "data": {
                    "goal_id": goal_id,
                    "current_value": current_value,
                    "target_value": target_value,
                    "progress_percentage": (current_value / target_value * 100) if target_value > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error updating SMART goal progress: {e}")
            return {"success": False, "error": str(e)}
    
    # ==============================================
    # LIABILITY MANAGEMENT
    # ==============================================
    
    def create_liability_assessment(self, project_id: str, user_id: str,
                                   liability_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create liability assessment for project"""
        try:
            liability_id = self._generate_id()
            
            insert_query = """
            INSERT INTO "ProjectLiability" (
                id, project_id, user_id, liability_type, description,
                potential_impact, probability, mitigation_plan,
                insurance_required, insurance_amount, status, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            self.connector.query(insert_query, [
                liability_id, project_id, user_id, liability_data['liability_type'],
                liability_data['description'], liability_data['potential_impact'],
                liability_data['probability'], liability_data.get('mitigation_plan', ''),
                liability_data.get('insurance_required', False),
                liability_data.get('insurance_amount', 0), 'ACTIVE',
                datetime.now(), datetime.now()
            ])
            
            # Log audit trail
            self._log_audit_action(project_id, user_id, 'LIABILITY_CREATED',
                                 f"Created liability assessment: {liability_data['liability_type']}")
            
            return {
                "success": True,
                "data": {
                    "liability_id": liability_id,
                    "liability_type": liability_data['liability_type'],
                    "status": 'ACTIVE'
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating liability assessment: {e}")
            return {"success": False, "error": str(e)}
    
    def get_project_liabilities(self, project_id: str) -> Dict[str, Any]:
        """Get all liabilities for project"""
        try:
            query = """
            SELECT pl.*, u.name as user_name
            FROM "ProjectLiability" pl
            JOIN "User" u ON pl.user_id = u.id
            WHERE pl.project_id = %s
            ORDER BY pl.potential_impact DESC, pl.created_at DESC
            """
            
            liabilities = self.connector.query(query, [project_id])
            
            # Calculate risk scores
            for liability in liabilities:
                impact_scores = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4}
                prob_scores = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CERTAIN': 4}
                
                impact_score = impact_scores.get(liability['potential_impact'], 1)
                prob_score = prob_scores.get(liability['probability'], 1)
                liability['risk_score'] = impact_score * prob_score
            
            return {
                "success": True,
                "data": {
                    "liabilities": liabilities,
                    "total_liabilities": len(liabilities),
                    "high_risk_count": len([l for l in liabilities if l['risk_score'] >= 9])
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting project liabilities: {e}")
            return {"success": False, "error": str(e)}
    
    # ==============================================
    # TEAM ROLE MANAGEMENT
    # ==============================================
    
    def assign_team_role(self, project_id: str, user_id: str, role_id: str,
                        equity_percentage: float, vesting_schedule: Dict[str, Any]) -> Dict[str, Any]:
        """Assign team role to user for project"""
        try:
            # Check if user is already assigned to project
            existing_query = """
            SELECT id FROM "ProjectTeamMember"
            WHERE project_id = %s AND user_id = %s
            """
            
            existing = self.connector.query(existing_query, [project_id, user_id])
            
            if existing:
                # Update existing assignment
                update_query = """
                UPDATE "ProjectTeamMember"
                SET role_id = %s, equity_percentage = %s, vesting_schedule = %s,
                    updated_at = %s
                WHERE project_id = %s AND user_id = %s
                """
                
                self.connector.query(update_query, [
                    role_id, equity_percentage, json.dumps(vesting_schedule),
                    datetime.now(), project_id, user_id
                ])
                
                member_id = existing[0]['id']
            else:
                # Create new assignment
                member_id = self._generate_id()
                insert_query = """
                INSERT INTO "ProjectTeamMember" (
                    id, project_id, user_id, role_id, equity_percentage,
                    vesting_schedule, status, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                self.connector.query(insert_query, [
                    member_id, project_id, user_id, role_id, equity_percentage,
                    json.dumps(vesting_schedule), 'ACTIVE', datetime.now(), datetime.now()
                ])
            
            # Log audit trail
            self._log_audit_action(project_id, user_id, 'ROLE_ASSIGNED',
                                 f"Assigned role with {equity_percentage}% equity")
            
            return {
                "success": True,
                "data": {
                    "member_id": member_id,
                    "role_id": role_id,
                    "equity_percentage": equity_percentage,
                    "vesting_schedule": vesting_schedule
                }
            }
            
        except Exception as e:
            logger.error(f"Error assigning team role: {e}")
            return {"success": False, "error": str(e)}
    
    def get_project_team(self, project_id: str) -> Dict[str, Any]:
        """Get project team members with roles"""
        try:
            query = """
            SELECT 
                ptm.*,
                u.name as user_name,
                u.email as user_email,
                trd.display_name as role_name,
                trd.description as role_description,
                trd.responsibilities as role_responsibilities
            FROM "ProjectTeamMember" ptm
            JOIN "User" u ON ptm.user_id = u.id
            JOIN "TeamRoleDefinition" trd ON ptm.role_id = trd.id
            WHERE ptm.project_id = %s AND ptm.status = 'ACTIVE'
            ORDER BY ptm.equity_percentage DESC, u.name
            """
            
            team_members = self.connector.query(query, [project_id])
            
            # Calculate total equity allocated
            total_equity = sum(member['equity_percentage'] for member in team_members)
            
            return {
                "success": True,
                "data": {
                    "team_members": team_members,
                    "total_members": len(team_members),
                    "total_equity_allocated": total_equity,
                    "remaining_equity": 100 - total_equity
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting project team: {e}")
            return {"success": False, "error": str(e)}
    
    # ==============================================
    # LEGAL COMPLIANCE TRACKING
    # ==============================================
    
    def get_project_legal_status(self, project_id: str) -> Dict[str, Any]:
        """Get comprehensive legal status for project"""
        try:
            # Get team members and their charter status
            team_query = """
            SELECT 
                ptm.*,
                u.name as user_name,
                trd.display_name as role_name,
                pc.status as charter_status,
                pc.signed_at as charter_signed_at
            FROM "ProjectTeamMember" ptm
            JOIN "User" u ON ptm.user_id = u.id
            JOIN "TeamRoleDefinition" trd ON ptm.role_id = trd.id
            LEFT JOIN "ProjectCharter" pc ON ptm.project_id = pc.project_id AND ptm.user_id = pc.user_id
            WHERE ptm.project_id = %s AND ptm.status = 'ACTIVE'
            """
            
            team_members = self.connector.query(team_query, [project_id])
            
            # Calculate compliance metrics
            total_members = len(team_members)
            charters_signed = len([m for m in team_members if m['charter_status'] == 'SIGNED'])
            compliance_percentage = (charters_signed / total_members * 100) if total_members > 0 else 0
            
            # Get project plan status
            plan_status = self.get_project_plan(project_id)
            plan_active = plan_status['success'] if plan_status['success'] else False
            
            # Get RACI matrix status
            raci_status = self.get_project_raci_matrix(project_id)
            raci_activities = raci_status['data']['total_activities'] if raci_status['success'] else 0
            
            # Get SMART goals status
            goals_query = """
            SELECT COUNT(*) as total_goals,
                   SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_goals
            FROM "ProjectSMARTGoal"
            WHERE project_id = %s
            """
            
            goals_result = self.connector.query(goals_query, [project_id])
            goals_data = goals_result[0] if goals_result else {'total_goals': 0, 'completed_goals': 0}
            
            # Get liability status
            liabilities_status = self.get_project_liabilities(project_id)
            high_risk_liabilities = liabilities_status['data']['high_risk_count'] if liabilities_status['success'] else 0
            
            return {
                "success": True,
                "data": {
                    "compliance_overview": {
                        "total_team_members": total_members,
                        "charters_signed": charters_signed,
                        "compliance_percentage": compliance_percentage,
                        "plan_active": plan_active,
                        "raci_activities": raci_activities,
                        "smart_goals": goals_data['total_goals'],
                        "completed_goals": goals_data['completed_goals'],
                        "high_risk_liabilities": high_risk_liabilities
                    },
                    "team_members": team_members,
                    "legal_health_score": self._calculate_legal_health_score(
                        compliance_percentage, plan_active, raci_activities, 
                        goals_data['total_goals'], high_risk_liabilities
                    )
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting project legal status: {e}")
            return {"success": False, "error": str(e)}
    
    # ==============================================
    # HELPER METHODS
    # ==============================================
    
    def _get_user_info(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user information"""
        query = """
        SELECT id, name, email, role
        FROM "User"
        WHERE id = %s
        """
        
        result = self.connector.query(query, [user_id])
        return result[0] if result else None
    
    def _get_project_info(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project information"""
        query = """
        SELECT id, name, description, owner_id
        FROM "Project"
        WHERE id = %s
        """
        
        result = self.connector.query(query, [project_id])
        return result[0] if result else None
    
    def _get_charter_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get charter template by ID"""
        query = """
        SELECT * FROM "ProjectCharterTemplate"
        WHERE id = %s AND is_active = true
        """
        
        result = self.connector.query(query, [template_id])
        return result[0] if result else None
    
    def _get_charter_template_by_role(self, role: str) -> Optional[Dict[str, Any]]:
        """Get charter template by role"""
        query = """
        SELECT * FROM "ProjectCharterTemplate"
        WHERE category = %s AND is_active = true
        ORDER BY rbac_level DESC
        LIMIT 1
        """
        
        result = self.connector.query(query, [role])
        return result[0] if result else None
    
    def _generate_charter_content(self, template: Dict[str, Any], user_info: Dict[str, Any],
                                 project_info: Dict[str, Any], role: str) -> str:
        """Generate charter content from template"""
        content = template['content']
        variables = template.get('variables', {})
        
        # Replace template variables
        replacements = {
            '{{project_name}}': project_info['name'],
            '{{user_name}}': user_info['name'],
            '{{signature_date}}': datetime.now().strftime('%Y-%m-%d'),
            '{{base_equity}}': '5',  # Default values
            '{{performance_bonus}}': '2',
            '{{vesting_schedule}}': '4 years with 1 year cliff',
            '{{signature_hash}}': 'PENDING_SIGNATURE'
        }
        
        for placeholder, value in replacements.items():
            content = content.replace(placeholder, str(value))
        
        return content
    
    def _generate_digital_signature(self, charter: Dict[str, Any], 
                                   signature_data: Dict[str, Any]) -> str:
        """Generate digital signature hash"""
        signature_string = f"{charter['id']}:{charter['user_id']}:{charter['content']}:{datetime.now().isoformat()}"
        return hashlib.sha256(signature_string.encode()).hexdigest()
    
    def _can_manage_project(self, project_id: str, user_id: str) -> bool:
        """Check if user can manage project"""
        query = """
        SELECT p.owner_id, ptm.user_id
        FROM "Project" p
        LEFT JOIN "ProjectTeamMember" ptm ON p.id = ptm.project_id AND ptm.user_id = %s
        WHERE p.id = %s
        """
        
        result = self.connector.query(query, [user_id, project_id])
        if not result:
            return False
        
        # Owner or team member can manage
        return result[0]['owner_id'] == user_id or result[0]['user_id'] is not None
    
    def _log_audit_action(self, project_id: str, user_id: str, action: str, description: str):
        """Log audit action"""
        audit_id = self._generate_id()
        insert_query = """
        INSERT INTO "ProjectLegalAudit" (
            id, project_id, user_id, action, description, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        self.connector.query(insert_query, [
            audit_id, project_id, user_id, action, description, datetime.now()
        ])
    
    def _calculate_legal_health_score(self, compliance_percentage: float, plan_active: bool,
                                    raci_activities: int, total_goals: int, 
                                    high_risk_liabilities: int) -> int:
        """Calculate overall legal health score (0-100)"""
        score = 0
        
        # Compliance percentage (40% weight)
        score += compliance_percentage * 0.4
        
        # Plan active (20% weight)
        score += 20 if plan_active else 0
        
        # RACI activities (20% weight)
        score += min(20, raci_activities * 2)  # Max 20 points for 10+ activities
        
        # SMART goals (10% weight)
        score += min(10, total_goals * 2)  # Max 10 points for 5+ goals
        
        # Low risk liabilities (10% weight)
        score += max(0, 10 - high_risk_liabilities * 2)  # Deduct 2 points per high risk
        
        return min(100, max(0, int(score)))
    
    def _generate_id(self) -> str:
        """Generate a unique ID (cuid-like)"""
        import time
        import random
        import string
        
        timestamp = str(int(time.time() * 1000))
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"vl{timestamp[-8:]}{random_part}"
