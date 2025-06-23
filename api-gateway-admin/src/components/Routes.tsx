'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { apiGateway, Route } from '../utils/api'

export default function Routes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    path: '',
    method: 'GET',
    backend: '',
    authentication: false,
    rateLimit: { limit: 100, window: 60000 },
    cache: { ttl: 300 },
    headers: {},
    pathRewrite: {},
    isActive: true,
    priority: 1,
    description: ''
  })

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiGateway.routes.getAll()
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setRoutes(response.data)
      } else if (response.data && typeof response.data === 'object' && 'routes' in response.data && Array.isArray((response.data as any).routes)) {
        // If the API returns { routes: [...] }
        setRoutes((response.data as any).routes)
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) {
        // If the API returns { data: [...] }
        setRoutes((response.data as any).data)
      } else {
        // If response.data is not an array, set empty array and log the structure
        console.warn('Unexpected API response structure:', response.data)
        setRoutes([])
        setError('Invalid response format from server')
      }
    } catch (err: any) {
      console.error('Error fetching routes:', err)
      setError(err.message || 'Failed to fetch routes')
      
      // For development/testing, provide some mock data when API is not available
      if (err.code === 'ERR_NETWORK' || err.message?.includes('fetch')) {
        console.log('API not available, using mock data for development')
        setRoutes([
          {
            id: '1',
            path: '/api/users',
            method: 'GET',
            backend: 'http://user-service:3001',
            authentication: true,
            rateLimit: { limit: 100, window: 60000 },
            cache: { ttl: 300 },
            headers: {},
            pathRewrite: {},
            isActive: true,
            priority: 1,
            description: 'Get user information',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            path: '/api/products',
            method: 'GET',
            backend: 'http://product-service:3002',
            authentication: false,
            rateLimit: { limit: 200, window: 60000 },
            cache: { ttl: 600 },
            headers: {},
            pathRewrite: {},
            isActive: true,
            priority: 2,
            description: 'Get product catalog',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        setError(null) // Clear error when using mock data
      } else {
        setRoutes([]) // Ensure routes is always an array
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingRoute) {
        // Update existing route
        const response = await apiGateway.routes.update(editingRoute.id, formData)
        setRoutes(Array.isArray(routes) ? routes.map(route => 
          route.id === editingRoute.id ? response.data : route
        ) : [])
      } else {
        // Create new route
        const response = await apiGateway.routes.create(formData)
        setRoutes(Array.isArray(routes) ? [...routes, response.data] : [response.data])
      }
      setShowModal(false)
      setEditingRoute(null)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save route')
    }
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    setFormData({
      path: route.path,
      method: route.method,
      backend: route.backend,
      authentication: route.authentication,
      rateLimit: route.rateLimit || { limit: 100, window: 60000 },
      cache: route.cache || { ttl: 300 },
      headers: route.headers,
      pathRewrite: route.pathRewrite,
      isActive: route.isActive,
      priority: route.priority,
      description: route.description
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await apiGateway.routes.delete(id)
        setRoutes(Array.isArray(routes) ? routes.filter(route => route.id !== id) : [])
      } catch (err: any) {
        setError(err.message || 'Failed to delete route')
      }
    }
  }

  const toggleActive = async (id: string) => {
    try {
      const route = Array.isArray(routes) ? routes.find(r => r.id === id) : null
      if (route) {
        const response = await apiGateway.routes.update(id, { isActive: !route.isActive })
        setRoutes(Array.isArray(routes) ? routes.map(r => r.id === id ? response.data : r) : [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update route status')
    }
  }

  const resetForm = () => {
    setFormData({
      path: '',
      method: 'GET',
      backend: '',
      authentication: false,
      rateLimit: { limit: 100, window: 60000 },
      cache: { ttl: 300 },
      headers: {},
      pathRewrite: {},
      isActive: true,
      priority: 1,
      description: ''
    })
  }

  const handleAddRoute = () => {
    setEditingRoute(null)
    resetForm()
    setShowModal(true)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Routes</h1>
          <p className="text-gray-600">Manage your API gateway routes and configurations</p>
        </div>
        <button
          onClick={handleAddRoute}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Route</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading routes...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(routes) && routes.length > 0 ? (
                  routes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{route.path}</div>
                          <div className="text-sm text-gray-500">{route.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(route.method)}`}>
                          {route.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {route.backend}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          route.authentication 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {route.authentication ? 'Required' : 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(route.id)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            route.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {route.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(route)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(route.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {Array.isArray(routes) ? 'No routes found' : 'Loading routes...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Route Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Path
                    </label>
                    <input
                      type="text"
                      value={formData.path}
                      onChange={(e) => setFormData({...formData, path: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="/api/example"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Method
                    </label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({...formData, method: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backend URL
                  </label>
                  <input
                    type="url"
                    value={formData.backend}
                    onChange={(e) => setFormData({...formData, backend: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="http://backend-service:3000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Route description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate Limit
                    </label>
                    <input
                      type="number"
                      value={formData.rateLimit.limit}
                      onChange={(e) => setFormData({
                        ...formData, 
                        rateLimit: {...formData.rateLimit, limit: parseInt(e.target.value)}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cache TTL (seconds)
                    </label>
                    <input
                      type="number"
                      value={formData.cache.ttl}
                      onChange={(e) => setFormData({
                        ...formData, 
                        cache: {...formData.cache, ttl: parseInt(e.target.value)}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="300"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.authentication}
                      onChange={(e) => setFormData({...formData, authentication: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require Authentication</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingRoute(null)
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingRoute ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 