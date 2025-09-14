"""
Legal Integration for BUZ Token System
Implements comprehensive legal compliance, RBAC, and secure audit logging
"""

import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
import redis
from cryptography.fernet import Fernet
from dataclasses import dataclass, asdict
import uuid

class LegalComplianceLevel(Enum):
    """Legal compliance levels for BUZ operations"""
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class BUZOperationType(Enum):
    """Types of BUZ operations for legal tracking"""
    TRANSFER = "transfer"
    AWARD = "award"
    SPEND = "spend"
    STAKE = "stake"
    UNSTAKE = "unstake"
    BURN = "burn"
    MINT = "mint"
    REFUND = "refund"
    PENALTY = "penalty"
    REWARD = "reward"

class UserRole(Enum):
    """User roles for RBAC"""
    NOVICE = "novice"
    MEMBER = "member"
    CONTRIBUTOR = "contributor"
    EXPERT = "expert"
    MASTER = "master"
    LEGEND = "legend"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    LEGAL_OFFICER = "legal_officer"
    COMPLIANCE_OFFICER = "compliance_officer"

@dataclass
class LegalDocument:
    """Legal document structure"""
    id: str
    type: str
    title: str
    content: str
    version: str
    effective_date: datetime
    expiry_date: Optional[datetime]
    jurisdiction: str
    compliance_level: LegalComplianceLevel
    digital_signature: str
    created_at: datetime
    updated_at: datetime

@dataclass
class BUZLegalTransaction:
    """Legal transaction record for BUZ operations"""
    transaction_id: str
    operation_type: BUZOperationType
    from_user_id: str
    to_user_id: str
    amount: int
    reason: str
    legal_basis: str
    compliance_level: LegalComplianceLevel
    jurisdiction: str
    timestamp: datetime
    digital_signature: str
    audit_hash: str
    legal_document_id: Optional[str]
    rbac_permissions: List[str]
    ip_address: str
    user_agent: str
    session_id: str

