import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { expressCspHeader } from 'express-csp-header';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const corsOptions: cors.CorsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
};

const cspMiddleware = expressCspHeader({
    directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'"],
        'frame-ancestors': ["'none'"]
    }
});

function escapeString(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = escapeString(req.body[key]);
            }
        });
    }
    next();
};

export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
    const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|TRUNCATE|DECLARE|WAITFOR|CREATE|FROM|WHERE)\b)/gi;

    const checkForSQLInjection = (value: any): boolean => {
        if (typeof value === 'string') {
            try {
                const decodedValue = decodeURIComponent(value);
                return sqlInjectionPattern.test(decodedValue);
            } catch {
                return sqlInjectionPattern.test(value);
            }
        }
        return false;
    };

    const checkObject = (obj: any): boolean => {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (checkObject(obj[key])) return true;
            } else if (checkForSQLInjection(obj[key])) {
                return true;
            }
        }
        return false;
    };

    if (
        checkObject(req.query) ||
        checkObject(req.body) ||
        checkObject(req.params)
    ) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'Invalid input detected'
        });
    }

    next();
};

export const ipWhitelist = (req: Request, res: Response, next: NextFunction) => {
    const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
    const clientIP: any = req.ip;
    if (!allowedIPs.includes(clientIP)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const MAX_SIZE = 1024 * 1024; // 1MB

    if (contentLength > MAX_SIZE) {
        return res.status(413).json({ message: 'Request entity too large' });
    }
    next();
};

export const applySecurityMiddleware = (app: any) => {
    app.use(helmet());
    app.use(limiter);
    app.use(cors(corsOptions));
    app.use(securityHeaders);
    app.use(xssProtection);
    app.use(cspMiddleware);
    app.use(sanitizeRequest);
    app.use(sqlInjectionProtection);
};