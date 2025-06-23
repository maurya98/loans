import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthService } from '../../core/services/AuthService';

export const configureAuthRoutes = (authController: AuthController, authService: AuthService) => {
  const router = Router();

  // Public routes
  router.post('/login', authController.login.bind(authController));
  router.post('/register', authController.register.bind(authController));

  // Protected routes
  router.get('/profile', authMiddleware(authService), authController.getProfile.bind(authController));

  return router;
}; 