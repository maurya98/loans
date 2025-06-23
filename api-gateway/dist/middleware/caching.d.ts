import { Request, Response, NextFunction } from 'express';
export interface CacheConfig {
    ttl: number;
    keyGenerator?: (req: Request) => string;
    condition?: (req: Request, res: Response) => boolean;
    varyBy?: string[];
}
export declare class CachingMiddleware {
    private static logger;
    private static cache;
    static handle(config?: Partial<CacheConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static set(key: string, data: any, ttl: number): void;
    static get(key: string): any;
    static delete(key: string): boolean;
    static clear(): void;
    static has(key: string): boolean;
    static keys(): string[];
    static size(): number;
    static stats(): {
        size: number;
        keys: string[];
        hitRate?: number;
    };
    private static cleanup;
    static invalidatePattern(pattern: string): number;
    static invalidateByMethod(method: string): number;
    static invalidateByPath(path: string): number;
    static invalidateByUser(userId: string): number;
}
//# sourceMappingURL=caching.d.ts.map