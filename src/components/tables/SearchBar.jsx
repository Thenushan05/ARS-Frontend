import { Search, X } from 'lucide-react'

/**
 * Controlled search input. Pair with useDebounce in the parent before
 * firing the actual query, e.g.:
 *   const [term, setTerm] = useState('')
 *   const debounced = useDebounce(term)
 *   useQuery({ queryKey: ['customers', debounced], ... })
 */
export function SearchBar({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-surface-border bg-white pl-9 pr-8 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
