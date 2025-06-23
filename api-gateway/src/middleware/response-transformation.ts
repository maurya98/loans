import { Request, Response, NextFunction } from 'express';

export class ResponseTransformation {
  public static transform() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Example: Intercept and modify response
      // const originalJson = res.json;
      // res.json = function (body: any) {
      //   body.transformed = true;
      //   return originalJson.call(this, body);
      // };
      next();
    };
  }
} 