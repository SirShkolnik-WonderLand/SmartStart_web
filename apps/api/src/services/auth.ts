import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { id: userId, email, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static async createUser(email: string, password: string, name?: string, role: string = 'MEMBER') {
    const hashedPassword = await this.hashPassword(password);

    return prisma.user.create({
      data: {
        email,
        name,
        account: {
          create: {
            email,
            password: hashedPassword,
            role: role as any
          }
        }
      },
      include: {
        account: true
      }
    });
  }

  static async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { account: true }
    });

    if (!user || !user.account) {
      return null;
    }

    if (!user.account?.password) {
      return null;
    }
    
    const isValidPassword = await this.verifyPassword(password, user.account.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  static async login(email: string, password: string) {
    const user = await this.authenticateUser(email, password);
    
    if (!user) {
      return null;
    }

    if (!user.account) {
      return null;
    }
    
    const token = this.generateToken(user.id, user.email, user.account.role);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.account.role
      },
      token
    };
  }
}
