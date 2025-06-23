'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { apiGateway, apiHelpers, Metrics as MetricsType } from '../utils/api'

interface MetricsData extends MetricsType {
  lastUpdated: Date
}

export default function Metrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const metricsData = await apiHelpers.getFormattedMetrics()
      if (metricsData) {
        setMetrics({
          ...metricsData,
          lastUpdated: new Date()
        })
      } else {
        setError('Failed to fetch metrics data')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
    } else if (current < previous) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
    }
    return null
  }

  const getErrorRate = () => {
    if (!metrics) return 0
    const total = metrics.requests.total
    const failed = metrics.requests.failed
    return total > 0 ? (failed / total) * 100 : 0
  }

  const getSuccessRate = () => {
    if (!metrics) return 0
    const total = metrics.requests.total
    const successful = metrics.requests.successful
    return total > 0 ? (successful / total) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metrics & Analytics</h1>
          <p className="text-gray-600">Real-time performance metrics and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
          >
            <ClockIcon className="w-5 h-5" />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Key Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total Requests</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(metrics.requests.total)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Last updated: {metrics.lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Success Rate</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {getSuccessRate().toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {formatNumber(metrics.requests.successful)} successful
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">Error Rate</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {getErrorRate().toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {formatNumber(metrics.requests.failed)} failed
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Avg Response Time</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatResponseTime(metrics.responseTime.average)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              P95: {formatResponseTime(metrics.responseTime.p95)}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Statistics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Requests</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatNumber(metrics.requests.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Successful Requests</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatNumber(metrics.requests.successful)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${getSuccessRate()}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Failed Requests</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatNumber(metrics.requests.failed)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${getErrorRate()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Time Statistics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Response Time</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatResponseTime(metrics.responseTime.average)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((metrics.responseTime.average / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">95th Percentile</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatResponseTime(metrics.responseTime.p95)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((metrics.responseTime.p95 / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">99th Percentile</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatResponseTime(metrics.responseTime.p99)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((metrics.responseTime.p99 / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Statistics */}
      {metrics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{metrics.routes.total}</p>
              <p className="text-sm text-gray-600">Total Routes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{metrics.routes.active}</p>
              <p className="text-sm text-gray-600">Active Routes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {metrics.routes.total > 0 ? ((metrics.routes.active / metrics.routes.total) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">Active Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Statistics */}
      {metrics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-bold text-red-600">{getErrorRate().toFixed(2)}%</p>
              <p className="text-sm text-gray-600">Error Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.errors.count)}</p>
              <p className="text-sm text-gray-600">Total Errors</p>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {metrics && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Last updated: {metrics.lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
} 