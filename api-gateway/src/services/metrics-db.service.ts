import { Repository } from 'typeorm';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';
import { Metric } from '../models/metric.entity';

export interface MetricData {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  labels?: Record<string, string>;
  service?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

export class MetricsDBService {
  private repository!: Repository<Metric>;
  private logger: Logger;
  private databaseService: DatabaseService;

  constructor() {
    this.logger = new Logger('MetricsDBService');
    this.databaseService = new DatabaseService();
  }

  private async getRepository(): Promise<Repository<Metric>> {
    if (!this.repository) {
      const dataSource = this.databaseService.getDataSource();
      this.repository = dataSource.getRepository(Metric);
    }
    return this.repository;
  }

  public async recordMetric(data: MetricData): Promise<Metric> {
    try {
      const repo = await this.getRepository();
      const metric = repo.create({
        ...data,
        timestamp: new Date(),
        createdAt: new Date()
      });

      const savedMetric = await repo.save(metric);
      this.logger.debug(`Recorded metric: ${data.name} = ${data.value}`);
      return savedMetric;
    } catch (error) {
      this.logger.error(`Error recording metric ${data.name}:`, error);
      throw new Error('Failed to record metric');
    }
  }

  public async recordRequestMetric(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    service?: string
  ): Promise<void> {
    try {
      const timestamp = new Date();
      const repo = await this.getRepository();

      // Record request count
      const requestMetric = new Metric();
      requestMetric.name = 'request_count';
      requestMetric.type = 'counter';
      requestMetric.value = 1;
      requestMetric.labels = { method, path, status_code: statusCode.toString() };
      requestMetric.service = service || null;
      requestMetric.endpoint = path;
      requestMetric.method = method;
      requestMetric.statusCode = statusCode;
      requestMetric.timestamp = timestamp;
      requestMetric.createdAt = timestamp;
      await repo.save(requestMetric);

      // Record response time
      const responseMetric = new Metric();
      responseMetric.name = 'response_time';
      responseMetric.type = 'histogram';
      responseMetric.value = responseTime;
      responseMetric.labels = { method, path, status_code: statusCode.toString() };
      responseMetric.service = service || null;
      responseMetric.endpoint = path;
      responseMetric.method = method;
      responseMetric.statusCode = statusCode;
      responseMetric.timestamp = timestamp;
      responseMetric.createdAt = timestamp;
      await repo.save(responseMetric);

      // Record status code distribution
      const statusMetric = new Metric();
      statusMetric.name = 'status_code_distribution';
      statusMetric.type = 'counter';
      statusMetric.value = 1;
      statusMetric.labels = { status_code: statusCode.toString() };
      statusMetric.service = service || null;
      statusMetric.endpoint = path;
      statusMetric.method = method;
      statusMetric.statusCode = statusCode;
      statusMetric.timestamp = timestamp;
      statusMetric.createdAt = timestamp;
      await repo.save(statusMetric);
    } catch (error) {
      this.logger.error('Error recording request metrics:', error);
    }
  }

  public async recordErrorMetric(
    errorType: string,
    service?: string,
    endpoint?: string,
    method?: string
  ): Promise<void> {
    try {
      const repo = await this.getRepository();
      const errorMetric = new Metric();
      errorMetric.name = 'error_count';
      errorMetric.type = 'counter';
      errorMetric.value = 1;
      errorMetric.labels = { error_type: errorType };
      errorMetric.service = service || null;
      errorMetric.endpoint = endpoint || null;
      errorMetric.method = method || null;
      errorMetric.timestamp = new Date();
      errorMetric.createdAt = new Date();
      await repo.save(errorMetric);
    } catch (error) {
      this.logger.error('Error recording error metric:', error);
    }
  }

  public async getMetrics(
    name?: string,
    service?: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 1000
  ): Promise<Metric[]> {
    try {
      const repo = await this.getRepository();
      const queryBuilder = repo.createQueryBuilder('metric');

      if (name) {
        queryBuilder.andWhere('metric.name = :name', { name });
      }

      if (service) {
        queryBuilder.andWhere('metric.service = :service', { service });
      }

      if (startTime) {
        queryBuilder.andWhere('metric.timestamp >= :startTime', { startTime });
      }

      if (endTime) {
        queryBuilder.andWhere('metric.timestamp <= :endTime', { endTime });
      }

      return await queryBuilder
        .orderBy('metric.timestamp', 'DESC')
        .limit(limit)
        .getMany();
    } catch (error) {
      this.logger.error('Error fetching metrics:', error);
      return [];
    }
  }

