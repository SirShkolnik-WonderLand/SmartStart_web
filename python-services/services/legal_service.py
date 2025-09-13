#!/usr/bin/env python3
"""
SmartStart Legal Service - All legal business logic moved from Node.js
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import hashlib
import secrets

logger = logging.getLogger(__name__)

class LegalService:
    """Legal service handling all legal document and compliance business logic"""
    
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        
    def create_legal_document(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new legal document with comprehensive validation"""
        try:
            # Validate required fields
            required_fields = ['title', 'type', 'content', 'created_by']
            for field in required_fields:
                if not document_data.get(field):
                    return {
                        'success': False,
                        'message': f'Missing required field: {field}',
                        'error_code': 'MISSING_FIELD'
                    }
            
            # Validate document type
            valid_types = ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'USER_AGREEMENT', 'VENTURE_AGREEMENT', 'TEAM_AGREEMENT']
            if document_data['type'] not in valid_types:
                return {
                    'success': False,
                    'message': f'Invalid document type. Must be one of: {", ".join(valid_types)}',
                    'error_code': 'INVALID_TYPE'
                }
            
            # Generate document ID
            document_id = self._generate_document_id()
            
            # Create document object
            new_document = {
                'id': document_id,
                'title': document_data['title'],
                'type': document_data['type'],
                'content': document_data['content'],
                'status': 'DRAFT',
                'version': document_data.get('version', '1.0'),
                'created_by': document_data['created_by'],
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'effective_date': document_data.get('effective_date'),
                'expiry_date': document_data.get('expiry_date'),
                'requires_signature': document_data.get('requires_signature', True),
                'is_platform_document': document_data.get('is_platform_document', False),
                'jurisdiction': document_data.get('jurisdiction', 'US'),
                'legal_entity_id': document_data.get('legal_entity_id'),
                'venture_id': document_data.get('venture_id'),
                'metadata': document_data.get('metadata', {})
            }
            
            # Save document (would typically save to database via Node.js connector)
            if self.nodejs_connector:
                result = self.nodejs_connector.create_legal_document(new_document)
                if not result:
                    return {
                        'success': False,
                        'message': 'Failed to save legal document',
                        'error_code': 'SAVE_ERROR'
                    }
            
            return {
                'success': True,
                'data': {
                    'document': new_document,
                    'message': 'Legal document created successfully'
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating legal document: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def sign_legal_document(self, user_id: str, document_id: str, signature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sign a legal document with comprehensive validation"""
        try:
            # Get document
            document = self._get_legal_document(document_id)
            if not document:
                return {
                    'success': False,
                    'message': 'Document not found',
                    'error_code': 'DOCUMENT_NOT_FOUND'
                }
            
            # Check if document requires signature
            if not document.get('requires_signature', True):
                return {
                    'success': False,
                    'message': 'Document does not require signature',
                    'error_code': 'SIGNATURE_NOT_REQUIRED'
                }
            
            # Check if user has already signed
            existing_signature = self._get_document_signature(document_id, user_id)
            if existing_signature:
                return {
                    'success': False,
                    'message': 'Document already signed by user',
                    'error_code': 'ALREADY_SIGNED'
                }
            
            # Validate signature data
            validation_result = self._validate_signature_data(signature_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message'],
                    'error_code': 'INVALID_SIGNATURE_DATA'
                }
            
            # Create signature
            signature = {
                'id': self._generate_signature_id(),
                'document_id': document_id,
                'user_id': user_id,
                'signed_at': datetime.now().isoformat(),
                'signature_method': signature_data.get('method', 'DIGITAL'),
                'ip_address': signature_data.get('ip_address'),
                'user_agent': signature_data.get('user_agent'),
                'signature_data': signature_data.get('signature_data', {}),
                'legal_name': signature_data.get('legal_name'),
                'email': signature_data.get('email'),
                'consent_given': signature_data.get('consent_given', True),
                'terms_accepted': signature_data.get('terms_accepted', True),
                'metadata': signature_data.get('metadata', {})
            }
            
            # Save signature
            if self.nodejs_connector:
                result = self.nodejs_connector.create_document_signature(signature)
                if not result:
                    return {
                        'success': False,
                        'message': 'Failed to save document signature',
                        'error_code': 'SAVE_ERROR'
                    }
            
            # Update document status if all required signatures are collected
            self._update_document_status_if_complete(document_id)
            
            return {
                'success': True,
                'data': {
                    'signature': signature,
                    'message': 'Document signed successfully'
                }
            }
            
        except Exception as e:
            logger.error(f"Error signing legal document: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def check_user_legal_compliance(self, user_id: str) -> Dict[str, Any]:
        """Check user's legal compliance status"""
        try:
            # Get user's signed documents
            user_signatures = self._get_user_signatures(user_id)
            
            # Get required platform documents
            required_documents = self._get_required_platform_documents()
            
            # Check compliance
            compliance_result = self._calculate_compliance(user_signatures, required_documents)
            
            return {
                'success': True,
                'data': {
                    'user_id': user_id,
                    'compliant': compliance_result['compliant'],
                    'compliance_percentage': compliance_result['compliance_percentage'],
                    'signed_documents': compliance_result['signed_documents'],
                    'missing_documents': compliance_result['missing_documents'],
                    'required_documents': compliance_result['required_documents'],
                    'last_signature_date': compliance_result['last_signature_date'],
                    'compliance_status': compliance_result['compliance_status']
                }
            }
            
        except Exception as e:
            logger.error(f"Error checking user legal compliance: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def generate_legal_documents_for_venture(self, venture_id: str, user_id: str) -> Dict[str, Any]:
        """Generate required legal documents for a venture"""
        try:
            # Get venture data
            venture = self._get_venture_data(venture_id)
            if not venture:
                return {
                    'success': False,
                    'message': 'Venture not found',
                    'error_code': 'VENTURE_NOT_FOUND'
                }
            
            # Generate venture-specific documents
            documents = []
            
            # Venture Agreement
            venture_agreement = {
                'title': f'Venture Agreement - {venture.get("name", "Untitled Venture")}',
                'type': 'VENTURE_AGREEMENT',
                'content': self._generate_venture_agreement_content(venture),
                'created_by': user_id,
                'venture_id': venture_id,
                'requires_signature': True,
                'is_platform_document': False,
                'jurisdiction': venture.get('jurisdiction', 'US'),
                'metadata': {
                    'venture_name': venture.get('name'),
                    'venture_type': venture.get('type'),
                    'generated_for': 'venture_creation'
                }
            }
            
            # Create the document
            create_result = self.create_legal_document(venture_agreement)
            if create_result['success']:
                documents.append(create_result['data']['document'])
            
            # Team Agreement (if venture has team members)
            if venture.get('team_members'):
                team_agreement = {
                    'title': f'Team Agreement - {venture.get("name", "Untitled Venture")}',
                    'type': 'TEAM_AGREEMENT',
                    'content': self._generate_team_agreement_content(venture),
                    'created_by': user_id,
                    'venture_id': venture_id,
                    'requires_signature': True,
                    'is_platform_document': False,
                    'jurisdiction': venture.get('jurisdiction', 'US'),
                    'metadata': {
                        'venture_name': venture.get('name'),
                        'team_size': len(venture.get('team_members', [])),
                        'generated_for': 'team_formation'
                    }
                }
                
                create_result = self.create_legal_document(team_agreement)
                if create_result['success']:
                    documents.append(create_result['data']['document'])
            
            return {
                'success': True,
                'data': {
                    'venture_id': venture_id,
                    'generated_documents': documents,
                    'document_count': len(documents),
                    'message': f'Generated {len(documents)} legal documents for venture'
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating legal documents for venture: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def get_legal_requirements_for_journey_stage(self, stage: str) -> Dict[str, Any]:
        """Get legal requirements for a specific journey stage"""
        try:
            # Define legal requirements for each stage
            stage_requirements = {
                'PROFILE_SETUP': {
                    'required_documents': ['TERMS_OF_SERVICE', 'PRIVACY_POLICY'],
                    'optional_documents': [],
                    'description': 'Basic platform terms and privacy policy'
                },
                'LEGAL_DOCUMENTS': {
                    'required_documents': ['USER_AGREEMENT'],
                    'optional_documents': [],
                    'description': 'User agreement for platform usage'
                },
                'VENTURE_CREATION': {
                    'required_documents': ['VENTURE_AGREEMENT'],
                    'optional_documents': ['TEAM_AGREEMENT'],
                    'description': 'Venture-specific legal documents'
                },
                'TEAM_FORMATION': {
                    'required_documents': ['TEAM_AGREEMENT'],
                    'optional_documents': [],
                    'description': 'Team collaboration agreements'
                },
                'FUNDING': {
                    'required_documents': ['INVESTMENT_AGREEMENT'],
                    'optional_documents': ['EQUITY_AGREEMENT'],
                    'description': 'Investment and equity documents'
                }
            }
            
            requirements = stage_requirements.get(stage, {
                'required_documents': [],
                'optional_documents': [],
                'description': 'No specific legal requirements for this stage'
            })
            
            # Get document details
            required_docs = []
            for doc_type in requirements['required_documents']:
                doc = self._get_platform_document_by_type(doc_type)
                if doc:
                    required_docs.append(doc)
            
            optional_docs = []
            for doc_type in requirements['optional_documents']:
                doc = self._get_platform_document_by_type(doc_type)
                if doc:
                    optional_docs.append(doc)
            
            return {
                'success': True,
                'data': {
                    'stage': stage,
                    'requirements': requirements,
                    'required_documents': required_docs,
                    'optional_documents': optional_docs,
                    'total_required': len(required_docs),
                    'total_optional': len(optional_docs)
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting legal requirements for journey stage: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    def validate_legal_document_content(self, content: str, document_type: str) -> Dict[str, Any]:
        """Validate legal document content"""
        try:
            validation_results = {
                'valid': True,
                'issues': [],
                'warnings': [],
                'suggestions': []
            }
            
            # Basic content validation
            if len(content.strip()) < 100:
                validation_results['issues'].append('Document content is too short')
                validation_results['valid'] = False
            
            # Check for required sections based on document type
            required_sections = self._get_required_sections_for_type(document_type)
            for section in required_sections:
                if section.lower() not in content.lower():
                    validation_results['warnings'].append(f'Missing recommended section: {section}')
            
            # Check for legal compliance keywords
            compliance_keywords = self._get_compliance_keywords_for_type(document_type)
            missing_keywords = []
            for keyword in compliance_keywords:
                if keyword.lower() not in content.lower():
                    missing_keywords.append(keyword)
            
            if missing_keywords:
                validation_results['suggestions'].append(f'Consider including: {", ".join(missing_keywords)}')
            
            # Check content quality
            if len(content.split()) < 500:
                validation_results['warnings'].append('Document may be too brief for legal purposes')
            
            return {
                'success': True,
                'data': validation_results
            }
            
        except Exception as e:
            logger.error(f"Error validating legal document content: {e}")
            return {
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }
    
    # Private helper methods
    def _generate_document_id(self) -> str:
        """Generate unique document ID"""
        return f"doc_{secrets.token_hex(8)}"
    
    def _generate_signature_id(self) -> str:
        """Generate unique signature ID"""
        return f"sig_{secrets.token_hex(8)}"
    
    def _get_legal_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get legal document by ID"""
        # This would typically query the database via Node.js connector
        return None
    
    def _get_document_signature(self, document_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get document signature by document ID and user ID"""
        # This would typically query the database via Node.js connector
        return None
    
    def _validate_signature_data(self, signature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate signature data"""
        required_fields = ['legal_name', 'email']
        for field in required_fields:
            if not signature_data.get(field):
                return {
                    'valid': False,
                    'message': f'Missing required field: {field}'
                }
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, signature_data.get('email', '')):
            return {
                'valid': False,
                'message': 'Invalid email format'
            }
        
        return {'valid': True, 'message': 'Valid signature data'}
    
    def _update_document_status_if_complete(self, document_id: str):
        """Update document status if all required signatures are collected"""
        # This would typically update the database via Node.js connector
        pass
    
    def _get_user_signatures(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all signatures for a user"""
        # This would typically query the database via Node.js connector
        return []
    
    def _get_required_platform_documents(self) -> List[Dict[str, Any]]:
        """Get all required platform documents"""
        # This would typically query the database via Node.js connector
        return []
    
    def _calculate_compliance(self, user_signatures: List[Dict[str, Any]], required_documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate user compliance"""
        signed_doc_ids = {sig.get('document_id') for sig in user_signatures}
        required_doc_ids = {doc.get('id') for doc in required_documents}
        
        missing_doc_ids = required_doc_ids - signed_doc_ids
        compliance_percentage = (len(signed_doc_ids & required_doc_ids) / len(required_doc_ids)) * 100 if required_doc_ids else 100
        
        return {
            'compliant': len(missing_doc_ids) == 0,
            'compliance_percentage': compliance_percentage,
            'signed_documents': len(signed_doc_ids),
            'missing_documents': len(missing_doc_ids),
            'required_documents': len(required_doc_ids),
            'last_signature_date': max([sig.get('signed_at', '') for sig in user_signatures]) if user_signatures else None,
            'compliance_status': 'COMPLIANT' if len(missing_doc_ids) == 0 else 'NON_COMPLIANT'
        }
    
    def _get_venture_data(self, venture_id: str) -> Optional[Dict[str, Any]]:
        """Get venture data by ID"""
        # This would typically query the database via Node.js connector
        return None
    
    def _generate_venture_agreement_content(self, venture: Dict[str, Any]) -> str:
        """Generate venture agreement content"""
        return f"""
VENTURE AGREEMENT

This Venture Agreement ("Agreement") is entered into for the venture "{venture.get('name', 'Untitled Venture')}".

1. VENTURE DETAILS
   - Venture Name: {venture.get('name', 'Untitled Venture')}
   - Venture Type: {venture.get('type', 'Technology')}
   - Jurisdiction: {venture.get('jurisdiction', 'US')}

2. TERMS AND CONDITIONS
   [Standard venture agreement terms would be included here]

3. SIGNATURES
   [Signature blocks would be included here]

Generated on: {datetime.now().strftime('%Y-%m-%d')}
"""
    
    def _generate_team_agreement_content(self, venture: Dict[str, Any]) -> str:
        """Generate team agreement content"""
        team_size = len(venture.get('team_members', []))
        return f"""
TEAM AGREEMENT

This Team Agreement ("Agreement") is entered into for the venture "{venture.get('name', 'Untitled Venture')}".

1. TEAM DETAILS
   - Venture Name: {venture.get('name', 'Untitled Venture')}
   - Team Size: {team_size} members
   - Jurisdiction: {venture.get('jurisdiction', 'US')}

2. TEAM RESPONSIBILITIES
   [Standard team agreement terms would be included here]

3. SIGNATURES
   [Signature blocks for all team members would be included here]

Generated on: {datetime.now().strftime('%Y-%m-%d')}
"""
    
    def _get_platform_document_by_type(self, document_type: str) -> Optional[Dict[str, Any]]:
        """Get platform document by type"""
        # This would typically query the database via Node.js connector
        return None
    
    def _get_required_sections_for_type(self, document_type: str) -> List[str]:
        """Get required sections for document type"""
        section_map = {
            'TERMS_OF_SERVICE': ['Terms', 'Conditions', 'Acceptance', 'Termination'],
            'PRIVACY_POLICY': ['Privacy', 'Data Collection', 'Data Usage', 'Cookies'],
            'USER_AGREEMENT': ['Agreement', 'User Responsibilities', 'Platform Rules'],
            'VENTURE_AGREEMENT': ['Venture Details', 'Terms', 'Responsibilities'],
            'TEAM_AGREEMENT': ['Team Details', 'Responsibilities', 'Collaboration']
        }
        return section_map.get(document_type, [])
    
    def _get_compliance_keywords_for_type(self, document_type: str) -> List[str]:
        """Get compliance keywords for document type"""
        keyword_map = {
            'TERMS_OF_SERVICE': ['liability', 'indemnification', 'governing law'],
            'PRIVACY_POLICY': ['GDPR', 'data protection', 'privacy rights'],
            'USER_AGREEMENT': ['user obligations', 'platform rules', 'account termination'],
            'VENTURE_AGREEMENT': ['venture obligations', 'equity', 'intellectual property'],
            'TEAM_AGREEMENT': ['team responsibilities', 'confidentiality', 'non-compete']
        }
        return keyword_map.get(document_type, [])
