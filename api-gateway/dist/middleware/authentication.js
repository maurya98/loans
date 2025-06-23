"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
class AuthenticationMiddleware {
    static authenticate() {
        return async (req, res, next) => {
            try {
                const token = this.extractToken(req);
                if (!token) {
                    return next();
                }
                const decoded = await this.validateToken(token);
                req.user = decoded;
                req.token = token;
                next();
            }
            catch (error) {
                this.logger.error('Authentication error:', error);
                next();
            }
        };
    }
    static requireAuth() {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            next();
        };
    }
    static requireRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            const userRoles = req.user.roles || [];
            const requiredRoles = Array.isArray(roles) ? roles : [roles];
            const hasRole = requiredRoles.some(role => userRoles.includes(role));
            if (!hasRole) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                });
            }
            next();
        };
    }
    static requireScope(scopes) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            const userScopes = req.user.scopes || [];
            const requiredScopes = Array.isArray(scopes) ? scopes : [scopes];
            const hasScope = requiredScopes.every(scope => userScopes.includes(scope));
            if (!hasScope) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Insufficient scopes'
                });
            }
            next();
        };
    }
    static extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        const apiKey = req.headers['x-api-key'];
        if (apiKey) {
            return apiKey;
        }
        const queryToken = req.query.token;
        if (queryToken) {
            return queryToken;
        }
        const cookieToken = req.cookies?.token;
        if (cookieToken) {
            return cookieToken;
        }
        return null;
    }
    static async validateToken(token) {
        try {
            if (this.isJWT(token)) {
                return this.validateJWT(token);
            }
            return await this.validateAPIKey(token);
        }
        catch (error) {
            this.logger.error('Token validation error:', error);
            throw new Error('Invalid token');
        }
    }
    static isJWT(token) {
        try {
            const parts = token.split('.');
            return parts.length === 3;
        }
        catch {
            return false;
        }
    }
    static validateJWT(token) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret not configured');
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return decoded;
        }
        catch (error) {
            this.logger.error('JWT validation error:', error);
            throw new Error('Invalid JWT token');
        }
    }
    static async validateAPIKey(apiKey) {
        const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
        if (!validApiKeys.includes(apiKey)) {
            throw new Error('Invalid API key');
        }
        return {
            type: 'api_key',
            key: apiKey,
            permissions: ['read', 'write']
        };
    }
    static generateJWT(payload) {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        if (!secret) {
            throw new Error('JWT secret not configured');
        }
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    static generateRefreshToken(payload) {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        if (!secret) {
            throw new Error('JWT secret not configured');
        }
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
}
exports.AuthenticationMiddleware = AuthenticationMiddleware;
AuthenticationMiddleware.logger = new logger_1.Logger('AuthenticationMiddleware');
//# sourceMappingURL=authentication.js.map