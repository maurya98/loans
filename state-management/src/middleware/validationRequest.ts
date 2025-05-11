import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'joi';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        schema.body.validateAsync(req.body)
          .then(() => next())
          .catch((error: ValidationError) => {
            res.status(400).json({
              error: 'Validation error',
              details: error.details.map(detail => detail.message)
            });
          });
      } else {
        next();
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}; 