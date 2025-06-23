import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: process.env.SWAGGER_TITLE || 'API Gateway',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    description: process.env.SWAGGER_DESCRIPTION || 'Comprehensive API Gateway with full functionality',
  },
  servers: [
    {
      url: process.env.SWAGGER_BASE_PATH || '/api',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export class DocumentationController {
  private router: Router;

  constructor() {
    this.router = Router();
    this.router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  public getRouter(): Router {
    return this.router;
  }
} 