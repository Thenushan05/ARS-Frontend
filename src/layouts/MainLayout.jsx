import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'

/**
 * Shell for every authenticated staff screen (§3): sidebar + header around
 * a scrollable content area. Feature pages render via <Outlet/> and build
 * their own <PageHeader/> for the title/breadcrumb/actions row.
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="scrollbar-thin flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
