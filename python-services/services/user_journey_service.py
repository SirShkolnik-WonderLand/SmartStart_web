"""
SmartStart User Journey Service
Complete user journey management with existing database integration
"""

import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
import sys
import os
from datetime import datetime

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

class JourneyStageStatus(Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"
    SKIPPED = "SKIPPED"

@dataclass
class JourneyStage:
    id: str
    name: str
    description: str
    order: int
    is_active: bool
    gates: List[Dict] = None

@dataclass
class UserJourneyState:
    id: str
    user_id: str
    stage_id: str
    status: JourneyStageStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict = None

@dataclass
class JourneyProgress:
    user_id: str
    current_stage: str
    completed_stages: int
    total_stages: int
    progress_percentage: float
    next_stage: Optional[str] = None
    blocked_reasons: List[str] = None

class UserJourneyService:
    def __init__(self, nodejs_connector=None):
        self.connector = nodejs_connector or NodeJSConnector()
        logger.info("🚀 User Journey Service initialized")
    
    def get_user_journey_state(self, user_id: str) -> List[UserJourneyState]:
        """Get user's journey state for all stages"""
        try:
            query = """
            SELECT 
                ujs.id,
                ujs."userId" as user_id,
                ujs."stageId" as stage_id,
                ujs.status,
                ujs."startedAt" as started_at,
                ujs."completedAt" as completed_at,
                ujs.metadata
            FROM "UserJourneyState" ujs
            WHERE ujs."userId" = %s
            ORDER BY ujs."stageId"
            """
            
            result = self.connector.query(query, [user_id])
            
            journey_states = []
            for row in result:
                journey_states.append(UserJourneyState(
                    id=row['id'],
                    user_id=row['user_id'],
                    stage_id=row['stage_id'],
                    status=JourneyStageStatus(row['status']),
                    started_at=row['started_at'],
                    completed_at=row['completed_at'],
                    metadata=row['metadata'] or {}
                ))
            
            return journey_states
            
        except Exception as e:
            logger.error(f"Error getting user journey state: {e}")
            return []
    
    def get_current_stage(self, user_id: str) -> Optional[JourneyStage]:
        """Get user's current journey stage"""
        try:
            # Get user's current stage (first incomplete stage)
            query = """
            SELECT 
                js.id,
                js.name,
                js.description,
                js."order",
                js."isActive",
                ujs.status
            FROM "JourneyStage" js
            LEFT JOIN "UserJourneyState" ujs ON js.id = ujs."stageId" AND ujs."userId" = %s
            WHERE js."isActive" = true
            ORDER BY js."order"
            LIMIT 1
            """
            
            result = self.connector.query(query, [user_id])
            
            if result:
                row = result[0]
                return JourneyStage(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    order=row['order'],
                    is_active=row['is_active']
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting current stage: {e}")
            return None
    
    def get_journey_progress(self, user_id: str) -> JourneyProgress:
        """Get user's journey progress"""
        try:
            # Get all active stages
            stages_query = """
            SELECT id, name, "order"
            FROM "JourneyStage"
            WHERE "isActive" = true
            ORDER BY "order"
            """
            
            stages = self.connector.query(stages_query)
            total_stages = len(stages)
            
            # Get user's completed stages
            completed_query = """
            SELECT 
                js.id,
                js.name,
                js."order",
                ujs.status
            FROM "JourneyStage" js
            LEFT JOIN "UserJourneyState" ujs ON js.id = ujs."stageId" AND ujs."userId" = %s
            WHERE js."isActive" = true
            ORDER BY js."order"
            """
            
            user_stages = self.connector.query(completed_query, [user_id])
            
            completed_stages = 0
            current_stage = None
            next_stage = None
            blocked_reasons = []
            
            for i, stage in enumerate(user_stages):
                status = stage['status']
                
                if status == 'COMPLETED':
                    completed_stages += 1
                elif status == 'IN_PROGRESS' or status == 'NOT_STARTED':
                    if not current_stage:
                        current_stage = stage['name']
                    if status == 'BLOCKED':
                        blocked_reasons.append(f"Stage '{stage['name']}' is blocked")
                elif status == 'BLOCKED':
                    blocked_reasons.append(f"Stage '{stage['name']}' is blocked")
            
            # Find next stage
            for i, stage in enumerate(user_stages):
                if stage['status'] in ['NOT_STARTED', 'IN_PROGRESS']:
                    next_stage = stage['name']
                    break
            
            progress_percentage = (completed_stages / total_stages * 100) if total_stages > 0 else 0
            
            return JourneyProgress(
                user_id=user_id,
                current_stage=current_stage or "Not Started",
                completed_stages=completed_stages,
                total_stages=total_stages,
                progress_percentage=progress_percentage,
                next_stage=next_stage,
                blocked_reasons=blocked_reasons
            )
            
        except Exception as e:
            logger.error(f"Error getting journey progress: {e}")
            return JourneyProgress(
                user_id=user_id,
                current_stage="Error",
                completed_stages=0,
                total_stages=0,
                progress_percentage=0,
                blocked_reasons=[f"Error: {str(e)}"]
            )
    
    def start_stage(self, user_id: str, stage_id: str) -> bool:
        """Start a journey stage for a user"""
        try:
            # Check if stage exists and is active
            stage_query = """
            SELECT id, name, "isActive"
            FROM "JourneyStage"
            WHERE id = %s AND "isActive" = true
            """
            
            stage_result = self.connector.query(stage_query, [stage_id])
            if not stage_result:
                logger.error(f"Stage {stage_id} not found or inactive")
                return False
            
            # Check if user already has a state for this stage
            existing_query = """
            SELECT id, status
            FROM "UserJourneyState"
            WHERE "userId" = %s AND "stageId" = %s
            """
            
            existing = self.connector.query(existing_query, [user_id, stage_id])
            
            if existing:
                # Update existing state
                update_query = """
                UPDATE "UserJourneyState"
                SET status = %s, "startedAt" = %s, "updatedAt" = %s
                WHERE "userId" = %s AND "stageId" = %s
                """
                
                self.connector.query(update_query, [
                    JourneyStageStatus.IN_PROGRESS.value,
                    datetime.now(),
                    datetime.now(),
                    user_id,
                    stage_id
                ])
            else:
                # Create new state
                insert_query = """
                INSERT INTO "UserJourneyState" (
                    id, "userId", "stageId", status, "startedAt", "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                
                state_id = self._generate_id()
                self.connector.query(insert_query, [
                    state_id,
                    user_id,
                    stage_id,
                    JourneyStageStatus.IN_PROGRESS.value,
                    datetime.now(),
                    datetime.now(),
                    datetime.now()
                ])
            
            logger.info(f"Started stage {stage_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error starting stage: {e}")
            return False
    
    def complete_stage(self, user_id: str, stage_id: str, metadata: Dict = None) -> bool:
        """Complete a journey stage for a user"""
        try:
            # Check if stage is in progress
            state_query = """
            SELECT id, status
            FROM "UserJourneyState"
            WHERE "userId" = %s AND "stageId" = %s
            """
            
            state_result = self.connector.query(state_query, [user_id, stage_id])
            if not state_result:
                logger.error(f"No active state found for user {user_id} and stage {stage_id}")
                return False
            
            # Update state to completed
            update_query = """
            UPDATE "UserJourneyState"
            SET status = %s, "completedAt" = %s, metadata = %s, "updatedAt" = %s
            WHERE "userId" = %s AND "stageId" = %s
            """
            
            self.connector.query(update_query, [
                JourneyStageStatus.COMPLETED.value,
                datetime.now(),
                metadata or {},
                datetime.now(),
                user_id,
                stage_id
            ])
            
            logger.info(f"Completed stage {stage_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error completing stage: {e}")
            return False
    
    def block_stage(self, user_id: str, stage_id: str, reason: str) -> bool:
        """Block a journey stage for a user"""
        try:
            # Update or create state as blocked
            state_query = """
            SELECT id
            FROM "UserJourneyState"
            WHERE "userId" = %s AND "stageId" = %s
            """
            
            existing = self.connector.query(state_query, [user_id, stage_id])
            
            if existing:
                # Update existing state
                update_query = """
                UPDATE "UserJourneyState"
                SET status = %s, metadata = %s, "updatedAt" = %s
                WHERE "userId" = %s AND "stageId" = %s
                """
                
                metadata = {"blocked_reason": reason}
                self.connector.query(update_query, [
                    JourneyStageStatus.BLOCKED.value,
                    metadata,
                    datetime.now(),
                    user_id,
                    stage_id
                ])
            else:
                # Create new blocked state
                insert_query = """
                INSERT INTO "UserJourneyState" (
                    id, "userId", "stageId", status, metadata, "createdAt", "updatedAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                
                state_id = self._generate_id()
                metadata = {"blocked_reason": reason}
                self.connector.query(insert_query, [
                    state_id,
                    user_id,
                    stage_id,
                    JourneyStageStatus.BLOCKED.value,
                    metadata,
                    datetime.now(),
                    datetime.now()
                ])
            
            logger.info(f"Blocked stage {stage_id} for user {user_id}: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Error blocking stage: {e}")
            return False
    
    def get_all_stages(self) -> List[JourneyStage]:
        """Get all journey stages"""
        try:
            query = """
            SELECT 
                js.id,
                js.name,
                js.description,
                js."order",
                js."isActive"
            FROM "JourneyStage" js
            ORDER BY js."order"
            """
            
            result = self.connector.query(query)
            
            stages = []
            for row in result:
                stages.append(JourneyStage(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    order=row['order'],
                    is_active=row['is_active']
                ))
            
            return stages
            
        except Exception as e:
            logger.error(f"Error getting all stages: {e}")
            return []
    
    def get_stage_gates(self, stage_id: str) -> List[Dict]:
        """Get gates/requirements for a journey stage"""
        try:
            query = """
            SELECT 
                jg.id,
                jg.name,
                jg.description,
                jg."gateType",
                jg.conditions
            FROM "JourneyGate" jg
            WHERE jg."stageId" = %s
            ORDER BY jg."order"
            """
            
            result = self.connector.query(query, [stage_id])
            
            gates = []
            for row in result:
                gates.append({
                    'id': row['id'],
                    'name': row['name'],
                    'description': row['description'],
                    'gate_type': row['gate_type'],
                    'conditions': row['conditions'] or {}
                })
            
            return gates
            
        except Exception as e:
            logger.error(f"Error getting stage gates: {e}")
            return []
    
    def check_stage_gates(self, user_id: str, stage_id: str) -> Dict[str, Any]:
        """Check if user meets all requirements for a stage"""
        try:
            gates = self.get_stage_gates(stage_id)
            gate_results = []
            all_passed = True
            
            for gate in gates:
                gate_type = gate['gate_type']
                conditions = gate['conditions']
                
                if gate_type == 'LEGAL_DOCUMENT':
                    # Check if user has signed required legal documents
                    required_docs = conditions.get('required_documents', [])
                    signed_docs = self._get_user_signed_documents(user_id)
                    
                    missing_docs = [doc for doc in required_docs if doc not in signed_docs]
                    
                    gate_result = {
                        'gate_id': gate['id'],
                        'gate_name': gate['name'],
                        'passed': len(missing_docs) == 0,
                        'missing_requirements': missing_docs
                    }
                    
                    if missing_docs:
                        all_passed = False
                    
                    gate_results.append(gate_result)
                
                elif gate_type == 'RBAC_LEVEL':
                    # Check if user has required RBAC level
                    required_level = conditions.get('required_level', 0)
                    user_level = self._get_user_rbac_level(user_id)
                    
                    gate_result = {
                        'gate_id': gate['id'],
                        'gate_name': gate['name'],
                        'passed': user_level >= required_level,
                        'missing_requirements': [f"RBAC level {required_level} required, user has {user_level}"]
                    }
                    
                    if user_level < required_level:
                        all_passed = False
                    
                    gate_results.append(gate_result)
                
                elif gate_type == 'PREVIOUS_STAGE':
                    # Check if previous stage is completed
                    required_stage = conditions.get('required_stage')
                    if required_stage:
                        prev_stage_completed = self._is_stage_completed(user_id, required_stage)
                        
                        gate_result = {
                            'gate_id': gate['id'],
                            'gate_name': gate['name'],
                            'passed': prev_stage_completed,
                            'missing_requirements': [f"Previous stage '{required_stage}' must be completed"]
                        }
                        
                        if not prev_stage_completed:
                            all_passed = False
                        
                        gate_results.append(gate_result)
            
            return {
                'all_gates_passed': all_passed,
                'gate_results': gate_results,
                'can_proceed': all_passed
            }
            
        except Exception as e:
            logger.error(f"Error checking stage gates: {e}")
            return {
                'all_gates_passed': False,
                'gate_results': [],
                'can_proceed': False,
                'error': str(e)
            }
    
    def _get_user_signed_documents(self, user_id: str) -> List[str]:
        """Get list of legal documents signed by user"""
        try:
            query = """
            SELECT ldt.name
            FROM "LegalDocumentCompliance" ldc
            JOIN "LegalDocumentTemplate" ldt ON ldc."documentId" = ldt.id
            WHERE ldc."userId" = %s AND ldc.status = 'SIGNED'
            """
            
            result = self.connector.query(query, [user_id])
            return [row['name'] for row in result]
            
        except Exception as e:
            logger.error(f"Error getting user signed documents: {e}")
            return []
    
    def _get_user_rbac_level(self, user_id: str) -> int:
        """Get user's RBAC level"""
        try:
            query = """
            SELECT r.level
            FROM "User" u
            JOIN "Role" r ON u.role = r.name
            WHERE u.id = %s
            """
            
            result = self.connector.query(query, [user_id])
            if result:
                return result[0]['level']
            return 0
            
        except Exception as e:
            logger.error(f"Error getting user RBAC level: {e}")
            return 0
    
    def _is_stage_completed(self, user_id: str, stage_id: str) -> bool:
        """Check if a stage is completed for user"""
        try:
            query = """
            SELECT status
            FROM "UserJourneyState"
            WHERE "userId" = %s AND "stageId" = %s
            """
            
            result = self.connector.query(query, [user_id, stage_id])
            if result:
                return result[0]['status'] == 'COMPLETED'
            return False
            
        except Exception as e:
            logger.error(f"Error checking stage completion: {e}")
            return False
    
    def _generate_id(self) -> str:
        """Generate a unique ID (cuid-like)"""
        import time
        import random
        import string
        
        timestamp = str(int(time.time() * 1000))
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"cm{timestamp[-8:]}{random_part}"
    
    def get_journey_analytics(self) -> Dict[str, Any]:
        """Get journey analytics"""
        try:
            # Get stage completion rates
            completion_query = """
            SELECT 
                js.name as stage_name,
                js."order" as stage_order,
                COUNT(ujs.id) as total_users,
                COUNT(CASE WHEN ujs.status = 'COMPLETED' THEN 1 END) as completed_users,
                ROUND(
                    COUNT(CASE WHEN ujs.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(ujs.id), 2
                ) as completion_rate
            FROM "JourneyStage" js
            LEFT JOIN "UserJourneyState" ujs ON js.id = ujs."stageId"
            WHERE js."isActive" = true
            GROUP BY js.id, js.name, js."order"
            ORDER BY js."order"
            """
            
            completion_stats = self.connector.query(completion_query)
            
            # Get user progress distribution
            progress_query = """
            SELECT 
                CASE 
                    WHEN completed_stages = 0 THEN '0%'
                    WHEN completed_stages <= 2 THEN '1-20%'
                    WHEN completed_stages <= 4 THEN '21-40%'
                    WHEN completed_stages <= 6 THEN '41-60%'
                    WHEN completed_stages <= 8 THEN '61-80%'
                    ELSE '81-100%'
                END as progress_range,
                COUNT(*) as user_count
            FROM (
                SELECT 
                    ujs."userId",
                    COUNT(CASE WHEN ujs.status = 'COMPLETED' THEN 1 END) as completed_stages
                FROM "UserJourneyState" ujs
                GROUP BY ujs."userId"
            ) user_progress
            GROUP BY progress_range
            ORDER BY progress_range
            """
            
            progress_dist = self.connector.query(progress_query)
            
            return {
                'stage_completion_rates': completion_stats,
                'user_progress_distribution': progress_dist,
                'total_active_stages': len(self.get_all_stages())
            }
            
        except Exception as e:
            logger.error(f"Error getting journey analytics: {e}")
            return {}
