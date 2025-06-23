import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm.config';
import { RequestLog } from '../models/RequestLog';
import redis from '../database/redis';

export class AnalyticsService {
  private requestLogRepository: Repository<RequestLog>;

  constructor() {
    this.requestLogRepository = AppDataSource.getRepository(RequestLog);
  }

  // DB-based analytics
  async getRequestsOverTime(interval: 'minute' | 'hour' | 'day' = 'hour', limit = 24) {
    let dateTrunc = 'hour';
    if (interval === 'minute') dateTrunc = 'minute';
    if (interval === 'day') dateTrunc = 'day';
    
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select(`DATE_TRUNC('${dateTrunc}', log.timestamp)`, 'period')
      .addSelect('COUNT(*)', 'count')
      .groupBy('period')
      .orderBy('period', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result;
  }

  async getTopRoutes(limit = 10) {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.path', 'path')
      .addSelect('log.method', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.path, log.method')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result;
  }

  async getTopUsers(limit = 10) {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.userId', 'user_id')
      .addSelect('COUNT(*)', 'count')
      .where('log.userId IS NOT NULL')
      .groupBy('log.userId')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result;
  }

  async getErrorRates(interval: 'minute' | 'hour' | 'day' = 'hour', limit = 24) {
    let dateTrunc = 'hour';
    if (interval === 'minute') dateTrunc = 'minute';
    if (interval === 'day') dateTrunc = 'day';
    
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select(`DATE_TRUNC('${dateTrunc}', log.timestamp)`, 'period')
      .addSelect('COUNT(*) FILTER (WHERE log.statusCode >= 400)', 'errors')
      .addSelect('COUNT(*)', 'total')
      .addSelect('ROUND(100.0 * COUNT(*) FILTER (WHERE log.statusCode >= 400) / NULLIF(COUNT(*),0), 2)', 'error_rate')
      .groupBy('period')
      .orderBy('period', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result;
  }

  async getLatencyStats(interval: 'minute' | 'hour' | 'day' = 'hour', limit = 24) {
    let dateTrunc = 'hour';
    if (interval === 'minute') dateTrunc = 'minute';
    if (interval === 'day') dateTrunc = 'day';
    
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select(`DATE_TRUNC('${dateTrunc}', log.timestamp)`, 'period')
      .addSelect('AVG(log.responseTime)', 'avg_response_time')
      .addSelect('MAX(log.responseTime)', 'max_response_time')
      .addSelect('MIN(log.responseTime)', 'min_response_time')
      .groupBy('period')
      .orderBy('period', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result;
  }

  // Real-time analytics (Redis)
  async incrementRealtimeCounters(route: string, userId?: string, statusCode?: number) {
    const now = Math.floor(Date.now() / 1000);
    await redis.incr(`analytics:requests:total:${now}`);
    if (route) await redis.incr(`analytics:requests:route:${route}:${now}`);
    if (userId) await redis.incr(`analytics:requests:user:${userId}:${now}`);
    if (statusCode && statusCode >= 400) await redis.incr(`analytics:requests:errors:${now}`);
    // Set expiry for 2 hours
    await redis.expire(`analytics:requests:total:${now}`, 7200);
    if (route) await redis.expire(`analytics:requests:route:${route}`, 7200);
    if (userId) await redis.expire(`analytics:requests:user:${userId}:${now}`, 7200);
    if (statusCode && statusCode >= 400) await redis.expire(`analytics:requests:errors:${now}`, 7200);
  }

  async getRealtimeStats(windowSeconds = 60) {
    const now = Math.floor(Date.now() / 1000);
    let total = 0, errors = 0;
    for (let i = 0; i < windowSeconds; i++) {
      const t = now - i;
      total += Number(await redis.get(`analytics:requests:total:${t}`)) || 0;
      errors += Number(await redis.get(`analytics:requests:errors:${t}`)) || 0;
    }
    return {
      requestsPerWindow: total,
      errorsPerWindow: errors,
      errorRate: total ? (errors / total) * 100 : 0,
      windowSeconds
    };
  }

  // Additional methods for the controller
  async getHistoricalSummary() {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('COUNT(*)', 'total_requests')
      .addSelect('COUNT(*) FILTER (WHERE log.statusCode >= 400)', 'total_errors')
      .addSelect('AVG(log.responseTime)', 'avg_response_time')
      .addSelect('MAX(log.responseTime)', 'max_response_time')
      .where('log.timestamp >= NOW() - INTERVAL \'24 hours\'')
      .getRawOne();
    
    return result;
  }

  async getHistoricalTrends(interval: 'minute' | 'hour' | 'day' = 'day', limit = 30) {
    let dateTrunc = 'day';
    if (interval === 'minute') dateTrunc = 'minute';
    if (interval === 'hour') dateTrunc = 'hour';
    
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select(`DATE_TRUNC('${dateTrunc}', log.timestamp)`, 'period')
      .addSelect('COUNT(*)', 'count')
      .groupBy('period')
      .orderBy('period', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result;
  }

  async getRealtimeOverview() {
    const now = Math.floor(Date.now() / 1000);
    const current = Number(await redis.get(`analytics:requests:total:${now}`)) || 0;
    const previous = Number(await redis.get(`analytics:requests:total:${now - 60}`)) || 0;
    
    return {
      currentRequests: current,
      previousRequests: previous,
      change: current - previous,
      activeUsers: await this.getActiveUsers()
    };
  }

  async getRouteAnalytics(routeId: string) {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.path', 'path')
      .addSelect('log.method', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(log.responseTime)', 'avg_response_time')
      .where('log.path = :routeId', { routeId })
      .groupBy('log.path, log.method')
      .getRawOne();
    
    return result || null;
  }

  async getRoutePerformance(routeId: string) {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('AVG(log.responseTime)', 'avg_response_time')
      .addSelect('MAX(log.responseTime)', 'max_response_time')
      .addSelect('MIN(log.responseTime)', 'min_response_time')
      .addSelect('COUNT(*) FILTER (WHERE log.statusCode >= 400)', 'error_count')
      .addSelect('COUNT(*)', 'total_requests')
      .where('log.path = :routeId', { routeId })
      .andWhere('log.timestamp >= NOW() - INTERVAL \'1 hour\'')
      .getRawOne();
    
    return result || null;
  }

  async getUserDetails(userId: string) {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.userId', 'user_id')
      .addSelect('COUNT(*)', 'total_requests')
      .addSelect('AVG(log.responseTime)', 'avg_response_time')
      .addSelect('COUNT(*) FILTER (WHERE log.statusCode >= 400)', 'error_count')
      .where('log.userId = :userId', { userId })
      .groupBy('log.userId')
      .getRawOne();
    
    return result || null;
  }

  async getErrorSummary() {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.statusCode', 'status_code')
      .addSelect('COUNT(*)', 'count')
      .addSelect('log.path', 'path')
      .addSelect('log.method', 'method')
      .where('log.statusCode >= 400')
      .andWhere('log.timestamp >= NOW() - INTERVAL \'1 hour\'')
      .groupBy('log.statusCode, log.path, log.method')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
    
    return result;
  }

  async getSlowestRoutes(limit = 10) {
    const result = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('log.path', 'path')
      .addSelect('log.method', 'method')
      .addSelect('AVG(log.responseTime)', 'avg_response_time')
      .addSelect('COUNT(*)', 'request_count')
      .where('log.timestamp >= NOW() - INTERVAL \'1 hour\'')
      .groupBy('log.path, log.method')
      .having('COUNT(*) > 5')
      .orderBy('avg_response_time', 'DESC')
      .limit(limit)
      .getRawMany();
    
    return result;
  }

  private async getActiveUsers(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    let activeUsers = 0;
    for (let i = 0; i < 60; i++) {
      const t = now - i;
      const userCount = await redis.keys(`analytics:requests:user:*:${t}`);
      activeUsers = Math.max(activeUsers, userCount.length);
    }
    return activeUsers;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService; 