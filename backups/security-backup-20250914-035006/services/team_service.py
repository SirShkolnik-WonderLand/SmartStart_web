#!/usr/bin/env python3
"""
Team Management Service
Handles all team-related operations with full CRUD and collaboration features
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from flask import request, jsonify
import logging

@dataclass
class Team:
    id: str
    name: str
    description: str
    company_id: str
    venture_id: Optional[str] = None
    team_lead_id: str = None
    members: List[Dict] = None
    skills: List[str] = None
    status: str = 'ACTIVE'
    visibility: str = 'PRIVATE'
    created_at: str = None
    updated_at: str = None

    def __post_init__(self):
        if self.members is None:
            self.members = []
        if self.skills is None:
            self.skills = []
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow().isoformat()

@dataclass
class TeamMember:
    user_id: str
    role: str
    permissions: List[str]
    joined_at: str
    status: str = 'ACTIVE'

class TeamService:
    def __init__(self, db_connector):
        self.db = db_connector
        self.logger = logging.getLogger(__name__)
        
    def create_team(self, data: Dict) -> Dict:
        """Create a new team"""
        try:
            team_id = str(uuid.uuid4())
            team = Team(
                id=team_id,
                name=data['name'],
                description=data.get('description', ''),
                company_id=data['company_id'],
                venture_id=data.get('venture_id'),
                team_lead_id=data.get('team_lead_id'),
                members=data.get('members', []),
                skills=data.get('skills', []),
                status=data.get('status', 'ACTIVE'),
                visibility=data.get('visibility', 'PRIVATE')
            )
            
            # Save to database
            self.db.execute_query(
                """
                INSERT INTO teams (id, name, description, company_id, venture_id, 
                                 team_lead_id, members, skills, status, visibility, 
                                 created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (team.id, team.name, team.description, team.company_id, team.venture_id,
                 team.team_lead_id, json.dumps(team.members), json.dumps(team.skills),
                 team.status, team.visibility, team.created_at, team.updated_at)
            )
            
            return {
                'success': True,
                'data': asdict(team),
                'message': 'Team created successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error creating team: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create team'
            }
    
    def get_team(self, team_id: str) -> Dict:
        """Get team by ID"""
        try:
            result = self.db.execute_query(
                "SELECT * FROM teams WHERE id = %s",
                (team_id,)
            )
            
            if not result:
                return {
                    'success': False,
                    'error': 'Team not found',
                    'message': 'Team with this ID does not exist'
                }
            
            team_data = result[0]
            team_data['members'] = json.loads(team_data.get('members', '[]'))
            team_data['skills'] = json.loads(team_data.get('skills', '[]'))
            
            return {
                'success': True,
                'data': team_data,
                'message': 'Team retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting team: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get team'
            }
    
    def update_team(self, team_id: str, data: Dict) -> Dict:
        """Update team"""
        try:
            # Get existing team
            existing = self.get_team(team_id)
            if not existing['success']:
                return existing
            
            # Update fields
            update_fields = []
            values = []
            
            for field in ['name', 'description', 'venture_id', 'team_lead_id', 'status', 'visibility']:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    values.append(data[field])
            
            if 'members' in data:
                update_fields.append("members = %s")
                values.append(json.dumps(data['members']))
            
            if 'skills' in data:
                update_fields.append("skills = %s")
                values.append(json.dumps(data['skills']))
            
            if not update_fields:
                return {
                    'success': False,
                    'error': 'No fields to update',
                    'message': 'No valid fields provided for update'
                }
            
            update_fields.append("updated_at = %s")
            values.append(datetime.utcnow().isoformat())
            values.append(team_id)
            
            query = f"UPDATE teams SET {', '.join(update_fields)} WHERE id = %s"
            self.db.execute_query(query, values)
            
            # Return updated team
            return self.get_team(team_id)
            
        except Exception as e:
            self.logger.error(f"Error updating team: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update team'
            }
    
    def delete_team(self, team_id: str) -> Dict:
        """Delete team (soft delete)"""
        try:
            self.db.execute_query(
                "UPDATE teams SET status = 'DELETED', updated_at = %s WHERE id = %s",
                (datetime.utcnow().isoformat(), team_id)
            )
            
            return {
                'success': True,
                'message': 'Team deleted successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error deleting team: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to delete team'
            }
    
    def add_team_member(self, team_id: str, user_id: str, role: str, permissions: List[str] = None) -> Dict:
        """Add member to team"""
        try:
            team = self.get_team(team_id)
            if not team['success']:
                return team
            
            # Check if user is already a member
            members = team['data']['members']
            if any(member['user_id'] == user_id for member in members):
                return {
                    'success': False,
                    'error': 'User already a member',
                    'message': 'User is already a member of this team'
                }
            
            # Add new member
            new_member = TeamMember(
                user_id=user_id,
                role=role,
                permissions=permissions or ['READ'],
                joined_at=datetime.utcnow().isoformat()
            )
            
            members.append(asdict(new_member))
            
            # Update team
            return self.update_team(team_id, {'members': members})
            
        except Exception as e:
            self.logger.error(f"Error adding team member: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to add team member'
            }
    
    def remove_team_member(self, team_id: str, user_id: str) -> Dict:
        """Remove member from team"""
        try:
            team = self.get_team(team_id)
            if not team['success']:
                return team
            
            # Remove member
            members = team['data']['members']
            members = [member for member in members if member['user_id'] != user_id]
            
            # Update team
            return self.update_team(team_id, {'members': members})
            
        except Exception as e:
            self.logger.error(f"Error removing team member: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to remove team member'
            }
    
    def list_teams(self, filters: Dict = None) -> Dict:
        """List teams with optional filters"""
        try:
            query = "SELECT * FROM teams WHERE status != 'DELETED'"
            values = []
            
            if filters:
                if 'company_id' in filters:
                    query += " AND company_id = %s"
                    values.append(filters['company_id'])
                
                if 'venture_id' in filters:
                    query += " AND venture_id = %s"
                    values.append(filters['venture_id'])
                
                if 'team_lead_id' in filters:
                    query += " AND team_lead_id = %s"
                    values.append(filters['team_lead_id'])
                
                if 'status' in filters:
                    query += " AND status = %s"
                    values.append(filters['status'])
            
            query += " ORDER BY created_at DESC"
            
            result = self.db.execute_query(query, values)
            
            # Parse JSON fields
            for team in result:
                team['members'] = json.loads(team.get('members', '[]'))
                team['skills'] = json.loads(team.get('skills', '[]'))
            
            return {
                'success': True,
                'data': result,
                'message': f'Found {len(result)} teams'
            }
            
        except Exception as e:
            self.logger.error(f"Error listing teams: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to list teams'
            }
    
    def get_user_teams(self, user_id: str) -> Dict:
        """Get all teams for a user"""
        try:
            query = """
                SELECT t.* FROM teams t
                WHERE t.status != 'DELETED'
                AND (
                    t.team_lead_id = %s
                    OR EXISTS (
                        SELECT 1 FROM jsonb_array_elements(t.members) AS member
                        WHERE member->>'user_id' = %s
                    )
                )
                ORDER BY t.created_at DESC
            """
            
            result = self.db.execute_query(query, (user_id, user_id))
            
            # Parse JSON fields
            for team in result:
                team['members'] = json.loads(team.get('members', '[]'))
                team['skills'] = json.loads(team.get('skills', '[]'))
            
            return {
                'success': True,
                'data': result,
                'message': f'Found {len(result)} teams for user'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting user teams: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get user teams'
            }
    
    def get_team_analytics(self, team_id: str) -> Dict:
        """Get team performance analytics"""
        try:
            team = self.get_team(team_id)
            if not team['success']:
                return team
            
            # Calculate team metrics
            members = team['data']['members']
            analytics = {
                'total_members': len(members),
                'active_members': len([m for m in members if m.get('status') == 'ACTIVE']),
                'roles': {},
                'skills_coverage': len(team['data']['skills']),
                'team_lead': team['data']['team_lead_id'],
                'created_at': team['data']['created_at'],
                'last_activity': team['data']['updated_at']
            }
            
            # Count roles
            for member in members:
                role = member.get('role', 'MEMBER')
                analytics['roles'][role] = analytics['roles'].get(role, 0) + 1
            
            return {
                'success': True,
                'data': {
                    'team_id': team_id,
                    'analytics': analytics
                },
                'message': 'Team analytics retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting team analytics: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get team analytics'
            }
