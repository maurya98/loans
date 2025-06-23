import { sequelize } from './config';
import { ConfigurationModel } from './ConfigurationRepository';

export async function initializeDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');

    return true;
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
} 