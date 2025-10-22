/**
 * Security Monitoring & Alerting System
 * Real-time threat detection and response
 */

import { Request, Response, NextFunction } from 'express';

interface SecurityEvent {
  id: string;
  type: 'suspicious_request' | 'rate_limit_exceeded' | 'malicious_input' | 'unauthorized_access' | 'error_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  url: string;
  method: string;
  timestamp: Date;
  details: any;
  resolved: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (event: SecurityEvent) => boolean;
  action: (event: SecurityEvent) => void;
  cooldown: number; // minutes
  lastTriggered: Date | null;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private alertRules: AlertRule[] = [];
  private blockedIPs: Set<string> = new Set();
  private suspiciousIPs: Map<string, number> = new Map();

  constructor() {
    this.setupAlertRules();
    this.startCleanupInterval();
  }

  private setupAlertRules() {
    // High severity events
    this.alertRules.push({
      id: 'critical_security_event',
      name: 'Critical Security Event',
      condition: (event) => event.severity === 'critical',
      action: (event) => this.sendAlert('CRITICAL', event),
      cooldown: 0,
      lastTriggered: null
    });

    // Multiple suspicious requests from same IP
    this.alertRules.push({
      id: 'suspicious_ip_activity',
      name: 'Suspicious IP Activity',
      condition: (event) => {
        const recentEvents = this.events.filter(e => 
          e.ip === event.ip && 
          e.type === 'suspicious_request' &&
          Date.now() - e.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
        );
        return recentEvents.length >= 5;
      },
      action: (event) => {
        this.blockIP(event.ip);
        this.sendAlert('HIGH', event);
      },
      cooldown: 15,
      lastTriggered: null
    });

    // Rate limit exceeded multiple times
    this.alertRules.push({
      id: 'persistent_rate_limit',
      name: 'Persistent Rate Limit Violations',
      condition: (event) => {
        const recentEvents = this.events.filter(e => 
          e.ip === event.ip && 
          e.type === 'rate_limit_exceeded' &&
          Date.now() - e.timestamp.getTime() < 10 * 60 * 1000 // 10 minutes
        );
        return recentEvents.length >= 3;
      },
      action: (event) => this.sendAlert('MEDIUM', event),
      cooldown: 30,
      lastTriggered: null
    });

    // Error spike detection
    this.alertRules.push({
      id: 'error_spike',
      name: 'Error Spike Detected',
      condition: (event) => {
        const recentErrors = this.events.filter(e => 
          e.type === 'error_spike' &&
          Date.now() - e.timestamp.getTime() < 2 * 60 * 1000 // 2 minutes
        );
        return recentErrors.length >= 10;
      },
      action: (event) => this.sendAlert('HIGH', event),
      cooldown: 5,
      lastTriggered: null
    });
  }

  private startCleanupInterval() {
    // Clean up old events every hour
    setInterval(() => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
      this.events = this.events.filter(event => event.timestamp > cutoff);
      
      // Clean up old suspicious IP counts
      const now = Date.now();
      for (const [ip, timestamp] of this.suspiciousIPs.entries()) {
        if (now - timestamp > 60 * 60 * 1000) { // 1 hour
          this.suspiciousIPs.delete(ip);
        }
      }
    }, 60 * 60 * 1000);
  }

  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      resolved: false
    };

    this.events.push(securityEvent);

    // Check alert rules
    this.checkAlertRules(securityEvent);

    // Track suspicious IPs
    if (event.type === 'suspicious_request') {
      this.suspiciousIPs.set(event.ip, Date.now());
    }

    console.log(`Security Event: ${event.type} from ${event.ip}`, {
      severity: event.severity,
      url: event.url,
      method: event.method
    });
  }

  private checkAlertRules(event: SecurityEvent) {
    for (const rule of this.alertRules) {
      if (rule.condition(event)) {
        const now = new Date();
        const lastTriggered = rule.lastTriggered;
        
        if (!lastTriggered || (now.getTime() - lastTriggered.getTime()) > rule.cooldown * 60 * 1000) {
          rule.action(event);
          rule.lastTriggered = now;
        }
      }
    }
  }

  private sendAlert(level: string, event: SecurityEvent) {
    const alert = {
      level,
      event,
      timestamp: new Date().toISOString(),
      message: `Security Alert: ${event.type} detected from ${event.ip}`
    };

    // In production, this would send to your monitoring service
    console.error('🚨 SECURITY ALERT:', alert);

    // You could integrate with:
    // - Slack webhook
    // - Email service
    // - PagerDuty
    // - Custom monitoring dashboard
  }

  private blockIP(ip: string) {
    this.blockedIPs.add(ip);
    console.warn(`🚫 IP ${ip} has been blocked due to suspicious activity`);
    
    // In production, you might want to:
    // - Add to firewall rules
    // - Update CDN/WAF configuration
    // - Store in database for persistence
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  getSecurityStats() {
    const now = Date.now();
    const last24h = this.events.filter(e => now - e.timestamp.getTime() < 24 * 60 * 60 * 1000);
    
    return {
      totalEvents: this.events.length,
      eventsLast24h: last24h.length,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      eventsByType: this.groupBy(last24h, 'type'),
      eventsBySeverity: this.groupBy(last24h, 'severity')
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Middleware to check for blocked IPs
export const ipBlockingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (securityMonitor.isIPBlocked(clientIP)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked due to suspicious activity'
    });
  }

  next();
};

// Middleware to detect suspicious requests
export const suspiciousRequestDetection = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\s*\(/i, // Code injection
    /javascript:/i, // JavaScript protocol
    /on\w+\s*=/i, // Event handlers
    /base64/i, // Base64 encoding (often used in attacks)
    /cmd\s*=/i, // Command injection
    /exec\s*\(/i // Code execution
  ];

  const requestString = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      securityMonitor.logEvent({
        type: 'suspicious_request',
        severity: 'high',
        ip: clientIP,
        userAgent,
        url: req.url,
        method: req.method,
        details: {
          pattern: pattern.toString(),
          matchedContent: requestString.match(pattern)?.[0]
        }
      });
      break;
    }
  }

  next();
};

// Middleware to detect error spikes
export const errorSpikeDetection = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  res.send = function(data) {
    if (res.statusCode >= 500) {
      securityMonitor.logEvent({
        type: 'error_spike',
        severity: 'medium',
        ip: clientIP,
        userAgent: req.get('User-Agent') || 'unknown',
        url: req.url,
        method: req.method,
        details: {
          statusCode: res.statusCode,
          error: data
        }
      });
    }
    
    return originalSend.call(this, data);
  };

  next();
};

// Health check endpoint for monitoring
export const securityHealthCheck = (req: Request, res: Response) => {
  const stats = securityMonitor.getSecurityStats();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: stats
  });
};
