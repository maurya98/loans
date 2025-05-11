import { Router } from 'express';
import * as userController from '../controllers/userController';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(userController.getAllUsers));
router.get('/:id', authenticate, authorize(['admin']), asyncHandler(userController.getUserById));
router.post('/', authenticate, authorize(['admin']), asyncHandler(userController.createUser));
router.put('/:id', authenticate, authorize(['admin']), asyncHandler(userController.updateUser));
router.delete('/:id', authenticate, authorize(['admin']), asyncHandler(userController.deleteUser));

export default router; 