import { Request, Response, NextFunction } from 'express';
export declare class CircuitBreakerMiddleware {
    private static logger;
    private static states;
    static handle(): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
}
//# sourceMappingURL=circuit-breaker.d.ts.map