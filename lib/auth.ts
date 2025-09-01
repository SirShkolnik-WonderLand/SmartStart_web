import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export interface JWTPayload {
  userId: string
  email: string
  roleId: string
  roleName: string
  permissions: string[]
  iat: number
  exp: number
}

export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    role: {
      id: string
      name: string
      level: number
    }
    permissions: string[]
  }
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(userId: string, email: string, roleId: string, roleName: string): Promise<string> {
  const permissions = await getUserPermissions(roleId)
  
  const payload: JWTPayload = {
    userId,
    email,
    roleId,
    roleName,
    permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    algorithm: 'HS256',
  })
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload
    
    // Check if user still exists and is active
    const account = await prisma.account.findFirst({
      where: {
        userId: decoded.userId,
        isActive: true,
      },
      include: {
        role: true,
      },
    })

    if (!account) {
      throw new AuthError('User not found or inactive', 401)
    }

    return decoded
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Invalid token', 401)
  }
}

export async function getUserPermissions(roleId: string): Promise<string[]> {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: {
      permission: true,
    },
  })

  return rolePermissions.map(rp => rp.permission.name)
}

export async function checkPermission(userPermissions: string[], requiredPermission: string): Promise<boolean> {
  return userPermissions.includes(requiredPermission)
}

export async function requirePermission(userPermissions: string[], requiredPermission: string): Promise<void> {
  if (!await checkPermission(userPermissions, requiredPermission)) {
    throw new AuthError('Insufficient permissions', 403)
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        account: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user || !user.account) {
      return null
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: {
          id: user.account.role.id,
          name: user.account.role.name,
          level: user.account.role.level,
        },
        permissions: payload.permissions,
      },
    }
  } catch (error) {
    return null
  }
}

export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
  const account = await prisma.account.findUnique({
    where: { email },
    include: {
      user: true,
      role: true,
    },
  })

  if (!account) {
    throw new AuthError('Invalid credentials', 401)
  }

  if (!account.isActive) {
    throw new AuthError('Account is deactivated', 401)
  }

  if (account.lockedUntil && account.lockedUntil > new Date()) {
    throw new AuthError('Account is temporarily locked', 401)
  }

  const isValidPassword = await verifyPassword(password, account.password || '')
  if (!isValidPassword) {
    // Increment login attempts
    await prisma.account.update({
      where: { id: account.id },
      data: {
        loginAttempts: account.loginAttempts + 1,
        lockedUntil: account.loginAttempts >= 4 ? new Date(Date.now() + 30 * 60 * 1000) : null, // Lock for 30 minutes after 5 attempts
      },
    })
    throw new AuthError('Invalid credentials', 401)
  }

  // Reset login attempts on successful login
  await prisma.account.update({
    where: { id: account.id },
    data: {
      loginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    },
  })

  const token = await generateToken(account.userId, account.email, account.role.id, account.role.name)

  return {
    token,
    user: {
      id: account.user.id,
      email: account.user.email,
      name: account.user.name,
      role: account.role.name,
    },
  }
}

export async function logout(token: string): Promise<void> {
  // In a production system, you might want to blacklist the token
  // For now, we'll just rely on client-side token removal
}

export function setAuthCookie(token: string): void {
  const cookieStore = cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  })
}

export function removeAuthCookie(): void {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
}
