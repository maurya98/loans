import { LoadBalancerNode, LoadBalancerConfig } from '../types';
import logger from '../utils/logger';

export class LoadBalancer {
  private nodes: LoadBalancerNode[] = [];
  private currentIndex = 0;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(private config: LoadBalancerConfig) {}

  public addNode(host: string, port: number, weight: number = 1): void {
    const node: LoadBalancerNode = {
      host,
      port,
      weight,
      isHealthy: true,
      activeConnections: 0,
      lastHealthCheck: new Date()
    };

    this.nodes.push(node);
    logger.info(`Added load balancer node: ${host}:${port}`);
  }

  public removeNode(host: string, port: number): void {
    const index = this.nodes.findIndex(node => node.host === host && node.port === port);
    if (index !== -1) {
      this.nodes.splice(index, 1);
      logger.info(`Removed load balancer node: ${host}:${port}`);
    }
  }

  public getNextNode(): LoadBalancerNode | null {
    const healthyNodes = this.nodes.filter(node => node.isHealthy);
    
    if (healthyNodes.length === 0) {
      logger.warn('No healthy nodes available');
      return null;
    }

    switch (this.config.algorithm) {
      case 'round-robin':
        return this.roundRobin(healthyNodes);
      case 'least-connections':
        return this.leastConnections(healthyNodes);
      case 'weighted':
        return this.weightedRoundRobin(healthyNodes);
      case 'ip-hash':
        return this.ipHash(healthyNodes);
      default:
        return this.roundRobin(healthyNodes);
    }
  }

  private roundRobin(nodes: LoadBalancerNode[]): LoadBalancerNode {
    const node = nodes[this.currentIndex % nodes.length]!;
    this.currentIndex = (this.currentIndex + 1) % nodes.length;
    return node;
  }

  private leastConnections(nodes: LoadBalancerNode[]): LoadBalancerNode {
    return nodes.reduce((min, node) => 
      node.activeConnections < min.activeConnections ? node : min
    );
  }

  private weightedRoundRobin(nodes: LoadBalancerNode[]): LoadBalancerNode {
    const totalWeight = nodes.reduce((sum, node) => sum + node.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const node of nodes) {
      random -= node.weight;
      if (random <= 0) {
        return node;
      }
    }
    
    return nodes[0]!;
  }

  private ipHash(nodes: LoadBalancerNode[]): LoadBalancerNode {
    // This is a simplified IP hash - in practice, you'd get the client IP
    const hash = Math.floor(Math.random() * 1000);
    return nodes[hash % nodes.length]!;
  }

  public incrementConnections(host: string, port: number): void {
    const node = this.nodes.find(n => n.host === host && n.port === port);
    if (node) {
      node.activeConnections++;
    }
  }

  public decrementConnections(host: string, port: number): void {
    const node = this.nodes.find(n => n.host === host && n.port === port);
    if (node && node.activeConnections > 0) {
      node.activeConnections--;
    }
  }

  public async startHealthChecks(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    logger.info('Started health checks for load balancer');
  }

  public stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null as any;
      logger.info('Stopped health checks for load balancer');
    }
  }

  private async performHealthChecks(): Promise<void> {
    const promises = this.nodes.map(node => this.checkNodeHealth(node));
    await Promise.all(promises);
  }

  private async checkNodeHealth(node: LoadBalancerNode): Promise<void> {
    try {
      const response = await fetch(`http://${node.host}:${node.port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.healthCheckTimeout)
      });

      node.lastHealthCheck = new Date();

      if (response.ok) {
        if (!node.isHealthy) {
          logger.info(`Node ${node.host}:${node.port} is now healthy`);
        }
        node.isHealthy = true;
      } else {
        if (node.isHealthy) {
          logger.warn(`Node ${node.host}:${node.port} is now unhealthy (status: ${response.status})`);
        }
        node.isHealthy = false;
      }
    } catch (error) {
      node.lastHealthCheck = new Date();
      if (node.isHealthy) {
        logger.warn(`Node ${node.host}:${node.port} is now unhealthy: ${error}`);
      }
      node.isHealthy = false;
    }
  }

  public getNodes(): LoadBalancerNode[] {
    return [...this.nodes];
  }

  public getHealthyNodes(): LoadBalancerNode[] {
    return this.nodes.filter(node => node.isHealthy);
  }

  public getUnhealthyNodes(): LoadBalancerNode[] {
    return this.nodes.filter(node => !node.isHealthy);
  }

  public getStats(): {
    totalNodes: number;
    healthyNodes: number;
    unhealthyNodes: number;
    totalConnections: number;
  } {
    const totalConnections = this.nodes.reduce((sum, node) => sum + node.activeConnections, 0);
    
    return {
      totalNodes: this.nodes.length,
      healthyNodes: this.getHealthyNodes().length,
      unhealthyNodes: this.getUnhealthyNodes().length,
      totalConnections
    };
  }

  public destroy(): void {
    this.stopHealthChecks();
    this.nodes = [];
  }
}

export default LoadBalancer; 