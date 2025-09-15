"""
Enhanced Registration Service with Comprehensive State Management
Handles user registration, onboarding steps, legal agreements, and subscriptions
"""

import logging
import hashlib
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class RegistrationStep(Enum):
    ACCOUNT_CREATION = "account_creation"
    PASSWORD_SETUP = "password_setup"
    PROFILE_COMPLETION = "profile_completion"
    LEGAL_AGREEMENTS = "legal_agreements"
    SUBSCRIPTION_SELECTION = "subscription_selection"
    PLATFORM_ORIENTATION = "platform_orientation"
    BUZ_TOKEN_SETUP = "buz_token_setup"
    ONBOARDING_COMPLETE = "onboarding_complete"

class StepStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class StepProgress:
    step: RegistrationStep
    status: StepStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    retry_count: int = 0

@dataclass
class UserRegistrationState:
    user_id: str
    email: str
    current_step: RegistrationStep
    steps_progress: List[StepProgress]
    created_at: datetime
    updated_at: datetime
    is_complete: bool = False
    total_retries: int = 0

class EnhancedRegistrationService:
    """
    Enhanced registration service with comprehensive state management
    """
    
    def __init__(self, nodejs_connector=None, db_connector=None):
        self.nodejs_connector = nodejs_connector
        self.db_connector = db_connector
        logger.info("🔐 Enhanced Registration Service initialized")

    def create_user_registration_state(self, user_id: str, email: str) -> UserRegistrationState:
        """Create initial registration state for a new user"""
        try:
            # Initialize all steps as not started
            steps_progress = []
            for step in RegistrationStep:
                steps_progress.append(StepProgress(
                    step=step,
                    status=StepStatus.NOT_STARTED
                ))
            
            registration_state = UserRegistrationState(
                user_id=user_id,
                email=email,
                current_step=RegistrationStep.ACCOUNT_CREATION,
                steps_progress=steps_progress,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Save to database
            self._save_registration_state(registration_state)
            
            logger.info(f"✅ Created registration state for user {user_id}")
            return registration_state
            
        except Exception as e:
            logger.error(f"❌ Error creating registration state: {e}")
            raise

    def update_step_progress(self, user_id: str, step: RegistrationStep, 
                           status: StepStatus, data: Optional[Dict[str, Any]] = None,
                           error_message: Optional[str] = None) -> Dict[str, Any]:
        """Update progress for a specific registration step"""
        try:
            # Load current state
            state = self._load_registration_state(user_id)
            if not state:
                return {"success": False, "error": "Registration state not found"}
            
            # Find and update the step
            step_found = False
            for step_progress in state.steps_progress:
                if step_progress.step == step:
                    step_progress.status = status
                    step_progress.data = data
                    step_progress.error_message = error_message
                    
                    if status == StepStatus.IN_PROGRESS and not step_progress.started_at:
                        step_progress.started_at = datetime.now()
                    elif status == StepStatus.COMPLETED:
                        step_progress.completed_at = datetime.now()
                    elif status == StepStatus.FAILED:
                        step_progress.retry_count += 1
                        state.total_retries += 1
                    
                    step_found = True
                    break
            
            if not step_found:
                return {"success": False, "error": f"Step {step.value} not found"}
            
            # Update current step and overall state
            state.current_step = step
            state.updated_at = datetime.now()
            
            # Check if all required steps are completed
            state.is_complete = self._check_completion_status(state)
            
            # Save updated state
            self._save_registration_state(state)
            
            # Create audit log
            self._create_audit_log(user_id, f"STEP_{status.value.upper()}", {
                "step": step.value,
                "status": status.value,
                "data": data,
                "error_message": error_message
            })
            
            logger.info(f"✅ Updated step {step.value} to {status.value} for user {user_id}")
            return {
                "success": True,
                "current_step": state.current_step.value,
                "is_complete": state.is_complete,
                "step_status": status.value
            }
            
        except Exception as e:
            logger.error(f"❌ Error updating step progress: {e}")
            return {"success": False, "error": str(e)}

    def get_registration_progress(self, user_id: str) -> Dict[str, Any]:
        """Get current registration progress for a user"""
        try:
            state = self._load_registration_state(user_id)
            if not state:
                return {"success": False, "error": "Registration state not found"}
            
            # Calculate progress statistics
            total_steps = len(state.steps_progress)
            completed_steps = len([s for s in state.steps_progress if s.status == StepStatus.COMPLETED])
            in_progress_steps = len([s for s in state.steps_progress if s.status == StepStatus.IN_PROGRESS])
            failed_steps = len([s for s in state.steps_progress if s.status == StepStatus.FAILED])
            
            progress_percentage = (completed_steps / total_steps) * 100 if total_steps > 0 else 0
            
            return {
                "success": True,
                "user_id": state.user_id,
                "email": state.email,
                "current_step": state.current_step.value,
                "is_complete": state.is_complete,
                "progress_percentage": progress_percentage,
                "total_steps": total_steps,
                "completed_steps": completed_steps,
                "in_progress_steps": in_progress_steps,
                "failed_steps": failed_steps,
                "total_retries": state.total_retries,
                "steps": [
                    {
                        "step": s.step.value,
                        "status": s.status.value,
                        "started_at": s.started_at.isoformat() if s.started_at else None,
                        "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                        "retry_count": s.retry_count,
                        "error_message": s.error_message
                    }
                    for s in state.steps_progress
                ],
                "created_at": state.created_at.isoformat(),
                "updated_at": state.updated_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting registration progress: {e}")
            return {"success": False, "error": str(e)}

    def handle_legal_agreement_signing(self, user_id: str, agreement_type: str, 
                                     signature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle legal agreement signing with digital signature verification"""
        try:
            # Validate signature data
            required_fields = ['signature_hash', 'signed_at', 'document_version', 'content']
            for field in required_fields:
                if field not in signature_data:
                    return {"success": False, "error": f"Missing required field: {field}"}
            
            # Verify signature hash
            if not self._verify_digital_signature(signature_data):
                return {"success": False, "error": "Invalid digital signature"}
            
            # Save legal agreement to database
            legal_agreement = {
                "user_id": user_id,
                "agreement_type": agreement_type,
                "signature_hash": signature_data['signature_hash'],
                "signed_at": signature_data['signed_at'],
                "document_version": signature_data['document_version'],
                "content_hash": hashlib.sha256(signature_data['content'].encode()).hexdigest(),
                "ip_address": signature_data.get('ip_address', 'unknown'),
                "user_agent": signature_data.get('user_agent', 'unknown'),
                "created_at": datetime.now().isoformat()
            }
            
            # Save to database
            self._save_legal_agreement(legal_agreement)
            
            # Update step progress
            result = self.update_step_progress(
                user_id, 
                RegistrationStep.LEGAL_AGREEMENTS, 
                StepStatus.COMPLETED,
                data={"agreement_type": agreement_type, "signed_at": signature_data['signed_at']}
            )
            
            if result["success"]:
                logger.info(f"✅ Legal agreement {agreement_type} signed for user {user_id}")
                return {
                    "success": True,
                    "message": "Legal agreement signed successfully",
                    "agreement_id": legal_agreement["signature_hash"][:8] + "..."
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"❌ Error handling legal agreement signing: {e}")
            return {"success": False, "error": str(e)}

    def handle_subscription_selection(self, user_id: str, plan_id: str, 
                                    payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription plan selection and payment processing"""
        try:
            # Validate subscription plan
            if not self._validate_subscription_plan(plan_id):
                return {"success": False, "error": "Invalid subscription plan"}
            
            # Process payment (mock implementation)
            payment_result = self._process_payment(payment_data)
            if not payment_result["success"]:
                return payment_result
            
            # Create subscription record
            subscription = {
                "user_id": user_id,
                "plan_id": plan_id,
                "status": "ACTIVE",
                "trial_ends_at": (datetime.now() + timedelta(days=30)).isoformat(),
                "payment_data": {
                    "last_four": payment_data.get('cardNumber', '')[-4:],
                    "expiry_month": payment_data.get('expiryDate', '').split('/')[0] if payment_data.get('expiryDate') else None,
                    "expiry_year": payment_data.get('expiryDate', '').split('/')[1] if payment_data.get('expiryDate') else None
                },
                "created_at": datetime.now().isoformat()
            }
            
            # Save subscription
            self._save_subscription(subscription)
            
            # Update step progress
            result = self.update_step_progress(
                user_id,
                RegistrationStep.SUBSCRIPTION_SELECTION,
                StepStatus.COMPLETED,
                data={"plan_id": plan_id, "subscription_id": subscription["user_id"]}
            )
            
            if result["success"]:
                logger.info(f"✅ Subscription {plan_id} selected for user {user_id}")
                return {
                    "success": True,
                    "message": "Subscription activated successfully",
                    "subscription": subscription
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"❌ Error handling subscription selection: {e}")
            return {"success": False, "error": str(e)}

    def complete_onboarding(self, user_id: str) -> Dict[str, Any]:
        """Complete the onboarding process"""
        try:
            # Mark all remaining steps as completed
            final_steps = [
                RegistrationStep.PLATFORM_ORIENTATION,
                RegistrationStep.BUZ_TOKEN_SETUP,
                RegistrationStep.ONBOARDING_COMPLETE
            ]
            
            for step in final_steps:
                self.update_step_progress(
                    user_id,
                    step,
                    StepStatus.COMPLETED,
                    data={"completed_at": datetime.now().isoformat()}
                )
            
            # Award welcome BUZ tokens
            buz_result = self._award_welcome_tokens(user_id)
            if not buz_result["success"]:
                logger.warning(f"⚠️ Failed to award welcome tokens: {buz_result['error']}")
            
            # Create completion audit log
            self._create_audit_log(user_id, "ONBOARDING_COMPLETED", {
                "completed_at": datetime.now().isoformat(),
                "total_steps": len(RegistrationStep),
                "welcome_tokens_awarded": buz_result.get("tokens_awarded", 0)
            })
            
            logger.info(f"🎉 Onboarding completed for user {user_id}")
            return {
                "success": True,
                "message": "Onboarding completed successfully",
                "welcome_tokens": buz_result.get("tokens_awarded", 0)
            }
            
        except Exception as e:
            logger.error(f"❌ Error completing onboarding: {e}")
            return {"success": False, "error": str(e)}

    def _check_completion_status(self, state: UserRegistrationState) -> bool:
        """Check if all required steps are completed"""
        required_steps = [
            RegistrationStep.ACCOUNT_CREATION,
            RegistrationStep.PASSWORD_SETUP,
            RegistrationStep.PROFILE_COMPLETION,
            RegistrationStep.LEGAL_AGREEMENTS,
            RegistrationStep.SUBSCRIPTION_SELECTION
        ]
        
        for step in required_steps:
            step_progress = next((s for s in state.steps_progress if s.step == step), None)
            if not step_progress or step_progress.status != StepStatus.COMPLETED:
                return False
        
        return True

    def _verify_digital_signature(self, signature_data: Dict[str, Any]) -> bool:
        """Verify digital signature integrity"""
        try:
            # Recreate signature string
            signature_string = json.dumps({
                "user_id": signature_data.get("user_id"),
                "document_type": signature_data.get("document_type"),
                "content": signature_data["content"],
                "timestamp": signature_data["signed_at"],
                "ip_address": signature_data.get("ip_address"),
                "user_agent": signature_data.get("user_agent")
            }, sort_keys=True)
            
            # Generate expected hash
            expected_hash = hashlib.sha256(signature_string.encode()).hexdigest()
            
            return expected_hash == signature_data["signature_hash"]
            
        except Exception as e:
            logger.error(f"❌ Error verifying digital signature: {e}")
            return False

    def _validate_subscription_plan(self, plan_id: str) -> bool:
        """Validate subscription plan exists and is active"""
        # Mock validation - in real implementation, check database
        valid_plans = ["all-features", "basic", "premium", "enterprise"]
        return plan_id in valid_plans

    def _process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process payment (mock implementation)"""
        # Mock payment processing
        required_fields = ["cardNumber", "expiryDate", "cvv", "name"]
        for field in required_fields:
            if not payment_data.get(field):
                return {"success": False, "error": f"Missing payment field: {field}"}
        
        # Simulate payment processing delay
        import time
        time.sleep(0.1)
        
        return {
            "success": True,
            "transaction_id": f"txn_{hashlib.md5(str(datetime.now()).encode()).hexdigest()[:12]}",
            "amount": 29.00,
            "currency": "USD"
        }

    def _award_welcome_tokens(self, user_id: str) -> Dict[str, Any]:
        """Award welcome BUZ tokens to new user"""
        try:
            # Award 100 BUZ tokens as welcome bonus
            tokens_awarded = 100
            
            # Save to database (mock implementation)
            token_transaction = {
                "user_id": user_id,
                "amount": tokens_awarded,
                "type": "WELCOME_BONUS",
                "description": "Welcome to SmartStart!",
                "created_at": datetime.now().isoformat()
            }
            
            # In real implementation, save to BUZ token database
            logger.info(f"🎁 Awarded {tokens_awarded} BUZ tokens to user {user_id}")
            
            return {
                "success": True,
                "tokens_awarded": tokens_awarded,
                "transaction_id": token_transaction["created_at"]
            }
            
        except Exception as e:
            logger.error(f"❌ Error awarding welcome tokens: {e}")
            return {"success": False, "error": str(e)}

    def _save_registration_state(self, state: UserRegistrationState) -> None:
        """Save registration state to database"""
        try:
            if self.db_connector:
                # Convert to database format
                state_data = {
                    "user_id": state.user_id,
                    "email": state.email,
                    "current_step": state.current_step.value,
                    "is_complete": state.is_complete,
                    "total_retries": state.total_retries,
                    "steps_progress": [
                        {
                            "step": s.step.value,
                            "status": s.status.value,
                            "started_at": s.started_at.isoformat() if s.started_at else None,
                            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                            "data": s.data,
                            "error_message": s.error_message,
                            "retry_count": s.retry_count
                        }
                        for s in state.steps_progress
                    ],
                    "created_at": state.created_at.isoformat(),
                    "updated_at": state.updated_at.isoformat()
                }
                
                # Save to database
                self.db_connector.query(
                    """
                    INSERT INTO user_registration_states (user_id, email, current_step, is_complete, total_retries, steps_progress, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (user_id) DO UPDATE SET
                        current_step = EXCLUDED.current_step,
                        is_complete = EXCLUDED.is_complete,
                        total_retries = EXCLUDED.total_retries,
                        steps_progress = EXCLUDED.steps_progress,
                        updated_at = EXCLUDED.updated_at
                    """,
                    [
                        state_data["user_id"],
                        state_data["email"],
                        state_data["current_step"],
                        state_data["is_complete"],
                        state_data["total_retries"],
                        json.dumps(state_data["steps_progress"]),
                        state_data["created_at"],
                        state_data["updated_at"]
                    ]
                )
                
        except Exception as e:
            logger.error(f"❌ Error saving registration state: {e}")
            raise

    def _load_registration_state(self, user_id: str) -> Optional[UserRegistrationState]:
        """Load registration state from database"""
        try:
            if self.db_connector:
                result = self.db_connector.query(
                    "SELECT * FROM user_registration_states WHERE user_id = %s",
                    [user_id]
                )
                
                if result:
                    row = result[0]
                    steps_progress = []
                    for step_data in json.loads(row["steps_progress"]):
                        steps_progress.append(StepProgress(
                            step=RegistrationStep(step_data["step"]),
                            status=StepStatus(step_data["status"]),
                            started_at=datetime.fromisoformat(step_data["started_at"]) if step_data["started_at"] else None,
                            completed_at=datetime.fromisoformat(step_data["completed_at"]) if step_data["completed_at"] else None,
                            data=step_data["data"],
                            error_message=step_data["error_message"],
                            retry_count=step_data["retry_count"]
                        ))
                    
                    return UserRegistrationState(
                        user_id=row["user_id"],
                        email=row["email"],
                        current_step=RegistrationStep(row["current_step"]),
                        steps_progress=steps_progress,
                        created_at=datetime.fromisoformat(row["created_at"]),
                        updated_at=datetime.fromisoformat(row["updated_at"]),
                        is_complete=row["is_complete"],
                        total_retries=row["total_retries"]
                    )
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error loading registration state: {e}")
            return None

    def _save_legal_agreement(self, agreement: Dict[str, Any]) -> None:
        """Save legal agreement to database"""
        try:
            if self.db_connector:
                self.db_connector.query(
                    """
                    INSERT INTO legal_agreements (user_id, agreement_type, signature_hash, signed_at, document_version, content_hash, ip_address, user_agent, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [
                        agreement["user_id"],
                        agreement["agreement_type"],
                        agreement["signature_hash"],
                        agreement["signed_at"],
                        agreement["document_version"],
                        agreement["content_hash"],
                        agreement["ip_address"],
                        agreement["user_agent"],
                        agreement["created_at"]
                    ]
                )
                
        except Exception as e:
            logger.error(f"❌ Error saving legal agreement: {e}")
            raise

    def _save_subscription(self, subscription: Dict[str, Any]) -> None:
        """Save subscription to database"""
        try:
            if self.db_connector:
                self.db_connector.query(
                    """
                    INSERT INTO subscriptions (user_id, plan_id, status, trial_ends_at, payment_data, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    [
                        subscription["user_id"],
                        subscription["plan_id"],
                        subscription["status"],
                        subscription["trial_ends_at"],
                        json.dumps(subscription["payment_data"]),
                        subscription["created_at"]
                    ]
                )
                
        except Exception as e:
            logger.error(f"❌ Error saving subscription: {e}")
            raise

    def _create_audit_log(self, user_id: str, action: str, data: Dict[str, Any]) -> None:
        """Create audit log entry"""
        try:
            if self.db_connector:
                self.db_connector.query(
                    """
                    INSERT INTO onboarding_audit_logs (user_id, action, data, timestamp)
                    VALUES (%s, %s, %s, %s)
                    """,
                    [
                        user_id,
                        action,
                        json.dumps(data),
                        datetime.now().isoformat()
                    ]
                )
                
        except Exception as e:
            logger.error(f"❌ Error creating audit log: {e}")
            # Don't raise - audit logging is not critical
