#!/usr/bin/env python3
"""
Company Management Service
Handles all company-related operations with full CRUD and business logic
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from flask import request, jsonify
import logging

@dataclass
class Company:
    id: str
    name: str
    description: str
    industry: str
    size: str
    stage: str
    status: str
    visibility: str
    founded_date: str
    website: Optional[str] = None
    logo: Optional[str] = None
    headquarters: Optional[str] = None
    tags: List[str] = None
    metrics: List[Dict] = None
    documents: List[Dict] = None
    created_at: str = None
    updated_at: str = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.metrics is None:
            self.metrics = []
        if self.documents is None:
            self.documents = []
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow().isoformat()

class CompanyService:
    def __init__(self, db_connector):
        self.db = db_connector
        self.logger = logging.getLogger(__name__)
        
    def create_company(self, data: Dict) -> Dict:
        """Create a new company"""
        try:
            company_id = str(uuid.uuid4())
            company = Company(
                id=company_id,
                name=data['name'],
                description=data.get('description', ''),
                industry=data.get('industry', 'Technology'),
                size=data.get('size', 'Startup'),
                stage=data.get('stage', 'Idea'),
                status=data.get('status', 'ACTIVE'),
                visibility=data.get('visibility', 'PRIVATE'),
                founded_date=data.get('founded_date', datetime.utcnow().isoformat()),
                website=data.get('website'),
                logo=data.get('logo'),
                headquarters=data.get('headquarters'),
                tags=data.get('tags', []),
                metrics=data.get('metrics', []),
                documents=data.get('documents', [])
            )
            
            # Save to database
            self.db.execute_query(
                """
                INSERT INTO companies (id, name, description, industry, size, stage, status, 
                                     visibility, founded_date, website, logo, headquarters, 
                                     tags, metrics, documents, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (company.id, company.name, company.description, company.industry,
                 company.size, company.stage, company.status, company.visibility,
                 company.founded_date, company.website, company.logo, company.headquarters,
                 json.dumps(company.tags), json.dumps(company.metrics), 
                 json.dumps(company.documents), company.created_at, company.updated_at)
            )
            
            return {
                'success': True,
                'data': asdict(company),
                'message': 'Company created successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error creating company: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create company'
            }
    
    def get_company(self, company_id: str) -> Dict:
        """Get company by ID"""
        try:
            result = self.db.execute_query(
                "SELECT * FROM companies WHERE id = %s",
                (company_id,)
            )
            
            if not result:
                return {
                    'success': False,
                    'error': 'Company not found',
                    'message': 'Company with this ID does not exist'
                }
            
            company_data = result[0]
            company_data['tags'] = json.loads(company_data.get('tags', '[]'))
            company_data['metrics'] = json.loads(company_data.get('metrics', '[]'))
            company_data['documents'] = json.loads(company_data.get('documents', '[]'))
            
            return {
                'success': True,
                'data': company_data,
                'message': 'Company retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting company: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get company'
            }
    
    def update_company(self, company_id: str, data: Dict) -> Dict:
        """Update company"""
        try:
            # Get existing company
            existing = self.get_company(company_id)
            if not existing['success']:
                return existing
            
            # Update fields
            update_fields = []
            values = []
            
            for field in ['name', 'description', 'industry', 'size', 'stage', 'status', 
                         'visibility', 'website', 'logo', 'headquarters']:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    values.append(data[field])
            
            if 'tags' in data:
                update_fields.append("tags = %s")
                values.append(json.dumps(data['tags']))
            
            if 'metrics' in data:
                update_fields.append("metrics = %s")
                values.append(json.dumps(data['metrics']))
            
            if 'documents' in data:
                update_fields.append("documents = %s")
                values.append(json.dumps(data['documents']))
            
            if not update_fields:
                return {
                    'success': False,
                    'error': 'No fields to update',
                    'message': 'No valid fields provided for update'
                }
            
            update_fields.append("updated_at = %s")
            values.append(datetime.utcnow().isoformat())
            values.append(company_id)
            
            query = f"UPDATE companies SET {', '.join(update_fields)} WHERE id = %s"
            self.db.execute_query(query, values)
            
            # Return updated company
            return self.get_company(company_id)
            
        except Exception as e:
            self.logger.error(f"Error updating company: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update company'
            }
    
    def delete_company(self, company_id: str) -> Dict:
        """Delete company (soft delete)"""
        try:
            self.db.execute_query(
                "UPDATE companies SET status = 'DELETED', updated_at = %s WHERE id = %s",
                (datetime.utcnow().isoformat(), company_id)
            )
            
            return {
                'success': True,
                'message': 'Company deleted successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error deleting company: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to delete company'
            }
    
    def list_companies(self, filters: Dict = None) -> Dict:
        """List companies with optional filters"""
        try:
            query = "SELECT * FROM companies WHERE status != 'DELETED'"
            values = []
            
            if filters:
                if 'industry' in filters:
                    query += " AND industry = %s"
                    values.append(filters['industry'])
                
                if 'stage' in filters:
                    query += " AND stage = %s"
                    values.append(filters['stage'])
                
                if 'size' in filters:
                    query += " AND size = %s"
                    values.append(filters['size'])
                
                if 'status' in filters:
                    query += " AND status = %s"
                    values.append(filters['status'])
            
            query += " ORDER BY created_at DESC"
            
            result = self.db.execute_query(query, values)
            
            # Parse JSON fields
            for company in result:
                company['tags'] = json.loads(company.get('tags', '[]'))
                company['metrics'] = json.loads(company.get('metrics', '[]'))
                company['documents'] = json.loads(company.get('documents', '[]'))
            
            return {
                'success': True,
                'data': result,
                'message': f'Found {len(result)} companies'
            }
            
        except Exception as e:
            self.logger.error(f"Error listing companies: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to list companies'
            }
    
    def search_companies(self, search_term: str) -> Dict:
        """Search companies by name or description"""
        try:
            query = """
                SELECT * FROM companies 
                WHERE status != 'DELETED' 
                AND (name ILIKE %s OR description ILIKE %s)
                ORDER BY created_at DESC
            """
            search_pattern = f"%{search_term}%"
            result = self.db.execute_query(query, (search_pattern, search_pattern))
            
            # Parse JSON fields
            for company in result:
                company['tags'] = json.loads(company.get('tags', '[]'))
                company['metrics'] = json.loads(company.get('metrics', '[]'))
                company['documents'] = json.loads(company.get('documents', '[]'))
            
            return {
                'success': True,
                'data': result,
                'message': f'Found {len(result)} companies matching "{search_term}"'
            }
            
        except Exception as e:
            self.logger.error(f"Error searching companies: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to search companies'
            }
    
    def get_company_metrics(self, company_id: str) -> Dict:
        """Get company performance metrics"""
        try:
            company = self.get_company(company_id)
            if not company['success']:
                return company
            
            # Calculate additional metrics
            metrics = {
                'total_ventures': 0,
                'active_ventures': 0,
                'total_funding': 0,
                'revenue': 0,
                'employees': 0,
                'growth_rate': 0
            }
            
            # Get venture data
            ventures = self.db.execute_query(
                "SELECT * FROM ventures WHERE company_id = %s",
                (company_id,)
            )
            
            metrics['total_ventures'] = len(ventures)
            metrics['active_ventures'] = len([v for v in ventures if v.get('status') == 'ACTIVE'])
            
            # Calculate total funding
            for venture in ventures:
                metrics['total_funding'] += venture.get('funding_goal', 0)
            
            return {
                'success': True,
                'data': {
                    'company_id': company_id,
                    'metrics': metrics,
                    'raw_metrics': company['data'].get('metrics', [])
                },
                'message': 'Company metrics retrieved successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error getting company metrics: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get company metrics'
            }
