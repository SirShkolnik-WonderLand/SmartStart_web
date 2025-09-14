/**
 * Rate Limiting Middleware for SmartStart Platform
 * Implements comprehensive rate limiting with Redis backend
 */

const redis = require('redis');
const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    db: 1
});

// Rate limiting configuration
const RATE_LIMITS = {
    // Authentication endpoints - strict limits
    '/api/auth/login': { requests: 5, window: 60 }, // 5 per minute
    '/api/auth/register': { requests: 3, window: 60 }, // 3 per minute
    '/api/auth/forgot-password': { requests: 3, window: 60 }, // 3 per minute

    // BUZ token endpoints - moderate limits
    '/api/v1/buz/award': { requests: 20, window: 60 }, // 20 per minute
    '/api/v1/buz/spend': { requests: 20, window: 60 }, // 20 per minute
    '/api/v1/buz/transfer': { requests: 30, window: 60 }, // 30 per minute

    // General API endpoints
    '/api/ventures/create': { requests: 10, window: 60 }, // 10 per minute
    '/api/ventures': { requests: 100, window: 60 }, // 100 per minute
    '/api/users': { requests: 50, window: 60 }, // 50 per minute

    // Default rate limit
    'default': { requests: 100, window: 60 } // 100 per minute
};

// IP-based rate limiting
const IP_RATE_LIMITS = {
    requests: 1000, // 1000 requests per hour per IP
    window: 3600 // 1 hour
};

class RateLimiter {
    constructor() {
        this.client = client;
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
    }

    /**
     * Get rate limit configuration for endpoint
     */
    getRateLimitConfig(path) {
        // Find exact match first
        if (RATE_LIMITS[path]) {
            return RATE_LIMITS[path];
        }

        // Find pattern match
        for (const pattern in RATE_LIMITS) {
            if (pattern !== 'default' && path.startsWith(pattern)) {
                return RATE_LIMITS[pattern];
            }
        }

        // Return default
        return RATE_LIMITS.default;
    }

    /**
     * Check if request is within rate limits
     */
    async checkRateLimit(req, res, next) {
        try {
            const clientIP = this.getClientIP(req);
            const path = req.path;
            const userId = (req.user && req.user.id) || 'anonymous';

            // Check IP-based rate limiting
            const ipAllowed = await this.checkIPRateLimit(clientIP);
            if (!ipAllowed) {
                return this.sendRateLimitResponse(res, 'IP rate limit exceeded', 60);
            }

            // Check endpoint-specific rate limiting
            const endpointAllowed = await this.checkEndpointRateLimit(userId, path);
            if (!endpointAllowed.allowed) {
                return this.sendRateLimitResponse(res, 'Endpoint rate limit exceeded', endpointAllowed.retryAfter);
            }

            // Add rate limit headers
            res.set({
                'X-RateLimit-Limit': endpointAllowed.limit,
                'X-RateLimit-Remaining': endpointAllowed.remaining,
                'X-RateLimit-Reset': endpointAllowed.resetTime
            });

            next();
        } catch (error) {
            console.error('Rate limiting error:', error);
            // Allow request on error (fail open)
            next();
        }
    }

    /**
     * Check IP-based rate limiting
     */
    async checkIPRateLimit(clientIP) {
        const key = `rate_limit:ip:${clientIP}`;
        const current = await this.client.incr(key);

        if (current === 1) {
            await this.client.expire(key, IP_RATE_LIMITS.window);
        }

        return current <= IP_RATE_LIMITS.requests;
    }

    /**
     * Check endpoint-specific rate limiting
     */
    async checkEndpointRateLimit(userId, path) {
        const config = this.getRateLimitConfig(path);
        const key = `rate_limit:user:${userId}:${path}`;
        const current = await this.client.incr(key);

        if (current === 1) {
            await this.client.expire(key, config.window);
        }

        const remaining = Math.max(0, config.requests - current);
        const resetTime = Math.ceil(Date.now() / 1000) + config.window;

        return {
            allowed: current <= config.requests,
            limit: config.requests,
            remaining: remaining,
            resetTime: resetTime,
            retryAfter: config.window
        };
    }

    /**
     * Get client IP address
     */
    getClientIP(req) {
        return req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
            req.headers['x-forwarded-for'] ? .split(',')[0] ||
            'unknown';
    }

    /**
     * Send rate limit exceeded response
     */
    sendRateLimitResponse(res, message, retryAfter) {
        res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: message,
                retryAfter: retryAfter
            }
        });
    }

    /**
     * Middleware for specific endpoints
     */
    forEndpoint(endpoint) {
        return (req, res, next) => {
            if (req.path === endpoint) {
                return this.checkRateLimit(req, res, next);
            }
            next();
        };
    }

    /**
     * Middleware for BUZ token endpoints
     */
    forBUZEndpoints() {
        return (req, res, next) => {
            if (req.path.startsWith('/api/v1/buz/')) {
                return this.checkRateLimit(req, res, next);
            }
            next();
        };
    }

    /**
     * Middleware for authentication endpoints
     */
    forAuthEndpoints() {
        return (req, res, next) => {
            if (req.path.startsWith('/api/auth/')) {
                return this.checkRateLimit(req, res, next);
            }
            next();
        };
    }

    /**
     * Get rate limit status for user
     */
    async getRateLimitStatus(userId, path) {
        const config = this.getRateLimitConfig(path);
        const key = `rate_limit:user:${userId}:${path}`;
        const current = await this.client.get(key);
        const remaining = Math.max(0, config.requests - (parseInt(current) || 0));

        return {
            limit: config.requests,
            remaining: remaining,
            resetTime: Math.ceil(Date.now() / 1000) + config.window
        };
    }

    /**
     * Reset rate limit for user (admin function)
     */
    async resetRateLimit(userId, path) {
        const key = `rate_limit:user:${userId}:${path}`;
        await this.client.del(key);
        return true;
    }

    /**
     * Get all rate limit configurations
     */
    getRateLimitConfigs() {
        return RATE_LIMITS;
    }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

module.exports = {
    rateLimiter,
    checkRateLimit: rateLimiter.checkRateLimit.bind(rateLimiter),
    forEndpoint: rateLimiter.forEndpoint.bind(rateLimiter),
    forBUZEndpoints: rateLimiter.forBUZEndpoints.bind(rateLimiter),
    forAuthEndpoints: rateLimiter.forAuthEndpoints.bind(rateLimiter),
    getRateLimitStatus: rateLimiter.getRateLimitStatus.bind(rateLimiter),
    resetRateLimit: rateLimiter.resetRateLimit.bind(rateLimiter),
    getRateLimitConfigs: rateLimiter.getRateLimitConfigs.bind(rateLimiter)
};