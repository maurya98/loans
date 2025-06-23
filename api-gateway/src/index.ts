import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { App } from './app';
import { Logger } from './utils/logger';
import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { MetricsService } from './services/metrics.service';

// Load environment variables
dotenv.config();

const logger = new Logger('Main');
const port = process.env.PORT || 3010;
const host = process.env.HOST || 'localhost';

async function bootstrap() {
  try {
    logger.info('Starting API Gateway...');

    // Initialize services
    const databaseService = new DatabaseService();
    const redisService = new RedisService();
    const metricsService = new MetricsService();

    // Connect to databases
    await databaseService.connect();
    await redisService.connect();
    await metricsService.initialize();

    // Create Express app
    const app = new App();
    const expressApp = app.getApp();

    // Create HTTP server
    const server = createServer(expressApp);

    // Initialize WebSocket server
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true
      },
      maxHttpBufferSize: parseInt(process.env.WS_MAX_PAYLOAD_SIZE || '1048576')
    });

    // Setup WebSocket handlers
    app.setupWebSocket(io);

    // Start server
    server.listen(port, () => {
      logger.info(`🚀 API Gateway is running on http://${host}:${port}`);
      logger.info(`📊 Metrics available on http://${host}:${port}/metrics`);
      logger.info(`📚 API Documentation available on http://${host}:${port}/api-docs`);
      logger.info(`🔍 Health check available on http://${host}:${port}/health`);
    });

    // Graceful shutdown
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

  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
}

bootstrap(); 