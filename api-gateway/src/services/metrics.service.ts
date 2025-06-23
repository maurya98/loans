import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { Logger } from '../utils/logger';

export class MetricsService {
  private logger: Logger;
  private isInitialized: boolean = false;

  // Request metrics
  private requestCounter!: Counter;
  private requestDuration!: Histogram;
  private activeRequests!: Gauge;
  private errorCounter!: Counter;

  // Cache metrics
  private cacheHits!: Counter;
  private cacheMisses!: Counter;
  private cacheSize!: Gauge;

  // Rate limiting metrics
  private rateLimitExceeded!: Counter;
  private rateLimitRemaining!: Gauge;

  // Circuit breaker metrics
  private circuitBreakerTrips!: Counter;
  private circuitBreakerState!: Gauge;

  // Database metrics
  private dbConnections!: Gauge;
  private dbQueryDuration!: Histogram;
  private dbErrors!: Counter;

  // Redis metrics
  private redisConnections!: Gauge;
  private redisOperations!: Counter;
  private redisErrors!: Counter;

  constructor() {
    this.logger = new Logger('MetricsService');
  }

  public async initialize(): Promise<void> {
    try {
      // Enable default metrics
      collectDefaultMetrics({ register });

      // Initialize custom metrics
      this.initializeRequestMetrics();
      this.initializeCacheMetrics();
      this.initializeRateLimitMetrics();
      this.initializeCircuitBreakerMetrics();
      this.initializeDatabaseMetrics();
      this.initializeRedisMetrics();

      this.isInitialized = true;
      this.logger.info('Metrics service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize metrics service:', error);
      throw error;
    }
  }

