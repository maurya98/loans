export declare class LoadBalancerService {
    private targets;
    private index;
    getTarget(service: string): Promise<{
        url: string;
    }>;
    addTarget(service: string, url: string): Promise<void>;
}
//# sourceMappingURL=load-balancer.service.d.ts.map