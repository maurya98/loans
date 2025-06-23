import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import config from './config';
import logger from './utils/logger';
import { initializeDatabase, closeDatabase } from './database/typeorm.config';

// Import services
// import LoadBalancer from './services/loadBalancer';
// import CircuitBreakerManager from './services/circuitBreaker';
// import RateLimiterManager from './services/rateLimiter';
import proxyService from './services/proxyService';

// Import middleware
import { authenticateToken } from './middleware/authentication';
import { requestTimingMiddleware } from './middleware/requestTiming';
import { requestLoggingMiddleware } from './middleware/requestLogging';

// Import routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';

// Import controllers
import { healthController } from './controllers/healthController';

export class APIGateway {
  public app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSwagger();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors(config.cors));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request timing
    this.app.use(requestTimingMiddleware);

    // Request logging and analytics middleware
    this.app.use(requestLoggingMiddleware);
  }

  private setupSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: config.swagger.title,
          description: config.swagger.description,
          version: config.swagger.version,
        },
        servers: [
          {
            url: `http://${config.server.host}:${config.server.port}`,
            description: 'API Gateway Server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            apiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'x-api-key',
            },
          },
        },
      },
      apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
    };

    const specs = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', healthController.getHealth);

    // API Routes
    this.app.use('/auth', authRoutes);
    this.app.use('/admin', authenticateToken, adminRoutes);
    this.app.use('/admin/analytics', authenticateToken, analyticsRoutes);

    // Dynamic proxy routing
    this.app.use('*', proxyService.proxyRequest.bind(proxyService));

    // 404 handler
    this.app.use('*', (_req: any, res: any) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handler
    this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize TypeORM
      await initializeDatabase();
      
      // Start server
      this.server = this.app.listen(config.server.port, config.server.host, () => {
        logger.info(`API Gateway started on http://${config.server.host}:${config.server.port}`);
        logger.info(`Swagger documentation available at http://${config.server.host}:${config.server.port}/api-docs`);
      });

    } catch (error) {
      logger.error('Failed to start API Gateway:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      logger.info('API Gateway stopped');
    }

    // Close TypeORM connection
    await closeDatabase();
  }
}

export default APIGateway; 