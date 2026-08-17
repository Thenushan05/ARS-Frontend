import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) onOutside()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, onOutside])
}

/**
 * Generic server-searched combobox. Entity-specific selectors
 * (CustomerSelector, CaseSelector, ServiceSelector, StaffSelector) are
 * thin wrappers around this with a fixed `queryKey`/`loadOptions`.
 *
 * loadOptions(query: string) => Promise<{ value, label, meta? }[]>
 * Only fires once `query` is non-empty or `loadOnFocus` is set, and is
 * debounced so it never fires on every keystroke.
 */
export function AsyncSelect({ value, onChange, loadOptions, queryKeyPrefix, placeholder = 'Search...', loadOnFocus = true, renderOption }) {
  const [query, setQuery] = useState(value?.label ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const debouncedQuery = useDebounce(query, 300)
  useClickOutside(containerRef, () => setIsOpen(false))

  const { data: options = [], isFetching } = useQuery({
    queryKey: [queryKeyPrefix, 'search', debouncedQuery],
    queryFn: () => loadOptions(debouncedQuery),
    enabled: isOpen && (loadOnFocus || debouncedQuery.length > 0),
  })

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-surface-border bg-white pl-9 pr-8 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setQuery('')
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear selection"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-surface-border bg-white py-1 shadow-lg">
          {isFetching ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" /> Searching...
            </div>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">No results</p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option)
                  setQuery(option.label)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50',
                  value?.value === option.value && 'bg-brand-50',
                )}
              >
                {renderOption ? renderOption(option) : option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
