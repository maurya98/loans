import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error.stack);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: error.message
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  res.status(500).json({
    message: 'Internal Server Error'
  });
}; 