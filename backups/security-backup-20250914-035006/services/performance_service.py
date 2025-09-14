#!/usr/bin/env python3
"""
Performance Service - Python Brain
Handles performance monitoring, optimization, and system health
"""

import logging
import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict, deque
import json

logger = logging.getLogger(__name__)

class PerformanceService:
    """Advanced performance monitoring and optimization service"""
    
    def __init__(self, nodejs_connector=None):
        self.nodejs_connector = nodejs_connector
        self.metrics = {
            "response_times": deque(maxlen=1000),
            "memory_usage": deque(maxlen=1000),
            "cpu_usage": deque(maxlen=1000),
            "request_counts": defaultdict(int),
            "error_counts": defaultdict(int),
            "api_performance": defaultdict(list)
        }
        self.performance_thresholds = {
            "max_response_time": 2.0,  # 2 seconds
            "max_memory_usage": 80.0,  # 80%
            "max_cpu_usage": 90.0,     # 90%
            "max_error_rate": 0.05     # 5%
        }
        self.alerts = []
        self.monitoring_active = False
        self.monitor_thread = None
        
        logger.info("⚡ Performance Service initialized")

    def start_monitoring(self):
        """Start performance monitoring"""
        try:
            if not self.monitoring_active:
                self.monitoring_active = True
                self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
                self.monitor_thread.start()
                logger.info("Performance monitoring started")
        except Exception as e:
            logger.error(f"Start monitoring error: {e}")

    def stop_monitoring(self):
        """Stop performance monitoring"""
        try:
            self.monitoring_active = False
            if self.monitor_thread:
                self.monitor_thread.join(timeout=1)
            logger.info("Performance monitoring stopped")
        except Exception as e:
            logger.error(f"Stop monitoring error: {e}")

    def record_request(self, endpoint: str, response_time: float, success: bool = True):
        """Record API request performance"""
        try:
            # Record response time
            self.metrics["response_times"].append(response_time)
            
            # Record request count
            self.metrics["request_counts"][endpoint] += 1
            
            # Record API performance
            self.metrics["api_performance"][endpoint].append({
                "response_time": response_time,
                "success": success,
                "timestamp": datetime.now().isoformat()
            })
            
            # Keep only last 100 requests per endpoint
            if len(self.metrics["api_performance"][endpoint]) > 100:
                self.metrics["api_performance"][endpoint] = self.metrics["api_performance"][endpoint][-100:]
            
            # Record error if not successful
            if not success:
                self.metrics["error_counts"][endpoint] += 1
            
            # Check for performance issues
            self._check_performance_thresholds(endpoint, response_time)
            
        except Exception as e:
            logger.error(f"Record request error: {e}")

    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics"""
        try:
            # Calculate response time statistics
            response_times = list(self.metrics["response_times"])
            response_stats = self._calculate_stats(response_times)
            
            # Calculate memory usage statistics
            memory_usage = list(self.metrics["memory_usage"])
            memory_stats = self._calculate_stats(memory_usage)
            
            # Calculate CPU usage statistics
            cpu_usage = list(self.metrics["cpu_usage"])
            cpu_stats = self._calculate_stats(cpu_usage)
            
            # Calculate error rates
            error_rates = {}
            for endpoint in self.metrics["request_counts"]:
                total_requests = self.metrics["request_counts"][endpoint]
                total_errors = self.metrics["error_counts"][endpoint]
                error_rates[endpoint] = total_errors / max(total_requests, 1)
            
            # Get system metrics
            system_metrics = self._get_system_metrics()
            
            return {
                "response_times": response_stats,
                "memory_usage": memory_stats,
                "cpu_usage": cpu_stats,
                "error_rates": error_rates,
                "system_metrics": system_metrics,
                "active_alerts": len(self.alerts),
                "monitoring_status": "active" if self.monitoring_active else "inactive",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Get performance metrics error: {e}")
            return {}

    def get_endpoint_performance(self, endpoint: str) -> Dict[str, Any]:
        """Get performance metrics for specific endpoint"""
        try:
            endpoint_data = self.metrics["api_performance"].get(endpoint, [])
            
            if not endpoint_data:
                return {
                    "endpoint": endpoint,
                    "total_requests": 0,
                    "avg_response_time": 0,
                    "error_rate": 0,
                    "status": "no_data"
                }
            
            # Calculate metrics
            response_times = [req["response_time"] for req in endpoint_data]
            success_count = sum(1 for req in endpoint_data if req["success"])
            total_requests = len(endpoint_data)
            
            return {
                "endpoint": endpoint,
                "total_requests": total_requests,
                "successful_requests": success_count,
                "failed_requests": total_requests - success_count,
                "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
                "min_response_time": min(response_times) if response_times else 0,
                "max_response_time": max(response_times) if response_times else 0,
                "error_rate": (total_requests - success_count) / max(total_requests, 1),
                "last_request": endpoint_data[-1]["timestamp"] if endpoint_data else None,
                "status": "healthy" if (total_requests - success_count) / max(total_requests, 1) < 0.05 else "degraded"
            }
            
        except Exception as e:
            logger.error(f"Get endpoint performance error: {e}")
            return {}

    def get_slow_queries(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get slowest API endpoints"""
        try:
            slow_queries = []
            
            for endpoint, requests in self.metrics["api_performance"].items():
                if requests:
                    avg_response_time = sum(req["response_time"] for req in requests) / len(requests)
                    slow_queries.append({
                        "endpoint": endpoint,
                        "avg_response_time": round(avg_response_time, 3),
                        "request_count": len(requests),
                        "last_request": requests[-1]["timestamp"]
                    })
            
            # Sort by response time and return top N
            slow_queries.sort(key=lambda x: x["avg_response_time"], reverse=True)
            return slow_queries[:limit]
            
        except Exception as e:
            logger.error(f"Get slow queries error: {e}")
            return []

    def get_performance_alerts(self) -> List[Dict[str, Any]]:
        """Get current performance alerts"""
        try:
            # Filter recent alerts (last 24 hours)
            recent_alerts = []
            cutoff_time = datetime.now() - timedelta(hours=24)
            
            for alert in self.alerts:
                alert_time = datetime.fromisoformat(alert["timestamp"])
                if alert_time > cutoff_time:
                    recent_alerts.append(alert)
            
            return recent_alerts
            
        except Exception as e:
            logger.error(f"Get performance alerts error: {e}")
            return []

    def optimize_performance(self) -> Dict[str, Any]:
        """Run performance optimization"""
        try:
            optimizations = []
            
            # Check for slow endpoints
            slow_queries = self.get_slow_queries(5)
            for query in slow_queries:
                if query["avg_response_time"] > self.performance_thresholds["max_response_time"]:
                    optimizations.append({
                        "type": "slow_endpoint",
                        "endpoint": query["endpoint"],
                        "current_time": query["avg_response_time"],
                        "threshold": self.performance_thresholds["max_response_time"],
                        "recommendation": "Consider caching or query optimization"
                    })
            
            # Check for high error rates
            error_rates = {}
            for endpoint in self.metrics["request_counts"]:
                total_requests = self.metrics["request_counts"][endpoint]
                total_errors = self.metrics["error_counts"][endpoint]
                error_rate = total_errors / max(total_requests, 1)
                
                if error_rate > self.performance_thresholds["max_error_rate"]:
                    error_rates[endpoint] = error_rate
                    optimizations.append({
                        "type": "high_error_rate",
                        "endpoint": endpoint,
                        "current_rate": error_rate,
                        "threshold": self.performance_thresholds["max_error_rate"],
                        "recommendation": "Investigate and fix errors"
                    })
            
            # Check memory usage
            current_memory = psutil.virtual_memory().percent
            if current_memory > self.performance_thresholds["max_memory_usage"]:
                optimizations.append({
                    "type": "high_memory_usage",
                    "current_usage": current_memory,
                    "threshold": self.performance_thresholds["max_memory_usage"],
                    "recommendation": "Consider memory optimization or scaling"
                })
            
            # Check CPU usage
            current_cpu = psutil.cpu_percent()
            if current_cpu > self.performance_thresholds["max_cpu_usage"]:
                optimizations.append({
                    "type": "high_cpu_usage",
                    "current_usage": current_cpu,
                    "threshold": self.performance_thresholds["max_cpu_usage"],
                    "recommendation": "Consider CPU optimization or scaling"
                })
            
            return {
                "success": True,
                "optimizations": optimizations,
                "total_issues": len(optimizations),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Optimize performance error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_health_score(self) -> Dict[str, Any]:
        """Calculate overall system health score"""
        try:
            score = 100.0
            issues = []
            
            # Response time score
            response_times = list(self.metrics["response_times"])
            if response_times:
                avg_response_time = sum(response_times) / len(response_times)
                if avg_response_time > self.performance_thresholds["max_response_time"]:
                    score -= 20
                    issues.append("High response times")
            
            # Error rate score
            total_requests = sum(self.metrics["request_counts"].values())
            total_errors = sum(self.metrics["error_counts"].values())
            if total_requests > 0:
                error_rate = total_errors / total_requests
                if error_rate > self.performance_thresholds["max_error_rate"]:
                    score -= 30
                    issues.append("High error rate")
            
            # Memory usage score
            current_memory = psutil.virtual_memory().percent
            if current_memory > self.performance_thresholds["max_memory_usage"]:
                score -= 25
                issues.append("High memory usage")
            
            # CPU usage score
            current_cpu = psutil.cpu_percent()
            if current_cpu > self.performance_thresholds["max_cpu_usage"]:
                score -= 25
                issues.append("High CPU usage")
            
            # Determine health status
            if score >= 90:
                status = "excellent"
            elif score >= 70:
                status = "good"
            elif score >= 50:
                status = "fair"
            else:
                status = "poor"
            
            return {
                "health_score": max(0, round(score, 1)),
                "status": status,
                "issues": issues,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Get health score error: {e}")
            return {
                "health_score": 0,
                "status": "unknown",
                "issues": ["Error calculating health score"],
                "timestamp": datetime.now().isoformat()
            }

    def _monitor_loop(self):
        """Background monitoring loop"""
        while self.monitoring_active:
            try:
                # Record system metrics
                self._record_system_metrics()
                
                # Check for performance issues
                self._check_system_health()
                
                # Sleep for 30 seconds
                time.sleep(30)
                
            except Exception as e:
                logger.error(f"Monitor loop error: {e}")
                time.sleep(30)

    def _record_system_metrics(self):
        """Record current system metrics"""
        try:
            # Memory usage
            memory_percent = psutil.virtual_memory().percent
            self.metrics["memory_usage"].append(memory_percent)
            
            # CPU usage
            cpu_percent = psutil.cpu_percent()
            self.metrics["cpu_usage"].append(cpu_percent)
            
        except Exception as e:
            logger.error(f"Record system metrics error: {e}")

    def _check_system_health(self):
        """Check system health and create alerts"""
        try:
            # Check memory usage
            current_memory = psutil.virtual_memory().percent
            if current_memory > self.performance_thresholds["max_memory_usage"]:
                self._create_alert("high_memory", f"Memory usage is {current_memory}%", "warning")
            
            # Check CPU usage
            current_cpu = psutil.cpu_percent()
            if current_cpu > self.performance_thresholds["max_cpu_usage"]:
                self._create_alert("high_cpu", f"CPU usage is {current_cpu}%", "warning")
            
            # Check disk usage
            disk_usage = psutil.disk_usage('/').percent
            if disk_usage > 90:
                self._create_alert("high_disk", f"Disk usage is {disk_usage}%", "critical")
            
        except Exception as e:
            logger.error(f"Check system health error: {e}")

    def _check_performance_thresholds(self, endpoint: str, response_time: float):
        """Check if performance thresholds are exceeded"""
        try:
            if response_time > self.performance_thresholds["max_response_time"]:
                self._create_alert("slow_endpoint", f"Endpoint {endpoint} is slow: {response_time}s", "warning")
            
            # Check error rate for this endpoint
            total_requests = self.metrics["request_counts"][endpoint]
            total_errors = self.metrics["error_counts"][endpoint]
            if total_requests > 10:  # Only check after sufficient requests
                error_rate = total_errors / total_requests
                if error_rate > self.performance_thresholds["max_error_rate"]:
                    self._create_alert("high_error_rate", f"Endpoint {endpoint} has high error rate: {error_rate:.2%}", "error")
            
        except Exception as e:
            logger.error(f"Check performance thresholds error: {e}")

    def _create_alert(self, alert_type: str, message: str, severity: str):
        """Create a performance alert"""
        try:
            alert = {
                "type": alert_type,
                "message": message,
                "severity": severity,
                "timestamp": datetime.now().isoformat()
            }
            self.alerts.append(alert)
            
            # Keep only last 100 alerts
            if len(self.alerts) > 100:
                self.alerts = self.alerts[-100:]
            
            logger.warning(f"Performance alert: {message}")
            
        except Exception as e:
            logger.error(f"Create alert error: {e}")

    def _calculate_stats(self, data: List[float]) -> Dict[str, float]:
        """Calculate statistics for a list of numbers"""
        try:
            if not data:
                return {"count": 0, "avg": 0, "min": 0, "max": 0, "median": 0}
            
            data_sorted = sorted(data)
            count = len(data)
            avg = sum(data) / count
            min_val = min(data)
            max_val = max(data)
            
            # Calculate median
            if count % 2 == 0:
                median = (data_sorted[count // 2 - 1] + data_sorted[count // 2]) / 2
            else:
                median = data_sorted[count // 2]
            
            return {
                "count": count,
                "avg": round(avg, 3),
                "min": round(min_val, 3),
                "max": round(max_val, 3),
                "median": round(median, 3)
            }
            
        except Exception as e:
            logger.error(f"Calculate stats error: {e}")
            return {"count": 0, "avg": 0, "min": 0, "max": 0, "median": 0}

    def _get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        try:
            return {
                "memory": {
                    "total": psutil.virtual_memory().total,
                    "available": psutil.virtual_memory().available,
                    "percent": psutil.virtual_memory().percent,
                    "used": psutil.virtual_memory().used
                },
                "cpu": {
                    "percent": psutil.cpu_percent(),
                    "count": psutil.cpu_count()
                },
                "disk": {
                    "total": psutil.disk_usage('/').total,
                    "used": psutil.disk_usage('/').used,
                    "free": psutil.disk_usage('/').free,
                    "percent": psutil.disk_usage('/').percent
                },
                "uptime": time.time() - psutil.boot_time()
            }
            
        except Exception as e:
            logger.error(f"Get system metrics error: {e}")
            return {}
