import APIGateway from './app';
import logger from './utils/logger';
import config from './config';

async function startServer() {
  try {
    const gateway = new APIGateway();
    
    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      await gateway.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Start the gateway
    await gateway.start();
    
    logger.info(`API Gateway is running on port ${config.server.port}`);
    logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
    logger.info(`Node version: ${process.version}`);
    
  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 