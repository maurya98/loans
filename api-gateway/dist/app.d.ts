import { Application } from 'express';
import { Server as SocketIOServer } from 'socket.io';
export declare class App {
    private app;
    private logger;
    private routeService;
    private authenticationService;
    private cacheService;
    private loadBalancerService;
    private pluginService;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeErrorHandling;
    setupWebSocket(io: SocketIOServer): void;
    getApp(): Application;
}
//# sourceMappingURL=app.d.ts.map