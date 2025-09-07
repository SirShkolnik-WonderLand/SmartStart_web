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

        // Get user from database and validate session
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
                lastActive: true
            }
        }).then(async user => {
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

            // Check if session is still valid (last active within 7 days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (user.lastActive && user.lastActive < sevenDaysAgo) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.'
                });
            }

            // Update last active timestamp
            await prisma.user.update({
                where: { id: user.id },
                data: { lastActive: new Date() }
            });

            // Add user to request object
            req.user = {
                ...user,
                permissions: [] // User model doesn't have permissions field, use empty array
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

// Check if user has any of the specified roles
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user has any of the required roles
        const hasRole = roles.some(role => {
            // Check if user has the role in their permissions
            return req.user.permissions.includes(role.toLowerCase()) ||
                req.user.permissions.includes(role) ||
                req.user.permissions.includes('admin') || // Admin has all roles
                req.user.permissions.includes('super_admin'); // Super admin has all roles
        });

        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireOwnership,
    requireAdmin,
    requireRole
};