import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  openUntil: number;
}

const CIRCUIT_BREAKER_THRESHOLD = parseInt(process.env.GATEWAY_CIRCUIT_BREAKER_THRESHOLD || '5');
const CIRCUIT_BREAKER_TIMEOUT = parseInt(process.env.GATEWAY_CIRCUIT_BREAKER_TIMEOUT || '60000');

export class CircuitBreakerMiddleware {
  private static logger = new Logger('CircuitBreaker');
  private static states: Map<string, CircuitBreakerState> = new Map();

  public static handle() {
    return (req: Request, res: Response, next: NextFunction) => {
      const backend = req.headers['x-backend-service'] || req.path;
      const state = this.states.get(backend as string) || { failures: 0, lastFailure: 0, openUntil: 0 };
      const now = Date.now();

      if (state.openUntil > now) {
        this.logger.warn(`Circuit open for backend: ${backend}`);
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Circuit breaker is open. Please try again later.'
        });
      }

      res.on('finish', () => {
        if (res.statusCode >= 500) {
          state.failures++;
          state.lastFailure = now;
          if (state.failures >= CIRCUIT_BREAKER_THRESHOLD) {
            state.openUntil = now + CIRCUIT_BREAKER_TIMEOUT;
            this.logger.warn(`Circuit opened for backend: ${backend}`);
          }
        } else {
          state.failures = 0;
          state.openUntil = 0;
        }
        this.states.set(backend as string, state);
      });

      next();
    };
  }
} 