import { Router, Request, Response } from 'express';
import { RouteService } from '../services/route.service';
import { Logger } from '../utils/logger';

export class RouteController {
  private router: Router;
  private routeService: RouteService;
  private logger: Logger;

  constructor(routeService: RouteService) {
    this.router = Router();
    this.routeService = routeService;
    this.logger = new Logger('RouteController');
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getRoutes.bind(this));
    this.router.post('/', this.createRoute.bind(this));
    this.router.put('/:id', this.updateRoute.bind(this));
    this.router.delete('/:id', this.deleteRoute.bind(this));
  }

  private async getRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.routeService.getAllRoutes();
      res.json(routes);
    } catch (error) {
      this.logger.error('Error getting routes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async createRoute(req: Request, res: Response): Promise<void> {
    try {
      const route = await this.routeService.createRoute(req.body);
      res.status(201).json(route);
    } catch (error) {
      this.logger.error('Error creating route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async updateRoute(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: 'Route ID is required' });
        return;
      }
      const route = await this.routeService.updateRoute(id, req.body);
      res.json(route);
    } catch (error) {
      this.logger.error('Error updating route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async deleteRoute(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: 'Route ID is required' });
        return;
      }
      await this.routeService.deleteRoute(id);
      res.status(204).send();
    } catch (error) {
      this.logger.error('Error deleting route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
} 