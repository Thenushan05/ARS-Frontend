import { FilterBar } from '@/components/tables/FilterBar'
import { SelectInput } from '@/components/forms/SelectInput'
import { StaffSelector } from '@/components/common/StaffSelector'
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS, VISA_CATEGORY_OPTIONS } from '../constants'

/** §52 filtering — Status, Lead Source, Assigned Staff, Country, Visa Type,
 * and a Created Date range, all applied server-side (§53). */
export function LeadFiltersBar({ filters, onChange, onClear, hasActiveFilters }) {
  return (
    <FilterBar onClear={onClear} hasActiveFilters={hasActiveFilters}>
      <SelectInput
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        options={LEAD_STATUS_OPTIONS}
        placeholder="All Statuses"
        className="w-auto min-w-[9rem]"
      />

      <SelectInput
        value={filters.leadSource}
        onChange={(event) => onChange({ leadSource: event.target.value })}
        options={LEAD_SOURCE_OPTIONS}
        placeholder="All Sources"
        className="w-auto min-w-[9rem]"
      />

      <div className="w-52">
        <StaffSelector
          value={filters.assignedStaff}
          onChange={(option) => onChange({ assignedStaff: option })}
          placeholder="Assigned Staff..."
        />
      </div>

      <SelectInput
        value={filters.visaType}
        onChange={(event) => onChange({ visaType: event.target.value })}
        options={VISA_CATEGORY_OPTIONS}
        placeholder="All Visa Types"
        className="w-auto min-w-[9rem]"
      />

      <input
        value={filters.country}
        onChange={(event) => onChange({ country: event.target.value })}
        placeholder="Country..."
        className="h-9 w-36 rounded-lg border border-surface-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <span>Created</span>
        <input
          type="date"
          value={filters.fromDate}
          onChange={(event) => onChange({ fromDate: event.target.value })}
          className="h-9 rounded-lg border border-surface-border px-2 text-sm"
          aria-label="Created from"
        />
        <span>to</span>
        <input
          type="date"
          value={filters.toDate}
          onChange={(event) => onChange({ toDate: event.target.value })}
          className="h-9 rounded-lg border border-surface-border px-2 text-sm"
          aria-label="Created to"
        />
      </div>
    </FilterBar>
  )
}
