# API Gateway Integration

This admin interface has been fully integrated with the actual API Gateway from the `../api-gateway` folder.

## Integrated Endpoints

### Health Check
- **Endpoint**: `GET /health`
- **Component**: `Health.tsx`
- **Features**: Real-time health status, uptime monitoring, connection status

### Metrics
- **Endpoint**: `GET /metrics`
- **Component**: `Metrics.tsx`
- **Features**: Real-time metrics, request statistics, response times, error rates

### Authentication
- **Endpoints**: 
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `GET /auth/me`
- **Component**: `Authentication.tsx`
- **Features**: Login/logout, JWT token management, user session

### Route Management
- **Endpoints**:
  - `GET /api/routes`
  - `POST /api/routes`
  - `PUT /api/routes/:id`
  - `DELETE /api/routes/:id`
- **Component**: `Routes.tsx`
- **Features**: CRUD operations for API routes, route configuration

## Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

### API Gateway Setup
1. Navigate to the API Gateway directory: `cd ../api-gateway`
2. Install dependencies: `npm install`
3. Start the API Gateway: `npm run dev`

## Features

### Real-time Monitoring
- Health status with automatic refresh
- Live metrics with configurable refresh intervals
- Connection status monitoring

### Route Management
- Create, read, update, delete API routes
- Configure authentication, rate limiting, caching
- Route priority and status management

### Authentication
- Secure login with JWT tokens
- Token refresh handling
- Session management

### Error Handling
- Comprehensive error handling for all API calls
- User-friendly error messages
- Automatic retry mechanisms

## API Structure

The integration uses a centralized API utility (`src/utils/api.ts`) that provides:

- **Typed interfaces** for all API responses
- **Centralized configuration** for API Gateway URL
- **Request/response interceptors** for authentication and error handling
- **Helper functions** for common operations

## Usage

1. Start the API Gateway server
2. Configure the environment variables
3. Start the admin interface: `npm run dev`
4. Navigate to the admin panel
5. Use the demo credentials to log in:
   - Username: `admin`
   - Password: `password`

## Architecture

The integration follows a clean architecture pattern:

```
src/
├── utils/
│   └── api.ts              # API client and types
├── components/
│   ├── Health.tsx          # Health monitoring
│   ├── Metrics.tsx         # Metrics dashboard
│   ├── Routes.tsx          # Route management
│   └── Authentication.tsx  # Auth management
└── app/
    └── layout.tsx          # Main layout
```

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Secure token storage in localStorage
- CORS handling
- Rate limiting support
- Input validation

## Monitoring Features

- Real-time health checks
- Performance metrics
- Error tracking
- Response time monitoring
- Request/response statistics

## Future Enhancements

- User management endpoints
- API key management
- Advanced analytics
- WebSocket integration for real-time updates
- Plugin system integration 