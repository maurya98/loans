import { RateLimit } from '../models/rate-limit.entity';
export interface RateLimitConfig {
    limit: number;
    window: number;
    type: 'client' | 'user' | 'ip' | 'global';
}
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    limit: number;
}
export declare class RateLimitService {
    private repository;
    private logger;
    private databaseService;
    constructor();
    private getRepository;
    checkRateLimit(identifier: string, endpoint: string, config: RateLimitConfig): Promise<RateLimitResult>;
    getRateLimitStatus(identifier: string, endpoint: string): Promise<RateLimit | null>;
    resetRateLimit(identifier: string, endpoint: string): Promise<boolean>;
    createRateLimit(identifier: string, endpoint: string, config: RateLimitConfig): Promise<RateLimit>;
    updateRateLimit(id: string, update: Partial<RateLimit>): Promise<RateLimit | undefined>;
    deleteRateLimit(id: string): Promise<boolean>;
    getRateLimitStats(): Promise<{
        total: number;
        byType: Record<string, number>;
    }>;
    cleanupExpiredRateLimits(): Promise<number>;
}
//# sourceMappingURL=rate-limit.service.d.ts.map