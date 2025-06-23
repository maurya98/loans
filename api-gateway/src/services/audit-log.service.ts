import { Repository } from 'typeorm';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';
import { AuditLog } from '../models/audit-log.entity';

export interface AuditLogData {
  method: string;
  path: string;
  userId?: string;
  clientId?: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode: number;
  responseTime?: number;
  requestSize?: number;
  responseSize?: number;
  service?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  errorType?: string;
  errorMessage?: string;
}

export class AuditLogService {
  private repository!: Repository<AuditLog>;
  private logger: Logger;
  private databaseService: DatabaseService;

  constructor() {
    this.logger = new Logger('AuditLogService');
    this.databaseService = new DatabaseService();
  }

  private async getRepository(): Promise<Repository<AuditLog>> {
    if (!this.repository) {
      const dataSource = this.databaseService.getDataSource();
      this.repository = dataSource.getRepository(AuditLog);
    }
    return this.repository;
  }

  public async logRequest(data: AuditLogData): Promise<AuditLog> {
    try {
      const repo = await this.getRepository();
      const auditLog = new AuditLog();
      
      auditLog.method = data.method;
      auditLog.path = data.path;
      auditLog.userId = data.userId || null;
      auditLog.clientId = data.clientId || null;
      auditLog.ipAddress = data.ipAddress || null;
      auditLog.userAgent = data.userAgent || null;
      auditLog.statusCode = data.statusCode;
      auditLog.responseTime = data.responseTime || null;
      auditLog.requestSize = data.requestSize || null;
      auditLog.responseSize = data.responseSize || null;
      auditLog.service = data.service || null;
      auditLog.requestHeaders = data.requestHeaders || null;
      auditLog.responseHeaders = data.responseHeaders || null;
      auditLog.requestBody = data.requestBody || null;
      auditLog.responseBody = data.responseBody || null;
      auditLog.errorType = data.errorType || null;
      auditLog.errorMessage = data.errorMessage || null;
      auditLog.timestamp = new Date();
      auditLog.createdAt = new Date();

      const savedLog = await repo.save(auditLog);
      this.logger.debug(`Audit log created: ${data.method} ${data.path} - ${data.statusCode}`);
      return savedLog;
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw new Error('Failed to create audit log');
    }
  }

  public async getAuditLogs(
    filters: {
      userId?: string;
      clientId?: string;
      method?: string;
      path?: string;
      statusCode?: number;
      service?: string;
      startTime?: Date;
      endTime?: Date;
    },
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const repo = await this.getRepository();
      const queryBuilder = repo.createQueryBuilder('log');

      if (filters.userId) {
        queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
      }

      if (filters.clientId) {
        queryBuilder.andWhere('log.clientId = :clientId', { clientId: filters.clientId });
      }

      if (filters.method) {
        queryBuilder.andWhere('log.method = :method', { method: filters.method });
      }

      if (filters.path) {
        queryBuilder.andWhere('log.path LIKE :path', { path: `%${filters.path}%` });
      }

      if (filters.statusCode) {
        queryBuilder.andWhere('log.statusCode = :statusCode', { statusCode: filters.statusCode });
      }

      if (filters.service) {
        queryBuilder.andWhere('log.service = :service', { service: filters.service });
      }

      if (filters.startTime) {
        queryBuilder.andWhere('log.timestamp >= :startTime', { startTime: filters.startTime });
      }

      if (filters.endTime) {
        queryBuilder.andWhere('log.timestamp <= :endTime', { endTime: filters.endTime });
      }

      const [logs, total] = await queryBuilder
        .orderBy('log.timestamp', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return { logs, total };
    } catch (error) {
      this.logger.error('Error fetching audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  public async getAuditLogById(id: string): Promise<AuditLog | null> {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error fetching audit log ${id}:`, error);
      return null;
    }
  }

  public async getAuditStats(
    startTime?: Date,
    endTime?: Date
  ): Promise<{
    totalRequests: number;
    totalErrors: number;
    avgResponseTime: number;
    byMethod: Record<string, number>;
    byStatusCode: Record<string, number>;
    byService: Record<string, number>;
  }> {
    try {
      const repo = await this.getRepository();
      const queryBuilder = repo.createQueryBuilder('log');

      if (startTime) {
        queryBuilder.andWhere('log.timestamp >= :startTime', { startTime });
      }

      if (endTime) {
        queryBuilder.andWhere('log.timestamp <= :endTime', { endTime });
      }

      // Get total requests
      const totalRequests = await queryBuilder.getCount();

      // Get total errors (status codes >= 400)
      const totalErrors = await queryBuilder
        .andWhere('log.statusCode >= :errorCode', { errorCode: 400 })
        .getCount();

      // Get average response time
      const avgResponseTimeResult = await queryBuilder
        .select('AVG(log.responseTime)', 'avgResponseTime')
        .getRawOne();
      const avgResponseTime = parseFloat(avgResponseTimeResult.avgResponseTime) || 0;

      // Get requests by method
      const byMethodResult = await queryBuilder
        .select(['log.method', 'COUNT(*) as count'])
        .groupBy('log.method')
        .getRawMany();
      const byMethod: Record<string, number> = {};
      byMethodResult.forEach(result => {
        byMethod[result.method] = parseInt(result.count);
      });

      // Get requests by status code
      const byStatusCodeResult = await queryBuilder
        .select(['log.statusCode', 'COUNT(*) as count'])
        .groupBy('log.statusCode')
        .getRawMany();
      const byStatusCode: Record<string, number> = {};
      byStatusCodeResult.forEach(result => {
        byStatusCode[result.statusCode] = parseInt(result.count);
      });

      // Get requests by service
      const byServiceResult = await queryBuilder
        .select(['log.service', 'COUNT(*) as count'])
        .where('log.service IS NOT NULL')
        .groupBy('log.service')
        .getRawMany();
      const byService: Record<string, number> = {};
      byServiceResult.forEach(result => {
        byService[result.service] = parseInt(result.count);
      });

      return {
        totalRequests,
        totalErrors,
        avgResponseTime,
        byMethod,
        byStatusCode,
        byService
      };
    } catch (error) {
      this.logger.error('Error getting audit stats:', error);
      return {
        totalRequests: 0,
        totalErrors: 0,
        avgResponseTime: 0,
        byMethod: {},
        byStatusCode: {},
        byService: {}
      };
    }
  }

  public async cleanupOldLogs(olderThanDays: number = 90): Promise<number> {
    try {
      const repo = await this.getRepository();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await repo.delete({
        timestamp: { $lt: cutoffDate } as any
      });

      const deletedCount = result.affected || 0;
      this.logger.info(`Cleaned up ${deletedCount} old audit logs (older than ${olderThanDays} days)`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }

  public async searchLogs(
    searchTerm: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    try {
      const repo = await this.getRepository();
      return await repo
        .createQueryBuilder('log')
        .where('log.path LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
        .orWhere('log.userId LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
        .orWhere('log.clientId LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
        .orWhere('log.ipAddress LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
        .orWhere('log.errorMessage LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
        .orderBy('log.timestamp', 'DESC')
        .limit(limit)
        .getMany();
    } catch (error) {
      this.logger.error('Error searching audit logs:', error);
      return [];
    }
  }
} 