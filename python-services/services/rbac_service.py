"""
SmartStart RBAC Service
Comprehensive Role-Based Access Control with existing database integration
"""

import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import sys
import os

# Add the services directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from nodejs_connector import NodeJSConnector
except ImportError:
    try:
        from nodejs_connector import NodeJSConnector
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

@dataclass
class Role:
    id: str
    name: str
    description: str
    level: int
    is_system: bool
    permissions: List[str] = None

@dataclass
class Permission:
    id: str
    name: str
    description: str
    resource: str
    action: str

@dataclass
class UserRole:
    user_id: str
    role_id: str
    role_name: str
    level: int
    permissions: List[str]

class RBACService:
    def __init__(self, nodejs_connector=None):
        self.connector = nodejs_connector or NodeJSConnector()
        logger.info("🔐 RBAC Service initialized")
    
    def get_user_roles(self, user_id: str) -> List[UserRole]:
        """Get all roles and permissions for a user"""
        try:
            # Get user's role and permissions
            query = """
            SELECT 
                u.id as user_id,
                r.id as role_id,
                r.name as role_name,
                r.level,
                r.description,
                r.isSystem as is_system
            FROM "User" u
            LEFT JOIN "Role" r ON u.role = r.name
            WHERE u.id = %s
            """
            
            result = self.connector.query(query, [user_id])
            
            if not result:
                return []
            
            user_role = result[0]
            
            # Get permissions for this role
            permissions_query = """
            SELECT 
                p.id,
                p.name,
                p.description,
                p.resource,
                p.action
            FROM "Permission" p
            JOIN "RolePermission" rp ON p.id = rp."permissionId"
            JOIN "Role" r ON rp."roleId" = r.id
            WHERE r.id = %s
            """
            
            permissions = self.connector.query(permissions_query, [user_role['role_id']])
            
            return [UserRole(
                user_id=user_role['user_id'],
                role_id=user_role['role_id'],
                role_name=user_role['role_name'],
                level=user_role['level'],
                permissions=[p['name'] for p in permissions]
            )]
            
        except Exception as e:
            logger.error(f"Error getting user roles: {e}")
            return []
    
    def check_permission(self, user_id: str, resource: str, action: str) -> bool:
        """Check if user has permission for resource/action"""
        try:
            user_roles = self.get_user_roles(user_id)
            
            for user_role in user_roles:
                # Check if user has the specific permission
                permission_name = f"{resource}:{action}"
                if permission_name in user_role.permissions:
                    return True
                
                # Check for admin permissions
                if "admin" in user_role.permissions or user_role.level >= 80:
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking permission: {e}")
            return False
    
    def check_role(self, user_id: str, required_roles: List[str]) -> bool:
        """Check if user has any of the required roles"""
        try:
            user_roles = self.get_user_roles(user_id)
            
            for user_role in user_roles:
                if user_role.role_name in required_roles:
                    return True
                
                # SUPER_ADMIN has all roles
                if user_role.role_name == "SUPER_ADMIN":
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking role: {e}")
            return False
    
    def get_user_level(self, user_id: str) -> int:
        """Get user's RBAC level"""
        try:
            user_roles = self.get_user_roles(user_id)
            if user_roles:
                return user_roles[0].level
            return 0
        except Exception as e:
            logger.error(f"Error getting user level: {e}")
            return 0
    
    def can_access_resource(self, user_id: str, resource_type: str, resource_id: str = None) -> bool:
        """Check if user can access a specific resource"""
        try:
            # Get user's role level
            user_level = self.get_user_level(user_id)
            
            # Define access levels for different resource types
            access_levels = {
                'user': 10,      # VIEWER can see users
                'project': 20,   # MEMBER can see projects
                'equity': 40,    # CONTRIBUTOR can see equity
                'legal': 20,     # MEMBER can see legal docs
                'admin': 80,     # ADMIN for admin functions
                'venture': 40,   # CONTRIBUTOR for ventures
                'billing': 60,   # OWNER for billing
            }
            
            required_level = access_levels.get(resource_type, 100)
            return user_level >= required_level
            
        except Exception as e:
            logger.error(f"Error checking resource access: {e}")
            return False
    
    def get_legal_requirements(self, user_id: str, action: str) -> List[str]:
        """Get legal document requirements for user action"""
        try:
            user_level = self.get_user_level(user_id)
            
            # Define legal requirements by RBAC level
            legal_requirements = {
                5: [],  # GUEST - no legal requirements
                10: [], # VIEWER - no legal requirements
                20: ['PPA', 'ESCA', 'PNA'],  # MEMBER - basic legal pack
                40: ['PPA', 'ESCA', 'PNA', 'MNDA', 'STA'],  # CONTRIBUTOR - enhanced legal
                60: ['PPA', 'ESCA', 'PNA', 'MNDA', 'STA', 'PTSA', 'SOBA'],  # OWNER - full legal
                80: ['PPA', 'ESCA', 'PNA', 'MNDA', 'STA', 'PTSA', 'SOBA', 'ISEA', 'VOA'],  # ADMIN
                100: ['PPA', 'ESCA', 'PNA', 'MNDA', 'STA', 'PTSA', 'SOBA', 'ISEA', 'VOA']  # SUPER_ADMIN
            }
            
            return legal_requirements.get(user_level, [])
            
        except Exception as e:
            logger.error(f"Error getting legal requirements: {e}")
            return []
    
    def enforce_legal_gate(self, user_id: str, action: str) -> Dict[str, Any]:
        """Enforce legal gate - check if user can perform action"""
        try:
            # Check if user has required permissions
            if not self.check_permission(user_id, 'platform', 'access'):
                return {
                    'allowed': False,
                    'reason': 'Insufficient permissions',
                    'required_legal_docs': []
                }
            
            # Get legal requirements
            required_docs = self.get_legal_requirements(user_id, action)
            
            # Check if user has signed required documents
            signed_docs_query = """
            SELECT ldt.name, ldc.status
            FROM "LegalDocumentCompliance" ldc
            JOIN "LegalDocumentTemplate" ldt ON ldc."documentId" = ldt.id
            WHERE ldc."userId" = %s AND ldc.status = 'SIGNED'
            """
            
            signed_docs = self.connector.query(signed_docs_query, [user_id])
            signed_doc_names = [doc['name'] for doc in signed_docs]
            
            # Check if all required documents are signed
            missing_docs = [doc for doc in required_docs if doc not in signed_doc_names]
            
            if missing_docs:
                return {
                    'allowed': False,
                    'reason': 'Missing required legal documents',
                    'required_legal_docs': missing_docs,
                    'signed_docs': signed_doc_names
                }
            
            return {
                'allowed': True,
                'reason': 'All legal requirements met',
                'required_legal_docs': required_docs,
                'signed_docs': signed_doc_names
            }
            
        except Exception as e:
            logger.error(f"Error enforcing legal gate: {e}")
            return {
                'allowed': False,
                'reason': 'Legal gate check failed',
                'required_legal_docs': []
            }
    
    def get_all_roles(self) -> List[Role]:
        """Get all available roles"""
        try:
            query = """
            SELECT 
                r.id,
                r.name,
                r.description,
                r.level,
                r."isSystem" as is_system
            FROM "Role" r
            ORDER BY r.level DESC
            """
            
            result = self.connector.query(query)
            
            roles = []
            for row in result:
                # Get permissions for this role
                permissions_query = """
                SELECT p.name
                FROM "Permission" p
                JOIN "RolePermission" rp ON p.id = rp."permissionId"
                WHERE rp."roleId" = %s
                """
                
                permissions = self.connector.query(permissions_query, [row['id']])
                
                roles.append(Role(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    level=row['level'],
                    is_system=row['is_system'],
                    permissions=[p['name'] for p in permissions]
                ))
            
            return roles
            
        except Exception as e:
            logger.error(f"Error getting all roles: {e}")
            return []
    
    def get_all_permissions(self) -> List[Permission]:
        """Get all available permissions"""
        try:
            query = """
            SELECT 
                p.id,
                p.name,
                p.description,
                p.resource,
                p.action
            FROM "Permission" p
            ORDER BY p.resource, p.action
            """
            
            result = self.connector.query(query)
            
            return [Permission(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                resource=row['resource'],
                action=row['action']
            ) for row in result]
            
        except Exception as e:
            logger.error(f"Error getting all permissions: {e}")
            return []
    
    def update_user_role(self, user_id: str, new_role: str) -> bool:
        """Update user's role"""
        try:
            query = """
            UPDATE "User" 
            SET role = %s, "updatedAt" = NOW()
            WHERE id = %s
            """
            
            result = self.connector.query(query, [new_role, user_id])
            return True
            
        except Exception as e:
            logger.error(f"Error updating user role: {e}")
            return False
    
    def get_rbac_stats(self) -> Dict[str, Any]:
        """Get RBAC system statistics"""
        try:
            # Get user count by role
            user_count_query = """
            SELECT 
                u.role,
                COUNT(*) as count
            FROM "User" u
            GROUP BY u.role
            ORDER BY COUNT(*) DESC
            """
            
            user_counts = self.connector.query(user_count_query)
            
            # Get permission distribution
            permission_query = """
            SELECT 
                p.resource,
                p.action,
                COUNT(rp."roleId") as role_count
            FROM "Permission" p
            LEFT JOIN "RolePermission" rp ON p.id = rp."permissionId"
            GROUP BY p.resource, p.action
            ORDER BY p.resource, p.action
            """
            
            permission_dist = self.connector.query(permission_query)
            
            return {
                'user_counts_by_role': user_counts,
                'permission_distribution': permission_dist,
                'total_roles': len(self.get_all_roles()),
                'total_permissions': len(self.get_all_permissions())
            }
            
        except Exception as e:
            logger.error(f"Error getting RBAC stats: {e}")
            return {}
