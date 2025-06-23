import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialTables1703123456789 implements MigrationInterface {
  name = 'CreateInitialTables1703123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'roles',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'scopes',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastLoginIp',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create api_routes table
    await queryRunner.createTable(
      new Table({
        name: 'api_routes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'backend',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'authentication',
            type: 'boolean',
            default: false,
          },
          {
            name: 'rateLimit',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'cache',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'headers',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'pathRewrite',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create api_keys table
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'scopes',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'permissions',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastUsedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastUsedIp',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'usageCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create rate_limits table
    await queryRunner.createTable(
      new Table({
        name: 'rate_limits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'identifier',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'limit',
            type: 'int',
          },
          {
            name: 'window',
            type: 'int',
          },
          {
            name: 'currentCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'windowStart',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'windowEnd',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create metrics table
    await queryRunner.createTable(
      new Table({
        name: 'metrics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'value',
            type: 'double precision',
          },
          {
            name: 'labels',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'service',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'method',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'statusCode',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'clientId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'statusCode',
            type: 'int',
          },
          {
            name: 'responseTime',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'requestSize',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'responseSize',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'service',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'requestHeaders',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'responseHeaders',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'requestBody',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'responseBody',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'errorType',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create cache_entries table
    await queryRunner.createTable(
      new Table({
        name: 'cache_entries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'value',
            type: 'text',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'ttl',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'hitCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastAccessedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'size',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('users', new TableIndex({ name: 'IDX_users_username', columnNames: ['username'] }));
    await queryRunner.createIndex('users', new TableIndex({ name: 'IDX_users_email', columnNames: ['email'] }));
    
    await queryRunner.createIndex('api_routes', new TableIndex({ name: 'IDX_api_routes_path', columnNames: ['path'] }));
    await queryRunner.createIndex('api_routes', new TableIndex({ name: 'IDX_api_routes_method', columnNames: ['method'] }));
    await queryRunner.createIndex('api_routes', new TableIndex({ name: 'IDX_api_routes_backend', columnNames: ['backend'] }));
    
    await queryRunner.createIndex('api_keys', new TableIndex({ name: 'IDX_api_keys_key', columnNames: ['key'] }));
    await queryRunner.createIndex('api_keys', new TableIndex({ name: 'IDX_api_keys_userId', columnNames: ['userId'] }));
    
    await queryRunner.createIndex('rate_limits', new TableIndex({ name: 'IDX_rate_limits_identifier', columnNames: ['identifier'] }));
    await queryRunner.createIndex('rate_limits', new TableIndex({ name: 'IDX_rate_limits_type', columnNames: ['type'] }));
    await queryRunner.createIndex('rate_limits', new TableIndex({ name: 'IDX_rate_limits_endpoint', columnNames: ['endpoint'] }));
    
    await queryRunner.createIndex('metrics', new TableIndex({ name: 'IDX_metrics_name', columnNames: ['name'] }));
    await queryRunner.createIndex('metrics', new TableIndex({ name: 'IDX_metrics_timestamp', columnNames: ['timestamp'] }));
    await queryRunner.createIndex('metrics', new TableIndex({ name: 'IDX_metrics_service', columnNames: ['service'] }));
    
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_audit_logs_timestamp', columnNames: ['timestamp'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_audit_logs_userId', columnNames: ['userId'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_audit_logs_path', columnNames: ['path'] }));
    
    await queryRunner.createIndex('cache_entries', new TableIndex({ name: 'IDX_cache_entries_key', columnNames: ['key'] }));
    await queryRunner.createIndex('cache_entries', new TableIndex({ name: 'IDX_cache_entries_expiresAt', columnNames: ['expiresAt'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cache_entries');
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('metrics');
    await queryRunner.dropTable('rate_limits');
    await queryRunner.dropTable('api_keys');
    await queryRunner.dropTable('api_routes');
    await queryRunner.dropTable('users');
  }
} 