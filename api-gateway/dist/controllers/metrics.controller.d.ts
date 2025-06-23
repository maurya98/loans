import { Router } from 'express';
export declare class MetricsController {
    private router;
    private metricsService;
    private metricsDBService;
    constructor();
    getRouter(): Router;
    private metrics;
    private metricsJson;
    private getMetricsFromDB;
    private getMetricsSummary;
    private getMetricStats;
    private getTopEndpoints;
    private getErrorSummary;
}
//# sourceMappingURL=metrics.controller.d.ts.map