# Configuration Server

A scalable, professional Node.js configuration server with REST API, JWT authentication, and real-time updates via WebSocket.

## Project Structure

```
src/
├── api/
│   ├── controllers/      # Express controllers (request handlers)
│   ├── middleware/       # Authentication, validation, etc.
│   ├── routes/           # API route definitions
│   └── validators/       # Joi validation schemas
├── core/
│   ├── domain/           # Domain models and interfaces
│   ├── repositories/     # Repository interfaces
│   └── services/         # Business logic services
├── infrastructure/
│   └── database/         # Sequelize models and config
├── shared/
│   ├── config/           # App-wide config (e.g., Swagger)
│   ├── constants/        # Shared constants
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Utility functions
└── index.ts              # App entry point
```

## Features
- Clean architecture (separation of concerns)
- TypeScript for type safety
- JWT authentication & role-based access
- Input validation with Joi
- Sequelize ORM (PostgreSQL)
- Swagger API documentation
- WebSocket for real-time updates

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=config_server
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=*
   NODE_ENV=development
   ```

3. **Run the server**
   ```bash
   npm run dev
   ```

4. **API Documentation**
   Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Scripts
- `npm run dev` — Start in development mode (with nodemon)
- `npm start` — Start in production mode

## License
MIT

## Features

- 🔐 Secure storage of sensitive configurations
- 🔄 Real-time configuration updates via WebSocket
- 🔑 JWT-based authentication
- 👥 Role-based access control
- 📝 Version control for configurations
- 🔒 Encryption for sensitive values
- 📚 Interactive API documentation
- 🏗️ Environment-specific configurations

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd configuration-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=config_server

# Security
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-32-char-encryption-key

# CORS Configuration
CORS_ORIGIN=*
```

4. Create the PostgreSQL database:
```sql
CREATE DATABASE config_server;
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Documentation

Interactive API documentation is available at `http://localhost:3000/api-docs` when the server is running.

## API Endpoints

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Configuration Management

#### Create Configuration
```http
POST /api/configurations
Content-Type: application/json
Authorization: Bearer <token>

{
  "applicationName": "user-service",
  "environment": "development",
  "configKey": "database",
  "configValue": {
    "host": "localhost",
    "port": 5432,
    "database": "users"
  },
  "isEncrypted": false
}
```

#### Get All Configurations
```http
GET /api/configurations/{applicationName}/{environment}
Authorization: Bearer <token>
```

#### Get Specific Configuration
```http
GET /api/configurations/{applicationName}/{environment}/{configKey}
Authorization: Bearer <token>
```

#### Update Configuration
```http
PUT /api/configurations/{applicationName}/{environment}/{configKey}
Content-Type: application/json
Authorization: Bearer <token>

{
  "configValue": {
    "host": "new-host",
    "port": 5432,
    "database": "users"
  }
}
```

#### Delete Configuration
```http
DELETE /api/configurations/{applicationName}/{environment}/{configKey}
Authorization: Bearer <token>
```

## WebSocket Integration

### Subscribe to Configuration Updates

```javascript
const socket = io('http://localhost:3000');

// Subscribe to updates for a specific application and environment
socket.emit('subscribe', {
  applicationName: 'user-service',
  environment: 'development'
});

// Listen for configuration updates
socket.on('config-update', (data) => {
  console.log('Configuration updated:', data);
});
```

## Security Features

### Authentication
- JWT-based authentication
- Token expiration
- Secure token storage

### Authorization
- Role-based access control
- Admin-only operations for sensitive actions
- Environment-specific access control

### Data Protection
- Encryption for sensitive values
- Secure storage in PostgreSQL
- Environment variable protection

## Database Schema

### Configurations Table
```sql
CREATE TABLE configurations (
  id SERIAL PRIMARY KEY,
  applicationName VARCHAR(255) NOT NULL,
  environment VARCHAR(255) NOT NULL,
  configKey VARCHAR(255) NOT NULL,
  configValue JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  isActive BOOLEAN NOT NULL DEFAULT true,
  isEncrypted BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(applicationName, environment, configKey, version)
);
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Development

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm test`: Run tests
- `npm run lint`: Run linter
- `npm run lint:fix`: Fix linting issues

### Project Structure

```
src/
├── config/         # Configuration files
├── controller/     # Request handlers
├── database/       # Database models and config
├── middleware/     # Custom middleware
├── routes/         # API routes
├── service/        # Business logic
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@example.com or create an issue in the repository. 