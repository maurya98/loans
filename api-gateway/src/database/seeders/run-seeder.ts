import { DummyDataSeeder } from './dummy-data.seeder';
import { Logger } from '../../utils/logger';

async function main() {
  const logger = new Logger('SeederRunner');
  
  try {
    logger.info('Starting database seeding process...');
    
    const seeder = new DummyDataSeeder();
    await seeder.seed();
    
    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed database:', error);
    process.exit(1);
  }
}

main(); 