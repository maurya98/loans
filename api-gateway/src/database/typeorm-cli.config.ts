import { DataSource } from 'typeorm';
import config from '../config';

// Import all entities
import { User } from '../models/User';
import { Route } from '../models/Route';
import { Service } from '../models/Service';
import { ApiKey } from '../models/ApiKey';
import { RequestLog } from '../models/RequestLog';
import { HealthCheck } from '../models/HealthCheck';
import { CircuitBreaker } from '../models/CircuitBreaker';
import { Alert } from '../models/Alert';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: false,
  entities: [User, Route, Service, ApiKey, RequestLog, HealthCheck, CircuitBreaker, Alert],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
});

export default AppDataSource; 