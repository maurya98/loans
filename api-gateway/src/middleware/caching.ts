import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface CacheConfig {
  ttl: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
  varyBy?: string[];
}

export class CachingMiddleware {
  private static logger = new Logger('CachingMiddleware');
  private static cache = new Map<string, { data: any; expires: number }>();

  public static handle(config?: Partial<CacheConfig>) {
    const defaultConfig: CacheConfig = {
      ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
      keyGenerator: (req: Request) => {
        const varyBy = config?.varyBy || ['authorization', 'accept'];
        const parts = [req.method, req.originalUrl];
        
        varyBy.forEach(header => {
          const value = req.headers[header];
          if (value) {
            parts.push(`${header}:${value}`);
          }
        });
        
        return parts.join('|');
      },
      condition: (req: Request, res: Response) => {
        return req.method === 'GET' && res.statusCode === 200;
      }
    };

    const finalConfig = { ...defaultConfig, ...config };

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Check if we should cache this request
        if (!finalConfig.condition!(req, res)) {
          return next();
        }

        const cacheKey = finalConfig.keyGenerator!(req);
        const cached = this.get(cacheKey);

        if (cached) {
          this.logger.debug('Cache hit for key:', cacheKey);
          return res.json(cached);
        }

        // Store original send method
        const originalSend = res.send;
        const originalJson = res.json;

        // Override send method to cache response
        res.send = function(data: any) {
          if (finalConfig.condition!(req, res)) {
            CachingMiddleware.set(cacheKey, data, finalConfig.ttl);
          }
          return originalSend.call(this, data);
        };

        // Override json method to cache response
        res.json = function(data: any) {
          if (finalConfig.condition!(req, res)) {
            CachingMiddleware.set(cacheKey, data, finalConfig.ttl);
          }
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        this.logger.error('Caching middleware error:', error);
        next();
      }
    };
  }

  public static set(key: string, data: any, ttl: number): void {
    try {
      const expires = Date.now() + (ttl * 1000);
      this.cache.set(key, { data, expires });
      
      // Clean up expired entries periodically
      this.cleanup();
    } catch (error) {
      this.logger.error('Cache set error:', error);
    }
  }

  public static get(key: string): any {
    try {
      const cached = this.cache.get(key);
      
      if (!cached) {
        return null;
      }

      if (Date.now() > cached.expires) {
        this.cache.delete(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      this.logger.error('Cache get error:', error);
      return null;
    }
  }

  public static delete(key: string): boolean {
    try {
      return this.cache.delete(key);
    } catch (error) {
      this.logger.error('Cache delete error:', error);
      return false;
    }
  }

  public static clear(): void {
    try {
      this.cache.clear();
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  public static has(key: string): boolean {
    try {
      const cached = this.cache.get(key);
      if (!cached) {
        return false;
      }

      if (Date.now() > cached.expires) {
        this.cache.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Cache has error:', error);
      return false;
    }
  }

  public static keys(): string[] {
    try {
      this.cleanup();
      return Array.from(this.cache.keys());
    } catch (error) {
      this.logger.error('Cache keys error:', error);
      return [];
    }
  }

  public static size(): number {
    try {
      this.cleanup();
      return this.cache.size;
    } catch (error) {
      this.logger.error('Cache size error:', error);
      return 0;
    }
  }

  public static stats(): { size: number; keys: string[]; hitRate?: number } {
    try {
      this.cleanup();
      return {
        size: this.cache.size,
        keys: Array.from(this.cache.keys())
      };
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return { size: 0, keys: [] };
    }
  }

  private static cleanup(): void {
    try {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now > value.expires) {
          this.cache.delete(key);
        }
      }
    } catch (error) {
      this.logger.error('Cache cleanup error:', error);
    }
  }

  // Cache invalidation patterns
  public static invalidatePattern(pattern: string): number {
    try {
      let count = 0;
      const regex = new RegExp(pattern);
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          count++;
        }
      }
      
      return count;
    } catch (error) {
      this.logger.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  public static invalidateByMethod(method: string): number {
    return this.invalidatePattern(`^${method.toUpperCase()}\\|`);
  }

  public static invalidateByPath(path: string): number {
    return this.invalidatePattern(`\\|${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  }

  public static invalidateByUser(userId: string): number {
    return this.invalidatePattern(`authorization:.*${userId}`);
  }
} 