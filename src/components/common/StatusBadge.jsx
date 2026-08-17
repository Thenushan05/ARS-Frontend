import { TONE_CLASSES, toneForStatus } from '@/constants/statusColors'
import { cn } from '@/utils/cn'

function toLabel(status) {
  if (!status) return '—'
  return status
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Standard status pill. Pass either a known domain status string (case
 * status, invoice status, ...) to auto-resolve the tone, or an explicit
 * `tone` to override it.
 */
export function StatusBadge({ status, tone, label }) {
  const resolvedTone = tone ?? toneForStatus(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[resolvedTone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? toLabel(status)}
    </span>
  )
}
