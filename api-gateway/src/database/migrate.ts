import db from './connection';
import logger from '../utils/logger';

const migrations = [
  // Users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Routes table
  `
    CREATE TABLE IF NOT EXISTS routes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      path VARCHAR(255) NOT NULL,
      method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
      upstream VARCHAR(255) NOT NULL,
      load_balancer_config JSONB NOT NULL DEFAULT '{}',
      rate_limit_config JSONB,
      authentication BOOLEAN NOT NULL DEFAULT false,
      auth_config JSONB,
      plugins JSONB NOT NULL DEFAULT '[]',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(path, method)
    )
  `,

  // Services table
  `
    CREATE TABLE IF NOT EXISTS services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      hosts JSONB NOT NULL,
      health_check VARCHAR(255),
      is_healthy BOOLEAN NOT NULL DEFAULT true,
      last_health_check TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // API Keys table
  `
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      permissions JSONB NOT NULL DEFAULT '[]',
      is_active BOOLEAN NOT NULL DEFAULT true,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Request Logs table
  `
    CREATE TABLE IF NOT EXISTS request_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
      method VARCHAR(10) NOT NULL,
      path VARCHAR(255) NOT NULL,
      status_code INTEGER NOT NULL,
      response_time INTEGER NOT NULL,
      ip VARCHAR(45) NOT NULL,
      user_agent TEXT,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Health Checks table
  `
    CREATE TABLE IF NOT EXISTS health_checks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'degraded')),
      response_time INTEGER,
      error_message TEXT,
      checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Circuit Breakers table
  `
    CREATE TABLE IF NOT EXISTS circuit_breakers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service VARCHAR(100) NOT NULL,
      state VARCHAR(20) NOT NULL CHECK (state IN ('closed', 'open', 'half-open')),
      failure_count INTEGER NOT NULL DEFAULT 0,
      last_failure_time TIMESTAMP WITH TIME ZONE,
      next_attempt_time TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(service)
    )
  `,

  // Alerts table
  `
    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(20) NOT NULL CHECK (type IN ('error', 'warning', 'info')),
      message TEXT NOT NULL,
      service VARCHAR(100),
      is_resolved BOOLEAN NOT NULL DEFAULT false,
      resolved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Create indexes
  `
    CREATE INDEX IF NOT EXISTS idx_routes_path_method ON routes(path, method);
    CREATE INDEX IF NOT EXISTS idx_routes_is_active ON routes(is_active);
    CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_request_logs_route_id ON request_logs(route_id);
    CREATE INDEX IF NOT EXISTS idx_request_logs_status_code ON request_logs(status_code);
    CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service);
    CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON health_checks(checked_at);
    CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);
    CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
  `,

  // Create updated_at trigger function
  `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `,

  // Create triggers for updated_at
  `
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `,

  `
    DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
    CREATE TRIGGER update_routes_updated_at
      BEFORE UPDATE ON routes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `,

  `
    DROP TRIGGER IF EXISTS update_services_updated_at ON services;
    CREATE TRIGGER update_services_updated_at
      BEFORE UPDATE ON services
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `,

  `
    DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
    CREATE TRIGGER update_api_keys_updated_at
      BEFORE UPDATE ON api_keys
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `,

  `
    DROP TRIGGER IF EXISTS update_circuit_breakers_updated_at ON circuit_breakers;
    CREATE TRIGGER update_circuit_breakers_updated_at
      BEFORE UPDATE ON circuit_breakers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `
];

const runMigrations = async (): Promise<void> => {
  try {
    logger.info('Starting database migrations...');
    
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      if (migration) {
        logger.info(`Running migration ${i + 1}/${migrations.length}`);
        await db.query(migration);
      }
    }
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

export default runMigrations; 