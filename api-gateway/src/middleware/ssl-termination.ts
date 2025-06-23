import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export class SSLTermination {
  private static logger = new Logger('SSLTermination');

  public static handle() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check if request is coming through a proxy (X-Forwarded-Proto header)
      if (req.headers['x-forwarded-proto'] === 'https') {
        // Request is already HTTPS, continue
        return next();
      }

      // If SSL is required but request is HTTP, redirect to HTTPS
      if (process.env.SSL_REQUIRED === 'true') {
        const httpsUrl = `https://${req.headers.host}${req.url}`;
        this.logger.info(`Redirecting HTTP to HTTPS: ${httpsUrl}`);
        return res.redirect(httpsUrl);
      }

      next();
    };
  }
} 