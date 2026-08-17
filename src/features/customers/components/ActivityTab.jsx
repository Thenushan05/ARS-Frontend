import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { formatDateTime } from '@/utils/formatDate'
import { customersApi } from '../api/customersApi'

// Friendly one-liners for the audit action codes that can show up on a
// customer's own trail (customer.service.js / lead.service.js). Falls back
// to the raw action code for anything not mapped here rather than hiding it.
const ACTION_LABELS = {
  CUSTOMER_CREATE: 'Customer record created',
  CUSTOMER_UPDATE: 'Customer details updated',
  CUSTOMER_ARCHIVE: 'Customer archived',
  CUSTOMER_RESTORE: 'Customer restored',
  LEAD_CONVERT: 'Converted from a lead',
};

function describeChanges(after) {
  if (!after || typeof after !== 'object') return null
  const fields = Object.keys(after)
  if (!fields.length) return null
  return fields.join(', ')
}

/** Customer Profile "Activity" tab — real data reused from the existing
 * append-only audit trail (§39), not a fabricated feed. */
export function ActivityTab({ customerId }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers', customerId, 'activity'],
    queryFn: () => customersApi.getActivity(customerId, { limit: 50 }),
  })

  if (isLoading) return <LoadingSkeleton rows={5} className="h-14" />
  if (isError) return <ErrorState description={error?.message} onRetry={refetch} />
  if (!data?.items?.length) {
    return <EmptyState icon={History} title="No activity recorded yet" description="Changes to this customer will show up here." />
  }

  return (
    <ul className="space-y-2">
      {data.items.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 rounded-lg border border-surface-border p-3 text-sm">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-slate-400">
            <History className="size-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">{ACTION_LABELS[entry.action] ?? entry.action}</p>
            {describeChanges(entry.after) && <p className="mt-0.5 text-xs text-slate-500">Changed: {describeChanges(entry.after)}</p>}
            <p className="mt-1 text-xs text-slate-400">
              {entry.actor?.name ?? entry.userName ?? 'System'} · {formatDateTime(entry.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
