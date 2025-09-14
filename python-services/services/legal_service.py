"""
SmartStart Legal Service
Complete legal document management with existing database integration
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
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

class LegalService:
    def __init__(self):
        self.connector = NodeJSConnector()
        logger.info("⚖️ Legal Service initialized")
    
    def get_legal_documents_for_user(self, user_id: str) -> Dict[str, Any]:
        """Get all legal documents required for user based on their RBAC level"""
        try:
            # Get user's role
            user_query = """
            SELECT u.role, r.level
            FROM "User" u
            LEFT JOIN "Role" r ON u.role = r.name
            WHERE u.id = %s
            """
            
            user_result = self.connector.query(user_query, [user_id])
            if not user_result:
                return {"success": False, "error": "User not found"}
            
            user_role = user_result[0]['role']
            user_level = user_result[0]['level'] or 0
            
            # Get legal document templates based on user level
            templates_query = """
            SELECT 
                id, name, type, content, "rbacLevel", "isRequired", 
                "enforcementMechanisms", "liquidatedDamages", "survivalPeriod"
            FROM "LegalDocumentTemplate"
            WHERE "isActive" = true AND "rbacLevel" <= %s
            ORDER BY "rbacLevel", name
            """
            
            templates = self.connector.query(templates_query, [user_level])
            
            # Get user's signed documents
            signed_query = """
            SELECT 
                ldc."documentId",
                ldc.status,
                ldc."signedAt",
                ldc."expiresAt",
                ldt.name,
                ldt.type
            FROM "LegalDocumentCompliance" ldc
            JOIN "LegalDocumentTemplate" ldt ON ldc."documentId" = ldt.id
            WHERE ldc."userId" = %s
            """
            
            signed_docs = self.connector.query(signed_query, [user_id])
            signed_doc_map = {doc['documentId']: doc for doc in signed_docs}
            
            # Process templates with compliance status
            documents = []
            for template in templates:
                doc_id = template['id']
                signed_info = signed_doc_map.get(doc_id)
                
                documents.append({
                    'id': doc_id,
                    'name': template['name'],
                    'type': template['type'],
                    'content': template['content'],
                    'rbac_level': template['rbacLevel'],
                    'is_required': template['isRequired'],
                    'enforcement_mechanisms': template['enforcementMechanisms'],
                    'liquidated_damages': template['liquidatedDamages'],
                    'survival_period': template['survivalPeriod'],
                    'compliance_status': signed_info['status'] if signed_info else 'NOT_SIGNED',
                    'signed_at': signed_info['signedAt'] if signed_info else None,
                    'expires_at': signed_info['expiresAt'] if signed_info else None
                })
            
            return {
                "success": True,
                "data": {
                    "user_role": user_role,
                    "user_level": user_level,
                    "documents": documents,
                    "total_required": len([d for d in documents if d['is_required']]),
                    "total_signed": len([d for d in documents if d['compliance_status'] == 'SIGNED'])
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting legal documents for user: {e}")
            return {"success": False, "error": str(e)}
    
    def sign_legal_document(self, user_id: str, document_id: str, signature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sign a legal document"""
        try:
            # Verify document exists and is required for user
            doc_query = """
            SELECT ldt.id, ldt.name, ldt."isRequired", ldt."rbacLevel"
            FROM "LegalDocumentTemplate" ldt
            WHERE ldt.id = %s AND ldt."isActive" = true
            """
            
            doc_result = self.connector.query(doc_query, [document_id])
            if not doc_result:
                return {"success": False, "error": "Document not found"}
            
            document = doc_result[0]
            
            # Check if user has required RBAC level
            user_level_query = """
            SELECT r.level
            FROM "User" u
            LEFT JOIN "Role" r ON u.role = r.name
            WHERE u.id = %s
            """
            
            user_level_result = self.connector.query(user_level_query, [user_id])
            if not user_level_result:
                return {"success": False, "error": "User not found"}
            
            user_level = user_level_result[0]['level'] or 0
            if user_level < document['rbacLevel']:
                return {"success": False, "error": "Insufficient RBAC level"}
            
            # Check if already signed
            existing_query = """
            SELECT id, status
            FROM "LegalDocumentCompliance"
            WHERE "userId" = %s AND "documentId" = %s
            """
            
            existing = self.connector.query(existing_query, [user_id, document_id])
            
            if existing and existing[0]['status'] == 'SIGNED':
                return {"success": False, "error": "Document already signed"}
            
            # Create or update compliance record
            if existing:
                update_query = """
                UPDATE "LegalDocumentCompliance"
                SET status = %s, "signedAt" = %s, "expiresAt" = %s, "updatedAt" = %s
                WHERE "userId" = %s AND "documentId" = %s
                """
                
                expires_at = datetime.now() + timedelta(days=365 * 5)  # 5 years
                self.connector.query(update_query, [
                    'SIGNED',
                    datetime.now(),
                    expires_at,
                    datetime.now(),
                    user_id,
                    document_id
                ])
            else:
                insert_query = """
                INSERT INTO "LegalDocumentCompliance" (
                    id, "userId", "documentId", status, "signedAt", "expiresAt", 
                    "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                compliance_id = self._generate_id()
                expires_at = datetime.now() + timedelta(days=365 * 5)  # 5 years
                
                self.connector.query(insert_query, [
                    compliance_id,
                    user_id,
                    document_id,
                    'SIGNED',
                    datetime.now(),
                    expires_at,
                    datetime.now(),
                    datetime.now()
                ])
            
            return {
                "success": True,
                "message": f"Document '{document['name']}' signed successfully",
                "signed_at": datetime.now().isoformat(),
                "expires_at": expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error signing legal document: {e}")
            return {"success": False, "error": str(e)}
    
    def check_user_legal_compliance(self, user_id: str) -> Dict[str, Any]:
        """Check user's legal compliance status"""
        try:
            # Get user's required documents
            user_docs = self.get_legal_documents_for_user(user_id)
            if not user_docs['success']:
                return user_docs
            
            documents = user_docs['data']['documents']
            required_docs = [d for d in documents if d['is_required']]
            signed_docs = [d for d in required_docs if d['compliance_status'] == 'SIGNED']
            
            compliance_percentage = (len(signed_docs) / len(required_docs) * 100) if required_docs else 100
            
            # Check for expired documents
            expired_docs = []
            for doc in signed_docs:
                if doc['expires_at'] and datetime.fromisoformat(doc['expires_at']) < datetime.now():
                    expired_docs.append(doc)
            
            # Determine compliance status
            if len(signed_docs) == len(required_docs) and not expired_docs:
                compliance_status = 'FULLY_COMPLIANT'
            elif len(signed_docs) > 0:
                compliance_status = 'PARTIALLY_COMPLIANT'
            else:
                compliance_status = 'NON_COMPLIANT'
            
            return {
                "success": True,
                "data": {
                    "compliance_status": compliance_status,
                    "compliance_percentage": compliance_percentage,
                    "total_required": len(required_docs),
                    "total_signed": len(signed_docs),
                    "expired_documents": expired_docs,
                    "missing_documents": [d for d in required_docs if d['compliance_status'] != 'SIGNED']
                }
            }
            
        except Exception as e:
            logger.error(f"Error checking legal compliance: {e}")
            return {"success": False, "error": str(e)}
    
    def get_legal_document_template(self, document_id: str) -> Dict[str, Any]:
        """Get legal document template by ID"""
        try:
            query = """
            SELECT 
                id, name, type, content, "rbacLevel", "isRequired", 
                "enforcementMechanisms", "liquidatedDamages", "survivalPeriod"
            FROM "LegalDocumentTemplate"
            WHERE id = %s AND "isActive" = true
            """
            
            result = self.connector.query(query, [document_id])
            
            if result:
                template = result[0]
                return {
                    "success": True,
                    "data": {
                        "id": template['id'],
                        "name": template['name'],
                        "type": template['type'],
                        "content": template['content'],
                        "rbac_level": template['rbacLevel'],
                        "is_required": template['isRequired'],
                        "enforcement_mechanisms": template['enforcementMechanisms'],
                        "liquidated_damages": template['liquidatedDamages'],
                        "survival_period": template['survivalPeriod']
                    }
                }
            else:
                return {"success": False, "error": "Document template not found"}
                
        except Exception as e:
            logger.error(f"Error getting legal document template: {e}")
            return {"success": False, "error": str(e)}
    
    def get_all_legal_templates(self) -> Dict[str, Any]:
        """Get all legal document templates"""
        try:
            query = """
            SELECT 
                id, name, type, "rbacLevel", "isRequired", 
                "enforcementMechanisms", "liquidatedDamages", "survivalPeriod"
            FROM "LegalDocumentTemplate"
            WHERE "isActive" = true
            ORDER BY "rbacLevel", name
            """
            
            result = self.connector.query(query)
            
            templates = []
            for row in result:
                templates.append({
                    "id": row['id'],
                    "name": row['name'],
                    "type": row['type'],
                    "rbac_level": row['rbacLevel'],
                    "is_required": row['isRequired'],
                    "enforcement_mechanisms": row['enforcementMechanisms'],
                    "liquidated_damages": row['liquidatedDamages'],
                    "survival_period": row['survivalPeriod']
                })
            
            return {
                "success": True,
                "data": templates,
                "total": len(templates)
            }
            
        except Exception as e:
            logger.error(f"Error getting all legal templates: {e}")
            return {"success": False, "error": str(e)}
    
    def create_legal_document(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new legal document (admin only)"""
        try:
            # Validate required fields
            required_fields = ['name', 'type', 'content', 'rbacLevel']
            for field in required_fields:
                if field not in document_data:
                    return {"success": False, "error": f"Missing required field: {field}"}
            
            # Create document
            insert_query = """
            INSERT INTO "LegalDocumentTemplate" (
                id, name, type, content, "rbacLevel", "isRequired", 
                "enforcementMechanisms", "liquidatedDamages", "survivalPeriod",
                "isActive", "createdBy", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, name, type, "rbacLevel"
            """
            
            doc_id = self._generate_id()
            result = self.connector.query(insert_query, [
                doc_id,
                document_data['name'],
                document_data['type'],
                document_data['content'],
                document_data['rbacLevel'],
                document_data.get('isRequired', True),
                document_data.get('enforcementMechanisms', []),
                document_data.get('liquidatedDamages', 0),
                document_data.get('survivalPeriod', 5),
                True,
                document_data.get('createdBy', 'system'),
                datetime.now(),
                datetime.now()
            ])
            
            if result:
                return {
                    "success": True,
                    "message": "Legal document created successfully",
                    "data": result[0]
                }
            else:
                return {"success": False, "error": "Failed to create document"}
                
        except Exception as e:
            logger.error(f"Error creating legal document: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_id(self) -> str:
        """Generate a unique ID (cuid-like)"""
        import time
        import random
        import string
        
        timestamp = str(int(time.time() * 1000))
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"cm{timestamp[-8:]}{random_part}"