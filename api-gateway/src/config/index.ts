import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

const validateConfig = (): Config => {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'REDIS_HOST',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    server: {
      port: parseInt(process.env['PORT'] || '3000', 10),
      host: process.env['HOST'] || 'localhost'
    },
    database: {
      host: process.env['DB_HOST']!,
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME']!,
      username: process.env['DB_USER']!,
      password: process.env['DB_PASSWORD']!,
      ssl: process.env['DB_SSL'] === 'true',
      maxConnections: 20
    },
    redis: {
      host: process.env['REDIS_HOST']!,
      port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
      password: process.env['REDIS_PASSWORD'] || '',
      db: parseInt(process.env['REDIS_DB'] || '0', 10),
      keyPrefix: 'api-gateway:'
    },
    jwt: {
      secret: process.env['JWT_SECRET']!,
      accessTokenExpiry: process.env['JWT_EXPIRES_IN'] || '24h',
      refreshTokenExpiry: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'
    },
    rateLimit: {
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
      maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
      skipSuccessfulRequests: process.env['RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS'] === 'true',
      skipFailedRequests: false
    },
    loadBalancer: {
      algorithm: (process.env['LOAD_BALANCER_ALGORITHM'] as any) || 'round-robin',
      healthCheckInterval: parseInt(process.env['HEALTH_CHECK_INTERVAL'] || '30000', 10),
      healthCheckTimeout: parseInt(process.env['HEALTH_CHECK_TIMEOUT'] || '5000', 10)
    },
    circuitBreaker: {
      failureThreshold: parseInt(process.env['CIRCUIT_BREAKER_THRESHOLD'] || '5', 10),
      recoveryTimeout: parseInt(process.env['CIRCUIT_BREAKER_TIMEOUT'] || '60000', 10),
      monitoringPeriod: 60000
    },
    logging: {
      level: process.env['LOG_LEVEL'] || 'info',
      filePath: process.env['LOG_FILE_PATH'] || './logs/api-gateway.log'
    },
    cors: {
      origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
      credentials: process.env['CORS_CREDENTIALS'] === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    },
    swagger: {
      title: process.env['SWAGGER_TITLE'] || 'API Gateway',
      description: process.env['SWAGGER_DESCRIPTION'] || 'A comprehensive API Gateway built with TypeScript',
      version: process.env['SWAGGER_VERSION'] || '1.0.0',
      contact: {
        name: 'API Gateway Team',
        email: 'support@apigateway.com'
      }
    },
    monitoring: {
      enabled: process.env['ENABLE_METRICS'] === 'true',
      port: parseInt(process.env['METRICS_PORT'] || '9090', 10)
    },
    security: {
      bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10),
      sessionSecret: process.env['SESSION_SECRET']!
    }
  };
};

export const config = validateConfig();

export default config; 