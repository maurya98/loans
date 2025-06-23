import { Request, Response } from 'express';
import db from '../database/connection';
import logger from '../utils/logger';

export const adminController = {
  // Routes management
  async getRoutes(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM routes ORDER BY created_at DESC');
      res.json({ routes: result.rows });
    } catch (error) {
      logger.error('Failed to get routes:', error);
      res.status(500).json({ error: 'Failed to get routes' });
    }
  },

  async createRoute(req: Request, res: Response): Promise<void> {
    try {
      const { name, path, method, upstream, authentication, rateLimit, plugins } = req.body;

      if (!name || !path || !method || !upstream) {
        res.status(400).json({ error: 'Name, path, method, and upstream are required' });
        return;
      }

      const result = await db.query(
        `INSERT INTO routes (name, path, method, upstream, authentication, rate_limit_config, plugins) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [name, path, method, upstream, authentication, rateLimit, plugins]
      );

      res.status(201).json({ route: result.rows[0] });
    } catch (error) {
      logger.error('Failed to create route:', error);
      res.status(500).json({ error: 'Failed to create route' });
    }
  },

  async updateRoute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Route ID is required' });
        return;
      }

      // For now, just return success - implement actual update logic later
      res.json({ message: 'Route updated successfully' });
    } catch (error) {
      logger.error('Failed to update route:', error);
      res.status(500).json({ error: 'Failed to update route' });
    }
  },

  async deleteRoute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Route ID is required' });
        return;
      }

      await db.query('DELETE FROM routes WHERE id = $1', [id]);
      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete route:', error);
      res.status(500).json({ error: 'Failed to delete route' });
    }
  },

  // Services management
  async getServices(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM services ORDER BY created_at DESC');
      res.json({ services: result.rows });
    } catch (error) {
      logger.error('Failed to get services:', error);
      res.status(500).json({ error: 'Failed to get services' });
    }
  },

  async createService(req: Request, res: Response): Promise<void> {
    try {
      const { name, hosts, healthCheck } = req.body;

      if (!name || !hosts || !Array.isArray(hosts)) {
        res.status(400).json({ error: 'Name and hosts array are required' });
        return;
      }

      const result = await db.query(
        'INSERT INTO services (name, hosts, health_check) VALUES ($1, $2, $3) RETURNING *',
        [name, hosts, healthCheck]
      );

      res.status(201).json({ service: result.rows[0] });
    } catch (error) {
      logger.error('Failed to create service:', error);
      res.status(500).json({ error: 'Failed to create service' });
    }
  },

  async updateService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Service ID is required' });
        return;
      }

      // For now, just return success - implement actual update logic later
      res.json({ message: 'Service updated successfully' });
    } catch (error) {
      logger.error('Failed to update service:', error);
      res.status(500).json({ error: 'Failed to update service' });
    }
  },

  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Service ID is required' });
        return;
      }

      await db.query('DELETE FROM services WHERE id = $1', [id]);
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete service:', error);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  },

  // Monitoring endpoints
  async getMetrics(_req: Request, res: Response): Promise<void> {
    try {
      // Get basic metrics
      const routeCount = await db.query('SELECT COUNT(*) FROM routes');
      const serviceCount = await db.query('SELECT COUNT(*) FROM services');
      const userCount = await db.query('SELECT COUNT(*) FROM users');

      res.json({
        metrics: {
          routes: parseInt(routeCount.rows[0].count),
          services: parseInt(serviceCount.rows[0].count),
          users: parseInt(userCount.rows[0].count)
        }
      });
    } catch (error) {
      logger.error('Failed to get metrics:', error);
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  },

  async getHealthChecks(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM health_checks ORDER BY created_at DESC LIMIT 100');
      res.json({ healthChecks: result.rows });
    } catch (error) {
      logger.error('Failed to get health checks:', error);
      res.status(500).json({ error: 'Failed to get health checks' });
    }
  },

  async getCircuitBreakers(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM circuit_breakers ORDER BY created_at DESC');
      res.json({ circuitBreakers: result.rows });
    } catch (error) {
      logger.error('Failed to get circuit breakers:', error);
      res.status(500).json({ error: 'Failed to get circuit breakers' });
    }
  }
}; 