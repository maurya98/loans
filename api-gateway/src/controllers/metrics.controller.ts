import { Router, Request, Response } from 'express';
import { MetricsService } from '../services/metrics.service';
import { MetricsDBService } from '../services/metrics-db.service';

export class MetricsController {
  private router: Router;
  private metricsService: MetricsService;
  private metricsDBService: MetricsDBService;

  constructor() {
    this.router = Router();
    this.metricsService = new MetricsService();
    this.metricsDBService = new MetricsDBService();
    this.router.get('/', this.metrics.bind(this));
    this.router.get('/json', this.metricsJson.bind(this));
    this.router.get('/db', this.getMetricsFromDB.bind(this));
    this.router.get('/db/summary', this.getMetricsSummary.bind(this));
    this.router.get('/db/stats/:metricName', this.getMetricStats.bind(this));
    this.router.get('/db/endpoints', this.getTopEndpoints.bind(this));
    this.router.get('/db/errors', this.getErrorSummary.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  private async metrics(req: Request, res: Response) {
    try {
      const acceptHeader = req.get('Accept');
      
      // Check if client prefers JSON
      if (acceptHeader && acceptHeader.includes('application/json')) {
        const metrics = await this.metricsService.getMetricsAsJson();
        res.set('Content-Type', 'application/json');
        res.json(metrics);
      } else {
        // Default to Prometheus format
        const metrics = await this.metricsService.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to collect metrics' });
    }
  }

  private async metricsJson(req: Request, res: Response) {
    try {
      const metrics = await this.metricsService.getMetricsAsJson();
      res.set('Content-Type', 'application/json');
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to collect metrics' });
    }
  }

  private async getMetricsFromDB(req: Request, res: Response) {
    try {
      const { name, service, startTime, endTime, limit } = req.query;
      
      const metrics = await this.metricsDBService.getMetrics(
        name as string,
        service as string,
        startTime ? new Date(startTime as string) : undefined,
        endTime ? new Date(endTime as string) : undefined,
        limit ? parseInt(limit as string) : 1000
      );

      res.json({
        success: true,
        data: metrics,
        count: metrics.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch metrics from database' 
      });
    }
  }

  private async getMetricsSummary(req: Request, res: Response) {
    try {
      const { service, startTime, endTime } = req.query;
      
      const summary = await this.metricsDBService.getMetricsSummary(
        service as string,
        startTime ? new Date(startTime as string) : undefined,
        endTime ? new Date(endTime as string) : undefined
      );

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch metrics summary' 
      });
    }
  }

  private async getMetricStats(req: Request, res: Response): Promise<void> {
    try {
      const { metricName } = req.params;
      const { service, startTime, endTime } = req.query;
      console.log(">>>>>>>>>>>>>>",metricName,service,startTime,endTime);

      if (!metricName) {
        res.status(400).json({ 
          success: false, 
          error: 'Metric name is required' 
        });
        return;
      }
      
      const stats = await this.metricsDBService.getMetricStats(
        metricName,
        service as string,
        // startTime ? new Date(startTime as string) : undefined,
        // endTime ? new Date(endTime as string) : undefined
      );

      res.json({
        success: true,
        data: {
          metricName,
          stats
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch metric stats' 
      });
    }
  }

  private async getTopEndpoints(req: Request, res: Response) {
    try {
      const { service, startTime, endTime, limit } = req.query;
      
      const endpoints = await this.metricsDBService.getTopEndpoints(
        service as string,
        startTime ? new Date(startTime as string) : undefined,
        endTime ? new Date(endTime as string) : undefined,
        limit ? parseInt(limit as string) : 10
      );

      res.json({
        success: true,
        data: endpoints
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch top endpoints' 
      });
    }
  }

  private async getErrorSummary(req: Request, res: Response) {
    try {
      const { service, startTime, endTime } = req.query;
      
      const errors = await this.metricsDBService.getErrorSummary(
        service as string,
        startTime ? new Date(startTime as string) : undefined,
        endTime ? new Date(endTime as string) : undefined
      );

      res.json({
        success: true,
        data: errors
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch error summary' 
      });
    }
  }
} 