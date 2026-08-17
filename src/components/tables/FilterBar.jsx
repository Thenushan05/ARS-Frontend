import { X } from 'lucide-react'
import { Button } from '@/components/common/Button'

/**
 * Horizontal row of filter controls (selects, DateRangePicker, etc.) with
 * a trailing "Clear filters" action. Pass filter controls as children:
 *
 *   <FilterBar onClear={resetFilters} hasActiveFilters={hasFilters}>
 *     <SelectFilter ... /> <SelectFilter ... /> <DateRangePicker ... />
 *   </FilterBar>
 */
export function FilterBar({ children, onClear, hasActiveFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface p-3">
      {children}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="size-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