  private initializeRequestMetrics(): void {
    this.requestCounter = new Counter({
      name: 'api_gateway_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'path', 'status_code', 'service']
    });

    this.requestDuration = new Histogram({
      name: 'api_gateway_request_duration_seconds',
      help: 'Request duration in seconds',
      labelNames: ['method', 'path', 'service'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });

    this.activeRequests = new Gauge({
      name: 'api_gateway_active_requests',
      help: 'Number of active requests'
    });

    this.errorCounter = new Counter({
      name: 'api_gateway_errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'service']
    });
  }

  private initializeCacheMetrics(): void {
    this.cacheHits = new Counter({
      name: 'api_gateway_cache_hits_total',
      help: 'Total number of cache hits'
    });

    this.cacheMisses = new Counter({
      name: 'api_gateway_cache_misses_total',
      help: 'Total number of cache misses'
    });

    this.cacheSize = new Gauge({
      name: 'api_gateway_cache_size',
      help: 'Current cache size'
    });
  }

  private initializeRateLimitMetrics(): void {
    this.rateLimitExceeded = new Counter({
      name: 'api_gateway_rate_limit_exceeded_total',
      help: 'Total number of rate limit violations',
      labelNames: ['client_id', 'endpoint']
    });

    this.rateLimitRemaining = new Gauge({
      name: 'api_gateway_rate_limit_remaining',
      help: 'Remaining requests for rate limit',
      labelNames: ['client_id', 'endpoint']
    });
  }

  private initializeCircuitBreakerMetrics(): void {
    this.circuitBreakerTrips = new Counter({
      name: 'api_gateway_circuit_breaker_trips_total',
      help: 'Total number of circuit breaker trips',
      labelNames: ['service']
    });

    this.circuitBreakerState = new Gauge({
      name: 'api_gateway_circuit_breaker_state',
      help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
      labelNames: ['service']
    });
  }

  private initializeDatabaseMetrics(): void {
    this.dbConnections = new Gauge({
      name: 'api_gateway_db_connections',
      help: 'Number of active database connections'
    });

    this.dbQueryDuration = new Histogram({
      name: 'api_gateway_db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
    });

    this.dbErrors = new Counter({
      name: 'api_gateway_db_errors_total',
      help: 'Total number of database errors',
      labelNames: ['operation']
    });
  }

  private initializeRedisMetrics(): void {
    this.redisConnections = new Gauge({
      name: 'api_gateway_redis_connections',
      help: 'Number of active Redis connections'
    });

    this.redisOperations = new Counter({
      name: 'api_gateway_redis_operations_total',
      help: 'Total number of Redis operations',
      labelNames: ['operation']
    });

    this.redisErrors = new Counter({
      name: 'api_gateway_redis_errors_total',
      help: 'Total number of Redis errors',
      labelNames: ['operation']
    });
  }

  // Request metrics methods
  public incrementRequest(method: string, path: string, statusCode: number, service?: string): void {
    if (this.isInitialized) {
      this.requestCounter.inc({ method, path, status_code: statusCode.toString(), service: service || 'unknown' });
    }
  }

  public recordRequestDuration(method: string, path: string, duration: number, service?: string): void {
    if (this.isInitialized) {
      this.requestDuration.observe({ method, path, service: service || 'unknown' }, duration);
    }
  }

  public setActiveRequests(count: number): void {
    if (this.isInitialized) {
      this.activeRequests.set(count);
    }
  }

  public incrementError(type: string, service?: string): void {
    if (this.isInitialized) {
      this.errorCounter.inc({ type, service: service || 'unknown' });
    }
  }

  // Cache metrics methods
  public incrementCacheHit(): void {
    if (this.isInitialized) {
      this.cacheHits.inc();
    }
  }

  public incrementCacheMiss(): void {
    if (this.isInitialized) {
      this.cacheMisses.inc();
    }
  }

  public setCacheSize(size: number): void {
    if (this.isInitialized) {
      this.cacheSize.set(size);
    }
  }

  // Rate limiting metrics methods
  public incrementRateLimitExceeded(clientId: string, endpoint: string): void {
    if (this.isInitialized) {
      this.rateLimitExceeded.inc({ client_id: clientId, endpoint });
    }
  }

  public setRateLimitRemaining(clientId: string, endpoint: string, remaining: number): void {
    if (this.isInitialized) {
      this.rateLimitRemaining.set({ client_id: clientId, endpoint }, remaining);
    }
  }

  // Circuit breaker metrics methods
  public incrementCircuitBreakerTrip(service: string): void {
    if (this.isInitialized) {
      this.circuitBreakerTrips.inc({ service });
    }
  }

  public setCircuitBreakerState(service: string, state: 'closed' | 'open' | 'half-open'): void {
    if (this.isInitialized) {
      const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2;
      this.circuitBreakerState.set({ service }, stateValue);
    }
  }

  // Database metrics methods
  public setDbConnections(count: number): void {
    if (this.isInitialized) {
      this.dbConnections.set(count);
    }
  }

  public recordDbQueryDuration(operation: string, duration: number): void {
    if (this.isInitialized) {
      this.dbQueryDuration.observe({ operation }, duration);
    }
  }

  public incrementDbError(operation: string): void {
    if (this.isInitialized) {
      this.dbErrors.inc({ operation });
    }
  }

  // Redis metrics methods
  public setRedisConnections(count: number): void {
    if (this.isInitialized) {
      this.redisConnections.set(count);
    }
  }

  public incrementRedisOperation(operation: string): void {
    if (this.isInitialized) {
      this.redisOperations.inc({ operation });
    }
  }

  public incrementRedisError(operation: string): void {
    if (this.isInitialized) {
      this.redisErrors.inc({ operation });
    }
  }

  // Metrics collection
  public async getMetrics(): Promise<string> {
    try {
      return await register.metrics();
    } catch (error) {
      this.logger.error('Error collecting metrics:', error);
      throw error;
    }
  }

  public async getMetricsAsJson(): Promise<any> {
    try {
      return await register.getMetricsAsJSON();
    } catch (error) {
      this.logger.error('Error collecting metrics as JSON:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await register.clear();
      this.logger.info('Metrics service shutdown successfully');
    } catch (error) {
      this.logger.error('Error shutting down metrics service:', error);
      throw error;
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
} 