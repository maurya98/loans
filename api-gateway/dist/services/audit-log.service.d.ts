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
export declare class AuditLogService {
    private repository;
    private logger;
    private databaseService;
    constructor();
    private getRepository;
    logRequest(data: AuditLogData): Promise<AuditLog>;
    getAuditLogs(filters: {
        userId?: string;
        clientId?: string;
        method?: string;
        path?: string;
        statusCode?: number;
        service?: string;
        startTime?: Date;
        endTime?: Date;
    }, limit?: number, offset?: number): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    getAuditLogById(id: string): Promise<AuditLog | null>;
    getAuditStats(startTime?: Date, endTime?: Date): Promise<{
        totalRequests: number;
        totalErrors: number;
        avgResponseTime: number;
        byMethod: Record<string, number>;
        byStatusCode: Record<string, number>;
        byService: Record<string, number>;
    }>;
    cleanupOldLogs(olderThanDays?: number): Promise<number>;
    searchLogs(searchTerm: string, limit?: number): Promise<AuditLog[]>;
}
//# sourceMappingURL=audit-log.service.d.ts.map