import { Request, Response, NextFunction } from 'express';
export declare class ErrorHandler {
    private static logger;
    static handle(): (error: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    static notFound(req: Request, res: Response): void;
    static asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=error-handler.d.ts.map