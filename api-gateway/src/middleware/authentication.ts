import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

export class AuthenticationMiddleware {
  private static logger = new Logger('AuthenticationMiddleware');

  public static authenticate() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const token = this.extractToken(req);
        
        if (!token) {
          return next(); // Continue without authentication
        }

        const decoded = await this.validateToken(token);
        req.user = decoded;
        req.token = token;

        return next();
      } catch (error) {
        this.logger.error('Authentication error:', error);
        return next();
      }
    };
  }

  public static requireAuth() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      return next();
    };
  }

  public static requireRole(roles: string | string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const userRoles = req.user.roles || [];
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        });
      }

      return next();
    };
  }

  public static requireScope(scopes: string | string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const userScopes = req.user.scopes || [];
      const requiredScopes = Array.isArray(scopes) ? scopes : [scopes];

      const hasScope = requiredScopes.every(scope => userScopes.includes(scope));
      
      if (!hasScope) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient scopes'
        });
      }

      return next();
    };
  }

  private static extractToken(req: Request): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check API key header
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
      return apiKey;
    }

    // Check query parameter
    const queryToken = req.query.token as string;
    if (queryToken) {
      return queryToken;
    }

    // Check cookie
    const cookieToken = req.cookies?.token;
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }

  private static async validateToken(token: string): Promise<any> {
    try {
      // Try JWT validation first
      if (this.isJWT(token)) {
        return this.validateJWT(token);
      }

      // Try API key validation
      return await this.validateAPIKey(token);
    } catch (error) {
      this.logger.error('Token validation error:', error);
      throw new Error('Invalid token');
    }
  }

  private static isJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  public static validateJWT(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      this.logger.error('JWT validation error:', error);
      throw new Error('Invalid JWT token');
    }
  }

  private static async validateAPIKey(apiKey: string): Promise<any> {
    // This would typically validate against a database
    // For now, we'll use a simple validation
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
      throw new Error('Invalid API key');
    }

    return {
      type: 'api_key',
      key: apiKey,
      permissions: ['read', 'write']
    };
  }

  public static generateJWT(payload: any): string {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  public static generateRefreshToken(payload: any): string {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
} 