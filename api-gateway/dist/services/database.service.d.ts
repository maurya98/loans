import { DataSource } from 'typeorm';
export declare class DatabaseService {
    private dataSource;
    private logger;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getDataSource(): DataSource;
    runMigrations(): Promise<void>;
    dropDatabase(): Promise<void>;
    query(sql: string, parameters?: any[]): Promise<any>;
    transaction<T>(operation: (queryRunner: any) => Promise<T>): Promise<T>;
    isConnected(): boolean;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=database.service.d.ts.map