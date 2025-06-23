import { Request, Response } from 'express';
import analyticsService from '../services/analytics';

class AnalyticsController {
  async requestsOverTime(req: Request, res: Response) {
    const { interval = 'hour', limit = 24 } = req.query;
    const data = await analyticsService.getRequestsOverTime(interval as any, Number(limit));
    res.json({ data });
  }

  async topRoutes(req: Request, res: Response) {
    const { limit = 10 } = req.query;
    const data = await analyticsService.getTopRoutes(Number(limit));
    res.json({ data });
  }

  async topUsers(req: Request, res: Response) {
    const { limit = 10 } = req.query;
    const data = await analyticsService.getTopUsers(Number(limit));
    res.json({ data });
  }

  async errorRates(req: Request, res: Response) {
    const { interval = 'hour', limit = 24 } = req.query;
    const data = await analyticsService.getErrorRates(interval as any, Number(limit));
    res.json({ data });
  }

  async latencyStats(req: Request, res: Response) {
    const { interval = 'hour', limit = 24 } = req.query;
    const data = await analyticsService.getLatencyStats(interval as any, Number(limit));
    res.json({ data });
  }

  async realtime(req: Request, res: Response) {
    const { window = 60 } = req.query;
    const data = await analyticsService.getRealtimeStats(Number(window));
    res.json({ data });
  }

  // Historical analytics
  async getHistoricalAnalytics(req: Request, res: Response) {
    const { interval = 'hour', limit = 24 } = req.query;
    const data = await analyticsService.getRequestsOverTime(interval as any, Number(limit));
    res.json({ data });
  }

  async getHistoricalSummary(_req: Request, res: Response) {
    const data = await analyticsService.getHistoricalSummary();
    res.json({ data });
  }

  async getHistoricalTrends(req: Request, res: Response) {
    const { interval = 'day', limit = 30 } = req.query;
    const data = await analyticsService.getHistoricalTrends(interval as any, Number(limit));
    res.json({ data });
  }

  // Real-time analytics
  async getRealtimeAnalytics(req: Request, res: Response) {
    const { window = 60 } = req.query;
    const data = await analyticsService.getRealtimeStats(Number(window));
    res.json({ data });
  }

  async getRealtimeOverview(_req: Request, res: Response) {
    const data = await analyticsService.getRealtimeOverview();
    res.json({ data });
  }

  async getRealtimeStream(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendData = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Set up real-time data streaming
    const interval = setInterval(() => {
      analyticsService.getRealtimeStats(60).then(data => {
        sendData(data);
      });
    }, 1000);

    req.on('close', () => {
      clearInterval(interval);
    });
  }

  // Route-specific analytics
  async getRouteAnalytics(req: Request, res: Response) {
    const { routeId } = req.params;
    if (!routeId) {
      res.status(400).json({ error: 'Route ID is required' });
      return;
    }
    const data = await analyticsService.getRouteAnalytics(routeId);
    res.json({ data });
  }

  async getRoutePerformance(req: Request, res: Response) {
    const { routeId } = req.params;
    if (!routeId) {
      res.status(400).json({ error: 'Route ID is required' });
      return;
    }
    const data = await analyticsService.getRoutePerformance(routeId);
    res.json({ data });
  }

  // User analytics
  async getUserAnalytics(req: Request, res: Response) {
    const { limit = 10 } = req.query;
    const data = await analyticsService.getTopUsers(Number(limit));
    res.json({ data });
  }

  async getUserDetails(req: Request, res: Response) {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    const data = await analyticsService.getUserDetails(userId);
    res.json({ data });
  }

  // Error analytics
  async getErrorAnalytics(req: Request, res: Response) {
    const { interval = 'hour', limit = 24 } = req.query;
    const data = await analyticsService.getErrorRates(interval as any, Number(limit));
    res.json({ data });
  }

  async getErrorSummary(_req: Request, res: Response) {
    const data = await analyticsService.getErrorSummary();
    res.json({ data });
  }

  // Performance analytics
  async getPerformanceAnalytics(req: Request, res: Response) {
    const { interval = 'hour', limit = 24 } = req.query;
    const data = await analyticsService.getLatencyStats(interval as any, Number(limit));
    res.json({ data });
  }

  async getSlowestRoutes(req: Request, res: Response) {
    const { limit = 10 } = req.query;
    const data = await analyticsService.getSlowestRoutes(Number(limit));
    res.json({ data });
  }
}

export default new AnalyticsController(); 