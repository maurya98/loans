import cors, { CorsOptions } from 'cors';

export class CORSHandler {
  public static handle() {
    const options: CorsOptions = {
      // origin: process.env.CORS_ORIGIN || '*',
      // credentials: process.env.CORS_CREDENTIALS === 'true',
      // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-api-key'],
      // exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
      // preflightContinue: false,
      // optionsSuccessStatus: 204
    };
    return cors(options);
  }
} 