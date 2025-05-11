import { Router } from 'express';
import * as apiController from '../controllers/apiController';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/', authenticate, authorize(['admin', 'user']), asyncHandler(apiController.getAllAPIs));
router.get('/:id', authenticate, authorize(['admin', 'user']), asyncHandler(apiController.getAPIById));
router.post('/', authenticate, authorize(['admin']), asyncHandler(apiController.createAPI));
router.put('/:id', authenticate, authorize(['admin']), asyncHandler(apiController.updateAPI));
router.delete('/:id', authenticate, authorize(['admin']), asyncHandler(apiController.deleteAPI));

export default router; 