import { NavLink, Outlet } from 'react-router-dom'
import { Bell, CalendarClock, FileText, Home, Wallet } from 'lucide-react'
import { cn } from '@/utils/cn'

const PORTAL_NAV = [
  { key: 'home', label: 'Home', icon: Home, to: '/portal' },
  { key: 'documents', label: 'Documents', icon: FileText, to: '/portal/documents' },
  { key: 'payments', label: 'Payments', icon: Wallet, to: '/portal/payments' },
  { key: 'appointments', label: 'Appointments', icon: CalendarClock, to: '/portal/appointments' },
]

/**
 * Customer-facing shell (§34) — mobile-first: simple top bar + bottom tab
 * bar rather than the dense sidebar used for staff. Pages under this
 * layout must never render internal notes, cost, or profit data (§7, §34);
 * that constraint lives with the customerPortal feature's API layer,
 * which should only ever call customer-scoped endpoints.
 */
export function CustomerPortalLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-surface-border bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            ARS
          </div>
          <p className="text-sm font-semibold text-slate-900">My Application</p>
        </div>
        <button className="text-slate-500" aria-label="Notifications">
          <Bell className="size-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex h-16 w-full max-w-lg items-center justify-around border-t border-surface-border bg-white">
        {PORTAL_NAV.map(({ key, label, icon: Icon, to }) => (
          <NavLink
            key={key}
            to={to}
            end={to === '/portal'}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 px-3 py-1 text-xs', isActive ? 'text-brand-600' : 'text-slate-500')
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
