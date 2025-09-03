const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT token verification middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database
        prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                level: true,
                xp: true,
                reputation: true,
                status: true,
                permissions: true
            }
        }).then(user => {
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.status !== 'ACTIVE') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }

            // Add user to request object
            req.user = {
                ...user,
                permissions: user.permissions || []
            };
            next();
        }).catch(error => {
            console.error('Database error during authentication:', error);
            return res.status(500).json({
                success: false,
                message: 'Authentication error'
            });
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        console.error('JWT verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
}

// Optional authentication middleware (doesn't fail if no token)
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                level: true,
                xp: true,
                reputation: true,
                status: true,
                permissions: true
            }
        }).then(user => {
            if (user && user.status === 'ACTIVE') {
                req.user = {
                    ...user,
                    permissions: user.permissions || []
                };
            } else {
                req.user = null;
            }
            next();
        }).catch(error => {
            console.error('Database error during optional auth:', error);
            req.user = null;
            next();
        });

    } catch (error) {
        req.user = null;
        next();
    }
}

// Check if user has specific permission
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!req.user.permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
}

// Check if user has any of the specified permissions
function requireAnyPermission(permissions) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const hasPermission = permissions.some(permission => 
            req.user.permissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
}

// Check if user has all specified permissions
function requireAllPermissions(permissions) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const hasAllPermissions = permissions.every(permission => 
            req.user.permissions.includes(permission)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
}

// Check if user is the owner of a resource
function requireOwnership(resourceType, idField = 'userId') {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const resourceId = req.params[idField] || req.body[idField];
        
        if (resourceId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own resources'
            });
        }

        next();
    };
}

// Check if user is admin
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.permissions.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireOwnership,
    requireAdmin
};
