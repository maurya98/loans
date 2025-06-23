import { DataSource } from 'typeorm';
import { User } from '../../models/user.entity';
import { APIRoute } from '../../models/api-route.entity';
import { APIKey } from '../../models/api-key.entity';
import { RateLimit } from '../../models/rate-limit.entity';
import { Metric } from '../../models/metric.entity';
import { AuditLog } from '../../models/audit-log.entity';
import { CacheEntry } from '../../models/cache-entry.entity';
import { DatabaseService } from '../../services/database.service';
import { Logger } from '../../utils/logger';
import * as crypto from 'crypto';

export class DummyDataSeeder {
  private dataSource!: DataSource;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DummyDataSeeder');
  }

  public async seed(): Promise<void> {
    try {
      const dbService = new DatabaseService();
      await dbService.connect();
      this.dataSource = dbService.getDataSource();

      this.logger.info('Starting to seed dummy data...');

      await this.clearExistingData();
      const users = await this.seedUsers();
      const apiRoutes = await this.seedAPIRoutes();
      await this.seedAPIKeys(users);
      await this.seedRateLimits();
      await this.seedMetrics(apiRoutes);
      await this.seedAuditLogs(users, apiRoutes);
      await this.seedCacheEntries();

      this.logger.info('Dummy data seeding completed successfully!');
      await dbService.disconnect();
    } catch (error) {
      this.logger.error('Error seeding dummy data:', error);
      throw error;
    }
  }

  private async clearExistingData(): Promise<void> {
    this.logger.info('Clearing existing data...');
    const entities = ['audit_logs', 'metrics', 'rate_limits', 'api_keys', 'api_routes', 'cache_entries', 'users'];
    for (const entity of entities) {
      await this.dataSource.query(`DELETE FROM ${entity}`);
    }
  }

  private async seedUsers(): Promise<User[]> {
    this.logger.info('Seeding users...');
    const userRepository = this.dataSource.getRepository(User);
    const users: Partial<User>[] = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
        roles: ['admin', 'user'],
        scopes: ['read', 'write', 'delete', 'admin'],
        isActive: true,
        lastLoginAt: new Date(),
        lastLoginIp: '192.168.1.100'
      },
      {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
        roles: ['user'],
        scopes: ['read', 'write'],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 86400000),
        lastLoginIp: '192.168.1.101'
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
        roles: ['user', 'moderator'],
        scopes: ['read', 'write', 'moderate'],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 3600000),
        lastLoginIp: '192.168.1.102'
      },
      {
        username: 'bob_wilson',
        email: 'bob.wilson@example.com',
        password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
        roles: ['user'],
        scopes: ['read'],
        isActive: false,
        lastLoginAt: new Date(Date.now() - 604800000),
        lastLoginIp: '192.168.1.103'
      },
      {
        username: 'alice_brown',
        email: 'alice.brown@example.com',
        password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
        roles: ['user'],
        scopes: ['read', 'write'],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 1800000),
        lastLoginIp: '192.168.1.104'
      }
    ];
    return await userRepository.save(users);
  }

  private async seedAPIRoutes(): Promise<APIRoute[]> {
    this.logger.info('Seeding API routes...');
    const routeRepository = this.dataSource.getRepository(APIRoute);
    const routes: Partial<APIRoute>[] = [
      {
        path: '/api/v1/users',
        method: 'GET',
        backend: 'user-service:3001',
        authentication: true,
        rateLimit: { limit: 100, window: 3600 },
        cache: { ttl: 300, strategy: 'memory' },
        headers: { 'X-API-Version': 'v1' },
        pathRewrite: {},
        isActive: true,
        priority: 1,
        description: 'Get all users'
      },
      {
        path: '/api/v1/users/:id',
        method: 'GET',
        backend: 'user-service:3001',
        authentication: true,
        rateLimit: { limit: 200, window: 3600 },
        cache: { ttl: 600, strategy: 'redis' },
        headers: { 'X-API-Version': 'v1' },
        pathRewrite: {},
        isActive: true,
        priority: 2,
        description: 'Get user by ID'
      },
      {
        path: '/api/v1/users',
        method: 'POST',
        backend: 'user-service:3001',
        authentication: true,
        rateLimit: { limit: 50, window: 3600 },
        cache: null,
        headers: { 'X-API-Version': 'v1' },
        pathRewrite: {},
        isActive: true,
        priority: 3,
        description: 'Create new user'
      },
      {
        path: '/api/v1/auth/login',
        method: 'POST',
        backend: 'auth-service:3002',
        authentication: false,
        rateLimit: { limit: 10, window: 300 },
        cache: null,
        headers: { 'X-API-Version': 'v1' },
        pathRewrite: {},
        isActive: true,
        priority: 1,
        description: 'User login'
      },
      {
        path: '/api/v1/products',
        method: 'GET',
        backend: 'product-service:3003',
        authentication: false,
        rateLimit: { limit: 500, window: 3600 },
        cache: { ttl: 1800, strategy: 'redis' },
        headers: { 'X-API-Version': 'v1' },
        pathRewrite: {},
        isActive: true,
        priority: 1,
        description: 'Get all products'
      },
      {
        path: '/api/v1/orders',
        method: 'GET',
        backend: 'order-service:3004',
        authentication: true,
        rateLimit: { limit: 100, window: 3600 },
        cache: { ttl: 300, strategy: 'memory' },
        headers: { 'X-API-Version': 'v1' },
        pathRewrite: {},
        isActive: true,
        priority: 1,
        description: 'Get user orders'
      },
      {
        path: '/api/v1/health',
        method: 'GET',
        backend: 'health-service:3005',
        authentication: false,
        rateLimit: null,
        cache: { ttl: 60, strategy: 'memory' },
        headers: {},
        pathRewrite: {},
        isActive: true,
        priority: 1,
        description: 'Health check endpoint'
      }
    ];
    return await routeRepository.save(routes);
  }

  private async seedAPIKeys(users: User[]): Promise<APIKey[]> {
    this.logger.info('Seeding API keys...');
    const keyRepository = this.dataSource.getRepository(APIKey);
    const keys: Partial<APIKey>[] = [];
    
    if (users[0]) {
      keys.push({
        key: 'sk_test_1234567890abcdef1234567890abcdef12345678',
        name: 'Admin API Key',
        description: 'Full access API key for admin operations',
        userId: users[0].id,
        scopes: ['read', 'write', 'delete', 'admin'],
        permissions: ['users:read', 'users:write', 'users:delete', 'system:admin'],
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(),
        lastUsedIp: '192.168.1.100',
        usageCount: 1250
      });
    }
    
    if (users[1]) {
      keys.push({
        key: 'sk_test_abcdef1234567890abcdef1234567890abcdef12',
        name: 'User API Key',
        description: 'Standard user API key',
        userId: users[1].id,
        scopes: ['read', 'write'],
        permissions: ['users:read', 'users:write'],
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(Date.now() - 3600000),
        lastUsedIp: '192.168.1.101',
        usageCount: 450
      });
    }
    
    if (users[2]) {
      keys.push({
        key: 'sk_test_7890abcdef1234567890abcdef1234567890abcd',
        name: 'Read-only API Key',
        description: 'Read-only access for monitoring',
        userId: users[2].id,
        scopes: ['read'],
        permissions: ['users:read', 'metrics:read'],
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(Date.now() - 1800000),
        lastUsedIp: '192.168.1.102',
        usageCount: 89
      });
    }
    
    return await keyRepository.save(keys);
  }

  private async seedRateLimits(): Promise<RateLimit[]> {
    this.logger.info('Seeding rate limits...');
    const rateLimitRepository = this.dataSource.getRepository(RateLimit);
    const rateLimits: Partial<RateLimit>[] = [
      {
        identifier: '192.168.1.100',
        type: 'ip',
        endpoint: '/api/v1/users',
        limit: 100,
        window: 3600,
        currentCount: 45,
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 3600000),
        isActive: true,
        metadata: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      },
      {
        identifier: 'user_12345',
        type: 'user',
        endpoint: '/api/v1/orders',
        limit: 50,
        window: 3600,
        currentCount: 12,
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 3600000),
        isActive: true,
        metadata: { userId: '12345', plan: 'premium' }
      },
      {
        identifier: 'client_67890',
        type: 'client',
        endpoint: '/api/v1/products',
        limit: 500,
        window: 3600,
        currentCount: 234,
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 3600000),
        isActive: true,
        metadata: { clientId: '67890', tier: 'enterprise' }
      },
      {
        identifier: 'global',
        type: 'global',
        endpoint: '/api/v1/auth/login',
        limit: 1000,
        window: 300,
        currentCount: 567,
        windowStart: new Date(),
        windowEnd: new Date(Date.now() + 300000),
        isActive: true,
        metadata: { reason: 'brute force protection' }
      }
    ];
    return await rateLimitRepository.save(rateLimits);
  }

  private async seedMetrics(apiRoutes: APIRoute[]): Promise<Metric[]> {
    this.logger.info('Seeding metrics...');
    const metricRepository = this.dataSource.getRepository(Metric);
    const metrics: Partial<Metric>[] = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      metrics.push({
        name: 'http_requests_total',
        type: 'counter',
        value: Math.floor(Math.random() * 1000) + 100,
        labels: { method: 'GET', status: '200' },
        service: 'api-gateway',
        endpoint: '/api/v1/users',
        method: 'GET',
        statusCode: 200,
        timestamp
      });

      metrics.push({
        name: 'http_requests_total',
        type: 'counter',
        value: Math.floor(Math.random() * 100) + 10,
        labels: { method: 'POST', status: '201' },
        service: 'api-gateway',
        endpoint: '/api/v1/users',
        method: 'POST',
        statusCode: 201,
        timestamp
      });

      metrics.push({
        name: 'http_request_duration_seconds',
        type: 'histogram',
        value: (Math.random() * 0.5) + 0.1,
        labels: { method: 'GET', endpoint: '/api/v1/users' },
        service: 'api-gateway',
        endpoint: '/api/v1/users',
        method: 'GET',
        statusCode: 200,
        timestamp
      });

      metrics.push({
        name: 'http_requests_total',
        type: 'counter',
        value: Math.floor(Math.random() * 20) + 1,
        labels: { method: 'GET', status: '500' },
        service: 'api-gateway',
        endpoint: '/api/v1/users',
        method: 'GET',
        statusCode: 500,
        timestamp
      });

      metrics.push({
        name: 'http_active_connections',
        type: 'gauge',
        value: Math.floor(Math.random() * 50) + 10,
        labels: { service: 'api-gateway' },
        service: 'api-gateway',
        endpoint: null,
        method: null,
        statusCode: null,
        timestamp
      });
    }
    return await metricRepository.save(metrics);
  }

  private async seedAuditLogs(users: User[], apiRoutes: APIRoute[]): Promise<AuditLog[]> {
    this.logger.info('Seeding audit logs...');
    const auditLogRepository = this.dataSource.getRepository(AuditLog);
    const auditLogs: Partial<AuditLog>[] = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const baseTimestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const logsPerDay = Math.floor(Math.random() * 40) + 10;
      
      for (let j = 0; j < logsPerDay; j++) {
        const timestamp = new Date(baseTimestamp.getTime() + j * Math.random() * 24 * 60 * 60 * 1000);
        const user = users[Math.floor(Math.random() * users.length)];
        const route = apiRoutes[Math.floor(Math.random() * apiRoutes.length)];
        const statusCode = Math.random() > 0.1 ? 200 : (Math.random() > 0.5 ? 400 : 500);
        
        if (user && route) {
          auditLogs.push({
            method: route.method,
            path: route.path,
            userId: user.id,
            clientId: `client_${Math.floor(Math.random() * 1000)}`,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            statusCode,
            responseTime: Math.floor(Math.random() * 500) + 50,
            requestSize: Math.floor(Math.random() * 1000) + 100,
            responseSize: Math.floor(Math.random() * 5000) + 500,
            service: route.backend.split(':')[0] || null,
            requestHeaders: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Authorization': 'Bearer sk_test_1234567890abcdef1234567890abcdef12345678'
            },
            responseHeaders: {
              'Content-Type': 'application/json',
              'X-API-Version': 'v1'
            },
            requestBody: statusCode === 200 ? null : JSON.stringify({ error: 'Invalid request' }),
            responseBody: statusCode === 200 ? JSON.stringify({ success: true, data: {} }) : JSON.stringify({ error: 'Bad request' }),
            errorType: statusCode >= 400 ? 'validation_error' : null,
            errorMessage: statusCode >= 400 ? 'Invalid request parameters' : null,
            timestamp
          });
        }
      }
    }
    return await auditLogRepository.save(auditLogs);
  }

  private async seedCacheEntries(): Promise<CacheEntry[]> {
    this.logger.info('Seeding cache entries...');
    const cacheRepository = this.dataSource.getRepository(CacheEntry);
    const cacheEntries: Partial<CacheEntry>[] = [
      {
        key: 'users:list:page1',
        value: JSON.stringify({ users: [], total: 0, page: 1 }),
        type: 'redis',
        ttl: 300,
        expiresAt: new Date(Date.now() + 300000),
        tags: ['users', 'list'],
        hitCount: 45,
        lastAccessedAt: new Date(),
        size: 1024,
        isActive: true,
        metadata: { endpoint: '/api/v1/users', method: 'GET' }
      },
      {
        key: 'user:12345',
        value: JSON.stringify({ id: '12345', username: 'john_doe', email: 'john@example.com' }),
        type: 'redis',
        ttl: 600,
        expiresAt: new Date(Date.now() + 600000),
        tags: ['users', 'profile'],
        hitCount: 23,
        lastAccessedAt: new Date(Date.now() - 1800000),
        size: 512,
        isActive: true,
        metadata: { endpoint: '/api/v1/users/12345', method: 'GET' }
      },
      {
        key: 'products:featured',
        value: JSON.stringify({ products: [], total: 0 }),
        type: 'memory',
        ttl: 1800,
        expiresAt: new Date(Date.now() + 1800000),
        tags: ['products', 'featured'],
        hitCount: 156,
        lastAccessedAt: new Date(Date.now() - 300000),
        size: 2048,
        isActive: true,
        metadata: { endpoint: '/api/v1/products/featured', method: 'GET' }
      },
      {
        key: 'health:status',
        value: JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
        type: 'memory',
        ttl: 60,
        expiresAt: new Date(Date.now() + 60000),
        tags: ['health', 'status'],
        hitCount: 89,
        lastAccessedAt: new Date(Date.now() - 30000),
        size: 256,
        isActive: true,
        metadata: { endpoint: '/api/v1/health', method: 'GET' }
      },
      {
        key: 'expired:entry',
        value: JSON.stringify({ data: 'This entry has expired' }),
        type: 'redis',
        ttl: 60,
        expiresAt: new Date(Date.now() - 60000),
        tags: ['expired'],
        hitCount: 5,
        lastAccessedAt: new Date(Date.now() - 120000),
        size: 128,
        isActive: false,
        metadata: { endpoint: '/api/v1/expired', method: 'GET' }
      }
    ];
    return await cacheRepository.save(cacheEntries);
  }
} 