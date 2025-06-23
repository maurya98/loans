"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLogger = void 0;
const logger_1 = require("../utils/logger");
class RequestLogger {
    static log(req, res, next) {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            RequestLogger.logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
        });
        next();
    }
}
exports.RequestLogger = RequestLogger;
RequestLogger.logger = new logger_1.Logger('RequestLogger');
//# sourceMappingURL=request-logger.js.map