import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

async function runMigrations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'api_gateway',
    schema: process.env.DB_SCHEMA || 'public',
    entities: [join(__dirname, '../../models/**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, './**/*{.ts,.js}')],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Run migrations
    const migrations = await dataSource.runMigrations();
    console.log(`Successfully ran ${migrations.length} migration(s):`);
    
    migrations.forEach(migration => {
      console.log(`- ${migration.name}`);
    });

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
