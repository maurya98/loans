export interface CacheOptions {
    ttl?: number;
    tags?: string[];
    type?: string;
}
export declare class CacheDBService {
    private repository;
    private logger;
    private databaseService;
    constructor();
    private getRepository;
    set(key: string, value: any, options?: CacheOptions): Promise<void>;
    get(key: string): Promise<any>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    invalidateByTag(tag: string): Promise<number>;
    invalidateByPattern(pattern: string): Promise<number>;
    clear(): Promise<void>;
    getStats(): Promise<{
        totalEntries: number;
        totalSize: number;
        avgHitCount: number;
        byType: Record<string, number>;
    }>;
    cleanupExpired(): Promise<number>;
    getTopKeys(limit?: number): Promise<Array<{
        key: string;
        hitCount: number;
    }>>;
}
//# sourceMappingURL=cache-db.service.d.ts.map