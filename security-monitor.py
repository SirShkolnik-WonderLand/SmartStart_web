#!/usr/bin/env python3
"""
Security Monitoring Script for SmartStart Platform
Monitors security events and alerts on suspicious activity
"""

import redis
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecurityMonitor:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.alert_thresholds = {
            'failed_logins': 5,  # Alert after 5 failed logins
            'rate_limit_hits': 10,  # Alert after 10 rate limit hits
            'suspicious_transactions': 3,  # Alert after 3 suspicious transactions
            'admin_access': 1  # Alert on any admin access
        }
    
    def monitor_security_events(self):
        """Monitor security events in real-time"""
        logger.info("🔒 Starting security monitoring...")
        
        while True:
            try:
                # Check for failed login attempts
                self.check_failed_logins()
                
                # Check for rate limit violations
                self.check_rate_limit_violations()
                
                # Check for suspicious BUZ transactions
                self.check_suspicious_transactions()
                
                # Check for admin access
                self.check_admin_access()
                
                time.sleep(10)  # Check every 10 seconds
                
            except KeyboardInterrupt:
                logger.info("Security monitoring stopped")
                break
            except Exception as e:
                logger.error(f"Security monitoring error: {str(e)}")
                time.sleep(30)  # Wait 30 seconds on error
    
    def check_failed_logins(self):
        """Check for excessive failed login attempts"""
        try:
            failed_logins = self.redis_client.get('failed_logins')
            if failed_logins and int(failed_logins) > self.alert_thresholds['failed_logins']:
                self.send_alert('HIGH', f"Excessive failed login attempts: {failed_logins}")
        except Exception as e:
            logger.error(f"Error checking failed logins: {str(e)}")
    
    def check_rate_limit_violations(self):
        """Check for rate limit violations"""
        try:
            rate_limit_hits = self.redis_client.get('rate_limit_hits')
            if rate_limit_hits and int(rate_limit_hits) > self.alert_thresholds['rate_limit_hits']:
                self.send_alert('MEDIUM', f"High rate limit violations: {rate_limit_hits}")
        except Exception as e:
            logger.error(f"Error checking rate limit violations: {str(e)}")
    
    def check_suspicious_transactions(self):
        """Check for suspicious BUZ transactions"""
        try:
            suspicious_tx = self.redis_client.get('suspicious_transactions')
            if suspicious_tx and int(suspicious_tx) > self.alert_thresholds['suspicious_transactions']:
                self.send_alert('HIGH', f"Suspicious BUZ transactions detected: {suspicious_tx}")
        except Exception as e:
            logger.error(f"Error checking suspicious transactions: {str(e)}")
    
    def check_admin_access(self):
        """Check for admin access attempts"""
        try:
            admin_access = self.redis_client.get('admin_access')
            if admin_access and int(admin_access) > self.alert_thresholds['admin_access']:
                self.send_alert('CRITICAL', f"Admin access detected: {admin_access}")
        except Exception as e:
            logger.error(f"Error checking admin access: {str(e)}")
    
    def send_alert(self, severity: str, message: str):
        """Send security alert"""
        alert = {
            'timestamp': datetime.utcnow().isoformat(),
            'severity': severity,
            'message': message,
            'service': 'SmartStart Security Monitor'
        }
        
        logger.warning(f"🚨 SECURITY ALERT [{severity}]: {message}")
        
        # Store alert in Redis
        self.redis_client.lpush('security_alerts', json.dumps(alert))
        
        # Keep only last 1000 alerts
        self.redis_client.ltrim('security_alerts', 0, 999)

if __name__ == "__main__":
    monitor = SecurityMonitor()
    monitor.monitor_security_events()
