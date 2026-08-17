import { cn } from '@/utils/cn'

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-xl border border-surface-border bg-surface shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-surface-border px-5 py-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
