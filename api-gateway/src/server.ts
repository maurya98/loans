// Entry point for the API Gateway server 
import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync();
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`API Gateway server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to sync database:', error);
    process.exit(1);
  }
})(); 