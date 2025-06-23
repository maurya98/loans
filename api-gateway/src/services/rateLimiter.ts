import { RateLimitInfo, RateLimitConfig } from '../types';
import redis from '../database/redis';
import logger from '../utils/logger';

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  public async checkRateLimit(key: string, limit?: number, windowMs?: number): Promise<RateLimitInfo> {
    const actualLimit = limit || this.config.maxRequests;
    const actualWindow = windowMs || this.config.windowMs;
    const windowKey = `rate_limit:${key}:${Math.floor(Date.now() / actualWindow)}`;
    
    try {
      const current = await redis.incr(windowKey);
      
      if (current === 1) {
        await redis.expire(windowKey, Math.ceil(actualWindow / 1000));
      }

      const remaining = Math.max(0, actualLimit - current);
      const resetTime = new Date(Math.ceil(Date.now() / actualWindow) * actualWindow + actualWindow);

      return {
        key,
        remaining,
        resetTime,
        limit: actualLimit
      };
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      // On error, allow the request
      return {
        key,
        remaining: actualLimit,
        resetTime: new Date(Date.now() + actualWindow),
        limit: actualLimit
      };
    }
  }

  public async isRateLimited(key: string, limit?: number, windowMs?: number): Promise<boolean> {
    const info = await this.checkRateLimit(key, limit, windowMs);
    return info.remaining <= 0;
  }

  public async getRateLimitInfo(key: string, limit?: number, windowMs?: number): Promise<RateLimitInfo> {
    const actualLimit = limit || this.config.maxRequests;
    const actualWindow = windowMs || this.config.windowMs;
    const windowKey = `rate_limit:${key}:${Math.floor(Date.now() / actualWindow)}`;
    
    try {
      const current = await redis.get(windowKey) || 0;
      const remaining = Math.max(0, actualLimit - Number(current));
      const resetTime = new Date(Math.ceil(Date.now() / actualWindow) * actualWindow + actualWindow);

      return {
        key,
        remaining,
        resetTime,
        limit: actualLimit
      };
    } catch (error) {
      logger.error('Get rate limit info failed:', error);
      return {
        key,
        remaining: actualLimit,
        resetTime: new Date(Date.now() + actualWindow),
        limit: actualLimit
      };
    }
  }

  public async resetRateLimit(key: string): Promise<void> {
    const actualWindow = this.config.windowMs;
    const currentWindow = Math.floor(Date.now() / actualWindow);
    const previousWindow = currentWindow - 1;
    
    try {
      const currentKey = `rate_limit:${key}:${currentWindow}`;
      const previousKey = `rate_limit:${key}:${previousWindow}`;
      
      await redis.del(currentKey);
      await redis.del(previousKey);
      
      logger.info(`Rate limit reset for key: ${key}`);
    } catch (error) {
      logger.error('Reset rate limit failed:', error);
    }
  }

  public async getRateLimitStats(key: string): Promise<{
    key: string;
    currentWindow: number;
    previousWindow: number;
    totalRequests: number;
  }> {
    const actualWindow = this.config.windowMs;
    const currentWindow = Math.floor(Date.now() / actualWindow);
    const previousWindow = currentWindow - 1;
    
    try {
      const currentKey = `rate_limit:${key}:${currentWindow}`;
      const previousKey = `rate_limit:${key}:${previousWindow}`;
      
      const [currentRequests, previousRequests] = await Promise.all([
        redis.get(currentKey),
        redis.get(previousKey)
      ]);
      
      return {
        key,
        currentWindow: Number(currentRequests) || 0,
        previousWindow: Number(previousRequests) || 0,
        totalRequests: (Number(currentRequests) || 0) + (Number(previousRequests) || 0)
      };
    } catch (error) {
      logger.error('Get rate limit stats failed:', error);
      return {
        key,
        currentWindow: 0,
        previousWindow: 0,
        totalRequests: 0
      };
    }
  }
}

export class RateLimiterManager {
  private limiters = new Map<string, RateLimiter>();

  constructor(private defaultConfig: RateLimitConfig) {}

  public getLimiter(name: string, config?: Partial<RateLimitConfig>): RateLimiter {
    if (!this.limiters.has(name)) {
      const limiterConfig = {
        ...this.defaultConfig,
        ...config
      };
      this.limiters.set(name, new RateLimiter(limiterConfig));
    }
    return this.limiters.get(name)!;
  }

  public async checkRateLimit(
    name: string,
    key: string,
    limit?: number,
    windowMs?: number,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitInfo> {
    const limiter = this.getLimiter(name, config);
    return limiter.checkRateLimit(key, limit, windowMs);
  }

  public async isRateLimited(
    name: string,
    key: string,
    limit?: number,
    windowMs?: number,
    config?: Partial<RateLimitConfig>
  ): Promise<boolean> {
    const limiter = this.getLimiter(name, config);
    return limiter.isRateLimited(key, limit, windowMs);
  }

  public async resetRateLimit(name: string, key: string): Promise<void> {
    const limiter = this.getLimiter(name);
    return limiter.resetRateLimit(key);
  }

  public async getRateLimitStats(name: string, key: string): Promise<{
    key: string;
    currentWindow: number;
    previousWindow: number;
    totalRequests: number;
  }> {
    const limiter = this.getLimiter(name);
    return limiter.getRateLimitStats(key);
  }

  public removeLimiter(name: string): void {
    this.limiters.delete(name);
  }

  public getLimiterNames(): string[] {
    return Array.from(this.limiters.keys());
  }

  public getStats(): {
    totalLimiters: number;
    limiterNames: string[];
  } {
    return {
      totalLimiters: this.limiters.size,
      limiterNames: this.getLimiterNames()
    };
  }
}

export default RateLimiterManager; 