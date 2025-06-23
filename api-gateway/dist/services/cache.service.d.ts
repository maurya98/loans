export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}
export declare class CacheService {
    private redisService;
    private logger;
    private memoryCache;
    constructor();
    set(key: string, value: any, options?: CacheOptions): Promise<void>;
    get(key: string): Promise<any>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    invalidateByTag(tag: string): Promise<number>;
    invalidateByPattern(pattern: string): Promise<number>;
    clear(): Promise<void>;
    getStats(): Promise<{
        memorySize: number;
        redisSize?: number;
        hitRate?: number;
    }>;
    warmCache(keys: string[], dataProvider: (key: string) => Promise<any>): Promise<void>;
    private setMemoryCache;
    private getMemoryCache;
    private cleanupMemoryCache;
    private storeTags;
}
//# sourceMappingURL=cache.service.d.ts.map