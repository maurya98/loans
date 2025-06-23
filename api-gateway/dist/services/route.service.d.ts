import { APIRoute } from '../models/api-route.entity';
export declare class RouteService {
    private repository;
    private logger;
    private databaseService;
    constructor();
    private getRepository;
    getAllRoutes(): Promise<APIRoute[]>;
    createRoute(routeData: Omit<APIRoute, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIRoute>;
    getRouteById(id: string): Promise<APIRoute | undefined>;
    updateRoute(id: string, update: Partial<APIRoute>): Promise<APIRoute | undefined>;
    deleteRoute(id: string): Promise<boolean>;
    findRoute(path: string, method: string): Promise<APIRoute | undefined>;
    findRoutesByBackend(backend: string): Promise<APIRoute[]>;
    findRoutesByPathPattern(pattern: string): Promise<APIRoute[]>;
    getRouteStats(): Promise<{
        total: number;
        byMethod: Record<string, number>;
        byBackend: Record<string, number>;
    }>;
}
//# sourceMappingURL=route.service.d.ts.map