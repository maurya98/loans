export declare class CacheEntry {
    id: string;
    key: string;
    value: string;
    type: string | null;
    ttl: number | null;
    expiresAt: Date | null;
    tags: string[];
    hitCount: number;
    lastAccessedAt: Date | null;
    size: number | null;
    isActive: boolean;
    metadata: any | null;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=cache-entry.entity.d.ts.map