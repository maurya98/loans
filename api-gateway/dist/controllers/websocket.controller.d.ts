import { Server as SocketIOServer } from 'socket.io';
import { RouteService } from '../services/route.service';
export declare class WebSocketController {
    private io;
    private routeService;
    private logger;
    constructor(io: SocketIOServer, routeService: RouteService);
    initialize(): void;
}
//# sourceMappingURL=websocket.controller.d.ts.map