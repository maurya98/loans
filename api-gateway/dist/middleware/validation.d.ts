import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare class ValidationMiddleware {
    private static logger;
    static validate(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    static validateQuery(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    static validateParams(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
}
//# sourceMappingURL=validation.d.ts.map