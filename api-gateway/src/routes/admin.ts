import { Router } from 'express';
import { authenticateToken } from '../middleware/authentication';
import { adminController } from '../controllers/adminController';

const router = Router();

// Routes management
router.get('/routes', authenticateToken, adminController.getRoutes);
router.post('/routes', authenticateToken, adminController.createRoute);
router.put('/routes/:id', authenticateToken, adminController.updateRoute);
router.delete('/routes/:id', authenticateToken, adminController.deleteRoute);

// Services management
router.get('/services', authenticateToken, adminController.getServices);
router.post('/services', authenticateToken, adminController.createService);
router.put('/services/:id', authenticateToken, adminController.updateService);
router.delete('/services/:id', authenticateToken, adminController.deleteService);

// Monitoring endpoints
router.get('/metrics', authenticateToken, adminController.getMetrics);
router.get('/health-checks', authenticateToken, adminController.getHealthChecks);
router.get('/circuit-breakers', authenticateToken, adminController.getCircuitBreakers);

export default router; 