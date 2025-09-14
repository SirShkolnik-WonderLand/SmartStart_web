#!/usr/bin/env python3
"""
Project Management Service
Handles all project-related operations with full CRUD and task management
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from flask import request, jsonify
import logging

@dataclass
class Project:
    id: str
    name: str
    description: str
    company_id: str
    venture_id: Optional[str] = None
    team_id: Optional[str] = None
    project_lead_id: str = None
    status: str = 'PLANNING'
    priority: str = 'MEDIUM'
    start_date: str = None
    end_date: str = None
    budget: float = 0.0
    progress: float = 0.0
    tasks: List[Dict] = None
    milestones: List[Dict] = None
    resources: List[Dict] = None
    created_at: str = None
    updated_at: str = None

    def __post_init__(self):
        if self.tasks is None:
            self.tasks = []
        if self.milestones is None:
            self.milestones = []
        if self.resources is None:
            self.resources = []
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow().isoformat()

@dataclass
class Task:
    id: str
    title: str
    description: str
    assignee_id: str
    status: str = 'TODO'
    priority: str = 'MEDIUM'
    due_date: str = None
    estimated_hours: float = 0.0
    actual_hours: float = 0.0
    tags: List[str] = None
    created_at: str = None
    updated_at: str = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow().isoformat()

class ProjectService:
    def __init__(self, db_connector):
        self.db = db_connector
        self.logger = logging.getLogger(__name__)
        
    def create_project(self, data: Dict) -> Dict:
        """Create a new project"""
        try:
            project_id = str(uuid.uuid4())
            project = Project(
                id=project_id,
                name=data['name'],
                description=data.get('description', ''),
                company_id=data['company_id'],
                venture_id=data.get('venture_id'),
                team_id=data.get('team_id'),
                project_lead_id=data.get('project_lead_id'),
                status=data.get('status', 'PLANNING'),
                priority=data.get('priority', 'MEDIUM'),
                start_date=data.get('start_date'),
                end_date=data.get('end_date'),
                budget=data.get('budget', 0.0),
                progress=data.get('progress', 0.0),
                tasks=data.get('tasks', []),
                milestones=data.get('milestones', []),
                resources=data.get('resources', [])
            )
            
            # Save to database
            self.db.execute_query(
                """
                INSERT INTO projects (id, name, description, company_id, venture_id, team_id,
                                    project_lead_id, status, priority, start_date, end_date,
                                    budget, progress, tasks, milestones, resources,
                                    created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (project.id, project.name, project.description, project.company_id,
                 project.venture_id, project.team_id, project.project_lead_id,
                 project.status, project.priority, project.start_date, project.end_date,
                 project.budget, project.progress, json.dumps(project.tasks),
                 json.dumps(project.milestones), json.dumps(project.resources),
                 project.created_at, project.updated_at)
            )
            
            return {
                'success': True,
                'data': asdict(project),
                'message': 'Project created successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error creating project: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create project'
            }
    
    def get_project(self, project_id: str) -> Dict:
        """Get project by ID"""
        try:
            result = self.db.execute_query(
                "SELECT * FROM projects WHERE id = %s",
                (project_id,)
            )
            
            if not result:
                return {
                    'success': False,
                    'error': 'Project not found',
                    'message': 'Project with this ID does not exist'
                }
            
            project_data = result[0]
            project_data['tasks'] = json.loads(project_data.get('tasks', '[]'))
            project_data['milestones'] = json.loads(project_data.get('milestones', '[]'))
            project_data['resources'] = json.loads(project_data.get('resources', '[]'))
            
            return {
                'success': True,
                'data': project_data,
                'message': 'Project retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting project: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get project'
            }
    
    def update_project(self, project_id: str, data: Dict) -> Dict:
        """Update project"""
        try:
            # Get existing project
            existing = self.get_project(project_id)
            if not existing['success']:
                return existing
            
            # Update fields
            update_fields = []
            values = []
            
            for field in ['name', 'description', 'venture_id', 'team_id', 'project_lead_id',
                         'status', 'priority', 'start_date', 'end_date', 'budget', 'progress']:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    values.append(data[field])
            
            if 'tasks' in data:
                update_fields.append("tasks = %s")
                values.append(json.dumps(data['tasks']))
            
            if 'milestones' in data:
                update_fields.append("milestones = %s")
                values.append(json.dumps(data['milestones']))
            
            if 'resources' in data:
                update_fields.append("resources = %s")
                values.append(json.dumps(data['resources']))
            
            if not update_fields:
                return {
                    'success': False,
                    'error': 'No fields to update',
                    'message': 'No valid fields provided for update'
                }
            
            update_fields.append("updated_at = %s")
            values.append(datetime.utcnow().isoformat())
            values.append(project_id)
            
            query = f"UPDATE projects SET {', '.join(update_fields)} WHERE id = %s"
            self.db.execute_query(query, values)
            
            # Return updated project
            return self.get_project(project_id)
            
        except Exception as e:
            self.logger.error(f"Error updating project: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update project'
            }
    
    def delete_project(self, project_id: str) -> Dict:
        """Delete project (soft delete)"""
        try:
            self.db.execute_query(
                "UPDATE projects SET status = 'DELETED', updated_at = %s WHERE id = %s",
                (datetime.utcnow().isoformat(), project_id)
            )
            
            return {
                'success': True,
                'message': 'Project deleted successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error deleting project: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to delete project'
            }
    
    def add_task(self, project_id: str, task_data: Dict) -> Dict:
        """Add task to project"""
        try:
            project = self.get_project(project_id)
            if not project['success']:
                return project
            
            task_id = str(uuid.uuid4())
            task = Task(
                id=task_id,
                title=task_data['title'],
                description=task_data.get('description', ''),
                assignee_id=task_data['assignee_id'],
                status=task_data.get('status', 'TODO'),
                priority=task_data.get('priority', 'MEDIUM'),
                due_date=task_data.get('due_date'),
                estimated_hours=task_data.get('estimated_hours', 0.0),
                actual_hours=task_data.get('actual_hours', 0.0),
                tags=task_data.get('tags', [])
            )
            
            # Add task to project
            tasks = project['data']['tasks']
            tasks.append(asdict(task))
            
            # Update project
            return self.update_project(project_id, {'tasks': tasks})
            
        except Exception as e:
            self.logger.error(f"Error adding task: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to add task'
            }
    
    def update_task(self, project_id: str, task_id: str, task_data: Dict) -> Dict:
        """Update task in project"""
        try:
            project = self.get_project(project_id)
            if not project['success']:
                return project
            
            # Find and update task
            tasks = project['data']['tasks']
            for i, task in enumerate(tasks):
                if task['id'] == task_id:
                    task.update(task_data)
                    task['updated_at'] = datetime.utcnow().isoformat()
                    tasks[i] = task
                    break
            else:
                return {
                    'success': False,
                    'error': 'Task not found',
                    'message': 'Task with this ID does not exist in project'
                }
            
            # Update project
            return self.update_project(project_id, {'tasks': tasks})
            
        except Exception as e:
            self.logger.error(f"Error updating task: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update task'
            }
    
    def list_projects(self, filters: Dict = None) -> Dict:
        """List projects with optional filters"""
        try:
            query = "SELECT * FROM projects WHERE status != 'DELETED'"
            values = []
            
            if filters:
                if 'company_id' in filters:
                    query += " AND company_id = %s"
                    values.append(filters['company_id'])
                
                if 'venture_id' in filters:
                    query += " AND venture_id = %s"
                    values.append(filters['venture_id'])
                
                if 'team_id' in filters:
                    query += " AND team_id = %s"
                    values.append(filters['team_id'])
                
                if 'project_lead_id' in filters:
                    query += " AND project_lead_id = %s"
                    values.append(filters['project_lead_id'])
                
                if 'status' in filters:
                    query += " AND status = %s"
                    values.append(filters['status'])
            
            query += " ORDER BY created_at DESC"
            
            result = self.db.execute_query(query, values)
            
            # Parse JSON fields
            for project in result:
                project['tasks'] = json.loads(project.get('tasks', '[]'))
                project['milestones'] = json.loads(project.get('milestones', '[]'))
                project['resources'] = json.loads(project.get('resources', '[]'))
            
            return {
                'success': True,
                'data': result,
                'message': f'Found {len(result)} projects'
            }
            
        except Exception as e:
            self.logger.error(f"Error listing projects: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to list projects'
            }
    
    def get_project_analytics(self, project_id: str) -> Dict:
        """Get project performance analytics"""
        try:
            project = self.get_project(project_id)
            if not project['success']:
                return project
            
            tasks = project['data']['tasks']
            milestones = project['data']['milestones']
            
            # Calculate analytics
            analytics = {
                'total_tasks': len(tasks),
                'completed_tasks': len([t for t in tasks if t.get('status') == 'COMPLETED']),
                'in_progress_tasks': len([t for t in tasks if t.get('status') == 'IN_PROGRESS']),
                'todo_tasks': len([t for t in tasks if t.get('status') == 'TODO']),
                'total_milestones': len(milestones),
                'completed_milestones': len([m for m in milestones if m.get('status') == 'COMPLETED']),
                'progress_percentage': project['data']['progress'],
                'budget_used': sum(t.get('actual_hours', 0) * 50 for t in tasks),  # Assuming $50/hour
                'budget_remaining': project['data']['budget'] - sum(t.get('actual_hours', 0) * 50 for t in tasks),
                'estimated_completion': project['data']['end_date'],
                'overdue_tasks': len([t for t in tasks if t.get('due_date') and t.get('status') != 'COMPLETED' and t.get('due_date') < datetime.utcnow().isoformat()])
            }
            
            return {
                'success': True,
                'data': {
                    'project_id': project_id,
                    'analytics': analytics
                },
                'message': 'Project analytics retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting project analytics: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get project analytics'
            }
