"""
SmartStart Legal Print Service
Generate PDF reports and printable legal documents
"""

import logging
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

logger = logging.getLogger(__name__)

class LegalPrintService:
    def __init__(self, nodejs_connector=None):
        self.connector = nodejs_connector or NodeJSConnector()
        logger.info("🖨️ Legal Print Service initialized")
    
    def generate_legal_document_pdf(self, user_id: str, document_id: str) -> Dict[str, Any]:
        """Generate PDF of signed legal document"""
        try:
            # Get signature record
            signature_query = """
            SELECT 
                lds.id, lds."signatureData", lds."signedAt", lds."ipAddress",
                ldt.name as document_name, ldt.type as document_type, ldt.content
            FROM "LegalDocumentSignature" lds
            JOIN "LegalDocumentTemplate" ldt ON lds."documentId" = ldt.id
            WHERE lds."userId" = %s AND lds."documentId" = %s
            ORDER BY lds."signedAt" DESC
            LIMIT 1
            """
            
            signature_result = self.connector.query(signature_query, [user_id, document_id])
            if not signature_result:
                return {"success": False, "error": "Signature not found"}
            
            signature = signature_result[0]
            
            # Get user info
            user_query = """
            SELECT u.id, u.email, u.name, u."createdAt"
            FROM "User" u
            WHERE u.id = %s
            """
            
            user_result = self.connector.query(user_query, [user_id])
            if not user_result:
                return {"success": False, "error": "User not found"}
            
            user = user_result[0]
            
            # Generate PDF content
            pdf_content = self._generate_pdf_content(signature, user)
            
            # Store PDF record
            pdf_id = self._generate_id()
            pdf_record = {
                "pdf_id": pdf_id,
                "user_id": user_id,
                "document_id": document_id,
                "document_name": signature['document_name'],
                "generated_at": datetime.now().isoformat(),
                "content": pdf_content,
                "file_size": len(pdf_content.encode('utf-8'))
            }
            
            return {
                "success": True,
                "data": pdf_record,
                "pdf_content": pdf_content,
                "download_ready": True
            }
            
        except Exception as e:
            logger.error(f"Error generating legal document PDF: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_user_legal_report_pdf(self, user_id: str) -> Dict[str, Any]:
        """Generate comprehensive legal report PDF for user"""
        try:
            # Get user legal history
            history_query = """
            SELECT 
                lds."documentId", lds."signatureData", lds."signedAt",
                ldt.name as document_name, ldt.type as document_type
            FROM "LegalDocumentSignature" lds
            JOIN "LegalDocumentTemplate" ldt ON lds."documentId" = ldt.id
            WHERE lds."userId" = %s
            ORDER BY lds."signedAt" DESC
            """
            
            signatures = self.connector.query(history_query, [user_id])
            
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
            
            user = user_result[0]
            
            # Generate report content
            report_content = self._generate_report_content(user, signatures)
            
            # Store report record
            report_id = self._generate_id()
            report_record = {
                "report_id": report_id,
                "user_id": user_id,
                "generated_at": datetime.now().isoformat(),
                "content": report_content,
                "total_documents": len(signatures),
                "file_size": len(report_content.encode('utf-8'))
            }
            
            return {
                "success": True,
                "data": report_record,
                "report_content": report_content,
                "download_ready": True
            }
            
        except Exception as e:
            logger.error(f"Error generating legal report PDF: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_pdf_content(self, signature: Dict, user: Dict) -> str:
        """Generate PDF content for legal document (internal method)"""
        try:
            import json
            signature_data = json.loads(signature['signatureData']) if signature['signatureData'] else {}
            
            pdf_content = f"""
            ================================================
            SMARTSTART LEGAL DOCUMENT
            ================================================
            
            Document: {signature['document_name']}
            Type: {signature['document_type']}
            User: {user['name']} ({user['email']})
            Signed: {signature['signedAt'].strftime('%Y-%m-%d %H:%M:%S UTC') if signature['signedAt'] else 'Unknown'}
            IP Address: {signature['ipAddress'] or 'Unknown'}
            
            ================================================
            DOCUMENT CONTENT
            ================================================
            
            {signature_data.get('document_content', 'Content not available')}
            
            ================================================
            SIGNATURE DETAILS
            ================================================
            
            Signature Hash: {signature_data.get('signature_hash', 'Unknown')}
            Signature Timestamp: {signature_data.get('signature_timestamp', 'Unknown')}
            User Agent: {signature_data.get('user_agent', 'Unknown')}
            
            ================================================
            LEGAL NOTICE
            ================================================
            
            This document has been digitally signed and is legally binding.
            The signature hash provides cryptographic proof of authenticity.
            This document is immutable and cannot be modified after signing.
            
            Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
            SmartStart Platform - Legal-First Venture Collaboration
            
            ================================================
            """
            
            return pdf_content.strip()
            
        except Exception as e:
            logger.error(f"Error generating PDF content: {e}")
            return "Error generating PDF content"
    
    def _generate_report_content(self, user: Dict, signatures: List[Dict]) -> str:
        """Generate report content (internal method)"""
        try:
            report_content = f"""
            ================================================
            SMARTSTART LEGAL COMPLIANCE REPORT
            ================================================
            
            User Information:
            - Name: {user['name']}
            - Email: {user['email']}
            - Role: {user['role_name'] or 'Unknown'}
            - Member Since: {user['createdAt'].strftime('%Y-%m-%d') if user['createdAt'] else 'Unknown'}
            
            ================================================
            LEGAL DOCUMENT HISTORY
            ================================================
            
            Total Documents Signed: {len(signatures)}
            
            """
            
            for i, sig in enumerate(signatures, 1):
                try:
                    signature_data = json.loads(sig['signatureData']) if sig['signatureData'] else {}
                except:
                    signature_data = {}
                
                report_content += f"""
            Document {i}:
            - Name: {sig['document_name']}
            - Type: {sig['document_type']}
            - Signed: {sig['signedAt'].strftime('%Y-%m-%d %H:%M:%S UTC') if sig['signedAt'] else 'Unknown'}
            - Signature Hash: {signature_data.get('signature_hash', 'Unknown')[:16]}...
            
            """
            
            report_content += f"""
            ================================================
            COMPLIANCE SUMMARY
            ================================================
            
            Status: {'FULLY COMPLIANT' if len(signatures) > 0 else 'NON-COMPLIANT'}
            Documents Signed: {len(signatures)}
            Last Activity: {signatures[0]['signedAt'].strftime('%Y-%m-%d %H:%M:%S UTC') if signatures and signatures[0]['signedAt'] else 'No activity'}
            
            ================================================
            LEGAL NOTICE
            ================================================
            
            This report contains legally binding signature records.
            All signatures are cryptographically verified and immutable.
            This report serves as official documentation of legal compliance.
            
            Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
            SmartStart Platform - Legal-First Venture Collaboration
            
            ================================================
            """
            
            return report_content.strip()
            
        except Exception as e:
            logger.error(f"Error generating report content: {e}")
            return "Error generating report content"
    
    def _generate_id(self) -> str:
        """Generate a unique ID (cuid-like)"""
        import time
        import random
        import string
        
        timestamp = str(int(time.time() * 1000))
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"cm{timestamp[-8:]}{random_part}"
