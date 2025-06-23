"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const typeorm_1 = require("typeorm");
const logger_1 = require("../utils/logger");
class DatabaseService {
    constructor() {
        this.logger = new logger_1.Logger('DatabaseService');
    }
    async connect() {
        try {
            const config = {
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
            this.dataSource = new typeorm_1.DataSource(config);
            await this.dataSource.initialize();
            this.logger.info('Database connection established successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to database:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            if (this.dataSource && this.dataSource.isInitialized) {
                await this.dataSource.destroy();
                this.logger.info('Database connection closed successfully');
            }
        }
        catch (error) {
            this.logger.error('Error closing database connection:', error);
            throw error;
        }
    }
    getDataSource() {
        if (!this.dataSource || !this.dataSource.isInitialized) {
            throw new Error('Database not initialized');
        }
        return this.dataSource;
    }
    async runMigrations() {
        try {
            if (this.dataSource && this.dataSource.isInitialized) {
                await this.dataSource.runMigrations();
                this.logger.info('Database migrations completed successfully');
            }
        }
        catch (error) {
            this.logger.error('Error running migrations:', error);
            throw error;
        }
    }
    async dropDatabase() {
        try {
            if (this.dataSource && this.dataSource.isInitialized) {
                await this.dataSource.dropDatabase();
                this.logger.info('Database dropped successfully');
            }
        }
        catch (error) {
            this.logger.error('Error dropping database:', error);
            throw error;
        }
    }
    async query(sql, parameters) {
        try {
            if (!this.dataSource || !this.dataSource.isInitialized) {
                throw new Error('Database not initialized');
            }
            return await this.dataSource.query(sql, parameters);
        }
        catch (error) {
            this.logger.error('Database query error:', error);
            throw error;
        }
    }
    async transaction(operation) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const result = await operation(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    isConnected() {
        return this.dataSource?.isInitialized || false;
    }
    async healthCheck() {
        try {
            if (!this.isConnected()) {
                return false;
            }
            await this.dataSource.query('SELECT 1');
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map