'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface DashboardStats {
  totalRequests: number
  activeRoutes: number
  errorRate: number
  avgResponseTime: number
  requestsPerMinute: number
  uptime: number
}

const mockStats: DashboardStats = {
  totalRequests: 15420,
  activeRoutes: 24,
  errorRate: 2.3,
  avgResponseTime: 145,
  requestsPerMinute: 342,
  uptime: 99.8
}

const mockTimeSeriesData = [
  { time: '00:00', requests: 120, errors: 2 },
  { time: '01:00', requests: 95, errors: 1 },
  { time: '02:00', requests: 80, errors: 0 },
  { time: '03:00', requests: 65, errors: 1 },
  { time: '04:00', requests: 45, errors: 0 },
  { time: '05:00', requests: 60, errors: 1 },
  { time: '06:00', requests: 110, errors: 2 },
  { time: '07:00', requests: 180, errors: 3 },
  { time: '08:00', requests: 250, errors: 4 },
  { time: '09:00', requests: 320, errors: 5 },
  { time: '10:00', requests: 380, errors: 6 },
  { time: '11:00', requests: 420, errors: 7 },
]

const mockRouteData = [
  { route: '/api/users', requests: 1250, avgTime: 120 },
  { route: '/api/products', requests: 980, avgTime: 95 },
  { route: '/api/orders', requests: 750, avgTime: 180 },
  { route: '/api/auth', requests: 620, avgTime: 85 },
  { route: '/api/health', requests: 450, avgTime: 45 },
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">API Gateway overview and performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowUpIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRoutes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.errorRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowUpIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Requests/Min</p>
              <p className="text-2xl font-bold text-gray-900">{stats.requestsPerMinute}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uptime}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Routes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockRouteData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">New route added: /api/analytics</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Added</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Rate limit exceeded for /api/users</p>
              <p className="text-xs text-gray-500">5 minutes ago</p>
            </div>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Warning</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Authentication failed for user: john.doe</p>
              <p className="text-xs text-gray-500">8 minutes ago</p>
            </div>
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Error</span>
          </div>
        </div>
      </div>
    </div>
  )
} 