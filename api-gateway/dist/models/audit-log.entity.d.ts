export declare class AuditLog {
    id: string;
    method: string;
    path: string;
    userId: string | null;
    clientId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    statusCode: number;
    responseTime: number | null;
    requestSize: number | null;
    responseSize: number | null;
    service: string | null;
    requestHeaders: Record<string, string> | null;
    responseHeaders: Record<string, string> | null;
    requestBody: string | null;
    responseBody: string | null;
    errorType: string | null;
    errorMessage: string | null;
    timestamp: Date;
    createdAt: Date;
}
//# sourceMappingURL=audit-log.entity.d.ts.map