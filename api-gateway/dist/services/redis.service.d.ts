import Redis from 'ioredis';
export declare class RedisService {
    private redis;
    private logger;
    private isConnected;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): Redis;
    set(key: string, value: any, ttl?: number): Promise<void>;
    get(key: string): Promise<any>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<void>;
    ttl(key: string): Promise<number>;
    hset(key: string, field: string, value: any): Promise<void>;
    hget(key: string, field: string): Promise<any>;
    hgetall(key: string): Promise<Record<string, any>>;
    lpush(key: string, value: any): Promise<void>;
    rpop(key: string): Promise<any>;
    lrange(key: string, start: number, stop: number): Promise<any[]>;
    sadd(key: string, member: any): Promise<void>;
    smembers(key: string): Promise<any[]>;
    incrementRateLimit(key: string, window: number): Promise<number>;
    healthCheck(): Promise<boolean>;
    isReady(): boolean;
}
//# sourceMappingURL=redis.service.d.ts.map