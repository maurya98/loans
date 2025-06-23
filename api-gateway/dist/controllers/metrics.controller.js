"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const express_1 = require("express");
const metrics_service_1 = require("../services/metrics.service");
const metrics_db_service_1 = require("../services/metrics-db.service");
class MetricsController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.metricsService = new metrics_service_1.MetricsService();
        this.metricsDBService = new metrics_db_service_1.MetricsDBService();
        this.router.get('/', this.metrics.bind(this));
        this.router.get('/json', this.metricsJson.bind(this));
        this.router.get('/db', this.getMetricsFromDB.bind(this));
        this.router.get('/db/summary', this.getMetricsSummary.bind(this));
        this.router.get('/db/stats/:metricName', this.getMetricStats.bind(this));
        this.router.get('/db/endpoints', this.getTopEndpoints.bind(this));
        this.router.get('/db/errors', this.getErrorSummary.bind(this));
    }
    getRouter() {
        return this.router;
    }
    async metrics(req, res) {
        try {
            const acceptHeader = req.get('Accept');
            if (acceptHeader && acceptHeader.includes('application/json')) {
                const metrics = await this.metricsService.getMetricsAsJson();
                res.set('Content-Type', 'application/json');
                res.json(metrics);
            }
            else {
                const metrics = await this.metricsService.getMetrics();
                res.set('Content-Type', 'text/plain');
                res.send(metrics);
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to collect metrics' });
        }
    }
    async metricsJson(req, res) {
        try {
            const metrics = await this.metricsService.getMetricsAsJson();
            res.set('Content-Type', 'application/json');
            res.json(metrics);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to collect metrics' });
        }
    }
    async getMetricsFromDB(req, res) {
        try {
            const { name, service, startTime, endTime, limit } = req.query;
            const metrics = await this.metricsDBService.getMetrics(name, service, startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined, limit ? parseInt(limit) : 1000);
            res.json({
                success: true,
                data: metrics,
                count: metrics.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch metrics from database'
            });
        }
    }
    async getMetricsSummary(req, res) {
        try {
            const { service, startTime, endTime } = req.query;
            const summary = await this.metricsDBService.getMetricsSummary(service, startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined);
            res.json({
                success: true,
                data: summary
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch metrics summary'
            });
        }
    }
    async getMetricStats(req, res) {
        try {
            const { metricName } = req.params;
            const { service, startTime, endTime } = req.query;
            if (!metricName) {
                res.status(400).json({
                    success: false,
                    error: 'Metric name is required'
                });
                return;
            }
            const stats = await this.metricsDBService.getMetricStats(metricName, service, startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined);
            res.json({
                success: true,
                data: {
                    metricName,
                    stats
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch metric stats'
            });
        }
    }
    async getTopEndpoints(req, res) {
        try {
            const { service, startTime, endTime, limit } = req.query;
            const endpoints = await this.metricsDBService.getTopEndpoints(service, startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined, limit ? parseInt(limit) : 10);
            res.json({
                success: true,
                data: endpoints
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch top endpoints'
            });
        }
    }
    async getErrorSummary(req, res) {
        try {
            const { service, startTime, endTime } = req.query;
            const errors = await this.metricsDBService.getErrorSummary(service, startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined);
            res.json({
                success: true,
                data: errors
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch error summary'
            });
        }
    }
}
exports.MetricsController = MetricsController;
//# sourceMappingURL=metrics.controller.js.map