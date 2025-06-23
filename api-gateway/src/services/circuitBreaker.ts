import { CircuitBreaker as CircuitBreakerType, CircuitBreakerConfig } from '../types';
import logger from '../utils/logger';

export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;

  constructor(
    private service: string,
    private config: CircuitBreakerConfig
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
        logger.info(`Circuit breaker for ${this.service} moved to half-open state`);
      } else {
        throw new Error(`Circuit breaker for ${this.service} is open`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.lastFailureTime = null as any;
    this.nextAttemptTime = null as any;
    
    if (this.state === 'half-open') {
      this.state = 'closed';
      logger.info(`Circuit breaker for ${this.service} moved to closed state`);
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.state === 'half-open') {
      this.state = 'open';
      this.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout);
      logger.warn(`Circuit breaker for ${this.service} moved to open state (half-open failure)`);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout);
      logger.warn(`Circuit breaker for ${this.service} moved to open state (threshold reached: ${this.failureCount})`);
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) return false;
    return Date.now() >= this.nextAttemptTime.getTime();
  }

  public getState(): CircuitBreakerType {
    return {
      id: this.service,
      serviceId: this.service,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime || null as any,
      nextAttemptTime: this.nextAttemptTime || null as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public isOpen(): boolean {
    return this.state === 'open';
  }

  public isHalfOpen(): boolean {
    return this.state === 'half-open';
  }

  public isClosed(): boolean {
    return this.state === 'closed';
  }

  public getFailureCount(): number {
    return this.failureCount;
  }

  public reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = null as any;
    this.nextAttemptTime = null as any;
    logger.info(`Circuit breaker for ${this.service} has been reset`);
  }

  public forceOpen(): void {
    this.state = 'open';
    this.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout);
    logger.warn(`Circuit breaker for ${this.service} has been forced open`);
  }

  public forceClose(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = null as any;
    this.nextAttemptTime = null as any;
    logger.info(`Circuit breaker for ${this.service} has been forced closed`);
  }
}

export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreaker>();

  constructor(private config: CircuitBreakerConfig) {}

  public getBreaker(service: string): CircuitBreaker {
    if (!this.breakers.has(service)) {
      this.breakers.set(service, new CircuitBreaker(service, this.config));
    }
    return this.breakers.get(service)!;
  }

  public async execute<T>(service: string, operation: () => Promise<T>): Promise<T> {
    const breaker = this.getBreaker(service);
    return breaker.execute(operation);
  }

  public getBreakerState(service: string): CircuitBreakerType | null {
    const breaker = this.breakers.get(service);
    return breaker ? breaker.getState() : null;
  }

  public getAllBreakerStates(): CircuitBreakerType[] {
    return Array.from(this.breakers.values()).map(breaker => breaker.getState());
  }

  public resetBreaker(service: string): void {
    const breaker = this.breakers.get(service);
    if (breaker) {
      breaker.reset();
    }
  }

  public resetAllBreakers(): void {
    this.breakers.forEach(breaker => breaker.reset());
    logger.info('All circuit breakers have been reset');
  }

  public removeBreaker(service: string): void {
    this.breakers.delete(service);
  }

  public getStats(): {
    totalBreakers: number;
    openBreakers: number;
    halfOpenBreakers: number;
    closedBreakers: number;
  } {
    let openCount = 0;
    let halfOpenCount = 0;
    let closedCount = 0;

    this.breakers.forEach(breaker => {
      if (breaker.isOpen()) openCount++;
      else if (breaker.isHalfOpen()) halfOpenCount++;
      else closedCount++;
    });

    return {
      totalBreakers: this.breakers.size,
      openBreakers: openCount,
      halfOpenBreakers: halfOpenCount,
      closedBreakers: closedCount
    };
  }
}

export default CircuitBreakerManager; 