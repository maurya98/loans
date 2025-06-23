"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_service_1 = require("./redis.service");
const logger_1 = require("../utils/logger");
class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.logger = new logger_1.Logger('CacheService');
        this.redisService = new redis_service_1.RedisService();
    }
    async set(key, value, options = {}) {
        try {
            const { ttl = 3600, tags = [] } = options;
            this.setMemoryCache(key, value, ttl);
            if (this.redisService.isReady()) {
                await this.redisService.set(key, value, ttl);
                if (tags.length > 0) {
                    await this.storeTags(key, tags);
                }
            }
            this.logger.debug(`Cached key: ${key} with TTL: ${ttl}s`);
        }
        catch (error) {
            this.logger.error(`Error setting cache for key ${key}:`, error);
        }
    }
    async get(key) {
        try {
            const memoryValue = this.getMemoryCache(key);
            if (memoryValue !== null) {
                this.logger.debug(`Memory cache hit for key: ${key}`);
                return memoryValue;
            }
            if (this.redisService.isReady()) {
                const redisValue = await this.redisService.get(key);
                if (redisValue !== null) {
                    this.logger.debug(`Redis cache hit for key: ${key}`);
                    this.setMemoryCache(key, redisValue, 300);
                    return redisValue;
                }
            }
            this.logger.debug(`Cache miss for key: ${key}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Error getting cache for key ${key}:`, error);
            return null;
        }
    }
    async del(key) {
        try {
            this.memoryCache.delete(key);
            if (this.redisService.isReady()) {
                await this.redisService.del(key);
            }
            this.logger.debug(`Deleted cache key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Error deleting cache key ${key}:`, error);
        }
    }
    async exists(key) {
        try {
            if (this.memoryCache.has(key)) {
                const cached = this.memoryCache.get(key);
                if (cached && Date.now() < cached.expires) {
                    return true;
                }
                this.memoryCache.delete(key);
            }
            if (this.redisService.isReady()) {
                return await this.redisService.exists(key);
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error checking cache existence for key ${key}:`, error);
            return false;
        }
    }
    async invalidateByTag(tag) {
        try {
            if (!this.redisService.isReady()) {
                return 0;
            }
            const keys = await this.redisService.smembers(`tag:${tag}`);
            let count = 0;
            for (const key of keys) {
                await this.del(key);
                count++;
            }
            await this.redisService.del(`tag:${tag}`);
            this.logger.info(`Invalidated ${count} keys by tag: ${tag}`);
            return count;
        }
        catch (error) {
            this.logger.error(`Error invalidating cache by tag ${tag}:`, error);
            return 0;
        }
    }
    async invalidateByPattern(pattern) {
        try {
            let count = 0;
            const regex = new RegExp(pattern);
            for (const key of this.memoryCache.keys()) {
                if (regex.test(key)) {
                    this.memoryCache.delete(key);
                    count++;
                }
            }
            if (this.redisService.isReady()) {
                const keys = await this.redisService.getClient().keys(pattern);
                for (const key of keys) {
                    await this.redisService.del(key);
                    count++;
                }
            }
            this.logger.info(`Invalidated ${count} keys by pattern: ${pattern}`);
            return count;
        }
        catch (error) {
            this.logger.error(`Error invalidating cache by pattern ${pattern}:`, error);
            return 0;
        }
    }
    async clear() {
        try {
            this.memoryCache.clear();
            if (this.redisService.isReady()) {
                await this.redisService.getClient().flushdb();
            }
            this.logger.info('Cache cleared');
        }
        catch (error) {
            this.logger.error('Error clearing cache:', error);
        }
    }
    async getStats() {
        try {
            const stats = {
                memorySize: this.memoryCache.size
            };
            if (this.redisService.isReady()) {
                const info = await this.redisService.getClient().info('keyspace');
                stats.redisSize = 0;
            }
            return stats;
        }
        catch (error) {
            this.logger.error('Error getting cache stats:', error);
            return { memorySize: this.memoryCache.size };
        }
    }
    async warmCache(keys, dataProvider) {
        try {
            this.logger.info(`Warming cache with ${keys.length} keys`);
            for (const key of keys) {
                try {
                    const data = await dataProvider(key);
                    if (data !== null) {
                        await this.set(key, data, { ttl: 3600 });
                    }
                }
                catch (error) {
                    this.logger.error(`Error warming cache for key ${key}:`, error);
                }
            }
            this.logger.info('Cache warming completed');
        }
        catch (error) {
            this.logger.error('Error warming cache:', error);
        }
    }
    setMemoryCache(key, value, ttl) {
        const expires = Date.now() + (ttl * 1000);
        this.memoryCache.set(key, { data: value, expires });
        this.cleanupMemoryCache();
    }
    getMemoryCache(key) {
        const cached = this.memoryCache.get(key);
        if (!cached) {
            return null;
        }
        if (Date.now() > cached.expires) {
            this.memoryCache.delete(key);
            return null;
        }
        return cached.data;
    }
    cleanupMemoryCache() {
        const now = Date.now();
        for (const [key, value] of this.memoryCache.entries()) {
            if (now > value.expires) {
                this.memoryCache.delete(key);
            }
        }
    }
    async storeTags(key, tags) {
        try {
            for (const tag of tags) {
                await this.redisService.sadd(`tag:${tag}`, key);
            }
        }
        catch (error) {
            this.logger.error(`Error storing tags for key ${key}:`, error);
        }
    }
}
exports.CacheService = CacheService;
//# sourceMappingURL=cache.service.js.map