import { cn } from '@/utils/cn'

const TONE_ICON_BG = {
  success: 'bg-status-success-bg text-status-success',
  warning: 'bg-status-warning-bg text-status-warning',
  danger: 'bg-status-danger-bg text-status-danger',
  info: 'bg-status-info-bg text-status-info',
  neutral: 'bg-status-neutral-bg text-status-neutral',
}

/**
 * KPI tile used across the dashboard (§8) and report headers.
 * `trend` is optional: { direction: 'up' | 'down', label: '+12% vs last month' }
 */
export function StatCard({ label, value, icon: Icon, tone = 'neutral', trend, isLoading }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface p-4 shadow-sm">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-7 w-32 animate-pulse rounded bg-slate-200" />
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-surface-border bg-surface p-4 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
        {trend && (
          <p className={cn('mt-1 text-xs font-medium', trend.direction === 'down' ? 'text-status-danger' : 'text-status-success')}>
            {trend.direction === 'down' ? '↓' : '↑'} {trend.label}
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', TONE_ICON_BG[tone])}>
          <Icon className="size-5" />
        </div>
      )}
    </div>
  )
}
