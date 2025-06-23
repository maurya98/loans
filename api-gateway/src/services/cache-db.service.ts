import { Repository } from 'typeorm';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';
import { CacheEntry } from '../models/cache-entry.entity';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  type?: string;
}

export class CacheDBService {
  private repository!: Repository<CacheEntry>;
  private logger: Logger;
  private databaseService: DatabaseService;

  constructor() {
    this.logger = new Logger('CacheDBService');
    this.databaseService = new DatabaseService();
  }

  private async getRepository(): Promise<Repository<CacheEntry>> {
    if (!this.repository) {
      const dataSource = this.databaseService.getDataSource();
      this.repository = dataSource.getRepository(CacheEntry);
    }
    return this.repository;
  }

  public async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = 3600, tags = [], type = 'database' } = options;
      const repo = await this.getRepository();
      
      // Check if entry already exists
      let cacheEntry = await repo.findOne({ where: { key, isActive: true } });
      
      if (cacheEntry) {
        // Update existing entry
        cacheEntry.value = JSON.stringify(value);
        cacheEntry.ttl = ttl;
        cacheEntry.expiresAt = ttl > 0 ? new Date(Date.now() + ttl * 1000) : null;
        cacheEntry.tags = tags;
        cacheEntry.type = type;
        cacheEntry.updatedAt = new Date();
        cacheEntry.size = JSON.stringify(value).length;
      } else {
        // Create new entry
        cacheEntry = new CacheEntry();
        cacheEntry.key = key;
        cacheEntry.value = JSON.stringify(value);
        cacheEntry.type = type;
        cacheEntry.ttl = ttl;
        cacheEntry.expiresAt = ttl > 0 ? new Date(Date.now() + ttl * 1000) : null;
        cacheEntry.tags = tags;
        cacheEntry.hitCount = 0;
        cacheEntry.isActive = true;
        cacheEntry.size = JSON.stringify(value).length;
        cacheEntry.createdAt = new Date();
        cacheEntry.updatedAt = new Date();
      }

      await repo.save(cacheEntry);
      this.logger.debug(`Cached key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      this.logger.error(`Error setting cache for key ${key}:`, error);
    }
  }

  public async get(key: string): Promise<any> {
    try {
      const repo = await this.getRepository();
      const cacheEntry = await repo.findOne({ 
        where: { key, isActive: true }
      });

      if (!cacheEntry) {
        this.logger.debug(`Cache miss for key: ${key}`);
        return null;
      }

      // Check if expired
      if (cacheEntry.expiresAt && cacheEntry.expiresAt < new Date()) {
        await this.del(key);
        this.logger.debug(`Cache expired for key: ${key}`);
        return null;
      }

      // Update hit count and last accessed
      cacheEntry.hitCount += 1;
      cacheEntry.lastAccessedAt = new Date();
      await repo.save(cacheEntry);

      this.logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(cacheEntry.value);
    } catch (error) {
      this.logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      const repo = await this.getRepository();
      const cacheEntry = await repo.findOne({ where: { key } });
      
      if (cacheEntry) {
        cacheEntry.isActive = false;
        cacheEntry.updatedAt = new Date();
        await repo.save(cacheEntry);
      }
      
      this.logger.debug(`Deleted cache key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const repo = await this.getRepository();
      const cacheEntry = await repo.findOne({ 
        where: { key, isActive: true }
      });

      if (!cacheEntry) {
        return false;
      }

      // Check if expired
      if (cacheEntry.expiresAt && cacheEntry.expiresAt < new Date()) {
        await this.del(key);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking cache existence for key ${key}:`, error);
      return false;
    }
  }

  public async invalidateByTag(tag: string): Promise<number> {
    try {
      const repo = await this.getRepository();
      const cacheEntries = await repo.find({ 
        where: { tags: { $contains: [tag] } as any, isActive: true }
      });

      let count = 0;
      for (const entry of cacheEntries) {
        entry.isActive = false;
        entry.updatedAt = new Date();
        await repo.save(entry);
        count++;
      }

      this.logger.info(`Invalidated ${count} keys by tag: ${tag}`);
      return count;
    } catch (error) {
      this.logger.error(`Error invalidating cache by tag ${tag}:`, error);
      return 0;
    }
  }

  public async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const repo = await this.getRepository();
      const cacheEntries = await repo
        .createQueryBuilder('cache')
        .where('cache.key LIKE :pattern', { pattern: `%${pattern}%` })
        .andWhere('cache.isActive = :isActive', { isActive: true })
        .getMany();

      let count = 0;
      for (const entry of cacheEntries) {
        entry.isActive = false;
        entry.updatedAt = new Date();
        await repo.save(entry);
        count++;
      }

      this.logger.info(`Invalidated ${count} keys by pattern: ${pattern}`);
      return count;
    } catch (error) {
      this.logger.error(`Error invalidating cache by pattern ${pattern}:`, error);
      return 0;
    }
  }

  public async clear(): Promise<void> {
    try {
      const repo = await this.getRepository();
      await repo.update(
        { isActive: true },
        { isActive: false, updatedAt: new Date() }
      );
      
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  public async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    avgHitCount: number;
    byType: Record<string, number>;
  }> {
    try {
      const repo = await this.getRepository();
      const activeEntries = await repo.find({ where: { isActive: true } });

      const totalEntries = activeEntries.length;
      const totalSize = activeEntries.reduce((sum, entry) => sum + (entry.size || 0), 0);
      const avgHitCount = activeEntries.length > 0 
        ? activeEntries.reduce((sum, entry) => sum + entry.hitCount, 0) / activeEntries.length 
        : 0;

      const byType: Record<string, number> = {};
      activeEntries.forEach(entry => {
        byType[entry.type || 'unknown'] = (byType[entry.type || 'unknown'] || 0) + 1;
      });

      return {
        totalEntries,
        totalSize,
        avgHitCount,
        byType
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        avgHitCount: 0,
        byType: {}
      };
    }
  }

  public async cleanupExpired(): Promise<number> {
    try {
      const repo = await this.getRepository();
      const now = new Date();
      
      const expiredEntries = await repo.find({
        where: { expiresAt: { $lt: now } as any, isActive: true }
      });

      let count = 0;
      for (const entry of expiredEntries) {
        entry.isActive = false;
        entry.updatedAt = new Date();
        await repo.save(entry);
        count++;
      }

      this.logger.info(`Cleaned up ${count} expired cache entries`);
      return count;
    } catch (error) {
      this.logger.error('Error cleaning up expired cache entries:', error);
      return 0;
    }
  }

  public async getTopKeys(limit: number = 10): Promise<Array<{ key: string; hitCount: number }>> {
    try {
      const repo = await this.getRepository();
      const topKeys = await repo.find({
        where: { isActive: true },
        order: { hitCount: 'DESC' },
        take: limit,
        select: ['key', 'hitCount']
      });

      return topKeys.map(entry => ({
        key: entry.key,
        hitCount: entry.hitCount
      }));
    } catch (error) {
      this.logger.error('Error getting top cache keys:', error);
      return [];
    }
  }
} 