import { Request, Response, NextFunction } from 'express';
import db from '../database/connection';
import analyticsService from '../services/analytics';
import logger from '../utils/logger';

export const requestLoggingMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const start = Date.now();
  
  res.on('finish', async () => {
    try {
      const log = {
        routeId: 'mock-route', // TODO: set actual routeId if available
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: Date.now() - start,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: (req as any).user?.id,
        timestamp: new Date()
      };
      
      await db.query(
        `INSERT INTO request_logs (route_id, method, path, status_code, response_time, ip, user_agent, user_id, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [log.routeId, log.method, log.path, log.statusCode, log.responseTime, log.ip, log.userAgent, log.userId, log.timestamp]
      );
      
      await analyticsService.incrementRealtimeCounters(log.path, log.userId, log.statusCode);
    } catch (err) {
      logger.error('Failed to log request analytics:', err);
    }
  });
  
  next();
}; 