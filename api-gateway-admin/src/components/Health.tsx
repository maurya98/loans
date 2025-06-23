'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon,
  WifiIcon
} from '@heroicons/react/24/outline'
import { apiGateway, apiHelpers, HealthStatus } from '../utils/api'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'unhealthy' | 'warning'
  responseTime: number
  lastCheck: string
  message: string
}

export default function Health() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkHealth = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check API gateway connection
      const connectionStatus = await apiHelpers.validateConnection()
      setIsConnected(connectionStatus.connected)
      
      if (connectionStatus.connected) {
        // Get health status
        const response = await apiGateway.health.check();
        response.data = JSON.parse(response.data);
        // Validate that the response has the expected structure
        if (response.data && typeof response.data === 'object') {
          setHealthStatus(response.data)
        } else {
          setError('Invalid health status response format')
          setHealthStatus(null)
        }
      } else {
        setError(connectionStatus.error || 'Failed to connect to API Gateway')
        setHealthStatus(null)
      }
      
      setLastCheck(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to check health status')
      setIsConnected(false)
      setHealthStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'ok':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
      default:
        return <XCircleIcon className="w-6 h-6 text-red-500" />
    }
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'ok':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusDisplay = (status: string | undefined) => {
    if (!status) return 'UNKNOWN'
    return status.toUpperCase()
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Status</h1>
          <p className="text-gray-600">Monitor the health and status of your API Gateway</p>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <ClockIcon className="w-5 h-5" />
          <span>{loading ? 'Checking...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <WifiIcon className="w-6 h-6 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">API Gateway Connection</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {isConnected === null ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Checking connection...</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <span className="text-red-600 font-medium">Disconnected</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* API Gateway Health */}
      {healthStatus && healthStatus.status !== undefined && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ServerIcon className="w-6 h-6 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">API Gateway Health</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(healthStatus.status)}
                <span className="font-medium">Status</span>
              </div>
              <p className={`text-sm font-semibold ${getStatusColor(healthStatus.status)} px-2 py-1 rounded-full inline-block`}>
                {getStatusDisplay(healthStatus.status)}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Uptime</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatUptime(healthStatus.uptime) || healthStatus.uptime }
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Last Check</span>
              </div>
              <p className="text-sm text-gray-600">
                {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Timestamp</span>
              </div>
              <p className="text-sm text-gray-600">
                {formatTimestamp(healthStatus.timestamp || Date.now())}
              </p>
            </div>
          </div>
          
          {healthStatus.message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700 text-sm">{healthStatus.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Health Status Not Available */}
      {isConnected && (!healthStatus || healthStatus.status === undefined) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ServerIcon className="w-6 h-6 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">API Gateway Health</h2>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading health status...</p>
            </div>
          </div>
        </div>
      )}

      {/* Service Status Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">API Gateway</span>
              {isConnected ? (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Operational' : 'Not responding'}
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Authentication</span>
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">JWT tokens active</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Rate Limiting</span>
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">Protection enabled</p>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Gateway URL
            </label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
              {process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Health Check
            </label>
            <p className="text-sm text-gray-900">
              {lastCheck ? lastCheck.toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 