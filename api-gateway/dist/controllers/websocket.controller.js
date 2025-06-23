"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketController = void 0;
const logger_1 = require("../utils/logger");
class WebSocketController {
    constructor(io, routeService) {
        this.io = io;
        this.routeService = routeService;
        this.logger = new logger_1.Logger('WebSocketController');
    }
    initialize() {
        this.io.on('connection', (socket) => {
            this.logger.info(`WebSocket client connected: ${socket.id}`);
            socket.on('disconnect', () => {
                this.logger.info(`WebSocket client disconnected: ${socket.id}`);
            });
            socket.on('echo', (data) => {
                socket.emit('echo', data);
            });
        });
    }
}
exports.WebSocketController = WebSocketController;
//# sourceMappingURL=websocket.controller.js.map