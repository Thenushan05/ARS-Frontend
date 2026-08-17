import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Server-side pagination control. `total` is the total record count from
 * the API response — never the length of the currently loaded page.
 */
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [10, 25, 50, 100] }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-3 border-t border-surface-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>
          {start}–{end} of {total}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="ml-2 rounded-md border border-surface-border bg-white px-2 py-1 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'flex size-8 items-center justify-center rounded-md border border-surface-border text-slate-600',
            'disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-slate-50',
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 text-sm text-slate-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'flex size-8 items-center justify-center rounded-md border border-surface-border text-slate-600',
            'disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-slate-50',
          )}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
