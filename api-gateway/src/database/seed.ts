import { AppDataSource } from './typeorm.config';
import authService from '../middleware/authentication';
import logger from '../utils/logger';
import { User as UserEntity } from '../models/User';

const seedData = async (): Promise<void> => {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await AppDataSource.initialize();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    logger.info('Starting database seeding...');

    const userRepository = AppDataSource.getRepository(UserEntity);

    // Create admin user if not exists
    let adminUser = await userRepository.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      adminUser = await authService.createUser(
        'admin',
        'admin@api-gateway.com',
        'admin123',
        'admin'
      ) as any;
      logger.info('Admin user created:', adminUser!.username);
    } else {
      logger.info('Admin user already exists:', adminUser.username);
    }
    adminUser = adminUser!;

    // Create regular user if not exists
    let regularUser = await userRepository.findOne({ where: { username: 'user' } });
    if (!regularUser) {
      regularUser = await authService.createUser(
        'user',
        'user@api-gateway.com',
        'user123',
        'user'
      ) as any;
      logger.info('Regular user created:', regularUser!.username);
    } else {
      logger.info('Regular user already exists:', regularUser.username);
    }
    regularUser = regularUser!;

    // Create sample routes
    const routes = [
      {
        name: 'User API',
        path: '/api/users',
        method: 'GET',
        upstream: 'user-service',
        authentication: true,
        rateLimit: { maxRequests: 100, windowMs: 900000 },
        plugins: []
      },
      {
        name: 'Product API',
        path: '/api/products',
        method: 'GET',
        upstream: 'product-service',
        authentication: false,
        rateLimit: { maxRequests: 200, windowMs: 900000 },
        plugins: []
      },
      {
        name: 'Order API',
        path: '/api/orders',
        method: 'POST',
        upstream: 'order-service',
        authentication: true,
        rateLimit: { maxRequests: 50, windowMs: 900000 },
        plugins: []
      }
    ];

    // Insert sample routes and fetch their IDs
    const insertedRoutes: any[] = [];
    for (const route of routes) {
      const result = await queryRunner.query(
        `INSERT INTO routes (name, path, method, upstream, authentication, "rateLimitConfig", plugins) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, path` ,
        [route.name, route.path, route.method, route.upstream, route.authentication, JSON.stringify(route.rateLimit), JSON.stringify(route.plugins)]
      );
      insertedRoutes.push(result[0]);
    }
    logger.info('Sample routes created');

    // Map route paths to IDs for use in request logs
    const routePathToId: Record<string, string> = {};
    for (const r of insertedRoutes) {
      routePathToId[r.path] = r.id;
    }

    // Create sample services
    const services = [
      {
        name: 'user-service',
        hosts: ['http://localhost:3001', 'http://localhost:3002'],
        healthCheck: { path: '/health', interval: 30000, timeout: 5000 }
      },
      {
        name: 'product-service',
        hosts: ['http://localhost:3003'],
        healthCheck: { path: '/health', interval: 30000, timeout: 5000 }
      },
      {
        name: 'order-service',
        hosts: ['http://localhost:3004'],
        healthCheck: { path: '/health', interval: 30000, timeout: 5000 }
      }
    ];

    for (const service of services) {
      await queryRunner.query(
        'INSERT INTO services (name, hosts, "healthCheck") VALUES ($1, $2, $3)',
        [service.name, JSON.stringify(service.hosts), JSON.stringify(service.healthCheck)]
      );
    }
    logger.info('Sample services created');

    // Create sample API keys
    const apiKeys = [
      {
        userId: adminUser.id,
        key: 'admin-api-key-123',
        name: 'Admin API Key',
        permissions: ['read', 'write', 'admin']
      },
      {
        userId: regularUser.id,
        key: 'user-api-key-456',
        name: 'User API Key',
        permissions: ['read']
      }
    ];

    for (const apiKey of apiKeys) {
      await queryRunner.query(
        'INSERT INTO api_keys ("userId", key, name, permissions) VALUES ($1, $2, $3, $4)',
        [apiKey.userId, apiKey.key, apiKey.name, JSON.stringify(apiKey.permissions)]
      );
    }
    logger.info('Sample API keys created');

    // Create sample health checks
    const healthChecks = [
      {
        service: 'user-service',
        status: 'healthy',
        responseTime: 50
      },
      {
        service: 'product-service',
        status: 'healthy',
        responseTime: 30
      },
      {
        service: 'order-service',
        status: 'unhealthy',
        responseTime: 5000,
        errorMessage: 'Connection timeout'
      }
    ];

    for (const healthCheck of healthChecks) {
      await queryRunner.query(
        'INSERT INTO health_checks (service, status, "responseTime", "errorMessage") VALUES ($1, $2, $3, $4)',
        [healthCheck.service, healthCheck.status, healthCheck.responseTime, healthCheck.errorMessage]
      );
    }
    logger.info('Sample health checks created');

    // Create sample circuit breakers
    const circuitBreakers = [
      {
        service: 'user-service',
        state: 'closed',
        failureCount: 0
      },
      {
        service: 'product-service',
        state: 'closed',
        failureCount: 0
      },
      {
        service: 'order-service',
        state: 'open',
        failureCount: 5,
        lastFailureTime: new Date()
      }
    ];

    for (const circuitBreaker of circuitBreakers) {
      await queryRunner.query(
        'INSERT INTO circuit_breakers (service, state, "failureCount", "lastFailureTime") VALUES ($1, $2, $3, $4)',
        [circuitBreaker.service, circuitBreaker.state, circuitBreaker.failureCount, circuitBreaker.lastFailureTime]
      );
    }
    logger.info('Sample circuit breakers created');

    // Create sample request logs with real route IDs
    const requestLogs = [
      {
        routeId: routePathToId['/api/users'],
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        responseTime: 150,
        ip: '127.0.0.1',
        userAgent: 'curl/7.68.0',
        userId: adminUser.id
      },
      {
        routeId: routePathToId['/api/products'],
        method: 'GET',
        path: '/api/products',
        statusCode: 200,
        responseTime: 80,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        routeId: routePathToId['/api/orders'],
        method: 'POST',
        path: '/api/orders',
        statusCode: 401,
        responseTime: 50,
        ip: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.28.0'
      }
    ];

    for (const requestLog of requestLogs) {
      await queryRunner.query(
        `INSERT INTO request_logs ("routeId", method, path, "statusCode", "responseTime", ip, "userAgent", "userId") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [requestLog.routeId, requestLog.method, requestLog.path, requestLog.statusCode, requestLog.responseTime, requestLog.ip, requestLog.userAgent, requestLog.userId]
      );
    }
    logger.info('Sample request logs created');

    // Commit the transaction
    await queryRunner.commitTransaction();
    logger.info('Database seeding completed successfully!');
    
  } catch (error) {
    // Rollback the transaction on error
    await queryRunner.rollbackTransaction();
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    // Release the query runner
    await queryRunner.release();
    await AppDataSource.destroy();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedData; 