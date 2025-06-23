import Redis from 'ioredis';
import { Logger } from '../utils/logger';

export class RedisService {
  private redis!: Redis;
  private logger: Logger;
  private isConnected: boolean = false;

  constructor() {
    this.logger = new Logger('RedisService');
  }

  public async connect(): Promise<void> {
    try {
      const config: any = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        db: parseInt(process.env.REDIS_DB || '0'),
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        enableOfflineQueue: false,
        maxLoadingTimeout: 10000,
        enableReadyCheck: true,
        autoResubscribe: true,
        autoResendUnfulfilledCommands: true,
        showFriendlyErrorStack: process.env.NODE_ENV === 'development'
      };

      if (process.env.REDIS_PASSWORD) {
        config.password = process.env.REDIS_PASSWORD;
      }

      this.redis = new Redis(config);

      this.redis.on('connect', () => {
        this.logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        this.logger.info('Redis client ready');
      });

      this.redis.on('error', (error: any) => {
        this.logger.error('Redis client error:', error);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis client connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        this.logger.info('Redis client reconnecting...');
      });

      await this.redis.connect();
      this.logger.info('Redis connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
        this.logger.info('Redis connection closed successfully');
        this.isConnected = false;
      }
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
      throw error;
    }
  }

  public getClient(): Redis {
    if (!this.redis || !this.isConnected) {
      throw new Error('Redis not initialized');
    }
    return this.redis;
  }

  // Cache operations
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error('Redis set error:', error);
      throw error;
    }
  }

  public async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      if (value === null) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      this.logger.error('Redis get error:', error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error('Redis del error:', error);
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Redis exists error:', error);
      throw error;
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      this.logger.error('Redis expire error:', error);
      throw error;
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error('Redis ttl error:', error);
      throw error;
    }
  }

  // Hash operations
  public async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.hset(key, field, serializedValue);
    } catch (error) {
      this.logger.error('Redis hset error:', error);
      throw error;
    }
  }

  public async hget(key: string, field: string): Promise<any> {
    try {
      const value = await this.redis.hget(key, field);
      if (value === null) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      this.logger.error('Redis hget error:', error);
      throw error;
    }
  }

  public async hgetall(key: string): Promise<Record<string, any>> {
    try {
      const result = await this.redis.hgetall(key);
      const parsed: Record<string, any> = {};

      for (const [field, value] of Object.entries(result)) {
        try {
          parsed[field] = JSON.parse(value as string);
        } catch {
          parsed[field] = value;
        }
      }

      return parsed;
    } catch (error) {
      this.logger.error('Redis hgetall error:', error);
      throw error;
    }
  }

  // List operations
  public async lpush(key: string, value: any): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.lpush(key, serializedValue);
    } catch (error) {
      this.logger.error('Redis lpush error:', error);
      throw error;
    }
  }

  public async rpop(key: string): Promise<any> {
    try {
      const value = await this.redis.rpop(key);
      if (value === null) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      this.logger.error('Redis rpop error:', error);
      throw error;
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<any[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values.map((value: any) => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      this.logger.error('Redis lrange error:', error);
      throw error;
    }
  }

  // Set operations
  public async sadd(key: string, member: any): Promise<void> {
    try {
      const serializedMember = typeof member === 'string' ? member : JSON.stringify(member);
      await this.redis.sadd(key, serializedMember);
    } catch (error) {
      this.logger.error('Redis sadd error:', error);
      throw error;
    }
  }

  public async smembers(key: string): Promise<any[]> {
    try {
      const members = await this.redis.smembers(key);
      return members.map((member: any) => {
        try {
          return JSON.parse(member);
        } catch {
          return member;
        }
      });
    } catch (error) {
      this.logger.error('Redis smembers error:', error);
      throw error;
    }
  }

  // Rate limiting
  public async incrementRateLimit(key: string, window: number): Promise<number> {
    try {
      const multi = this.redis.multi();
      multi.incr(key);
      multi.expire(key, window);
      const results = await multi.exec();
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      this.logger.error('Redis rate limit error:', error);
      throw error;
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  public isReady(): boolean {
    return this.isConnected;
  }
} 