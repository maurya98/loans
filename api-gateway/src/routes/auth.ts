import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middleware/authentication';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.post('/api-keys', authenticateToken, authController.createApiKey.bind(authController));
router.get('/api-keys', authenticateToken, authController.getApiKeys.bind(authController));
router.delete('/api-keys/:id', authenticateToken, authController.revokeApiKey.bind(authController));
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));
router.put('/change-password', authenticateToken, authController.changePassword.bind(authController));

export default router; 