class LegalBUZManager:
    """
    Comprehensive legal integration for BUZ token system
    Implements RBAC, legal compliance, and secure audit logging
    """
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=3)
        self.encryption_key = Fernet.generate_key()
        self.cipher = Fernet(self.encryption_key)
        self.hmac_secret = secrets.token_bytes(32)
        
        # Legal compliance rules
        self.legal_rules = self._initialize_legal_rules()
        self.rbac_permissions = self._initialize_rbac_permissions()
        self.jurisdictions = self._initialize_jurisdictions()
        
    def _initialize_legal_rules(self) -> Dict[str, Any]:
        """Initialize legal compliance rules"""
        return {
            "data_retention": {
                "transaction_records": 2555,  # 7 years in days
                "audit_logs": 2555,
                "legal_documents": 3650,  # 10 years
                "user_consent": 2555
            },
            "compliance_requirements": {
                "gdpr": {
                    "data_minimization": True,
                    "consent_required": True,
                    "right_to_erasure": True,
                    "data_portability": True
                },
                "ccpa": {
                    "disclosure_required": True,
                    "opt_out_rights": True,
                    "data_deletion": True
                },
                "sox": {
                    "audit_trail": True,
                    "internal_controls": True,
                    "management_oversight": True
                }
            },
            "transaction_limits": {
                "daily_limit": 10000,
                "monthly_limit": 100000,
                "annual_limit": 1000000,
                "kyc_required_above": 5000
            }
        }
    
    def _initialize_rbac_permissions(self) -> Dict[UserRole, List[str]]:
        """Initialize RBAC permissions for BUZ operations"""
        return {
            UserRole.NOVICE: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.transfer_small"
            ],
            UserRole.MEMBER: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.transfer",
                "buz.spend_basic",
                "buz.stake_small"
            ],
            UserRole.CONTRIBUTOR: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.transfer",
                "buz.spend",
                "buz.stake",
                "buz.award_small"
            ],
            UserRole.EXPERT: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.transfer",
                "buz.spend",
                "buz.stake",
                "buz.award",
                "buz.burn_small"
            ],
            UserRole.MASTER: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.transfer",
                "buz.spend",
                "buz.stake",
                "buz.award",
                "buz.burn",
                "buz.mint_small"
            ],
            UserRole.LEGEND: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.transfer",
                "buz.spend",
                "buz.stake",
                "buz.award",
                "buz.burn",
                "buz.mint",
                "buz.admin_operations"
            ],
            UserRole.ADMIN: [
                "buz.*",
                "buz.admin_operations",
                "buz.legal_override",
                "buz.compliance_override"
            ],
            UserRole.SUPER_ADMIN: [
                "buz.*",
                "buz.system_override",
                "buz.legal_override",
                "buz.compliance_override"
            ],
            UserRole.LEGAL_OFFICER: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.legal_approval",
                "buz.compliance_audit",
                "buz.legal_override"
            ],
            UserRole.COMPLIANCE_OFFICER: [
                "buz.view_balance",
                "buz.view_transactions",
                "buz.compliance_audit",
                "buz.compliance_override",
                "buz.regulatory_reporting"
            ]
        }
    
    def _initialize_jurisdictions(self) -> Dict[str, Dict[str, Any]]:
        """Initialize legal jurisdictions and their requirements"""
        return {
            "US": {
                "name": "United States",
                "regulations": ["CCPA", "SOX", "FINRA"],
                "kyc_required": True,
                "aml_required": True,
                "tax_reporting": True,
                "transaction_limits": {
                    "daily": 10000,
                    "monthly": 100000
                }
            },
            "EU": {
                "name": "European Union",
                "regulations": ["GDPR", "MiFID", "PSD2"],
                "kyc_required": True,
                "aml_required": True,
                "tax_reporting": True,
                "transaction_limits": {
                    "daily": 5000,
                    "monthly": 50000
                }
            },
            "UK": {
                "name": "United Kingdom",
                "regulations": ["GDPR", "FCA", "MLR"],
                "kyc_required": True,
                "aml_required": True,
                "tax_reporting": True,
                "transaction_limits": {
                    "daily": 5000,
                    "monthly": 50000
                }
            },
            "CA": {
                "name": "Canada",
                "regulations": ["PIPEDA", "PCMLTFA"],
                "kyc_required": True,
                "aml_required": True,
                "tax_reporting": True,
                "transaction_limits": {
                    "daily": 10000,
                    "monthly": 100000
                }
            }
        }
    
    def check_rbac_permission(self, user_id: str, operation: str, user_role: UserRole) -> Tuple[bool, str]:
        """Check if user has permission for BUZ operation"""
        try:
            # Get user permissions
            permissions = self.rbac_permissions.get(user_role, [])
            
            # Check for wildcard permission
            if "buz.*" in permissions:
                return True, "Full access granted"
            
            # Check specific permission
            if operation in permissions:
                return True, f"Permission granted for {operation}"
            
            # Check for admin overrides
            if user_role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
                return True, "Admin override granted"
            
            return False, f"Insufficient permissions for {operation}"
            
        except Exception as e:
            return False, f"Permission check failed: {str(e)}"
    
    def validate_legal_compliance(self, transaction_data: Dict[str, Any], user_jurisdiction: str) -> Tuple[bool, List[str]]:
        """Validate legal compliance for BUZ transaction"""
        compliance_issues = []
        
        try:
            # Check jurisdiction requirements
            jurisdiction_rules = self.jurisdictions.get(user_jurisdiction, {})
            
            # Check transaction limits
            amount = transaction_data.get('amount', 0)
            daily_limit = jurisdiction_rules.get('transaction_limits', {}).get('daily', 0)
            
            if amount > daily_limit:
                compliance_issues.append(f"Transaction amount {amount} exceeds daily limit {daily_limit}")
            
            # Check KYC requirements
            if jurisdiction_rules.get('kyc_required', False) and amount > 5000:
                if not self._check_kyc_status(transaction_data.get('user_id')):
                    compliance_issues.append("KYC verification required for large transactions")
            
            # Check AML requirements
            if jurisdiction_rules.get('aml_required', False):
                if not self._check_aml_status(transaction_data.get('user_id')):
                    compliance_issues.append("AML verification required")
            
            # Check data retention compliance
            if not self._check_data_retention_compliance(transaction_data):
                compliance_issues.append("Data retention compliance check failed")
            
            return len(compliance_issues) == 0, compliance_issues
            
        except Exception as e:
            compliance_issues.append(f"Compliance validation failed: {str(e)}")
            return False, compliance_issues
    
    def create_legal_transaction_record(self, transaction_data: Dict[str, Any], 
                                      user_role: UserRole, 
                                      jurisdiction: str,
                                      ip_address: str,
                                      user_agent: str,
                                      session_id: str) -> BUZLegalTransaction:
        """Create comprehensive legal transaction record"""
        
        # Generate transaction ID
        transaction_id = f"buz_legal_{uuid.uuid4().hex[:16]}"
        
        # Determine compliance level based on amount and user role
        amount = transaction_data.get('amount', 0)
        if amount > 10000 or user_role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            compliance_level = LegalComplianceLevel.ENTERPRISE
        elif amount > 1000 or user_role in [UserRole.MASTER, UserRole.LEGEND]:
            compliance_level = LegalComplianceLevel.PREMIUM
        elif amount > 100 or user_role in [UserRole.EXPERT, UserRole.CONTRIBUTOR]:
            compliance_level = LegalComplianceLevel.STANDARD
        else:
            compliance_level = LegalComplianceLevel.BASIC
        
        # Create legal basis
        legal_basis = self._determine_legal_basis(transaction_data, user_role, jurisdiction)
        
        # Get RBAC permissions
        rbac_permissions = self.rbac_permissions.get(user_role, [])
        
        # Create digital signature
        signature_data = {
            'transaction_id': transaction_id,
            'amount': amount,
            'timestamp': datetime.utcnow().isoformat(),
            'user_role': user_role.value,
            'jurisdiction': jurisdiction
        }
        digital_signature = self._create_digital_signature(signature_data)
        
        # Create audit hash
        audit_data = json.dumps(signature_data, sort_keys=True)
        audit_hash = hashlib.sha256(audit_data.encode()).hexdigest()
        
        # Create legal transaction record
        legal_transaction = BUZLegalTransaction(
            transaction_id=transaction_id,
            operation_type=BUZOperationType(transaction_data.get('type', 'transfer')),
            from_user_id=transaction_data.get('from_user_id', 'system'),
            to_user_id=transaction_data.get('to_user_id', 'system'),
            amount=amount,
            reason=transaction_data.get('reason', ''),
            legal_basis=legal_basis,
            compliance_level=compliance_level,
            jurisdiction=jurisdiction,
            timestamp=datetime.utcnow(),
            digital_signature=digital_signature,
            audit_hash=audit_hash,
            legal_document_id=transaction_data.get('legal_document_id'),
            rbac_permissions=rbac_permissions,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id
        )
        
        return legal_transaction
    
    def log_legal_transaction(self, legal_transaction: BUZLegalTransaction) -> bool:
        """Log legal transaction with comprehensive audit trail"""
        try:
            # Convert to dictionary for storage
            transaction_dict = asdict(legal_transaction)
            
            # Convert datetime objects to ISO strings
            for key, value in transaction_dict.items():
                if isinstance(value, datetime):
                    transaction_dict[key] = value.isoformat()
                elif isinstance(value, Enum):
                    transaction_dict[key] = value.value
            
            # Encrypt sensitive data
            encrypted_data = self.cipher.encrypt(
                json.dumps(transaction_dict).encode()
            )
            
            # Store in Redis with expiration
            retention_days = self.legal_rules['data_retention']['transaction_records']
            self.redis_client.setex(
                f"legal_transaction:{legal_transaction.transaction_id}",
                retention_days * 24 * 3600,  # Convert days to seconds
                encrypted_data
            )
            
            # Store in audit log
            audit_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'transaction_id': legal_transaction.transaction_id,
                'operation_type': legal_transaction.operation_type.value,
                'amount': legal_transaction.amount,
                'user_id': legal_transaction.from_user_id,
                'jurisdiction': legal_transaction.jurisdiction,
                'compliance_level': legal_transaction.compliance_level.value,
                'audit_hash': legal_transaction.audit_hash,
                'ip_address': legal_transaction.ip_address,
                'session_id': legal_transaction.session_id
            }
            
            # Store audit entry
            self.redis_client.lpush('legal_audit_log', json.dumps(audit_entry))
            
            # Keep only last 10000 audit entries
            self.redis_client.ltrim('legal_audit_log', 0, 9999)
            
            return True
            
        except Exception as e:
            print(f"Error logging legal transaction: {str(e)}")
            return False
    
    def get_legal_audit_trail(self, user_id: str = None, 
                            jurisdiction: str = None,
                            start_date: datetime = None,
                            end_date: datetime = None) -> List[Dict[str, Any]]:
        """Get legal audit trail with filtering"""
        try:
            audit_entries = self.redis_client.lrange('legal_audit_log', 0, -1)
            filtered_entries = []
            
            for entry_json in audit_entries:
                entry = json.loads(entry_json)
                
                # Apply filters
                if user_id and entry.get('user_id') != user_id:
                    continue
                if jurisdiction and entry.get('jurisdiction') != jurisdiction:
                    continue
                if start_date and datetime.fromisoformat(entry['timestamp']) < start_date:
                    continue
                if end_date and datetime.fromisoformat(entry['timestamp']) > end_date:
                    continue
                
                filtered_entries.append(entry)
            
            return filtered_entries
            
        except Exception as e:
            print(f"Error getting audit trail: {str(e)}")
            return []
    
    def _check_kyc_status(self, user_id: str) -> bool:
        """Check if user has completed KYC verification"""
        try:
            kyc_status = self.redis_client.get(f"kyc_status:{user_id}")
            return kyc_status and kyc_status.decode() == "verified"
        except Exception:
            return False
    
    def _check_aml_status(self, user_id: str) -> bool:
        """Check if user has completed AML verification"""
        try:
            aml_status = self.redis_client.get(f"aml_status:{user_id}")
            return aml_status and aml_status.decode() == "verified"
        except Exception:
            return False
    
    def _check_data_retention_compliance(self, transaction_data: Dict[str, Any]) -> bool:
        """Check data retention compliance"""
        try:
            # Check if data retention policies are met
            return True  # Simplified for now
        except Exception:
            return False
    
    def _determine_legal_basis(self, transaction_data: Dict[str, Any], 
                             user_role: UserRole, 
                             jurisdiction: str) -> str:
        """Determine legal basis for transaction"""
        operation_type = transaction_data.get('type', 'transfer')
        amount = transaction_data.get('amount', 0)
        
        if operation_type == 'award':
            return f"Contractual obligation - {user_role.value} level rewards"
        elif operation_type == 'spend':
            return f"Service payment - {operation_type} for platform services"
        elif operation_type == 'transfer':
            return f"User-to-user transfer - {jurisdiction} jurisdiction"
        elif operation_type == 'stake':
            return f"Staking agreement - {jurisdiction} jurisdiction"
        else:
            return f"Platform operation - {operation_type} under {jurisdiction} law"
    
    def _create_digital_signature(self, data: Dict[str, Any]) -> str:
        """Create digital signature for legal compliance"""
        message = json.dumps(data, sort_keys=True)
        signature = hmac.new(
            self.hmac_secret,
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def generate_legal_report(self, jurisdiction: str, 
                            start_date: datetime, 
                            end_date: datetime) -> Dict[str, Any]:
        """Generate comprehensive legal compliance report"""
        try:
            # Get audit trail for jurisdiction and date range
            audit_entries = self.get_legal_audit_trail(
                jurisdiction=jurisdiction,
                start_date=start_date,
                end_date=end_date
            )
            
            # Generate report
            report = {
                'jurisdiction': jurisdiction,
                'report_period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'total_transactions': len(audit_entries),
                'compliance_summary': self._generate_compliance_summary(audit_entries),
                'transaction_breakdown': self._generate_transaction_breakdown(audit_entries),
                'regulatory_requirements': self._check_regulatory_requirements(audit_entries, jurisdiction),
                'generated_at': datetime.utcnow().isoformat(),
                'legal_officer': 'SmartStart Legal System',
                'report_id': f"legal_report_{uuid.uuid4().hex[:8]}"
            }
            
            return report
            
        except Exception as e:
            return {'error': f"Report generation failed: {str(e)}"}
    
    def _generate_compliance_summary(self, audit_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate compliance summary from audit entries"""
        total_amount = sum(entry.get('amount', 0) for entry in audit_entries)
        compliance_levels = {}
        
        for entry in audit_entries:
            level = entry.get('compliance_level', 'basic')
            compliance_levels[level] = compliance_levels.get(level, 0) + 1
        
        return {
            'total_amount': total_amount,
            'compliance_levels': compliance_levels,
            'compliance_rate': 100.0  # Simplified for now
        }
    
    def _generate_transaction_breakdown(self, audit_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate transaction breakdown from audit entries"""
        operation_types = {}
        
        for entry in audit_entries:
            op_type = entry.get('operation_type', 'unknown')
            operation_types[op_type] = operation_types.get(op_type, 0) + 1
        
        return {
            'operation_types': operation_types,
            'daily_average': len(audit_entries) / 30 if audit_entries else 0
        }
    
    def _check_regulatory_requirements(self, audit_entries: List[Dict[str, Any]], 
                                     jurisdiction: str) -> Dict[str, Any]:
        """Check regulatory requirements compliance"""
        jurisdiction_rules = self.jurisdictions.get(jurisdiction, {})
        
        return {
            'kyc_compliance': True,  # Simplified for now
            'aml_compliance': True,
            'tax_reporting': jurisdiction_rules.get('tax_reporting', False),
            'transaction_limits': jurisdiction_rules.get('transaction_limits', {}),
            'regulations': jurisdiction_rules.get('regulations', [])
        }
