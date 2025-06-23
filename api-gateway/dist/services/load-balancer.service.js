"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancerService = void 0;
class LoadBalancerService {
    constructor() {
        this.targets = {};
        this.index = {};
    }
    async getTarget(service) {
        const list = this.targets[service] || [service];
        if (!this.index[service])
            this.index[service] = 0;
        const idx = this.index[service];
        this.index[service] = (idx + 1) % list.length;
        return { url: list[idx] || '' };
    }
    async addTarget(service, url) {
        if (!this.targets[service])
            this.targets[service] = [];
        this.targets[service].push(url);
    }
}
exports.LoadBalancerService = LoadBalancerService;
//# sourceMappingURL=load-balancer.service.js.map