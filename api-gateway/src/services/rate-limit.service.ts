import { Repository } from 'typeorm';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';
import { RateLimit } from '../models/rate-limit.entity';

export interface RateLimitConfig {
  limit: number;
  window: number; // in seconds
  type: 'client' | 'user' | 'ip' | 'global';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}

export class RateLimitService {
  private repository!: Repository<RateLimit>;
  private logger: Logger;
  private databaseService: DatabaseService;

  constructor() {
    this.logger = new Logger('RateLimitService');
    this.databaseService = new DatabaseService();
  }

  private async getRepository(): Promise<Repository<RateLimit>> {
    if (!this.repository) {
      const dataSource = this.databaseService.getDataSource();
      this.repository = dataSource.getRepository(RateLimit);
    }
    return this.repository;
  }

  public async checkRateLimit(
    identifier: string,
    endpoint: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      const repo = await this.getRepository();
      const now = new Date();
      const windowStart = new Date(now.getTime() - config.window * 1000);

      // Find existing rate limit record
      let rateLimit = await repo.findOne({
        where: {
          identifier,
          type: config.type,
          endpoint,
          isActive: true
        }
      });

      if (!rateLimit) {
        // Create new rate limit record
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
      } else {
        // Check if window has expired
        if (rateLimit.windowEnd && rateLimit.windowEnd < now) {
          // Reset window
          rateLimit.currentCount = 1;
          rateLimit.windowStart = now;
          rateLimit.windowEnd = new Date(now.getTime() + config.window * 1000);
        } else {
          // Increment count
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
    } catch (error) {
      this.logger.error(`Error checking rate limit for ${identifier}:`, error);
      // Default to allowing the request if there's an error
      return {
        allowed: true,
        remaining: config.limit - 1,
        resetTime: new Date(Date.now() + config.window * 1000),
        limit: config.limit
      };
    }
  }

  public async getRateLimitStatus(identifier: string, endpoint: string): Promise<RateLimit | null> {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({
        where: {
          identifier,
          endpoint,
          isActive: true
        }
      });
    } catch (error) {
      this.logger.error(`Error getting rate limit status for ${identifier}:`, error);
      return null;
    }
  }

  public async resetRateLimit(identifier: string, endpoint: string): Promise<boolean> {
    try {
      const repo = await this.getRepository();
      const result = await repo.update(
        { identifier, endpoint, isActive: true },
        { currentCount: 0, updatedAt: new Date() }
      );
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      this.logger.error(`Error resetting rate limit for ${identifier}:`, error);
      return false;
    }
  }

  public async createRateLimit(
    identifier: string,
    endpoint: string,
    config: RateLimitConfig
  ): Promise<RateLimit> {
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
    } catch (error) {
      this.logger.error(`Error creating rate limit for ${identifier}:`, error);
      throw new Error('Failed to create rate limit');
    }
  }

  public async updateRateLimit(
    id: string,
    update: Partial<RateLimit>
  ): Promise<RateLimit | undefined> {
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
    } catch (error) {
      this.logger.error(`Error updating rate limit ${id}:`, error);
      return undefined;
    }
  }

  public async deleteRateLimit(id: string): Promise<boolean> {
    try {
      const repo = await this.getRepository();
      const rateLimit = await repo.findOne({ where: { id } });
      
      if (!rateLimit) {
        return false;
      }

      await repo.remove(rateLimit);
      this.logger.info(`Deleted rate limit: ${rateLimit.identifier}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting rate limit ${id}:`, error);
      return false;
    }
  }

  public async getRateLimitStats(): Promise<{ total: number; byType: Record<string, number> }> {
    try {
      const repo = await this.getRepository();
      const rateLimits = await repo.find({ where: { isActive: true } });
      
      const byType: Record<string, number> = {};
      rateLimits.forEach(rateLimit => {
        byType[rateLimit.type] = (byType[rateLimit.type] || 0) + 1;
      });

      return {
        total: rateLimits.length,
        byType
      };
    } catch (error) {
      this.logger.error('Error getting rate limit stats:', error);
      return { total: 0, byType: {} };
    }
  }

  public async cleanupExpiredRateLimits(): Promise<number> {
    try {
      const repo = await this.getRepository();
      const now = new Date();
      
      const result = await repo.update(
        { isActive: true },
        { isActive: false, updatedAt: now }
      );

      const cleanedCount = result.affected || 0;
      this.logger.info(`Cleaned up ${cleanedCount} expired rate limits`);
      return cleanedCount;
    } catch (error) {
      this.logger.error('Error cleaning up expired rate limits:', error);
      return 0;
    }
  }
} 