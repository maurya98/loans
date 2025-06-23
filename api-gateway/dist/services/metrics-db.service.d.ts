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
export declare class MetricsDBService {
    private repository;
    private logger;
    private databaseService;
    constructor();
    private getRepository;
    recordMetric(data: MetricData): Promise<Metric>;
    recordRequestMetric(method: string, path: string, statusCode: number, responseTime: number, service?: string): Promise<void>;
    recordErrorMetric(errorType: string, service?: string, endpoint?: string, method?: string): Promise<void>;
    getMetrics(name?: string, service?: string, startTime?: Date, endTime?: Date, limit?: number): Promise<Metric[]>;
    getMetricStats(name: string, service?: string, startTime?: Date, endTime?: Date): Promise<{
        count: number;
        sum: number;
        avg: number;
        min: number;
        max: number;
    }>;
    getTopEndpoints(service?: string, startTime?: Date, endTime?: Date, limit?: number): Promise<Array<{
        endpoint: string;
        count: number;
    }>>;
    getErrorSummary(service?: string, startTime?: Date, endTime?: Date): Promise<Array<{
        errorType: string;
        count: number;
    }>>;
    cleanupOldMetrics(olderThanDays?: number): Promise<number>;
    getMetricsSummary(service?: string, startTime?: Date, endTime?: Date): Promise<{
        totalRequests: number;
        totalErrors: number;
        avgResponseTime: number;
        topEndpoints: Array<{
            endpoint: string;
            count: number;
        }>;
        errorTypes: Array<{
            errorType: string;
            count: number;
        }>;
    }>;
}
//# sourceMappingURL=metrics-db.service.d.ts.map