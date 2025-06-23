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

export interface HistoricalAnalytics {
  totalRequests: number;
  uniqueUsers: number;
  averageResponseTime: number;
  errorRate: number;
  topRoutes: Array<{
    path: string;
    count: number;
    averageResponseTime: number;
  }>;
  statusCodeDistribution: Record<string, number>;
  timeSeriesData: Array<{
    timestamp: string;
    requests: number;
    errors: number;
    averageResponseTime: number;
  }>;
}

export interface RealtimeAnalytics {
  currentRequests: number;
  requestsPerSecond: number;
  activeUsers: number;
  recentRequests: Array<{
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
  }>;
  errorCount: number;
  averageResponseTime: number;
}

export interface RouteAnalytics {
  routeId: string;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  requestsPerHour: number;
  topUsers: Array<{
    userId: string;
    requestCount: number;
  }>;
  statusCodeDistribution: Record<string, number>;
}

export interface PerformanceMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  average: number;
  min: number;
  max: number;
} 