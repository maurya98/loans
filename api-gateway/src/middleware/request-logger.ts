import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export class RequestLogger {
  private static logger = new Logger('RequestLogger');

  public static log(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      RequestLogger.logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    });
    next();
  }
} 