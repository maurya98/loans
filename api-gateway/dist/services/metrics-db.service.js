"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsDBService = void 0;
const database_service_1 = require("./database.service");
const logger_1 = require("../utils/logger");
const metric_entity_1 = require("../models/metric.entity");
class MetricsDBService {
    constructor() {
        this.logger = new logger_1.Logger('MetricsDBService');
        this.databaseService = new database_service_1.DatabaseService();
    }
    async getRepository() {
        if (!this.repository) {
            const dataSource = this.databaseService.getDataSource();
            this.repository = dataSource.getRepository(metric_entity_1.Metric);
        }
        return this.repository;
    }
    async recordMetric(data) {
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
        }
        catch (error) {
            this.logger.error(`Error recording metric ${data.name}:`, error);
            throw new Error('Failed to record metric');
        }
    }
    async recordRequestMetric(method, path, statusCode, responseTime, service) {
        try {
            const timestamp = new Date();
            const repo = await this.getRepository();
            const requestMetric = new metric_entity_1.Metric();
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
            const responseMetric = new metric_entity_1.Metric();
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
            const statusMetric = new metric_entity_1.Metric();
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
        }
        catch (error) {
            this.logger.error('Error recording request metrics:', error);
        }
    }
    async recordErrorMetric(errorType, service, endpoint, method) {
        try {
            const repo = await this.getRepository();
            const errorMetric = new metric_entity_1.Metric();
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
        }
        catch (error) {
            this.logger.error('Error recording error metric:', error);
        }
    }
    async getMetrics(name, service, startTime, endTime, limit = 1000) {
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
        }
        catch (error) {
            this.logger.error('Error fetching metrics:', error);
            return [];
        }
    }
    async getMetricStats(name, service, startTime, endTime) {
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
        }
        catch (error) {
            this.logger.error(`Error getting metric stats for ${name}:`, error);
            return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
        }
    }
    async getTopEndpoints(service, startTime, endTime, limit = 10) {
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
        }
        catch (error) {
            this.logger.error('Error getting top endpoints:', error);
            return [];
        }
    }
    async getErrorSummary(service, startTime, endTime) {
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
        }
        catch (error) {
            this.logger.error('Error getting error summary:', error);
            return [];
        }
    }
    async cleanupOldMetrics(olderThanDays = 30) {
        try {
            const repo = await this.getRepository();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            const result = await repo.delete({
                timestamp: { $lt: cutoffDate }
            });
            const deletedCount = result.affected || 0;
            this.logger.info(`Cleaned up ${deletedCount} old metrics (older than ${olderThanDays} days)`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error('Error cleaning up old metrics:', error);
            return 0;
        }
    }
    async getMetricsSummary(service, startTime, endTime) {
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
        }
        catch (error) {
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
exports.MetricsDBService = MetricsDBService;
//# sourceMappingURL=metrics-db.service.js.map