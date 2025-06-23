"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitService = void 0;
const database_service_1 = require("./database.service");
const logger_1 = require("../utils/logger");
const rate_limit_entity_1 = require("../models/rate-limit.entity");
class RateLimitService {
    constructor() {
        this.logger = new logger_1.Logger('RateLimitService');
        this.databaseService = new database_service_1.DatabaseService();
    }
    async getRepository() {
        if (!this.repository) {
            const dataSource = this.databaseService.getDataSource();
            this.repository = dataSource.getRepository(rate_limit_entity_1.RateLimit);
        }
        return this.repository;
    }
    async checkRateLimit(identifier, endpoint, config) {
        try {
            const repo = await this.getRepository();
            const now = new Date();
            const windowStart = new Date(now.getTime() - config.window * 1000);
            let rateLimit = await repo.findOne({
                where: {
                    identifier,
                    type: config.type,
                    endpoint,
                    isActive: true
                }
            });
            if (!rateLimit) {
                rateLimit = repo.create({
                    identifier,
                    type: config.type,
                    endpoint,
                    limit: config.limit,
                    window: config.window,
                    currentCount: 1,
                    windowStart: now,
                    windowEnd: new Date(now.getTime() + config.window * 1000),
                    isActive: true,
                    createdAt: now,
                    updatedAt: now
                });
            }
            else {
                if (rateLimit.windowEnd && rateLimit.windowEnd < now) {
                    rateLimit.currentCount = 1;
                    rateLimit.windowStart = now;
                    rateLimit.windowEnd = new Date(now.getTime() + config.window * 1000);
                }
                else {
                    rateLimit.currentCount += 1;
                }
                rateLimit.updatedAt = now;
            }
            await repo.save(rateLimit);
            const remaining = Math.max(0, config.limit - rateLimit.currentCount);
            const allowed = rateLimit.currentCount <= config.limit;
            return {
                allowed,
                remaining,
                resetTime: rateLimit.windowEnd || new Date(),
                limit: config.limit
            };
        }
        catch (error) {
            this.logger.error(`Error checking rate limit for ${identifier}:`, error);
            return {
                allowed: true,
                remaining: config.limit - 1,
                resetTime: new Date(Date.now() + config.window * 1000),
                limit: config.limit
            };
        }
    }
    async getRateLimitStatus(identifier, endpoint) {
        try {
            const repo = await this.getRepository();
            return await repo.findOne({
                where: {
                    identifier,
                    endpoint,
                    isActive: true
                }
            });
        }
        catch (error) {
            this.logger.error(`Error getting rate limit status for ${identifier}:`, error);
            return null;
        }
    }
    async resetRateLimit(identifier, endpoint) {
        try {
            const repo = await this.getRepository();
            const result = await repo.update({ identifier, endpoint, isActive: true }, { currentCount: 0, updatedAt: new Date() });
            return result.affected ? result.affected > 0 : false;
        }
        catch (error) {
            this.logger.error(`Error resetting rate limit for ${identifier}:`, error);
            return false;
        }
    }
    async createRateLimit(identifier, endpoint, config) {
        try {
            const repo = await this.getRepository();
            const rateLimit = repo.create({
                identifier,
                type: config.type,
                endpoint,
                limit: config.limit,
                window: config.window,
                currentCount: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const savedRateLimit = await repo.save(rateLimit);
            this.logger.info(`Created rate limit for ${identifier} on ${endpoint}`);
            return savedRateLimit;
        }
        catch (error) {
            this.logger.error(`Error creating rate limit for ${identifier}:`, error);
            throw new Error('Failed to create rate limit');
        }
    }
    async updateRateLimit(id, update) {
        try {
            const repo = await this.getRepository();
            const rateLimit = await repo.findOne({ where: { id } });
            if (!rateLimit) {
                return undefined;
            }
            Object.assign(rateLimit, { ...update, updatedAt: new Date() });
            const updatedRateLimit = await repo.save(rateLimit);
            this.logger.info(`Updated rate limit: ${updatedRateLimit.identifier}`);
            return updatedRateLimit;
        }
        catch (error) {
            this.logger.error(`Error updating rate limit ${id}:`, error);
            return undefined;
        }
    }
    async deleteRateLimit(id) {
        try {
            const repo = await this.getRepository();
            const rateLimit = await repo.findOne({ where: { id } });
            if (!rateLimit) {
                return false;
            }
            await repo.remove(rateLimit);
            this.logger.info(`Deleted rate limit: ${rateLimit.identifier}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting rate limit ${id}:`, error);
            return false;
        }
    }
    async getRateLimitStats() {
        try {
            const repo = await this.getRepository();
            const rateLimits = await repo.find({ where: { isActive: true } });
            const byType = {};
            rateLimits.forEach(rateLimit => {
                byType[rateLimit.type] = (byType[rateLimit.type] || 0) + 1;
            });
            return {
                total: rateLimits.length,
                byType
            };
        }
        catch (error) {
            this.logger.error('Error getting rate limit stats:', error);
            return { total: 0, byType: {} };
        }
    }
    async cleanupExpiredRateLimits() {
        try {
            const repo = await this.getRepository();
            const now = new Date();
            const result = await repo.update({ isActive: true }, { isActive: false, updatedAt: now });
            const cleanedCount = result.affected || 0;
            this.logger.info(`Cleaned up ${cleanedCount} expired rate limits`);
            return cleanedCount;
        }
        catch (error) {
            this.logger.error('Error cleaning up expired rate limits:', error);
            return 0;
        }
    }
}
exports.RateLimitService = RateLimitService;
//# sourceMappingURL=rate-limit.service.js.map