const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const prisma = new PrismaClient();

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        this.jwtExpiry = '24h';
        this.sessionExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }

    /**
     * Authenticate user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {object} deviceInfo - Device information
     * @returns {Promise<object>} Authentication result
     */
    async authenticate(email, password, deviceInfo = {}) {
        try {
            // Find account with user and role information
            const account = await prisma.account.findUnique({
                where: { email: email.toLowerCase() },
                include: {
                    user: true,
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            if (!account) {
                return {
                    success: false,
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                };
            }

            // Check if account is active
            if (!account.isActive) {
                return {
                    success: false,
                    message: 'Account is deactivated. Please contact support.',
                    code: 'ACCOUNT_DEACTIVATED'
                };
            }

            // Check if account is locked
            if (account.lockedUntil && account.lockedUntil > new Date()) {
                const lockTimeRemaining = Math.ceil((account.lockedUntil - new Date()) / (1000 * 60));
                return {
                    success: false,
                    message: `Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`,
                    code: 'ACCOUNT_LOCKED'
                };
            }

            // Check if user has a password
            if (!account.password) {
                return {
                    success: false,
                    message: 'Account not properly set up. Please contact support.',
                    code: 'NO_PASSWORD'
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, account.password);
            if (!isPasswordValid) {
                // Increment login attempts
                await this.incrementLoginAttempts(account.id);
                return {
                    success: false,
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                };
            }

            // Reset login attempts on successful login
            await this.resetLoginAttempts(account.id);

            // Generate JWT token
            const token = await this.generateToken(account);

            // Create session
            const session = await this.createSession(account.id, token, deviceInfo);

            // Get user permissions
            const permissions = account.role.rolePermissions.map(rp => rp.permission.name);

            return {
                success: true,
                message: 'Authentication successful',
                token,
                sessionId: session.id,
                user: {
                    id: account.user.id,
                    email: account.user.email,
                    name: account.user.name,
                    firstName: account.user.firstName,
                    lastName: account.user.lastName,
                    role: {
                        id: account.role.id,
                        name: account.role.name,
                        level: account.role.level
                    },
                    permissions,
                    level: account.user.level,
                    xp: account.user.xp,
                    reputation: account.user.reputation,
                    status: account.user.status
                }
            };

        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                message: 'Authentication failed. Please try again.',
                code: 'AUTH_ERROR'
            };
        }
    }

    /**
     * Verify JWT token and get user information
     * @param {string} token - JWT token
     * @returns {Promise<object>} User information or null
     */
    async verifyToken(token) {
        try {
            const payload = jwt.verify(token, this.jwtSecret);

            // Find account with user and role information
            const account = await prisma.account.findUnique({
                where: { id: payload.accountId },
                include: {
                    user: true,
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            if (!account || !account.isActive) {
                return null;
            }

            // Check if session exists and is valid
            const session = await prisma.session.findFirst({
                where: {
                    accountId: account.id,
                    token: token,
                    expiresAt: { gt: new Date() }
                }
            });

            if (!session) {
                return null;
            }

            // Update session last used
            await prisma.session.update({
                where: { id: session.id },
                data: { lastUsed: new Date() }
            });

            // Get user permissions
            const permissions = account.role.rolePermissions.map(rp => rp.permission.name);

            return {
                id: account.user.id,
                email: account.user.email,
                name: account.user.name,
                firstName: account.user.firstName,
                lastName: account.user.lastName,
                role: {
                    id: account.role.id,
                    name: account.role.name,
                    level: account.role.level
                },
                permissions,
                level: account.user.level,
                xp: account.user.xp,
                reputation: account.user.reputation,
                status: account.user.status,
                accountId: account.id
            };

        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }

    /**
     * Generate JWT token for account
     * @param {object} account - Account object with user and role
     * @returns {Promise<string>} JWT token
     */
    async generateToken(account) {
        const payload = {
            accountId: account.id,
            userId: account.user.id,
            email: account.email,
            roleId: account.role.id,
            roleName: account.role.name,
            roleLevel: account.role.level,
            iat: Math.floor(Date.now() / 1000)
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiry });
    }

    /**
     * Create session for account
     * @param {string} accountId - Account ID
     * @param {string} token - JWT token
     * @param {object} deviceInfo - Device information
     * @returns {Promise<object>} Session object
     */
    async createSession(accountId, token, deviceInfo = {}) {
        const expiresAt = new Date(Date.now() + this.sessionExpiry);

        return await prisma.session.create({
            data: {
                accountId,
                token,
                expiresAt,
                ipAddress: deviceInfo.ipAddress || null,
                userAgent: deviceInfo.userAgent || null
            }
        });
    }

    /**
     * Invalidate session (logout)
     * @param {string} token - JWT token
     * @returns {Promise<boolean>} Success status
     */
    async invalidateSession(token) {
        try {
            await prisma.session.deleteMany({
                where: { token }
            });
            return true;
        } catch (error) {
            console.error('Session invalidation error:', error);
            return false;
        }
    }

    /**
     * Invalidate all sessions for account
     * @param {string} accountId - Account ID
     * @returns {Promise<boolean>} Success status
     */
    async invalidateAllSessions(accountId) {
        try {
            await prisma.session.deleteMany({
                where: { accountId }
            });
            return true;
        } catch (error) {
            console.error('All sessions invalidation error:', error);
            return false;
        }
    }

    /**
     * Increment login attempts
     * @param {string} accountId - Account ID
     */
    async incrementLoginAttempts(accountId) {
        const account = await prisma.account.findUnique({
            where: { id: accountId }
        });

        const newAttempts = account.loginAttempts + 1;
        const shouldLock = newAttempts >= 5;

        await prisma.account.update({
            where: { id: accountId },
            data: {
                loginAttempts: newAttempts,
                lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null // Lock for 30 minutes
            }
        });
    }

    /**
     * Reset login attempts
     * @param {string} accountId - Account ID
     */
    async resetLoginAttempts(accountId) {
        await prisma.account.update({
            where: { id: accountId },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLogin: new Date()
            }
        });
    }

    /**
     * Check if user has permission
     * @param {object} user - User object with permissions
     * @param {string} permission - Permission name
     * @returns {boolean} Has permission
     */
    hasPermission(user, permission) {
        return user.permissions && user.permissions.includes(permission);
    }

    /**
     * Check if user has role level or higher
     * @param {object} user - User object with role
     * @param {number} requiredLevel - Required role level
     * @returns {boolean} Has required level
     */
    hasRoleLevel(user, requiredLevel) {
        return user.role && user.role.level >= requiredLevel;
    }

    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @param {object} deviceInfo - Device information
     * @returns {Promise<object>} Registration result
     */
    async register(userData, deviceInfo = {}) {
        try {
            const { email, password, name, firstName, lastName } = userData;

            // Check if user already exists
            const existingAccount = await prisma.account.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (existingAccount) {
                return {
                    success: false,
                    message: 'User already exists with this email',
                    code: 'USER_EXISTS'
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Get default role (GUEST)
            const defaultRole = await prisma.role.findFirst({
                where: { name: 'GUEST' }
            });

            if (!defaultRole) {
                return {
                    success: false,
                    message: 'Default role not found',
                    code: 'ROLE_NOT_FOUND'
                };
            }

            // Create user and account in transaction
            const result = await prisma.$transaction(async(tx) => {
                // Create user
                const user = await tx.user.create({
                    data: {
                        name: name || email.split('@')[0],
                        firstName: firstName || null,
                        lastName: lastName || null,
                        email: email.toLowerCase(),
                        status: 'ACTIVE',
                        updatedAt: new Date()
                    }
                });

                // Create account
                const account = await tx.account.create({
                    data: {
                        email: email.toLowerCase(),
                        password: hashedPassword,
                        userId: user.id,
                        roleId: defaultRole.id,
                        isActive: true,
                        lastLogin: null,
                        loginAttempts: 0,
                        mfaEnabled: false
                    }
                });

                return { user, account };
            });

            // Get account with user and role for token generation
            const accountWithUser = await prisma.account.findUnique({
                where: { id: result.account.id },
                include: {
                    user: true,
                    role: true
                }
            });

            // Generate token
            const token = this.generateToken(accountWithUser);

            // Create session
            const session = await this.createSession(result.account.id, token, deviceInfo);

            // Get user with role information
            const userWithRole = await prisma.user.findUnique({
                where: { id: result.user.id },
                include: {
                    account: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return {
                success: true,
                message: 'Registration successful',
                user: {
                    id: userWithRole.id,
                    email: userWithRole.email,
                    name: userWithRole.name,
                    firstName: userWithRole.firstName,
                    lastName: userWithRole.lastName,
                    role: userWithRole.account.role,
                    permissions: userWithRole.account.role.rolePermissions.map(rp => rp.permission.name),
                    level: 'NEW_USER',
                    xp: 0,
                    reputation: 0,
                    status: 'ACTIVE'
                },
                token,
                sessionId: session.id
            };

        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed',
                code: 'REGISTRATION_ERROR'
            };
        }
    }

    /**
     * Clean up expired sessions
     */
    async cleanupExpiredSessions() {
        try {
            const result = await prisma.session.deleteMany({
                where: {
                    expiresAt: { lt: new Date() }
                }
            });
            console.log(`Cleaned up ${result.count} expired sessions`);
        } catch (error) {
            console.error('Session cleanup error:', error);
        }
    }
}

module.exports = new AuthService();