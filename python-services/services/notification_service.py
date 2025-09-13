#!/usr/bin/env python3
"""
Notification Service - Python Brain
Handles all notifications, email, push notifications, and messaging
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json

logger = logging.getLogger(__name__)

class NotificationService:
    """Notification service handling all communication and alerts"""

    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        self.notification_types = {
            'email': 'Email notification',
            'push': 'Push notification',
            'in_app': 'In-app notification',
            'sms': 'SMS notification',
            'webhook': 'Webhook notification'
        }
        logger.info("🔔 Notification Service initialized")

    def send_notification(self, user_id: str, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send a notification to a user"""
        try:
            # Validate required fields
            required_fields = ['type', 'title', 'message']
            for field in required_fields:
                if field not in notification_data:
                    return {
                        "success": False,
                        "message": f"Missing required field: {field}",
                        "error_code": "MISSING_FIELD"
                    }

            notification_type = notification_data['type']
            if notification_type not in self.notification_types:
                return {
                    "success": False,
                    "message": f"Invalid notification type: {notification_type}",
                    "error_code": "INVALID_TYPE"
                }

            # Get user preferences
            user_prefs = self._get_user_notification_preferences(user_id)
            if not user_prefs.get('success'):
                return user_prefs

            # Check if user wants this type of notification
            if not user_prefs['data'].get(notification_type, True):
                return {
                    "success": True,
                    "message": "Notification skipped due to user preferences"
                }

            # Create notification record
            notification_id = self._generate_notification_id()
            notification_record = {
                "id": notification_id,
                "user_id": user_id,
                "type": notification_type,
                "title": notification_data['title'],
                "message": notification_data['message'],
                "data": notification_data.get('data', {}),
                "priority": notification_data.get('priority', 'normal'),
                "status": 'pending',
                "created_at": datetime.now().isoformat(),
                "sent_at": None,
                "read_at": None
            }

            # Store notification in database
            if self.nodejs_connector:
                store_result = self.nodejs_connector.create_notification(notification_record)
                if not store_result.get('success'):
                    return store_result

            # Send notification based on type
            send_result = self._send_by_type(notification_type, user_id, notification_data)
            if not send_result.get('success'):
                return send_result

            # Update notification status
            if self.nodejs_connector:
                self.nodejs_connector.update_notification_status(
                    notification_id, 'sent', datetime.now().isoformat()
                )

            return {
                "success": True,
                "message": "Notification sent successfully",
                "data": {
                    "notification_id": notification_id,
                    "type": notification_type,
                    "sent_at": datetime.now().isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Send notification error: {e}")
            return {
                "success": False,
                "message": "Failed to send notification",
                "error": str(e)
            }

    def send_bulk_notification(self, user_ids: List[str], notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send notification to multiple users"""
        try:
            results = []
            success_count = 0
            failure_count = 0

            for user_id in user_ids:
                result = self.send_notification(user_id, notification_data)
                results.append({
                    "user_id": user_id,
                    "success": result.get('success', False),
                    "message": result.get('message', '')
                })

                if result.get('success'):
                    success_count += 1
                else:
                    failure_count += 1

            return {
                "success": True,
                "message": f"Bulk notification completed: {success_count} sent, {failure_count} failed",
                "data": {
                    "total_users": len(user_ids),
                    "success_count": success_count,
                    "failure_count": failure_count,
                    "results": results
                }
            }

        except Exception as e:
            logger.error(f"Bulk notification error: {e}")
            return {
                "success": False,
                "message": "Failed to send bulk notification",
                "error": str(e)
            }

    def get_user_notifications(self, user_id: str, status: str = None, 
                             limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """Get notifications for a user"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Get notifications from database
            notifications_result = self.nodejs_connector.get_user_notifications(
                user_id, status, limit, offset
            )
            if not notifications_result.get('success'):
                return notifications_result

            notifications = notifications_result['data']['notifications']
            total = notifications_result['data']['total']

            # Format notifications
            formatted_notifications = []
            for notification in notifications:
                formatted_notifications.append({
                    "id": notification['id'],
                    "type": notification['type'],
                    "title": notification['title'],
                    "message": notification['message'],
                    "data": notification.get('data', {}),
                    "priority": notification.get('priority', 'normal'),
                    "status": notification['status'],
                    "created_at": notification['created_at'],
                    "sent_at": notification.get('sent_at'),
                    "read_at": notification.get('read_at')
                })

            return {
                "success": True,
                "data": {
                    "notifications": formatted_notifications,
                    "pagination": {
                        "limit": limit,
                        "offset": offset,
                        "total": total,
                        "has_more": (offset + limit) < total
                    }
                }
            }

        except Exception as e:
            logger.error(f"Get user notifications error: {e}")
            return {
                "success": False,
                "message": "Failed to get notifications",
                "error": str(e)
            }

    def mark_notification_read(self, notification_id: str, user_id: str) -> Dict[str, Any]:
        """Mark a notification as read"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Verify notification belongs to user
            notification_result = self.nodejs_connector.get_notification(notification_id)
            if not notification_result.get('success'):
                return notification_result

            notification = notification_result['data']
            if notification['user_id'] != user_id:
                return {
                    "success": False,
                    "message": "Access denied",
                    "error_code": "ACCESS_DENIED"
                }

            # Mark as read
            update_result = self.nodejs_connector.update_notification_status(
                notification_id, 'read', datetime.now().isoformat()
            )
            if not update_result.get('success'):
                return update_result

            return {
                "success": True,
                "message": "Notification marked as read"
            }

        except Exception as e:
            logger.error(f"Mark notification read error: {e}")
            return {
                "success": False,
                "message": "Failed to mark notification as read",
                "error": str(e)
            }

    def mark_all_notifications_read(self, user_id: str) -> Dict[str, Any]:
        """Mark all notifications as read for a user"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Mark all as read
            update_result = self.nodejs_connector.mark_all_notifications_read(
                user_id, datetime.now().isoformat()
            )
            if not update_result.get('success'):
                return update_result

            return {
                "success": True,
                "message": "All notifications marked as read"
            }

        except Exception as e:
            logger.error(f"Mark all notifications read error: {e}")
            return {
                "success": False,
                "message": "Failed to mark all notifications as read",
                "error": str(e)
            }

    def delete_notification(self, notification_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a notification"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Verify notification belongs to user
            notification_result = self.nodejs_connector.get_notification(notification_id)
            if not notification_result.get('success'):
                return notification_result

            notification = notification_result['data']
            if notification['user_id'] != user_id:
                return {
                    "success": False,
                    "message": "Access denied",
                    "error_code": "ACCESS_DENIED"
                }

            # Delete notification
            delete_result = self.nodejs_connector.delete_notification(notification_id)
            if not delete_result.get('success'):
                return delete_result

            return {
                "success": True,
                "message": "Notification deleted"
            }

        except Exception as e:
            logger.error(f"Delete notification error: {e}")
            return {
                "success": False,
                "message": "Failed to delete notification",
                "error": str(e)
            }

    def get_notification_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user notification preferences"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            prefs_result = self.nodejs_connector.get_user_notification_preferences(user_id)
            if not prefs_result.get('success'):
                return prefs_result

            return {
                "success": True,
                "data": prefs_result['data']
            }

        except Exception as e:
            logger.error(f"Get notification preferences error: {e}")
            return {
                "success": False,
                "message": "Failed to get notification preferences",
                "error": str(e)
            }

    def update_notification_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Update user notification preferences"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            # Validate preferences
            valid_types = list(self.notification_types.keys())
            for pref_type in preferences:
                if pref_type not in valid_types:
                    return {
                        "success": False,
                        "message": f"Invalid preference type: {pref_type}",
                        "error_code": "INVALID_PREFERENCE_TYPE"
                    }

            # Update preferences
            update_result = self.nodejs_connector.update_user_notification_preferences(
                user_id, preferences
            )
            if not update_result.get('success'):
                return update_result

            return {
                "success": True,
                "message": "Notification preferences updated"
            }

        except Exception as e:
            logger.error(f"Update notification preferences error: {e}")
            return {
                "success": False,
                "message": "Failed to update notification preferences",
                "error": str(e)
            }

    def send_email_notification(self, user_id: str, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send email notification"""
        try:
            # Get user email
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            user_result = self.nodejs_connector.get_user(user_id)
            if not user_result.get('success'):
                return user_result

            user = user_result['data']
            email = user.get('email')

            if not email:
                return {
                    "success": False,
                    "message": "User email not found",
                    "error_code": "NO_EMAIL"
                }

            # In production, this would integrate with an email service
            # For now, we'll just log the email
            logger.info(f"Email notification to {email}: {email_data['subject']}")

            return {
                "success": True,
                "message": "Email notification sent",
                "data": {
                    "recipient": email,
                    "subject": email_data['subject']
                }
            }

        except Exception as e:
            logger.error(f"Send email notification error: {e}")
            return {
                "success": False,
                "message": "Failed to send email notification",
                "error": str(e)
            }

    def send_push_notification(self, user_id: str, push_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send push notification"""
        try:
            # Get user push tokens
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            tokens_result = self.nodejs_connector.get_user_push_tokens(user_id)
            if not tokens_result.get('success'):
                return tokens_result

            tokens = tokens_result['data'].get('tokens', [])

            if not tokens:
                return {
                    "success": False,
                    "message": "No push tokens found for user",
                    "error_code": "NO_PUSH_TOKENS"
                }

            # In production, this would integrate with FCM/APNS
            # For now, we'll just log the push notification
            logger.info(f"Push notification to user {user_id}: {push_data['title']}")

            return {
                "success": True,
                "message": "Push notification sent",
                "data": {
                    "tokens_count": len(tokens)
                }
            }

        except Exception as e:
            logger.error(f"Send push notification error: {e}")
            return {
                "success": False,
                "message": "Failed to send push notification",
                "error": str(e)
            }

    def send_sms_notification(self, user_id: str, sms_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send SMS notification"""
        try:
            # Get user phone number
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            user_result = self.nodejs_connector.get_user(user_id)
            if not user_result.get('success'):
                return user_result

            user = user_result['data']
            phone = user.get('phone')

            if not phone:
                return {
                    "success": False,
                    "message": "User phone number not found",
                    "error_code": "NO_PHONE"
                }

            # In production, this would integrate with an SMS service
            # For now, we'll just log the SMS
            logger.info(f"SMS notification to {phone}: {sms_data['message']}")

            return {
                "success": True,
                "message": "SMS notification sent",
                "data": {
                    "recipient": phone
                }
            }

        except Exception as e:
            logger.error(f"Send SMS notification error: {e}")
            return {
                "success": False,
                "message": "Failed to send SMS notification",
                "error": str(e)
            }

    def _get_user_notification_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user notification preferences"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available"
                }

            prefs_result = self.nodejs_connector.get_user_notification_preferences(user_id)
            if not prefs_result.get('success'):
                # Return default preferences if not found
                return {
                    "success": True,
                    "data": {
                        "email": True,
                        "push": True,
                        "in_app": True,
                        "sms": False,
                        "webhook": False
                    }
                }

            return prefs_result

        except Exception as e:
            logger.error(f"Get user notification preferences error: {e}")
            return {
                "success": False,
                "message": "Failed to get notification preferences"
            }

    def _send_by_type(self, notification_type: str, user_id: str, 
                     notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send notification by type"""
        try:
            if notification_type == 'email':
                return self.send_email_notification(user_id, {
                    "subject": notification_data['title'],
                    "body": notification_data['message']
                })
            elif notification_type == 'push':
                return self.send_push_notification(user_id, {
                    "title": notification_data['title'],
                    "body": notification_data['message']
                })
            elif notification_type == 'sms':
                return self.send_sms_notification(user_id, {
                    "message": f"{notification_data['title']}: {notification_data['message']}"
                })
            elif notification_type == 'in_app':
                # In-app notifications are stored in database
                return {"success": True, "message": "In-app notification stored"}
            elif notification_type == 'webhook':
                # Webhook notifications would be sent to configured endpoints
                return {"success": True, "message": "Webhook notification sent"}
            else:
                return {
                    "success": False,
                    "message": f"Unsupported notification type: {notification_type}"
                }

        except Exception as e:
            logger.error(f"Send by type error: {e}")
            return {
                "success": False,
                "message": "Failed to send notification by type"
            }

    def _generate_notification_id(self) -> str:
        """Generate unique notification ID"""
        import uuid
        return str(uuid.uuid4())

    def get_notification_stats(self, user_id: str = None) -> Dict[str, Any]:
        """Get notification statistics"""
        try:
            if not self.nodejs_connector:
                return {
                    "success": False,
                    "message": "Database connection not available",
                    "error_code": "NO_DB_CONNECTION"
                }

            stats_result = self.nodejs_connector.get_notification_stats(user_id)
            if not stats_result.get('success'):
                return stats_result

            return {
                "success": True,
                "data": stats_result['data']
            }

        except Exception as e:
            logger.error(f"Get notification stats error: {e}")
            return {
                "success": False,
                "message": "Failed to get notification stats",
                "error": str(e)
            }
