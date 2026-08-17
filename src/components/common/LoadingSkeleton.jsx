import { cn } from '@/utils/cn'

/** Generic skeleton block. Compose for card/table/form skeletons. */
export function LoadingSkeleton({ className, rows }) {
  if (rows) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={cn('h-4 animate-pulse rounded bg-slate-200', className)} />
        ))}
      </div>
    )
  }
  return <div className={cn('animate-pulse rounded bg-slate-200', className)} />
}

export function TableSkeleton({ columns = 4, rows = 6 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 border-b border-surface-border px-4 py-3 last:border-0">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div key={colIndex} className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      ))}
    </div>
  )
}
