import { Request, Response } from 'express';
import db from '../database/connection';
import redis from '../database/redis';
import logger from '../utils/logger';

export const healthController = {
  async getHealth(_req: Request, res: Response): Promise<void> {
    try {
      const dbHealth = await db.healthCheck();
      const redisHealth = await redis.healthCheck();
      
      const status = dbHealth && redisHealth ? 'healthy' : 'unhealthy';
      const statusCode = status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        status,
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth ? 'healthy' : 'unhealthy',
          redis: redisHealth ? 'healthy' : 'unhealthy'
        }
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  }
}; 