import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from '../utils/logger';
import config from '../config';
import RateLimiterManager from './rateLimiter';

export class ProxyService {
  private rateLimiterManager: RateLimiterManager;

  constructor() {
    this.rateLimiterManager = new RateLimiterManager(config.rateLimit);
  }

  async findRoute(_path: string, _method: string): Promise<any> {
    // This would query the database for matching routes
    // For now, return a mock route
    return {
      id: 'mock-route',
      path: '/api/users',
      method: 'GET',
      upstream: 'user-service',
      authentication: false,
      isActive: true,
      rateLimit: config.rateLimit,
      plugins: []
    };
  }

  async authenticateRequest(req: Request): Promise<{ isValid: boolean; error?: string }> {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const result = await this.validateToken(token);
        return result;
      }
    }

    if (apiKey) {
      const result = await this.validateApiKey(apiKey);
      return result;
    }

    return { isValid: false, error: 'Authentication required' };
  }

  private async validateToken(_token: string): Promise<{ isValid: boolean; error?: string }> {
    // This would validate JWT tokens
    return { isValid: true };
  }

  private async validateApiKey(_apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    // This would validate API keys
    return { isValid: true };
  }

  private getRateLimitKey(req: Request, _route: any): string {
    // Use IP address or user ID for rate limiting
    return req.ip || 'unknown';
  }

  private async executePlugins(_req: Request, _res: Response, _route: any): Promise<{ shouldContinue: boolean }> {
    // Execute route plugins
    return { shouldContinue: true };
  }

  private async resolveUpstream(_upstream: string): Promise<string | null> {
    // This would resolve the upstream service using load balancer
    return 'http://localhost:3001';
  }

  async proxyRequest(req: Request, res: Response): Promise<void> {
    try {
      const path = req.path;
      const method = req.method;

      // Find matching route
      const route = await this.findRoute(path, method);
      
      if (!route) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }

      if (!route.isActive) {
        res.status(503).json({ error: 'Route is inactive' });
        return;
      }

      // Check authentication if required
      if (route.authentication) {
        const authResult = await this.authenticateRequest(req);
        if (!authResult.isValid) {
          res.status(401).json({ error: authResult.error });
          return;
        }
      }

      // Check rate limiting
      const rateLimitKey = this.getRateLimitKey(req, route);
      const isRateLimited = await this.rateLimiterManager.isRateLimited(
        route.id,
        rateLimitKey,
        route.rateLimit?.maxRequests,
        route.rateLimit?.windowMs
      );

      if (isRateLimited) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      // Execute plugins
      const pluginResult = await this.executePlugins(req, res, route);
      if (!pluginResult.shouldContinue) {
        return;
      }

      // Get upstream service
      const upstream = await this.resolveUpstream(route.upstream);
      if (!upstream) {
        res.status(503).json({ error: 'No healthy upstream available' });
        return;
      }

      // Proxy the request
      await this.proxyToUpstream(req, res, upstream, route);

    } catch (error) {
      logger.error('Proxy request failed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async proxyToUpstream(req: Request, res: Response, upstream: string, route: any): Promise<void> {
    const proxy = createProxyMiddleware({
      target: upstream,
      changeOrigin: true,
      pathRewrite: {
        [`^${route.path}`]: '',
      },
      onProxyReq: (proxyReq, _req, _res) => {
        // Add custom headers
        proxyReq.setHeader('X-Gateway-Route', route.id);
        proxyReq.setHeader('X-Gateway-Timestamp', Date.now().toString());
      },
      onProxyRes: (proxyRes, req, _res) => {
        // Log response
        const responseTime = Date.now() - ((req as any).startTime || Date.now());
        logger.info(`${req.method} ${req.path} -> ${proxyRes.statusCode} (${responseTime}ms)`);
      },
      onError: (err, _req, res) => {
        logger.error('Proxy error:', err);
        res.status(502).json({ error: 'Bad gateway' });
      },
    });

    proxy(req, res, () => {});
  }
}

export default new ProxyService(); 