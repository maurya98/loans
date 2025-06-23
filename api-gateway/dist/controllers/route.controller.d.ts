import { Router } from 'express';
import { RouteService } from '../services/route.service';
export declare class RouteController {
    private router;
    private routeService;
    private logger;
    constructor(routeService: RouteService);
    private initializeRoutes;
    private getRoutes;
    private createRoute;
    private updateRoute;
    private deleteRoute;
    getRouter(): Router;
}
//# sourceMappingURL=route.controller.d.ts.map