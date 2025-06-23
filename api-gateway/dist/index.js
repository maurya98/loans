"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const database_service_1 = require("./services/database.service");
const redis_service_1 = require("./services/redis.service");
const metrics_service_1 = require("./services/metrics.service");
dotenv_1.default.config();
const logger = new logger_1.Logger('Main');
const port = process.env.PORT || 3010;
const host = process.env.HOST || 'localhost';
async function bootstrap() {
    try {
        logger.info('Starting API Gateway...');
        const databaseService = new database_service_1.DatabaseService();
        const redisService = new redis_service_1.RedisService();
        const metricsService = new metrics_service_1.MetricsService();
        await databaseService.connect();
        await redisService.connect();
        await metricsService.initialize();
        const app = new app_1.App();
        const expressApp = app.getApp();
        const server = (0, http_1.createServer)(expressApp);
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || "http://localhost:3000",
                credentials: true
            },
            maxHttpBufferSize: parseInt(process.env.WS_MAX_PAYLOAD_SIZE || '1048576')
        });
        app.setupWebSocket(io);
        server.listen(port, () => {
            logger.info(`🚀 API Gateway is running on http://${host}:${port}`);
            logger.info(`📊 Metrics available on http://${host}:${port}/metrics`);
            logger.info(`📚 API Documentation available on http://${host}:${port}/api-docs`);
            logger.info(`🔍 Health check available on http://${host}:${port}/health`);
        });
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down gracefully...');
            server.close(async () => {
                await databaseService.disconnect();
                await redisService.disconnect();
                await metricsService.shutdown();
                logger.info('API Gateway shutdown complete');
                process.exit(0);
            });
        });
        process.on('SIGINT', async () => {
            logger.info('SIGINT received, shutting down gracefully...');
            server.close(async () => {
                await databaseService.disconnect();
                await redisService.disconnect();
                await metricsService.shutdown();
                logger.info('API Gateway shutdown complete');
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger.error('Failed to start API Gateway:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=index.js.map