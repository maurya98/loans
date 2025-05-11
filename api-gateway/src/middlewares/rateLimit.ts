import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// In-memory store for demo (use Redis for production)
const apiRateStore: Record<string, { count: number; reset: number }> = {};

export function perApiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const api = (req as any).api;
  if (!api || !api.rateLimit || !api.rateLimitWindow) {
    return next(); // No rate limit set for this API
  }
  const key = `${api.id}:${req.ip}`;
  const now = Date.now();
  const windowMs = api.rateLimitWindow * 1000;
  if (!apiRateStore[key] || now > apiRateStore[key].reset) {
    apiRateStore[key] = { count: 1, reset: now + windowMs };
  } else {
    apiRateStore[key].count++;
  }
  if (apiRateStore[key].count > api.rateLimit) {
    const retryAfter = Math.ceil((apiRateStore[key].reset - now) / 1000);
    res.set('Retry-After', retryAfter.toString());
    res.status(429).json({ message: 'Too many requests for this API', retryAfter });
    return;
  }
  next();
}

// Default global rate limiter (unchanged)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});