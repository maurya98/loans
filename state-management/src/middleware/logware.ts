import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    logger.info('Incoming Request', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        headers: req.headers,
        ip: req.ip
    });

    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - startTime;
        
        logger.info('Outgoing Response', {
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            path: req.path,
            body: body
        });
        
        return originalSend.call(this, body);
    };

    next();
};

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error occurred', {
        error: {
            message: error.message,
            stack: error.stack
        },
        path: req.path,
        method: req.method
    });
    
    next(error);
};

