import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'api_gateway',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [join(__dirname, 'src/models/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'src/database/migrations/**/*{.ts,.js}')],
  subscribers: [join(__dirname, 'src/database/subscribers/**/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}); 