import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) onOutside()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, onOutside])
}

/**
 * Top header (§3): sidebar toggle (mobile), global search (§39),
 * notifications, and the logged-in user menu.
 */
export function AppHeader({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  useClickOutside(menuRef, () => setMenuOpen(false))

  function handleSearchSubmit(event) {
    event.preventDefault()
    // Global search (§39): customer ID/name, mobile, passport, NIC, case ID,
    // invoice, quotation — resolved server-side once the search API exists.
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-surface-border bg-white px-4">
      <button className="text-slate-500 hover:text-slate-700 lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="size-5" />
      </button>

      <form onSubmit={handleSearchSubmit} className="hidden max-w-md flex-1 lg:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Search customer, case, invoice, passport..."
            className="h-9 w-full rounded-lg border border-surface-border bg-surface-muted pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-status-danger" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-slate-100"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.name?.charAt(0)?.toUpperCase() ?? <UserCircle className="size-5" />}
            </div>
            <div className="hidden text-left leading-tight md:block">
              <p className="text-sm font-medium text-slate-800">{user?.name ?? 'Guest'}</p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[user?.role] ?? '—'}</p>
            </div>
            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-surface-border bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate(ROUTES.SETTINGS)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="size-4" /> Settings
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-status-danger hover:bg-status-danger-bg"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
