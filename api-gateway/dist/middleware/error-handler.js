"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = require("../utils/logger");
class ErrorHandler {
    static handle() {
        return (error, req, res, next) => {
            this.logger.error('Unhandled error:', {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: error.message,
                    details: error.details
                });
            }
            if (error.name === 'UnauthorizedError') {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid or missing authentication token'
                });
            }
            if (error.name === 'ForbiddenError') {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Access denied'
                });
            }
            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    error: 'Not Found',
                    message: error.message || 'Resource not found'
                });
            }
            if (error.name === 'RateLimitError') {
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded',
                    retryAfter: error.retryAfter
                });
            }
            if (error.name === 'CircuitBreakerError') {
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Service temporarily unavailable due to circuit breaker',
                    retryAfter: error.retryAfter
                });
            }
            if (error.name === 'TimeoutError') {
                return res.status(504).json({
                    error: 'Gateway Timeout',
                    message: 'Request timeout'
                });
            }
            const statusCode = error.statusCode || 500;
            const message = process.env.NODE_ENV === 'production'
                ? 'Internal Server Error'
                : error.message;
            res.status(statusCode).json({
                error: 'Internal Server Error',
                message,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        };
    }
    static notFound(req, res) {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.method} ${req.url} not found`
        });
    }
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.logger = new logger_1.Logger('ErrorHandler');
//# sourceMappingURL=error-handler.js.map