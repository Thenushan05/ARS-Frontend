import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { MENU_ITEMS } from '@/constants/menuConfig'
import { usePermission } from '@/hooks/usePermission'
import { cn } from '@/utils/cn'

/**
 * Left navigation (§3). Menu items are filtered by permission — this is
 * UX convenience only, the matching route is separately guarded by
 * <PermissionRoute> in routes/AppRoutes.jsx (§6, §37).
 *
 * Renders as a static column on desktop and an off-canvas drawer on
 * tablet/mobile, controlled by `isOpen`/`onClose` from MainLayout.
 */
export function AppSidebar({ isOpen, onClose }) {
  const { can } = usePermission()
  const visibleItems = MENU_ITEMS.filter((item) => can(item.permission))

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-surface-border bg-white transition-transform lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              ARS
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">ARS Visa</p>
              <p className="text-xs text-slate-500">& Consultants</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {visibleItems.map(({ key, label, icon: Icon, path }) => (
            <NavLink
              key={key}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
