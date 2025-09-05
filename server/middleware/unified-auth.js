const authService = require('../services/auth-service');

/**
 * Unified authentication middleware
 * Verifies JWT token and attaches user to request
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Also check for token in HTTP-only cookie
    const cookieToken = req.cookies && req.cookies['auth-token'];

    const authToken = token || cookieToken;

    if (!authToken) {
        return res.status(401).json({
            success: false,
            message: 'Access token required',
            code: 'NO_TOKEN'
        });
    }

    authService.verifyToken(authToken)
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token',
                    code: 'INVALID_TOKEN'
                });
            }

            req.user = user;
            req.token = authToken;
            next();
        })
        .catch(error => {
            console.error('Auth middleware error:', error);
            res.status(401).json({
                success: false,
                message: 'Authentication failed',
                code: 'AUTH_ERROR'
            });
        });
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Also check for token in HTTP-only cookie
    const cookieToken = req.cookies && req.cookies['auth-token'];

    const authToken = token || cookieToken;

    if (!authToken) {
        req.user = null;
        return next();
    }

    authService.verifyToken(authToken)
        .then(user => {
            req.user = user;
            req.token = authToken;
            next();
        })
        .catch(() => {
            req.user = null;
            next();
        });
}

/**
 * Permission-based authorization middleware
 * @param {string|string[]} permissions - Required permission(s)
 */
function requirePermission(permissions) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
        const hasPermission = requiredPermissions.some(permission =>
            authService.hasPermission(req.user, permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: requiredPermissions,
                userPermissions: req.user.permissions
            });
        }

        next();
    };
}

/**
 * Role level authorization middleware
 * @param {number} requiredLevel - Required role level
 */
function requireRoleLevel(requiredLevel) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!authService.hasRoleLevel(req.user, requiredLevel)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient role level',
                code: 'INSUFFICIENT_ROLE_LEVEL',
                required: requiredLevel,
                userLevel: req.user.role?.level
            });
        }

        next();
    };
}

/**
 * Resource ownership middleware
 * Checks if user owns the resource or has admin permissions
 * @param {string} resourceIdParam - Parameter name containing resource ID
 * @param {string} resourceType - Type of resource (user, project, etc.)
 */
function requireOwnershipOrAdmin(resourceIdParam, resourceType) {
    return async(req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const resourceId = req.params[resourceIdParam];

        // Admin users can access any resource
        if (authService.hasRoleLevel(req.user, 100)) { // Assuming admin level is 100
            return next();
        }

        // Check if user owns the resource
        if (resourceId === req.user.id) {
            return next();
        }

        // For other resource types, you might need additional checks
        // This is a simplified version
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.',
            code: 'ACCESS_DENIED'
        });
    };
}

/**
 * Rate limiting middleware
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Window size in milliseconds
 */
function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean up old entries
        if (requests.has(key)) {
            const userRequests = requests.get(key).filter(time => time > windowStart);
            requests.set(key, userRequests);
        } else {
            requests.set(key, []);
        }

        const userRequests = requests.get(key);

        if (userRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMITED'
            });
        }

        userRequests.push(now);
        next();
    };
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requirePermission,
    requireRoleLevel,
    requireOwnershipOrAdmin,
    rateLimit
};