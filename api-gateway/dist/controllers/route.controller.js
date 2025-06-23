"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteController = void 0;
const express_1 = require("express");
const logger_1 = require("../utils/logger");
class RouteController {
    constructor(routeService) {
        this.router = (0, express_1.Router)();
        this.routeService = routeService;
        this.logger = new logger_1.Logger('RouteController');
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', this.getRoutes.bind(this));
        this.router.post('/', this.createRoute.bind(this));
        this.router.put('/:id', this.updateRoute.bind(this));
        this.router.delete('/:id', this.deleteRoute.bind(this));
    }
    async getRoutes(req, res) {
        try {
            const routes = await this.routeService.getAllRoutes();
            res.json(routes);
        }
        catch (error) {
            this.logger.error('Error getting routes:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async createRoute(req, res) {
        try {
            const route = await this.routeService.createRoute(req.body);
            res.status(201).json(route);
        }
        catch (error) {
            this.logger.error('Error creating route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async updateRoute(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ error: 'Route ID is required' });
                return;
            }
            const route = await this.routeService.updateRoute(id, req.body);
            res.json(route);
        }
        catch (error) {
            this.logger.error('Error updating route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteRoute(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ error: 'Route ID is required' });
                return;
            }
            await this.routeService.deleteRoute(id);
            res.status(204).send();
        }
        catch (error) {
            this.logger.error('Error deleting route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    getRouter() {
        return this.router;
    }
}
exports.RouteController = RouteController;
//# sourceMappingURL=route.controller.js.map