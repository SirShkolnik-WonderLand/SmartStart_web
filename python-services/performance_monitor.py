"""
Performance Monitoring for Render Professional Plan
Optimized for HIPAA-compliant deployment
"""

import time
import logging
import psutil
from functools import wraps
from flask import request, g

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    def __init__(self):
        self.start_time = time.time()
        self.request_count = 0
        self.total_response_time = 0
        
    def get_system_metrics(self):
        """Get current system performance metrics"""
        return {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'uptime': time.time() - self.start_time,
            'request_count': self.request_count,
            'avg_response_time': self.total_response_time / max(self.request_count, 1)
        }
    
    def log_performance(self, endpoint, response_time):
        """Log performance metrics for an endpoint"""
        self.request_count += 1
        self.total_response_time += response_time
        
        metrics = self.get_system_metrics()
        
        logger.info(f"Performance: {endpoint} - {response_time:.3f}s - "
                   f"CPU: {metrics['cpu_percent']:.1f}% - "
                   f"Memory: {metrics['memory_percent']:.1f}%")

# Global performance monitor
perf_monitor = PerformanceMonitor()

def monitor_performance(f):
    """Decorator to monitor endpoint performance"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = f(*args, **kwargs)
            response_time = time.time() - start_time
            
            # Log performance metrics
            perf_monitor.log_performance(request.endpoint, response_time)
            
            return result
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"Error in {request.endpoint}: {str(e)} - {response_time:.3f}s")
            raise
    
    return decorated_function

def get_health_metrics():
    """Get health metrics for Render health checks"""
    metrics = perf_monitor.get_system_metrics()
    
    # Determine health status
    is_healthy = (
        metrics['cpu_percent'] < 80 and
        metrics['memory_percent'] < 85 and
        metrics['disk_percent'] < 90 and
        metrics['avg_response_time'] < 2.0
    )
    
    return {
        'status': 'healthy' if is_healthy else 'unhealthy',
        'metrics': metrics,
        'timestamp': time.time()
    }
