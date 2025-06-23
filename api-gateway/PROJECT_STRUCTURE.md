# API Gateway Project Structure

This document outlines the organized and scalable folder structure of the API Gateway project.

## 📁 Root Directory

```
api-gateway/
├── src/                    # Source code
├── dist/                   # Compiled JavaScript (generated)
├── examples/               # Usage examples
├── load-tests/             # Load testing configurations
├── docs/                   # Documentation
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── .eslintrc.js           # ESLint configuration
├── jest.config.js         # Jest testing configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Node.js dependencies and scripts
├── docker-compose.yml     # Docker services configuration
├── Dockerfile             # Docker image definition
├── README.md              # Project documentation
├── LICENSE                # MIT License
└── PROJECT_STRUCTURE.md   # This file
```

## 📁 Source Code Structure (`src/`)

### Core Application Files
```
src/
├── app.ts                 # Main application class (APIGateway)
├── index.ts              # Application entry point
└── server.ts             # Server startup logic (optional)
```

### Configuration (`config/`)
```
src/config/
├── index.ts              # Main configuration export
├── database.ts           # Database configuration
├── redis.ts              # Redis configuration
├── jwt.ts                # JWT configuration
├── rateLimit.ts          # Rate limiting configuration
└── swagger.ts            # Swagger documentation configuration
```

### Controllers (`controllers/`)
```
src/controllers/
├── authController.ts     # Authentication endpoints
├── analyticsController.ts # Analytics endpoints
├── adminController.ts    # Admin management endpoints
├── healthController.ts   # Health check endpoints
└── baseController.ts     # Base controller class
```

### Database (`database/`)
```
src/database/
├── connection.ts         # PostgreSQL connection pool
├── redis.ts              # Redis connection
├── migrate.ts            # Database migrations
├── seed.ts               # Database seeding
└── models/               # Database models (if using ORM)
    ├── User.ts
    ├── Route.ts
    ├── Service.ts
    └── RequestLog.ts
```

### Middleware (`middleware/`)
```
src/middleware/
├── authentication.ts     # JWT and API key authentication
├── rateLimiter.ts        # Rate limiting middleware
├── validation.ts         # Request validation
├── errorHandler.ts       # Global error handling
├── cors.ts               # CORS configuration
├── logging.ts            # Request logging
└── security.ts           # Security headers
```

### Models (`models/`)
```
src/models/
├── User.ts               # User data model
├── Route.ts              # Route configuration model
├── Service.ts            # Service definition model
├── Analytics.ts          # Analytics data models
├── Plugin.ts             # Plugin model
└── index.ts              # Model exports
```

### Plugins (`plugins/`)
```
src/plugins/
├── index.ts              # Plugin manager
├── basePlugin.ts         # Base plugin class
├── rateLimiterPlugin.ts  # Rate limiting plugin
├── authPlugin.ts         # Authentication plugin
├── loggingPlugin.ts      # Logging plugin
└── customPlugins/        # Custom plugin implementations
    ├── corsPlugin.ts
    ├── cachePlugin.ts
    └── transformPlugin.ts
```

### Routes (`routes/`)
```
src/routes/
├── auth.ts               # Authentication routes
├── admin.ts              # Admin management routes
├── analytics.ts          # Analytics routes
├── health.ts             # Health check routes
├── api.ts                # API proxy routes
└── index.ts              # Route aggregator
```

### Services (`services/`)
```
src/services/
├── loadBalancer.ts       # Load balancing logic
├── circuitBreaker.ts     # Circuit breaker implementation
├── rateLimiter.ts        # Rate limiting service
├── analytics.ts          # Analytics service
├── auth.ts               # Authentication service
├── cache.ts              # Caching service
└── monitoring.ts         # Monitoring service
```

### Types (`types/`)
```
src/types/
├── index.ts              # Type definitions export
├── api.ts                # API-related types
├── database.ts           # Database types
├── middleware.ts         # Middleware types
├── plugin.ts             # Plugin types
└── config.ts             # Configuration types
```

### Utils (`utils/`)
```
src/utils/
├── logger.ts             # Winston logger configuration
├── crypto.ts             # Cryptographic utilities
├── validation.ts         # Validation utilities
├── date.ts               # Date/time utilities
├── string.ts             # String manipulation utilities
└── helpers.ts            # General helper functions
```

## 📁 Supporting Directories

### Examples (`examples/`)
```
examples/
├── basic-usage.js        # Basic API Gateway usage
├── load-balancing.js     # Load balancing examples
├── rate-limiting.js      # Rate limiting examples
├── authentication.js     # Authentication examples
├── analytics.js          # Analytics examples
└── plugins.js            # Plugin development examples
```

### Load Tests (`load-tests/`)
```
load-tests/
├── artillery.yml         # Artillery load test configuration
├── scenarios/            # Test scenarios
│   ├── basic.yml
│   ├── auth.yml
│   └── analytics.yml
└── results/              # Test results (generated)
```

### Documentation (`docs/`)
```
docs/
├── api.md                # API documentation
├── deployment.md         # Deployment guide
├── development.md        # Development guide
├── architecture.md       # Architecture overview
├── plugins.md            # Plugin development guide
└── troubleshooting.md    # Troubleshooting guide
```

## 🔧 Configuration Files

### Environment Variables (`.env`)
```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=api_gateway
DB_USER=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### Docker Configuration
- `Dockerfile`: Multi-stage build for production
- `docker-compose.yml`: Development environment with PostgreSQL and Redis

### Testing Configuration
- `jest.config.js`: Jest testing framework configuration
- `jest.integration.config.js`: Integration tests configuration

## 🏗️ Architecture Principles

### 1. Separation of Concerns
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define data structures
- **Middleware**: Handle cross-cutting concerns
- **Routes**: Define API endpoints

### 2. Dependency Injection
- Services are injected into controllers
- Configuration is centralized
- Easy to test and mock dependencies

### 3. Plugin Architecture
- Extensible plugin system
- Hot-reloadable plugins
- Configuration-driven plugin management

### 4. Type Safety
- Full TypeScript coverage
- Strict type checking
- Interface-driven development

### 5. Error Handling
- Centralized error handling
- Structured error responses
- Comprehensive logging

## 🚀 Development Workflow

### 1. Adding New Features
1. Create models in `src/models/`
2. Add types in `src/types/`
3. Implement services in `src/services/`
4. Create controllers in `src/controllers/`
5. Define routes in `src/routes/`
6. Add tests in `__tests__/`

### 2. Creating Plugins
1. Extend `BasePlugin` in `src/plugins/`
2. Register plugin in `src/plugins/index.ts`
3. Add configuration in `src/config/`
4. Document usage in `docs/plugins.md`

### 3. Database Changes
1. Create migration in `src/database/migrate.ts`
2. Update models in `src/models/`
3. Update types in `src/types/`
4. Run migrations: `npm run migrate`

## 📊 Monitoring and Analytics

The project includes comprehensive monitoring:

- **Health Checks**: `/health` endpoint
- **Metrics**: `/admin/metrics` endpoint
- **Analytics**: `/admin/analytics/*` endpoints
- **Logging**: Structured logging with Winston
- **Error Tracking**: Centralized error handling

## 🔒 Security Features

- **Authentication**: JWT and API key support
- **Authorization**: Role-based access control
- **Rate Limiting**: Configurable per route/user
- **CORS**: Cross-origin resource sharing
- **Security Headers**: Helmet.js integration
- **Input Validation**: Request validation middleware

This structure provides a scalable, maintainable, and extensible foundation for the API Gateway project. 