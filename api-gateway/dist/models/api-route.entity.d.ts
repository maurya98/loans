export declare class APIRoute {
    id: string;
    path: string;
    method: string;
    backend: string;
    authentication: boolean;
    rateLimit: any;
    cache: any;
    headers: Record<string, string>;
    pathRewrite: Record<string, string>;
    isActive: boolean;
    priority: number;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=api-route.entity.d.ts.map