import { Request } from 'express';

// Export all models
export * from '../models/Route';
export * from '../models/Service';
export * from '../models/User';
export * from '../models/Analytics';

// Configuration types
export interface ServerConfig {
  host: string;
  port: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
}

export interface JWTConfig {
  secret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthCheckInterval: number;
  healthCheckTimeout: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export interface CORSConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  contact: {
    name: string;
    email: string;
  };
}

export interface AppConfig {
  env: string;
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JWTConfig;
  rateLimit: RateLimitConfig;
  loadBalancer: LoadBalancerConfig;
  circuitBreaker: CircuitBreakerConfig;
  cors: CORSConfig;
  swagger: SwaggerConfig;
}

// Plugin types
export interface Plugin {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface PluginContext {
  request: any;
  response: any;
  route: any;
  user?: any;
}

export interface PluginResult {
  shouldContinue: boolean;
  modifiedRequest?: any;
  modifiedResponse?: any;
  error?: string;
}

export type PluginHandler = (context: PluginContext) => Promise<PluginResult>;

// Request/Response types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  startTime?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoggingConfig {
  level: string;
  filePath: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  port: number;
}

export interface SecurityConfig {
  bcryptRounds: number;
  sessionSecret: string;
}

export interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JWTConfig;
  rateLimit: RateLimitConfig;
  loadBalancer: LoadBalancerConfig;
  circuitBreaker: CircuitBreakerConfig;
  logging: LoggingConfig;
  cors: CORSConfig;
  swagger: SwaggerConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Route {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  upstream: string;
  loadBalancer: LoadBalancerConfig;
  rateLimit?: RateLimitConfig;
  authentication: boolean;
  authorization?: string[];
  plugins: Plugin[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestLog {
  id: string;
  routeId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string;
  userId?: string;
  timestamp: Date;
}

export interface Metrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  activeConnections: number;
}

export interface HealthCheck {
  id: string;
  serviceId: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  checkedAt: Date;
}

export interface CircuitBreaker {
  id: string;
  serviceId: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadBalancerNode {
  host: string;
  port: number;
  weight: number;
  isHealthy: boolean;
  activeConnections: number;
  lastHealthCheck: Date;
}

export interface RateLimitInfo {
  key: string;
  remaining: number;
  resetTime: Date;
  limit: number;
}

export interface AuthenticationResult {
  isValid: boolean;
  user?: User;
  error?: string;
}

export interface AuthorizationResult {
  isAuthorized: boolean;
  error?: string;
}

export interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timeout: number;
}

export interface ProxyResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
}

export interface MiddlewareContext {
  req: any;
  res: any;
  next: any;
  route: Route;
  user?: User;
  startTime: number;
}

export interface PluginDefinition {
  name: string;
  version: string;
  description: string;
  author: string;
  configSchema: Record<string, any>;
  handler: PluginHandler;
}

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

export interface TransformConfig {
  requestTransform?: string;
  responseTransform?: string;
  headersTransform?: Record<string, string>;
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
}

export interface ValidationConfig {
  request: ValidationRule[];
  response: ValidationRule[];
}

export interface MonitoringData {
  timestamp: Date;
  metrics: Metrics;
  healthChecks: HealthCheck[];
  circuitBreakers: CircuitBreaker[];
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  service?: string;
  timestamp: Date;
  isResolved: boolean;
  resolvedAt?: Date;
}

export interface DashboardData {
  metrics: Metrics;
  recentRequests: RequestLog[];
  activeAlerts: Alert[];
  serviceHealth: HealthCheck[];
} 