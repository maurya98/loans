import { Router, Request, Response } from 'express';

export class HealthController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.get('/', this.healthCheck);
  }

  public getRouter(): Router {
    return this.router;
  }

  private healthCheck(req: Request, res: Response) {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      message: 'API Gateway is healthy'
    });
  }
} 