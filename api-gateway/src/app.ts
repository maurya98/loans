import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { httpLogger, dbLogger } from './middlewares/logger';
import { apiRateLimiter, perApiRateLimiter } from './middlewares/rateLimit';
import { authenticate } from './middlewares/auth';
import { authorize } from './middlewares/authorize';
import { cacheMiddleware } from './middlewares/cache';
import { proxyMiddleware } from './middlewares/proxy';
import apiRoutes from './routes/apiRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import portalRoutes from './routes/portalRoutes';
import myApiKeyRoutes from './routes/myApiKeyRoutes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(httpLogger);
app.use(dbLogger);
app.use(apiRateLimiter);
app.use(cacheMiddleware);

// Example protected route
app.get('/health', authenticate, authorize(['admin', 'user']), (req, res) => {
  res.json({ status: 'ok' });
});

// Proxy all API requests (stub)
app.use('/api', authenticate, authorize(['admin', 'user']), proxyMiddleware, perApiRateLimiter);

app.use('/apis', apiRoutes);
app.use('/apikeys', apiKeyRoutes);
app.use('/users', userRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/portal', portalRoutes);
app.use('/my/apikeys', myApiKeyRoutes);

export default app;
