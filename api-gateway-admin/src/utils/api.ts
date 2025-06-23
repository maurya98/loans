import axios, { AxiosResponse } from 'axios'

// Note: Backend CORS configuration should allow:
// - Origin: http://localhost:3001 (your frontend)
// - Methods: GET, POST, PUT, DELETE, OPTIONS
// - Headers: Content-Type, Authorization
// - Credentials: false (since we're not using withCredentials)

// Logger utility for API debugging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[API] ${message}`, data ? data : '')
  },
  error: (message: string, error?: any) => {
    console.error(`[API ERROR] ${message}`, error ? error : '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`[API WARN] ${message}`, data ? data : '')
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API DEBUG] ${message}`, data ? data : '')
    }
  }
}

// API Gateway base URL
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3010'

logger.info(`API Gateway URL: ${API_GATEWAY_URL}`)

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_GATEWAY_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token and log requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    logger.debug('Request with auth token', { url: config.url, method: config.method })
  } else {
    logger.debug('Request without auth token', { url: config.url, method: config.method })
  }
  
  logger.info(`Making ${config.method?.toUpperCase()} request to ${config.url}`, {
    data: config.data,
    params: config.params
  })
  
  return config
})

// Add response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    logger.info(`Response received from ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    })
    return response
  },
  (error) => {
    logger.error(`Request failed for ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      logger.warn('Unauthorized access detected, redirecting to login')
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types for API responses
export interface Route {
  id: string
  path: string
  method: string
  backend: string
  authentication: boolean
  rateLimit?: {
    limit: number
    window: number
  }
  cache?: {
    ttl: number
  }
  headers: Record<string, string>
  pathRewrite: Record<string, string>
  isActive: boolean
  priority: number
  description: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string
  createdAt: string
}

export interface APIKey {
  id: string
  name: string
  key: string
  userId: string
  permissions: string[]
  isActive: boolean
  createdAt: string
  lastUsed: string
}

export interface HealthStatus {
  status: string
  uptime: number
  timestamp: number
  message: string
}

export interface Metrics {
  requests: {
    total: number
    successful: number
    failed: number
  }
  responseTime: {
    average: number
    p95: number
    p99: number
  }
  routes: {
    active: number
    total: number
  }
  errors: {
    rate: number
    count: number
  }
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

// API Gateway endpoints
export const apiGateway = {
  // Health check
  health: {
    check: (): Promise<AxiosResponse<string>> => 
      api.get('/health'),
  },

  // Metrics
  metrics: {
    get: (): Promise<AxiosResponse<any>> => 
      api.get('/metrics/json'),
  },

  // Authentication
  auth: {
    login: (credentials: { username: string; password: string }): Promise<AxiosResponse<AuthResponse>> =>
      api.post('/auth/login', credentials),
    
    refresh: (refreshToken: string): Promise<AxiosResponse<{ token: string }>> =>
      api.post('/auth/refresh', { refreshToken }),
    
    me: (): Promise<AxiosResponse<{ user: User }>> =>
      api.get('/auth/me'),
  },

  // Route management
  routes: {
    getAll: (): Promise<AxiosResponse<Route[]>> =>
      api.get('/api/routes'),
    
    create: (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<AxiosResponse<Route>> =>
      api.post('/api/routes', route),
    
    update: (id: string, route: Partial<Route>): Promise<AxiosResponse<Route>> =>
      api.put(`/api/routes/${id}`, route),
    
    delete: (id: string): Promise<AxiosResponse<void>> =>
      api.delete(`/api/routes/${id}`),
  },

  // API Documentation
  docs: {
    get: (): Promise<AxiosResponse<any>> =>
      api.get('/api-docs'),
  },
}

// Helper functions for common operations
export const apiHelpers = {
  // Check if API gateway is reachable
  isReachable: async (): Promise<boolean> => {
    logger.info('Checking API gateway reachability')
    try {
      const response = await apiGateway.health.check()
      const healthData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
      logger.info('API gateway is reachable', { status: healthData.status })
      return true
    } catch (error) {
      logger.error('API gateway is not reachable', error)
      return false
    }
  },

  // Get formatted metrics
  getFormattedMetrics: async (): Promise<Metrics | null> => {
    logger.info('Fetching metrics from API gateway')
    try {
      const response = await apiGateway.metrics.get()
      logger.debug('Raw metrics response received', { dataLength: response.data.length })
      
      // Parse the new JSON metrics format
      const metricsData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
      
        console.log(">>>>>>>>>>>>>>>>>>>>>>>", metricsData);
      logger.debug('Parsed metrics data', { metricsCount: metricsData.length })
      
      const metrics: Metrics = {
        requests: { total: 0, successful: 0, failed: 0 },
        responseTime: { average: 0, p95: 0, p99: 0 },
        routes: { active: 0, total: 0 },
        errors: { rate: 0, count: 0 }
      }

      // Parse metrics from the new JSON format
      metricsData.forEach((metric: any) => {
        const metricName = metric.name;
        const metricValue = metric.values?.[0]?.value || 0;
        
        logger.debug(`Processing metric: ${metricName}`, { value: metricValue })
        
        switch (metricName) {
          case 'api_gateway_requests_total':
            metrics.requests.total = metricValue;
            break;
          case 'api_gateway_errors_total':
            metrics.errors.count = metricValue;
            break;
          case 'api_gateway_request_duration_seconds':
            // For histogram metrics, we need to calculate average from sum/count
            const sumMetric = metric.values?.find((v: any) => v.metricName === 'api_gateway_request_duration_seconds_sum');
            const countMetric = metric.values?.find((v: any) => v.metricName === 'api_gateway_request_duration_seconds_count');
            if (sumMetric && countMetric && countMetric.value > 0) {
              metrics.responseTime.average = (sumMetric.value / countMetric.value) * 1000; // Convert to ms
            }
            break;
          case 'api_gateway_active_requests':
            // This could represent active routes or requests
            metrics.routes.active = metricValue;
            break;
          case 'api_gateway_cache_hits_total':
            // Cache hits could be used to calculate success rate
            break;
          case 'api_gateway_cache_misses_total':
            // Cache misses could be used to calculate failure rate
            break;
        }
      });

      // Calculate derived metrics
      if (metrics.requests.total > 0) {
        metrics.requests.successful = metrics.requests.total - metrics.errors.count;
        metrics.errors.rate = (metrics.errors.count / metrics.requests.total) * 100;
      }

      // Set default values for missing metrics
      if (metrics.routes.total === 0) {
        metrics.routes.total = metrics.routes.active; // Assume all active routes are total for now
      }

      logger.info('Metrics parsed successfully', metrics)
      return metrics
    } catch (error) {
      logger.error('Failed to fetch or parse metrics', error)
      return null
    }
  },

  // Validate API gateway connection
  validateConnection: async (): Promise<{ connected: boolean; error?: string }> => {
    logger.info('Validating API gateway connection')
    try {
      const healthResponse = await apiGateway.health.check();
      const healthData = typeof healthResponse.data === 'string' 
        ? JSON.parse(healthResponse.data) 
        : healthResponse.data;
      const isConnected = healthData.status === 'ok'
      logger.info('Connection validation result', { 
        connected: isConnected, 
        status: healthData.status 
      })
      return { connected: isConnected }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect to API Gateway'
      logger.error('Connection validation failed', { error: errorMessage })
      return { 
        connected: false, 
        error: errorMessage
      }
    }
  }
}

export default api 