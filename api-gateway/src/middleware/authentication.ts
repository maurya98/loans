import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, AuthenticationResult } from '../types';
import { AppDataSource } from '../database/typeorm.config';
import { User as UserEntity } from '../models/User';
import { ApiKey as ApiKeyEntity } from '../models/ApiKey';
import config from '../config';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export class AuthenticationService {
  private userRepository: Repository<UserEntity>;
  private apiKeyRepository: Repository<ApiKeyEntity>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(UserEntity);
    this.apiKeyRepository = AppDataSource.getRepository(ApiKeyEntity);
  }

  public async validateToken(token: string): Promise<AuthenticationResult> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // Get user from database
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId, isActive: true }
      });

      if (!user) {
        return {
          isValid: false,
          error: 'User not found or inactive'
        };
      }

      return {
        isValid: true,
        user
      };
    } catch (error) {
      logger.error('Token validation failed:', error);
      return {
        isValid: false,
        error: 'Invalid token'
      };
    }
  }

  public async validateApiKey(apiKey: string): Promise<AuthenticationResult> {
    try {
      const apiKeyEntity = await this.apiKeyRepository.findOne({
        where: { 
          key: apiKey, 
          isActive: true 
        },
        relations: ['user']
      });

      if (!apiKeyEntity || !apiKeyEntity.user) {
        return {
          isValid: false,
          error: 'Invalid or expired API key'
        };
      }

      // Check if API key is expired
      if (apiKeyEntity.expiresAt && apiKeyEntity.expiresAt < new Date()) {
        return {
          isValid: false,
          error: 'API key has expired'
        };
      }

      // Check if user is active
      if (!apiKeyEntity.user.isActive) {
        return {
          isValid: false,
          error: 'User account is inactive'
        };
      }

      return {
        isValid: true,
        user: apiKeyEntity.user
      };
    } catch (error) {
      logger.error('API key validation failed:', error);
      return {
        isValid: false,
        error: 'API key validation failed'
      };
    }
  }

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret
    );
  }

  public generateRefreshToken(user: User): string {
    return jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwt.secret
    );
  }

  public async createUser(username: string, email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: role as any
    });

    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }

  public async authenticateUser(email: string, password: string): Promise<AuthenticationResult> {
    try {
      const user = await this.userRepository.findOne({
        where: { email, isActive: true }
      });

      if (!user) {
        return {
          isValid: false,
          error: 'Invalid credentials'
        };
      }

      const isPasswordValid = await this.comparePassword(password, user.password);

      if (!isPasswordValid) {
        return {
          isValid: false,
          error: 'Invalid credentials'
        };
      }

      return {
        isValid: true,
        user
      };
    } catch (error) {
      logger.error('User authentication failed:', error);
      return {
        isValid: false,
        error: 'Authentication failed'
      };
    }
  }
}

export const authService = new AuthenticationService();

// Middleware functions
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const result = await authService.validateToken(token);
    
    if (!result.isValid) {
      res.status(401).json({ error: result.error });
      return;
    }

    if (result.user) {
      req.user = result.user;
    }
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const authenticateApiKey = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    const result = await authService.validateApiKey(apiKey);
    
    if (!result.isValid) {
      res.status(401).json({ error: result.error });
      return;
    }

    if (result.user) {
      req.user = result.user;
    }
    next();
  } catch (error) {
    logger.error('API key authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const authenticateOptional = async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const result = await authService.validateToken(token);
      if (result.isValid && result.user) {
        req.user = result.user;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);

export default authService; 