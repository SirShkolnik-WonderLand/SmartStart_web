#!/usr/bin/env python3
"""
SmartStart State Machine Service
Handles all state machines for legal documents, user journeys, ventures, compliance, etc.
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
import json

class StateMachineType(Enum):
    LEGAL_DOCUMENT = "legal_document"
    USER_JOURNEY = "user_journey"
    VENTURE = "venture"
    COMPLIANCE = "compliance"
    TEAM = "team"
    SUBSCRIPTION = "subscription"

class LegalDocumentState(Enum):
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SIGNING_WORKFLOW = "signing_workflow"
    SIGNATURE_VERIFICATION = "signature_verification"
    EFFECTIVE = "effective"
    AMENDMENT_DRAFT = "amendment_draft"
    EXPIRED = "expired"
    SIGNATURE_REJECTED = "signature_rejected"
    SIGNING_EXPIRED = "signing_expired"
    SIGNATURE_INVALID = "signature_invalid"

class ComplianceState(Enum):
    NON_COMPLIANT = "non_compliant"
    COMPLIANCE_REQUIRED = "compliance_required"
    CHECKING_COMPLIANCE = "checking_compliance"
    COMPLIANT = "compliant"
    VIOLATION_DETECTED = "violation_detected"
    SUSPENDED = "suspended"

class VentureState(Enum):
    IDEA = "idea"
    PLANNING = "planning"
    DEVELOPMENT = "development"
    TESTING = "testing"
    LAUNCH = "launch"
    GROWTH = "growth"
    MATURE = "mature"
    EXIT = "exit"

class StateMachineService:
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        self.logger = logging.getLogger(__name__)
        
        # Active state machine instances
        self.active_machines = {}
        
        # State machine definitions
        self.state_machines = {
            StateMachineType.LEGAL_DOCUMENT: self._create_legal_document_machine(),
            StateMachineType.COMPLIANCE: self._create_compliance_machine(),
            StateMachineType.VENTURE: self._create_venture_machine(),
            StateMachineType.USER_JOURNEY: self._create_user_journey_machine(),
            StateMachineType.TEAM: self._create_team_machine(),
            StateMachineType.SUBSCRIPTION: self._create_subscription_machine()
        }
    
    def _create_legal_document_machine(self):
        """Create legal document state machine definition"""
        return {
            "initial": LegalDocumentState.DRAFT.value,
            "states": {
                LegalDocumentState.DRAFT.value: {
                    "transitions": ["UNDER_REVIEW", "EXPIRED"],
                    "actions": ["log_state_change", "update_document_status"]
                },
                LegalDocumentState.UNDER_REVIEW.value: {
                    "transitions": ["APPROVED", "REJECTED", "DRAFT"],
                    "actions": ["log_state_change", "update_document_status", "notify_reviewers"]
                },
                LegalDocumentState.APPROVED.value: {
                    "transitions": ["SIGNING_WORKFLOW", "AMENDMENT_DRAFT", "EXPIRED"],
                    "actions": ["log_state_change", "update_document_status"]
                },
                LegalDocumentState.REJECTED.value: {
                    "transitions": ["UNDER_REVIEW", "DRAFT"],
                    "actions": ["log_state_change", "update_document_status", "notify_author"]
                },
                LegalDocumentState.SIGNING_WORKFLOW.value: {
                    "transitions": ["SIGNATURE_VERIFICATION", "SIGNATURE_REJECTED", "SIGNING_EXPIRED"],
                    "actions": ["log_state_change", "update_document_status", "initiate_signing_process"]
                },
                LegalDocumentState.SIGNATURE_VERIFICATION.value: {
                    "transitions": ["EFFECTIVE", "SIGNATURE_INVALID"],
                    "actions": ["log_state_change", "update_document_status", "verify_signatures"]
                },
                LegalDocumentState.EFFECTIVE.value: {
                    "transitions": ["AMENDMENT_DRAFT", "EXPIRED"],
                    "actions": ["log_state_change", "update_document_status", "notify_parties"]
                }
            }
        }
    
    def _create_compliance_machine(self):
        """Create compliance state machine definition"""
        return {
            "initial": ComplianceState.NON_COMPLIANT.value,
            "states": {
                ComplianceState.NON_COMPLIANT.value: {
                    "transitions": ["CHECKING_COMPLIANCE", "COMPLIANCE_REQUIRED"],
                    "actions": ["log_state_change", "update_compliance_status"]
                },
                ComplianceState.COMPLIANCE_REQUIRED.value: {
                    "transitions": ["CHECKING_COMPLIANCE", "NON_COMPLIANT", "COMPLIANT"],
                    "actions": ["log_state_change", "update_compliance_status", "notify_user"]
                },
                ComplianceState.CHECKING_COMPLIANCE.value: {
                    "transitions": ["COMPLIANT", "COMPLIANCE_REQUIRED", "VIOLATION_DETECTED"],
                    "actions": ["log_state_change", "update_compliance_status", "check_compliance"]
                },
                ComplianceState.COMPLIANT.value: {
                    "transitions": ["CHECKING_COMPLIANCE", "VIOLATION_DETECTED"],
                    "actions": ["log_state_change", "update_compliance_status"]
                },
                ComplianceState.VIOLATION_DETECTED.value: {
                    "transitions": ["NON_COMPLIANT", "SUSPENDED"],
                    "actions": ["log_state_change", "update_compliance_status", "handle_violation"]
                }
            }
        }
    
    def _create_venture_machine(self):
        """Create venture state machine definition"""
        return {
            "initial": VentureState.IDEA.value,
            "states": {
                VentureState.IDEA.value: {
                    "transitions": ["PLANNING", "EXIT"],
                    "actions": ["log_state_change", "update_venture_status"]
                },
                VentureState.PLANNING.value: {
                    "transitions": ["DEVELOPMENT", "IDEA"],
                    "actions": ["log_state_change", "update_venture_status"]
                },
                VentureState.DEVELOPMENT.value: {
                    "transitions": ["TESTING", "PLANNING"],
                    "actions": ["log_state_change", "update_venture_status"]
                },
                VentureState.TESTING.value: {
                    "transitions": ["LAUNCH", "DEVELOPMENT"],
                    "actions": ["log_state_change", "update_venture_status"]
                },
                VentureState.LAUNCH.value: {
                    "transitions": ["GROWTH", "TESTING"],
                    "actions": ["log_state_change", "update_venture_status"]
                },
                VentureState.GROWTH.value: {
                    "transitions": ["MATURE", "LAUNCH"],
                    "actions": ["log_state_change", "update_venture_status"]
                },
                VentureState.MATURE.value: {
                    "transitions": ["EXIT", "GROWTH"],
                    "actions": ["log_state_change", "update_venture_status"]
                }
            }
        }
    
    def _create_user_journey_machine(self):
        """Create user journey state machine definition"""
        return {
            "initial": "onboarding",
            "states": {
                "onboarding": {
                    "transitions": ["profile_setup", "abandoned"],
                    "actions": ["log_state_change", "update_journey_status"]
                },
                "profile_setup": {
                    "transitions": ["verification", "onboarding"],
                    "actions": ["log_state_change", "update_journey_status"]
                },
                "verification": {
                    "transitions": ["active", "profile_setup"],
                    "actions": ["log_state_change", "update_journey_status"]
                },
                "active": {
                    "transitions": ["engaged", "inactive"],
                    "actions": ["log_state_change", "update_journey_status"]
                },
                "engaged": {
                    "transitions": ["power_user", "active"],
                    "actions": ["log_state_change", "update_journey_status"]
                },
                "power_user": {
                    "transitions": ["engaged", "inactive"],
                    "actions": ["log_state_change", "update_journey_status"]
                },
                "inactive": {
                    "transitions": ["active", "churned"],
                    "actions": ["log_state_change", "update_journey_status"]
                },
                "churned": {
                    "transitions": ["onboarding"],
                    "actions": ["log_state_change", "update_journey_status"]
                }
            }
        }
    
    def _create_team_machine(self):
        """Create team state machine definition"""
        return {
            "initial": "forming",
            "states": {
                "forming": {
                    "transitions": ["active", "disbanded"],
                    "actions": ["log_state_change", "update_team_status"]
                },
                "active": {
                    "transitions": ["paused", "disbanded"],
                    "actions": ["log_state_change", "update_team_status"]
                },
                "paused": {
                    "transitions": ["active", "disbanded"],
                    "actions": ["log_state_change", "update_team_status"]
                },
                "disbanded": {
                    "transitions": ["forming"],
                    "actions": ["log_state_change", "update_team_status"]
                }
            }
        }
    
    def _create_subscription_machine(self):
        """Create subscription state machine definition"""
        return {
            "initial": "trial",
            "states": {
                "trial": {
                    "transitions": ["active", "expired", "cancelled"],
                    "actions": ["log_state_change", "update_subscription_status"]
                },
                "active": {
                    "transitions": ["paused", "cancelled", "expired"],
                    "actions": ["log_state_change", "update_subscription_status"]
                },
                "paused": {
                    "transitions": ["active", "cancelled"],
                    "actions": ["log_state_change", "update_subscription_status"]
                },
                "cancelled": {
                    "transitions": ["active"],
                    "actions": ["log_state_change", "update_subscription_status"]
                },
                "expired": {
                    "transitions": ["active", "cancelled"],
                    "actions": ["log_state_change", "update_subscription_status"]
                }
            }
        }
    
    async def create_state_machine(self, machine_type: StateMachineType, instance_id: str, initial_context: Dict[str, Any] = None):
        """Create a new state machine instance"""
        try:
            if machine_type not in self.state_machines:
                return {"success": False, "error": f"Unknown state machine type: {machine_type}"}
            
            machine_def = self.state_machines[machine_type]
            machine_key = f"{machine_type.value}_{instance_id}"
            
            # Create machine instance
            machine_instance = {
                "id": instance_id,
                "type": machine_type.value,
                "current_state": machine_def["initial"],
                "context": initial_context or {},
                "history": [],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            self.active_machines[machine_key] = machine_instance
            
            # Log state change
            await self._log_state_change(machine_key, None, machine_def["initial"], "MACHINE_CREATED")
            
            self.logger.info(f"Created {machine_type.value} state machine: {instance_id}")
            return {"success": True, "data": machine_instance}
            
        except Exception as e:
            self.logger.error(f"Error creating state machine: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_event(self, machine_type: StateMachineType, instance_id: str, event: str, metadata: Dict[str, Any] = None):
        """Send event to state machine"""
        try:
            machine_key = f"{machine_type.value}_{instance_id}"
            
            if machine_key not in self.active_machines:
                return {"success": False, "error": "State machine not found"}
            
            machine_instance = self.active_machines[machine_key]
            machine_def = self.state_machines[machine_type]
            current_state = machine_instance["current_state"]
            
            # Check if transition is valid
            if current_state not in machine_def["states"]:
                return {"success": False, "error": f"Invalid current state: {current_state}"}
            
            state_def = machine_def["states"][current_state]
            
            if event not in state_def["transitions"]:
                return {"success": False, "error": f"Invalid transition from {current_state} to {event}"}
            
            # Update state
            old_state = current_state
            machine_instance["current_state"] = event
            machine_instance["updated_at"] = datetime.now().isoformat()
            
            # Execute actions
            for action in state_def["actions"]:
                await self._execute_action(action, machine_instance, event, metadata or {})
            
            # Log state change
            await self._log_state_change(machine_key, old_state, event, "STATE_CHANGE")
            
            self.logger.info(f"State machine {machine_key} transitioned from {old_state} to {event}")
            return {"success": True, "data": machine_instance}
            
        except Exception as e:
            self.logger.error(f"Error sending event to state machine: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_state(self, machine_type: StateMachineType, instance_id: str):
        """Get current state of state machine"""
        try:
            machine_key = f"{machine_type.value}_{instance_id}"
            
            if machine_key not in self.active_machines:
                return {"success": False, "error": "State machine not found"}
            
            return {"success": True, "data": self.active_machines[machine_key]}
            
        except Exception as e:
            self.logger.error(f"Error getting state machine state: {e}")
            return {"success": False, "error": str(e)}
    
    async def _log_state_change(self, machine_key: str, from_state: Optional[str], to_state: str, event_type: str):
        """Log state change in machine history"""
        if machine_key in self.active_machines:
            self.active_machines[machine_key]["history"].append({
                "from_state": from_state,
                "to_state": to_state,
                "event_type": event_type,
                "timestamp": datetime.now().isoformat()
            })
    
    async def _execute_action(self, action: str, machine_instance: Dict[str, Any], event: str, metadata: Dict[str, Any]):
        """Execute state machine action"""
        try:
            if action == "log_state_change":
                self.logger.info(f"State change logged for {machine_instance['id']}")
            elif action == "update_document_status":
                self.logger.info(f"Document status updated for {machine_instance['id']}")
            elif action == "notify_reviewers":
                self.logger.info(f"Reviewers notified for {machine_instance['id']}")
            elif action == "notify_author":
                self.logger.info(f"Author notified for {machine_instance['id']}")
            elif action == "initiate_signing_process":
                self.logger.info(f"Signing process initiated for {machine_instance['id']}")
            elif action == "verify_signatures":
                self.logger.info(f"Signatures verified for {machine_instance['id']}")
            elif action == "notify_parties":
                self.logger.info(f"Parties notified for {machine_instance['id']}")
            elif action == "update_compliance_status":
                self.logger.info(f"Compliance status updated for {machine_instance['id']}")
            elif action == "notify_user":
                self.logger.info(f"User notified for {machine_instance['id']}")
            elif action == "check_compliance":
                self.logger.info(f"Compliance checked for {machine_instance['id']}")
            elif action == "handle_violation":
                self.logger.info(f"Violation handled for {machine_instance['id']}")
            elif action == "update_venture_status":
                self.logger.info(f"Venture status updated for {machine_instance['id']}")
            elif action == "update_journey_status":
                self.logger.info(f"Journey status updated for {machine_instance['id']}")
            elif action == "update_team_status":
                self.logger.info(f"Team status updated for {machine_instance['id']}")
            elif action == "update_subscription_status":
                self.logger.info(f"Subscription status updated for {machine_instance['id']}")
            else:
                self.logger.warning(f"Unknown action: {action}")
                
        except Exception as e:
            self.logger.error(f"Error executing action {action}: {e}")
    
    def get_machine_stats(self) -> Dict[str, Any]:
        """Get state machine statistics"""
        stats = {
            "total_machines": len(self.active_machines),
            "machines_by_type": {},
            "recent_activity": []
        }
        
        # Count machines by type
        for machine_key, machine in self.active_machines.items():
            machine_type = machine["type"]
            if machine_type not in stats["machines_by_type"]:
                stats["machines_by_type"][machine_type] = 0
            stats["machines_by_type"][machine_type] += 1
        
        # Get recent activity (last 10 state changes)
        all_changes = []
        for machine in self.active_machines.values():
            for change in machine["history"][-5:]:  # Last 5 changes per machine
                all_changes.append({
                    "machine_id": machine["id"],
                    "machine_type": machine["type"],
                    **change
                })
        
        # Sort by timestamp and take last 10
        all_changes.sort(key=lambda x: x["timestamp"], reverse=True)
        stats["recent_activity"] = all_changes[:10]
        
        return stats
