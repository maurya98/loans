import { Repository } from 'typeorm';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';
import { APIRoute } from '../models/api-route.entity';

export class RouteService {
  private repository!: Repository<APIRoute>;
  private logger: Logger;
  private databaseService: DatabaseService;

  constructor() {
    this.logger = new Logger('RouteService');
    this.databaseService = new DatabaseService();
  }

  private async getRepository(): Promise<Repository<APIRoute>> {
    if (!this.repository) {
      const dataSource = this.databaseService.getDataSource();
      this.repository = dataSource.getRepository(APIRoute);
    }
    return this.repository;
  }

  public async getAllRoutes(): Promise<APIRoute[]> {
    try {
      const repo = await this.getRepository();
      return await repo.find({
        where: { isActive: true },
        order: { priority: 'DESC', createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error fetching all routes:', error);
      return [];
    }
  }

  public async createRoute(routeData: Omit<APIRoute, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIRoute> {
    try {
      const repo = await this.getRepository();
      const route = repo.create({
        ...routeData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedRoute = await repo.save(route);
      this.logger.info(`Created route: ${savedRoute.path} ${savedRoute.method}`);
      return savedRoute;
    } catch (error) {
      this.logger.error('Error creating route:', error);
      throw new Error('Failed to create route');
    }
  }

  public async getRouteById(id: string): Promise<APIRoute | undefined> {
    try {
      const repo = await this.getRepository();
      const route = await repo.findOne({ where: { id } });
      return route || undefined;
    } catch (error) {
      this.logger.error(`Error fetching route by id ${id}:`, error);
      return undefined;
    }
  }

  public async updateRoute(id: string, update: Partial<APIRoute>): Promise<APIRoute | undefined> {
    try {
      const repo = await this.getRepository();
      const route = await repo.findOne({ where: { id } });
      
      if (!route) {
        return undefined;
      }

      Object.assign(route, { ...update, updatedAt: new Date() });
      const updatedRoute = await repo.save(route);
      
      this.logger.info(`Updated route: ${updatedRoute.path} ${updatedRoute.method}`);
      return updatedRoute;
    } catch (error) {
      this.logger.error(`Error updating route ${id}:`, error);
      throw new Error('Failed to update route');
    }
  }

  public async deleteRoute(id: string): Promise<boolean> {
    try {
      const repo = await this.getRepository();
      const route = await repo.findOne({ where: { id } });
      
      if (!route) {
        return false;
      }

      await repo.remove(route);
      this.logger.info(`Deleted route: ${route.path} ${route.method}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting route ${id}:`, error);
      return false;
    }
  }

  public async findRoute(path: string, method: string): Promise<APIRoute | undefined> {
    try {
      const repo = await this.getRepository();
      const route = await repo.findOne({ 
        where: { path, method: method.toUpperCase(), isActive: true }
      });
      return route || undefined;
    } catch (error) {
      this.logger.error(`Error finding route ${method} ${path}:`, error);
      return undefined;
    }
  }

  public async findRoutesByBackend(backend: string): Promise<APIRoute[]> {
    try {
      const repo = await this.getRepository();
      return await repo.find({ 
        where: { backend, isActive: true },
        order: { priority: 'DESC', path: 'ASC' }
      });
    } catch (error) {
      this.logger.error(`Error finding routes for backend ${backend}:`, error);
      return [];
    }
  }

  public async findRoutesByPathPattern(pattern: string): Promise<APIRoute[]> {
    try {
      const repo = await this.getRepository();
      return await repo
        .createQueryBuilder('route')
        .where('route.path LIKE :pattern', { pattern: `%${pattern}%` })
        .andWhere('route.isActive = :isActive', { isActive: true })
        .orderBy('route.priority', 'DESC')
        .addOrderBy('route.path', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error finding routes by pattern ${pattern}:`, error);
      return [];
    }
  }

  public async getRouteStats(): Promise<{ total: number; byMethod: Record<string, number>; byBackend: Record<string, number> }> {
    try {
      const routes = await this.getAllRoutes();
      const byMethod: Record<string, number> = {};
      const byBackend: Record<string, number> = {};

      routes.forEach(route => {
        byMethod[route.method] = (byMethod[route.method] || 0) + 1;
        byBackend[route.backend] = (byBackend[route.backend] || 0) + 1;
      });

      return {
        total: routes.length,
        byMethod,
        byBackend
      };
    } catch (error) {
      this.logger.error('Error getting route stats:', error);
      return { total: 0, byMethod: {}, byBackend: {} };
    }
  }
} 