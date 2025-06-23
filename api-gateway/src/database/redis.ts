import Redis from 'ioredis';
import config from '../config';
import logger from '../utils/logger';

class RedisConnection {
  private client: Redis;
  private static instance: RedisConnection;

  private constructor() {
    const redisConfig: any = {
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      lazyConnect: true,
    };

    if (config.redis.password) {
      redisConfig.password = config.redis.password;
    }

    this.client = new Redis(redisConfig);

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.client.on('error', (error: Error) => {
      logger.error('Redis connection error:', error);
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error('Redis SET error:', error);
      throw error;
    }
  }

  public async get(key: string): Promise<any> {
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Redis GET error:', error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', error);
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      throw error;
    }
  }

  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      throw error;
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error);
      throw error;
    }
  }

  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      throw error;
    }
  }

  public async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      logger.error('Redis INCRBY error:', error);
      throw error;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error:', error);
      throw error;
    }
  }

  public async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.hset(key, field, serializedValue);
    } catch (error) {
      logger.error('Redis HSET error:', error);
      throw error;
    }
  }

  public async hget(key: string, field: string): Promise<any> {
    try {
      const value = await this.client.hget(key, field);
      if (value === null) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Redis HGET error:', error);
      throw error;
    }
  }

  public async hgetall(key: string): Promise<Record<string, any>> {
    try {
      const result = await this.client.hgetall(key);
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
      logger.error('Redis HGETALL error:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.client.quit();
    logger.info('Redis connection closed');
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

export const redis = RedisConnection.getInstance();
export default redis; 