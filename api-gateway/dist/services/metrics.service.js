"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const prom_client_1 = require("prom-client");
const logger_1 = require("../utils/logger");
class MetricsService {
    constructor() {
        this.isInitialized = false;
        this.logger = new logger_1.Logger('MetricsService');
    }
    async initialize() {
        try {
            (0, prom_client_1.collectDefaultMetrics)({ register: prom_client_1.register });
            this.initializeRequestMetrics();
            this.initializeCacheMetrics();
            this.initializeRateLimitMetrics();
            this.initializeCircuitBreakerMetrics();
            this.initializeDatabaseMetrics();
            this.initializeRedisMetrics();
            this.isInitialized = true;
            this.logger.info('Metrics service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize metrics service:', error);
            throw error;
        }
    }
    initializeRequestMetrics() {
        this.requestCounter = new prom_client_1.Counter({
            name: 'api_gateway_requests_total',
            help: 'Total number of API requests',
            labelNames: ['method', 'path', 'status_code', 'service']
        });
        this.requestDuration = new prom_client_1.Histogram({
            name: 'api_gateway_request_duration_seconds',
            help: 'Request duration in seconds',
            labelNames: ['method', 'path', 'service'],
            buckets: [0.1, 0.5, 1, 2, 5, 10]
        });
        this.activeRequests = new prom_client_1.Gauge({
            name: 'api_gateway_active_requests',
            help: 'Number of active requests'
        });
        this.errorCounter = new prom_client_1.Counter({
            name: 'api_gateway_errors_total',
            help: 'Total number of errors',
            labelNames: ['type', 'service']
        });
    }
    initializeCacheMetrics() {
        this.cacheHits = new prom_client_1.Counter({
            name: 'api_gateway_cache_hits_total',
            help: 'Total number of cache hits'
        });
        this.cacheMisses = new prom_client_1.Counter({
            name: 'api_gateway_cache_misses_total',
            help: 'Total number of cache misses'
        });
        this.cacheSize = new prom_client_1.Gauge({
            name: 'api_gateway_cache_size',
            help: 'Current cache size'
        });
    }
    initializeRateLimitMetrics() {
        this.rateLimitExceeded = new prom_client_1.Counter({
            name: 'api_gateway_rate_limit_exceeded_total',
            help: 'Total number of rate limit violations',
            labelNames: ['client_id', 'endpoint']
        });
        this.rateLimitRemaining = new prom_client_1.Gauge({
            name: 'api_gateway_rate_limit_remaining',
            help: 'Remaining requests for rate limit',
            labelNames: ['client_id', 'endpoint']
        });
    }
    initializeCircuitBreakerMetrics() {
        this.circuitBreakerTrips = new prom_client_1.Counter({
            name: 'api_gateway_circuit_breaker_trips_total',
            help: 'Total number of circuit breaker trips',
            labelNames: ['service']
        });
        this.circuitBreakerState = new prom_client_1.Gauge({
            name: 'api_gateway_circuit_breaker_state',
            help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
            labelNames: ['service']
        });
    }
    initializeDatabaseMetrics() {
        this.dbConnections = new prom_client_1.Gauge({
            name: 'api_gateway_db_connections',
            help: 'Number of active database connections'
        });
        this.dbQueryDuration = new prom_client_1.Histogram({
            name: 'api_gateway_db_query_duration_seconds',
            help: 'Database query duration in seconds',
            labelNames: ['operation'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
        });
        this.dbErrors = new prom_client_1.Counter({
            name: 'api_gateway_db_errors_total',
            help: 'Total number of database errors',
            labelNames: ['operation']
        });
    }
    initializeRedisMetrics() {
        this.redisConnections = new prom_client_1.Gauge({
            name: 'api_gateway_redis_connections',
            help: 'Number of active Redis connections'
        });
        this.redisOperations = new prom_client_1.Counter({
            name: 'api_gateway_redis_operations_total',
            help: 'Total number of Redis operations',
            labelNames: ['operation']
        });
        this.redisErrors = new prom_client_1.Counter({
            name: 'api_gateway_redis_errors_total',
            help: 'Total number of Redis errors',
            labelNames: ['operation']
        });
    }
    incrementRequest(method, path, statusCode, service) {
        if (this.isInitialized) {
            this.requestCounter.inc({ method, path, status_code: statusCode.toString(), service: service || 'unknown' });
        }
    }
    recordRequestDuration(method, path, duration, service) {
        if (this.isInitialized) {
            this.requestDuration.observe({ method, path, service: service || 'unknown' }, duration);
        }
    }
    setActiveRequests(count) {
        if (this.isInitialized) {
            this.activeRequests.set(count);
        }
    }
    incrementError(type, service) {
        if (this.isInitialized) {
            this.errorCounter.inc({ type, service: service || 'unknown' });
        }
    }
    incrementCacheHit() {
        if (this.isInitialized) {
            this.cacheHits.inc();
        }
    }
    incrementCacheMiss() {
        if (this.isInitialized) {
            this.cacheMisses.inc();
        }
    }
    setCacheSize(size) {
        if (this.isInitialized) {
            this.cacheSize.set(size);
        }
    }
    incrementRateLimitExceeded(clientId, endpoint) {
        if (this.isInitialized) {
            this.rateLimitExceeded.inc({ client_id: clientId, endpoint });
        }
    }
    setRateLimitRemaining(clientId, endpoint, remaining) {
        if (this.isInitialized) {
            this.rateLimitRemaining.set({ client_id: clientId, endpoint }, remaining);
        }
    }
    incrementCircuitBreakerTrip(service) {
        if (this.isInitialized) {
            this.circuitBreakerTrips.inc({ service });
        }
    }
    setCircuitBreakerState(service, state) {
        if (this.isInitialized) {
            const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2;
            this.circuitBreakerState.set({ service }, stateValue);
        }
    }
    setDbConnections(count) {
        if (this.isInitialized) {
            this.dbConnections.set(count);
        }
    }
    recordDbQueryDuration(operation, duration) {
        if (this.isInitialized) {
            this.dbQueryDuration.observe({ operation }, duration);
        }
    }
    incrementDbError(operation) {
        if (this.isInitialized) {
            this.dbErrors.inc({ operation });
        }
    }
    setRedisConnections(count) {
        if (this.isInitialized) {
            this.redisConnections.set(count);
        }
    }
    incrementRedisOperation(operation) {
        if (this.isInitialized) {
            this.redisOperations.inc({ operation });
        }
    }
    incrementRedisError(operation) {
        if (this.isInitialized) {
            this.redisErrors.inc({ operation });
        }
    }
    async getMetrics() {
        try {
            return await prom_client_1.register.metrics();
        }
        catch (error) {
            this.logger.error('Error collecting metrics:', error);
            throw error;
        }
    }
    async getMetricsAsJson() {
        try {
            return await prom_client_1.register.getMetricsAsJSON();
        }
        catch (error) {
            this.logger.error('Error collecting metrics as JSON:', error);
            throw error;
        }
    }
    async shutdown() {
        try {
            await prom_client_1.register.clear();
            this.logger.info('Metrics service shutdown successfully');
        }
        catch (error) {
            this.logger.error('Error shutting down metrics service:', error);
            throw error;
        }
    }
    isReady() {
        return this.isInitialized;
    }
}
exports.MetricsService = MetricsService;
//# sourceMappingURL=metrics.service.js.map