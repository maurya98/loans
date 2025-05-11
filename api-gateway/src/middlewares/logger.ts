import morgan from 'morgan';
import Log from '../models/Log';
import { Request, Response, NextFunction } from 'express';

// Morgan for console logging
export const httpLogger = morgan('combined');

// Custom DB logger
export async function dbLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const oldSend = res.send;
  let responseBody: any;
  let errorMsg: string | undefined;
  (res as any).send = function (body: any) {
    responseBody = body;
    return oldSend.apply(res, [body]);
  };
  res.on('finish', async () => {
    try {
      await Log.create({
        apiId: (req as any).api?.id || null,
        userId: (req as any).user?.id || null,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        request: JSON.stringify(req.body),
        response: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
        timestamp: new Date(),
        latencyMs: Date.now() - start,
        error: errorMsg,
      });
    } catch (err) {
      // Optionally log error
    }
  });
  res.on('error', (err) => {
    errorMsg = err instanceof Error ? err.message : String(err);
  });
  next();
} 