"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsMiddleware = void 0;
const metrics_service_1 = require("../services/metrics.service");
class MetricsMiddleware {
    static collect() {
        return (req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = (Date.now() - start) / 1000;
                this.metricsService.incrementRequest(req.method, req.path, res.statusCode);
                this.metricsService.recordRequestDuration(req.method, req.path, duration);
                if (res.statusCode >= 400) {
                    this.metricsService.incrementError(res.statusCode >= 500 ? 'server_error' : 'client_error', req.path);
                }
            });
            next();
        };
    }
}
exports.MetricsMiddleware = MetricsMiddleware;
MetricsMiddleware.metricsService = new metrics_service_1.MetricsService();
//# sourceMappingURL=metrics.js.map