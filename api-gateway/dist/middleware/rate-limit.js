"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const logger_1 = require("../utils/logger");
class RateLimitMiddleware {
    static createLimiter(config) {
        const defaultConfig = {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
            skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
            skipFailedRequests: false,
            keyGenerator: (req) => {
                return req.ip || req.connection.remoteAddress || 'unknown';
            }
        };
        const finalConfig = { ...defaultConfig, ...config };
        return async (req, res, next) => {
            try {
                const key = finalConfig.keyGenerator(req);
                const result = await this.checkLimit(key, finalConfig);
                if (!result.allowed) {
                    res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests);
                    res.setHeader('X-RateLimit-Remaining', result.remaining);
                    res.setHeader('X-RateLimit-Reset', result.resetTime.getTime());
                    if (result.retryAfter) {
                        res.setHeader('Retry-After', result.retryAfter);
                    }
                    if (finalConfig.handler) {
                        return finalConfig.handler(req, res);
                    }
                    return res.status(429).json({
                        error: 'Too Many Requests',
                        message: 'Rate limit exceeded',
                        retryAfter: result.retryAfter
                    });
                }
                res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests);
                res.setHeader('X-RateLimit-Remaining', result.remaining);
                res.setHeader('X-RateLimit-Reset', result.resetTime.getTime());
                next();
            }
            catch (error) {
                this.logger.error('Rate limiting error:', error);
                next();
            }
        };
    }
    static async checkLimit(key, config) {
        const now = Date.now();
        const windowStart = now - config.windowMs;
        const current = this.store.get(key);
        if (!current || current.resetTime < now) {
            this.store.set(key, {
                count: 1,
                resetTime: now + config.windowMs
            });
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: new Date(now + config.windowMs)
            };
        }
        if (current.count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: new Date(current.resetTime),
                retryAfter: Math.ceil((current.resetTime - now) / 1000)
            };
        }
        current.count++;
        this.store.set(key, current);
        return {
            allowed: true,
            remaining: config.maxRequests - current.count,
            resetTime: new Date(current.resetTime)
        };
    }
    static createUserLimiter(userId, config) {
        return this.createLimiter({
            ...config,
            keyGenerator: () => `user:${userId}`
        });
    }
    static createIPLimiter(config) {
        return this.createLimiter({
            ...config,
            keyGenerator: (req) => req.ip || req.connection.remoteAddress || 'unknown'
        });
    }
    static createEndpointLimiter(endpoint, config) {
        return this.createLimiter({
            ...config,
            keyGenerator: (req) => `${req.ip}:${endpoint}`
        });
    }
    static createTokenLimiter(config) {
        return this.createLimiter({
            ...config,
            keyGenerator: (req) => {
                const token = req.headers.authorization?.replace('Bearer ', '') ||
                    req.headers['x-api-key'] ||
                    req.query.token;
                return token || req.ip || 'unknown';
            }
        });
    }
    static getRateLimitInfo(key) {
        return this.store.get(key) || null;
    }
    static resetRateLimit(key) {
        this.store.delete(key);
    }
    static clearAllRateLimits() {
        this.store.clear();
    }
    static getStoreSize() {
        return this.store.size;
    }
}
exports.RateLimitMiddleware = RateLimitMiddleware;
RateLimitMiddleware.logger = new logger_1.Logger('RateLimitMiddleware');
RateLimitMiddleware.store = new Map();
//# sourceMappingURL=rate-limit.js.map