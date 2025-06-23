"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const logger_1 = require("../utils/logger");
class ValidationMiddleware {
    static validate(schema) {
        return (req, res, next) => {
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
            next();
        };
    }
    static validateQuery(schema) {
        return (req, res, next) => {
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
            next();
        };
    }
    static validateParams(schema) {
        return (req, res, next) => {
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
            next();
        };
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
ValidationMiddleware.logger = new logger_1.Logger('ValidationMiddleware');
//# sourceMappingURL=validation.js.map