  public async getMetricStats(
    name: string,
    service?: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<{
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  }> {
    try {
      const repo = await this.getRepository();
      const queryBuilder = repo.createQueryBuilder('metric')
        .select([
          'COUNT(*) as count',
          'SUM(metric.value) as sum',
          'AVG(metric.value) as avg',
          'MIN(metric.value) as min',
          'MAX(metric.value) as max'
        ])
        .where('metric.name = :name', { name });

      if (service) {
        queryBuilder.andWhere('metric.service = :service', { service });
      }

      if (startTime) {
        queryBuilder.andWhere('metric.timestamp >= :startTime', { startTime });
      }

      if (endTime) {
        queryBuilder.andWhere('metric.timestamp <= :endTime', { endTime });
      }

      const result = await queryBuilder.getRawOne();
      
      return {
        count: parseInt(result.count) || 0,
        sum: parseFloat(result.sum) || 0,
        avg: parseFloat(result.avg) || 0,
        min: parseFloat(result.min) || 0,
        max: parseFloat(result.max) || 0
      };
    } catch (error) {
      this.logger.error(`Error getting metric stats for ${name}:`, error);
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    }
  }

  public async getTopEndpoints(
    service?: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 10
  ): Promise<Array<{ endpoint: string; count: number }>> {
    try {
      const repo = await this.getRepository();
      const queryBuilder = repo.createQueryBuilder('metric')
        .select(['metric.endpoint', 'COUNT(*) as count'])
        .where('metric.name = :name', { name: 'request_count' })
        .andWhere('metric.endpoint IS NOT NULL');

      if (service) {
        queryBuilder.andWhere('metric.service = :service', { service });
      }

      if (startTime) {
        queryBuilder.andWhere('metric.timestamp >= :startTime', { startTime });
      }

      if (endTime) {
        queryBuilder.andWhere('metric.timestamp <= :endTime', { endTime });
      }

      const results = await queryBuilder
        .groupBy('metric.endpoint')
        .orderBy('count', 'DESC')
        .limit(limit)
        .getRawMany();

      return results.map(result => ({
        endpoint: result.endpoint,
        count: parseInt(result.count)
      }));
    } catch (error) {
      this.logger.error('Error getting top endpoints:', error);
      return [];
    }
  }

  public async getErrorSummary(
    service?: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<Array<{ errorType: string; count: number }>> {
    try {
      const repo = await this.getRepository();
      const queryBuilder = repo.createQueryBuilder('metric')
        .select(['metric.labels->>\'error_type\' as errorType', 'COUNT(*) as count'])
        .where('metric.name = :name', { name: 'error_count' });

      if (service) {
        queryBuilder.andWhere('metric.service = :service', { service });
      }

      if (startTime) {
        queryBuilder.andWhere('metric.timestamp >= :startTime', { startTime });
      }

      if (endTime) {
        queryBuilder.andWhere('metric.timestamp <= :endTime', { endTime });
      }

      const results = await queryBuilder
        .groupBy('metric.labels->>\'error_type\'')
        .orderBy('count', 'DESC')
        .getRawMany();

      return results.map(result => ({
        errorType: result.errorType,
        count: parseInt(result.count)
      }));
    } catch (error) {
      this.logger.error('Error getting error summary:', error);
      return [];
    }
  }

  public async cleanupOldMetrics(olderThanDays: number = 30): Promise<number> {
    try {
      const repo = await this.getRepository();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await repo.delete({
        timestamp: { $lt: cutoffDate } as any
      });

      const deletedCount = result.affected || 0;
      this.logger.info(`Cleaned up ${deletedCount} old metrics (older than ${olderThanDays} days)`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up old metrics:', error);
      return 0;
    }
  }

  public async getMetricsSummary(
    service?: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<{
    totalRequests: number;
    totalErrors: number;
    avgResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    errorTypes: Array<{ errorType: string; count: number }>;
  }> {
    try {
      const [requestStats, errorStats, responseTimeStats, topEndpoints, errorTypes] = await Promise.all([
        this.getMetricStats('request_count', service, startTime, endTime),
        this.getMetricStats('error_count', service, startTime, endTime),
        this.getMetricStats('response_time', service, startTime, endTime),
        this.getTopEndpoints(service, startTime, endTime, 5),
        this.getErrorSummary(service, startTime, endTime)
      ]);

      return {
        totalRequests: requestStats.count,
        totalErrors: errorStats.count,
        avgResponseTime: responseTimeStats.avg,
        topEndpoints,
        errorTypes
      };
    } catch (error) {
      this.logger.error('Error getting metrics summary:', error);
      return {
        totalRequests: 0,
        totalErrors: 0,
        avgResponseTime: 0,
        topEndpoints: [],
        errorTypes: []
      };
    }
  }
} 