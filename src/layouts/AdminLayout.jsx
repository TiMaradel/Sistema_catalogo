import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout theme-admin">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
