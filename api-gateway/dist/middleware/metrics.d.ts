import { Request, Response, NextFunction } from 'express';
export declare class MetricsMiddleware {
    private static metricsService;
    static collect(): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=metrics.d.ts.map