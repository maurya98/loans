import { DataSource, DataSourceOptions } from 'typeorm';
import { Logger } from '../utils/logger';

export class DatabaseService {
  private dataSource!: DataSource;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('DatabaseService');
  }

  public async connect(): Promise<void> {
    try {
      const config: DataSourceOptions = {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'api_gateway',
        schema: process.env.DB_SCHEMA || 'public',
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        entities: [__dirname + '/../models/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
        subscribers: [__dirname + '/../database/subscribers/**/*{.ts,.js}'],
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        poolSize: 10,
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000,
        }
      };

      this.dataSource = new DataSource(config);
      await this.dataSource.initialize();
      
      this.logger.info('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        this.logger.info('Database connection closed successfully');
      }
    } catch (error) {
      this.logger.error('Error closing database connection:', error);
      throw error;
    }
  }

  public getDataSource(): DataSource {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.dataSource;
  }

  public async runMigrations(): Promise<void> {
    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.runMigrations();
        this.logger.info('Database migrations completed successfully');
      }
    } catch (error) {
      this.logger.error('Error running migrations:', error);
      throw error;
    }
  }

  public async dropDatabase(): Promise<void> {
    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.dropDatabase();
        this.logger.info('Database dropped successfully');
      }
    } catch (error) {
      this.logger.error('Error dropping database:', error);
      throw error;
    }
  }

  public async query(sql: string, parameters?: any[]): Promise<any> {
    try {
      if (!this.dataSource || !this.dataSource.isInitialized) {
        throw new Error('Database not initialized');
      }
      return await this.dataSource.query(sql, parameters);
    } catch (error) {
      this.logger.error('Database query error:', error);
      throw error;
    }
  }

  public async transaction<T>(operation: (queryRunner: any) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public isConnected(): boolean {
    return this.dataSource?.isInitialized || false;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        return false;
      }
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }
} 