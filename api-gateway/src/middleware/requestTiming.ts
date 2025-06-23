import { Request, Response, NextFunction } from 'express';

export const requestTimingMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  (req as any).startTime = Date.now();
  next();
}; 