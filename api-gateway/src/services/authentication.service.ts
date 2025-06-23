import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';
import { User } from '../models/user.entity';
import { APIKey } from '../models/api-key.entity';

export interface AuthResult {
  valid: boolean;
  user?: User;
  error?: string;
}

export class AuthenticationService {
  private logger: Logger;
  private databaseService: DatabaseService;
  private userRepository!: Repository<User>;
  private apiKeyRepository!: Repository<APIKey>;

  constructor() {
    this.logger = new Logger('AuthenticationService');
    this.databaseService = new DatabaseService();
  }

  private async getUserRepository(): Promise<Repository<User>> {
    if (!this.userRepository) {
      const dataSource = this.databaseService.getDataSource();
      this.userRepository = dataSource.getRepository(User);
    }
    return this.userRepository;
  }

  private async getApiKeyRepository(): Promise<Repository<APIKey>> {
    if (!this.apiKeyRepository) {
      const dataSource = this.databaseService.getDataSource();
      this.apiKeyRepository = dataSource.getRepository(APIKey);
    }
    return this.apiKeyRepository;
  }

  public async validateToken(token: string): Promise<AuthResult> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT secret not configured');
      }

      const decoded = jwt.verify(token, secret) as any;
      const user = await this.getUserById(decoded.userId);
      
      if (!user || !user.isActive) {
        return { valid: false, error: 'User not found or inactive' };
      }

      return { valid: true, user };
    } catch (error) {
      this.logger.error('Token validation error:', error);
      return { valid: false, error: 'Invalid token' };
    }
  }

  public async authenticateUser(username: string, password: string): Promise<AuthResult> {
    try {
      const user = await this.getUserByUsername(username);
      
      if (!user || !user.isActive) {
        return { valid: false, error: 'Invalid credentials' };
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return { valid: false, error: 'Invalid credentials' };
      }

      // Update last login
      await this.updateLastLogin(user.id);

      return { valid: true, user };
    } catch (error) {
      this.logger.error('Authentication error:', error);
      return { valid: false, error: 'Authentication failed' };
    }
  }

  public async createUser(userData: Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const repo = await this.getUserRepository();
      
      const user = repo.create({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedUser = await repo.save(user);
      this.logger.info(`Created user: ${savedUser.username}`);
      return savedUser;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  public async updateUser(id: string, update: Partial<User>): Promise<User | undefined> {
    try {
      const repo = await this.getUserRepository();
      const user = await repo.findOne({ where: { id } });
      
      if (!user) {
        return undefined;
      }

      Object.assign(user, { ...update, updatedAt: new Date() });
      const updatedUser = await repo.save(user);
      
      this.logger.info(`Updated user: ${updatedUser.username}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
      return undefined;
    }
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      const repo = await this.getUserRepository();
      const user = await repo.findOne({ where: { id } });
      
      if (!user) {
        return false;
      }

      await repo.remove(user);
      this.logger.info(`Deleted user: ${user.username}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting user ${id}:`, error);
      return false;
    }
  }

  public async getUserById(id: string): Promise<User | undefined> {
    try {
      const repo = await this.getUserRepository();
      const user = await repo.findOne({ where: { id } });
      return user || undefined;
    } catch (error) {
      this.logger.error(`Error fetching user ${id}:`, error);
      return undefined;
    }
  }

  public async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const repo = await this.getUserRepository();
      const user = await repo.findOne({ where: { username } });
      return user || undefined;
    } catch (error) {
      this.logger.error(`Error fetching user by username ${username}:`, error);
      return undefined;
    }
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const repo = await this.getUserRepository();
      const user = await repo.findOne({ where: { email } });
      return user || undefined;
    } catch (error) {
      this.logger.error(`Error fetching user by email ${email}:`, error);
      return undefined;
    }
  }

  public async validateApiKey(apiKey: string): Promise<AuthResult> {
    try {
      const repo = await this.getApiKeyRepository();
      const key = await repo.findOne({ 
        where: { key: apiKey, isActive: true },
        relations: ['user']
      });

      if (!key) {
        return { valid: false, error: 'Invalid API key' };
      }

      // Check if API key is expired
      if (key.expiresAt && key.expiresAt < new Date()) {
        return { valid: false, error: 'API key expired' };
      }

      // Update usage count and last used
      key.usageCount += 1;
      key.lastUsedAt = new Date();
      await repo.save(key);

      // Create a user object for API key authentication
      const apiUser: User = {
        id: key.userId || 'api_user',
        username: 'api_user',
        email: 'api@example.com',
        password: '',
        roles: ['api'],
        scopes: key.scopes,
        isActive: true,
        lastLoginAt: new Date(),
        lastLoginIp: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return { valid: true, user: apiUser };
    } catch (error) {
      this.logger.error('API key validation error:', error);
      return { valid: false, error: 'Invalid API key' };
    }
  }

  public async validateOAuth2Token(token: string): Promise<AuthResult> {
    try {
      // TODO: Implement OAuth2 token validation
      this.logger.info('OAuth2 token validation not implemented yet');
      return { valid: false, error: 'OAuth2 not implemented' };
    } catch (error) {
      this.logger.error('OAuth2 validation error:', error);
      return { valid: false, error: 'OAuth2 validation failed' };
    }
  }

  public generateJWT(user: User): string {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      scopes: user.scopes
    };

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  public generateRefreshToken(user: User): string {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    if (!secret) {
      throw new Error('JWT refresh secret not configured');
    }

    const payload = {
      userId: user.id,
      type: 'refresh'
    };

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  public async hasPermission(user: User, permission: string): Promise<boolean> {
    // Check if user has the required permission in their scopes
    return user.scopes.includes(permission);
  }

  public async hasRole(user: User, role: string): Promise<boolean> {
    // Check if user has the required role
    return user.roles.includes(role);
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const repo = await this.getUserRepository();
      await repo.update(userId, {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      this.logger.error(`Error updating last login for user ${userId}:`, error);
    }
  }
} 