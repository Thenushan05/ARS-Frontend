import { endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import { cn } from '@/utils/cn'

/**
 * Date range control used throughout dashboards/reports (§8, §24, §29, §36):
 * Today / Week / Month / Year presets plus a custom range.
 *
 * value: { preset: 'today'|'week'|'month'|'year'|'custom', from: 'yyyy-MM-dd', to: 'yyyy-MM-dd' }
 */
const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'custom', label: 'Custom' },
]

export function presetToRange(preset, referenceDate) {
  const iso = (date) => format(date, 'yyyy-MM-dd')
  switch (preset) {
    case 'today':
      return { from: iso(referenceDate), to: iso(referenceDate) }
    case 'week':
      return { from: iso(startOfWeek(referenceDate)), to: iso(endOfWeek(referenceDate)) }
    case 'month':
      return { from: iso(startOfMonth(referenceDate)), to: iso(endOfMonth(referenceDate)) }
    case 'year':
      return { from: iso(startOfYear(referenceDate)), to: iso(endOfYear(referenceDate)) }
    default:
      return { from: iso(referenceDate), to: iso(referenceDate) }
  }
}

export function DateRangePicker({ value, onChange, referenceDate = new Date() }) {
  function selectPreset(preset) {
    if (preset === 'custom') {
      onChange({ preset, from: value.from, to: value.to })
      return
    }
    onChange({ preset, ...presetToRange(preset, referenceDate) })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-lg border border-surface-border">
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => selectPreset(key)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              value.preset === key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {value.preset === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={value.from}
            onChange={(event) => onChange({ ...value, from: event.target.value })}
            className="rounded-md border border-surface-border px-2 py-1.5 text-sm"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={value.to}
            onChange={(event) => onChange({ ...value, to: event.target.value })}
            className="rounded-md border border-surface-border px-2 py-1.5 text-sm"
          />
        </div>
      )}
    </div>
  )
}
