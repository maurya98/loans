import { Router } from 'express';
import { ConfigurationController } from '../controllers/ConfigurationController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';
import { validateRequest, validateParams } from '../middleware/validation';
import { 
  createConfigSchema, 
  updateConfigSchema, 
  pathParamsSchema, 
  environmentParamsSchema 
} from '../validators/configurationSchemas';
import { UserRole } from '../../infrastructure/database/models/User';

const router = Router();

export const configureRoutes = (controller: ConfigurationController) => {
  router.post(
    '/', 
    requireRole([UserRole.ADMIN]), 
    validateRequest(createConfigSchema),
    controller.createConfig.bind(controller)
  );

  router.get(
    '/:applicationName/:environment', 
    validateParams(environmentParamsSchema),
    controller.getAllConfigs.bind(controller)
  );

  router.get(
    '/:applicationName/:environment/:configKey', 
    validateParams(pathParamsSchema),
    controller.getConfig.bind(controller)
  );

  router.put(
    '/:applicationName/:environment/:configKey', 
    requireRole([UserRole.ADMIN]), 
    validateParams(pathParamsSchema),
    validateRequest(updateConfigSchema),
    controller.updateConfig.bind(controller)
  );

  router.delete(
    '/:applicationName/:environment/:configKey', 
    requireRole([UserRole.ADMIN]), 
    validateParams(pathParamsSchema),
    controller.deleteConfig.bind(controller)
  );

  return router;
}; 