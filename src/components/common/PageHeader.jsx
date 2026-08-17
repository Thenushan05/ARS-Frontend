import { Breadcrumb } from '@/components/layout/Breadcrumb'

/**
 * Standard page-level header used at the top of every feature page:
 * breadcrumb trail, title, optional description, and a right-aligned
 * actions slot (e.g. "New Customer" button).
 */
export function PageHeader({ title, description, breadcrumbItems, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
