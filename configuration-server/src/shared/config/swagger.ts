export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Configuration Server API',
    version: '1.0.0',
    description: 'API documentation for the Configuration Server with authentication and role-based access control',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
          },
          username: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          role: {
            type: 'string',
            enum: ['admin', 'application', 'user'],
          },
          isActive: {
            type: 'boolean',
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
          },
          password: {
            type: 'string',
            format: 'password',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            format: 'password',
          },
          role: {
            type: 'string',
            enum: ['admin', 'application', 'user'],
            default: 'user',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request body or user already exists',
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login and get JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
        },
      },
    },
    '/api/configurations': {
      post: {
        tags: ['Configurations'],
        summary: 'Create a new configuration',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['applicationName', 'environment', 'configKey', 'configValue'],
                properties: {
                  applicationName: {
                    type: 'string',
                  },
                  environment: {
                    type: 'string',
                  },
                  configKey: {
                    type: 'string',
                  },
                  configValue: {
                    type: 'object',
                  },
                  isEncrypted: {
                    type: 'boolean',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Configuration created successfully',
          },
          '400': {
            description: 'Invalid request body',
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Requires admin role',
          },
        },
      },
    },
    '/api/configurations/{applicationName}/{environment}': {
      get: {
        tags: ['Configurations'],
        summary: 'Get all configurations for an application and environment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'applicationName',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'environment',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of configurations',
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Insufficient permissions',
          },
        },
      },
    },
    '/api/configurations/{applicationName}/{environment}/{configKey}': {
      get: {
        tags: ['Configurations'],
        summary: 'Get a specific configuration',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'applicationName',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'environment',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'configKey',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Configuration details',
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Insufficient permissions',
          },
          '404': {
            description: 'Configuration not found',
          },
        },
      },
      put: {
        tags: ['Configurations'],
        summary: 'Update a configuration',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'applicationName',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'environment',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'configKey',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['configValue'],
                properties: {
                  configValue: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Configuration updated successfully',
          },
          '400': {
            description: 'Invalid request body',
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Requires admin role',
          },
          '404': {
            description: 'Configuration not found',
          },
        },
      },
      delete: {
        tags: ['Configurations'],
        summary: 'Delete a configuration',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'applicationName',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'environment',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'configKey',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '204': {
            description: 'Configuration deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Requires admin role',
          },
          '404': {
            description: 'Configuration not found',
          },
        },
      },
    },
  },
}; 