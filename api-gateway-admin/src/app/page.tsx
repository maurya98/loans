'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import Routes from '@/components/Routes'
import Metrics from '@/components/Metrics'
import Authentication from '@/components/Authentication'
import Health from '@/components/Health'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'routes':
        return <Routes />
      case 'metrics':
        return <Metrics />
      case 'auth':
        return <Authentication />
      case 'health':
        return <Health />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
} 