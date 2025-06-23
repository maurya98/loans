import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export class RateLimitMiddleware {
  private static logger = new Logger('RateLimitMiddleware');
  private static store = new Map<string, { count: number; resetTime: number }>();

  public static createLimiter(config?: Partial<RateLimitConfig>) {
    const defaultConfig: RateLimitConfig = {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
      skipFailedRequests: false,
      keyGenerator: (req: Request) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
      }
    };

    const finalConfig = { ...defaultConfig, ...config };

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = finalConfig.keyGenerator!(req);
        const result = await this.checkLimit(key, finalConfig);

        if (!result.allowed) {
          res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests);
          res.setHeader('X-RateLimit-Remaining', result.remaining);
          res.setHeader('X-RateLimit-Reset', result.resetTime.getTime());
          
          if (result.retryAfter) {
            res.setHeader('Retry-After', result.retryAfter);
          }

          if (finalConfig.handler) {
            return finalConfig.handler(req, res);
          }

          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded',
            retryAfter: result.retryAfter
          });
        }

        res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetTime.getTime());

        next();
      } catch (error) {
        this.logger.error('Rate limiting error:', error);
        next();
      }
    };
  }

  public static async checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get current rate limit data
    const current = this.store.get(key);
    
    if (!current || current.resetTime < now) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(now + config.windowMs)
      };
    }

    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(current.resetTime),
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      };
    }

    // Increment count
    current.count++;
    this.store.set(key, current);

    return {
      allowed: true,
      remaining: config.maxRequests - current.count,
      resetTime: new Date(current.resetTime)
    };
  }

  public static createUserLimiter(userId: string, config: Partial<RateLimitConfig>) {
    return this.createLimiter({
      ...config,
      keyGenerator: () => `user:${userId}`
    });
  }

  public static createIPLimiter(config: Partial<RateLimitConfig>) {
    return this.createLimiter({
      ...config,
      keyGenerator: (req: Request) => req.ip || req.connection.remoteAddress || 'unknown'
    });
  }

  public static createEndpointLimiter(endpoint: string, config: Partial<RateLimitConfig>) {
    return this.createLimiter({
      ...config,
      keyGenerator: (req: Request) => `${req.ip}:${endpoint}`
    });
  }

  public static createTokenLimiter(config: Partial<RateLimitConfig>) {
    return this.createLimiter({
      ...config,
      keyGenerator: (req: Request) => {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.headers['x-api-key'] as string ||
                     req.query.token as string;
        return token || req.ip || 'unknown';
      }
    });
  }

  public static getRateLimitInfo(key: string): { count: number; resetTime: number } | null {
    return this.store.get(key) || null;
  }

  public static resetRateLimit(key: string): void {
    this.store.delete(key);
  }

  public static clearAllRateLimits(): void {
    this.store.clear();
  }

  public static getStoreSize(): number {
    return this.store.size;
  }
} 