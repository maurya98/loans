'use client'

import { 
  HomeIcon, 
  MapIcon, 
  ChartBarIcon, 
  ShieldCheckIcon, 
  HeartIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const navigation = [
  { name: 'Dashboard', tab: 'dashboard', icon: HomeIcon },
  { name: 'Routes', tab: 'routes', icon: MapIcon },
  { name: 'Metrics', tab: 'metrics', icon: ChartBarIcon },
  { name: 'Authentication', tab: 'auth', icon: ShieldCheckIcon },
  { name: 'Health', tab: 'health', icon: HeartIcon },
  { name: 'Settings', tab: 'settings', icon: CogIcon },
]

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 bg-blue-600">
        <h1 className="text-xl font-bold text-white">API Gateway Admin</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
} 