"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_service_1 = require("./database.service");
const logger_1 = require("../utils/logger");
const user_entity_1 = require("../models/user.entity");
const api_key_entity_1 = require("../models/api-key.entity");
class AuthenticationService {
    constructor() {
        this.logger = new logger_1.Logger('AuthenticationService');
        this.databaseService = new database_service_1.DatabaseService();
    }
    async getUserRepository() {
        if (!this.userRepository) {
            const dataSource = this.databaseService.getDataSource();
            this.userRepository = dataSource.getRepository(user_entity_1.User);
        }
        return this.userRepository;
    }
    async getApiKeyRepository() {
        if (!this.apiKeyRepository) {
            const dataSource = this.databaseService.getDataSource();
            this.apiKeyRepository = dataSource.getRepository(api_key_entity_1.APIKey);
        }
        return this.apiKeyRepository;
    }
    async validateToken(token) {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT secret not configured');
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const user = await this.getUserById(decoded.userId);
            if (!user || !user.isActive) {
                return { valid: false, error: 'User not found or inactive' };
            }
            return { valid: true, user };
        }
        catch (error) {
            this.logger.error('Token validation error:', error);
            return { valid: false, error: 'Invalid token' };
        }
    }
    async authenticateUser(username, password) {
        try {
            const user = await this.getUserByUsername(username);
            if (!user || !user.isActive) {
                return { valid: false, error: 'Invalid credentials' };
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return { valid: false, error: 'Invalid credentials' };
            }
            await this.updateLastLogin(user.id);
            return { valid: true, user };
        }
        catch (error) {
            this.logger.error('Authentication error:', error);
            return { valid: false, error: 'Authentication failed' };
        }
    }
    async createUser(userData) {
        try {
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
            const repo = await this.getUserRepository();
            const user = repo.create({
                ...userData,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const savedUser = await repo.save(user);
            this.logger.info(`Created user: ${savedUser.username}`);
            return savedUser;
        }
        catch (error) {
            this.logger.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }
    async updateUser(id, update) {
        try {
            const repo = await this.getUserRepository();
            const user = await repo.findOne({ where: { id } });
            if (!user) {
                return undefined;
            }
            Object.assign(user, { ...update, updatedAt: new Date() });
            const updatedUser = await repo.save(user);
            this.logger.info(`Updated user: ${updatedUser.username}`);
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Error updating user ${id}:`, error);
            return undefined;
        }
    }
    async deleteUser(id) {
        try {
            const repo = await this.getUserRepository();
            const user = await repo.findOne({ where: { id } });
            if (!user) {
                return false;
            }
            await repo.remove(user);
            this.logger.info(`Deleted user: ${user.username}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting user ${id}:`, error);
            return false;
        }
    }
    async getUserById(id) {
        try {
            const repo = await this.getUserRepository();
            const user = await repo.findOne({ where: { id } });
            return user || undefined;
        }
        catch (error) {
            this.logger.error(`Error fetching user ${id}:`, error);
            return undefined;
        }
    }
    async getUserByUsername(username) {
        try {
            const repo = await this.getUserRepository();
            const user = await repo.findOne({ where: { username } });
            return user || undefined;
        }
        catch (error) {
            this.logger.error(`Error fetching user by username ${username}:`, error);
            return undefined;
        }
    }
    async getUserByEmail(email) {
        try {
            const repo = await this.getUserRepository();
            const user = await repo.findOne({ where: { email } });
            return user || undefined;
        }
        catch (error) {
            this.logger.error(`Error fetching user by email ${email}:`, error);
            return undefined;
        }
    }
    async validateApiKey(apiKey) {
        try {
            const repo = await this.getApiKeyRepository();
            const key = await repo.findOne({
                where: { key: apiKey, isActive: true },
                relations: ['user']
            });
            if (!key) {
                return { valid: false, error: 'Invalid API key' };
            }
            if (key.expiresAt && key.expiresAt < new Date()) {
                return { valid: false, error: 'API key expired' };
            }
            key.usageCount += 1;
            key.lastUsedAt = new Date();
            await repo.save(key);
            const apiUser = {
                id: key.userId || 'api_user',
                username: 'api_user',
                email: 'api@example.com',
                password: '',
                roles: ['api'],
                scopes: key.scopes,
                isActive: true,
                lastLoginAt: new Date(),
                lastLoginIp: '',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return { valid: true, user: apiUser };
        }
        catch (error) {
            this.logger.error('API key validation error:', error);
            return { valid: false, error: 'Invalid API key' };
        }
    }
    async validateOAuth2Token(token) {
        try {
            this.logger.info('OAuth2 token validation not implemented yet');
            return { valid: false, error: 'OAuth2 not implemented' };
        }
        catch (error) {
            this.logger.error('OAuth2 validation error:', error);
            return { valid: false, error: 'OAuth2 validation failed' };
        }
    }
    generateJWT(user) {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        if (!secret) {
            throw new Error('JWT secret not configured');
        }
        const payload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            scopes: user.scopes
        };
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    generateRefreshToken(user) {
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        if (!secret) {
            throw new Error('JWT refresh secret not configured');
        }
        const payload = {
            userId: user.id,
            type: 'refresh'
        };
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    async hasPermission(user, permission) {
        return user.scopes.includes(permission);
    }
    async hasRole(user, role) {
        return user.roles.includes(role);
    }
    async updateLastLogin(userId) {
        try {
            const repo = await this.getUserRepository();
            await repo.update(userId, {
                lastLoginAt: new Date(),
                updatedAt: new Date()
            });
        }
        catch (error) {
            this.logger.error(`Error updating last login for user ${userId}:`, error);
        }
    }
}
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map