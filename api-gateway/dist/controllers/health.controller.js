"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const express_1 = require("express");
class HealthController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.get('/', this.healthCheck);
    }
    getRouter() {
        return this.router;
    }
    healthCheck(req, res) {
        res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: Date.now(),
            message: 'API Gateway is healthy'
        });
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map