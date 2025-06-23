import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')
    `);
    
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "username" character varying(50) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create routes table
    await queryRunner.query(`
      CREATE TYPE "public"."http_method_enum" AS ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')
    `);
    
    await queryRunner.query(`
      CREATE TABLE "routes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "path" character varying(255) NOT NULL,
        "method" "public"."http_method_enum" NOT NULL,
        "upstream" character varying(255) NOT NULL,
        "loadBalancerConfig" jsonb NOT NULL DEFAULT '{}',
        "rateLimitConfig" jsonb,
        "authentication" boolean NOT NULL DEFAULT false,
        "authorization" jsonb,
        "plugins" jsonb NOT NULL DEFAULT '[]',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_route_path_method" UNIQUE ("path", "method"),
        CONSTRAINT "PK_8acf5c3c3e8b3c3e8b3c3e8b3c3" PRIMARY KEY ("id")
      )
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "hosts" jsonb NOT NULL DEFAULT '[]',
        "healthCheck" character varying(255),
        "isHealthy" boolean NOT NULL DEFAULT true,
        "lastHealthCheck" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_services_name" UNIQUE ("name"),
        CONSTRAINT "PK_services_id" PRIMARY KEY ("id")
      )
    `);

    // Create api_keys table
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "key" character varying(255) NOT NULL,
        "name" character varying(100) NOT NULL,
        "permissions" jsonb NOT NULL DEFAULT '[]',
        "isActive" boolean NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_api_keys_key" UNIQUE ("key"),
        CONSTRAINT "PK_api_keys_id" PRIMARY KEY ("id")
      )
    `);

    // Create request_logs table
    await queryRunner.query(`
      CREATE TABLE "request_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "routeId" uuid,
        "method" character varying(10) NOT NULL,
        "path" character varying(255) NOT NULL,
        "statusCode" integer NOT NULL,
        "responseTime" integer NOT NULL,
        "ip" character varying(45) NOT NULL,
        "userAgent" text,
        "userId" uuid,
        "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_request_logs_id" PRIMARY KEY ("id")
      )
    `);

    // Create health_checks table
    await queryRunner.query(`
      CREATE TYPE "public"."health_status_enum" AS ENUM('healthy', 'unhealthy', 'degraded')
    `);
    
    await queryRunner.query(`
      CREATE TABLE "health_checks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "service" character varying(100) NOT NULL,
        "status" "public"."health_status_enum" NOT NULL,
        "responseTime" integer,
        "errorMessage" text,
        "checkedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_health_checks_id" PRIMARY KEY ("id")
      )
    `);

    // Create circuit_breakers table
    await queryRunner.query(`
      CREATE TYPE "public"."circuit_breaker_state_enum" AS ENUM('closed', 'open', 'half-open')
    `);
    
    await queryRunner.query(`
      CREATE TABLE "circuit_breakers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "service" character varying(100) NOT NULL,
        "state" "public"."circuit_breaker_state_enum" NOT NULL,
        "failureCount" integer NOT NULL DEFAULT 0,
        "lastFailureTime" TIMESTAMP WITH TIME ZONE,
        "nextAttemptTime" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_circuit_breakers_service" UNIQUE ("service"),
        CONSTRAINT "PK_circuit_breakers_id" PRIMARY KEY ("id")
      )
    `);

    // Create alerts table
    await queryRunner.query(`
      CREATE TYPE "public"."alert_type_enum" AS ENUM('error', 'warning', 'info')
    `);
    
    await queryRunner.query(`
      CREATE TABLE "alerts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" "public"."alert_type_enum" NOT NULL,
        "message" text NOT NULL,
        "service" character varying(100),
        "isResolved" boolean NOT NULL DEFAULT false,
        "resolvedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_alerts_id" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_routes_isActive" ON "routes" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_request_logs_timestamp" ON "request_logs" ("timestamp")`);
    await queryRunner.query(`CREATE INDEX "IDX_request_logs_routeId" ON "request_logs" ("routeId")`);
    await queryRunner.query(`CREATE INDEX "IDX_request_logs_statusCode" ON "request_logs" ("statusCode")`);
    await queryRunner.query(`CREATE INDEX "IDX_request_logs_userId" ON "request_logs" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_api_keys_userId" ON "api_keys" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_api_keys_isActive" ON "api_keys" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_health_checks_service" ON "health_checks" ("service")`);
    await queryRunner.query(`CREATE INDEX "IDX_health_checks_checkedAt" ON "health_checks" ("checkedAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_alerts_isResolved" ON "alerts" ("isResolved")`);
    await queryRunner.query(`CREATE INDEX "IDX_alerts_createdAt" ON "alerts" ("createdAt")`);

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "api_keys" ADD CONSTRAINT "FK_api_keys_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    
    await queryRunner.query(`
      ALTER TABLE "request_logs" ADD CONSTRAINT "FK_request_logs_routeId" 
      FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    
    await queryRunner.query(`
      ALTER TABLE "request_logs" ADD CONSTRAINT "FK_request_logs_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create updated_at trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON "users"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_routes_updated_at
        BEFORE UPDATE ON "routes"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_services_updated_at
        BEFORE UPDATE ON "services"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_api_keys_updated_at
        BEFORE UPDATE ON "api_keys"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_circuit_breakers_updated_at
        BEFORE UPDATE ON "circuit_breakers"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_circuit_breakers_updated_at ON "circuit_breakers"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_api_keys_updated_at ON "api_keys"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_services_updated_at ON "services"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_routes_updated_at ON "routes"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON "users"`);

    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "request_logs" DROP CONSTRAINT "FK_request_logs_userId"`);
    await queryRunner.query(`ALTER TABLE "request_logs" DROP CONSTRAINT "FK_request_logs_routeId"`);
    await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_api_keys_userId"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_alerts_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_alerts_isResolved"`);
    await queryRunner.query(`DROP INDEX "IDX_health_checks_checkedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_health_checks_service"`);
    await queryRunner.query(`DROP INDEX "IDX_api_keys_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_api_keys_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_request_logs_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_request_logs_statusCode"`);
    await queryRunner.query(`DROP INDEX "IDX_request_logs_routeId"`);
    await queryRunner.query(`DROP INDEX "IDX_request_logs_timestamp"`);
    await queryRunner.query(`DROP INDEX "IDX_routes_isActive"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "alerts"`);
    await queryRunner.query(`DROP TABLE "circuit_breakers"`);
    await queryRunner.query(`DROP TABLE "health_checks"`);
    await queryRunner.query(`DROP TABLE "request_logs"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "routes"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."alert_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."circuit_breaker_state_enum"`);
    await queryRunner.query(`DROP TYPE "public"."health_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."http_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
} 