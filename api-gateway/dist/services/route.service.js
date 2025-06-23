"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
const database_service_1 = require("./database.service");
const logger_1 = require("../utils/logger");
const api_route_entity_1 = require("../models/api-route.entity");
class RouteService {
    constructor() {
        this.logger = new logger_1.Logger('RouteService');
        this.databaseService = new database_service_1.DatabaseService();
    }
    async getRepository() {
        if (!this.repository) {
            const dataSource = this.databaseService.getDataSource();
            this.repository = dataSource.getRepository(api_route_entity_1.APIRoute);
        }
        return this.repository;
    }
    async getAllRoutes() {
        try {
            const repo = await this.getRepository();
            return await repo.find({
                where: { isActive: true },
                order: { priority: 'DESC', createdAt: 'DESC' }
            });
        }
        catch (error) {
            this.logger.error('Error fetching all routes:', error);
            return [];
        }
    }
    async createRoute(routeData) {
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
        }
        catch (error) {
            this.logger.error('Error creating route:', error);
            throw new Error('Failed to create route');
        }
    }
    async getRouteById(id) {
        try {
            const repo = await this.getRepository();
            const route = await repo.findOne({ where: { id } });
            return route || undefined;
        }
        catch (error) {
            this.logger.error(`Error fetching route by id ${id}:`, error);
            return undefined;
        }
    }
    async updateRoute(id, update) {
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
        }
        catch (error) {
            this.logger.error(`Error updating route ${id}:`, error);
            throw new Error('Failed to update route');
        }
    }
    async deleteRoute(id) {
        try {
            const repo = await this.getRepository();
            const route = await repo.findOne({ where: { id } });
            if (!route) {
                return false;
            }
            await repo.remove(route);
            this.logger.info(`Deleted route: ${route.path} ${route.method}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting route ${id}:`, error);
            return false;
        }
    }
    async findRoute(path, method) {
        try {
            const repo = await this.getRepository();
            const route = await repo.findOne({
                where: { path, method: method.toUpperCase(), isActive: true }
            });
            return route || undefined;
        }
        catch (error) {
            this.logger.error(`Error finding route ${method} ${path}:`, error);
            return undefined;
        }
    }
    async findRoutesByBackend(backend) {
        try {
            const repo = await this.getRepository();
            return await repo.find({
                where: { backend, isActive: true },
                order: { priority: 'DESC', path: 'ASC' }
            });
        }
        catch (error) {
            this.logger.error(`Error finding routes for backend ${backend}:`, error);
            return [];
        }
    }
    async findRoutesByPathPattern(pattern) {
        try {
            const repo = await this.getRepository();
            return await repo
                .createQueryBuilder('route')
                .where('route.path LIKE :pattern', { pattern: `%${pattern}%` })
                .andWhere('route.isActive = :isActive', { isActive: true })
                .orderBy('route.priority', 'DESC')
                .addOrderBy('route.path', 'ASC')
                .getMany();
        }
        catch (error) {
            this.logger.error(`Error finding routes by pattern ${pattern}:`, error);
            return [];
        }
    }
    async getRouteStats() {
        try {
            const routes = await this.getAllRoutes();
            const byMethod = {};
            const byBackend = {};
            routes.forEach(route => {
                byMethod[route.method] = (byMethod[route.method] || 0) + 1;
                byBackend[route.backend] = (byBackend[route.backend] || 0) + 1;
            });
            return {
                total: routes.length,
                byMethod,
                byBackend
            };
        }
        catch (error) {
            this.logger.error('Error getting route stats:', error);
            return { total: 0, byMethod: {}, byBackend: {} };
        }
    }
}
exports.RouteService = RouteService;
//# sourceMappingURL=route.service.js.map