import Joi from 'joi';

export const createConfigSchema = Joi.object({
  applicationName: Joi.string().required(),
  environment: Joi.string().required(),
  configKey: Joi.string().required(),
  configValue: Joi.any().required(),
  isEncrypted: Joi.boolean().default(false)
});

export const updateConfigSchema = Joi.object({
  configValue: Joi.any().required()
});

export const pathParamsSchema = Joi.object({
  applicationName: Joi.string().required(),
  environment: Joi.string().required(),
  configKey: Joi.string().required()
});

export const environmentParamsSchema = Joi.object({
  applicationName: Joi.string().required(),
  environment: Joi.string().required()
}); 