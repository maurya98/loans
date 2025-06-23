"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("./utils/logger");
const error_handler_1 = require("./middleware/error-handler");
const request_logger_1 = require("./middleware/request-logger");
const authentication_1 = require("./middleware/authentication");
const rate_limit_1 = require("./middleware/rate-limit");
const caching_1 = require("./middleware/caching");
const validation_1 = require("./middleware/validation");
const metrics_1 = require("./middleware/metrics");
const circuit_breaker_1 = require("./middleware/circuit-breaker");
const cors_1 = require("./middleware/cors");
const ssl_termination_1 = require("./middleware/ssl-termination");
const request_transformation_1 = require("./middleware/request-transformation");
const response_transformation_1 = require("./middleware/response-transformation");
const health_controller_1 = require("./controllers/health.controller");
const metrics_controller_1 = require("./controllers/metrics.controller");
const auth_controller_1 = require("./controllers/auth.controller");
const route_controller_1 = require("./controllers/route.controller");
const websocket_controller_1 = require("./controllers/websocket.controller");
const documentation_controller_1 = require("./controllers/documentation.controller");
const route_service_1 = require("./services/route.service");
const authentication_service_1 = require("./services/authentication.service");
const cache_service_1 = require("./services/cache.service");
const load_balancer_service_1 = require("./services/load-balancer.service");
const plugin_service_1 = require("./services/plugin.service");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.logger = new logger_1.Logger('App');
        this.routeService = new route_service_1.RouteService();
        this.authenticationService = new authentication_service_1.AuthenticationService();
        this.cacheService = new cache_service_1.CacheService();
        this.loadBalancerService = new load_balancer_service_1.LoadBalancerService();
        this.pluginService = new plugin_service_1.PluginService();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        this.logger.info('Initializing middleware...');
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use(cors_1.CORSHandler.handle());
        if (process.env.SSL_ENABLED === 'true') {
            this.app.use(ssl_termination_1.SSLTermination.handle());
        }
        this.app.use(body_parser_1.default.json({ limit: '10mb' }));
        this.app.use(body_parser_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use((0, morgan_1.default)('combined'));
        this.app.use(request_logger_1.RequestLogger.log);
        this.app.use(rate_limit_1.RateLimitMiddleware.createLimiter());
        this.app.use((0, express_slow_down_1.default)({
            windowMs: 15 * 60 * 1000,
            delayAfter: 100,
            delayMs: 500
        }));
        this.app.use(metrics_1.MetricsMiddleware.collect());
        this.app.use(circuit_breaker_1.CircuitBreakerMiddleware.handle());
        this.app.use(request_transformation_1.RequestTransformation.transform());
        this.app.use(response_transformation_1.ResponseTransformation.transform());
        this.app.use(caching_1.CachingMiddleware.handle());
        this.app.use(validation_1.ValidationMiddleware.validate(joi_1.default.object().unknown(true)));
        this.app.use(authentication_1.AuthenticationMiddleware.authenticate());
        this.app.use(this.pluginService.loadPlugins());
    }
    initializeRoutes() {
        this.logger.info('Initializing routes...');
        const healthController = new health_controller_1.HealthController();
        this.app.use('/health', healthController.getRouter());
        const metricsController = new metrics_controller_1.MetricsController();
        this.app.use('/metrics', metricsController.getRouter());
        const authController = new auth_controller_1.AuthController();
        this.app.use('/auth', authController.getRouter());
        const documentationController = new documentation_controller_1.DocumentationController();
        this.app.use('/api-docs', documentationController.getRouter());
        const routeController = new route_controller_1.RouteController(this.routeService);
        this.app.use('/api/routes', routeController.getRouter());
        this.app.use('/api/*', async (req, res, next) => {
            try {
                const route = await this.routeService.findRoute(req.path, req.method);
                if (!route) {
                    res.status(404).json({ error: 'Route not found' });
                    return;
                }
                if (route.authentication) {
                    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'];
                    const authResult = await this.authenticationService.validateToken(token);
                    if (!authResult.valid) {
                        res.status(401).json({ error: 'Unauthorized' });
                        return;
                    }
                }
                if (route.rateLimit) {
                    const rateLimitResult = await rate_limit_1.RateLimitMiddleware.checkLimit(req.ip || req.connection.remoteAddress || '', route.rateLimit);
                    if (!rateLimitResult.allowed) {
                        res.status(429).json({ error: 'Rate limit exceeded' });
                        return;
                    }
                }
                const target = await this.loadBalancerService.getTarget(route.backend);
                const proxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
                    target: target.url,
                    changeOrigin: true,
                    pathRewrite: route.pathRewrite || {},
                    onProxyReq: (proxyReq, req, res) => {
                        if (route.headers) {
                            Object.entries(route.headers).forEach(([key, value]) => {
                                proxyReq.setHeader(key, String(value));
                            });
                        }
                    },
                    onProxyRes: (proxyRes, req, res) => {
                        if (route.cache && proxyRes.statusCode === 200) {
                            this.cacheService.set(req.originalUrl, 'cached_response', route.cache.ttl);
                        }
                    },
                    onError: (err, req, res) => {
                        this.logger.error('Proxy error:', err);
                        res.status(502).json({ error: 'Bad Gateway' });
                    }
                });
                proxy(req, res, next);
                return;
            }
            catch (error) {
                this.logger.error('Route handling error:', error);
                next(error);
            }
        });
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Not Found' });
        });
    }
    initializeErrorHandling() {
        this.app.use(error_handler_1.ErrorHandler.handle());
    }
    setupWebSocket(io) {
        this.logger.info('Setting up WebSocket handlers...');
        const webSocketController = new websocket_controller_1.WebSocketController(io, this.routeService);
        webSocketController.initialize();
    }
    getApp() {
        return this.app;
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map