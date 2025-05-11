import { Router } from 'express';
import { getApiUsage, getApiErrorRates, getApiLatency, getMyApiKeyUsage } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/usage', authenticate, authorize(['admin']), getApiUsage);
router.get('/errors', authenticate, authorize(['admin']), getApiErrorRates);
router.get('/latency', authenticate, authorize(['admin']), getApiLatency);
router.get('/my/usage', authenticate, getMyApiKeyUsage);

export default router; 