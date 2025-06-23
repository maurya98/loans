import { Request, Response, NextFunction } from 'express';

export class RequestTransformation {
  public static transform() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Example: Add a custom header or modify the body/path
      // req.headers['x-custom-header'] = 'value';
      // req.body = { ...req.body, injected: true };
      // req.url = req.url.replace('/v1/', '/v2/');
      next();
    };
  }
} 