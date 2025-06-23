# Database Seeder

This directory contains the database seeder for populating the API Gateway database with dummy data for testing and development purposes.

## Files

- `dummy-data.seeder.ts` - Main seeder class that populates all database tables
- `run-seeder.ts` - Script to execute the seeder
- `README.md` - This documentation file

## Usage

### Running the Seeder

To populate the database with dummy data, run:

```bash
npm run seed
```

Or directly with ts-node:

```bash
npx ts-node src/database/seeders/run-seeder.ts
```

### What Data is Created

The seeder creates the following dummy data:

#### Users (3 records)
- **admin** - Full admin user with all permissions
- **john_doe** - Standard user with read/write permissions  
- **jane_smith** - User with moderator role

#### API Routes (4 records)
- `GET /api/v1/users` - Get all users (authenticated)
- `GET /api/v1/users/:id` - Get user by ID (authenticated)
- `POST /api/v1/auth/login` - User login (public)
- `GET /api/v1/products` - Get all products (public)

#### API Keys (3 records)
- Admin API key with full access
- User API key with standard permissions
- Read-only API key for monitoring

#### Rate Limits (2 records)
- IP-based rate limiting for user endpoints
- User-based rate limiting for order endpoints

#### Metrics (48 records)
- 24 hours of HTTP request metrics
- Request counts, response times, and error rates
- Simulated data for monitoring and analytics

#### Audit Logs (~280 records)
- 7 days of simulated API request logs
- Various HTTP methods, status codes, and response times
- Realistic user agents and IP addresses

#### Cache Entries (3 records)
- User list cache entry
- Individual user profile cache
- Featured products cache

## Database Requirements

Before running the seeder, ensure:

1. Database is running and accessible
2. Database schema is created (run migrations first)
3. Environment variables are properly configured:
   - `DB_HOST`
   - `DB_PORT` 
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_NAME`

## Environment Setup

The seeder uses the same database configuration as the main application. Make sure your `.env` file contains the necessary database connection details.

## Notes

- The seeder will clear all existing data before inserting new records
- All passwords are hashed using bcrypt (dummy hash for testing)
- API keys are test keys and should not be used in production
- Timestamps are set to realistic values (some in the past for testing)
- The seeder is designed for development/testing environments only

## Customization

To modify the dummy data, edit the respective methods in `dummy-data.seeder.ts`:

- `seedUsers()` - Modify user data
- `seedAPIRoutes()` - Add/modify API routes
- `seedAPIKeys()` - Change API key configurations
- `seedRateLimits()` - Adjust rate limiting rules
- `seedMetrics()` - Modify metric generation
- `seedAuditLogs()` - Change audit log patterns
- `seedCacheEntries()` - Update cache entries 