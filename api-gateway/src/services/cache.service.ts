import { RedisService } from './redis.service';
import { Logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class CacheService {
  private redisService: RedisService;
  private logger: Logger;
  private memoryCache = new Map<string, { data: any; expires: number }>();

  constructor() {
    this.logger = new Logger('CacheService');
    this.redisService = new RedisService();
  }

  public async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = 3600, tags = [] } = options;
      
      // Store in memory cache
      this.setMemoryCache(key, value, ttl);
      
      // Store in Redis if available
      if (this.redisService.isReady()) {
        await this.redisService.set(key, value, ttl);
        
        // Store tags for invalidation
        if (tags.length > 0) {
          await this.storeTags(key, tags);
        }
      }
      
      this.logger.debug(`Cached key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      this.logger.error(`Error setting cache for key ${key}:`, error);
    }
  }

  public async get(key: string): Promise<any> {
    try {
      // Try memory cache first
      const memoryValue = this.getMemoryCache(key);
      if (memoryValue !== null) {
        this.logger.debug(`Memory cache hit for key: ${key}`);
        return memoryValue;
      }

      // Try Redis cache
      if (this.redisService.isReady()) {
        const redisValue = await this.redisService.get(key);
        if (redisValue !== null) {
          this.logger.debug(`Redis cache hit for key: ${key}`);
          // Update memory cache
          this.setMemoryCache(key, redisValue, 300); // 5 minutes in memory
          return redisValue;
        }
      }

      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      // Remove from memory cache
      this.memoryCache.delete(key);
      
      // Remove from Redis
      if (this.redisService.isReady()) {
        await this.redisService.del(key);
      }
      
      this.logger.debug(`Deleted cache key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      // Check memory cache
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);
        if (cached && Date.now() < cached.expires) {
          return true;
        }
        this.memoryCache.delete(key);
      }

      // Check Redis cache
      if (this.redisService.isReady()) {
        return await this.redisService.exists(key);
      }

      return false;
    } catch (error) {
      this.logger.error(`Error checking cache existence for key ${key}:`, error);
      return false;
    }
  }

  public async invalidateByTag(tag: string): Promise<number> {
    try {
      if (!this.redisService.isReady()) {
        return 0;
      }

      const keys = await this.redisService.smembers(`tag:${tag}`);
      let count = 0;

      for (const key of keys) {
        await this.del(key);
        count++;
      }

      // Remove tag set
      await this.redisService.del(`tag:${tag}`);
      
      this.logger.info(`Invalidated ${count} keys by tag: ${tag}`);
      return count;
    } catch (error) {
      this.logger.error(`Error invalidating cache by tag ${tag}:`, error);
      return 0;
    }
  }

  public async invalidateByPattern(pattern: string): Promise<number> {
    try {
      let count = 0;

      // Clear memory cache matching pattern
      const regex = new RegExp(pattern);
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
          count++;
        }
      }

      // Clear Redis cache matching pattern (if supported)
      if (this.redisService.isReady()) {
        // Note: Redis KEYS command should be used carefully in production
        // Consider using SCAN for large datasets
        const keys = await this.redisService.getClient().keys(pattern);
        for (const key of keys) {
          await this.redisService.del(key);
          count++;
        }
      }

      this.logger.info(`Invalidated ${count} keys by pattern: ${pattern}`);
      return count;
    } catch (error) {
      this.logger.error(`Error invalidating cache by pattern ${pattern}:`, error);
      return 0;
    }
  }

  public async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      
      // Clear Redis cache
      if (this.redisService.isReady()) {
        await this.redisService.getClient().flushdb();
      }
      
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  public async getStats(): Promise<{ memorySize: number; redisSize?: number; hitRate?: number }> {
    try {
      const stats: { memorySize: number; redisSize?: number; hitRate?: number } = {
        memorySize: this.memoryCache.size
      };

      if (this.redisService.isReady()) {
        const info = await this.redisService.getClient().info('keyspace');
        // Parse Redis info to get database size
        // This is a simplified version
        stats.redisSize = 0; // TODO: Parse actual Redis info
      }

      return stats;
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return { memorySize: this.memoryCache.size };
    }
  }

  public async warmCache(keys: string[], dataProvider: (key: string) => Promise<any>): Promise<void> {
    try {
      this.logger.info(`Warming cache with ${keys.length} keys`);
      
      for (const key of keys) {
        try {
          const data = await dataProvider(key);
          if (data !== null) {
            await this.set(key, data, { ttl: 3600 });
          }
        } catch (error) {
          this.logger.error(`Error warming cache for key ${key}:`, error);
        }
      }
      
      this.logger.info('Cache warming completed');
    } catch (error) {
      this.logger.error('Error warming cache:', error);
    }
  }

  private setMemoryCache(key: string, value: any, ttl: number): void {
    const expires = Date.now() + (ttl * 1000);
    this.memoryCache.set(key, { data: value, expires });
    
    // Clean up expired entries
    this.cleanupMemoryCache();
  }

  private getMemoryCache(key: string): any {
    const cached = this.memoryCache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (now > value.expires) {
        this.memoryCache.delete(key);
      }
    }
  }

  private async storeTags(key: string, tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await this.redisService.sadd(`tag:${tag}`, key);
      }
    } catch (error) {
      this.logger.error(`Error storing tags for key ${key}:`, error);
    }
  }
} 