"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
class RedisService {
    constructor() {
        this.isConnected = false;
        this.logger = new logger_1.Logger('RedisService');
    }
    async connect() {
        try {
            const config = {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                db: parseInt(process.env.REDIS_DB || '0'),
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000,
                retryDelayOnClusterDown: 300,
                enableOfflineQueue: false,
                maxLoadingTimeout: 10000,
                enableReadyCheck: true,
                autoResubscribe: true,
                autoResendUnfulfilledCommands: true,
                showFriendlyErrorStack: process.env.NODE_ENV === 'development'
            };
            if (process.env.REDIS_PASSWORD) {
                config.password = process.env.REDIS_PASSWORD;
            }
            this.redis = new ioredis_1.default(config);
            this.redis.on('connect', () => {
                this.logger.info('Redis client connected');
                this.isConnected = true;
            });
            this.redis.on('ready', () => {
                this.logger.info('Redis client ready');
            });
            this.redis.on('error', (error) => {
                this.logger.error('Redis client error:', error);
                this.isConnected = false;
            });
            this.redis.on('close', () => {
                this.logger.warn('Redis client connection closed');
                this.isConnected = false;
            });
            this.redis.on('reconnecting', () => {
                this.logger.info('Redis client reconnecting...');
            });
            await this.redis.connect();
            this.logger.info('Redis connection established successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            if (this.redis) {
                await this.redis.quit();
                this.logger.info('Redis connection closed successfully');
                this.isConnected = false;
            }
        }
        catch (error) {
            this.logger.error('Error closing Redis connection:', error);
            throw error;
        }
    }
    getClient() {
        if (!this.redis || !this.isConnected) {
            throw new Error('Redis not initialized');
        }
        return this.redis;
    }
    async set(key, value, ttl) {
        try {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            if (ttl) {
                await this.redis.setex(key, ttl, serializedValue);
            }
            else {
                await this.redis.set(key, serializedValue);
            }
        }
        catch (error) {
            this.logger.error('Redis set error:', error);
            throw error;
        }
    }
    async get(key) {
        try {
            const value = await this.redis.get(key);
            if (value === null)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch (error) {
            this.logger.error('Redis get error:', error);
            throw error;
        }
    }
    async del(key) {
        try {
            await this.redis.del(key);
        }
        catch (error) {
            this.logger.error('Redis del error:', error);
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error('Redis exists error:', error);
            throw error;
        }
    }
    async expire(key, ttl) {
        try {
            await this.redis.expire(key, ttl);
        }
        catch (error) {
            this.logger.error('Redis expire error:', error);
            throw error;
        }
    }
    async ttl(key) {
        try {
            return await this.redis.ttl(key);
        }
        catch (error) {
            this.logger.error('Redis ttl error:', error);
            throw error;
        }
    }
    async hset(key, field, value) {
        try {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            await this.redis.hset(key, field, serializedValue);
        }
        catch (error) {
            this.logger.error('Redis hset error:', error);
            throw error;
        }
    }
    async hget(key, field) {
        try {
            const value = await this.redis.hget(key, field);
            if (value === null)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch (error) {
            this.logger.error('Redis hget error:', error);
            throw error;
        }
    }
    async hgetall(key) {
        try {
            const result = await this.redis.hgetall(key);
            const parsed = {};
            for (const [field, value] of Object.entries(result)) {
                try {
                    parsed[field] = JSON.parse(value);
                }
                catch {
                    parsed[field] = value;
                }
            }
            return parsed;
        }
        catch (error) {
            this.logger.error('Redis hgetall error:', error);
            throw error;
        }
    }
    async lpush(key, value) {
        try {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            await this.redis.lpush(key, serializedValue);
        }
        catch (error) {
            this.logger.error('Redis lpush error:', error);
            throw error;
        }
    }
    async rpop(key) {
        try {
            const value = await this.redis.rpop(key);
            if (value === null)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch (error) {
            this.logger.error('Redis rpop error:', error);
            throw error;
        }
    }
    async lrange(key, start, stop) {
        try {
            const values = await this.redis.lrange(key, start, stop);
            return values.map((value) => {
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            });
        }
        catch (error) {
            this.logger.error('Redis lrange error:', error);
            throw error;
        }
    }
    async sadd(key, member) {
        try {
            const serializedMember = typeof member === 'string' ? member : JSON.stringify(member);
            await this.redis.sadd(key, serializedMember);
        }
        catch (error) {
            this.logger.error('Redis sadd error:', error);
            throw error;
        }
    }
    async smembers(key) {
        try {
            const members = await this.redis.smembers(key);
            return members.map((member) => {
                try {
                    return JSON.parse(member);
                }
                catch {
                    return member;
                }
            });
        }
        catch (error) {
            this.logger.error('Redis smembers error:', error);
            throw error;
        }
    }
    async incrementRateLimit(key, window) {
        try {
            const multi = this.redis.multi();
            multi.incr(key);
            multi.expire(key, window);
            const results = await multi.exec();
            return results?.[0]?.[1] || 0;
        }
        catch (error) {
            this.logger.error('Redis rate limit error:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return false;
            }
            await this.redis.ping();
            return true;
        }
        catch (error) {
            this.logger.error('Redis health check failed:', error);
            return false;
        }
    }
    isReady() {
        return this.isConnected;
    }
}
exports.RedisService = RedisService;
//# sourceMappingURL=redis.service.js.map