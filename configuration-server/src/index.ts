import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { sequelize } from './infrastructure/database/config';
import { ConfigurationRepository } from './infrastructure/database/ConfigurationRepository';
import { ConfigurationService } from './core/services/ConfigurationService';
import { ConfigurationController } from './api/controllers/ConfigurationController';
import { configureRoutes } from './api/routes/configurationRoutes';
import { swaggerSpec } from './shared/config/swagger';
import { initializeDatabase } from './infrastructure/database/init';
import { AuthService } from './core/services/AuthService';
import { AuthController } from './api/controllers/AuthController';
import { configureAuthRoutes } from './api/routes/authRoutes';
import { authMiddleware } from './api/middleware/authMiddleware';

const app = express();
const httpServer = createServer(app);

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Enhanced Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" as const },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" as const },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" as const },
  xssFilter: true
};

const io = new Server(httpServer, {
  cors: corsOptions,
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Add raw WebSocket handling
io.engine.on('connection_error', (err) => {
  console.log('Connection error:', err);
});

io.engine.on('upgrade', (transport) => {
  console.log('Transport upgraded:', transport);
});

io.engine.on('headers', (headers, req) => {
  console.log('Headers:', headers);
});

const port = process.env.PORT ?? 3000;

// Security Middleware
app.use(cors(corsOptions));
app.use(helmet(helmetConfig));
app.use(limiter);
app.use(express.json({ limit: '10kb' })); // Limit payload size

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Setup dependencies
    const repository = new ConfigurationRepository();
    const service = new ConfigurationService(repository);
    const controller = new ConfigurationController(service);

    // Setup authentication
    const authService = new AuthService();
    const authController = new AuthController(authService);

    // Configure routes
    app.use('/api/configurations', authMiddleware(authService), configureRoutes(controller));
    app.use('/api/auth', configureAuthRoutes(authController, authService));

    // WebSocket connection handling
    io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('message', (message: object) => {
        console.log('Received message:', message);
        try {
          const { type, data } = message as { type: string; data: any };
          console.log('Parsed message:', { type, data });
          
          switch (type) {
            case 'subscribe':
              console.log('Handling subscribe request');
              socket.join(`${data.applicationName}-${data.environment}`);
              socket.emit('subscribed', { message: 'Successfully subscribed' });
              break;
              
            case 'get-config':
              console.log('Handling get-config request');
              service.getConfiguration(data.applicationName, data.environment, data.configKey)
                .then(config => {
                  console.log('Found config:', config);
                  socket.emit('config-data', config);
                })
                .catch(error => {
                  console.error('Error getting config:', error);
                  socket.emit('error', { message: 'Failed to get configuration' });
                });
              break;
              
            case 'get-all-configs':
              console.log('Handling get-all-configs request');
              service.getAllConfigurations(data.applicationName, data.environment)
                .then(configs => {
                  console.log('Found configs:', configs);
                  socket.emit('configs-data', configs);
                })
                .catch(error => {
                  console.error('Error getting configs:', error);
                  socket.emit('error', { message: 'Failed to get configurations' });
                });
              break;

            default:
              console.log('Unknown message type:', type);
              socket.emit('error', { message: 'Unknown message type' });
          }
        } catch (error) {
          console.error('Error processing message:', error);
          socket.emit('error', { message: 'Invalid message format' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    // Make io accessible to our routes
    app.set('io', io);

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models
    process.env.NODE_ENV === 'development' ? await sequelize.sync() : "";
    console.log('Database models synchronized.');

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();