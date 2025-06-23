"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationController = void 0;
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: process.env.SWAGGER_TITLE || 'API Gateway',
        version: process.env.SWAGGER_VERSION || '1.0.0',
        description: process.env.SWAGGER_DESCRIPTION || 'Comprehensive API Gateway with full functionality',
    },
    servers: [
        {
            url: process.env.SWAGGER_BASE_PATH || '/api',
        },
    ],
};
const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
class DocumentationController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    }
    getRouter() {
        return this.router;
    }
}
exports.DocumentationController = DocumentationController;
//# sourceMappingURL=documentation.controller.js.map