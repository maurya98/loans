export declare class Metric {
    id: string;
    name: string;
    type: string;
    value: number;
    labels: Record<string, string> | null;
    service: string | null;
    endpoint: string | null;
    method: string | null;
    statusCode: number | null;
    timestamp: Date;
    createdAt: Date;
}
//# sourceMappingURL=metric.entity.d.ts.map