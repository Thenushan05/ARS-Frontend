import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

/**
 * items: [{ label: 'Customers', to: '/customers' }, { label: 'ARS-2026-00001' }]
 * The last item is rendered as plain text (current page).
 */
export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
      <Link to={ROUTES.DASHBOARD} className="flex items-center hover:text-slate-700">
        <Home className="size-3.5" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-slate-300" />
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-slate-700">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-slate-700' : ''}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
