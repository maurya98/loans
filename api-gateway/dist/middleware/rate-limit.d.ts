import { Request, Response, NextFunction } from 'express';
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
export declare class RateLimitMiddleware {
    private static logger;
    private static store;
    static createLimiter(config?: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult>;
    static createUserLimiter(userId: string, config: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static createIPLimiter(config: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static createEndpointLimiter(endpoint: string, config: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static createTokenLimiter(config: Partial<RateLimitConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static getRateLimitInfo(key: string): {
        count: number;
        resetTime: number;
    } | null;
    static resetRateLimit(key: string): void;
    static clearAllRateLimits(): void;
    static getStoreSize(): number;
}
//# sourceMappingURL=rate-limit.d.ts.map