export declare class RateLimit {
    id: string;
    identifier: string;
    type: string;
    endpoint: string;
    limit: number;
    window: number;
    currentCount: number;
    windowStart: Date;
    windowEnd: Date;
    isActive: boolean;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=rate-limit.entity.d.ts.map