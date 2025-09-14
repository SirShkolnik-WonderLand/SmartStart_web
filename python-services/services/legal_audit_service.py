"""
SmartStart Legal Audit Service
Complete legal audit system with immutable records and timestamps
"""

import logging
import hashlib
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import sys
import os

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from .nodejs_connector import NodeJSConnector
except ImportError:
    # Fallback for when NodeJSConnector is not available
    class NodeJSConnector:
        def __init__(self):
            pass
        def query(self, sql, params=None):
            return []
        def execute(self, sql, params=None):
            return False

logger = logging.getLogger(__name__)

class LegalAuditService:
    def __init__(self, nodejs_connector=None):
        self.connector = nodejs_connector or NodeJSConnector()
        logger.info("⚖️ Legal Audit Service initialized")
    
    def create_legal_record(self, user_id: str, document_id: str, action: str, 
                          data: Dict[str, Any], ip_address: str = None, 
                          user_agent: str = None) -> Dict[str, Any]:
        """Create immutable legal record with full audit trail"""
        try:
            # Generate unique record ID
            record_id = self._generate_id()
            
            # Create immutable data hash
            immutable_data = {
                "user_id": user_id,
                "document_id": document_id,
                "action": action,
                "data": data,
                "timestamp": datetime.now().isoformat(),
                "ip_address": ip_address,
                "user_agent": user_agent,
                "record_id": record_id
            }
            
            # Create SHA-256 hash of immutable data
            data_hash = self._create_data_hash(immutable_data)
            
            # Store in LegalAuditLog table
            insert_query = """
            INSERT INTO "LegalAuditLog" (
                id, "userId", "documentId", action, data, "dataHash",
                "ipAddress", "userAgent", "timestamp", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            success = self.connector.execute(insert_query, [
                record_id,
                user_id,
                document_id,
                action,
                json.dumps(immutable_data),
                data_hash,
                ip_address,
                user_agent,
                datetime.now(),
                datetime.now(),
                datetime.now()
            ])
            
            if success:
                # Also store in LegalDocumentSignature for signature records
                if action == "SIGN":
                    self._create_signature_record(user_id, document_id, data, data_hash, ip_address, user_agent)
                
                return {
                    "success": True,
                    "record_id": record_id,
                    "data_hash": data_hash,
                    "timestamp": immutable_data["timestamp"],
                    "message": "Legal record created successfully"
                }
            else:
                return {"success": False, "error": "Failed to create legal record"}
                
        except Exception as e:
            logger.error(f"Error creating legal record: {e}")
            return {"success": False, "error": str(e)}
    
    def sign_legal_document(self, user_id: str, document_id: str, signature_data: Dict[str, Any],
                          ip_address: str = None, user_agent: str = None) -> Dict[str, Any]:
        """Sign legal document with complete audit trail"""
        try:
            # Get document template
            doc_query = """
            SELECT id, name, type, content, "rbacLevel", "isRequired"
            FROM "LegalDocumentTemplate"
            WHERE id = %s AND "isActive" = true
            """
            
            doc_result = self.connector.query(doc_query, [document_id])
            if not doc_result:
                return {"success": False, "error": "Document not found"}
            
            document = doc_result[0]
            
            # Create signature record with immutable data
            signature_record = {
                "user_id": user_id,
                "document_id": document_id,
                "document_name": document["name"],
                "document_type": document["type"],
                "signature_data": signature_data,
                "signature_timestamp": datetime.now().isoformat(),
                "ip_address": ip_address,
                "user_agent": user_agent,
                "document_content": document["content"],
                "rbac_level": document["rbacLevel"],
                "is_required": document["isRequired"]
            }
            
            # Create immutable signature hash
            signature_hash = self._create_signature_hash(signature_record)
            
            # Store signature record
            signature_id = self._generate_id()
            insert_query = """
            INSERT INTO "LegalDocumentSignature" (
                id, "userId", "documentId", "signatureData", "signatureHash",
                "signedAt", "ipAddress", "userAgent", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            success = self.connector.execute(insert_query, [
                signature_id,
                user_id,
                document_id,
                json.dumps(signature_record),
                signature_hash,
                datetime.now(),
                ip_address,
                user_agent,
                datetime.now(),
                datetime.now()
            ])
            
            if success:
                # Update compliance status
                self._update_compliance_status(user_id, document_id, "SIGNED")
                
                # Create audit record
                audit_result = self.create_legal_record(
                    user_id, document_id, "SIGN", signature_record, ip_address, user_agent
                )
                
                return {
                    "success": True,
                    "signature_id": signature_id,
                    "signature_hash": signature_hash,
                    "signed_at": signature_record["signature_timestamp"],
                    "document_name": document["name"],
                    "audit_record": audit_result
                }
            else:
                return {"success": False, "error": "Failed to create signature record"}
                
        except Exception as e:
            logger.error(f"Error signing legal document: {e}")
            return {"success": False, "error": str(e)}
    
    def get_legal_audit_trail(self, user_id: str = None, document_id: str = None, 
                            action: str = None, limit: int = 100) -> Dict[str, Any]:
        """Get complete legal audit trail"""
        try:
            where_conditions = []
            params = []
            
            if user_id:
                where_conditions.append('"userId" = %s')
                params.append(user_id)
            
            if document_id:
                where_conditions.append('"documentId" = %s')
                params.append(document_id)
            
            if action:
                where_conditions.append('action = %s')
                params.append(action)
            
            where_clause = ' AND '.join(where_conditions) if where_conditions else '1=1'
            
            query = f"""
            SELECT 
                id, "userId", "documentId", action, data, "dataHash",
                "ipAddress", "userAgent", timestamp, "createdAt"
            FROM "LegalAuditLog"
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT %s
            """
            
            params.append(limit)
            result = self.connector.query(query, params)
            
            # Process results to include parsed data
            audit_records = []
            for record in result:
                try:
                    parsed_data = json.loads(record['data']) if record['data'] else {}
                except:
                    parsed_data = {}
                
                audit_records.append({
                    "id": record['id'],
                    "user_id": record['userId'],
                    "document_id": record['documentId'],
                    "action": record['action'],
                    "data": parsed_data,
                    "data_hash": record['dataHash'],
                    "ip_address": record['ipAddress'],
                    "user_agent": record['userAgent'],
                    "timestamp": record['timestamp'].isoformat() if record['timestamp'] else None,
                    "created_at": record['createdAt'].isoformat() if record['createdAt'] else None
                })
            
            return {
                "success": True,
                "data": audit_records,
                "total": len(audit_records)
            }
            
        except Exception as e:
            logger.error(f"Error getting legal audit trail: {e}")
            return {"success": False, "error": str(e)}
    
    def get_user_legal_history(self, user_id: str) -> Dict[str, Any]:
        """Get complete legal history for a user"""
        try:
            # Get all signatures
            signatures_query = """
            SELECT 
                lds.id, lds."documentId", lds."signatureData", lds."signatureHash",
                lds."signedAt", lds."ipAddress", lds."userAgent",
                ldt.name as document_name, ldt.type as document_type
            FROM "LegalDocumentSignature" lds
            JOIN "LegalDocumentTemplate" ldt ON lds."documentId" = ldt.id
            WHERE lds."userId" = %s
            ORDER BY lds."signedAt" DESC
            """
            
            signatures = self.connector.query(signatures_query, [user_id])
            
            # Get compliance status
            compliance_query = """
            SELECT 
                ldc."documentId", ldc.status, ldc."signedAt", ldc."expiresAt",
                ldt.name as document_name, ldt.type as document_type
            FROM "LegalDocumentCompliance" ldc
            JOIN "LegalDocumentTemplate" ldt ON ldc."documentId" = ldt.id
            WHERE ldc."userId" = %s
            ORDER BY ldc."signedAt" DESC
            """
            
            compliance = self.connector.query(compliance_query, [user_id])
            
            # Process signatures
            signature_records = []
            for sig in signatures:
                try:
                    signature_data = json.loads(sig['signatureData']) if sig['signatureData'] else {}
                except:
                    signature_data = {}
                
                signature_records.append({
                    "id": sig['id'],
                    "document_id": sig['documentId'],
                    "document_name": sig['document_name'],
                    "document_type": sig['document_type'],
                    "signature_data": signature_data,
                    "signature_hash": sig['signatureHash'],
                    "signed_at": sig['signedAt'].isoformat() if sig['signedAt'] else None,
                    "ip_address": sig['ipAddress'],
                    "user_agent": sig['userAgent']
                })
            
            # Process compliance
            compliance_records = []
            for comp in compliance:
                compliance_records.append({
                    "document_id": comp['documentId'],
                    "document_name": comp['document_name'],
                    "document_type": comp['document_type'],
                    "status": comp['status'],
                    "signed_at": comp['signedAt'].isoformat() if comp['signedAt'] else None,
                    "expires_at": comp['expiresAt'].isoformat() if comp['expiresAt'] else None
                })
            
            return {
                "success": True,
                "data": {
                    "signatures": signature_records,
                    "compliance": compliance_records,
                    "total_signatures": len(signature_records),
                    "total_compliance": len(compliance_records)
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting user legal history: {e}")
            return {"success": False, "error": str(e)}
    
    def verify_legal_record(self, record_id: str) -> Dict[str, Any]:
        """Verify legal record integrity using hash"""
        try:
            query = """
            SELECT id, data, "dataHash", "createdAt"
            FROM "LegalAuditLog"
            WHERE id = %s
            """
            
            result = self.connector.query(query, [record_id])
            if not result:
                return {"success": False, "error": "Record not found"}
            
            record = result[0]
            
            # Verify hash
            try:
                parsed_data = json.loads(record['data']) if record['data'] else {}
                computed_hash = self._create_data_hash(parsed_data)
                is_valid = computed_hash == record['dataHash']
            except:
                is_valid = False
            
            return {
                "success": True,
                "data": {
                    "record_id": record['id'],
                    "is_valid": is_valid,
                    "stored_hash": record['dataHash'],
                    "computed_hash": computed_hash if 'computed_hash' in locals() else None,
                    "created_at": record['createdAt'].isoformat() if record['createdAt'] else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error verifying legal record: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_legal_report(self, user_id: str, report_type: str = "FULL") -> Dict[str, Any]:
        """Generate comprehensive legal report for printing"""
        try:
            # Get user legal history
            history = self.get_user_legal_history(user_id)
            if not history['success']:
                return history
            
            # Get user info
            user_query = """
            SELECT u.id, u.email, u.name, u."createdAt", r.name as role_name
            FROM "User" u
            LEFT JOIN "Role" r ON u.role = r.name
            WHERE u.id = %s
            """
            
            user_result = self.connector.query(user_query, [user_id])
            if not user_result:
                return {"success": False, "error": "User not found"}
            
            user_info = user_result[0]
            
            # Generate report data
            report_data = {
                "user_info": {
                    "id": user_info['id'],
                    "email": user_info['email'],
                    "name": user_info['name'],
                    "role": user_info['role_name'],
                    "member_since": user_info['createdAt'].isoformat() if user_info['createdAt'] else None
                },
                "legal_history": history['data'],
                "report_generated_at": datetime.now().isoformat(),
                "report_type": report_type,
                "total_legal_actions": len(history['data']['signatures']) + len(history['data']['compliance'])
            }
            
            # Create report hash for integrity
            report_hash = self._create_data_hash(report_data)
            
            return {
                "success": True,
                "data": report_data,
                "report_hash": report_hash,
                "print_ready": True
            }
            
        except Exception as e:
            logger.error(f"Error generating legal report: {e}")
            return {"success": False, "error": str(e)}
    
    def _create_data_hash(self, data: Dict[str, Any]) -> str:
        """Create SHA-256 hash of data for integrity verification"""
        data_string = json.dumps(data, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def _create_signature_hash(self, signature_data: Dict[str, Any]) -> str:
        """Create SHA-256 hash of signature data"""
        return self._create_data_hash(signature_data)
    
    def _create_signature_record(self, user_id: str, document_id: str, 
                               signature_data: Dict[str, Any], data_hash: str,
                               ip_address: str, user_agent: str):
        """Create signature record (internal method)"""
        try:
            signature_id = self._generate_id()
            insert_query = """
            INSERT INTO "LegalDocumentSignature" (
                id, "userId", "documentId", "signatureData", "signatureHash",
                "signedAt", "ipAddress", "userAgent", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            self.connector.execute(insert_query, [
                signature_id,
                user_id,
                document_id,
                json.dumps(signature_data),
                data_hash,
                datetime.now(),
                ip_address,
                user_agent,
                datetime.now(),
                datetime.now()
            ])
        except Exception as e:
            logger.error(f"Error creating signature record: {e}")
    
    def _update_compliance_status(self, user_id: str, document_id: str, status: str):
        """Update compliance status (internal method)"""
        try:
            # Check if compliance record exists
            existing_query = """
            SELECT id FROM "LegalDocumentCompliance"
            WHERE "userId" = %s AND "documentId" = %s
            """
            
            existing = self.connector.query(existing_query, [user_id, document_id])
            
            if existing:
                # Update existing record
                update_query = """
                UPDATE "LegalDocumentCompliance"
                SET status = %s, "signedAt" = %s, "updatedAt" = %s
                WHERE "userId" = %s AND "documentId" = %s
                """
                
                self.connector.execute(update_query, [
                    status,
                    datetime.now(),
                    datetime.now(),
                    user_id,
                    document_id
                ])
            else:
                # Create new record
                compliance_id = self._generate_id()
                insert_query = """
                INSERT INTO "LegalDocumentCompliance" (
                    id, "userId", "documentId", status, "signedAt",
                    "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                
                self.connector.execute(insert_query, [
                    compliance_id,
                    user_id,
                    document_id,
                    status,
                    datetime.now(),
                    datetime.now(),
                    datetime.now()
                ])
        except Exception as e:
            logger.error(f"Error updating compliance status: {e}")
    
    def _generate_id(self) -> str:
        """Generate a unique ID (cuid-like)"""
        import time
        import random
        import string
        
        timestamp = str(int(time.time() * 1000))
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"cm{timestamp[-8:]}{random_part}"
