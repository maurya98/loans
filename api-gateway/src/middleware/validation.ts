import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Logger } from '../utils/logger';

export class ValidationMiddleware {
  private static logger = new Logger('ValidationMiddleware');

  public static validate(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = schema.validate(req.body);
      
      if (error) {
        this.logger.warn('Validation error:', { error: error.details, body: req.body });
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0]?.message || 'Validation failed',
          details: error.details
        });
      }

      req.body = value;
      return next();
    };
  }

  public static validateQuery(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = schema.validate(req.query);
      
      if (error) {
        this.logger.warn('Query validation error:', { error: error.details, query: req.query });
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0]?.message || 'Validation failed',
          details: error.details
        });
      }

      req.query = value;
      return next();
    };
  }

  public static validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = schema.validate(req.params);
      
      if (error) {
        this.logger.warn('Params validation error:', { error: error.details, params: req.params });
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0]?.message || 'Validation failed',
          details: error.details
        });
      }

      req.params = value;
      return next();
    };
  }
} 