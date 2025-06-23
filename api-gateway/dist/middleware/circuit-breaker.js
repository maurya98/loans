"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerMiddleware = void 0;
const logger_1 = require("../utils/logger");
const CIRCUIT_BREAKER_THRESHOLD = parseInt(process.env.GATEWAY_CIRCUIT_BREAKER_THRESHOLD || '5');
const CIRCUIT_BREAKER_TIMEOUT = parseInt(process.env.GATEWAY_CIRCUIT_BREAKER_TIMEOUT || '60000');
class CircuitBreakerMiddleware {
    static handle() {
        return (req, res, next) => {
            const backend = req.headers['x-backend-service'] || req.path;
            const state = this.states.get(backend) || { failures: 0, lastFailure: 0, openUntil: 0 };
            const now = Date.now();
            if (state.openUntil > now) {
                this.logger.warn(`Circuit open for backend: ${backend}`);
                return res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Circuit breaker is open. Please try again later.'
                });
            }
            res.on('finish', () => {
                if (res.statusCode >= 500) {
                    state.failures++;
                    state.lastFailure = now;
                    if (state.failures >= CIRCUIT_BREAKER_THRESHOLD) {
                        state.openUntil = now + CIRCUIT_BREAKER_TIMEOUT;
                        this.logger.warn(`Circuit opened for backend: ${backend}`);
                    }
                }
                else {
                    state.failures = 0;
                    state.openUntil = 0;
                }
                this.states.set(backend, state);
            });
            next();
        };
    }
}
exports.CircuitBreakerMiddleware = CircuitBreakerMiddleware;
CircuitBreakerMiddleware.logger = new logger_1.Logger('CircuitBreaker');
CircuitBreakerMiddleware.states = new Map();
//# sourceMappingURL=circuit-breaker.js.map