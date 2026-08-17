import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import { cn } from '@/utils/cn'

/**
 * Server-driven data table (§42): the caller owns pagination/sorting/filter
 * state and fetches accordingly — this component never assumes it has the
 * full dataset in memory.
 *
 * columns: [{ key, header, render?: (row) => node, sortable?: bool, className? }]
 * sort: { key, direction: 'asc' | 'desc' } | null
 */
export function DataTable({
  columns,
  data = [],
  rowKey = (row) => row.id,
  isLoading,
  error,
  onRetry,
  sort,
  onSortChange,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription,
}) {
  if (error) {
    return <ErrorState description={error.message} onRetry={onRetry} />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-muted text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => {
                const isSorted = sort?.key === column.key
                return (
                  <th key={column.key} className={cn('px-4 py-3 whitespace-nowrap', column.className)}>
                    {column.sortable ? (
                      <button
                        className="flex items-center gap-1 hover:text-slate-700"
                        onClick={() =>
                          onSortChange?.({
                            key: column.key,
                            direction: isSorted && sort.direction === 'asc' ? 'desc' : 'asc',
                          })
                        }
                      >
                        {column.header}
                        {isSorted ? (
                          sort.direction === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUpDown className="size-3.5 text-slate-300" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <TableSkeleton columns={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-surface-border last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-surface-muted',
                  )}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3 text-slate-700', column.className)}>
                      {column.render ? column.render(row) : (row[column.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
