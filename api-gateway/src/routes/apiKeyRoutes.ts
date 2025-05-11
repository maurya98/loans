import { Router } from 'express';
import * as apiKeyController from '../controllers/apiKeyController';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/', authenticate, authorize(['admin']), asyncHandler(apiKeyController.getAllAPIKeys));
router.get('/:id', authenticate, authorize(['admin']), asyncHandler(apiKeyController.getAPIKeyById));
router.post('/', authenticate, authorize(['admin']), asyncHandler(apiKeyController.createAPIKey));
router.put('/:id', authenticate, authorize(['admin']), asyncHandler(apiKeyController.updateAPIKey));
router.delete('/:id', authenticate, authorize(['admin']), asyncHandler(apiKeyController.deleteAPIKey));

export default router; 