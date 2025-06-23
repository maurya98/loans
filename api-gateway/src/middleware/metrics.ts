import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services/metrics.service';

export class MetricsMiddleware {
  private static metricsService = new MetricsService();

  public static collect() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000; // Convert to seconds
        
        // Record request metrics
        this.metricsService.incrementRequest(
          req.method,
          req.path,
          res.statusCode
        );
        
        // Record request duration
        this.metricsService.recordRequestDuration(
          req.method,
          req.path,
          duration
        );
        
        // Record errors
        if (res.statusCode >= 400) {
          this.metricsService.incrementError(
            res.statusCode >= 500 ? 'server_error' : 'client_error',
            req.path
          );
        }
      });

      next();
    };
  }
} 