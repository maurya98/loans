import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sequelize } from './config/database';
import { documentRouter } from './routes/document.routes';
import { uploadRouter } from './routes/upload.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const port = process.env.PORT ?? 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/documents', documentRouter);
app.use('/api/upload', uploadRouter);

// Error handling
app.use(errorHandler);

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database synchronized');
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer(); 