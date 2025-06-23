"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingMiddleware = void 0;
const logger_1 = require("../utils/logger");
class CachingMiddleware {
    static handle(config) {
        const defaultConfig = {
            ttl: parseInt(process.env.CACHE_TTL || '3600'),
            keyGenerator: (req) => {
                const varyBy = config?.varyBy || ['authorization', 'accept'];
                const parts = [req.method, req.originalUrl];
                varyBy.forEach(header => {
                    const value = req.headers[header];
                    if (value) {
                        parts.push(`${header}:${value}`);
                    }
                });
                return parts.join('|');
            },
            condition: (req, res) => {
                return req.method === 'GET' && res.statusCode === 200;
            }
        };
        const finalConfig = { ...defaultConfig, ...config };
        return async (req, res, next) => {
            try {
                if (!finalConfig.condition(req, res)) {
                    return next();
                }
                const cacheKey = finalConfig.keyGenerator(req);
                const cached = this.get(cacheKey);
                if (cached) {
                    this.logger.debug('Cache hit for key:', cacheKey);
                    return res.json(cached);
                }
                const originalSend = res.send;
                const originalJson = res.json;
                res.send = function (data) {
                    if (finalConfig.condition(req, res)) {
                        CachingMiddleware.set(cacheKey, data, finalConfig.ttl);
                    }
                    return originalSend.call(this, data);
                };
                res.json = function (data) {
                    if (finalConfig.condition(req, res)) {
                        CachingMiddleware.set(cacheKey, data, finalConfig.ttl);
                    }
                    return originalJson.call(this, data);
                };
                next();
            }
            catch (error) {
                this.logger.error('Caching middleware error:', error);
                next();
            }
        };
    }
    static set(key, data, ttl) {
        try {
            const expires = Date.now() + (ttl * 1000);
            this.cache.set(key, { data, expires });
            this.cleanup();
        }
        catch (error) {
            this.logger.error('Cache set error:', error);
        }
    }
    static get(key) {
        try {
            const cached = this.cache.get(key);
            if (!cached) {
                return null;
            }
            if (Date.now() > cached.expires) {
                this.cache.delete(key);
                return null;
            }
            return cached.data;
        }
        catch (error) {
            this.logger.error('Cache get error:', error);
            return null;
        }
    }
    static delete(key) {
        try {
            return this.cache.delete(key);
        }
        catch (error) {
            this.logger.error('Cache delete error:', error);
            return false;
        }
    }
    static clear() {
        try {
            this.cache.clear();
        }
        catch (error) {
            this.logger.error('Cache clear error:', error);
        }
    }
    static has(key) {
        try {
            const cached = this.cache.get(key);
            if (!cached) {
                return false;
            }
            if (Date.now() > cached.expires) {
                this.cache.delete(key);
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Cache has error:', error);
            return false;
        }
    }
    static keys() {
        try {
            this.cleanup();
            return Array.from(this.cache.keys());
        }
        catch (error) {
            this.logger.error('Cache keys error:', error);
            return [];
        }
    }
    static size() {
        try {
            this.cleanup();
            return this.cache.size;
        }
        catch (error) {
            this.logger.error('Cache size error:', error);
            return 0;
        }
    }
    static stats() {
        try {
            this.cleanup();
            return {
                size: this.cache.size,
                keys: Array.from(this.cache.keys())
            };
        }
        catch (error) {
            this.logger.error('Cache stats error:', error);
            return { size: 0, keys: [] };
        }
    }
    static cleanup() {
        try {
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now > value.expires) {
                    this.cache.delete(key);
                }
            }
        }
        catch (error) {
            this.logger.error('Cache cleanup error:', error);
        }
    }
    static invalidatePattern(pattern) {
        try {
            let count = 0;
            const regex = new RegExp(pattern);
            for (const key of this.cache.keys()) {
                if (regex.test(key)) {
                    this.cache.delete(key);
                    count++;
                }
            }
            return count;
        }
        catch (error) {
            this.logger.error('Cache invalidate pattern error:', error);
            return 0;
        }
    }
    static invalidateByMethod(method) {
        return this.invalidatePattern(`^${method.toUpperCase()}\\|`);
    }
    static invalidateByPath(path) {
        return this.invalidatePattern(`\\|${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    }
    static invalidateByUser(userId) {
        return this.invalidatePattern(`authorization:.*${userId}`);
    }
}
exports.CachingMiddleware = CachingMiddleware;
CachingMiddleware.logger = new logger_1.Logger('CachingMiddleware');
CachingMiddleware.cache = new Map();
//# sourceMappingURL=caching.js.map