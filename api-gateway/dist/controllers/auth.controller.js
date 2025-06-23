"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = require("express");
const authentication_1 = require("../middleware/authentication");
class AuthController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.post('/login', this.login);
        this.router.post('/refresh', this.refreshToken);
        this.router.get('/me', authentication_1.AuthenticationMiddleware.requireAuth(), this.me);
    }
    getRouter() {
        return this.router;
    }
    login(req, res) {
        const { username, password } = req.body;
        if (username === 'admin' && password === 'password') {
            const token = authentication_1.AuthenticationMiddleware.generateJWT({ username, roles: ['admin'] });
            const refreshToken = authentication_1.AuthenticationMiddleware.generateRefreshToken({ username });
            return res.json({ token, refreshToken });
        }
        res.status(401).json({ error: 'Invalid credentials' });
    }
    refreshToken(req, res) {
        const { refreshToken } = req.body;
        try {
            const payload = authentication_1.AuthenticationMiddleware.validateJWT(refreshToken);
            const token = authentication_1.AuthenticationMiddleware.generateJWT(payload);
            res.json({ token });
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    }
    me(req, res) {
        res.json({ user: req.user });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map